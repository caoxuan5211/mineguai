export function FinalCta() {
  return (
    <section className="section-space pb-20" id="about">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="final-cta">
          <div className="space-y-6">
            <p className="text-sm tracking-[0.2em] text-white/45">继续往前</p>
            <h2 className="max-w-4xl text-4xl font-bold tracking-[-0.05em] text-white sm:text-6xl">
              继续下一局，或者把这一局留在页面里慢慢回看。
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-white/66">
              Mahjong Ledger 现在是一块真正可用的桌边记分台，也是一张带有强烈气味的作品首页。你不需要在可用性和冲击力之间二选一。
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#score-arena" className="soft-button soft-button--primary">
              再开一局
            </a>
            <a href="#hero" className="soft-button soft-button--ghost">
              回到顶部
            </a>
          </div>
        </div>

        <footer className="mt-8 grid gap-5 rounded-[2rem] border border-white/10 bg-white/4 px-6 py-8 text-sm text-white/58 lg:grid-cols-3">
          <div>
            <strong className="block text-white">Mahjong Ledger</strong>
            <p className="mt-2">
              一个为桌边快记分而生，同时保留展览级视觉叙事的本地前端项目。
            </p>
          </div>
          <div id="privacy">
            <strong className="block text-white">Privacy</strong>
            <p className="mt-2">所有对局数据只保存在本地浏览器，不上传，不共享，不追踪。</p>
          </div>
          <div id="terms">
            <strong className="block text-white">Terms</strong>
            <p className="mt-2">
              这是一个本地工具与作品展示页面，不提供联网规则裁定或账号服务。
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
