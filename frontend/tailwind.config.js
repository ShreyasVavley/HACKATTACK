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
        // Theme: Ivory, Charcoal Black, Scarlet Red
        ivory: {
          DEFAULT: '#FAF8F5',
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EAE2D8',
          400: '#DCD1C2',
          card: '#FFFFFF',
        },
        charcoal: {
          DEFAULT: '#16171B',
          900: '#111215',
          800: '#181A20',
          700: '#23262F',
          600: '#353945',
          muted: '#636878',
        },
        scarlet: {
          DEFAULT: '#DC2626', // Vibrant Scarlet Red
          dark: '#B91C1C',
          light: '#EF4444',
          glow: '#F87171',
          soft: '#FEF2F2',
          deep: '#991B1B',
        },
        clay: {
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        }
      },
      borderRadius: {
        'clay-sm': '8px',
        'clay': '12px',
        'clay-lg': '16px',
        'clay-full': '9999px',
      },
      boxShadow: {
        'clay-card': '0 4px 16px rgba(22, 23, 27, 0.05), 0 1px 3px rgba(22, 23, 27, 0.03)',
        'clay-card-hover': '0 8px 24px rgba(22, 23, 27, 0.08), 0 2px 6px rgba(22, 23, 27, 0.04)',
        'clay-btn': '0 2px 8px rgba(220, 38, 38, 0.18), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'clay-btn-hover': '0 4px 12px rgba(220, 38, 38, 0.25), 0 2px 4px rgba(0, 0, 0, 0.08)',
        'clay-btn-active': '0 1px 4px rgba(220, 38, 38, 0.15)',
        'clay-inset': 'inset 0 1px 3px rgba(22, 23, 27, 0.06)',
        'clay-pill': '0 1px 4px rgba(22, 23, 27, 0.05)',
      }
    },
  },
  plugins: [],
}
