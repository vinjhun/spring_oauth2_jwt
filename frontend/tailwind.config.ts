import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--md-sys-color-primary) / <alpha-value>)',
        onPrimary: 'rgb(var(--md-sys-color-on-primary) / <alpha-value>)',
        surface: 'rgb(var(--md-sys-color-surface) / <alpha-value>)',
        onSurface: 'rgb(var(--md-sys-color-on-surface) / <alpha-value>)',
        surfaceVariant: 'rgb(var(--md-sys-color-surface-variant) / <alpha-value>)',
        outline: 'rgb(var(--md-sys-color-outline) / <alpha-value>)',
      },
      borderRadius: {
        md3: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config;

