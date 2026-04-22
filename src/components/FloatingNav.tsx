const links = [
  { href: "#score-arena", label: "开局" },
  { href: "#session-replay", label: "战绩" },
  { href: "#theme-switcher", label: "主题" },
  { href: "#about", label: "关于" },
];

export function FloatingNav() {
  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between rounded-full border border-white/12 bg-black/35 px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <a
          href="#hero"
          className="text-sm font-semibold tracking-[0.28em] text-white/88 transition hover:text-[var(--accent-strong)]"
        >
          MAHJONG LEDGER
        </a>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/72 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
        <a href="#score-arena" className="soft-button soft-button--light">
          立即开局
        </a>
      </nav>
    </header>
  );
}
