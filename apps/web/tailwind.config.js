/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F3F4F6', // Light gray background
        surface: '#FFFFFF', // White surface
        primary: '#0033A0', // UCE Cobalt Blue
        secondary: '#0055D4', // Lighter blue
        accent: '#F2A900', // UCE Gold/Yellow accent
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
