import type { GoogleDriveUser } from "./google-drive";

export const googleAuthStorageKey = "trickcal_google_auth";
const consentStorageKey = "trickcal_google_consent_granted";

export type GoogleAuthSession = {
  schemaVersion: 1;
  accessToken: string;
  expiresAt: number;
  user: GoogleDriveUser;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

type GoogleOAuth = {
  initTokenClient: (options: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback: (error: { type?: string }) => void;
  }) => GoogleTokenClient;
  revoke: (token: string, callback: () => void) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth } };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isGoogleClientId(value: string) {
  return /^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(value);
}

export function readGoogleAuthSession(now = Date.now()): GoogleAuthSession | null {
  try {
    const value = localStorage.getItem(googleAuthStorageKey);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== 1 ||
      typeof parsed.accessToken !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !isRecord(parsed.user) ||
      typeof parsed.user.name !== "string" ||
      typeof parsed.user.email !== "string" ||
      (parsed.user.photoUrl !== null && typeof parsed.user.photoUrl !== "string") ||
      parsed.expiresAt <= now + 60_000
    ) {
      localStorage.removeItem(googleAuthStorageKey);
      return null;
    }
    return parsed as GoogleAuthSession;
  } catch {
    localStorage.removeItem(googleAuthStorageKey);
    return null;
  }
}

export function writeGoogleAuthSession(session: GoogleAuthSession) {
  localStorage.setItem(googleAuthStorageKey, JSON.stringify(session));
  localStorage.setItem(consentStorageKey, "true");
}

export function clearGoogleAuthSession() {
  localStorage.removeItem(googleAuthStorageKey);
}

function loadGoogleIdentityScript(timeoutMs = 10_000) {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const script =
      document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]') ??
      document.createElement("script");
    const timeout = window.setTimeout(() => {
      googleScriptPromise = null;
      reject(new Error("GOOGLE_LIBRARY_UNAVAILABLE"));
    }, timeoutMs);
    const complete = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    const fail = () => {
      window.clearTimeout(timeout);
      googleScriptPromise = null;
      reject(new Error("GOOGLE_LIBRARY_UNAVAILABLE"));
    };
    script.addEventListener("load", complete, { once: true });
    script.addEventListener("error", fail, { once: true });
    if (!script.src) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });
  return googleScriptPromise;
}

async function waitForGoogleIdentity(): Promise<GoogleOAuth> {
  await loadGoogleIdentityScript();
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) throw new Error("GOOGLE_LIBRARY_UNAVAILABLE");
  return oauth;
}

export async function requestGoogleAccessToken(clientId: string) {
  const oauth = await waitForGoogleIdentity();
  return new Promise<{ accessToken: string; expiresAt: number }>((resolve, reject) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      settled = true;
      reject(new Error("GOOGLE_LOGIN_TIMEOUT"));
    }, 120_000);
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      reject(new Error(message));
    };
    const client = oauth.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.appdata",
      callback: (response) => {
        if (settled) return;
        if (response.error || !response.access_token) {
          fail(response.error_description || response.error || "GOOGLE_LOGIN_FAILED");
          return;
        }
        settled = true;
        window.clearTimeout(timeout);
        resolve({
          accessToken: response.access_token,
          expiresAt: Date.now() + Math.max(60, response.expires_in ?? 3600) * 1000,
        });
      },
      error_callback: (error) => fail(error.type || "GOOGLE_LOGIN_FAILED"),
    });
    client.requestAccessToken({ prompt: localStorage.getItem(consentStorageKey) === "true" ? "" : "consent" });
  });
}

export async function revokeGoogleAccessToken(accessToken: string) {
  try {
    const oauth = await waitForGoogleIdentity();
    await new Promise<void>((resolve) => oauth.revoke(accessToken, resolve));
  } finally {
    clearGoogleAuthSession();
    localStorage.removeItem(consentStorageKey);
  }
}
