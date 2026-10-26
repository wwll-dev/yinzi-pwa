import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { SyncStatus } from "../types";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "flex h-[50px] w-full items-center justify-center rounded-[14px] bg-accent text-[17px] font-semibold text-white disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SyncBanner({
  status,
  message,
  demo,
}: {
  status: SyncStatus;
  message: string;
  demo: boolean;
}) {
  if (demo) {
    return <p className="px-5 pb-1 text-[13px] text-faint">示範資料，未寫入 GitHub</p>;
  }
  if (status === "loading") {
    return <p className="px-5 pb-1 text-[13px] text-faint">同步中…</p>;
  }
  if (status === "offline") {
    return <p className="px-5 pb-1 text-[13px] text-muted">離線，顯示上次同步</p>;
  }
  if (status === "error" && message) {
    return <p className="px-5 pb-1 text-[13px] leading-snug text-danger">{message}</p>;
  }
  return null;
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-page text-ink">
      {children}
    </div>
  );
}

export function Toast({ text, tone }: { text: string; tone: "ok" | "danger" }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 flex justify-center px-6">
      <p
        role="status"
        className={cx(
          "rounded-full bg-soft px-4 py-2 text-[14px]",
          tone === "danger" ? "text-danger" : "text-ink",
        )}
      >
        {text}
      </p>
    </div>
  );
}
