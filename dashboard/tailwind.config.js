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
        figma: {
          primary: "#000000",
          onPrimary: "#ffffff",
          ink: "#000000",
          canvas: "#ffffff",
          inverseCanvas: "#000000",
          inverseInk: "#ffffff",
          hairline: "#e6e6e6",
          hairlineSoft: "#f1f1f1",
          surfaceSoft: "#f7f7f5",
          lime: "#dceeb1",
          lilac: "#c5b0f4",
          cream: "#f4ecd6",
          pink: "#efd4d4",
          mint: "#c8e6cd",
          coral: "#f3c9b6",
          navy: "#1f1d3d",
          magenta: "#ff3d8b",
          success: "#1ea64a",
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        xs: "2px",
        sm: "6px",
        md: "8px",
        lg: "24px",
        xl: "32px",
        pill: "50px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};


