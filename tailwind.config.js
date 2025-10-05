/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      colors: {
        'game-bg': '#0f172a',
        'game-road': '#1e293b',
        'game-accent': '#3b82f6',
      },
    },
  },
  plugins: [],
}
