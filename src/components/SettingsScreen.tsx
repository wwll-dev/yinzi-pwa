import { useState, type ReactNode } from "react";
import type { AppConfig } from "../types";
import { PrimaryButton } from "./ui";

export function SettingsScreen({
  config,
  hint,
  onSave,
  onSync,
  onClear,
}: {
  config: AppConfig;
  hint: string;
  onSave: (config: AppConfig, token: string | null) => void;
  onSync: () => void;
  onClear: () => void;
}) {
  const [owner, setOwner] = useState(config.owner);
  const [repo, setRepo] = useState(config.repo);
  const [path, setPath] = useState(config.path);
  const [branch, setBranch] = useState(config.branch);
  const [budget, setBudget] = useState(String(config.budget));
  const [token, setToken] = useState("");

  function save() {
    const nextBudget = Number(budget);
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) return;
    onSave(
      {
        owner: owner.trim(),
        repo: repo.trim(),
        path: path.trim().replace(/^\/+/, ""),
        branch: branch.trim(),
        budget: nextBudget,
      },
      token.trim() ? token.trim() : null,
    );
    setToken("");
  }

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-6">
      <h1 className="text-[34px] font-bold leading-none tracking-tight">設定</h1>

      <Group title="GitHub">
        <Row label="Token">
          <input
            type="password"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder={hint || "貼上 token"}
            aria-label="GitHub Token"
            className="w-full bg-transparent text-right text-ink outline-none placeholder:text-faint"
          />
        </Row>
        <Row label="擁有者">
          <TextInput value={owner} onChange={setOwner} ariaLabel="擁有者" />
        </Row>
        <Row label="Repo">
          <TextInput value={repo} onChange={setRepo} ariaLabel="Repo" />
        </Row>
        <Row label="路徑">
          <TextInput value={path} onChange={setPath} ariaLabel="CSV 路徑" />
        </Row>
        <Row label="分支">
          <TextInput value={branch} onChange={setBranch} ariaLabel="分支" />
        </Row>
      </Group>
      <p className="mt-2 px-1 text-[13px] leading-relaxed text-faint">
        留空 Token 代表唔改。畫面唔會顯示完整 token。私人帳本需要 repo scope。
      </p>

      <Group title="預算">
        <Row label="每月 HKD">
          <input
            inputMode="decimal"
            value={budget}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setBudget(event.target.value.replace(/[^\d.]/g, ""))}
            aria-label="每月預算"
            className="w-full bg-transparent text-right tabular-nums text-ink outline-none"
          />
        </Row>
      </Group>

      <div className="mt-5 flex flex-col gap-3">
        <PrimaryButton type="button" onClick={save}>
          儲存
        </PrimaryButton>
        <button
          type="button"
          onClick={onSync}
          className="h-12 rounded-[14px] bg-elevated text-[16px] text-ink"
        >
          重新同步
        </button>
        <button type="button" onClick={onClear} className="h-12 text-[16px] text-danger">
          清除 Token
        </button>
      </div>

      <Group title="關於">
        <p className="px-4 py-3 text-[14px] leading-relaxed text-muted">
          銀子日記將流水寫入你指定嘅私人 GitHub CSV。資料唔會放到公開嘅 Pages repo。
        </p>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-[13px] text-muted">{title}</h2>
      <div className="overflow-hidden rounded-2xl bg-elevated">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-center gap-3 border-b border-line px-4 last:border-b-0">
      <span className="w-20 shrink-0 text-[15px] text-muted">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

function TextInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      value={value}
      aria-label={ariaLabel}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-transparent text-right text-ink outline-none"
    />
  );
}
