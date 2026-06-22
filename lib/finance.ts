import { LOANS, Loan } from "./data";

const MS_DAY = 86400000;

// ── date helpers ─────────────────────────────────────────────
export function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
/** A due date in (possibly out-of-range) year/month, clamped to month length. */
export function dueDateFor(y: number, m: number, dueDay: number) {
  const base = new Date(y, m, 1);
  const yy = base.getFullYear();
  const mm = base.getMonth();
  return new Date(yy, mm, Math.min(dueDay, daysInMonth(yy, mm)));
}
export function nextDueOnOrAfter(from: Date, dueDay: number) {
  const f = stripTime(from);
  const here = dueDateFor(f.getFullYear(), f.getMonth(), dueDay);
  if (here >= f) return here;
  return dueDateFor(f.getFullYear(), f.getMonth() + 1, dueDay);
}
export function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function label(d: Date) {
  return `${MON[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

/** Full remaining schedule of due dates for a loan, anchored at its asOf date. */
export function scheduleFor(loan: Loan): Date[] {
  const asOf = new Date(loan.asOf + "T00:00:00");
  const first = nextDueOnOrAfter(asOf, loan.dueDay);
  const out: Date[] = [];
  for (let i = 0; i < loan.remaining; i++) {
    out.push(dueDateFor(first.getFullYear(), first.getMonth() + i, loan.dueDay));
  }
  return out;
}

// ── types ────────────────────────────────────────────────────
export type LoanComputed = {
  loan: Loan;
  schedule: Date[];
  payoffDate: Date;
  remainingCount: number;
  remainingAmount: number;
  snapshotCount: number;
  snapshotAmount: number;
  paidCount: number;
  progress: number; // 0..1 toward payoff (since asOf)
  nextDue: Date | null;
  daysToNext: number | null;
  active: boolean;
  thisMonthDue: Date | null;
  thisMonthPaid: boolean;
};

export type MonthPoint = {
  key: string;
  label: string;
  date: Date;
  total: number;
  cumulativeRemaining: number;
} & Record<string, number | string | Date>;

export type ReliefMilestone = {
  monthKey: string;
  date: Date;
  label: string;
  loans: { name: string; emi: number; color: string }[];
  freed: number;
  monthlyAfter: number;
  monthsAway: number;
};

export type Model = {
  now: Date;
  loans: LoanComputed[];
  totalRemaining: number;
  monthlyOutflow: number;
  activeCount: number;
  nextPayment: { loan: Loan; date: Date; daysAway: number } | null;
  dueThisMonthTotal: number;
  dueThisMonthRemaining: number;
  dueThisMonthPaid: number;
  timeline: MonthPoint[];
  milestones: ReliefMilestone[];
  freedomDate: Date | null;
  monthsToFreedom: number;
  startMonthlyOutflow: number; // monthly EMI at the asOf snapshot (for "relief so far")
  avgEmi: number;
  totalScheduledPayable: number; // total payable counted from each loan's asOf
  totalPaidSinceTracking: number;
  portfolioProgress: number; // 0..1, paid since tracking started
  totalRemainingInstallments: number;
  biggestLoanId: string | null;
};

export type Tone = "pos" | "warn" | "neg" | "info" | "neutral";
export type StatusBadge = { key: string; label: string; tone: Tone };

/** A human status for a single loan. */
export function loanStatus(l: LoanComputed): StatusBadge {
  if (l.remainingCount === 0) return { key: "cleared", label: "Cleared", tone: "pos" };
  if (l.thisMonthDue && l.thisMonthPaid)
    return { key: "paid", label: "Paid this month", tone: "pos" };
  if (l.daysToNext !== null && l.daysToNext === 0)
    return { key: "today", label: "Due today", tone: "neg" };
  if (l.daysToNext !== null && l.daysToNext <= 5)
    return { key: "soon", label: `Due in ${l.daysToNext}d`, tone: "warn" };
  if (l.remainingCount <= 3) return { key: "final", label: "Final stretch", tone: "info" };
  return { key: "active", label: "On track", tone: "neutral" };
}

export type ScheduleRow = {
  key: string;
  label: string;
  date: Date;
  perLoan: Record<string, number>;
  total: number;
  balanceAfter: number;
  isCurrentMonth: boolean;
  reliefLoans: string[];
  countDue: number;
};

/** Month-by-month repayment schedule, derived from the model timeline + milestones. */
export function buildScheduleRows(model: Model): ScheduleRow[] {
  const curKey = `${model.now.getFullYear()}-${String(model.now.getMonth() + 1).padStart(2, "0")}`;
  const reliefByMonth = new Map<string, string[]>();
  for (const m of model.milestones) reliefByMonth.set(m.monthKey, m.loans.map((l) => l.name));

  return model.timeline.map((p) => {
    const perLoan: Record<string, number> = {};
    let countDue = 0;
    for (const l of model.loans) {
      const amt = (p[l.loan.id] as number) ?? 0;
      perLoan[l.loan.id] = amt;
      if (amt > 0) countDue++;
    }
    return {
      key: p.key,
      label: p.label,
      date: p.date,
      perLoan,
      total: p.total,
      balanceAfter: Math.max(0, p.cumulativeRemaining - p.total),
      isCurrentMonth: p.key === curKey,
      reliefLoans: reliefByMonth.get(p.key) ?? [],
      countDue,
    };
  });
}

// ── the engine ───────────────────────────────────────────────
export function buildModel(now: Date): Model {
  const today = stripTime(now);
  const curY = now.getFullYear();
  const curM = now.getMonth();

  const loans: LoanComputed[] = LOANS.map((loan) => {
    const schedule = scheduleFor(loan);
    const payoffDate = schedule[schedule.length - 1] ?? today;
    const upcoming = schedule.filter((d) => d >= today);
    const remainingCount = upcoming.length;
    const snapshotCount = loan.remaining;
    const paidCount = snapshotCount - remainingCount;
    const nextDue = upcoming[0] ?? null;

    const thisMonthDue =
      schedule.find((d) => d.getFullYear() === curY && d.getMonth() === curM) ?? null;

    return {
      loan,
      schedule,
      payoffDate,
      remainingCount,
      remainingAmount: loan.emi * remainingCount,
      snapshotCount,
      snapshotAmount: loan.emi * snapshotCount,
      paidCount,
      progress: snapshotCount ? paidCount / snapshotCount : 1,
      nextDue,
      daysToNext: nextDue
        ? Math.max(0, Math.ceil((nextDue.getTime() - today.getTime()) / MS_DAY))
        : null,
      active: remainingCount > 0,
      thisMonthDue,
      thisMonthPaid: thisMonthDue ? thisMonthDue < today : false,
    };
  });

  const totalRemaining = loans.reduce((s, l) => s + l.remainingAmount, 0);
  const activeLoans = loans.filter((l) => l.active);
  const monthlyOutflow = activeLoans.reduce((s, l) => s + l.loan.emi, 0);
  const startMonthlyOutflow = loans.reduce(
    (s, l) => s + (l.snapshotCount > 0 ? l.loan.emi : 0),
    0,
  );

  // next payment across all loans
  let nextPayment: Model["nextPayment"] = null;
  for (const l of loans) {
    if (l.nextDue && (!nextPayment || l.nextDue < nextPayment.date)) {
      nextPayment = { loan: l.loan, date: l.nextDue, daysAway: l.daysToNext! };
    }
  }

  // this month buckets
  let dueThisMonthTotal = 0;
  let dueThisMonthRemaining = 0;
  let dueThisMonthPaid = 0;
  for (const l of loans) {
    if (l.thisMonthDue) {
      dueThisMonthTotal += l.loan.emi;
      if (l.thisMonthDue >= today) dueThisMonthRemaining += l.loan.emi;
      else dueThisMonthPaid += l.loan.emi;
    }
  }

  // timeline: month-by-month forward EMI burden
  const maxPayoff = loans.reduce((a, l) => (l.payoffDate > a ? l.payoffDate : a), today);
  const startM = startOfMonth(now);
  const months = Math.max(1, monthsBetween(startM, startOfMonth(maxPayoff)) + 1);

  const timeline: MonthPoint[] = [];
  for (let i = 0; i < months; i++) {
    const mDate = new Date(startM.getFullYear(), startM.getMonth() + i, 1);
    const point: MonthPoint = {
      key: monthKey(mDate),
      label: label(mDate),
      date: mDate,
      total: 0,
      cumulativeRemaining: 0,
    };
    let total = 0;
    for (const l of loans) {
      const active = l.schedule.some(
        (d) =>
          d.getFullYear() === mDate.getFullYear() &&
          d.getMonth() === mDate.getMonth() &&
          d >= today,
      );
      const amt = active ? l.loan.emi : 0;
      point[l.loan.id] = amt;
      total += amt;
    }
    point.total = total;
    timeline.push(point);
  }
  // suffix sums => money still owed at the start of each month
  let acc = 0;
  for (let i = timeline.length - 1; i >= 0; i--) {
    acc += timeline[i].total;
    timeline[i].cumulativeRemaining = acc;
  }

  // relief milestones: when does each loan finish & what's left after
  const byMonth = new Map<string, LoanComputed[]>();
  for (const l of activeLoans) {
    const k = monthKey(l.payoffDate);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(l);
  }
  const groups = [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  let running = monthlyOutflow;
  const milestones: ReliefMilestone[] = groups.map(([k, ls]) => {
    const date = ls.reduce((a, b) => (a.payoffDate > b.payoffDate ? a : b)).payoffDate;
    const freed = ls.reduce((s, l) => s + l.loan.emi, 0);
    running -= freed;
    return {
      monthKey: k,
      date,
      label: label(date),
      loans: ls.map((l) => ({ name: l.loan.name, emi: l.loan.emi, color: l.loan.color })),
      freed,
      monthlyAfter: Math.max(0, running),
      monthsAway: Math.max(0, monthsBetween(startOfMonth(now), startOfMonth(date))),
    };
  });

  const freedomDate = activeLoans.length ? maxPayoff : null;
  const monthsToFreedom = freedomDate
    ? Math.max(0, monthsBetween(startOfMonth(now), startOfMonth(freedomDate)))
    : 0;

  const totalScheduledPayable = loans.reduce((s, l) => s + l.snapshotAmount, 0);
  const totalPaidSinceTracking = Math.max(0, totalScheduledPayable - totalRemaining);
  const portfolioProgress =
    totalScheduledPayable > 0 ? totalPaidSinceTracking / totalScheduledPayable : 0;
  const totalRemainingInstallments = loans.reduce((s, l) => s + l.remainingCount, 0);
  const avgEmi = activeLoans.length ? monthlyOutflow / activeLoans.length : 0;
  const biggest = activeLoans.reduce<LoanComputed | null>(
    (a, l) => (!a || l.remainingAmount > a.remainingAmount ? l : a),
    null,
  );

  return {
    now,
    loans,
    totalRemaining,
    monthlyOutflow,
    activeCount: activeLoans.length,
    nextPayment,
    dueThisMonthTotal,
    dueThisMonthRemaining,
    dueThisMonthPaid,
    timeline,
    milestones,
    freedomDate,
    monthsToFreedom,
    startMonthlyOutflow,
    avgEmi,
    totalScheduledPayable,
    totalPaidSinceTracking,
    portfolioProgress,
    totalRemainingInstallments,
    biggestLoanId: biggest?.loan.id ?? null,
  };
}
