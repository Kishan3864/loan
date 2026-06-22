"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Flag, CalendarClock } from "lucide-react";
import type { Model } from "@/lib/finance";
import { rupee, fullMonth } from "@/lib/format";
import { AnimatedRupee } from "./AnimatedNumber";
import { StatusChip } from "./StatusChip";

export function StatusBanner({ model }: { model: Model }) {
  const next = model.milestones[0];
  const pct = Math.round(model.portfolioProgress * 100);
  const yrs = Math.floor(model.monthsToFreedom / 12);
  const mos = model.monthsToFreedom % 12;

  const facts = [
    {
      icon: ArrowDownRight,
      label: "Next relief",
      value: next ? fullMonth(next.date) : "—",
      sub: next ? `−${rupee(next.freed)}/mo` : "all clear",
    },
    {
      icon: Flag,
      label: "Debt-free",
      value: model.freedomDate ? fullMonth(model.freedomDate) : "Now",
      sub: model.monthsToFreedom > 0 ? `${yrs > 0 ? `${yrs}y ` : ""}${mos}m to go` : "you are free",
    },
    {
      icon: CalendarClock,
      label: "Monthly EMI",
      value: rupee(model.monthlyOutflow),
      sub: `${model.activeCount} active loans`,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="panel overflow-hidden"
    >
      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        {/* hero number */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="eyebrow">Total outstanding</p>
            <StatusChip tone="pos" label="On track" />
          </div>
          <div className="mt-2 font-display text-[40px] font-bold leading-none tracking-tight text-ink num sm:text-[52px]">
            <AnimatedRupee value={model.totalRemaining} format={rupee} />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="text-ink-2">
                {rupee(model.totalPaidSinceTracking)} repaid of {rupee(model.totalScheduledPayable)}
              </span>
              <span className="num font-semibold text-ink">{pct}%</span>
            </div>
            <div className="bar">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ background: "#0a0a0a" }}
              />
            </div>
          </div>
        </div>

        {/* facts */}
        <div className="grid grid-cols-3 gap-3 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          {facts.map((f) => (
            <div key={f.label}>
              <f.icon size={15} className="text-ink-3" />
              <p className="eyebrow mt-2">{f.label}</p>
              <p className="mt-1 font-display text-[15px] font-bold tracking-tight text-ink">
                {f.value}
              </p>
              <p className="num mt-0.5 text-[11px] text-ink-3">{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
