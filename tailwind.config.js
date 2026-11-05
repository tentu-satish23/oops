/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oracle: {
          bg: '#0B1120',
          secondary: '#151F32',
          card: '#1B263B',
          hover: '#24324D',
          border: '#1E293B',
          orange: '#F89820',
          'orange-glow': '#FFA733',
          blue: '#3B82F6',
          green: '#22C55E',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
          darkest: '#070C16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px rgba(248, 152, 32, 0.35)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.35)',
        'glow-green': '0 0 25px rgba(34, 197, 94, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'steam': 'steam 4s ease-in-out infinite',
      },
      keyframes: {
        steam: {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-15px) scaleX(1.15)', opacity: '0.4' },
          '100%': { transform: 'translateY(-30px) scaleX(1.3)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
