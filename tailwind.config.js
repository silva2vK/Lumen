
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        scifi: ['Orbitron', 'sans-serif'],
        admin_sci_fi: ['Orbitron', 'sans-serif'],
        epic: ['Cinzel', 'serif'],
        gothic: ['Cinzel Decorative', 'serif'],
        japanese: ['Sawarabi Mincho', 'serif'],
        modern: ['Space Grotesk', 'sans-serif'],
        // Novos Perfis
        typewriter: ['Special Elite', 'monospace'],
        code: ['Fira Code', 'monospace'],
        cute: ['Fredoka', 'sans-serif'],
        executive: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: 'rgb(var(--brand-rgb) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}
