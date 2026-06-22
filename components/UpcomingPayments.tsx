"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import type { Model, Tone } from "@/lib/finance";
import { rupee, dateLabel } from "@/lib/format";
import { StatusChip } from "./StatusChip";

export function UpcomingPayments({ model }: { model: Model }) {
  const items = model.loans
    .filter((l) => l.thisMonthDue)
    .map((l) => ({
      id: l.loan.id,
      name: l.loan.name,
      short: l.loan.short,
      color: l.loan.color,
      emi: l.loan.emi,
      date: l.thisMonthDue!,
      paid: l.thisMonthPaid,
      days: Math.max(0, Math.ceil((l.thisMonthDue!.getTime() - model.now.getTime()) / 86400000)),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const paidPct =
    model.dueThisMonthTotal > 0
      ? Math.round((model.dueThisMonthPaid / model.dueThisMonthTotal) * 100)
      : 100;

  function status(it: (typeof items)[number]): { tone: Tone; label: string } {
    if (it.paid) return { tone: "pos", label: "Paid" };
    if (it.days === 0) return { tone: "neg", label: "Due today" };
    if (it.days <= 5) return { tone: "warn", label: `Due in ${it.days}d` };
    return { tone: "neutral", label: `In ${it.days}d` };
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
            <CalendarDays size={18} className="text-brand" />
            This month
          </h2>
          <p className="text-[13px] text-ink-mute">Due dates for this calendar month</p>
        </div>
        <div className="text-right">
          <p className="font-display text-base font-bold text-ink tnum">
            {rupee(model.dueThisMonthRemaining)}
          </p>
          <p className="text-[12px] text-ink-mute">still to pay</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[12px] text-ink-mute">
          <span>{rupee(model.dueThisMonthPaid)} paid</span>
          <span className="font-semibold text-ink">{paidPct}% cleared</span>
        </div>
        <div className="bar">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ background: "linear-gradient(90deg,#188038,#34a853)" }}
          />
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((it, i) => {
          const st = status(it);
          return (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex items-center gap-3 rounded-xl border border-line-soft px-3 py-2.5"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                style={{ background: it.color }}
              >
                {it.short}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">{it.name}</p>
                <p className="text-[12px] text-ink-mute">{dateLabel(it.date)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-[13px] font-bold text-ink tnum">{rupee(it.emi)}</p>
                <StatusChip tone={st.tone} label={st.label} />
              </div>
            </motion.li>
          );
        })}
        {items.length === 0 && (
          <li className="rounded-xl bg-canvas p-4 text-center text-[13px] text-ink-mute">
            No EMIs left to pay this month 🎉
          </li>
        )}
      </ul>
    </motion.section>
  );
}
