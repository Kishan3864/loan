import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Text"', "Roboto", "system-ui", "-apple-system", "sans-serif"],
        display: ['"Google Sans"', '"Google Sans Text"', "Roboto", "system-ui", "sans-serif"],
        mono: ['"Roboto Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        canvas: "#f6f8fc",
        surface: "#ffffff",
        line: "#e1e3e6",
        "line-soft": "#eceef1",
        ink: "#202124",
        "ink-soft": "#3c4043",
        "ink-mute": "#5f6368",
        "ink-faint": "#80868b",
        brand: "#1a73e8",
        "brand-soft": "#e8f0fe",
        pos: "#188038",
        "pos-soft": "#e6f4ea",
        warn: "#e37400",
        "warn-soft": "#fef7e0",
        neg: "#d93025",
        "neg-soft": "#fce8e6",
        info: "#9334e6",
        "info-soft": "#f3e8fd",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(60,64,67,.10), 0 1px 3px 1px rgba(60,64,67,.05)",
        "card-hover": "0 1px 3px 0 rgba(60,64,67,.16), 0 4px 8px 3px rgba(60,64,67,.08)",
        pop: "0 2px 6px 2px rgba(60,64,67,.12), 0 1px 2px rgba(60,64,67,.16)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "rise-in": "rise-in .5s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
