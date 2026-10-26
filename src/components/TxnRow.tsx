import { CategoryIcon } from "./icons";
import { formatHkd } from "../lib/money";
import type { Txn } from "../types";

export function TxnRow({ txn }: { txn: Txn }) {
  const income = txn.type === "收入";
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-ink">
        <CategoryIcon name={txn.category} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[16px]">{txn.category || "未分類"}</span>
          {txn.hm ? <span className="shrink-0 text-[12px] text-faint">{txn.hm}</span> : null}
        </span>
        {txn.note || txn.account ? (
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
            {txn.note ? <span className="truncate">{txn.note}</span> : null}
            {txn.account ? (
              <span className="shrink-0 rounded-full bg-page px-1.5 py-0.5 text-[11px] text-faint">
                {txn.account}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
      <span className={`shrink-0 text-right text-[16px] font-medium tabular-nums ${income ? "text-income" : "text-ink"}`}>
        {formatHkd(txn.amount)}
      </span>
    </div>
  );
}
