"use client";

import { motion } from "framer-motion";
import {
  TrendingDown,
  CalendarClock,
  Receipt,
  Layers,
  Flag,
  Gauge,
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
  const nextTone: Tone = !np ? "pos" : np.daysAway === 0 ? "neg" : np.daysAway <= 5 ? "warn" : "neutral";

  const cards: Card[] = [
    {
      icon: TrendingDown,
      label: "Monthly EMI",
      value: <AnimatedRupee value={model.monthlyOutflow} format={rupee} />,
      sub: `${model.totalRemainingInstallments} installments left`,
      status: { tone: "neutral", label: "per month" },
    },
    {
      icon: CalendarClock,
      label: "Next payment",
      value: np ? <AnimatedRupee value={np.loan.emi} format={rupee} /> : "—",
      sub: np ? np.loan.name : "nothing due",
      status: { tone: nextTone, label: np ? (np.daysAway === 0 ? "today" : `in ${np.daysAway}d`) : "clear" },
    },
    {
      icon: Receipt,
      label: "Due this month",
      value: <AnimatedRupee value={model.dueThisMonthRemaining} format={rupee} />,
      sub: `${rupee(model.dueThisMonthPaid)} already paid`,
      status: { tone: paidPct === 100 ? "pos" : "warn", label: `${paidPct}% done` },
    },
    {
      icon: Gauge,
      label: "Average EMI",
      value: <AnimatedRupee value={model.avgEmi} format={rupee} />,
      sub: "per active loan",
      status: { tone: "neutral", label: `${model.activeCount} loans` },
    },
    {
      icon: Layers,
      label: "Total payable",
      value: <AnimatedRupee value={model.totalScheduledPayable} format={rupee} />,
      sub: `${rupee(model.totalPaidSinceTracking)} paid so far`,
      status: { tone: "info", label: `${Math.round(model.portfolioProgress * 100)}%` },
    },
    {
      icon: Flag,
      label: "Debt-free in",
      value: (
        <span className="num">
          <Count value={model.monthsToFreedom} />
          <span className="text-base font-medium text-ink-4"> mo</span>
        </span>
      ),
      sub: model.freedomDate ? `by ${fullMonth(model.freedomDate)}` : "you are free!",
      status: { tone: "pos", label: "goal" },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.4 }}
          className="panel lift p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <c.icon size={16} className="text-ink-3" />
            <StatusChip tone={c.status.tone} label={c.status.label} dot={c.status.tone !== "neutral"} />
          </div>
          <p className="eyebrow">{c.label}</p>
          <p className="num mt-1 text-[21px] font-bold tracking-tight text-ink">{c.value}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-3">{c.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
