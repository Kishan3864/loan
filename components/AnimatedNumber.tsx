"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const from = fromRef.current;
    let startTs: number | null = null;

    const tick = (t: number) => {
      if (startTs === null) startTs = t;
      const p = Math.min(1, (t - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = from + (target - from) * eased;
      setVal(cur);
      fromRef.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

export function AnimatedRupee({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const v = useCountUp(value);
  return <span className={className}>{format(v)}</span>;
}
