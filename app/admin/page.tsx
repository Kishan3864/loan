"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  KeyRound,
  Timer,
  Fingerprint,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Check,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Background } from "@/components/Background";
import { LogoMark } from "@/components/Logo";
import { SessionGuard } from "@/components/SessionGuard";
import { biometricSupported, registerFingerprint } from "@/lib/webauthn-client";
import { rupee } from "@/lib/format";
import type { Loan } from "@/lib/data";

type Cred = { id: string; name: string; createdAt: string };
const LOCK_OPTIONS = [1, 2, 3, 5, 10, 15, 30, 60];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Section({ icon: Icon, title, desc, children }: any) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3 border-b border-line pb-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper text-ink-2">
          <Icon size={17} />
        </span>
        <div>
          <h2 className="font-display text-[15px] font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-3">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Toast({ msg }: { msg: { kind: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-[13px] font-semibold shadow-pop ${
        msg.kind === "ok" ? "bg-ink text-white" : "bg-neg text-white"
      }`}
    >
      {msg.text}
    </motion.div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [autoLock, setAutoLock] = useState(5);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const flash = useCallback((kind: "ok" | "err", text: string) => {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 2600);
  }, []);

  const load = useCallback(async () => {
    const r = await fetch("/api/loans", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setLoans(d.loans ?? []);
      setAutoLock(d.settings?.autoLockMinutes ?? 5);
    }
    const c = await fetch("/api/webauthn/credentials", { cache: "no-store" });
    if (c.ok) setCreds((await c.json()).credentials ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ---- password ---- */
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return flash("err", "New passwords do not match");
    setPwLoading(true);
    const r = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pw.cur, newPassword: pw.next }),
    });
    setPwLoading(false);
    if (r.ok) {
      setPw({ cur: "", next: "", confirm: "" });
      flash("ok", "Password updated");
    } else {
      flash("err", (await r.json().catch(() => ({}))).error || "Could not update");
    }
  }

  /* ---- auto-lock ---- */
  async function saveLock(mins: number) {
    setAutoLock(mins);
    const r = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoLockMinutes: mins }),
    });
    flash(r.ok ? "ok" : "err", r.ok ? `Auto-lock set to ${mins} min` : "Could not save");
  }

  /* ---- fingerprint ---- */
  const [bioSupported, setBioSupported] = useState(false);
  useEffect(() => setBioSupported(biometricSupported()), []);
  async function addFingerprint() {
    try {
      await registerFingerprint(navigator.platform || "This device");
      flash("ok", "Fingerprint added");
      load();
    } catch (e: any) {
      flash("err", e?.message || "Could not add fingerprint");
    }
  }
  async function removeCred(id: string) {
    const r = await fetch("/api/webauthn/credentials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (r.ok) {
      flash("ok", "Removed");
      load();
    }
  }

  /* ---- loans ---- */
  const blank = { id: "", name: "", emi: "", dueDay: "", remaining: "", asOf: todayISO(), color: "#2f5bff" };
  const [form, setForm] = useState<any>(null); // null = closed
  function openAdd() {
    setForm({ ...blank });
  }
  function openEdit(l: Loan) {
    setForm({ id: l.id, name: l.name, emi: String(l.emi), dueDay: String(l.dueDay), remaining: String(l.remaining), asOf: l.asOf, color: l.color });
  }
  async function saveLoan(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      id: form.id || undefined,
      name: form.name,
      emi: Number(form.emi),
      dueDay: Number(form.dueDay),
      remaining: Number(form.remaining),
      asOf: form.asOf,
      color: form.color,
    };
    const r = await fetch("/api/admin/loans", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.ok) {
      setForm(null);
      flash("ok", form.id ? "Loan updated" : "Loan added");
      load();
    } else {
      flash("err", (await r.json().catch(() => ({}))).error || "Could not save loan");
    }
  }
  async function deleteLoan(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const r = await fetch("/api/admin/loans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (r.ok) {
      flash("ok", "Loan deleted");
      load();
    }
  }

  async function lock() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <main className="relative min-h-[100dvh] px-4 py-5 sm:px-6">
      <Background />
      <SessionGuard />
      <Toast msg={msg} />

      <div className="mx-auto max-w-3xl space-y-4 pb-12">
        {/* header */}
        <header className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <h1 className="font-display text-[16px] font-bold tracking-tight text-ink">Admin</h1>
              <p className="text-[12px] text-ink-3">Manage security &amp; your loans</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-2 hover:text-ink">
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <button onClick={lock} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-2 hover:text-ink">
              <Lock size={15} />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </header>

        {/* change password */}
        <Section icon={KeyRound} title="Password" desc="Change the password used to sign in">
          <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-3">
            <input className="field" type="password" placeholder="Current password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} />
            <input className="field" type="password" placeholder="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            <input className="field" type="password" placeholder="Confirm new" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            <div className="sm:col-span-3">
              <button disabled={pwLoading || !pw.cur || !pw.next} className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50">
                <Check size={15} /> {pwLoading ? "Saving…" : "Update password"}
              </button>
            </div>
          </form>
        </Section>

        {/* fingerprint */}
        <Section icon={Fingerprint} title="Fingerprint unlock" desc="Use your device biometrics to sign in instantly">
          {!bioSupported ? (
            <p className="text-[13px] text-ink-3">This browser doesn’t support biometric login.</p>
          ) : (
            <>
              <div className="space-y-2">
                {creds.length === 0 && (
                  <p className="text-[13px] text-ink-3">No devices enrolled yet. Add one below — on your phone you’ll be asked for your fingerprint/face.</p>
                )}
                {creds.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Fingerprint size={17} className="text-accent" />
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{c.name}</p>
                        <p className="num text-[11px] text-ink-4">added {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => removeCred(c.id)} className="rounded-lg p-2 text-ink-3 hover:bg-neg-weak hover:text-neg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addFingerprint} className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line-2 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-paper">
                <Plus size={15} /> Add this device
              </button>
            </>
          )}
        </Section>

        {/* auto-lock */}
        <Section icon={Timer} title="Auto-lock" desc="Require login again after this much inactivity">
          <div className="flex flex-wrap gap-2">
            {LOCK_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => saveLock(m)}
                className={`num rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition ${
                  autoLock === m ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-line-2"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </Section>

        {/* loans */}
        <Section icon={Wallet} title="Loans" desc="Add, edit or remove your EMIs — the dashboard updates instantly">
          <div className="space-y-2">
            {loans.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                <span className="h-7 w-7 shrink-0 rounded-md" style={{ background: l.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{l.name}</p>
                  <p className="num text-[11.5px] text-ink-3">
                    {rupee(l.emi)} × {l.remaining} = {rupee(l.emi * l.remaining)} · due {l.dueDay}
                  </p>
                </div>
                <button onClick={() => openEdit(l)} className="rounded-lg p-2 text-ink-3 hover:bg-paper hover:text-ink">
                  <Pencil size={15} />
                </button>
                <button onClick={() => deleteLoan(l.id, l.name)} className="rounded-lg p-2 text-ink-3 hover:bg-neg-weak hover:text-neg">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {form ? (
            <form onSubmit={saveLoan} className="mt-4 rounded-xl border border-line-2 bg-paper p-4">
              <p className="eyebrow mb-3">{form.id ? "Edit loan" : "New loan"}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="eyebrow">Lender name</span>
                  <input className="field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. HDFC Personal Loan" required />
                </label>
                <label className="block">
                  <span className="eyebrow">Monthly EMI (₹)</span>
                  <input className="field mt-1" type="number" min="0" value={form.emi} onChange={(e) => setForm({ ...form, emi: e.target.value })} required />
                </label>
                <label className="block">
                  <span className="eyebrow">Due day (1–31)</span>
                  <input className="field mt-1" type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} required />
                </label>
                <label className="block">
                  <span className="eyebrow">Installments left</span>
                  <input className="field mt-1" type="number" min="0" value={form.remaining} onChange={(e) => setForm({ ...form, remaining: e.target.value })} required />
                </label>
                <label className="block">
                  <span className="eyebrow">Counting from (as of)</span>
                  <input className="field mt-1" type="date" value={form.asOf} onChange={(e) => setForm({ ...form, asOf: e.target.value })} required />
                </label>
                <label className="block">
                  <span className="eyebrow">Colour</span>
                  <input className="mt-1 h-[42px] w-full cursor-pointer rounded-[10px] border border-line-2 bg-white p-1" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-white">
                  <Check size={15} /> {form.id ? "Save changes" : "Add loan"}
                </button>
                <button type="button" onClick={() => setForm(null)} className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold text-ink-2 hover:bg-paper">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={openAdd} className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-line-2 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-paper">
              <Plus size={15} /> Add a loan
            </button>
          )}
        </Section>

        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11.5px] text-ink-4">
          <ShieldCheck size={13} /> All data stays private on your own server
        </p>
      </div>
    </main>
  );
}
