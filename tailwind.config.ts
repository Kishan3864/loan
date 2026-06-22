import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        canvas: "#ffffff",
        paper: "#fafafa",
        line: "#ededed",
        "line-2": "#e3e3e3",
        ink: "#0a0a0a",
        "ink-2": "#5c5c5c",
        "ink-3": "#8e8e93",
        "ink-4": "#b3b3b8",
        accent: "#2f5bff",
        "accent-weak": "#eef2ff",
        pos: "#0a7d2c",
        "pos-weak": "#e7f4ea",
        neg: "#c8281c",
        "neg-weak": "#fdeceb",
        warn: "#9a5b00",
        "warn-weak": "#f9f0df",
        info: "#6a3fd6",
        "info-weak": "#efeaff",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04)",
        lift: "0 6px 24px rgba(10,10,10,0.08)",
        pop: "0 12px 40px rgba(10,10,10,0.14)",
      },
      borderRadius: {
        xl2: "16px",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "rise-in": "rise-in .5s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in .4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
