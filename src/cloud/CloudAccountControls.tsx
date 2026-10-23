import { Cloud, CloudOff, LoaderCircle, LogOut } from "lucide-react";
import { useCloud } from "./cloud-context";
import { useI18n } from "../i18n";

export function CloudAccountControls() {
  const { error, lastSyncAt, session, signIn, signOut, status, syncNow } = useCloud();
  const { t } = useI18n();
  const busy = status === "signingIn" || status === "syncing";
  const signedIn = Boolean(session);
  const title = error
    ? t(`cloud.error.${error}`)
    : signedIn
      ? lastSyncAt
        ? t("cloud.syncedAt", { time: new Date(lastSyncAt).toLocaleTimeString() })
        : t("cloud.sync")
      : status === "unconfigured"
        ? t("cloud.unconfigured")
        : t("cloud.login");

  return (
    <div className="cloud-account" role="status" aria-live="polite">
      <button
        className={`cloud-account-button${signedIn ? " signed-in" : ""}${status === "unconfigured" ? " unconfigured" : ""}`}
        type="button"
        disabled={status === "unconfigured" || busy}
        onClick={() => void (signedIn ? syncNow() : signIn())}
        title={title}
      >
        {busy ? <LoaderCircle className="spin" size={18} /> : signedIn ? <Cloud size={18} /> : <CloudOff size={18} />}
        <span>{busy ? t("cloud.syncing") : session?.user.name || t("cloud.login")}</span>
      </button>
      {signedIn ? (
        <button
          className="icon-button cloud-signout"
          type="button"
          onClick={() => void signOut()}
          title={t("cloud.logout")}
        >
          <LogOut size={18} />
        </button>
      ) : null}
      {error ? <span className="cloud-error">{t(`cloud.error.${error}`)}</span> : null}
    </div>
  );
}
