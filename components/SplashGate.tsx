"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark } from "./Logo";

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1150);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] grid place-items-center bg-white"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.82, opacity: 0, y: 6 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <LogoMark size={68} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
                className="mt-5 font-display text-lg font-bold tracking-tight text-ink"
              >
                EMI Dashboard
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.34, duration: 0.4 }}
                className="eyebrow mt-1.5"
              >
                Debt &amp; repayment analytics
              </motion.div>
              <div className="mt-7 h-[3px] w-32 overflow-hidden rounded-full bg-line">
                <motion.div
                  initial={{ x: "-110%" }}
                  animate={{ x: "210%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="h-full w-1/2 rounded-full bg-accent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
