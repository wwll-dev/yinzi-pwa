import { DEFAULT_BUDGET, DEFAULT_REPO } from "../data/meta";
import type { AppConfig } from "../types";

const TOKEN_KEY = "yinzi_gh_token";
const OWNER_KEY = "yinzi_owner";
const REPO_KEY = "yinzi_repo";
const PATH_KEY = "yinzi_path";
const BRANCH_KEY = "yinzi_branch";
const BUDGET_KEY = "yinzi_budget";
const CACHE_KEY = "yinzi_csv_cache";

type CacheRecord = {
  key: string;
  text: string;
};

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or full storage */
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function cacheKeyOf(config: Pick<AppConfig, "owner" | "repo" | "path" | "branch">): string {
  return `${config.owner}/${config.repo}/${config.path}@${config.branch}`;
}

export function loadToken(): string {
  return (read(TOKEN_KEY) ?? "").trim();
}

export function saveToken(token: string): void {
  write(TOKEN_KEY, token.trim());
}

export function loadConfig(): AppConfig {
  const budgetRaw = read(BUDGET_KEY);
  const budget = budgetRaw ? Number(budgetRaw) : DEFAULT_BUDGET;
  return {
    owner: (read(OWNER_KEY) ?? DEFAULT_REPO.owner).trim() || DEFAULT_REPO.owner,
    repo: (read(REPO_KEY) ?? DEFAULT_REPO.repo).trim() || DEFAULT_REPO.repo,
    path: (read(PATH_KEY) ?? DEFAULT_REPO.path).trim() || DEFAULT_REPO.path,
    branch: (read(BRANCH_KEY) ?? DEFAULT_REPO.branch).trim() || DEFAULT_REPO.branch,
    budget: Number.isFinite(budget) && budget > 0 ? budget : DEFAULT_BUDGET,
  };
}

export function saveConfig(config: AppConfig): void {
  write(OWNER_KEY, config.owner.trim());
  write(REPO_KEY, config.repo.trim());
  write(PATH_KEY, config.path.trim().replace(/^\/+/, ""));
  write(BRANCH_KEY, config.branch.trim());
  write(BUDGET_KEY, String(config.budget));
}

export function saveBudget(budget: number): void {
  write(BUDGET_KEY, String(budget));
}

export function clearSecrets(): void {
  remove(TOKEN_KEY);
  remove(CACHE_KEY);
}

export function tokenHint(token: string): string {
  if (token.length < 8) return token ? "已儲存" : "";
  return `已儲存 · 尾碼 ${token.slice(-4)}`;
}

export function loadCache(key: string): string | null {
  const raw = read(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CacheRecord;
    if (parsed.key !== key || typeof parsed.text !== "string") return null;
    return parsed.text;
  } catch {
    return null;
  }
}

export function saveCache(key: string, text: string): void {
  write(CACHE_KEY, JSON.stringify({ key, text } satisfies CacheRecord));
}
