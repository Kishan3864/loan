"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  LineChart as LineIcon,
  TrendingDown,
  PieChart as PieIcon,
  AreaChart as AreaIcon,
  Table as TableIcon,
} from "lucide-react";
import type { Model } from "@/lib/finance";
import { rupee, rupeeShort } from "@/lib/format";
import { Segmented } from "./Segmented";

type DataKey = "lender" | "burden" | "paydown" | "split";
type Mode = "chart" | "table";

const DATASETS: { key: DataKey; label: string; sub: string; icon: any }[] = [
  { key: "lender", label: "By lender", sub: "Outstanding amount owed to each lender today", icon: BarChart3 },
  { key: "burden", label: "Monthly burden", sub: "Forecast of EMI outflow each month until you are debt-free", icon: AreaIcon },
  { key: "paydown", label: "Paydown", sub: "How your remaining balance falls to zero over time", icon: TrendingDown },
  { key: "split", label: "Lender split", sub: "Share of total outstanding by lender", icon: PieIcon },
];

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-pop">
      {label && <p className="mb-1 font-semibold text-ink">{label}</p>}
      {payload
        .filter((p: any) => (p.value ?? 0) > 0)
        .map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color || p.fill || p.stroke }} />
            <span className="text-ink-mute">{p.name}</span>
            <span className="ml-auto font-semibold text-ink tnum">{rupee(p.value)}</span>
          </div>
        ))}
    </div>
  );
}

export function VisualizationPanel({ model }: { model: Model }) {
  const [data, setData] = useState<DataKey>("lender");
  const [mode, setMode] = useState<Mode>("chart");

  const timeline = model.timeline;
  const active = useMemo(() => model.loans.filter((l) => l.active), [model]);
  const lenderRows = useMemo(
    () =>
      active
        .map((l) => ({
          id: l.loan.id,
          name: l.loan.name,
          color: l.loan.color,
          emi: l.loan.emi,
          count: l.remainingCount,
          amount: l.remainingAmount,
          share: model.totalRemaining ? l.remainingAmount / model.totalRemaining : 0,
          payoff: l.payoffDate,
        }))
        .sort((a, b) => b.amount - a.amount),
    [active, model.totalRemaining],
  );

  const meta = DATASETS.find((d) => d.key === data)!;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="card p-5"
    >
      <div className="flex flex-col gap-3 border-b border-line-soft pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-ink">Repayment analytics</h2>
          <p className="mt-0.5 text-[13px] text-ink-mute">{meta.sub}</p>
        </div>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { key: "chart", label: "Chart", icon: data === "paydown" || data === "burden" ? LineIcon : BarChart3 },
            { key: "table", label: "Table", icon: TableIcon },
          ]}
        />
      </div>

      <div className="mt-4 overflow-x-auto thin-scroll">
        <Segmented value={data} onChange={setData} options={DATASETS} compact />
      </div>

      <div className="mt-5 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={data + mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {mode === "chart" ? (
              <Charts data={data} model={model} timeline={timeline} lenderRows={lenderRows} />
            ) : (
              <Tables data={data} model={model} timeline={timeline} lenderRows={lenderRows} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ───────────────────────── charts ───────────────────────── */
function Charts({
  data,
  model,
  timeline,
  lenderRows,
}: {
  data: DataKey;
  model: Model;
  timeline: Model["timeline"];
  lenderRows: any[];
}) {
  if (data === "lender") {
    return (
      <div className="h-[300px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={lenderRows} margin={{ top: 8, right: 8, left: -6, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#eceef1" />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#dadce0" }} interval={0} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => rupeeShort(v)} tickLine={false} axisLine={false} width={56} />
            <Tooltip cursor={{ fill: "#f1f3f4" }} content={<ChartTip />} />
            <Bar dataKey="amount" name="Outstanding" radius={[8, 8, 0, 0]} maxBarSize={70}>
              {lenderRows.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (data === "burden") {
    return (
      <div className="h-[300px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
            <defs>
              {model.loans.map((l) => (
                <linearGradient key={l.loan.id} id={`v-${l.loan.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={l.loan.color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={l.loan.color} stopOpacity={0.08} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="#eceef1" />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#dadce0" }} interval="preserveStartEnd" minTickGap={26} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => rupeeShort(v)} tickLine={false} axisLine={false} width={56} />
            <Tooltip content={<ChartTip />} />
            {model.loans.map((l) => (
              <Area
                key={l.loan.id}
                type="monotone"
                dataKey={l.loan.id}
                name={l.loan.name}
                stackId="1"
                stroke={l.loan.color}
                strokeWidth={1.5}
                fill={`url(#v-${l.loan.id})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (data === "paydown") {
    return (
      <div className="h-[300px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="v-paydown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a73e8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1a73e8" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eceef1" />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#dadce0" }} interval="preserveStartEnd" minTickGap={26} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => rupeeShort(v)} tickLine={false} axisLine={false} width={56} />
            <Tooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="cumulativeRemaining" name="Remaining balance" stroke="#1a73e8" strokeWidth={2.5} fill="url(#v-paydown)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // split donut
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[260px] w-full sm:h-[300px] sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTip />} />
            <Pie data={lenderRows} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius="60%" outerRadius="86%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {lenderRows.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Total</p>
            <p className="font-display text-xl font-bold text-ink tnum">{rupeeShort(model.totalRemaining)}</p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-2 sm:w-1/2">
        {lenderRows.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-xl border border-line-soft px-3 py-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-[13px] font-medium text-ink-soft">{d.name}</span>
            <span className="ml-auto text-[13px] font-semibold text-ink tnum">{rupee(d.amount)}</span>
            <span className="w-11 text-right text-[12px] text-ink-mute tnum">{Math.round(d.share * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── tables ───────────────────────── */
function Tables({
  data,
  model,
  timeline,
  lenderRows,
}: {
  data: DataKey;
  model: Model;
  timeline: Model["timeline"];
  lenderRows: any[];
}) {
  if (data === "lender" || data === "split") {
    return (
      <div className="overflow-x-auto thin-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>Lender</th>
              <th className="num">EMI</th>
              <th className="num">Left</th>
              <th className="num">Outstanding</th>
              <th className="num">Share</th>
            </tr>
          </thead>
          <tbody>
            {lenderRows.map((d) => (
              <tr key={d.id}>
                <td>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="font-medium text-ink">{d.name}</span>
                  </span>
                </td>
                <td className="num">{rupee(d.emi)}</td>
                <td className="num">{d.count}</td>
                <td className="num font-semibold text-ink">{rupee(d.amount)}</td>
                <td className="num">{Math.round(d.share * 100)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border-t border-line pt-3 font-semibold text-ink">Total</td>
              <td className="num border-t border-line pt-3 font-semibold text-ink">{rupee(model.monthlyOutflow)}</td>
              <td className="num border-t border-line pt-3 font-semibold text-ink">{model.totalRemainingInstallments}</td>
              <td className="num border-t border-line pt-3 font-semibold text-ink">{rupee(model.totalRemaining)}</td>
              <td className="num border-t border-line pt-3 font-semibold text-ink">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  if (data === "burden") {
    return (
      <div className="max-h-[360px] overflow-auto thin-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>Month</th>
              <th className="num">Loans due</th>
              <th className="num">EMI outflow</th>
              <th className="num">Balance after</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((p) => {
              let due = 0;
              for (const l of model.loans) if (((p[l.loan.id] as number) ?? 0) > 0) due++;
              return (
                <tr key={p.key}>
                  <td className="font-medium text-ink">{p.label}</td>
                  <td className="num">{due}</td>
                  <td className="num font-semibold text-ink">{rupee(p.total)}</td>
                  <td className="num">{rupee(Math.max(0, p.cumulativeRemaining - p.total))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // paydown table
  return (
    <div className="max-h-[360px] overflow-auto thin-scroll">
      <table className="dtable">
        <thead>
          <tr>
            <th>Month</th>
            <th className="num">Paid so far</th>
            <th className="num">Remaining</th>
            <th className="num">% done</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((p) => {
            const paid = model.totalRemaining - p.cumulativeRemaining;
            const pct = model.totalRemaining ? Math.round((paid / model.totalRemaining) * 100) : 100;
            return (
              <tr key={p.key}>
                <td className="font-medium text-ink">{p.label}</td>
                <td className="num">{rupee(Math.max(0, paid))}</td>
                <td className="num font-semibold text-ink">{rupee(p.cumulativeRemaining)}</td>
                <td className="num">{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
