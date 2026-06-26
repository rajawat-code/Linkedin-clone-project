/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linkedin: {
          blue: '#0a66c2',
          'blue-hover': '#004182',
          light: '#f3f2f0',
          dark: '#1d2226',
          border: '#e0e0e0',
          text: '#191919',
          muted: '#666666',
        }
      }
    },
  },
  plugins: [],
}
