export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/HK\$/gi, "").replace(/[$,\s＄¥]/g, "");
  if (!cleaned) return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function formatHkd(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const body = Math.abs(amount).toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}HK$${body}`;
}

export function formatHkdBody(amount: number): string {
  return Math.abs(amount).toLocaleString("en-HK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function pushAmountKey(current: string, key: string): string {
  if (key === "⌫") return current.slice(0, -1);
  if (key === ".") {
    if (current.includes(".")) return current;
    return `${current || "0"}.`;
  }
  if (!/^\d$/.test(key)) return current;
  if (current === "0") return key;
  const next = current + key;
  const [whole, fraction] = next.split(".");
  if ((whole ?? "").replace("-", "").length > 7) return current;
  if (fraction && fraction.length > 2) return current;
  return next;
}

export function displayAmount(raw: string): string {
  if (!raw) return "0";
  const negative = raw.startsWith("-");
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction] = unsigned.split(".");
  const withComma = Number(whole || "0").toLocaleString("en-HK");
  const prefix = negative ? "-" : "";
  if (unsigned.endsWith(".")) return `${prefix}${withComma}.`;
  if (fraction !== undefined) return `${prefix}${withComma}.${fraction}`;
  return `${prefix}${withComma}`;
}
