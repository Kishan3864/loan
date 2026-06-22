import type { Tone } from "@/lib/finance";

export const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  pos: { bg: "#e7f4ea", fg: "#0a7d2c", dot: "#0a7d2c" },
  warn: { bg: "#f9f0df", fg: "#9a5b00", dot: "#b25e00" },
  neg: { bg: "#fdeceb", fg: "#c8281c", dot: "#d93025" },
  info: { bg: "#efeaff", fg: "#6a3fd6", dot: "#7c5cff" },
  neutral: { bg: "#f4f4f5", fg: "#5c5c5c", dot: "#b3b3b8" },
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
