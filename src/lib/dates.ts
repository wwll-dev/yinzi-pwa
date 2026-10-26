const WEEK = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"] as const;
const EN_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type HkParts = {
  ymd: string;
  hm: string;
  weekday: string;
  monthKey: string;
};

export function hkNowParts(date = new Date()): HkParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const year = parts.year ?? "1970";
  const month = parts.month ?? "01";
  const day = parts.day ?? "01";
  const hour = (parts.hour ?? "00").padStart(2, "0");
  const minute = (parts.minute ?? "00").padStart(2, "0");
  const weekdayEn = parts.weekday ?? "Sun";
  const weekday =
    WEEK[EN_WEEK.indexOf(weekdayEn as (typeof EN_WEEK)[number])] ?? "週日";
  const ymd = `${year}-${month}-${day}`;
  return {
    ymd,
    hm: `${hour}:${minute}`,
    weekday,
    monthKey: `${year}-${month}`,
  };
}

function noonFromYmd(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year || 1970, (month || 1) - 1, day || 1, 4, 0, 0));
}

export function weekdayOfYmd(ymd: string): string {
  return hkNowParts(noonFromYmd(ymd)).weekday;
}

export function formatLedgerDate(ymd: string): string {
  return `${ymd}（${weekdayOfYmd(ymd)}）`;
}

export function addDays(ymd: string, delta: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year || 1970, (month || 1) - 1, (day || 1) + delta, 4, 0, 0));
  return hkNowParts(date).ymd;
}

export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${year}年${Number(month)}月`;
}

export function dayGroupLabel(ymd: string, todayYmd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "未知日期";
  if (ymd === todayYmd) return "今日";
  if (ymd === addDays(todayYmd, -1)) return "昨日";
  const [, month, day] = ymd.split("-");
  return `${Number(month)}月${Number(day)}日（${weekdayOfYmd(ymd)}）`;
}

export function parseYmd(value: string): string {
  return value.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
}

export function parseHm(value: string): string {
  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
}
