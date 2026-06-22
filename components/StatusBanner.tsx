"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CalendarClock, TrendingDown } from "lucide-react";
import type { Model } from "@/lib/finance";
import { rupee, fullMonth } from "@/lib/format";

export function StatusBanner({ model }: { model: Model }) {
  const next = model.milestones[0];
  const pct = Math.round(model.portfolioProgress * 100);
  const yrs = Math.floor(model.monthsToFreedom / 12);
  const mos = model.monthsToFreedom % 12;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card overflow-hidden"
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pos-soft text-pos">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
              Portfolio status
            </p>
            <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
              On track —{" "}
              {next
                ? `next relief in ${next.monthsAway === 0 ? "this month" : `${next.monthsAway} month${next.monthsAway > 1 ? "s" : ""}`}`
                : "all clear"}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-mute">
              <span className="inline-flex items-center gap-1.5">
                <TrendingDown size={14} className="text-pos" />
                {next ? `${next.loans.map((l) => l.name).join(", ")} clears ${fullMonth(next.date)}` : "No active loans"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock size={14} className="text-brand" />
                Debt-free by {model.freedomDate ? fullMonth(model.freedomDate) : "now"}
                {model.monthsToFreedom > 0 && ` (${yrs > 0 ? `${yrs}y ` : ""}${mos}m)`}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-medium text-ink-mute">Repayment progress</span>
            <span className="font-bold text-ink tnum">{pct}%</span>
          </div>
          <div className="bar">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ background: "linear-gradient(90deg,#1a73e8,#9334e6)" }}
            />
          </div>
          <p className="mt-1.5 text-[12px] text-ink-mute">
            {rupee(model.totalPaidSinceTracking)} cleared ·{" "}
            <span className="font-medium text-ink-soft">{rupee(model.totalRemaining)} to go</span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}
