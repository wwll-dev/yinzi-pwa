import type { RepoConfig } from "../types";

export class GithubError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GithubError";
    this.status = status;
  }
}

export type RemoteLedger = {
  text: string;
  sha: string | null;
  missing: boolean;
};

export function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function decodeBase64Utf8(value: string): string {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function ghHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token.trim()}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function encodePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function repoUrl(config: RepoConfig): string {
  return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
}

function contentsUrl(config: RepoConfig): string {
  return `${repoUrl(config)}/contents/${encodePath(config.path)}`;
}

async function errorFrom(res: Response, fallback?: string): Promise<GithubError> {
  let detail = "";
  try {
    const body = (await res.json()) as { message?: string };
    if (typeof body.message === "string") detail = body.message.slice(0, 160);
  } catch {
    detail = "";
  }
  const friendly =
    res.status === 401
      ? "Token 無效或已過期"
      : res.status === 403
        ? "Token 權限不足。私人帳本需要 repo scope。"
        : res.status === 404
          ? fallback || "找不到 repo 或檔案"
          : res.status === 409 || res.status === 422
            ? "帳本剛被更新，請再試一次"
            : fallback || "GitHub 回應異常";
  const message = detail && !fallback ? `${friendly}（${detail}）` : friendly;
  return new GithubError(res.status, message);
}

export async function readLedger(config: RepoConfig, token: string): Promise<RemoteLedger> {
  const url = `${contentsUrl(config)}?ref=${encodeURIComponent(config.branch)}`;
  const res = await fetch(url, { headers: ghHeaders(token), cache: "no-store" });
  if (res.status === 404) {
    const repoRes = await fetch(repoUrl(config), {
      headers: ghHeaders(token),
      cache: "no-store",
    });
    if (!repoRes.ok) {
      throw await errorFrom(
        repoRes,
        "找不到 repo。請檢查擁有者、名稱，同 Token 係咪有 repo 權限。",
      );
    }
    return { text: "", sha: null, missing: true };
  }
  if (!res.ok) throw await errorFrom(res);
  const data = (await res.json()) as { content?: string; sha?: string };
  if (!data.content || !data.sha) {
    throw new GithubError(res.status, "路徑唔係一個 CSV 檔。");
  }
  return { text: decodeBase64Utf8(data.content), sha: data.sha, missing: false };
}

export async function writeLedger(
  config: RepoConfig,
  token: string,
  text: string,
  sha: string | null,
  message: string,
): Promise<void> {
  const res = await fetch(contentsUrl(config), {
    method: "PUT",
    headers: {
      ...ghHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: encodeBase64Utf8(text),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw await errorFrom(res, "寫入失敗");
}
