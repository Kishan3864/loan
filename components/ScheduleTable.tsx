"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import type { Model, ScheduleRow } from "@/lib/finance";
import { buildScheduleRows } from "@/lib/finance";
import { rupee } from "@/lib/format";
import { Segmented } from "./Segmented";
import { StatusChip } from "./StatusChip";

type Range = "12" | "24" | "all";

function rowStatus(r: ScheduleRow): { tone: any; label: string } {
  if (r.balanceAfter === 0) return { tone: "pos", label: "Debt-free" };
  if (r.reliefLoans.length > 0) return { tone: "pos", label: `${r.reliefLoans.join(", ")} closes` };
  if (r.isCurrentMonth) return { tone: "info", label: "Current month" };
  return { tone: "neutral", label: `${r.countDue} due` };
}

export function ScheduleTable({ model }: { model: Model }) {
  const [range, setRange] = useState<Range>("12");
  const allRows = useMemo(() => buildScheduleRows(model), [model]);
  const rows = range === "all" ? allRows : allRows.slice(0, Number(range));
  const loans = model.loans;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="panel p-5"
    >
      <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2 className="mt-1 flex items-center gap-2 font-display text-[15px] font-bold text-ink">
            <CalendarRange size={17} className="text-ink-3" />
            Month-by-month plan
          </h2>
          <p className="num mt-0.5 text-[12px] text-ink-3">
            Every EMI until debt-free · {allRows.length} months
          </p>
        </div>
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { key: "12", label: "12 mo" },
            { key: "24", label: "24 mo" },
            { key: "all", label: "Full" },
          ]}
        />
      </div>

      <div className="mt-4 max-h-[440px] overflow-auto thin-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>Month</th>
              {loans.map((l) => (
                <th key={l.loan.id} className="num">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm" style={{ background: l.loan.color }} />
                    {l.loan.short}
                  </span>
                </th>
              ))}
              <th className="num">Total</th>
              <th className="num">Balance after</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = rowStatus(r);
              return (
                <tr key={r.key} style={r.isCurrentMonth ? { background: "#f3f6ff" } : undefined}>
                  <td className="num whitespace-nowrap font-medium text-ink">{r.label}</td>
                  {loans.map((l) => {
                    const amt = r.perLoan[l.loan.id] ?? 0;
                    return (
                      <td key={l.loan.id} className="num">
                        {amt > 0 ? (
                          <span style={{ color: l.loan.color, fontWeight: 600 }}>{rupee(amt)}</span>
                        ) : (
                          <span className="text-ink-4">·</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="num font-semibold text-ink">{rupee(r.total)}</td>
                  <td className="num">{rupee(r.balanceAfter)}</td>
                  <td className="whitespace-nowrap">
                    <StatusChip tone={st.tone} label={st.label} dot={st.tone !== "neutral"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {range !== "all" && allRows.length > rows.length && (
        <button
          onClick={() => setRange("all")}
          className="mt-3 text-[13px] font-medium text-accent hover:underline"
        >
          Show all {allRows.length} months →
        </button>
      )}
    </motion.section>
  );
}
