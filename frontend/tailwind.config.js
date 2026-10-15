/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalism Theme Palette
        ivory: {
          DEFAULT: '#FDFBF7',
          50: '#FFFFFF',
          100: '#FAF7F2',
          200: '#F4EFE6',
          300: '#ECE4D4',
          400: '#DFD4BE',
        },
        charcoal: {
          DEFAULT: '#121316',
          900: '#121316',
          800: '#1E2025',
          700: '#2B2E35',
          600: '#3D414A',
          muted: '#525763',
        },
        scarlet: {
          DEFAULT: '#2563EB', // Electric Scarlet/Cobalt Royal Blue
          dark: '#1D4ED8',
          light: '#3B82F6',
          vibrant: '#1E40AF',
          accent: '#60A5FA',
        },
        neo: {
          yellow: '#FFDE59',
          amber: '#F59E0B',
          green: '#10B981',
          coral: '#F43F5E',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #121316',
        'neo': '4px 4px 0px 0px #121316',
        'neo-lg': '6px 6px 0px 0px #121316',
        'neo-xl': '8px 8px 0px 0px #121316',
        'neo-blue': '4px 4px 0px 0px #2563EB',
        'neo-hover': '1px 1px 0px 0px #121316',
      },
      borderWidth: {
        'neo': '2.5px',
        'neo-thick': '3.5px',
      }
    },
  },
  plugins: [],
}
