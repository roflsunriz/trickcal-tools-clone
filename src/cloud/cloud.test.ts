import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearGoogleAuthSession,
  googleAuthStorageKey,
  isGoogleClientId,
  readGoogleAuthSession,
  writeGoogleAuthSession,
} from "./google-auth";
import { fetchDriveUser, findDriveBackup, GoogleDriveError, uploadDriveBackup } from "./google-drive";
import {
  applyCloudBackup,
  cloudLocalUpdatedAtKey,
  cloudStorageKeys,
  createCloudBackup,
  markCloudStateChanged,
  validateCloudBackup,
} from "./storage";
import type { CloudBackup } from "./storage";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("cloud backup validation", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("captures only supported settings and applies a validated backup", () => {
    localStorage.setItem("trickcal_sweep_state", '{"schemaVersion":3}');
    localStorage.setItem("trickcal_food_state", '{"schemaVersion":1,"characterSearch":"レーテー"}');
    localStorage.setItem("not_synced", "secret");
    markCloudStateChanged(1_700_000_000_000);
    const backup = createCloudBackup();

    expect(backup.updatedAt).toBe("2023-11-14T22:13:20.000Z");
    expect(Object.keys(backup.values)).toEqual(cloudStorageKeys);
    expect("not_synced" in backup.values).toBe(false);

    localStorage.clear();
    applyCloudBackup(backup);
    expect(localStorage.getItem("trickcal_sweep_state")).toBe('{"schemaVersion":3}');
    expect(localStorage.getItem("trickcal_food_state")).toBe('{"schemaVersion":1,"characterSearch":"レーテー"}');
    expect(localStorage.getItem(cloudLocalUpdatedAtKey)).toBe("1700000000000");
  });

  it("migrates a version 1 backup without food state", () => {
    const legacyKeys = cloudStorageKeys.filter((key) => key !== "trickcal_food_state");
    const migrated = validateCloudBackup({
      schemaVersion: 1,
      updatedAt: "2026-10-23T00:00:00.000Z",
      values: Object.fromEntries(legacyKeys.map((key) => [key, null])),
    });

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.values.trickcal_food_state).toBeNull();
  });

  it("rejects incomplete, oversized, and invalid backups", () => {
    expect(() => validateCloudBackup({ schemaVersion: 1, updatedAt: "bad", values: {} })).toThrow("INVALID_BACKUP");
    expect(() => validateCloudBackup({ schemaVersion: 1, updatedAt: new Date().toISOString(), values: {} })).toThrow(
      "INVALID_BACKUP",
    );
    expect(() => validateCloudBackup({ schemaVersion: 2, updatedAt: new Date().toISOString(), values: {} })).toThrow(
      "INVALID_BACKUP",
    );
    expect(() =>
      validateCloudBackup({
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
        values: Object.fromEntries(cloudStorageKeys.map((key) => [key, "x".repeat(1_000_001)])),
      }),
    ).toThrow("INVALID_BACKUP");
  });
});

describe("Google authorization persistence", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it("restores a valid token and removes expired or corrupt tokens", () => {
    const session = {
      schemaVersion: 2 as const,
      clientId: "123-example.apps.googleusercontent.com",
      accessToken: "token",
      expiresAt: 1_800_000,
      user: { name: "User", email: "user@example.com", photoUrl: null },
    };
    writeGoogleAuthSession(session);
    expect(readGoogleAuthSession(session.clientId, 1_000_000)).toEqual(session);
    expect(readGoogleAuthSession("456-other.apps.googleusercontent.com", 1_000_000)).toBeNull();
    expect(localStorage.getItem(googleAuthStorageKey)).toBeNull();

    writeGoogleAuthSession(session);
    expect(readGoogleAuthSession(session.clientId, 1_750_000)).toBeNull();
    localStorage.setItem(googleAuthStorageKey, "not-json");
    expect(readGoogleAuthSession(session.clientId)).toBeNull();
    clearGoogleAuthSession();
  });

  it("accepts only Web OAuth client IDs", () => {
    expect(isGoogleClientId("123-example.apps.googleusercontent.com")).toBe(true);
    expect(isGoogleClientId("placeholder")).toBe(false);
  });
});

describe("Google Drive appDataFolder requests", () => {
  it("reads account and newest backup metadata", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ user: { displayName: "User", emailAddress: "user@example.com", photoLink: "photo" } }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            files: [
              { id: "old", modifiedTime: "2026-01-01T00:00:00Z" },
              { id: "new", modifiedTime: "2026-02-01T00:00:00Z" },
            ],
          }),
          { status: 200 },
        ),
      );

    await expect(fetchDriveUser("token", fetcher)).resolves.toEqual({
      name: "User",
      email: "user@example.com",
      photoUrl: "photo",
    });
    await expect(findDriveBackup("token", fetcher)).resolves.toEqual({
      id: "new",
      modifiedTime: "2026-02-01T00:00:00Z",
    });
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ Authorization: "Bearer token" });
  });

  it("creates an appDataFolder file and reports authorization failures", async () => {
    const backup: CloudBackup = {
      schemaVersion: 2,
      updatedAt: "2026-10-23T00:00:00.000Z",
      values: Object.fromEntries(cloudStorageKeys.map((key) => [key, null])) as CloudBackup["values"],
    };
    const createFetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ id: "file", modifiedTime: backup.updatedAt }), { status: 200 }));
    await uploadDriveBackup("token", backup, undefined, createFetcher);
    expect(createFetcher.mock.calls[0][1]?.method).toBe("POST");
    expect(String(createFetcher.mock.calls[0][1]?.body)).toContain('"parents":["appDataFolder"]');

    const unauthorized = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ error: { message: "expired" } }), { status: 401 }));
    await expect(findDriveBackup("token", unauthorized)).rejects.toEqual(
      expect.objectContaining<Partial<GoogleDriveError>>({ status: 401, message: "expired" }),
    );
  });
});
