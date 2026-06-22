"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Table as TableIcon } from "lucide-react";
import type { LoanComputed, Model } from "@/lib/finance";
import { loanStatus } from "@/lib/finance";
import { rupee, fullMonth, dateLabel } from "@/lib/format";
import { Segmented } from "./Segmented";
import { StatusChip } from "./StatusChip";

type View = "cards" | "table";
type Sort = "payoff" | "amount" | "emi";

function ProgressRing({ progress, color, short }: { progress: number; color: string; short: string }) {
  const size = 52;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e8eaed" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-bold" style={{ color }}>
        {short}
      </span>
    </div>
  );
}

function LoanCard({ l, i }: { l: LoanComputed; i: number }) {
  const st = loanStatus(l);
  const total = l.snapshotCount || l.remainingCount;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * i, duration: 0.4 }}
      className="card p-5 transition hover:shadow-card-hover"
    >
      <div className="flex items-center gap-3">
        <ProgressRing progress={l.progress} color={l.loan.color} short={l.loan.short} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-display text-[15px] font-bold text-ink">{l.loan.name}</p>
            <StatusChip tone={st.tone} label={st.label} />
          </div>
          <p className="mt-0.5 text-[12px] text-ink-mute">
            {rupee(l.loan.emi)} / mo · due on the {l.loan.dueDay}
            {l.loan.dueDay === 1 ? "st" : l.loan.dueDay === 2 ? "nd" : l.loan.dueDay === 3 ? "rd" : "th"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Outstanding" value={rupee(l.remainingAmount)} />
        <Stat label="Installments" value={`${l.remainingCount} left`} />
        <Stat label="Closes" value={fullMonth(l.payoffDate)} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[11px] text-ink-mute">
          <span>{l.paidCount} of {total} paid</span>
          <span>{l.nextDue ? `next in ${l.daysToNext}d` : "done"}</span>
        </div>
        <div className="bar">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(l.progress * 100)}%` }}
            transition={{ duration: 0.9 }}
            style={{ background: l.loan.color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-2 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-0.5 text-[13px] font-bold text-ink tnum">{value}</p>
    </div>
  );
}

export function LoansSection({ model }: { model: Model }) {
  const [view, setView] = useState<View>("cards");
  const [sort, setSort] = useState<Sort>("payoff");

  const loans = useMemo(() => {
    const arr = [...model.loans];
    arr.sort((a, b) => {
      if (sort === "amount") return b.remainingAmount - a.remainingAmount;
      if (sort === "emi") return b.loan.emi - a.loan.emi;
      return a.payoffDate.getTime() - b.payoffDate.getTime();
    });
    return arr;
  }, [model.loans, sort]);

  return (
    <section>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-ink">All loans</h2>
          <p className="text-[13px] text-ink-mute">Every account with live status and payoff date</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={sort}
            onChange={setSort}
            options={[
              { key: "payoff", label: "Payoff" },
              { key: "amount", label: "Amount" },
              { key: "emi", label: "EMI" },
            ]}
          />
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { key: "cards", label: "Cards", icon: LayoutGrid },
              { key: "table", label: "Table", icon: TableIcon },
            ]}
            compact
          />
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {loans.map((l, i) => (
            <LoanCard key={l.loan.id} l={l} i={i} />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto thin-scroll p-0">
          <table className="dtable">
            <thead>
              <tr>
                <th>Lender</th>
                <th className="num">EMI</th>
                <th className="num">Left</th>
                <th className="num">Outstanding</th>
                <th>Due day</th>
                <th>Next due</th>
                <th>Closes</th>
                <th className="num">Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => {
                const st = loanStatus(l);
                return (
                  <tr key={l.loan.id}>
                    <td>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.loan.color }} />
                        <span className="font-medium text-ink">{l.loan.name}</span>
                      </span>
                    </td>
                    <td className="num">{rupee(l.loan.emi)}</td>
                    <td className="num">{l.remainingCount}</td>
                    <td className="num font-semibold text-ink">{rupee(l.remainingAmount)}</td>
                    <td>{l.loan.dueDay}</td>
                    <td>{l.nextDue ? `${dateLabel(l.nextDue)} · ${l.daysToNext}d` : "—"}</td>
                    <td>{fullMonth(l.payoffDate)}</td>
                    <td className="num">
                      <div className="flex items-center justify-end gap-2">
                        <div className="bar w-16">
                          <span style={{ width: `${Math.round(l.progress * 100)}%`, background: l.loan.color }} />
                        </div>
                        <span className="w-8 text-right tnum">{Math.round(l.progress * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusChip tone={st.tone} label={st.label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
