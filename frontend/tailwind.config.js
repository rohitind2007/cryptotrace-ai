/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cyber-cyan": "#22d3ee",
        "cyber-rose": "#f43f5e",
        "cyber-bg": "#020617",
      },
      fontFamily: {
        heading: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
