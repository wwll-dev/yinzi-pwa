export type Txn = {
  index: number;
  dateLabel: string;
  ymd: string;
  type: string;
  amount: number;
  category: string;
  note: string;
  account: string;
  recordedAt: string;
  hm: string;
};

export type RepoConfig = {
  owner: string;
  repo: string;
  path: string;
  branch: string;
};

export type AppConfig = RepoConfig & {
  budget: number;
};

export type EntryDraft = {
  type: "支出" | "收入";
  amountRaw: string;
  category: string;
  note: string;
  account: string;
  ymd: string;
};

export type SyncStatus = "idle" | "loading" | "offline" | "error";

export type ToastTone = "ok" | "danger";
