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
        // Claymorphism Palette: Ivory, Charcoal Black, Scarlet Blue
        ivory: {
          DEFAULT: '#F8F6F0',
          50: '#FFFFFF',
          100: '#FAF8F4',
          200: '#F3EFE6',
          300: '#EAE3D4',
          400: '#DFD5C2',
          card: '#FCFAF6',
        },
        charcoal: {
          DEFAULT: '#14161C',
          900: '#101217',
          800: '#181B22',
          700: '#232731',
          600: '#343A48',
          muted: '#626A7C',
        },
        scarlet: {
          DEFAULT: '#2563EB', // Vivid Scarlet Royal Blue
          dark: '#1D4ED8',
          light: '#3B82F6',
          glow: '#60A5FA',
          soft: '#EFF6FF',
        },
        clay: {
          emerald: '#10B981',
          rose: '#F43F5E',
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
        // Multi-layered 3D Soft Inflated Clay Shadows
        'clay-card': '12px 16px 32px rgba(20, 22, 28, 0.08), -8px -8px 24px rgba(255, 255, 255, 0.95), inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -3px -3px 6px rgba(20, 22, 28, 0.05)',
        'clay-card-hover': '16px 22px 38px rgba(20, 22, 28, 0.12), -10px -10px 28px rgba(255, 255, 255, 1), inset 2px 2px 4px rgba(255, 255, 255, 0.9), inset -4px -4px 8px rgba(20, 22, 28, 0.06)',
        'clay-btn': '6px 8px 18px rgba(37, 99, 235, 0.35), -4px -4px 14px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 5px rgba(0, 0, 0, 0.25)',
        'clay-btn-hover': '8px 12px 22px rgba(37, 99, 235, 0.45), -5px -5px 16px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(255, 255, 255, 0.5), inset -3px -3px 6px rgba(0, 0, 0, 0.3)',
        'clay-btn-active': '2px 3px 8px rgba(37, 99, 235, 0.3), inset 3px 3px 6px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.2)',
        'clay-inset': 'inset 4px 4px 8px rgba(20, 22, 28, 0.07), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
        'clay-pill': '4px 6px 14px rgba(20, 22, 28, 0.06), -3px -3px 10px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 3px rgba(20, 22, 28, 0.04)',
      }
    },
  },
  plugins: [],
}
