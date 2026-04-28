import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Age-friendly: generous sizing throughout
      fontSize: {
        // Override defaults to be larger
        sm: ["1rem", { lineHeight: "1.6" }],       // 16px — nothing smaller
        base: ["1.125rem", { lineHeight: "1.7" }], // 18px
        lg: ["1.25rem", { lineHeight: "1.6" }],    // 20px
        xl: ["1.5rem", { lineHeight: "1.5" }],     // 24px
        "2xl": ["1.75rem", { lineHeight: "1.4" }], // 28px
        "3xl": ["2.125rem", { lineHeight: "1.3" }],// 34px
        "4xl": ["2.5rem", { lineHeight: "1.2" }],  // 40px
        "hebrew": ["2rem", { lineHeight: "1.5" }], // 32px — Hebrew words
        "hebrew-lg": ["2.75rem", { lineHeight: "1.4" }], // 44px — card front
      },
      // Calm, personal colour palette
      colors: {
        sand: {
          50: "#fdf8f0",
          100: "#f9eedb",
          200: "#f2d9b0",
          300: "#e8be7e",
          400: "#dca050",
          500: "#c8853a",
          600: "#a96a2a",
          700: "#875220",
          800: "#6b3f1a",
          900: "#583417",
        },
        sky: {
          50: "#f0f7ff",
          100: "#dceeff",
          200: "#b3d8ff",
          300: "#7ab9ff",
          400: "#3d91f5",
          500: "#1a6fd4",
          600: "#1257ad",
          700: "#0f428a",
          800: "#0d3370",
          900: "#0b2a5c",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e4ede3",
          200: "#c6d9c4",
          300: "#9cbe9a",
          400: "#6d9e6a",
          500: "#4d7f4a",
          600: "#3a653a",
          700: "#2e502e",
          800: "#264026",
          900: "#1f351f",
        },
        cream: "#fdfaf5",
      },
      // Touch-friendly minimum tap targets
      minHeight: {
        "touch": "48px",
        "touch-lg": "64px",
      },
      minWidth: {
        "touch": "48px",
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        hebrew: ["var(--font-hebrew)", "Arial Hebrew", "David", "serif"],
      },
      boxShadow: {
        "card": "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      },
      animation: {
        "flip-in": "flipIn 0.35s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        flipIn: {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
