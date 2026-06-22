// ════════════════════════════════════════════════════════════════
//  DEFAULT DATA  —  used only to seed the store on first run.
//  After that, loans are managed from the in-app Admin panel and
//  stored on the server (server-data/store.json).
// ════════════════════════════════════════════════════════════════

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

// Refined editorial palette assigned to loans (cycled when adding new ones)
export const LOAN_PALETTE = [
  { color: "#2f5bff", accent: "#c7d4ff" }, // electric blue (accent)
  { color: "#e0a100", accent: "#f6e0a0" }, // amber
  { color: "#e0533d", accent: "#f5c2b8" }, // coral
  { color: "#00a389", accent: "#a9e6da" }, // teal
  { color: "#7c5cff", accent: "#d6cbff" }, // violet
  { color: "#0a0a0a", accent: "#bdbdbd" }, // ink
  { color: "#c026d3", accent: "#f0bdf6" }, // magenta
];

export const DEFAULT_LOANS: Loan[] = [
  { id: "mobikwik", name: "MobiKwik", short: "MK", emi: 9847, dueDay: 5, remaining: 10, asOf: "2026-06-22", color: "#2f5bff", accent: "#c7d4ff" },
  { id: "kreditbee", name: "KreditBee", short: "KB", emi: 7460, dueDay: 8, remaining: 7, asOf: "2026-06-22", color: "#e0a100", accent: "#f6e0a0" },
  { id: "axis1", name: "Axis Bank CC #1", short: "AX1", emi: 1991, dueDay: 9, remaining: 48, asOf: "2026-06-22", color: "#e0533d", accent: "#f5c2b8" },
  { id: "axis2", name: "Axis Bank CC #2", short: "AX2", emi: 3687, dueDay: 9, remaining: 3, asOf: "2026-06-22", color: "#00a389", accent: "#a9e6da" },
  { id: "ring", name: "Ring", short: "RG", emi: 2969, dueDay: 24, remaining: 12, asOf: "2026-06-22", color: "#7c5cff", accent: "#d6cbff" },
];
