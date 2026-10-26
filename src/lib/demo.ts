import { CSV_HEADER } from "./csv";
import { addDays, formatLedgerDate, hkNowParts } from "./dates";

/** Clearly fake rows so the UI can be previewed without a token. */
export function buildDemoCsv(now = new Date()): string {
  const today = hkNowParts(now).ymd;
  const yesterday = addDays(today, -1);
  const two = addDays(today, -2);
  const four = addDays(today, -4);
  const six = addDays(today, -6);
  const rows = [
    [formatLedgerDate(today), "支出", "HK$48.00", "飲食", "示範午餐", "八達通", `${today} 12:30`],
    [formatLedgerDate(yesterday), "支出", "HK$18.50", "交通", "示範車費", "八達通", `${yesterday} 08:40`],
    [formatLedgerDate(two), "支出", "HK$260.00", "購物", "示範用品", "PayMe", `${two} 16:05`],
    [formatLedgerDate(four), "支出", "HK$120.00", "住屋", "示範電費", "轉數快", `${four} 09:15`],
    [formatLedgerDate(six), "收入", "HK$800.00", "其他", "示範收入", "現金", `${six} 11:00`],
  ];
  return `${CSV_HEADER}\n${rows.map((row) => row.join(",")).join("\n")}\n`;
}
