import type { Config } from "tailwindcss";

// Color values live in src/app/globals.css as CSS variables.
const config: Config = {
  theme: {
    extend: {
      colors: {
        stone: "var(--stone)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        ink2: "var(--ink2)",
        taupe: "var(--taupe)",
        line: "var(--line)",
        good: "var(--good)",
        warn: "var(--warn)",
        crit: "var(--crit)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
};

export default config;
