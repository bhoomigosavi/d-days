import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#b9c7e4",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#b9c7e4",
        "on-primary": "#233148",
        "primary-container": "#0a192f",
        "on-primary-container": "#74829d",
        "inverse-primary": "#515f78",
        
        "secondary": "#b6c6ed",
        "secondary-fixed": "#d8e2ff",
        "secondary-fixed-dim": "#b6c6ed",
        "on-secondary": "#20304f",
        "secondary-container": "#374767",
        "on-secondary-container": "#a5b5db",
        
        "tertiary": "#bdc7d9",
        "tertiary-fixed": "#d9e3f6",
        "tertiary-fixed-dim": "#bdc7d9",
        "on-tertiary": "#27313f",
        "tertiary-container": "#101a27",
        "on-tertiary-container": "#798394",

        "surface": "#08132a",
        "surface-dim": "#08132a",
        "surface-bright": "#2f3952",
        "surface-variant": "#2a344d",
        "surface-container-lowest": "#030d25",
        "surface-container-low": "#101b33",
        "surface-container": "#151f37",
        "surface-container-high": "#1f2942",
        "surface-container-highest": "#2a344d",
        "surface-tint": "#b9c7e4",

        "on-surface": "#d9e2ff",
        "on-surface-variant": "#c5c6cd",
        "inverse-surface": "#d9e2ff",
        "inverse-on-surface": "#263049",

        "background": "#08132a",
        "on-background": "#d9e2ff",

        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",

        "outline": "#8f9097",
        "outline-variant": "#44474d",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Inter", "monospace"],
      },
      animation: {
        "subtle-pulse": "subtle-pulse 3s infinite ease-in-out",
        "radar-sweep": "radar-sweep 4s linear infinite",
        "drift-flow": "drift-flow 2s ease-in-out infinite",
      },
      keyframes: {
        "subtle-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.8" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "drift-flow": {
          "0%, 100%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

