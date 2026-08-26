/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF0FF",
          100: "#E0E4FF",
          400: "#7C7FEF",
          500: "#5B5FEF",
          600: "#4F46E5",
          700: "#4338CA",
        },
        surface: "#F6F7FB",
        ink: "#0F1222",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 18, 34, 0.04), 0 8px 24px rgba(15, 18, 34, 0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};