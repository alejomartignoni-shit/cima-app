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
        phantom: '#ab9ff2',
        violeta: '#7c5cfc',
        abyss: '#050507',
        ice: {
          300: '#a5f3fc',
          400: '#7dd3fc',
          500: '#38bdf8',
        },
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
        // Game feel
        'pop':          'pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'pop-d1':       'pop 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.08s both',
        'wiggle':       'wiggle 0.4s ease-in-out',
        'ring-pulse':   'ringPulse 1.8s ease-out infinite',
        'spin-slow':    'spin 14s linear infinite',
        // Cinematic v2
        'aurora':       'aurora 16s ease-in-out infinite alternate',
        'kenburns':     'kenburns 32s ease-in-out infinite alternate',
        'marquee':      'marquee 32s linear infinite',
        'orbit':        'orbit 22s linear infinite',
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
        pop: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '60%':  { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-8deg)' },
          '75%':      { transform: 'rotate(8deg)' },
        },
        ringPulse: {
          '0%':   { boxShadow: '0 0 0 0 rgba(255,214,0,0.45)' },
          '70%':  { boxShadow: '0 0 0 14px rgba(255,214,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,214,0,0)' },
        },
        aurora: {
          '0%':   { backgroundPosition: '0% 50%, 100% 50%, 50% 100%' },
          '50%':  { backgroundPosition: '100% 30%, 0% 70%, 30% 0%' },
          '100%': { backgroundPosition: '0% 50%, 100% 50%, 50% 100%' },
        },
        kenburns: {
          '0%':   { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(-1.5%, 1.5%)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg) translateX(14px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(14px) rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
}
