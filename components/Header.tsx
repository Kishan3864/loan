"use client";

import { useRouter } from "next/navigation";
import { IndianRupee, LogOut, RefreshCw } from "lucide-react";

export function Header({ name, dateLabel }: { name: string; dateLabel: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-1 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-info text-white shadow-card">
            <IndianRupee size={20} />
          </div>
          <div>
            <h1 className="font-display text-[17px] font-bold leading-tight text-ink sm:text-lg">
              EMI Dashboard
            </h1>
            <p className="text-[12px] text-ink-mute">
              {name} · {dateLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-pos-soft px-2.5 py-1 text-[12px] font-semibold text-pos sm:inline-flex">
            <RefreshCw size={12} /> Live · auto-updates
          </span>
          <button
            onClick={logout}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink-soft transition hover:bg-canvas active:scale-95"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
