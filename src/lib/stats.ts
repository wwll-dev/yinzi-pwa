import type { Txn } from "../types";

export function compareTxnDesc(a: Txn, b: Txn): number {
  const ka = a.recordedAt || a.ymd;
  const kb = b.recordedAt || b.ymd;
  if (ka !== kb) return ka < kb ? 1 : -1;
  return b.index - a.index;
}

export function recentTxns(txns: Txn[], count = 10): Txn[] {
  return [...txns].sort(compareTxnDesc).slice(0, count);
}

export function groupByDay(txns: Txn[]): { ymd: string; items: Txn[] }[] {
  const sorted = [...txns].sort(compareTxnDesc);
  const groups: { ymd: string; items: Txn[] }[] = [];
  for (const txn of sorted) {
    const ymd = txn.ymd || "未知日期";
    const last = groups[groups.length - 1];
    if (last && last.ymd === ymd) last.items.push(txn);
    else groups.push({ ymd, items: [txn] });
  }
  return groups;
}

export type CategorySlice = {
  name: string;
  value: number;
};

export function monthStats(txns: Txn[], monthKey: string) {
  const inMonth = txns.filter((txn) => txn.ymd.startsWith(monthKey));
  const expenses = inMonth.filter((txn) => txn.type === "支出");
  const income = inMonth
    .filter((txn) => txn.type === "收入")
    .reduce((sum, txn) => sum + txn.amount, 0);
  const expense = expenses.reduce((sum, txn) => sum + txn.amount, 0);
  const byCategory = new Map<string, number>();
  for (const txn of expenses) {
    const name = txn.category || "其他";
    byCategory.set(name, (byCategory.get(name) ?? 0) + txn.amount);
  }
  const slices: CategorySlice[] = [...byCategory.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  return { expense, income, count: inMonth.length, slices };
}

export function todayExpense(txns: Txn[], ymd: string): { expense: number; count: number } {
  const today = txns.filter((txn) => txn.ymd === ymd);
  const expense = today
    .filter((txn) => txn.type === "支出")
    .reduce((sum, txn) => sum + txn.amount, 0);
  return { expense, count: today.length };
}
