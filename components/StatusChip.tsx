import type { Tone } from "@/lib/finance";

export const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  pos: { bg: "#e6f4ea", fg: "#137333", dot: "#188038" },
  warn: { bg: "#fef7e0", fg: "#a35200", dot: "#e37400" },
  neg: { bg: "#fce8e6", fg: "#c5221f", dot: "#d93025" },
  info: { bg: "#f3e8fd", fg: "#7c1fd1", dot: "#9334e6" },
  neutral: { bg: "#f1f3f4", fg: "#5f6368", dot: "#80868b" },
};

export function StatusChip({
  tone,
  label,
  dot = true,
}: {
  tone: Tone;
  label: string;
  dot?: boolean;
}) {
  const t = TONE[tone];
  return (
    <span className="chip" style={{ background: t.bg, color: t.fg }}>
      {dot && <span className="chip-dot" style={{ background: t.dot }} />}
      {label}
    </span>
  );
}
