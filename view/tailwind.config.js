/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./assets/js/**/*.js"],
    theme: {
      extend: {
        colors: {
          primary: "#0096C7",
          secondary: "#00B894",
          info: "#0096C7",
          warning: "#F9A826",
          danger: "#E63946",
          surface: "#FFFFFF",
          textmain: "#1E293B",
          border: "#E2E8F0",
          bgpage: "#F8FAFC",
        },
        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
        },
        container: {
          center: true,
          padding: "1rem",
        },
        boxShadow: {
          card: "0 2px 8px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    plugins: [],
  };
  