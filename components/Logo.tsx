export function LogoMark({ size = 40, radius }: { size?: number; radius?: number }) {
  const r = radius ?? size * 0.26;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <rect width="100" height="100" rx={(r / size) * 100} fill="#0a0a0a" />
      <text
        x="50"
        y="47"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Space Grotesk', Inter, sans-serif"
        fontWeight="700"
        fontSize="58"
        fill="#ffffff"
      >
        ₹
      </text>
      <rect x="31" y="76" width="38" height="6" rx="3" fill="#2f5bff" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight text-ink ${className}`}>
      EMI<span className="text-accent">.</span>Dashboard
    </span>
  );
}
