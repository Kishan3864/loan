"use client";

import { useEffect, useMemo, useState } from "react";
import { buildModel } from "@/lib/finance";
import { OWNER } from "@/lib/data";
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

export default function DashboardPage() {
  const [now, setNow] = useState<Date | null>(null);

  // compute on the client so it reflects the user's real local date; refresh hourly
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const model = useMemo(() => (now ? buildModel(now) : null), [now]);

  if (!model || !now) {
    return (
      <main className="relative min-h-[100dvh] px-4 py-5 sm:px-6">
        <Background />
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-12 w-56 animate-pulse rounded-2xl bg-black/5" />
          <div className="h-20 animate-pulse rounded-2xl bg-black/5" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-black/5" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-black/5" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] px-4 py-5 sm:px-6">
      <Background />
      <div className="mx-auto max-w-6xl space-y-4 pb-12">
        <Header name={OWNER.greetingName} dateLabel={todayLabel(now)} />

        <StatusBanner model={model} />
        <SummaryCards model={model} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UpcomingPayments model={model} />
          <ReliefTimeline model={model} />
        </div>

        <VisualizationPanel model={model} />
        <LoansSection model={model} />
        <ScheduleTable model={model} />

        <p className="pt-2 text-center text-[12px] text-ink-faint">
          Private dashboard · Figures update automatically as each month passes
        </p>
      </div>
    </main>
  );
}
