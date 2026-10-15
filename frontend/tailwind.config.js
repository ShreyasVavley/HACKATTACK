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
        'clay-sm': '16px',
        'clay': '24px',
        'clay-lg': '32px',
        'clay-full': '9999px',
      },
      boxShadow: {
        'clay-card': '12px 16px 32px rgba(22, 23, 27, 0.07), -8px -8px 24px rgba(255, 255, 255, 0.95), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -3px -3px 6px rgba(22, 23, 27, 0.04)',
        'clay-card-hover': '16px 22px 38px rgba(22, 23, 27, 0.11), -10px -10px 28px rgba(255, 255, 255, 1), inset 2px 2px 4px rgba(255, 255, 255, 0.9), inset -4px -4px 8px rgba(22, 23, 27, 0.05)',
        'clay-btn': '6px 8px 18px rgba(220, 38, 38, 0.35), -4px -4px 14px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 5px rgba(0, 0, 0, 0.25)',
        'clay-btn-hover': '8px 12px 22px rgba(220, 38, 38, 0.45), -5px -5px 16px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 6px rgba(0, 0, 0, 0.3)',
        'clay-btn-active': '2px 3px 8px rgba(220, 38, 38, 0.3), inset 3px 3px 6px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.2)',
        'clay-inset': 'inset 4px 4px 8px rgba(22, 23, 27, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 0.95)',
        'clay-pill': '4px 6px 14px rgba(22, 23, 27, 0.05), -3px -3px 10px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 3px rgba(22, 23, 27, 0.03)',
      }
    },
  },
  plugins: [],
}
