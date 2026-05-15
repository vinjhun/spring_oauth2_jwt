import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--md-sys-color-primary) / <alpha-value>)',
        onPrimary: 'rgb(var(--md-sys-color-on-primary) / <alpha-value>)',
        secondary: 'rgb(var(--md-sys-color-secondary) / <alpha-value>)',
        surface: 'rgb(var(--md-sys-color-surface) / <alpha-value>)',
        surfaceContainer: 'rgb(var(--md-sys-color-surface-container) / <alpha-value>)',
        onSurface: 'rgb(var(--md-sys-color-on-surface) / <alpha-value>)',
        surfaceVariant: 'rgb(var(--md-sys-color-surface-variant) / <alpha-value>)',
        outline: 'rgb(var(--md-sys-color-outline) / <alpha-value>)',
        sidebar: 'rgb(var(--md-sys-color-sidebar) / <alpha-value>)',
        onSidebar: 'rgb(var(--md-sys-color-on-sidebar) / <alpha-value>)',
        success: 'rgb(var(--md-sys-color-success) / <alpha-value>)',
        successContainer: 'rgb(var(--md-sys-color-success-container) / <alpha-value>)',
        warning: 'rgb(var(--md-sys-color-warning) / <alpha-value>)',
        warningContainer: 'rgb(var(--md-sys-color-warning-container) / <alpha-value>)',
        danger: 'rgb(var(--md-sys-color-danger) / <alpha-value>)',
        dangerContainer: 'rgb(var(--md-sys-color-danger-container) / <alpha-value>)',
      },
      borderRadius: {
        sm3: '0.5rem',
        md3: '0.75rem',
        lg3: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
