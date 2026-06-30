import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green:  { DEFAULT: '#5cb85c', light: '#6fcf6f', dark: '#3d9b3d', 50: '#f0faf0', 100: '#dcf5dc', 500: '#5cb85c', 600: '#4caf50', 700: '#3d9b3d' },
        teal:   { DEFAULT: '#1b3a4b', light: '#254d63', dark: '#0f2330', 50: '#f0f7fa', 100: '#d0e8f0', 500: '#1b3a4b', 600: '#254d63', 700: '#0f2330' },
        brand:  { green: '#5cb85c', teal: '#1b3a4b', gold: '#f59e0b' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { '2xl': '16px', '3xl': '24px', '4xl': '32px' },
      boxShadow: {
        'green':    '0 8px 32px rgba(92,184,92,0.2)',
        'green-lg': '0 16px 48px rgba(92,184,92,0.3)',
        'teal':     '0 8px 32px rgba(27,58,75,0.2)',
        'card':     '0 4px 24px rgba(27,58,75,0.08)',
        'premium':  '0 12px 40px rgba(27,58,75,0.12)',
      },
      backgroundImage: {
        'hero':         'linear-gradient(135deg, #0f2330 0%, #1b3a4b 40%, #254d63 70%, #1a4a2e 100%)',
        'brand-green':  'linear-gradient(135deg, #3d9b3d, #5cb85c, #6fcf6f)',
        'brand-teal':   'linear-gradient(135deg, #0f2330, #1b3a4b, #254d63)',
        'card-shine':   'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease forwards',
        'fade-left':   'fadeInLeft 0.5s ease forwards',
        'fade-right':  'fadeInRight 0.5s ease forwards',
        'scale-in':    'scaleIn 0.4s ease forwards',
        'slide-up':    'slideUp 0.5s ease forwards',
        'float':       'float 3s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'blob':        'blob 7s ease-in-out infinite',
        'spin-slow':   'spinSlow 8s linear infinite',
        'gradient':    'gradientShift 4s ease infinite',
        'count-up':    'countUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn:        { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInLeft:    { from: { opacity: '0', transform: 'translateX(-24px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        fadeInRight:   { from: { opacity: '0', transform: 'translateX(24px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:       { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideUp:       { from: { opacity: '0', transform: 'translateY(32px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:         { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseGreen:    { '0%,100%': { boxShadow: '0 0 0 0 rgba(92,184,92,0.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(92,184,92,0)' } },
        shimmer:       { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        blob:          { '0%,100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' }, '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' } },
        spinSlow:      { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        countUp:       { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
