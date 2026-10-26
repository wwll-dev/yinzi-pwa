import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { LedgerScreen } from "./components/LedgerScreen";
import { QuickAddSheet } from "./components/QuickAddSheet";
import { SettingsScreen } from "./components/SettingsScreen";
import { TabBar, type TabId } from "./components/TabBar";
import { UnlockGate } from "./components/UnlockGate";
import { PhoneFrame, SyncBanner, Toast } from "./components/ui";
import { appendCsvRow, buildEntryFields, parseLedger } from "./lib/csv";
import { formatMonth, hkNowParts } from "./lib/dates";
import { buildDemoCsv } from "./lib/demo";
import { GithubError, readLedger, writeLedger } from "./lib/github";
import {
  cacheKeyOf,
  clearSecrets,
  loadCache,
  loadConfig,
  loadToken,
  saveBudget,
  saveCache,
  saveConfig,
  saveToken,
  tokenHint,
} from "./lib/storage";
import { monthStats, recentTxns, todayExpense } from "./lib/stats";
import type { AppConfig, EntryDraft, RepoConfig, SyncStatus, ToastTone, Txn } from "./types";

type Notice = { text: string; tone: ToastTone };

export function App() {
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [hasToken, setHasToken] = useState(() => Boolean(loadToken()));
  const [hint, setHint] = useState(() => tokenHint(loadToken()));
  const [unlocked, setUnlocked] = useState(false);
  const [demo, setDemo] = useState(false);
  const [tab, setTab] = useState<TabId>("home");
  const [sheet, setSheet] = useState(false);
  const [raw, setRaw] = useState("");
  const [txns, setTxns] = useState<Txn[]>([]);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const rawRef = useRef("");
  const demoRef = useRef(false);
  const savingRef = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    rawRef.current = raw;
  }, [raw]);
  useEffect(() => {
    demoRef.current = demo;
  }, [demo]);
  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  const showToast = useCallback((text: string, tone: ToastTone = "ok") => {
    setNotice({ text, tone });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(id);
  }, [notice]);

  const applyText = useCallback((text: string) => {
    setRaw(text);
    setTxns(parseLedger(text));
    rawRef.current = text;
  }, []);

  const refresh = useCallback(
    async (options?: { announce?: boolean; banner?: boolean }) => {
      if (demoRef.current || savingRef.current) return;
      const token = loadToken();
      if (!token) return;
      const currentConfig = configRef.current;
      const key = cacheKeyOf(currentConfig);
      if (options?.banner || !rawRef.current) setStatus("loading");
      try {
        const file = await readLedger(currentConfig, token);
        applyText(file.text);
        saveCache(key, file.text);
        setStatus("idle");
        setError("");
        if (options?.announce) showToast("同步完成");
      } catch (err) {
        if (!rawRef.current) {
          const cached = loadCache(key);
          if (cached) applyText(cached);
        }
        if (err instanceof TypeError) {
          setStatus(rawRef.current ? "offline" : "error");
          setError("連唔到 GitHub");
        } else {
          const message = err instanceof Error ? err.message : "讀取失敗";
          setStatus("error");
          setError(message);
          if (options?.announce) showToast(message, "danger");
        }
      }
    },
    [applyText, showToast],
  );

  const repoKey = `${config.owner}/${config.repo}/${config.path}@${config.branch}`;

  useEffect(() => {
    if (!unlocked || demo) return;
    const cached = loadCache(cacheKeyOf(configRef.current));
    if (cached && !rawRef.current) applyText(cached);
    void refresh();
  }, [unlocked, demo, repoKey, refresh, applyText]);

  useEffect(() => {
    if (!unlocked || demo) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [unlocked, demo, refresh]);

  const clock = hkNowParts();
  const month = useMemo(() => monthStats(txns, clock.monthKey), [txns, clock.monthKey]);
  const today = useMemo(() => todayExpense(txns, clock.ymd), [txns, clock.ymd]);
  const latest = useMemo(() => recentTxns(txns, 10), [txns]);

  function unlockWith(repo: RepoConfig, token: string) {
    const next = { ...repo, budget: config.budget };
    saveConfig(next);
    saveToken(token);
    setConfig(next);
    setHasToken(true);
    setHint(tokenHint(token));
    setDemo(false);
    setError("");
    setUnlocked(true);
  }

  async function addEntry(entry: EntryDraft) {
    const now = hkNowParts();
    const fields = buildEntryFields(entry, now.ymd, now.hm);
    if (demo) {
      applyText(appendCsvRow(raw, fields));
      setSheet(false);
      showToast("示範模式，未寫入 GitHub");
      return;
    }
    const token = loadToken();
    if (!token) {
      showToast("未有 Token", "danger");
      return;
    }
    setSaving(true);
    try {
      const current = await readLedger(config, token);
      const next = appendCsvRow(current.text, fields);
      const amount = Number(entry.amountRaw).toFixed(2);
      const message = current.missing
        ? `建立 ${config.path}`
        : `記帳：${entry.type} ${entry.category} HK$${amount}`;
      await writeLedger(config, token, next, current.sha, message);
      applyText(next);
      saveCache(cacheKeyOf(config), next);
      setStatus("idle");
      setError("");
      setSheet(false);
      showToast("已記一筆");
    } catch (err) {
      if (err instanceof GithubError && (err.status === 409 || err.status === 422)) {
        showToast("帳本剛被更新，請再試一次", "danger");
        void refresh();
      } else if (err instanceof TypeError) {
        showToast("連唔到 GitHub", "danger");
      } else {
        showToast(err instanceof Error ? err.message : "寫入失敗", "danger");
      }
    } finally {
      setSaving(false);
    }
  }

  function updateBudget(budget: number) {
    const next = { ...config, budget };
    saveBudget(budget);
    setConfig(next);
  }

  function saveSettings(next: AppConfig, token: string | null) {
    if (!next.owner || !next.repo || !next.path || !next.branch) {
      showToast("請填好 repo 資料", "danger");
      return;
    }
    saveConfig(next);
    if (token) {
      saveToken(token);
      setHasToken(true);
      setHint(tokenHint(token));
    }
    setConfig(loadConfig());
    showToast("設定已儲存");
    if (!demo) void refresh({ announce: false, banner: true });
  }

  function clearToken() {
    clearSecrets();
    setHasToken(false);
    setHint("");
    setUnlocked(false);
    setDemo(false);
    setRaw("");
    setTxns([]);
    rawRef.current = "";
    setSheet(false);
    setStatus("idle");
    setError("");
  }

  if (!unlocked) {
    return (
      <UnlockGate
        hasToken={hasToken}
        busy={busy}
        error={error}
        onDemo={() => {
          applyText(buildDemoCsv());
          setDemo(true);
          setError("");
          setStatus("idle");
          setUnlocked(true);
          setTab("home");
        }}
        onClear={clearToken}
        onUnlock={() => {
          setBusy(true);
          setError("");
          setDemo(false);
          setUnlocked(true);
          setBusy(false);
        }}
        onSetup={(repo, token) => {
          setBusy(true);
          unlockWith(repo, token);
          setBusy(false);
        }}
      />
    );
  }

  return (
    <PhoneFrame>
      <main className="min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="pt-1">
          <SyncBanner status={status} message={error} demo={demo} />
        </div>
        {tab === "home" ? (
          <HomeScreen
            monthLabel={formatMonth(clock.monthKey)}
            monthExpense={month.expense}
            monthIncome={month.income}
            todayExpense={today.expense}
            todayCount={today.count}
            budget={config.budget}
            slices={month.slices}
            recent={latest}
            loading={status === "loading"}
            onBudget={updateBudget}
            onRefresh={() => {
              if (demo) showToast("示範模式，未連線");
              else void refresh({ announce: true, banner: true });
            }}
            onSeeAll={() => setTab("ledger")}
          />
        ) : null}
        {tab === "ledger" ? <LedgerScreen txns={txns} todayYmd={clock.ymd} /> : null}
        {tab === "settings" ? (
          <SettingsScreen
            config={config}
            hint={hint}
            onSave={saveSettings}
            onSync={() => {
              if (demo) showToast("示範模式，未連線");
              else void refresh({ announce: true, banner: true });
            }}
            onClear={clearToken}
          />
        ) : null}
      </main>
      <TabBar tab={tab} onTab={setTab} onAdd={() => setSheet(true)} />
      {sheet ? (
        <QuickAddSheet saving={saving} onClose={() => setSheet(false)} onSubmit={(entry) => void addEntry(entry)} />
      ) : null}
      {notice ? <Toast text={notice.text} tone={notice.tone} /> : null}
    </PhoneFrame>
  );
}
