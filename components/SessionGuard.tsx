"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps an active session alive (sliding refresh) and auto-locks the app
 * after `autoLockMinutes` of no interaction — then forces re-login.
 */
export function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    let lockMs = 5 * 60 * 1000;
    let lastActivity = Date.now();
    let lastTouch = 0;
    let interval: ReturnType<typeof setInterval>;

    const touch = async () => {
      try {
        const r = await fetch("/api/session/touch", { method: "POST" });
        if (r.status === 401) {
          router.replace("/login");
          return;
        }
        const d = await r.json().catch(() => ({}));
        if (d?.autoLockMinutes) lockMs = d.autoLockMinutes * 60_000;
      } catch {
        /* offline — ignore */
      }
    };

    const onActivity = () => {
      lastActivity = Date.now();
      if (Date.now() - lastTouch > 60_000) {
        lastTouch = Date.now();
        touch();
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart", "visibilitychange"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    lastTouch = Date.now();
    touch();

    interval = setInterval(() => {
      if (Date.now() - lastActivity >= lockMs) {
        clearInterval(interval);
        fetch("/api/logout", { method: "POST" }).finally(() => router.replace("/login"));
      }
    }, 15_000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
