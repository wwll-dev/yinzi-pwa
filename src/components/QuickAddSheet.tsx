import { useEffect, useRef, useState } from "react";
import { CATEGORIES, PAY_TAGS } from "../data/meta";
import { hkNowParts } from "../lib/dates";
import { displayAmount, pushAmountKey } from "../lib/money";
import type { EntryDraft } from "../types";
import { CategoryIcon, IconBackspace } from "./icons";
import { cx, PrimaryButton } from "./ui";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"] as const;

export function QuickAddSheet({
  saving,
  onClose,
  onSubmit,
}: {
  saving: boolean;
  onClose: () => void;
  onSubmit: (entry: EntryDraft) => void;
}) {
  const today = hkNowParts().ymd;
  const [type, setType] = useState<"支出" | "收入">("支出");
  const [amountRaw, setAmountRaw] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [note, setNote] = useState("");
  const [ymd, setYmd] = useState(today);
  const [drag, setDrag] = useState(0);
  const [shown, setShown] = useState(false);
  const startY = useRef(0);
  const dragRef = useRef(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const amount = Number(amountRaw);
  const ready = Number.isFinite(amount) && amount > 0 && category !== "" && account !== "";

  function submit() {
    if (!ready || saving) return;
    onSubmit({
      type,
      amountRaw,
      category,
      account,
      note,
      ymd: ymd || today,
    });
  }

  return (
    <div className="absolute inset-0 z-40">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          if (!saving) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[calc(100%-env(safe-area-inset-top)-8px)] flex-col rounded-t-[20px] bg-elevated transition-transform duration-200"
        style={{ transform: shown ? `translateY(${drag}px)` : "translateY(100%)" }}
      >
        <div
          className="flex shrink-0 cursor-grab justify-center pt-2"
          onPointerDown={(event) => {
            startY.current = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            const next = Math.max(0, event.clientY - startY.current);
            dragRef.current = next;
            setDrag(next);
          }}
          onPointerUp={(event) => {
            if (dragRef.current > 90 && !saving) onClose();
            dragRef.current = 0;
            setDrag(0);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
        >
          <span className="h-1 w-9 rounded-full bg-white/25" />
        </div>
        <div className="flex items-center justify-between px-4 pb-1">
          <h2 id="quick-add-title" className="text-[17px] font-semibold">
            記一筆
          </h2>
          <button type="button" onClick={onClose} disabled={saving} className="h-11 px-2 text-[16px] text-accent">
            關閉
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
          <div className="grid grid-cols-2 rounded-xl bg-soft p-1">
            {(["支出", "收入"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={cx(
                  "h-9 rounded-[10px] text-[15px]",
                  type === item ? "bg-elevated text-ink" : "text-muted",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <p className={`mt-4 text-center tabular-nums tracking-tight ${type === "收入" ? "text-income" : "text-ink"}`}>
            <span className="mr-1 align-top text-[18px] text-muted">HK$</span>
            <span className="text-[44px] font-semibold leading-none">{displayAmount(amountRaw)}</span>
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {CATEGORIES.map((item) => {
              const selected = category === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setCategory(item.name)}
                  className={cx(
                    "flex h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[12px]",
                    selected ? "bg-accent text-white" : "bg-soft text-ink",
                  )}
                >
                  <CategoryIcon name={item.name} className="h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PAY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setAccount(tag)}
                className={cx(
                  "h-9 rounded-full px-3 text-[14px]",
                  account === tag ? "bg-accent text-white" : "bg-soft text-muted",
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="mt-3 flex min-h-12 items-center gap-3 rounded-2xl bg-soft px-3">
            <span className="shrink-0 text-[14px] text-muted">備註</span>
            <input
              value={note}
              maxLength={200}
              placeholder="例如午餐"
              onChange={(event) => setNote(event.target.value)}
              className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
            />
          </label>
          <label className="mt-2 flex min-h-12 items-center gap-3 rounded-2xl bg-soft px-3">
            <span className="shrink-0 text-[14px] text-muted">日期</span>
            <input
              type="date"
              value={ymd}
              onChange={(event) => setYmd(event.target.value)}
              className="w-full bg-transparent text-right text-ink outline-none"
            />
          </label>
        </div>

        <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
          <div className="grid grid-cols-3 gap-1.5">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === "⌫" ? "刪除" : key}
                onClick={() => setAmountRaw((current) => pushAmountKey(current, key))}
                className="flex h-12 items-center justify-center rounded-xl bg-soft text-[22px] tabular-nums active:bg-white/15"
              >
                {key === "⌫" ? <IconBackspace /> : key}
              </button>
            ))}
          </div>
          {!ready ? (
            <p className="py-2 text-center text-[12px] text-faint">輸入金額，再揀類別同支付方式</p>
          ) : (
            <div className="h-2" />
          )}
          <PrimaryButton type="button" disabled={!ready || saving} onClick={submit}>
            {saving ? "寫入中…" : "記一筆"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
