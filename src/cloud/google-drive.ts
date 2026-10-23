import type { CloudBackup } from "./storage";

const driveApiBase = "https://www.googleapis.com/drive/v3";
const driveUploadBase = "https://www.googleapis.com/upload/drive/v3";
const backupFileName = "trickcal-tools-clone.json";

export class GoogleDriveError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type GoogleDriveUser = {
  name: string;
  email: string;
  photoUrl: string | null;
};

export type GoogleDriveFile = {
  id: string;
  modifiedTime: string;
};

async function googleFetch(url: string, token: string, init: RequestInit = {}, fetcher: typeof fetch = fetch) {
  const response = await fetcher(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    let message = `Google Drive API: HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: { message?: string } };
      if (payload.error?.message) message = payload.error.message;
    } catch {
      // The HTTP status remains an actionable fallback when the response is not JSON.
    }
    throw new GoogleDriveError(message, response.status);
  }
  return response;
}

export async function fetchDriveUser(token: string, fetcher: typeof fetch = fetch): Promise<GoogleDriveUser> {
  const fields = encodeURIComponent("user(displayName,emailAddress,photoLink)");
  const response = await googleFetch(`${driveApiBase}/about?fields=${fields}`, token, {}, fetcher);
  const payload = (await response.json()) as {
    user?: { displayName?: string; emailAddress?: string; photoLink?: string };
  };
  if (!payload.user?.emailAddress) throw new GoogleDriveError("Googleアカウント情報を取得できません。", 502);
  return {
    name: payload.user.displayName || payload.user.emailAddress,
    email: payload.user.emailAddress,
    photoUrl: payload.user.photoLink ?? null,
  };
}

export async function findDriveBackup(token: string, fetcher: typeof fetch = fetch): Promise<GoogleDriveFile | null> {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    fields: "files(id,modifiedTime)",
    q: `name='${backupFileName}'`,
    pageSize: "10",
  });
  const response = await googleFetch(`${driveApiBase}/files?${params}`, token, {}, fetcher);
  const payload = (await response.json()) as { files?: GoogleDriveFile[] };
  const files = (payload.files ?? []).filter(
    (file) => typeof file.id === "string" && typeof file.modifiedTime === "string",
  );
  files.sort((a, b) => Date.parse(b.modifiedTime) - Date.parse(a.modifiedTime));
  return files[0] ?? null;
}

export async function downloadDriveBackup(
  token: string,
  fileId: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const response = await googleFetch(
    `${driveApiBase}/files/${encodeURIComponent(fileId)}?alt=media`,
    token,
    {},
    fetcher,
  );
  return response.json();
}

function multipartBody(backup: CloudBackup, updating: boolean) {
  const boundary = `trickcal_tools_${crypto.randomUUID().replaceAll("-", "")}`;
  const metadata = updating
    ? { name: backupFileName, mimeType: "application/json" }
    : { name: backupFileName, mimeType: "application/json", parents: ["appDataFolder"] };
  const body = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(backup)}\r\n`,
    `--${boundary}--`,
  ].join("");
  return { boundary, body };
}

export async function uploadDriveBackup(
  token: string,
  backup: CloudBackup,
  fileId?: string,
  fetcher: typeof fetch = fetch,
) {
  const { boundary, body } = multipartBody(backup, Boolean(fileId));
  const path = fileId ? `/files/${encodeURIComponent(fileId)}` : "/files";
  const response = await googleFetch(
    `${driveUploadBase}${path}?uploadType=multipart&fields=id,modifiedTime`,
    token,
    {
      method: fileId ? "PATCH" : "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
    fetcher,
  );
  return (await response.json()) as GoogleDriveFile;
}
