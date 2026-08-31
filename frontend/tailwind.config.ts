import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12203D",
          50: "#EEF1F6",
          100: "#D8DEEA",
          400: "#4C5E82",
          700: "#1B2C4F",
          900: "#0E1420",
        },
        surface: {
          DEFAULT: "#F7F8FA",
          dark: "#0E1420",
          card: "#FFFFFF",
          cardDark: "#161F30",
        },
        emerald: {
          DEFAULT: "#0F9D74",
          50: "#E4F7F0",
          600: "#0C7F5D",
        },
        gold: {
          DEFAULT: "#D9A441",
        },
        danger: {
          DEFAULT: "#D64545",
        },
        violet: {
          DEFAULT: "#7C6BD9",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 32, 61, 0.06), 0 8px 24px -12px rgba(18, 32, 61, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
