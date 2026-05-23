/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#09090b',       /* Canvas - comfortable deep zinc */
        darkPanel: '#18181b',    /* Panel/Cards - slightly lighter zinc */
        darkHeader: '#202023',   /* Header background */
        darkBorder: '#2e2e33',   /* Soft grey border */
        darkBorderFocus: '#3b82f6', /* Crisp active blue border */
        brandBlue: '#3b82f6',    /* Flat action blue */
        brandGreen: '#10b981',   /* Soft green for success/Easy status */
        brandAmber: '#f59e0b',   /* Soft amber for pending/Medium status */
        brandRed: '#ef4444',     /* Soft red for rejected/Hard status */
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
