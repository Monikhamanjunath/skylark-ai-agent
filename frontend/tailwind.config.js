/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: "#090D16",
          surface: "#111726",
          hover: "#1A2236",
          card: "#131B2E"
        },
        border: {
          subtle: "#1E293B",
          accent: "#334155"
        },
        accent: {
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
          indigo: "#6366F1"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
