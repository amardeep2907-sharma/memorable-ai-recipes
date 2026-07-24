import type { Config } from "tailwindcss";

// Design tokens for Memorable's visual identity: warm ink-on-paper cookbook
// feel rather than a generic SaaS palette. See DESIGN.md at the repo root.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F1E7",
        ink: "#241F1A",
        plum: { DEFAULT: "#7A2E3B", light: "#9C4655", dark: "#571F28" },
        sage: { DEFAULT: "#4A5D45", light: "#6B8064" },
        mustard: "#D9A441",
        line: "#E3DAC9",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      borderRadius: { card: "10px" },
    },
  },
  plugins: [],
};

export default config;
