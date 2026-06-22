// ════════════════════════════════════════════════════════════════
//  YOUR DATA  —  edit ONLY this file to keep the dashboard updated
// ════════════════════════════════════════════════════════════════
//
//  emi       = monthly instalment amount (₹)
//  dueDay    = day of the month the EMI is debited
//  remaining = how many EMIs are LEFT (as of the `asOf` date below)
//  asOf      = the date on which `remaining` was correct.
//              The dashboard counts forward from here automatically,
//              so as real months pass, your numbers update on their own.
//
//  When you pay off everything for a loan, set remaining: 0.
//  Add a new loan? Just copy a line and give it a unique `id`.

export type Loan = {
  id: string;
  name: string;
  short: string;
  emi: number;
  dueDay: number;
  remaining: number;
  asOf: string; // "YYYY-MM-DD"
  color: string;
  accent: string;
};

export const OWNER = {
  name: "Kishan",
  greetingName: "Kishan",
};

export const LOANS: Loan[] = [
  {
    id: "mobikwik",
    name: "MobiKwik",
    short: "MK",
    emi: 9847,
    dueDay: 5,
    remaining: 10,
    asOf: "2026-06-22",
    color: "#1a73e8", // Google blue
    accent: "#aecbfa",
  },
  {
    id: "kreditbee",
    name: "KreditBee",
    short: "KB",
    emi: 7460,
    dueDay: 8,
    remaining: 7,
    asOf: "2026-06-22",
    color: "#f9ab00", // Google yellow
    accent: "#fde293",
  },
  {
    id: "axis1",
    name: "Axis Bank CC #1",
    short: "AX1",
    emi: 1991,
    dueDay: 9,
    remaining: 48,
    asOf: "2026-06-22",
    color: "#d93025", // Google red
    accent: "#f6aea9",
  },
  {
    id: "axis2",
    name: "Axis Bank CC #2",
    short: "AX2",
    emi: 3687,
    dueDay: 9,
    remaining: 3,
    asOf: "2026-06-22",
    color: "#12b5cb", // Google teal
    accent: "#a1e4ec",
  },
  {
    id: "ring",
    name: "Ring",
    short: "RG",
    emi: 2969,
    dueDay: 24,
    remaining: 12,
    asOf: "2026-06-22",
    color: "#9334e6", // Google purple
    accent: "#d7aefb",
  },
];
