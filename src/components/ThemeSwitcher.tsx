import type { ThemeId } from "../lib/ledger";

type ThemeSwitcherProps = {
  currentTheme: ThemeId;
  onChange: (theme: ThemeId) => void;
};

const themes = [
  { id: "jade", label: "Jade Ledger", note: "玉石绿与旧金" },
  { id: "ink", label: "Ink Table", note: "墨黑与雾银" },
  { id: "brass", label: "Brass Ritual", note: "黄铜与深茶" },
] as const;

export function ThemeSwitcher({ currentTheme, onChange }: ThemeSwitcherProps) {
  return (
    <div id="theme-switcher" className="space-y-3">
      <div className="text-sm tracking-[0.18em] text-white/42">桌面气候</div>
      <div className="grid gap-3 sm:grid-cols-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-chip ${currentTheme === theme.id ? "theme-chip--active" : ""}`}
            onClick={() => onChange(theme.id)}
          >
            <strong>{theme.label}</strong>
            <span>{theme.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
