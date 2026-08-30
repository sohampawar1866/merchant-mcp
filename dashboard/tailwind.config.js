/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blade: {
          navy: "#0c2340",
          navyDark: "#071426",
          navyLight: "#13355f",
          blue: "#0284c7",
          blueHover: "#0369a1",
          accent: "#2563eb",
          slate: "#f8fafc",
          surface: "#ffffff",
          card: "#ffffff",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
