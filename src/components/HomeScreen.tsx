import { useState } from "react";
import { categoryColor } from "../data/meta";
import { formatHkd, formatHkdBody } from "../lib/money";
import type { CategorySlice } from "../lib/stats";
import type { Txn } from "../types";
import { IconRefresh } from "./icons";
import { TxnRow } from "./TxnRow";
import { Donut } from "./Donut";

export function HomeScreen({
  monthLabel,
  monthExpense,
  monthIncome,
  todayExpense: todaySpend,
  todayCount,
  budget,
  slices,
  recent,
  loading,
  onBudget,
  onRefresh,
  onSeeAll,
}: {
  monthLabel: string;
  monthExpense: number;
  monthIncome: number;
  todayExpense: number;
  todayCount: number;
  budget: number;
  slices: CategorySlice[];
  recent: Txn[];
  loading: boolean;
  onBudget: (value: number) => void;
  onRefresh: () => void;
  onSeeAll: () => void;
}) {
  const ratio = budget > 0 ? monthExpense / budget : 0;
  const over = ratio > 1;
  const width = Math.min(100, ratio * 100);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div>
      <header className="flex items-start justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)]">
        <div>
          <h1 className="text-[34px] font-bold leading-none tracking-tight">銀子日記</h1>
          <p className="mt-1.5 text-[15px] text-muted">{monthLabel}</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="重新同步"
          className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-elevated"
        >
          <IconRefresh className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <section className="px-5 pt-6">
        <p className="text-[13px] text-muted">本月支出</p>
        <p className="mt-1 tabular-nums tracking-tight">
          <span className="mr-1 align-top text-[20px] font-medium text-muted">HK$</span>
          <span className="text-[44px] font-semibold leading-none">{formatHkdBody(monthExpense)}</span>
        </p>
        <p className="mt-2 text-[14px] text-muted">
          今日 {formatHkd(todaySpend)} · {todayCount} 筆
        </p>
        {monthIncome > 0 ? (
          <p className="mt-1 text-[14px] text-income">本月收入 {formatHkd(monthIncome)}</p>
        ) : null}
      </section>

      <section className="mx-5 mt-5 rounded-2xl bg-elevated p-4">
        <BudgetEditor budget={budget} spent={monthExpense} over={over} width={width} onBudget={onBudget} />
      </section>

      <section className="mx-5 mt-3 rounded-2xl bg-elevated p-4">
        <h2 className="text-[13px] text-muted">類別</h2>
        {slices.length === 0 ? (
          <p className="py-6 text-center text-[15px] text-muted">本月未有支出</p>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <Donut slices={slices} />
            <ul className="min-w-0 flex-1 space-y-2">
              {slices.map((slice) => {
                const pct = total ? Math.round((slice.value / total) * 100) : 0;
                return (
                  <li key={slice.name} className="flex items-center gap-2 text-[14px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: categoryColor(slice.name) }}
                    />
                    <span className="min-w-0 flex-1 truncate">{slice.name}</span>
                    <span className="w-9 shrink-0 text-right text-[12px] tabular-nums text-faint">{pct}%</span>
                    <span className="w-[5.6rem] shrink-0 text-right tabular-nums text-muted">
                      {formatHkd(slice.value)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-1 flex items-center justify-between px-5">
          <h2 className="text-[13px] text-muted">最近紀錄</h2>
          {recent.length > 0 ? (
            <button type="button" onClick={onSeeAll} className="text-[13px] text-accent">
              全部
            </button>
          ) : null}
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-[15px] text-muted">未有紀錄</p>
        ) : (
          <div className="mx-5 overflow-hidden rounded-2xl bg-elevated">
            {recent.map((txn, index) => (
              <div key={`${txn.index}-${txn.recordedAt}`} className={index > 0 ? "border-t border-line" : ""}>
                <TxnRow txn={txn} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BudgetEditor({
  budget,
  spent,
  over,
  width,
  onBudget,
}: {
  budget: number;
  spent: number;
  over: boolean;
  width: number;
  onBudget: (value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget));

  function commit() {
    const value = Number(draft);
    if (Number.isFinite(value) && value > 0) onBudget(value);
    else setDraft(String(budget));
    setEditing(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] text-muted">預算</h2>
        {editing ? (
          <button type="button" onClick={commit} className="text-[14px] text-accent">
            完成
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(budget));
              setEditing(true);
            }}
            className="text-[14px] text-accent"
          >
            編輯
          </button>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        {editing ? (
          <label className="flex items-center gap-1 text-[20px] font-semibold tabular-nums">
            <span className="text-muted">HK$</span>
            <input
              inputMode="decimal"
              value={draft}
              autoFocus
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => setDraft(event.target.value.replace(/[^\d.]/g, ""))}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter") commit();
              }}
              className="w-32 bg-transparent outline-none"
              aria-label="每月預算"
            />
          </label>
        ) : (
          <p className="text-[20px] font-semibold tabular-nums">{formatHkd(budget)}</p>
        )}
        <p className={`text-[13px] tabular-nums ${over ? "text-danger" : "text-faint"}`}>
          {over ? `超出 ${formatHkd(spent - budget)}` : `${Math.round(width)}%`}
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={budget}
        aria-valuenow={Math.min(spent, budget)}
        aria-label="本月預算"
      >
        <div
          className={`h-full rounded-full ${over ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] text-faint tabular-nums">
        已用 {formatHkd(spent)}
      </p>
    </div>
  );
}
