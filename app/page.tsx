"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildModel } from "@/lib/finance";
import type { Loan } from "@/lib/data";
import { todayLabel } from "@/lib/format";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { StatusBanner } from "@/components/StatusBanner";
import { SummaryCards } from "@/components/SummaryCards";
import { UpcomingPayments } from "@/components/UpcomingPayments";
import { VisualizationPanel } from "@/components/VisualizationPanel";
import { ReliefTimeline } from "@/components/ReliefTimeline";
import { LoansSection } from "@/components/LoansSection";
import { ScheduleTable } from "@/components/ScheduleTable";
import { SessionGuard } from "@/components/SessionGuard";

export default function DashboardPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [owner, setOwner] = useState("Kishan");

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/loans", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setLoans(d.loans ?? []);
        if (d?.owner?.greetingName) setOwner(d.owner.greetingName);
      })
      .catch(() => setLoans([]));
  }, []);

  const model = useMemo(() => (now && loans ? buildModel(now, loans) : null), [now, loans]);

  if (!model || !now) {
    return (
      <main className="relative min-h-[100dvh] px-4 py-5 sm:px-6">
        <Background />
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-12 w-56 animate-pulse rounded-2xl bg-black/[0.04]" />
          <div className="h-28 animate-pulse rounded-2xl bg-black/[0.04]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-black/[0.04]" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-black/[0.04]" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] px-4 py-5 sm:px-6">
      <Background />
      <SessionGuard />
      <div className="mx-auto max-w-6xl space-y-4 pb-12">
        <Header name={owner} dateLabel={todayLabel(now)} />

        {model.loans.length === 0 ? (
          <div className="panel grid place-items-center gap-3 p-12 text-center">
            <p className="font-display text-lg font-bold text-ink">No loans yet</p>
            <p className="text-[13px] text-ink-3">Add your EMIs to start tracking your debt journey.</p>
            <Link
              href="/admin"
              className="mt-1 inline-flex items-center rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-white"
            >
              Add loans in Admin →
            </Link>
          </div>
        ) : (
          <>
            <StatusBanner model={model} />
            <SummaryCards model={model} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <UpcomingPayments model={model} />
              <ReliefTimeline model={model} />
            </div>
            <VisualizationPanel model={model} />
            <LoansSection model={model} />
            <ScheduleTable model={model} />
          </>
        )}

        <p className="num pt-2 text-center text-[11px] text-ink-4">
          Private dashboard · auto-locks after inactivity · figures update each month
        </p>
      </div>
    </main>
  );
}
