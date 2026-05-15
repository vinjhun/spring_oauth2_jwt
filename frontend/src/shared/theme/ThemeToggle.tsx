import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import type { ThemePreference } from './ThemeProvider';

const options: Array<{ label: string; value: ThemePreference; icon: typeof Monitor }> = [
  { label: 'System Theme', value: 'system', icon: Monitor },
  { label: 'Light Theme', value: 'light', icon: Sun },
  { label: 'Dark Theme', value: 'dark', icon: Moon },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="inline-flex rounded-md3 border border-outline/20 bg-surfaceContainer p-1" role="group" aria-label="Theme preference">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === preference;

        return (
          <button
            key={option.value}
            aria-label={option.label}
            aria-pressed={isActive}
            className={`inline-flex size-9 items-center justify-center rounded-sm3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActive ? 'bg-primary text-onPrimary shadow-sm' : 'text-outline hover:bg-surfaceVariant hover:text-onSurface'
            }`}
            type="button"
            onClick={() => setPreference(option.value)}
            title={option.label}
          >
            <Icon size={17} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
