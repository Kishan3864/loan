"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Fingerprint } from "lucide-react";
import { Background } from "@/components/Background";
import { LogoMark } from "@/components/Logo";
import { biometricSupported, loginFingerprint } from "@/lib/webauthn-client";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    if (!biometricSupported()) return;
    fetch("/api/webauthn/available", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBioAvailable(!!d.available))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Incorrect password — please try again");
      setLoading(false);
    }
  }

  async function fingerprint() {
    setBioLoading(true);
    setError("");
    try {
      await loginFingerprint();
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Fingerprint login failed");
      setBioLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-[100dvh] place-items-center px-5">
      <Background />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="panel w-full max-w-sm p-8 shadow-lift"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto w-fit"
        >
          <LogoMark size={56} />
        </motion.div>

        <h1 className="mt-5 text-center font-display text-xl font-bold tracking-tight text-ink">
          EMI Dashboard
        </h1>
        <p className="mt-1 text-center text-[13px] text-ink-3">
          Sign in to view your debt &amp; repayment analytics
        </p>

        {bioAvailable && (
          <button
            onClick={fingerprint}
            disabled={bioLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-line-2 bg-white py-3 text-[14px] font-semibold text-ink transition hover:bg-paper active:scale-[0.99] disabled:opacity-50"
          >
            <Fingerprint size={18} className="text-accent" />
            {bioLoading ? "Waiting for fingerprint…" : "Unlock with fingerprint"}
          </button>
        )}

        {bioAvailable && (
          <div className="my-5 flex items-center gap-3 text-[11px] text-ink-4">
            <span className="h-px flex-1 bg-line" />
            OR PASSWORD
            <span className="h-px flex-1 bg-line" />
          </div>
        )}

        <form onSubmit={submit} className={bioAvailable ? "space-y-3" : "mt-6 space-y-3"}>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus={!bioAvailable}
              className="field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-4 hover:text-ink-2"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -5, 5, -3, 3, 0] }}
              className="text-center text-[13px] font-medium text-neg"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-[14px] font-semibold text-white transition hover:bg-black active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />}
          </button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-4">
          <ShieldCheck size={13} /> Private &amp; personal — auto-locks when idle
        </p>
      </motion.div>
    </main>
  );
}
