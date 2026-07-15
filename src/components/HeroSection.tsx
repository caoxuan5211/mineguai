import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline({
        defaults: {
          duration: 1,
          ease: "power3.out",
        },
      });

      timeline
        .from("[data-hero-glow]", { opacity: 0, scale: 0.86 })
        .from("[data-hero-title]", { y: 60, opacity: 0 }, "-=0.55")
        .from("[data-hero-copy]", { y: 30, opacity: 0 }, "-=0.5")
        .from("[data-hero-actions]", { y: 24, opacity: 0, stagger: 0.12 }, "-=0.45");
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="section-space relative min-h-[90dvh] overflow-hidden"
    >
      <div data-hero-glow className="hero-glow absolute inset-x-0 top-0 h-[62rem]" />
      <div className="relative z-10 mx-auto flex min-h-[88dvh] max-w-[1500px] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-8 text-sm tracking-normal text-white/55 hero-kicker">
          local-first mahjong ledger
        </p>
        <h1
          data-hero-title
          className="hero-title mx-auto max-w-6xl text-5xl font-black leading-[0.96] tracking-normal text-balance text-white sm:text-7xl lg:text-8xl"
        >
          <span>手机边记账</span>
          <span>
            两步
            <span className="hero-inline-pill" aria-hidden="true" />
            不断牌局
          </span>
        </h1>
        <p
          data-hero-copy
          className="mt-8 max-w-3xl text-lg leading-8 text-white/72 sm:text-xl"
        >
          Mineguai 把四人麻将的对象选择、输赢金额、撤销和回看放进同一条桌边路径。数据留在本机，打开网页就能继续上一局。
        </p>
        <div
          data-hero-actions
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="#score-arena" className="soft-button soft-button--primary">
            直接开始记分
          </a>
          <a href="#session-replay" className="soft-button soft-button--ghost">
            查看对局回放
          </a>
        </div>
      </div>
    </section>
  );
}
