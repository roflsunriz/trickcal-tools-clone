export const cloudStateChangedEvent = "trickcal:cloud-state-changed";
export const cloudLocalUpdatedAtKey = "trickcal_cloud_local_updated_at";

export const cloudStorageKeys = [
  "trickcal_sweep_state",
  "trickcal_community_state",
  "trickcal_food_state",
  "trickcal_locale",
  "trickcal_theme",
] as const;

type CloudStorageKey = (typeof cloudStorageKeys)[number];

export type CloudBackup = {
  schemaVersion: 2;
  updatedAt: string;
  values: Record<CloudStorageKey, string | null>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readLocalUpdatedAt() {
  const value = Number(localStorage.getItem(cloudLocalUpdatedAtKey));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function setLocalUpdatedAt(value: number) {
  localStorage.setItem(cloudLocalUpdatedAtKey, String(value));
}

export function markCloudStateChanged(now = Date.now()) {
  setLocalUpdatedAt(now);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(cloudStateChangedEvent));
}

export function createCloudBackup(now = Date.now()): CloudBackup {
  const updatedAt = readLocalUpdatedAt() || now;
  const values = Object.fromEntries(cloudStorageKeys.map((key) => [key, localStorage.getItem(key)])) as Record<
    CloudStorageKey,
    string | null
  >;
  return { schemaVersion: 2, updatedAt: new Date(updatedAt).toISOString(), values };
}

export function validateCloudBackup(value: unknown): CloudBackup {
  if (
    !isRecord(value) ||
    (value.schemaVersion !== 1 && value.schemaVersion !== 2) ||
    typeof value.updatedAt !== "string"
  ) {
    throw new Error("INVALID_BACKUP");
  }
  const updatedAt = Date.parse(value.updatedAt);
  if (!Number.isFinite(updatedAt) || !isRecord(value.values)) throw new Error("INVALID_BACKUP");

  const values = {} as Record<CloudStorageKey, string | null>;
  for (const key of cloudStorageKeys) {
    const entry = value.values[key];
    if (value.schemaVersion === 1 && key === "trickcal_food_state" && entry === undefined) {
      values[key] = null;
      continue;
    }
    if (entry !== null && typeof entry !== "string") throw new Error("INVALID_BACKUP");
    if (typeof entry === "string" && entry.length > 1_000_000) throw new Error("INVALID_BACKUP");
    values[key] = entry;
  }
  return { schemaVersion: 2, updatedAt: new Date(updatedAt).toISOString(), values };
}

export function applyCloudBackup(backup: CloudBackup) {
  const validated = validateCloudBackup(backup);
  for (const key of cloudStorageKeys) {
    const value = validated.values[key];
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
  setLocalUpdatedAt(Date.parse(validated.updatedAt));
}
