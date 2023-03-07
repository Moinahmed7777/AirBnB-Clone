/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF385C",
        secondary: "#252525",
      },
    },
    screens: {
      lg: "1790px",
    },
  },
  plugins: [],
};
