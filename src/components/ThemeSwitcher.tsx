import type { ThemeId } from "../lib/ledger";

type ThemeSwitcherProps = {
  currentTheme: ThemeId;
  onChange: (theme: ThemeId) => void;
};

const themes: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "ink", label: "墨", swatch: "linear-gradient(135deg, oklch(28% 0.025 245), oklch(78% 0.055 220))" },
  { id: "jade", label: "翠", swatch: "linear-gradient(135deg, oklch(30% 0.044 155), oklch(80% 0.12 155))" },
  { id: "brass", label: "铜", swatch: "linear-gradient(135deg, oklch(31% 0.045 65), oklch(82% 0.13 75))" },
];

export function ThemeSwitcher({ currentTheme, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher" role="radiogroup" aria-label="切换桌面主题">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="radio"
          aria-checked={currentTheme === theme.id}
          className={`theme-chip ${currentTheme === theme.id ? "theme-chip--active" : ""}`}
          onClick={() => onChange(theme.id)}
        >
          <span className="theme-chip__swatch" style={{ background: theme.swatch }} aria-hidden="true" />
          {theme.label}
        </button>
      ))}
    </div>
  );
}