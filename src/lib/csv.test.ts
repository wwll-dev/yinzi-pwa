import { describe, expect, it } from "vitest";
import { appendCsvRow, buildEntryFields, parseLedger } from "./csv";
import { parseAmount } from "./money";

describe("csv ledger", () => {
  it("parses HK$ amounts and weekday dates", () => {
    const raw = [
      "日期,類型,金額,類別,備註,帳戶,記錄時間",
      "2026-01-02（週五）,支出,HK$88.00,飲食,示範午餐,八達通,2026-01-02 13:23",
      '2026-01-03（週六）,收入,"HK$1,234.50",其他,"有,逗號",現金,2026-01-03 09:01',
    ].join("\n");
    const txns = parseLedger(raw);
    expect(txns).toHaveLength(2);
    expect(txns[0]).toMatchObject({
      ymd: "2026-01-02",
      type: "支出",
      amount: 88,
      category: "飲食",
      note: "示範午餐",
      account: "八達通",
      hm: "13:23",
    });
    expect(txns[1]?.amount).toBe(1234.5);
    expect(txns[1]?.note).toBe("有,逗號");
  });

  it("appends a row without rewriting earlier lines", () => {
    const raw =
      "日期,類型,金額,類別,備註,帳戶,記錄時間\n2026-01-02（週五）,支出,HK$10.00,飲食,示範,現金,2026-01-02 09:00\n";
    const next = appendCsvRow(raw, [
      "2026-01-03（週六）",
      "支出",
      "HK$3.50",
      "交通",
      "有,逗號",
      "PayMe",
      "2026-01-03 10:00",
    ]);
    expect(next.startsWith(raw)).toBe(true);
    expect(next).toContain('"有,逗號"');
    const parsed = parseLedger(next);
    expect(parsed).toHaveLength(2);
    expect(parsed[1]?.note).toBe("有,逗號");
  });

  it("creates a header when the file is empty", () => {
    const next = appendCsvRow("", ["2026-01-01（週四）", "支出", "HK$1.00", "其他", "", "現金", "2026-01-01 00:01"]);
    expect(next.startsWith("日期,類型,金額,類別,備註,帳戶,記錄時間\n")).toBe(true);
    expect(parseLedger(next)).toHaveLength(1);
  });

  it("formats a new entry like the ledger", () => {
    const fields = buildEntryFields(
      {
        type: "支出",
        amountRaw: "12.5",
        category: "飲食",
        note: "包",
        account: "現金",
        ymd: "2026-10-26",
      },
      "2026-10-26",
      "08:06",
    );
    expect(fields).toEqual([
      "2026-10-26（週一）",
      "支出",
      "HK$12.50",
      "飲食",
      "包",
      "現金",
      "2026-10-26 08:06",
    ]);
  });
});

describe("money", () => {
  it("reads plain and HK$ amounts", () => {
    expect(parseAmount("HK$88.00")).toBe(88);
    expect(parseAmount("48.5")).toBe(48.5);
    expect(parseAmount("HK$1,234.50")).toBe(1234.5);
  });
});
