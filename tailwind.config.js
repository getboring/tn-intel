/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tn: {
          blue: "#003366",
          gold: "#C8A25C",
          red: "#CC0000",
        },
      },
    },
  },
  plugins: [],
};
