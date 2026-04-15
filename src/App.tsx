import { useState, useCallback, useRef } from 'react';
import { allData, STAGES, STAGE_LABELS } from './data';
import type { Day, Act, ItineraryBlock } from './data';
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
  saturday: [13 * 60, 24.5 * 60],
  sunday: [13 * 60, 23.5 * 60],
};

const DAY_LABELS: Record<Day, string> = {
  friday: 'FRIDAY',
  saturday: 'SATURDAY',
  sunday: 'SUNDAY',
};

const HOUR_PX = 80;

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
      {act.priority === 'must' && <div className="must-badge">★</div>}
    </div>
  );
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

function ScheduleGrid({ acts, day, hoveredActId, onHoverAct, onLeaveAct }: {
  acts: Act[];
  day: Day;
  hoveredActId: string | null;
  onHoverAct: (id: string, scrollGrid?: boolean) => void;
  onLeaveAct: () => void;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const onGridScroll = useCallback(() => {
    if (headerRef.current && scrollRef.current) {
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }, []);

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

  return (
    <div
      className={`itinerary-item ${block.type} ${isHighlighted ? 'it-highlighted' : ''} ${isMustSee ? 'it-must-see' : ''} ${isLocked ? 'it-locked' : ''}`}
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
          <div className="it-card-header">
            {actData && <PickDot picked={actData.picked} />}
            <span className="it-title">{block.title}</span>
          </div>
          {(block.stage || block.type === 'act') && (
            <div className="it-card-meta">
              {block.stage && <span className="it-stage">{block.stage}</span>}
              {block.type === 'act' && <span className="it-timerange">{formatTime(block.start)}-{formatTime(block.end)}</span>}
            </div>
          )}
          {block.subtitle && <div className="it-subtitle">{block.subtitle}</div>}
          {block.note && <div className="it-note">{block.note}</div>}
          {block.options && block.options.length > 0 && (() => {
            const tentatives = block.options.filter(o => o.tentative);
            const others = block.options.filter(o => !o.tentative);
            return (
              <div className="it-options">
                {tentatives.length > 0 && (
                  <>
                    <div className="it-options-label">Probably:</div>
                    {tentatives.map(opt => (
                      <div
                        key={opt.actId}
                        className={`it-option opt-tentative ${hoveredActId === opt.actId ? 'opt-highlighted' : ''}`}
                        onMouseEnter={(e) => { e.stopPropagation(); onHoverAct(opt.actId, true); }}
                        onMouseLeave={(e) => { e.stopPropagation(); onLeaveAct(); }}
                      >
                        <PickDot picked={acts.find(a => a.id === opt.actId)?.picked} />
                        <span className="opt-name">{opt.name}</span>
                        <span className="opt-detail">{opt.stage}</span>
                      </div>
                    ))}
                  </>
                )}
                {others.length > 0 && (
                  <>
                    <div className="it-options-label">{tentatives.length > 0 ? 'Or:' : 'Options:'}</div>
                    {others.map(opt => (
                      <div
                        key={opt.actId}
                        className={`it-option ${hoveredActId === opt.actId ? 'opt-highlighted' : ''}`}
                        onMouseEnter={(e) => { e.stopPropagation(); onHoverAct(opt.actId, true); }}
                        onMouseLeave={(e) => { e.stopPropagation(); onLeaveAct(); }}
                      >
                        <PickDot picked={acts.find(a => a.id === opt.actId)?.picked} />
                        <span className="opt-name">{opt.name}</span>
                        <span className="opt-detail">{opt.stage}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [day, setDay] = useState<Day>('friday');
  const [hoveredActId, setHoveredActId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'grid' | 'schedule' | 'map'>('schedule');
  const [showMap, setShowMap] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

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
            <button className={`view-tab ${mobileView === 'schedule' ? 'active' : ''}`} onClick={() => setMobileView('schedule')}>Schedule</button>
            <button className={`view-tab ${mobileView === 'grid' ? 'active' : ''}`} onClick={() => setMobileView('grid')}>Lineup</button>
            <button className={`view-tab ${mobileView === 'map' ? 'active' : ''}`} onClick={() => setMobileView('map')}>Map</button>
          </div>
        </div>
        <nav className="day-tabs">
          {(['friday', 'saturday', 'sunday'] as Day[]).map(d => (
            <button
              key={d}
              className={`day-tab ${d === day ? 'active' : ''}`}
              onClick={() => { setDay(d); setHoveredActId(null); }}
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
        <div className={`grid-panel ${mobileView === 'grid' ? 'mobile-active' : ''}`}>
          <ScheduleGrid
            acts={acts}
            day={day}
            hoveredActId={hoveredActId}
            onHoverAct={onHoverAct}
            onLeaveAct={onLeaveAct}
          />
        </div>
        <div className="divider" />
        <div className={`schedule-panel ${mobileView === 'schedule' ? 'mobile-active' : ''}`}>
          <div className="schedule-panel-header">Our Schedule</div>
          <div className="itinerary-scroll">
            {itinerary.map((block, i) => (
              <ItineraryItem
                key={i}
                block={block}
                hoveredActId={hoveredActId}
                onHoverAct={onHoverAct}
                onLeaveAct={onLeaveAct}
                acts={acts}
              />
            ))}
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
