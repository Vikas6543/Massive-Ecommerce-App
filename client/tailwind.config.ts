// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5", // bg-primary
          hover: "#4338CA", // bg-primary-hover
          light: "#EEF2FF", // bg-primary-light
          foreground: "#FFFFFF", // text-primary-foreground
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
