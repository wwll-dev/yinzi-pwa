export const CATEGORIES = [
  { name: "飲食", color: "#0A84FF" },
  { name: "交通", color: "#64D2FF" },
  { name: "購物", color: "#FF9F0A" },
  { name: "住屋", color: "#BF5AF2" },
  { name: "娛樂", color: "#FF375F" },
  { name: "健康", color: "#30D158" },
  { name: "訂閱", color: "#FFD60A" },
  { name: "其他", color: "#8E8E93" },
] as const;

export const PAY_TAGS = ["八達通", "PayMe", "轉數快", "信用卡", "現金"] as const;

export const DEFAULT_BUDGET = 15000;

export const DEFAULT_REPO: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
} = {
  owner: "wwll-dev",
  repo: "yinzi-ledger",
  path: "data/2026_ledger.csv",
  branch: "main",
};

export function categoryColor(name: string): string {
  return CATEGORIES.find((item) => item.name === name)?.color ?? "#636366";
}
