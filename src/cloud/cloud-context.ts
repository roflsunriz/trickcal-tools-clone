import { createContext, useContext } from "react";
import type { GoogleAuthSession } from "./google-auth";

export type CloudErrorCode = "loginFailed" | "syncFailed" | "sessionExpired" | "invalidBackup";
export type CloudStatus = "unconfigured" | "signedOut" | "signingIn" | "signedIn" | "syncing";

export type CloudContextValue = {
  status: CloudStatus;
  session: GoogleAuthSession | null;
  lastSyncAt: string | null;
  error: CloudErrorCode | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

export const CloudContext = createContext<CloudContextValue | null>(null);

export function useCloud() {
  const value = useContext(CloudContext);
  if (!value) throw new Error("useCloud must be used inside CloudProvider");
  return value;
}
