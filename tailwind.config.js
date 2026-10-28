/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: "#1B2A5C", deep: "#0E1530" }, // indigo de Bamako / nuit
        ocre: "#E0A030", // boutons de commande
        brule: "#9A5B0C", // prix sur fond clair
        paper: "#F5F6FA",
        brume: "#E3E6EF",
      },
      fontFamily: {
        sans: ["var(--font-main)", "system-ui", "sans-serif"],
        titre: ["var(--font-titre)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
