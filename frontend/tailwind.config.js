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
        "glow-pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(34,211,238,0.15), 0 0 24px rgba(34,211,238,0.05)" },
          "50%": { boxShadow: "0 0 16px rgba(34,211,238,0.3), 0 0 48px rgba(34,211,238,0.1)" },
        },
        "glow-pulse-rose": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(244,63,94,0.2), 0 0 24px rgba(244,63,94,0.05)" },
          "50%": { boxShadow: "0 0 20px rgba(244,63,94,0.4), 0 0 56px rgba(244,63,94,0.15)" },
        },
        "glow-pulse-amber": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(251,191,36,0.15), 0 0 24px rgba(251,191,36,0.05)" },
          "50%": { boxShadow: "0 0 16px rgba(251,191,36,0.3), 0 0 48px rgba(251,191,36,0.1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0px) scale(1.05)" },
          "50%": { transform: "translateY(20px) scale(1)" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        "row-flash": {
          "0%": { backgroundColor: "rgba(34,211,238,0.15)" },
          "100%": { backgroundColor: "transparent" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "glow-cyan": "glow-pulse-cyan 3s ease-in-out infinite",
        "glow-rose": "glow-pulse-rose 2.5s ease-in-out infinite",
        "glow-amber": "glow-pulse-amber 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "scan-line": "scan-line 3s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        "float-reverse": "float-reverse 10s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "row-flash": "row-flash 2s ease-out forwards",
        "gradient-shift": "gradient-shift 6s ease infinite",
      },
    },
  },
  plugins: [],
};
