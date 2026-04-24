import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowClockwise, ClockCounterClockwise } from "@phosphor-icons/react";
import {
  describeRecord,
  formatClock,
  formatMoney,
  type LedgerState,
  type Player,
} from "../lib/ledger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HistorySheetProps = {
  state: LedgerState;
  currentLeader: Player;
  onEndSession: () => void;
  onUndoRecord: (recordId: string) => void;
};

export function HistorySheet({
  state,
  currentLeader,
  onEndSession,
  onUndoRecord,
}: HistorySheetProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const records = [...state.records].reverse();

  useGSAP(
    () => {
      gsap.from(".history-card", {
        y: 60,
        opacity: 0,
        stagger: 0.07,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section className="history-sheet" ref={sectionRef}>
      <div className="history-sheet__intro">
        <div>
          <p className="round-shell__label">history rail</p>
          <h2 className="history-sheet__title">把最近几笔留在手边，但不抢主舞台。</h2>
        </div>
        <button type="button" className="history-sheet__close" onClick={onEndSession}>
          结束本局
        </button>
      </div>

      <div className="history-summary">
        <article>
          <span className="round-shell__label">领跑者</span>
          <strong>{currentLeader.name}</strong>
          <small>{formatMoney(currentLeader.balance)}</small>
        </article>
        <article>
          <span className="round-shell__label">有效记录</span>
          <strong>{state.records.filter((record) => !record.reverted).length}</strong>
          <small>最近动作保留在下方</small>
        </article>
        <article>
          <span className="round-shell__label">封存局数</span>
          <strong>{state.archivedSessions.length}</strong>
          <small>开新局前可先收尾</small>
        </article>
      </div>

      <div className="history-list">
        {records.length === 0 ? (
          <div className="history-empty">
            <p>还没有记录。现在点一次圆桌上的对手，再点底部金额，这里就会开始滚动累积。</p>
          </div>
        ) : (
          records.map((record) => (
            <article
              key={record.id}
              className={`history-card ${record.reverted ? "history-card--muted" : ""}`}
            >
              <div className="history-card__main">
                <div>
                  <strong>{describeRecord(state, record)}</strong>
                  <span>{formatClock(record.createdAt)}</span>
                </div>
                <div className="history-card__mode">
                  {record.mode === "precision" ? (
                    <ArrowClockwise size={16} weight="bold" />
                  ) : (
                    <ClockCounterClockwise size={16} weight="bold" />
                  )}
                  <small>{record.mode}</small>
                </div>
              </div>
              <button
                type="button"
                className="history-card__undo"
                disabled={record.reverted}
                onClick={() => onUndoRecord(record.id)}
              >
                {record.reverted ? "已撤销" : "撤销"}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
