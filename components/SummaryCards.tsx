"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  CalendarClock,
  TrendingDown,
  Flag,
  Receipt,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { Model, Tone } from "@/lib/finance";
import { rupee, fullMonth } from "@/lib/format";
import { AnimatedRupee, useCountUp } from "./AnimatedNumber";
import { StatusChip } from "./StatusChip";

function Count({ value }: { value: number }) {
  const v = useCountUp(value);
  return <>{Math.round(v)}</>;
}

type Card = {
  icon: LucideIcon;
  tint: string;
  fg: string;
  label: string;
  value: React.ReactNode;
  sub: string;
  status: { tone: Tone; label: string };
};

export function SummaryCards({ model }: { model: Model }) {
  const np = model.nextPayment;
  const paidPct =
    model.dueThisMonthTotal > 0
      ? Math.round((model.dueThisMonthPaid / model.dueThisMonthTotal) * 100)
      : 100;

  const nextTone: Tone = !np
    ? "pos"
    : np.daysAway === 0
      ? "neg"
      : np.daysAway <= 5
        ? "warn"
        : "neutral";

  const cards: Card[] = [
    {
      icon: Wallet,
      tint: "#e8f0fe",
      fg: "#1a73e8",
      label: "Total outstanding",
      value: <AnimatedRupee value={model.totalRemaining} format={rupee} />,
      sub: `${model.totalRemainingInstallments} installments left`,
      status: { tone: "neutral", label: `${model.activeCount} active` },
    },
    {
      icon: TrendingDown,
      tint: "#f3e8fd",
      fg: "#9334e6",
      label: "Monthly EMI",
      value: <AnimatedRupee value={model.monthlyOutflow} format={rupee} />,
      sub: `Avg ${rupee(model.avgEmi)} per loan`,
      status: { tone: "info", label: "Outflow / mo" },
    },
    {
      icon: CalendarClock,
      tint: "#fef7e0",
      fg: "#e37400",
      label: "Next payment",
      value: np ? <AnimatedRupee value={np.loan.emi} format={rupee} /> : "—",
      sub: np ? `${np.loan.name}` : "Nothing due",
      status: {
        tone: nextTone,
        label: np ? (np.daysAway === 0 ? "Due today" : `in ${np.daysAway} days`) : "Clear",
      },
    },
    {
      icon: Receipt,
      tint: "#e6f4ea",
      fg: "#188038",
      label: "Due this month",
      value: <AnimatedRupee value={model.dueThisMonthRemaining} format={rupee} />,
      sub: `${rupee(model.dueThisMonthPaid)} already paid`,
      status: { tone: paidPct === 100 ? "pos" : "warn", label: `${paidPct}% cleared` },
    },
    {
      icon: Layers,
      tint: "#e8f0fe",
      fg: "#1967d2",
      label: "Total payable",
      value: <AnimatedRupee value={model.totalScheduledPayable} format={rupee} />,
      sub: `${rupee(model.totalPaidSinceTracking)} paid so far`,
      status: { tone: "neutral", label: `${Math.round(model.portfolioProgress * 100)}% done` },
    },
    {
      icon: Flag,
      tint: "#e6f4ea",
      fg: "#188038",
      label: "Debt-free in",
      value: (
        <span>
          <Count value={model.monthsToFreedom} />
          <span className="text-base font-medium text-ink-faint"> mo</span>
        </span>
      ),
      sub: model.freedomDate ? `by ${fullMonth(model.freedomDate)}` : "You are free!",
      status: { tone: "pos", label: "Final goal" },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.4 }}
          className="card p-4 transition hover:shadow-card-hover"
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ background: c.tint, color: c.fg }}
            >
              <c.icon size={17} />
            </span>
            <StatusChip tone={c.status.tone} label={c.status.label} />
          </div>
          <p className="text-[12px] font-medium text-ink-mute">{c.label}</p>
          <p className="mt-0.5 font-display text-xl font-bold text-ink tnum sm:text-[22px]">
            {c.value}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-faint">{c.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
