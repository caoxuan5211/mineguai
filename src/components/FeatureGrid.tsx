import {
  ArrowArcLeft,
  Cards,
  CrownSimple,
  Palette,
  RowsPlusBottom,
} from "@phosphor-icons/react";

const cards = [
  {
    title: "手机桌边，单手两步记一笔",
    copy:
      "先点对象，再点输赢金额。把原来分散的按钮逻辑收成一种更干净的拇指路径，让局势变化不打断牌桌节奏。",
    icon: Cards,
    className: "lg:col-span-7 lg:row-span-2",
  },
  {
    title: "每一笔都留下时间线",
    copy: "撤销不再是盲操作，所有动作都被放进可选中、可回看的 replay rail。",
    icon: ArrowArcLeft,
    className: "lg:col-span-5",
  },
  {
    title: "庄家、圈风、步长同屏可见",
    copy: "关键信息不再藏在零散角落，控制权集中到一条 upper rail。",
    icon: CrownSimple,
    className: "lg:col-span-5",
  },
  {
    title: "主题切换不是换皮，是换桌面气候",
    copy: "Jade、Ink、Brass 三套桌面气质共用同一套交互骨架。",
    icon: Palette,
    className: "lg:col-span-4",
  },
  {
    title: "叙事区和应用区共生",
    copy:
      "不是一页花哨 landing，也不是一块枯燥工具板。展示层给气质，应用层给速度，两者互不拖后腿。",
    icon: RowsPlusBottom,
    className: "lg:col-span-8",
  },
];

export function FeatureGrid() {
  return (
    <section className="section-space">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm tracking-[0.2em] text-white/45">给牌桌的重写</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
            不是把旧按钮放大，而是把整张牌桌重新编排。
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-flow-dense">
          {cards.map(({ title, copy, icon: Icon, className }) => (
            <article key={title} className={`feature-card ${className}`}>
              <div className="feature-icon">
                <Icon size={22} weight="duotone" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  {title}
                </h3>
                <p className="max-w-[34rem] text-base leading-7 text-white/68">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
