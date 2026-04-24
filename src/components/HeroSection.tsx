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
        <p className="mb-8 text-sm tracking-[0.34em] text-white/55">
          东方暗奢记分器 / LOCAL-FIRST SCORE ARENA
        </p>
        <h1
          data-hero-title
          className="mx-auto max-w-6xl text-[clamp(3.4rem,9vw,7.6rem)] font-black leading-[0.92] tracking-[-0.06em] text-balance text-white"
        >
          把一桌输赢，记成
          <span className="hero-inline-pill" aria-hidden="true" />
          一场仪式
        </h1>
        <p
          data-hero-copy
          className="mt-8 max-w-3xl text-lg leading-8 text-white/72 sm:text-xl"
        >
          Mahjong Ledger 不是给麻将加一层廉价皮肤，而是把桌边快记分、回合时间线和作品级叙事压进同一张页面里。
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
