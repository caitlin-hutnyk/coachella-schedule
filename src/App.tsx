import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
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

function useSwipePager(day: Day, setDay: (d: Day) => void) {
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const getPageWidth = () => stripRef.current?.parentElement?.offsetWidth ?? window.innerWidth;

  const applyTransform = (offset: number, animate: boolean) => {
    const el = stripRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    el.style.transform = `translateX(${-getPageWidth() + offset}px)`;
  };

  // Reset to center after day changes (from swipe or tab click), before browser paints
  useLayoutEffect(() => {
    applyTransform(0, false);
    isAnimating.current = false;
    touchStartX.current = null;
  }, [day]);

  const idx = DAYS.indexOf(day);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isZoomedOut() || isAnimating.current) return;
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    let dx = e.touches[0].clientX - touchStartX.current;
    // Rubber-band at edges
    if (dx > 0 && idx === 0) dx *= 0.15;
    else if (dx < 0 && idx === DAYS.length - 1) dx *= 0.15;
    applyTransform(dx, false);
  }, [idx]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const pw = getPageWidth();
    const threshold = pw * 0.3;

    if (dx < -threshold && idx < DAYS.length - 1) {
      isAnimating.current = true;
      applyTransform(-pw, true);
      // After animation, change day — useLayoutEffect resets transform before paint
      stripRef.current?.addEventListener('transitionend', () => {
        setDay(DAYS[idx + 1]);
      }, { once: true });
    } else if (dx > threshold && idx > 0) {
      isAnimating.current = true;
      applyTransform(pw, true);
      stripRef.current?.addEventListener('transitionend', () => {
        setDay(DAYS[idx - 1]);
      }, { once: true });
    } else {
      applyTransform(0, true);
    }
  }, [idx, setDay]);

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
  const { stripRef, onTouchStart: planTouchStart, onTouchMove: planTouchMove, onTouchEnd: planTouchEnd } = useSwipePager(day, handleDayChange);

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
        <nav className="day-tabs">
          {(['friday', 'saturday', 'sunday'] as Day[]).map(d => (
            <button
              key={d}
              className={`day-tab ${d === day ? 'active' : ''}`}
              onClick={() => handleDayChange(d)}
            >
              {DAY_LABELS[d]}
            </button>
          ))}
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
                  <ItineraryItem key={i} block={block} hoveredActId={null} onHoverAct={noop} onLeaveAct={noop} acts={allData[prevDay].acts} />
                ))}
              </div>
              <div className="plan-page" ref={itineraryScrollRef}>
                {itinerary.map((block, i) => (
                  <ItineraryItem key={i} block={block} hoveredActId={hoveredActId} onHoverAct={onHoverAct} onLeaveAct={onLeaveAct} acts={acts} />
                ))}
                {nowLineTop !== null && (
                  <div className="now-indicator" style={{ top: `${nowLineTop}px` }}>
                    <div className="now-indicator-triangle" />
                  </div>
                )}
              </div>
              <div className="plan-page">
                {nextDay && allData[nextDay].itinerary.map((block, i) => (
                  <ItineraryItem key={i} block={block} hoveredActId={null} onHoverAct={noop} onLeaveAct={noop} acts={allData[nextDay].acts} />
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
