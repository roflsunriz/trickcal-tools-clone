import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CloudContext } from "./cloud-context";
import type { CloudContextValue, CloudErrorCode, CloudStatus } from "./cloud-context";
import {
  clearGoogleAuthSession,
  isGoogleClientId,
  readGoogleAuthSession,
  requestGoogleAccessToken,
  revokeGoogleAccessToken,
  writeGoogleAuthSession,
} from "./google-auth";
import type { GoogleAuthSession } from "./google-auth";
import {
  downloadDriveBackup,
  fetchDriveUser,
  findDriveBackup,
  GoogleDriveError,
  uploadDriveBackup,
} from "./google-drive";
import {
  applyCloudBackup,
  cloudStateChangedEvent,
  createCloudBackup,
  readLocalUpdatedAt,
  setLocalUpdatedAt,
  validateCloudBackup,
} from "./storage";

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

function toErrorCode(error: unknown): CloudErrorCode {
  if (error instanceof GoogleDriveError && error.status === 401) return "sessionExpired";
  if (error instanceof Error && error.message === "INVALID_BACKUP") return "invalidBackup";
  return "syncFailed";
}

export function CloudProvider({ children }: { children: ReactNode }) {
  const configured = isGoogleClientId(clientId);
  const [session, setSession] = useState<GoogleAuthSession | null>(() =>
    configured ? readGoogleAuthSession(clientId) : null,
  );
  const [status, setStatus] = useState<CloudStatus>(() =>
    configured ? (session ? "signedIn" : "signedOut") : "unconfigured",
  );
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [error, setError] = useState<CloudErrorCode | null>(null);
  const sessionRef = useRef<GoogleAuthSession | null>(session);
  const syncRef = useRef<Promise<void> | null>(null);
  const syncRequestedRef = useRef(false);

  const synchronize = useCallback((activeSession: GoogleAuthSession): Promise<void> => {
    if (syncRef.current) {
      syncRequestedRef.current = true;
      return syncRef.current;
    }
    syncRequestedRef.current = false;
    const promise = (async () => {
      setStatus("syncing");
      setError(null);
      try {
        const file = await findDriveBackup(activeSession.accessToken);
        const localUpdatedAt = readLocalUpdatedAt();
        if (file) {
          const cloud = validateCloudBackup(await downloadDriveBackup(activeSession.accessToken, file.id));
          const cloudUpdatedAt = Date.parse(cloud.updatedAt);
          if (localUpdatedAt === 0 || cloudUpdatedAt > localUpdatedAt) {
            applyCloudBackup(cloud);
            setLastSyncAt(cloud.updatedAt);
            setStatus("signedIn");
            window.location.reload();
            return;
          }
          if (cloudUpdatedAt === localUpdatedAt) {
            setLastSyncAt(cloud.updatedAt);
            setStatus("signedIn");
            return;
          }
        }

        const now = Date.now();
        if (localUpdatedAt === 0) setLocalUpdatedAt(now);
        const backup = createCloudBackup(now);
        await uploadDriveBackup(activeSession.accessToken, backup, file?.id);
        setLastSyncAt(backup.updatedAt);
        setStatus("signedIn");
      } catch (syncError) {
        const code = toErrorCode(syncError);
        if (code === "sessionExpired") {
          clearGoogleAuthSession();
          sessionRef.current = null;
          setSession(null);
          setStatus("signedOut");
        } else {
          setStatus("signedIn");
        }
        setError(code);
      }
    })().finally(() => {
      syncRef.current = null;
      if (syncRequestedRef.current && sessionRef.current) {
        syncRequestedRef.current = false;
        queueMicrotask(() => window.dispatchEvent(new CustomEvent(cloudStateChangedEvent)));
      }
    });
    syncRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    if (sessionRef.current) void synchronize(sessionRef.current);
  }, [synchronize]);

  useEffect(() => {
    if (!session) return;
    const timeout = window.setTimeout(
      () => {
        clearGoogleAuthSession();
        sessionRef.current = null;
        setSession(null);
        setStatus("signedOut");
        setError("sessionExpired");
      },
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [session]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const handleStateChange = () => {
      const activeSession = sessionRef.current;
      if (!activeSession) return;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => void synchronize(activeSession), 800);
    };
    window.addEventListener(cloudStateChangedEvent, handleStateChange);
    return () => {
      window.removeEventListener(cloudStateChangedEvent, handleStateChange);
      if (timeout) clearTimeout(timeout);
    };
  }, [synchronize]);

  const value = useMemo<CloudContextValue>(
    () => ({
      status,
      session,
      lastSyncAt,
      error,
      signIn: async () => {
        if (!configured || status === "signingIn") return;
        setStatus("signingIn");
        setError(null);
        try {
          const token = await requestGoogleAccessToken(clientId);
          const user = await fetchDriveUser(token.accessToken);
          const nextSession: GoogleAuthSession = {
            schemaVersion: 2,
            clientId,
            accessToken: token.accessToken,
            expiresAt: token.expiresAt,
            user,
          };
          writeGoogleAuthSession(nextSession);
          sessionRef.current = nextSession;
          setSession(nextSession);
          setStatus("signedIn");
          await synchronize(nextSession);
        } catch {
          clearGoogleAuthSession();
          sessionRef.current = null;
          setSession(null);
          setStatus("signedOut");
          setError("loginFailed");
        }
      },
      signOut: async () => {
        const activeSession = sessionRef.current;
        try {
          if (activeSession) await revokeGoogleAccessToken(activeSession.accessToken);
        } finally {
          clearGoogleAuthSession();
          sessionRef.current = null;
          setSession(null);
          setLastSyncAt(null);
          setError(null);
          setStatus("signedOut");
        }
      },
      syncNow: async () => {
        const activeSession = sessionRef.current;
        if (activeSession) await synchronize(activeSession);
      },
    }),
    [configured, error, lastSyncAt, session, status, synchronize],
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}
