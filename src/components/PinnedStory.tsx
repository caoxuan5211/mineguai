import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const storyCards = [
  {
    title: "先认人",
    copy: "桌边记分最怕错手。先锁定对手，接下来的金额按钮才有明确语义。",
  },
  {
    title: "再落笔",
    copy: "金额按钮由统一步长衍生，轻点就能落下输赢，不需要临时做表单输入。",
  },
  {
    title: "每手有痕",
    copy: "动作进入时间线，局势不只剩余额，也能看到它怎样一步步变化。",
  },
  {
    title: "结束成局",
    copy: "结束本局后，摘要会被保留下来。下一局从零开始，上一局仍可回看。",
  },
];

export function PinnedStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !pinRef.current) {
        return;
      }

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top+=120",
            end: "bottom bottom-=80",
            pin: pinRef.current,
          });
        },
      });

      gsap.from("[data-story-card]", {
        y: 80,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="section-space relative overflow-hidden">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
        <div ref={pinRef} className="space-y-6 lg:pt-10">
          <p className="text-sm tracking-normal text-white/45">局势如何成形</p>
          <h2 className="max-w-xl text-4xl font-bold tracking-normal text-white sm:text-5xl">
            一局牌，不该只剩最后一个数字。
          </h2>
          <p className="max-w-lg text-base leading-7 text-white/64">
            Mineguai 把机械记账拆成确认、落账、回看和归档。每一步都短，但不会让人失去对余额的信任。
          </p>
        </div>
        <div className="space-y-6">
          {storyCards.map((card, index) => (
            <article
              key={card.title}
              data-story-card
              className="story-card"
              style={{ zIndex: storyCards.length - index }}
            >
              <span className="story-index">0{index + 1}</span>
              <h3 className="text-3xl font-semibold tracking-normal text-white">
                {card.title}
              </h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/66">
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
