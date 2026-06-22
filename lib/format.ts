const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function rupee(n: number) {
  return "₹" + inr.format(Math.round(n));
}

/** Short Indian format: 2.93 L, 25.9k, 1.2 Cr */
export function rupeeShort(n: number) {
  const abs = Math.abs(n);
  if (abs >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (abs >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
  if (abs >= 1000) return "₹" + (n / 1000).toFixed(1) + "k";
  return "₹" + inr.format(Math.round(n));
}

const MON = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MON_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(d: Date) {
  return `${MON[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}
export function fullMonth(d: Date) {
  return `${MON_FULL[d.getMonth()]} ${d.getFullYear()}`;
}
export function dateLabel(d: Date) {
  const ord = (n: number) => {
    if (n > 3 && n < 21) return "th";
    return ["th", "st", "nd", "rd"][n % 10] || "th";
  };
  return `${d.getDate()}${ord(d.getDate())} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}
export function todayLabel(d: Date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[d.getDay()]}, ${dateLabel(d)}`;
}
