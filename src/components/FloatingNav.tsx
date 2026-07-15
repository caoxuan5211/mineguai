const links = [
  { href: "#features", label: "特性", tone: "jade" },
  { href: "#score-arena", label: "开局", tone: "gold" },
  { href: "#session-replay", label: "战绩", tone: "mist" },
  { href: "#privacy", label: "隐私", tone: "ember" },
];

export function FloatingNav() {
  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <nav className="floating-nav mx-auto flex max-w-[1500px] items-center justify-between rounded-full px-4 py-3">
        <a
          href="#hero"
          className="nav-brand text-sm font-semibold tracking-normal transition"
          aria-label="回到 Mineguai 首屏"
        >
          Mineguai
        </a>
        <div className="nav-links hidden items-center gap-3 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link nav-link--${link.tone} text-sm transition`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a href="#score-arena" className="nav-mobile-action soft-button soft-button--light">
          立即开局
        </a>
      </nav>
    </header>
  );
}
