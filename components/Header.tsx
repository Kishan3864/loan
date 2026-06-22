"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, SlidersHorizontal } from "lucide-react";
import { LogoMark } from "./Logo";

export function Header({ name, dateLabel }: { name: string; dateLabel: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-2 border-b border-line bg-white/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoMark size={38} />
          <div className="leading-tight">
            <h1 className="font-display text-[16px] font-bold tracking-tight text-ink">
              EMI Dashboard
            </h1>
            <p className="text-[12px] text-ink-3">
              {name} · {dateLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-2 transition hover:border-line-2 hover:text-ink active:scale-95"
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] font-medium text-ink-2 transition hover:border-line-2 hover:text-ink active:scale-95"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </div>
    </header>
  );
}
