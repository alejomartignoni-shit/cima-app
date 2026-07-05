/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
        },
        gold: '#ffd600',
        'gold-dark': '#e6c200',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.25s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Cinematic
        'float':        'float 7s ease-in-out infinite',
        'float-slow':   'float 10s ease-in-out infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'fade-up':      'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up-d1':   'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s forwards',
        'fade-up-d2':   'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s forwards',
        'fade-up-d3':   'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.45s forwards',
        'beam':         'beam 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-18px) rotate(0.5deg)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(255,214,0,0.25), 0 0 80px rgba(255,214,0,0.08)' },
          '50%':      { boxShadow: '0 0 50px rgba(255,214,0,0.45), 0 0 130px rgba(255,214,0,0.18)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(36px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        beam: {
          '0%':   { opacity: '0', transform: 'translateY(-100%)' },
          '50%':  { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
