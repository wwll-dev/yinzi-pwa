import { useMemo, useState } from "react";
import { dayGroupLabel } from "../lib/dates";
import { groupByDay } from "../lib/stats";
import type { Txn } from "../types";
import { TxnRow } from "./TxnRow";
import { cx } from "./ui";

const FILTERS = ["全部", "支出", "收入"] as const;
type Filter = (typeof FILTERS)[number];

export function LedgerScreen({ txns, todayYmd }: { txns: Txn[]; todayYmd: string }) {
  const [filter, setFilter] = useState<Filter>("全部");
  const groups = useMemo(() => {
    const filtered = txns.filter((txn) => filter === "全部" || txn.type === filter);
    return groupByDay(filtered);
  }, [txns, filter]);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-page pt-[calc(env(safe-area-inset-top)+12px)]">
        <header className="px-5">
          <h1 className="text-[34px] font-bold leading-none tracking-tight">流水</h1>
        </header>
        <div className="flex gap-2 px-5 py-4">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cx(
              "h-8 rounded-full px-3.5 text-[14px]",
              filter === item ? "bg-accent text-white" : "bg-soft text-muted",
            )}
          >
            {item}
          </button>
        ))}
        </div>
      </div>
      {groups.length === 0 ? (
        <p className="px-5 py-16 text-center text-[15px] text-muted">
          {txns.length === 0 ? "未有流水" : "未有符合嘅紀錄"}
        </p>
      ) : (
        <div className="flex flex-col gap-4 px-5 pb-4">
          {groups.map((group) => (
            <section key={group.ymd}>
              <h2 className="mb-2 text-[13px] text-muted">{dayGroupLabel(group.ymd, todayYmd)}</h2>
              <div className="overflow-hidden rounded-2xl bg-elevated">
                {group.items.map((txn, index) => (
                  <div key={`${txn.index}-${txn.recordedAt}`} className={index > 0 ? "border-t border-line" : ""}>
                    <TxnRow txn={txn} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
