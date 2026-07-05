import type {Config} from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {DEFAULT: '1.25rem', lg: '2.5rem'},
      screens: {'2xl': '1440px'}
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          soft: 'rgb(var(--c-ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--c-ink-faint) / <alpha-value>)'
        },
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          alt: 'rgb(var(--c-surface-alt) / <alpha-value>)'
        },
        line: 'rgb(var(--c-line) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Inter', 'sans-serif']
      },
      fontSize: {
        display: ['clamp(3rem, 13vw, 14rem)', {lineHeight: '0.86', letterSpacing: '-0.02em'}],
        headline: ['clamp(2.2rem, 6vw, 5.5rem)', {lineHeight: '0.95', letterSpacing: '-0.02em'}],
        title: ['clamp(1.6rem, 3.2vw, 3rem)', {lineHeight: '1.05', letterSpacing: '-0.01em'}]
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-expo': 'cubic-bezier(0.165, 0.084, 0.44, 1)'
      },
      keyframes: {
        marquee: {
          '0%': {transform: 'translate3d(0,0,0)'},
          '100%': {transform: 'translate3d(-50%,0,0)'}
        },
        blink: {
          '0%, 49%': {opacity: '1'},
          '50%, 100%': {opacity: '0'}
        }
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        blink: 'blink 1s step-end infinite'
      }
    }
  }
}
