import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        prep: {
          red:    "#C94B2A",
          green:  "#1A8F68",
          blue:   "#1556A0",
          purple: "#4B3EB5",
          orange: "#B06B0F",
          jad:    "#8B2FC9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
