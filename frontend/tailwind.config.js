/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cyber-cyan": "#22d3ee",
        "cyber-rose": "#f43f5e",
        "cyber-violet": "#a78bfa",
        "cyber-amber": "#fbbf24",
        "cyber-bg": "#020617",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        /* Glow pulses now animate OPACITY only — no box-shadow repaints */
        "glow-pulse-cyan": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "glow-pulse-rose": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "glow-pulse-amber": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0px, 0)" },
          "50%": { transform: "translate3d(0, -20px, 0)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translate3d(0, 0px, 0)" },
          "50%": { transform: "translate3d(0, 20px, 0)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "row-flash": {
          "0%": { backgroundColor: "rgba(34,211,238,0.12)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "glow-cyan": "glow-pulse-cyan 3s ease-in-out infinite",
        "glow-rose": "glow-pulse-rose 2.5s ease-in-out infinite",
        "glow-amber": "glow-pulse-amber 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "scan-line": "scan-line 4s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        "float-reverse": "float-reverse 10s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "row-flash": "row-flash 2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
