import { categoryColor } from "../data/meta";
import type { CategorySlice } from "../lib/stats";

const R = 42;
const C = 2 * Math.PI * R;

export function Donut({ slices }: { slices: CategorySlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const gap = slices.length > 1 ? 3 : 0;
  let offset = 0;
  const label = slices
    .map((slice) => {
      const pct = total ? Math.round((slice.value / total) * 100) : 0;
      return `${slice.name} ${pct}%`;
    })
    .join("，");

  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" role="img" aria-label={`本月支出類別：${label}`}>
      <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
      {total > 0 && slices.length === 1 ? (
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={categoryColor(slices[0]?.name ?? "")}
          strokeWidth="12"
        />
      ) : (
        slices.map((slice) => {
          const full = total ? (slice.value / total) * C : 0;
          const dash = Math.max(0, full - gap);
          const dashOffset = -offset;
          offset += full;
          return (
            <circle
              key={slice.name}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={categoryColor(slice.name)}
              strokeWidth="12"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={dashOffset}
            />
          );
        })
      )}
    </svg>
  );
}
