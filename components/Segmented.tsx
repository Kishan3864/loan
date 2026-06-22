"use client";

import type { ComponentType } from "react";

export type SegOption<T extends string> = {
  key: T;
  label: string;
  icon?: ComponentType<{ size?: number | string; className?: string }>;
};

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  compact = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegOption<T>[];
  compact?: boolean;
}) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => {
        const Icon = o.icon;
        const active = o.key === value;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(o.key)}
          >
            {Icon && <Icon size={15} />}
            <span className={compact ? "hidden sm:inline" : ""}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
