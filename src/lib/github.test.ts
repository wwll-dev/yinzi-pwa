import { describe, expect, it } from "vitest";
import { decodeBase64Utf8, encodeBase64Utf8 } from "./github";

describe("github content encoding", () => {
  it("round-trips a traditional Chinese ledger", () => {
    const text = "日期,類型,金額,類別,備註,帳戶,記錄時間\n2026-01-02（週五）,支出,HK$48.00,飲食,示範午餐,八達通,2026-01-02 12:30\n";
    expect(decodeBase64Utf8(encodeBase64Utf8(text))).toBe(text);
  });
});
