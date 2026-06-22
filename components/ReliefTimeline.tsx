"use client";

import { motion } from "framer-motion";
import { PartyPopper, ArrowDownRight, Flag } from "lucide-react";
import type { Model } from "@/lib/finance";
import { rupee, fullMonth } from "@/lib/format";
import { StatusChip } from "./StatusChip";

export function ReliefTimeline({ model }: { model: Model }) {
  const ms = model.milestones;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card p-5"
    >
      <div className="flex items-center gap-2">
        <PartyPopper size={18} className="text-pos" />
        <h2 className="font-display text-base font-bold text-ink">Relief timeline</h2>
      </div>
      <p className="mb-5 mt-0.5 text-[13px] text-ink-mute">
        When each loan closes and how much your monthly EMI drops
      </p>

      <ol className="relative space-y-3 border-l border-line pl-5">
        {ms.map((m, i) => {
          const reliefPct = Math.round(
            (1 - m.monthlyAfter / Math.max(1, model.monthlyOutflow)) * 100,
          );
          return (
            <motion.li
              key={m.monthKey}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.4 }}
              className="relative"
            >
              <span className="absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-pos-soft ring-2 ring-white">
                <span className="h-2 w-2 rounded-full bg-pos" />
              </span>

              <div className="rounded-xl border border-line-soft bg-canvas p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-bold text-ink">{fullMonth(m.date)}</p>
                    <p className="text-[12px] text-ink-mute">
                      {m.monthsAway === 0 ? "This month" : `${m.monthsAway} months away`}
                    </p>
                  </div>
                  <StatusChip tone="pos" label={`−${rupee(m.freed)}/mo`} dot={false} />
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.loans.map((l) => (
                    <span
                      key={l.name}
                      className="rounded-md px-2 py-0.5 text-[12px] font-semibold text-white"
                      style={{ background: l.color }}
                    >
                      {l.name} closes
                    </span>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ink-soft">
                  <ArrowDownRight size={15} className="text-pos" />
                  EMI after this:{" "}
                  <span className="font-bold text-ink">
                    {m.monthlyAfter === 0 ? "₹0 — debt-free" : `${rupee(m.monthlyAfter)}/mo`}
                  </span>
                </div>

                <div className="mt-2 bar">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${reliefPct}%` }}
                    transition={{ duration: 1, delay: 0.08 * i }}
                    style={{ background: "linear-gradient(90deg,#188038,#34a853)" }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink-faint">{reliefPct}% of your EMI freed up</p>
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
            <span className="absolute -left-[29px] top-0.5 grid h-5 w-5 place-items-center rounded-full bg-pos ring-2 ring-white">
              <Flag size={11} className="text-white" />
            </span>
            <div className="rounded-xl border border-pos/30 bg-pos-soft p-3.5">
              <p className="text-[14px] font-bold text-pos">
                🏁 Debt-free in {fullMonth(model.freedomDate)}
              </p>
              <p className="mt-0.5 text-[12px] text-pos/80">
                All loans cleared — {model.monthsToFreedom} months from today.
              </p>
            </div>
          </motion.li>
        )}
      </ol>
    </motion.section>
  );
}
