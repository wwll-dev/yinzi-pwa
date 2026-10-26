import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function joinClass(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function Glyph({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-6 w-6"}
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 11.2 12 4l8 7.2" />
      <path d="M7 10.2V20h10v-9.8" />
    </Glyph>
  );
}

export function IconList(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M8 7h12M8 12h12M8 17h12" />
      <path d="M4 7h.01M4 12h.01M4 17h.01" />
    </Glyph>
  );
}

export function IconGear(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
    </Glyph>
  );
}

export function IconPlus({ className, ...props }: IconProps) {
  return (
    <Glyph className={joinClass("h-7 w-7", className)} strokeWidth={2.25} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Glyph>
  );
}

export function IconRefresh({ className, ...props }: IconProps) {
  return (
    <Glyph className={joinClass("h-5 w-5", className)} {...props}>
      <path d="M20 12a8 8 0 0 1-13.7 5.6" />
      <path d="M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M20 4.5V9h-4.5M4 19.5V15h4.5" />
    </Glyph>
  );
}

export function IconBackspace({ className, ...props }: IconProps) {
  return (
    <Glyph className={joinClass("mx-auto h-6 w-6", className)} {...props}>
      <path d="M8.2 6h10.3A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5H8.2L3.5 12l4.7-6z" />
      <path d="M11 10l4.5 4.5M15.5 10 11 14.5" />
    </Glyph>
  );
}

export function IconFood(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M5 10h14" />
      <path d="M7 10c.3 4.4 2.2 6.5 5 6.5s4.7-2.1 5-6.5" />
      <path d="M12 16.5V19" />
      <path d="M9 19.5h6" />
    </Glyph>
  );
}

export function IconTransit(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="5" y="4" width="14" height="13" rx="3" />
      <path d="M5 11h14M8 20v-1.5M16 20v-1.5" />
      <circle cx="8.5" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="14" r="0.8" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

export function IconBag(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M6.5 8h11l-.8 11.2a1 1 0 0 1-1 .8H8.3a1 1 0 0 1-1-.8L6.5 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </Glyph>
  );
}

export function IconHouse(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 11.2 12 4l8 7.2" />
      <path d="M7 10.5V20h10V10.5" />
    </Glyph>
  );
}

export function IconTicket(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 9a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2V9z" />
      <path d="M12 7v10" />
    </Glyph>
  );
}

export function IconHealth(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8.5v7M8.5 12h7" />
    </Glyph>
  );
}

export function IconRepeat(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M19 12a7 7 0 0 1-12 5" />
      <path d="M5 12a7 7 0 0 1 12-5" />
      <path d="M19 5v4h-4M5 19v-4h4" />
    </Glyph>
  );
}

export function IconDots(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="6" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

const CATEGORY_ICONS: Record<string, (props: IconProps) => ReactNode> = {
  飲食: IconFood,
  交通: IconTransit,
  購物: IconBag,
  住屋: IconHouse,
  娛樂: IconTicket,
  健康: IconHealth,
  訂閱: IconRepeat,
  其他: IconDots,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? IconDots;
  return <Icon className={className} />;
}
