import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { babyPink: "#FFD6E8", cream: "#FFF8F0", lavender: "#E6D9FF", mint: "#D4F5E9", peach: "#FFE0CC", rose: "#FF6FA5", plum: "#2A1B3D" } } },
  plugins: []
} satisfies Config
