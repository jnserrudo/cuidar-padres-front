module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-cream)',
        foreground: 'var(--color-ink)',
        accent: 'var(--color-terracotta)',
        muted: 'var(--color-sage)',
        panel: 'var(--color-stone)',
        stone: 'var(--color-stone)',
        sun: 'var(--color-sun)',
        rose: 'var(--color-rose)',
      },
    },
  },
  plugins: [],
};
