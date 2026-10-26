import { describe, expect, it } from "vitest";
import { addDays, dayGroupLabel, formatLedgerDate, hkNowParts } from "./dates";
import { monthStats, recentTxns } from "./stats";
import { parseLedger } from "./csv";

describe("Hong Kong dates", () => {
  it("uses the weekday style of the ledger", () => {
    expect(formatLedgerDate("2026-10-26")).toBe("2026-10-26（週一）");
    expect(formatLedgerDate("2026-10-24")).toBe("2026-10-24（週六）");
    expect(formatLedgerDate("2026-10-25")).toBe("2026-10-25（週日）");
  });

  it("steps across month boundaries in Hong Kong", () => {
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
    expect(dayGroupLabel("2026-10-26", "2026-10-26")).toBe("今日");
    expect(dayGroupLabel("2026-10-25", "2026-10-26")).toBe("昨日");
  });

  it("reads the clock in Asia/Hong_Kong", () => {
    const parts = hkNowParts(new Date("2026-10-26T00:30:00.000Z"));
    expect(parts.ymd).toBe("2026-10-26");
    expect(parts.hm).toBe("08:30");
  });
});

describe("month stats", () => {
  it("sums expenses and keeps the latest ten", () => {
    const raw = [
      "日期,類型,金額,類別,備註,帳戶,記錄時間",
      "2026-10-26（週一）,支出,HK$11.00,飲食,示範包,現金,2026-10-26 10:00",
      "2026-10-25（週日）,支出,HK$21.00,交通,示範車費,八達通,2026-10-26 11:00",
      "2026-10-24（週六）,收入,HK$100.00,其他,示範收入,現金,2026-10-24 09:00",
    ].join("\n");
    const txns = parseLedger(raw);
    const stats = monthStats(txns, "2026-10");
    expect(stats.expense).toBe(32);
    expect(stats.income).toBe(100);
    expect(stats.slices.map((slice) => slice.name)).toEqual(["交通", "飲食"]);
    expect(recentTxns(txns, 2).map((txn) => txn.hm)).toEqual(["11:00", "10:00"]);
  });
});
