import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { allData, STAGES, STAGE_LABELS } from './data';
import type { Day, Act, ItineraryBlock, ItineraryConflict } from './data';
import { Select } from './components/Select';
import './App.css';

function formatTime(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) h -= 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${display} ${period}` : `${display}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatTimeShort(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) h -= 24;
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${display}` : `${display}:${m.toString().padStart(2, '0')}`;
}

const DAY_RANGES: Record<Day, [number, number]> = {
  friday: [13 * 60, 25 * 60],
  saturday: [13 * 60, 25 * 60],
  sunday: [13 * 60, 24 * 60],
};

const DAY_LABELS: Record<Day, string> = {
  friday: 'FRIDAY',
  saturday: 'SATURDAY',
  sunday: 'SUNDAY',
};

const DAYS: Day[] = ['friday', 'saturday', 'sunday'];

const DAY_ACCENTS: Record<Day, string> = {
  friday: '#4a90d9',
  saturday: '#c07848',
  sunday: '#c87a4a',
};
const TEXT_MUTED = '#8a7d6b';

function lerpHex(a: string, b: string, t: number): string {
  const ar=parseInt(a.slice(1,3),16),ag=parseInt(a.slice(3,5),16),ab=parseInt(a.slice(5,7),16);
  const br=parseInt(b.slice(1,3),16),bg=parseInt(b.slice(3,5),16),bb=parseInt(b.slice(5,7),16);
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
}

function isZoomedOut() {
  const vv = window.visualViewport;
  return !vv || vv.scale <= 1.05;
}

function useSwipeDay(
  day: Day,
  setDay: (d: Day) => void,
  scrollElRef?: React.RefObject<HTMLDivElement | null>,
) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startScroll = useRef<{ left: number; maxLeft: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isZoomedOut()) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    if (scrollElRef?.current) {
      const el = scrollElRef.current;
      startScroll.current = { left: el.scrollLeft, maxLeft: el.scrollWidth - el.clientWidth };
    }
  }, [scrollElRef]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startX.current === null || !isZoomedOut()) { startX.current = null; return; }
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - (startY.current ?? 0);
    startX.current = null;
    startY.current = null;
    const scroll = startScroll.current;
    startScroll.current = null;

    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (scroll) {
      if (dx < 0 && scroll.left < scroll.maxLeft - 5) return;
      if (dx > 0 && scroll.left > 5) return;
    }

    const idx = DAYS.indexOf(day);
    if (dx < 0 && idx < DAYS.length - 1) setDay(DAYS[idx + 1]);
    else if (dx > 0 && idx > 0) setDay(DAYS[idx - 1]);
  }, [day, setDay]);

  return { onTouchStart, onTouchEnd };
}

const HOUR_PX = 80;

const DAY_DATES: Record<Day, string> = {
  friday: '2026-04-17',
  saturday: '2026-04-18',
  sunday: '2026-04-19',
};

function getLATime(): { dateStr: string; minutes: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '0';
  const h = parseInt(get('hour'));
  const m = parseInt(get('minute'));

  // Before 1 AM counts as the previous festival day (nights run past midnight)
  if (h < 1) {
    const prevParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(now.getTime() - 60 * 60 * 1000));
    const pGet = (type: string) => prevParts.find(p => p.type === type)?.value ?? '0';
    return {
      dateStr: `${pGet('year')}-${pGet('month')}-${pGet('day')}`,
      minutes: 24 * 60 + m,
    };
  }

  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: h * 60 + m,
  };
}

function getDefaultDay(): Day {
  const { dateStr } = getLATime();
  if (dateStr === DAY_DATES.saturday) return 'saturday';
  if (dateStr === DAY_DATES.sunday) return 'sunday';
  if (dateStr === DAY_DATES.friday) return 'friday';
  return 'friday';
}

function ActBlock({ act, rangeStart, highlighted, dimmed, onHover, onLeave, hourPx }: {
  act: Act;
  rangeStart: number;
  highlighted: boolean;
  dimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  hourPx: number;
}) {
  const top = ((act.start - rangeStart) / 60) * hourPx;
  const height = Math.max(((act.end - act.start) / 60) * hourPx - 2, hourPx < 50 ? 10 : 20);

  let pickClass = '';
  if (act.picked === 'caitlin') pickClass = 'pick-you';
  else if (act.picked === 'violet') pickClass = 'pick-violet';
  else if (act.picked === 'both') pickClass = 'pick-both';

  return (
    <div
      className={`act-block ${pickClass} ${act.priority === 'must' ? 'priority-must' : ''} ${act.locked ? 'locked' : ''} ${act.tentative ? 'tentative' : ''} ${highlighted ? 'highlighted' : ''} ${dimmed ? 'dimmed' : ''}`}
      style={{ top: `${top}px`, height: `${height}px` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      id={`grid-${act.id}`}
    >
      <div className="act-name">{act.name}</div>
      {height > 25 && (
        <div className="act-time-label">{formatTimeShort(act.start)}-{formatTimeShort(act.end)}</div>
      )}
      {act.locked && <div className="locked-badge">✓</div>}
    </div>
  );
}

const noop = () => {};

type ProgressFn = (dx: number, pw: number, instant: boolean) => void;

function useSwipePager(day: Day, setDay: (d: Day) => void, onProgress?: ProgressFn) {
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const axisLock = useRef<'h' | 'v' | null>(null);
  const isAnimating = useRef(false);

  const getPageWidth = () => stripRef.current?.parentElement?.offsetWidth ?? window.innerWidth;

  const applyTransform = (offset: number, animate: boolean) => {
    const el = stripRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    el.style.transform = `translateX(${-getPageWidth() + offset}px)`;
  };

  useLayoutEffect(() => {
    const pw = getPageWidth();
    applyTransform(0, false);
    onProgress?.(0, pw, false);
    isAnimating.current = false;
    touchStartX.current = null;
    axisLock.current = null;
  }, [day]);

  const idx = DAYS.indexOf(day);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isZoomedOut() || isAnimating.current) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    axisLock.current = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const rawDx = e.touches[0].clientX - touchStartX.current;
    const rawDy = e.touches[0].clientY - (touchStartY.current ?? 0);

    // Commit to horizontal or vertical after 12px — prevents accidental swipes while scrolling
    if (axisLock.current === null) {
      if (Math.abs(rawDx) > 12 || Math.abs(rawDy) > 12)
        axisLock.current = Math.abs(rawDx) >= Math.abs(rawDy) ? 'h' : 'v';
      return;
    }
    if (axisLock.current === 'v') return;

    let dx = rawDx;
    if (dx > 0 && idx === 0) dx *= 0.15;
    else if (dx < 0 && idx === DAYS.length - 1) dx *= 0.15;

    const pw = getPageWidth();
    applyTransform(dx, false);
    onProgress?.(dx, pw, false);
  }, [idx, onProgress]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || axisLock.current !== 'h') {
      touchStartX.current = null;
      axisLock.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    axisLock.current = null;
    const pw = getPageWidth();
    const threshold = pw * 0.3;

    if (dx < -threshold && idx < DAYS.length - 1) {
      isAnimating.current = true;
      applyTransform(-pw, true);
      onProgress?.(-pw, pw, true);
      stripRef.current?.addEventListener('transitionend', () => {
        flushSync(() => setDay(DAYS[idx + 1]));
      }, { once: true });
    } else if (dx > threshold && idx > 0) {
      isAnimating.current = true;
      applyTransform(pw, true);
      onProgress?.(pw, pw, true);
      stripRef.current?.addEventListener('transitionend', () => {
        flushSync(() => setDay(DAYS[idx - 1]));
      }, { once: true });
    } else {
      applyTransform(0, true);
      onProgress?.(0, pw, true); // snap-back with smooth fade
    }
  }, [idx, setDay, onProgress]);

  return { stripRef, onTouchStart, onTouchMove, onTouchEnd };
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useState(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
  return isMobile;
}

function ScheduleGrid({ acts, day, hoveredActId, onHoverAct, onLeaveAct, nowMinutes, scrollRef }: {
  acts: Act[];
  day: Day;
  hoveredActId: string | null;
  onHoverAct: (id: string, scrollGrid?: boolean) => void;
  onLeaveAct: () => void;
  nowMinutes: number | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isMobile = useIsMobile();
  const hourPx = isMobile ? 40 : HOUR_PX;
  const [rangeStart, rangeEnd] = DAY_RANGES[day];
  const totalHours = (rangeEnd - rangeStart) / 60;
  const gridHeight = totalHours * hourPx + (isMobile ? 60 : 120);

  const hours: number[] = [];
  for (let h = Math.ceil(rangeStart / 60); h <= Math.floor(rangeEnd / 60); h++) {
    hours.push(h);
  }

  const headerRef = useRef<HTMLDivElement>(null);

  const onGridScroll = useCallback(() => {
    if (headerRef.current && scrollRef.current) {
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }, [scrollRef]);

  return (
    <div className="schedule-grid">
      <div className="grid-header" ref={headerRef}>
        <div className="grid-time-spacer" />
        {STAGES.map(stage => (
          <div key={stage} className="grid-header-stage">
            <span>{STAGE_LABELS[stage]}</span>
          </div>
        ))}
      </div>
      <div className="grid-scroll" ref={scrollRef} onScroll={onGridScroll}>
        {/* Mobile: header inside scroll container so it scrolls horizontally with grid */}
        <div className="grid-mobile-header">
          <div className="grid-time-spacer" />
          {STAGES.map(stage => (
            <div key={stage} className="grid-header-stage">
              <span>{STAGE_LABELS[stage]}</span>
            </div>
          ))}
        </div>
        <div className="grid-body" style={{ height: `${gridHeight}px` }}>
          <div className="time-axis">
            {hours.map(h => (
              <div
                key={h}
                className="time-marker"
                style={{ top: `${((h * 60 - rangeStart) / 60) * hourPx}px` }}
              >
                <span>{formatTime(h * 60)}</span>
              </div>
            ))}
          </div>

          {hours.map(h => (
            <div
              key={`line-${h}`}
              className="hour-line"
              style={{ top: `${((h * 60 - rangeStart) / 60) * hourPx}px` }}
            />
          ))}

          {nowMinutes !== null && nowMinutes >= rangeStart && nowMinutes <= rangeEnd && (
            <div
              className="now-indicator"
              style={{ top: `${((nowMinutes - rangeStart) / 60) * hourPx}px` }}
            >
              <div className="now-indicator-triangle" />
            </div>
          )}

          <div className="stage-columns">
            {STAGES.map(stage => (
              <div key={stage} className="stage-column">
                {acts
                  .filter(a => a.stage === stage)
                  .map(act => (
                    <ActBlock
                      key={act.id}
                      act={act}
                      rangeStart={rangeStart}
                      highlighted={hoveredActId === act.id}
                      dimmed={hoveredActId !== null && hoveredActId !== act.id}
                      onHover={() => onHoverAct(act.id)}
                      onLeave={onLeaveAct}
                      hourPx={hourPx}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PickDot({ picked }: { picked?: string }) {
  if (!picked) return null;
  const cls = picked === 'caitlin' ? 'you' : picked;
  return <span className={`pick-indicator ${cls}`} title={picked === 'both' ? 'Both' : picked === 'caitlin' ? 'Caitlin' : 'Violet'} />;
}

function ItineraryItem({ block, hoveredActId, onHoverAct, onLeaveAct, acts }: {
  block: ItineraryBlock;
  hoveredActId: string | null;
  onHoverAct: (id: string, scrollGrid?: boolean) => void;
  onLeaveAct: () => void;
  acts: Act[];
}) {
  const isHighlighted = block.actId ? hoveredActId === block.actId : false;
  const actData = block.actId ? acts.find(a => a.id === block.actId) : undefined;

  const isMustSee = actData?.priority === 'must';
  const isLocked = actData?.locked && !isMustSee;

  if (block.type === 'subheader') {
    return (
      <div className="itinerary-subheader">
        <span>{block.title}</span>
      </div>
    );
  }

  return (
    <div
      className={`itinerary-item ${block.type} ${isHighlighted ? 'it-highlighted' : ''} ${isMustSee ? 'it-must-see' : ''} ${isLocked ? 'it-locked' : ''}`}
      data-it-time={block.start}
      onMouseEnter={() => block.actId && onHoverAct(block.actId, true)}
      onMouseLeave={onLeaveAct}
    >
      <div className="it-time-col">
        <span className="it-time">{formatTime(block.start)}</span>
      </div>
      <div className="it-content">
        <div className="it-connector">
          <div className={`it-dot ${block.type} ${isMustSee ? 'must' : ''}`} />
          {block.type !== 'gametime' && <div className="it-line" />}
        </div>
        <div className={`it-card ${block.type}`}>
          <div className="it-card-title">{block.title}</div>
          {(block.stage || block.type === 'act') && (
            <div className="it-card-meta">
              {actData && <PickDot picked={actData.picked} />}
              {block.stage && <span className="it-meta-text">{block.stage}</span>}
              {block.stage && block.type === 'act' && <span className="it-meta-sep">·</span>}
              {block.type === 'act' && <span className="it-meta-text">{formatTime(block.start)}–{formatTime(block.end)}</span>}
            </div>
          )}
          {block.subtitle && (
            <div className="it-subtitle">
              {block.subtitle.includes('\n')
                ? block.subtitle.split('\n').map((line, i) => <div key={i} className="it-bullet">· {line}</div>)
                : block.subtitle}
            </div>
          )}
          {block.note && <div className="it-note">{block.note}</div>}
          {block.conflicts && block.conflicts.length > 0 && (
            <div className="it-conflicts">
              <div className="it-conflicts-header">
                <span className="it-conflicts-label">also on</span>
              </div>
              {block.conflicts.map((c: ItineraryConflict) => (
                <div
                  key={c.actId}
                  className={`it-conflict-item ${hoveredActId === c.actId ? 'conflict-highlighted' : ''}`}
                  onMouseEnter={(e) => { e.stopPropagation(); onHoverAct(c.actId, true); }}
                  onMouseLeave={(e) => { e.stopPropagation(); onLeaveAct(); }}
                >
                  <PickDot picked={acts.find(a => a.id === c.actId)?.picked} />
                  <span className="it-conflict-name">{c.name}</span>
                  {(() => { const a = acts.find(x => x.id === c.actId); return (
                    <span className="it-conflict-detail">{c.stage} · {a ? `${formatTime(a.start)}–${formatTime(a.end)}` : c.time}</span>
                  ); })()}
                </div>
              ))}
            </div>
          )}
          {block.options && block.options.length > 0 && (
            <div className="it-options">
              {block.options.map(opt => {
                const optStart = acts.find(a => a.id === opt.actId)?.start;
                return (
                  <div
                    key={opt.actId}
                    data-it-time={optStart}
                    className={`it-option ${opt.tentative ? 'opt-tentative' : ''} ${hoveredActId === opt.actId ? 'opt-highlighted' : ''}`}
                    onMouseEnter={(e) => { e.stopPropagation(); onHoverAct(opt.actId, true); }}
                    onMouseLeave={(e) => { e.stopPropagation(); onLeaveAct(); }}
                  >
                    {(() => { const a = acts.find(x => x.id === opt.actId); return (<>
                      <PickDot picked={a?.picked} />
                      <span className="opt-name">{opt.name}</span>
                      <span className="opt-detail">{opt.stage} · {a ? `${formatTime(a.start)}–${formatTime(a.end)}` : opt.time}</span>
                    </>); })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [day, setDay] = useState<Day>(getDefaultDay);
  const [hoveredActId, setHoveredActId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'grid' | 'schedule' | 'map'>('schedule');
  const [showMap, setShowMap] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  const handleDayChange = useCallback((d: Day) => {
    setDay(d);
    setHoveredActId(null);
  }, []);

  const gridSwipe = useSwipeDay(day, handleDayChange, gridScrollRef);
  const bgOverlayRef = useRef<HTMLDivElement>(null);
  const dayTabsRef = useRef<HTMLElement>(null);

  const handleSwipeProgress: ProgressFn = useCallback((dx, pw, instant) => {
    const progress = Math.min(Math.abs(dx) / pw, 1);
    const curIdx = DAYS.indexOf(day);
    const targetIdx = dx > 0 ? curIdx - 1 : curIdx + 1;
    const targetDay: Day | null = dx !== 0 ? (DAYS[targetIdx] ?? null) : null;
    const isDayChange = dx === 0 && !instant;

    // Background overlay
    const overlay = bgOverlayRef.current;
    if (overlay) {
      overlay.style.transition = instant ? 'opacity 0.28s ease' : 'none';
      overlay.className = targetDay && progress > 0 ? `day-bg-overlay day-${targetDay}` : 'day-bg-overlay';
      overlay.style.opacity = targetDay && progress > 0 ? String(progress) : '0';
    }

    const nav = dayTabsRef.current;
    if (nav) {
      const tabs = nav.querySelectorAll<HTMLElement>('.day-tab');
      const indicator = nav.querySelector<HTMLElement>('.tab-indicator');
      const navRect = nav.getBoundingClientRect();
      const curTab = tabs[curIdx] as HTMLElement | undefined;
      const tgtTab = targetDay ? tabs[targetIdx] as HTMLElement | undefined : undefined;
      const curAccent = DAY_ACCENTS[day];
      const tgtAccent = targetDay ? DAY_ACCENTS[targetDay] : null;

      // isCommittedSwipe used by both indicator and tabs sections
      const isCommittedSwipe = instant && progress >= 1;

      // Sliding indicator — position AND color driven by JS so both lerp during drag
      if (indicator && curTab) {
        const curRect = curTab.getBoundingClientRect();
        const curL = curRect.left - navRect.left;
        const curW = curRect.width;
        if (isCommittedSwipe) {
          indicator.style.transition = 'left 0.28s ease, width 0.28s ease, background-color 0.28s ease';
          if (tgtTab) {
            const tgtRect = tgtTab.getBoundingClientRect();
            indicator.style.left = `${tgtRect.left - navRect.left}px`;
            indicator.style.width = `${tgtRect.width}px`;
          }
          indicator.style.backgroundColor = tgtAccent ?? curAccent;
        } else if (isDayChange) {
          indicator.style.transition = 'none';
          indicator.style.left = `${curL}px`;
          indicator.style.width = `${curW}px`;
          indicator.style.backgroundColor = '';
        } else if (instant) {
          // snap-back
          indicator.style.transition = 'left 0.28s ease, width 0.28s ease, background-color 0.28s ease';
          indicator.style.left = `${curL}px`;
          indicator.style.width = `${curW}px`;
          indicator.style.backgroundColor = curAccent;
        } else {
          indicator.style.transition = 'none';
          if (tgtTab && progress > 0) {
            const tgtRect = tgtTab.getBoundingClientRect();
            indicator.style.left = `${curL + (tgtRect.left - navRect.left - curL) * progress}px`;
            indicator.style.width = `${curW + (tgtRect.width - curW) * progress}px`;
            indicator.style.backgroundColor = lerpHex(curAccent, tgtAccent!, progress);
          } else {
            indicator.style.left = `${curL}px`;
            indicator.style.width = `${curW}px`;
            indicator.style.backgroundColor = curAccent;
          }
        }
      }

      // Tab text
      tabs.forEach((tab, i) => {
        if (isCommittedSwipe) {
          tab.style.transition = 'color 0.28s ease';
          if (i === curIdx) tab.style.color = TEXT_MUTED;
          else if (i === targetIdx && tgtAccent) tab.style.color = tgtAccent;
          else tab.style.color = '';
        } else {
          tab.style.transition = 'none';
          if (i === curIdx && progress > 0) tab.style.color = lerpHex(curAccent, TEXT_MUTED, progress);
          else if (tgtAccent && i === targetIdx && progress > 0) tab.style.color = lerpHex(TEXT_MUTED, tgtAccent, progress);
          else tab.style.color = '';
        }
      });

      // Restore CSS transitions after current frame
      if (isDayChange) {
        requestAnimationFrame(() => {
          nav.querySelectorAll<HTMLElement>('.day-tab').forEach(t => { t.style.transition = ''; });
          nav.querySelector<HTMLElement>('.tab-indicator')?.style.setProperty('transition', '');
        });
      } else if (instant && !isCommittedSwipe) {
        // Snap-back: tabs restore in next frame; indicator clears after its animation
        requestAnimationFrame(() => {
          nav.querySelectorAll<HTMLElement>('.day-tab').forEach(t => { t.style.transition = ''; });
        });
        indicator?.addEventListener('transitionend', () => {
          indicator.style.transition = '';
          indicator.style.backgroundColor = '';
        }, { once: true });
      }
      // Committed swipe: useLayoutEffect (isDayChange) clears backgroundColor on next render
    }
  }, [day]);

  const { stripRef, onTouchStart: planTouchStart, onTouchMove: planTouchMove, onTouchEnd: planTouchEnd } = useSwipePager(day, handleDayChange, handleSwipeProgress);

  const idx = DAYS.indexOf(day);
  const prevDay = idx > 0 ? DAYS[idx - 1] : null;
  const nextDay = idx < DAYS.length - 1 ? DAYS[idx + 1] : null;

  const onHoverAct = useCallback((id: string, scrollGrid?: boolean) => {
    setHoveredActId(id);
    if (scrollGrid) {
      const el = document.getElementById(`grid-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, []);

  const onLeaveAct = useCallback(() => {
    setHoveredActId(null);
  }, []);

  const { acts, itinerary } = allData[day];

  const [nowMinutes, setNowMinutes] = useState<number | null>(() => {
    const { dateStr, minutes } = getLATime();
    return dateStr === DAY_DATES[day] ? minutes : null;
  });

  useEffect(() => {
    const update = () => {
      const { dateStr, minutes } = getLATime();
      setNowMinutes(dateStr === DAY_DATES[day] ? minutes : null);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [day]);

  const itineraryScrollRef = useRef<HTMLDivElement>(null);
  const [nowLineTop, setNowLineTop] = useState<number | null>(null);

  // Clear now-line before paint on day change so stale position never renders
  useLayoutEffect(() => { setNowLineTop(null); }, [day]);

  useEffect(() => {
    const el = itineraryScrollRef.current;
    if (!el || nowMinutes === null) { setNowLineTop(null); return; }

    const containerTop = el.getBoundingClientRect().top;
    const scrollTop = el.scrollTop;

    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-it-time]'))
      .map(node => ({
        time: parseInt(node.getAttribute('data-it-time')!, 10),
        top: node.getBoundingClientRect().top - containerTop + scrollTop,
      }))
      .filter(item => !isNaN(item.time))
      .sort((a, b) => a.time - b.time);

    if (!items.length) { setNowLineTop(null); return; }

    let ai = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].time <= nowMinutes) ai = i;
      else break;
    }

    if (ai < 0) {
      setNowLineTop(null);
    } else if (ai >= items.length - 1) {
      setNowLineTop(null); // past the last item, nothing to show
    } else {
      const A = items[ai], B = items[ai + 1];
      const ratio = (nowMinutes - A.time) / (B.time - A.time);
      setNowLineTop(A.top + (B.top - A.top) * ratio);
    }
  }, [nowMinutes, day, mobileView]);

  return (
    <div className={`app day-${day}`}>
      <div className="day-bg-overlay" ref={bgOverlayRef} />
      <header className="app-header">
        <div className="header-top">
          <div className="header-brand">COACHELLA</div>
          {/* Desktop: info + map button */}
          <div className="header-info desktop-only">
            <span className="header-day">{DAY_LABELS[day]}</span>
            <button className="map-btn" onClick={() => setShowMap(true)}>Map</button>
          </div>
          {/* Mobile: view switcher */}
          <div className="mobile-view-tabs mobile-only">
            <Select
              value={mobileView}
              onValueChange={v => setMobileView(v as typeof mobileView)}
              options={[
                { value: 'schedule', label: 'Plan' },
                { value: 'grid', label: 'Lineup' },
                { value: 'map', label: 'Map' },
              ]}
            />
          </div>
        </div>
        <nav className="day-tabs" ref={dayTabsRef as React.RefObject<HTMLElement>}>
          {(['friday', 'saturday', 'sunday'] as Day[]).map(d => (
            <button
              key={d}
              className={`day-tab ${d === day ? 'active' : ''}`}
              onClick={() => handleDayChange(d)}
            >
              {DAY_LABELS[d]}
            </button>
          ))}
          <div className="tab-indicator" />
        </nav>
      </header>

      <div className="legend-bar desktop-only">
        <span className="legend-item"><span className="swatch pick-you" /> Caitlin</span>
        <span className="legend-item"><span className="swatch pick-violet" /> Violet</span>
        <span className="legend-item"><span className="swatch pick-both" /> Both</span>
        <span className="legend-item"><span className="swatch swatch-locked" /> Locked in</span>
        <span className="legend-item"><span className="swatch swatch-tentative" /> Tentative</span>
        <span className="legend-item"><span className="swatch swatch-must" /> Must-see</span>
        <span className="legend-item"><span className="swatch swatch-unpicked" /> Not picked</span>
      </div>

      <div className="main-content" ref={gridRef}>
        <div className={`grid-panel ${mobileView === 'grid' ? 'mobile-active' : ''}`} {...gridSwipe}>
          <ScheduleGrid
            acts={acts}
            day={day}
            hoveredActId={hoveredActId}
            onHoverAct={onHoverAct}
            onLeaveAct={onLeaveAct}
            nowMinutes={nowMinutes}
            scrollRef={gridScrollRef}
          />
        </div>
        <div className="divider" />
        <div className={`schedule-panel ${mobileView === 'schedule' ? 'mobile-active' : ''}`}>
          <div className="schedule-panel-header">Our Plan</div>
          <div className="plan-pager" onTouchStart={planTouchStart} onTouchMove={planTouchMove} onTouchEnd={planTouchEnd}>
            <div className="plan-strip" ref={stripRef}>
              <div className="plan-page">
                {prevDay && allData[prevDay].itinerary.map((block, i) => (
                  <ItineraryItem key={block.actId ?? `${block.type}-${block.start ?? i}`} block={block} hoveredActId={null} onHoverAct={noop} onLeaveAct={noop} acts={allData[prevDay].acts} />
                ))}
              </div>
              <div className="plan-page" ref={itineraryScrollRef}>
                {itinerary.map((block, i) => (
                  <ItineraryItem key={block.actId ?? `${block.type}-${block.start ?? i}`} block={block} hoveredActId={hoveredActId} onHoverAct={onHoverAct} onLeaveAct={onLeaveAct} acts={acts} />
                ))}
                {nowLineTop !== null && (
                  <div className="now-indicator" style={{ top: `${nowLineTop}px` }}>
                    <div className="now-indicator-triangle" />
                  </div>
                )}
              </div>
              <div className="plan-page">
                {nextDay && allData[nextDay].itinerary.map((block, i) => (
                  <ItineraryItem key={block.actId ?? `${block.type}-${block.start ?? i}`} block={block} hoveredActId={null} onHoverAct={noop} onLeaveAct={noop} acts={allData[nextDay].acts} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Mobile map view */}
        <div className={`map-panel ${mobileView === 'map' ? 'mobile-active' : ''}`}>
          <div className="map-scroll">
            <img src={`${import.meta.env.BASE_URL}venue-map.png`} alt="Coachella Venue Map" className="venue-map-img" />
          </div>
        </div>
      </div>

      {/* Desktop map modal */}
      {showMap && (
        <div className="map-overlay" onClick={() => setShowMap(false)}>
          <div className="map-modal" onClick={e => e.stopPropagation()}>
            <button className="map-close" onClick={() => setShowMap(false)}>Close</button>
            <img src={`${import.meta.env.BASE_URL}venue-map.png`} alt="Coachella Venue Map" className="venue-map-img" />
          </div>
        </div>
      )}
    </div>
  );
}
