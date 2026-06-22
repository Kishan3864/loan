"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, IndianRupee, ArrowRight, ShieldCheck } from "lucide-react";
import { Background } from "@/components/Background";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Incorrect password — please try again");
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-[100dvh] place-items-center px-5">
      <Background />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card w-full max-w-sm p-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 200 }}
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-info text-white shadow-card"
        >
          <IndianRupee size={26} />
        </motion.div>

        <h1 className="mt-5 text-center font-display text-xl font-bold text-ink">EMI Dashboard</h1>
        <p className="mt-1 text-center text-[13px] text-ink-mute">
          Sign in to view your debt & repayment analytics
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-10 text-[14px] text-ink outline-none transition placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink-soft"
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
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[14px] font-semibold text-white shadow-card transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />}
          </button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-faint">
          <ShieldCheck size={13} /> Private &amp; personal — only you can see this
        </p>
      </motion.div>
    </main>
  );
}
