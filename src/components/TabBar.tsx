import { IconGear, IconHome, IconList, IconPlus } from "./icons";
import { cx } from "./ui";

export type TabId = "home" | "ledger" | "settings";

const TABS: { id: TabId; label: string; icon: typeof IconHome }[] = [
  { id: "home", label: "首頁", icon: IconHome },
  { id: "ledger", label: "流水", icon: IconList },
];

export function TabBar({
  tab,
  onTab,
  onAdd,
}: {
  tab: TabId;
  onTab: (tab: TabId) => void;
  onAdd: () => void;
}) {
  return (
    <div className="relative shrink-0 border-t border-line bg-elevated">
      <div className="flex items-stretch" role="tablist" aria-label="主要">
        <div className="flex flex-1">
          {TABS.map((item) => (
            <TabButton key={item.id} item={item} selected={tab === item.id} onTab={onTab} />
          ))}
        </div>
        <div className="w-16 shrink-0" />
        <div className="flex flex-1">
          <TabButton
            item={{ id: "settings", label: "設定", icon: IconGear }}
            selected={tab === "settings"}
            onTab={onTab}
          />
        </div>
      </div>
      <button
        type="button"
        aria-label="記一筆"
        onClick={onAdd}
        className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white ring-4 ring-page"
      >
        <IconPlus />
      </button>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

function TabButton({
  item,
  selected,
  onTab,
}: {
  item: { id: TabId; label: string; icon: typeof IconHome };
  selected: boolean;
  onTab: (tab: TabId) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => onTab(item.id)}
      className={cx(
        "flex h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px]",
        selected ? "text-accent" : "text-faint",
      )}
    >
      <Icon className="h-[22px] w-[22px]" />
      {item.label}
    </button>
  );
}
