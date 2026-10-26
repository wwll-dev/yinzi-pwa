import { useState, type ReactNode } from "react";
import { DEFAULT_REPO } from "../data/meta";
import type { RepoConfig } from "../types";
import { PhoneFrame, PrimaryButton } from "./ui";

export function UnlockGate({
  hasToken,
  busy,
  error,
  onSetup,
  onUnlock,
  onDemo,
  onClear,
}: {
  hasToken: boolean;
  busy: boolean;
  error: string;
  onSetup: (config: RepoConfig, token: string) => void;
  onUnlock: () => void;
  onDemo: () => void;
  onClear: () => void;
}) {
  const [token, setToken] = useState("");
  const [owner, setOwner] = useState(DEFAULT_REPO.owner);
  const [repo, setRepo] = useState(DEFAULT_REPO.repo);
  const [path, setPath] = useState(DEFAULT_REPO.path);
  const [branch, setBranch] = useState(DEFAULT_REPO.branch);

  function submitSetup() {
    const nextToken = token.trim();
    if (!nextToken) return;
    onSetup(
      {
        owner: owner.trim() || DEFAULT_REPO.owner,
        repo: repo.trim() || DEFAULT_REPO.repo,
        path: path.trim().replace(/^\/+/, "") || DEFAULT_REPO.path,
        branch: branch.trim() || DEFAULT_REPO.branch,
      },
      nextToken,
    );
  }

  return (
    <PhoneFrame>
      <main className="flex flex-1 flex-col overflow-y-auto px-5 pt-[calc(env(safe-area-inset-top)+28px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <p className="text-[13px] text-accent">私人帳本</p>
        <h1 className="mt-1 text-[34px] font-bold leading-none tracking-tight">銀子日記</h1>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
          {hasToken
            ? "Token 已留喺呢部機。解鎖之後先會讀取流水。"
            : "貼上 GitHub Token 先讀寫私人流水。Token 只存 localStorage，唔會上傳去 Pages。"}
        </p>

        {hasToken ? (
          <div className="mt-10 flex flex-col gap-3">
            <PrimaryButton type="button" onClick={onUnlock} disabled={busy}>
              {busy ? "連線中…" : "解鎖"}
            </PrimaryButton>
            <button type="button" onClick={onClear} className="h-11 text-[15px] text-danger">
              清除 Token
            </button>
          </div>
        ) : (
          <form
            className="mt-8 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitSetup();
            }}
          >
            <Field label="GitHub Token">
              <input
                type="password"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="ghp_ 或 github_pat_"
                className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
              />
            </Field>
            <Field label="擁有者">
              <input
                value={owner}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setOwner(event.target.value)}
                className="w-full bg-transparent text-right text-ink outline-none"
              />
            </Field>
            <Field label="Repo">
              <input
                value={repo}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setRepo(event.target.value)}
                className="w-full bg-transparent text-right text-ink outline-none"
              />
            </Field>
            <Field label="路徑">
              <input
                value={path}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setPath(event.target.value)}
                className="w-full bg-transparent text-right text-ink outline-none"
              />
            </Field>
            <Field label="分支">
              <input
                value={branch}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => setBranch(event.target.value)}
                className="w-full bg-transparent text-right text-ink outline-none"
              />
            </Field>
            <p className="px-1 text-[13px] leading-relaxed text-faint">
              私人 yinzi-ledger 需要 classic token 嘅 repo scope，或者 fine-grained token 對呢個 repo 有 Contents 讀寫。
            </p>
            <PrimaryButton type="submit" disabled={busy || !token.trim()} className="mt-2">
              {busy ? "連線中…" : "儲存並解鎖"}
            </PrimaryButton>
          </form>
        )}

        {error ? <p className="mt-4 text-[14px] leading-snug text-danger">{error}</p> : null}

        <button type="button" onClick={onDemo} className="mt-auto pt-8 text-[14px] text-faint">
          先睇示範
        </button>
      </main>
    </PhoneFrame>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-elevated px-4">
      <span className="w-[5.5rem] shrink-0 text-[14px] text-muted">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
