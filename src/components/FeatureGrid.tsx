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
      "先点对象，再点输赢金额。把分散按钮收成一条拇指路径，局势变化不会打断牌桌节奏。",
    icon: Cards,
    className: "lg:col-span-7 lg:row-span-2",
  },
  {
    title: "每一笔都留下时间线",
    copy: "撤销不再是盲操作，最近动作按时间排列，能回看，也能精确撤回。",
    icon: ArrowArcLeft,
    className: "lg:col-span-5",
  },
  {
    title: "庄家、圈风、步长同屏可见",
    copy: "关键信息不藏在角落，当前局数、领先者和步长都在开局前能确认。",
    icon: CrownSimple,
    className: "lg:col-span-5",
  },
  {
    title: "本地保存，不需要账号",
    copy: "玩家称呼、当前余额和历史局都保存在当前浏览器，换设备前不会被上传。",
    icon: Palette,
    className: "lg:col-span-4",
  },
  {
    title: "叙事区和应用区共生",
    copy:
      "首屏负责建立气质，记账区负责速度。页面能展示，也能直接坐在牌桌旁使用。",
    icon: RowsPlusBottom,
    className: "lg:col-span-8",
  },
];

export function FeatureGrid() {
  return (
    <section className="section-space" id="features">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm tracking-normal text-white/45">给熟人局的记账方式</p>
          <h2 className="mt-4 text-4xl font-bold tracking-normal text-white sm:text-5xl">
            少一点找按钮，多一点确认感。
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-flow-dense">
          {cards.map(({ title, copy, icon: Icon, className }) => (
            <article key={title} className={`feature-card ${className}`}>
              <div className="feature-icon">
                <Icon size={22} weight="duotone" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-normal text-white">
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
