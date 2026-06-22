import { NextResponse } from "next/server";
import { getStore, updateStore } from "@/lib/store";
import { LOAN_PALETTE, type Loan } from "@/lib/data";
import { authed } from "@/lib/route-helpers";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "loan"
  );
}

function deriveShort(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "LN";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sanitize(body: any): Partial<Loan> {
  const out: Partial<Loan> = {};
  if (body.name != null) out.name = String(body.name).slice(0, 40);
  if (body.short != null && String(body.short).trim()) out.short = String(body.short).slice(0, 4).toUpperCase();
  if (body.emi != null) out.emi = Math.max(0, Math.round(Number(body.emi) || 0));
  if (body.dueDay != null) out.dueDay = Math.min(31, Math.max(1, Math.round(Number(body.dueDay) || 1)));
  if (body.remaining != null) out.remaining = Math.max(0, Math.round(Number(body.remaining) || 0));
  if (body.asOf != null && /^\d{4}-\d{2}-\d{2}$/.test(String(body.asOf))) out.asOf = String(body.asOf);
  if (body.color != null && /^#[0-9a-fA-F]{6}$/.test(String(body.color))) out.color = String(body.color);
  return out;
}

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const fields = sanitize(body);
  if (!fields.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const store = await getStore();
  let id = slugify(fields.name);
  const taken = new Set(store.loans.map((l) => l.id));
  if (taken.has(id)) {
    let i = 2;
    while (taken.has(`${id}-${i}`)) i++;
    id = `${id}-${i}`;
  }
  const pal = LOAN_PALETTE[store.loans.length % LOAN_PALETTE.length];
  const loan: Loan = {
    id,
    name: fields.name,
    short: fields.short || deriveShort(fields.name),
    emi: fields.emi ?? 0,
    dueDay: fields.dueDay ?? 1,
    remaining: fields.remaining ?? 0,
    asOf: fields.asOf || todayISO(),
    color: fields.color || pal.color,
    accent: pal.accent,
  };
  await updateStore((s) => {
    s.loans.push(loan);
  });
  return NextResponse.json({ ok: true, loan });
}

export async function PUT(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  const fields = sanitize(body);

  const store = await getStore();
  const exists = store.loans.some((l) => l.id === id);
  if (!exists) return NextResponse.json({ error: "Loan not found" }, { status: 404 });

  await updateStore((s) => {
    const l = s.loans.find((x) => x.id === id)!;
    Object.assign(l, fields);
    if (fields.name && !body.short) l.short = l.short || deriveShort(fields.name);
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  await updateStore((s) => {
    s.loans = s.loans.filter((l) => l.id !== id);
  });
  return NextResponse.json({ ok: true });
}
