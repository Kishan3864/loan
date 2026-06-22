"use client";

import { motion } from "framer-motion";
import { TrendingDown, Flag } from "lucide-react";
import type { Model } from "@/lib/finance";
import { rupee, fullMonth } from "@/lib/format";
import { StatusChip } from "./StatusChip";

export function ReliefTimeline({ model }: { model: Model }) {
  const ms = model.milestones;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="panel p-5"
    >
      <div className="border-b border-line pb-4">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-ink">
          <TrendingDown size={17} className="text-ink-3" />
          Relief timeline
        </h2>
        <p className="mt-0.5 text-[12px] text-ink-3">
          When each loan closes and how much monthly EMI you free up
        </p>
      </div>

      <ol className="relative mt-5 space-y-3 border-l border-line pl-5">
        {ms.map((m, i) => {
          const reliefPct = Math.round((1 - m.monthlyAfter / Math.max(1, model.monthlyOutflow)) * 100);
          return (
            <motion.li
              key={m.monthKey}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.4 }}
              className="relative"
            >
              <span className="absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-white ring-1 ring-line-2">
                <span className="h-2 w-2 rounded-full bg-ink" />
              </span>

              <div className="rounded-xl border border-line p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-[14px] font-bold text-ink">{fullMonth(m.date)}</p>
                    <p className="num text-[11px] text-ink-3">
                      {m.monthsAway === 0 ? "this month" : `${m.monthsAway} months away`}
                    </p>
                  </div>
                  <StatusChip tone="pos" label={`−${rupee(m.freed)}/mo`} dot={false} />
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.loans.map((l) => (
                    <span
                      key={l.name}
                      className="rounded-md px-2 py-0.5 text-[11.5px] font-semibold text-white"
                      style={{ background: l.color }}
                    >
                      {l.name} closes
                    </span>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-ink-2">
                  EMI after this:{" "}
                  <span className="num font-bold text-ink">
                    {m.monthlyAfter === 0 ? "₹0 — debt-free" : `${rupee(m.monthlyAfter)}/mo`}
                  </span>
                </div>

                <div className="mt-2 bar">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${reliefPct}%` }}
                    transition={{ duration: 1, delay: 0.08 * i }}
                    style={{ background: "#0a0a0a" }}
                  />
                </div>
                <p className="num mt-1 text-[10.5px] text-ink-4">{reliefPct}% of EMI freed</p>
              </div>
            </motion.li>
          );
        })}

        {model.freedomDate && (
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * ms.length, duration: 0.4 }}
            className="relative"
          >
            <span className="absolute -left-[29px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-ink">
              <Flag size={11} className="text-white" />
            </span>
            <div className="rounded-xl border border-ink/15 bg-paper p-3.5">
              <p className="font-display text-[14px] font-bold text-ink">
                Debt-free — {fullMonth(model.freedomDate)}
              </p>
              <p className="num mt-0.5 text-[11.5px] text-ink-3">
                All loans cleared, {model.monthsToFreedom} months from today.
              </p>
            </div>
          </motion.li>
        )}
      </ol>
    </motion.section>
  );
}
