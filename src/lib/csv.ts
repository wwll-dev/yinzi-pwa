import { formatLedgerDate, parseHm, parseYmd } from "./dates";
import { parseAmount } from "./money";
import type { EntryDraft, Txn } from "../types";

export const CSV_HEADER = "日期,類型,金額,類別,備註,帳戶,記錄時間";

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < src.length; i += 1) {
    const char = src[i] ?? "";
    if (quoted) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      field = "";
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
  }
  return rows;
}

export function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function appendCsvRow(raw: string, fields: string[]): string {
  const newline = raw.includes("\r\n") ? "\r\n" : "\n";
  const line = fields.map(escapeCsvField).join(",");
  let text = raw.replace(/^\uFEFF/, "");
  if (!text.trim()) return `${CSV_HEADER}${newline}${line}${newline}`;
  if (!text.endsWith("\n")) text += newline;
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  if (!first.startsWith("日期")) text = `${CSV_HEADER}${newline}${text}`;
  return `${text}${line}${newline}`;
}

export function parseLedger(text: string): Txn[] {
  const rows = parseCsv(text);
  const txns: Txn[] = [];
  rows.forEach((cols, index) => {
    if (index === 0 && (cols[0] ?? "").trim() === "日期") return;
    if (cols.every((cell) => !cell.trim())) return;
    const dateLabel = (cols[0] ?? "").trim();
    const recordedAt = (cols[6] ?? "").trim();
    const ymd = parseYmd(dateLabel) || parseYmd(recordedAt);
    txns.push({
      index,
      dateLabel,
      ymd,
      type: (cols[1] ?? "").trim(),
      amount: parseAmount(cols[2] ?? ""),
      category: (cols[3] ?? "").trim(),
      note: (cols[4] ?? "").trim(),
      account: (cols[5] ?? "").trim(),
      recordedAt,
      hm: parseHm(recordedAt),
    });
  });
  return txns;
}

export function buildEntryFields(
  entry: EntryDraft,
  recordedYmd: string,
  recordedHm: string,
): string[] {
  const amount = Number(entry.amountRaw);
  return [
    formatLedgerDate(entry.ymd),
    entry.type,
    `HK$${amount.toFixed(2)}`,
    entry.category,
    entry.note.replace(/[\r\n]+/g, " ").trim(),
    entry.account,
    `${recordedYmd} ${recordedHm}`,
  ];
}
