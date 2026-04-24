import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  describeRecord,
  formatClock,
  formatMoney,
  type LedgerState,
  type Player,
  type RecordItem,
} from "../lib/ledger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SessionReplayProps = {
  state: LedgerState;
  currentLeader: Player;
  onUndoLast: () => void;
  onUndoRecord: (recordId: string) => void;
};

function ReplayCard({
  record,
  selected,
  onSelect,
  label,
}: {
  record: RecordItem;
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`timeline-card ${selected ? "timeline-card--selected" : ""} ${record.reverted ? "timeline-card--muted" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-4">
        <strong className="text-left text-base text-white">{label}</strong>
        <span className="text-sm text-white/42">{formatClock(record.createdAt)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-white/54">
        <span>{record.mode === "rapid" ? "rapid" : "precision"}</span>
        <span>{record.reverted ? "已撤销" : "可撤销"}</span>
      </div>
    </button>
  );
}

export function SessionReplay({
  state,
  currentLeader,
  onUndoLast,
  onUndoRecord,
}: SessionReplayProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const activeRecords = [...state.records].reverse();

  useGSAP(
    () => {
      gsap.from("[data-replay-card]", {
        y: 80,
        opacity: 0,
        stagger: 0.08,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="session-replay" ref={sectionRef} className="section-space">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.2em] text-white/45">把过程留下</p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
              这局怎么打到现在，不需要靠记忆。
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="soft-button soft-button--ghost" onClick={onUndoLast}>
              撤销上一笔
            </button>
            <button
              type="button"
              className="soft-button soft-button--light"
              onClick={() => {
                if (selectedId) {
                  onUndoRecord(selectedId);
                  setSelectedId(null);
                }
              }}
            >
              撤销所选
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_26rem]">
          <div className="space-y-4">
            {activeRecords.length === 0 ? (
              <div className="empty-panel">
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  现在还没有记录。
                </h3>
                <p className="mt-3 max-w-xl text-white/62">
                  你一落笔，回放区就会开始累积时间线。这里不是装饰区，它会真实反映每一笔输赢。
                </p>
              </div>
            ) : (
              activeRecords.map((record) => (
                <div key={record.id} data-replay-card>
                  <ReplayCard
                    record={record}
                    label={describeRecord(state, record)}
                    selected={selectedId === record.id}
                    onSelect={() => setSelectedId((current) => (current === record.id ? null : record.id))}
                  />
                </div>
              ))
            )}
          </div>

          <aside className="space-y-4">
            <article className="summary-panel">
              <small>当前摘要</small>
              <strong>{currentLeader.name}</strong>
              <span>领跑 {formatMoney(currentLeader.balance)}</span>
              <p>{state.records.filter((record) => !record.reverted).length} 笔有效操作正在推动这局向前。</p>
            </article>

            <article className="summary-panel">
              <small>已结束对局</small>
              {state.archivedSessions.length === 0 ? (
                <p>你还没封存过任何一局，结束本局之后这里会生成摘要卡。</p>
              ) : (
                <div className="space-y-3">
                  {state.archivedSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="archive-card">
                      <strong>
                        第 {session.roundIndex} 局 / {session.stage === "east" ? "东风" : "南风"}
                      </strong>
                      <span>
                        {session.leaderName} 领先 {formatMoney(session.spread)}
                      </span>
                      <small>{formatClock(session.endedAt)}</small>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
