/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#6B21A8",      // Primary Royal Purple
          lightPurple: "#F3E8FF", // Soft Purple for highlights & subtle backgrounds
          pink: "#EC4899",        // Accent Blush Pink for CTAs & hover effects
          lightPink: "#FCE7F3",   // Soft Pink for badges
          navy: "#0F172A",        // Deep Indigo/Blue for primary text & dark structural accents
          canvas: "#FAF8FC",      // Subtle off-white background with a hint of purple
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};