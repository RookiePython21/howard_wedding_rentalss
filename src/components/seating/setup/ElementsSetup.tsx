import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Crown, MousePointerClick, Move, RotateCcw, RotateCw, X } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { Table, VenueElement } from '../../../types/seating';
import {
  VENUE_ELEMENTS,
  venueConfig,
  venueColor,
  venueDefaultSize,
  hexToRgba,
} from '../venueElements';
import StepAnnouncement from '../StepAnnouncement';
import ContinueArrow from '../ContinueArrow';

const WORLD_W = 1400;
const WORLD_H = 1000;

// Rough display-only dimensions for the head-table reference.
// The workspace computes real sizes at render-time; here we just need a shape
// that conveys spatial context.
const headTableDims = (t: Table): { w: number; h: number } => {
  if (t.shape === 'rectangle') return { w: 320, h: 80 };
  return { w: 200, h: 200 };
};

type Phase = 'head' | 'select' | 'place';

export default function ElementsSetup() {
  const {
    tables,
    venueElements,
    setVenueElements,
    addVenueElement,
    updateVenueElement,
    removeVenueElement,
    updateTable,
    setCurrentStep,
  } = useSeatingStore();

  const headTable = useMemo(() => tables.find(t => t.isHeadTable) ?? null, [tables]);

  // If returning to this step, seed selection from already-placed elements.
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    () => new Set(venueElements.map(e => e.type))
  );
  // First visit: user positions head table → picks elements → places each.
  // Returning visit (some elements already exist): skip head-placement.
  const [phase, setPhase] = useState<Phase>(
    venueElements.length > 0 ? 'place' : 'head'
  );
  const [placingType, setPlacingType] = useState<string | null>(null);

  // Flashing "now do this" banners between phases + per-element.
  const [announcement, setAnnouncement] = useState<
    { text: string; subtext?: string; icon?: React.ReactNode } | null
  >(() => (venueElements.length > 0 ? null : {
    text: 'Place the Head Table',
    subtext: 'Drag it to where it will sit in the room.',
    icon: <Crown size={54} className="text-gold-500 mx-auto" />,
  }));

  useEffect(() => {
    if (phase === 'select') {
      setAnnouncement({
        text: 'Pick Your Elements',
        subtext: 'Choose what your venue includes.',
      });
    }
    // 'head' is announced on mount; 'place' announcements happen per-element below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== 'place' || !placingType) return;
    const cfg = venueConfig(placingType);
    if (!cfg) return;
    setAnnouncement({
      text: `Place the ${cfg.label}`,
      subtext: 'Click anywhere on the floor plan.',
      icon: <span style={{ fontSize: 54 }}>{cfg.icon}</span>,
    });
  }, [placingType, phase]);

  // Keep placingType in sync with the first unplaced selection.
  useEffect(() => {
    if (phase !== 'place') return;
    const placed = new Set(venueElements.map(e => e.type));
    if (placingType && !placed.has(placingType)) return; // still need to place current
    const next = Array.from(selectedTypes).find(t => !placed.has(t));
    setPlacingType(next ?? null);
  }, [phase, placingType, selectedTypes, venueElements]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const enterPlacePhase = () => {
    // Drop any stray venueElements that are no longer selected.
    const keep = venueElements.filter(e => selectedTypes.has(e.type));
    if (keep.length !== venueElements.length) setVenueElements(keep);
    setPhase('place');
  };

  const handlePlace = (worldX: number, worldY: number) => {
    if (!placingType) return;
    const cfg = venueConfig(placingType);
    if (!cfg) return;
    const size = cfg.defaultSize ?? venueDefaultSize(placingType);
    addVenueElement({
      id: `vel-${Date.now()}`,
      type: placingType,
      icon: cfg.icon,
      label: cfg.label,
      x: Math.max(0, Math.min(WORLD_W - size.w, worldX - size.w / 2)),
      y: Math.max(0, Math.min(WORLD_H - size.h, worldY - size.h / 2)),
      w: size.w,
      h: size.h,
      rotation: 0,
    });
  };

  const replaceType = (type: string) => {
    const existing = venueElements.find(e => e.type === type);
    if (existing) removeVenueElement(existing.id);
    setPlacingType(type);
  };

  const placedTypes = useMemo(
    () => new Set(venueElements.map(e => e.type)),
    [venueElements]
  );
  const allPlaced = selectedTypes.size > 0 &&
    Array.from(selectedTypes).every(t => placedTypes.has(t));

  return (
    <div className="flex-1 flex overflow-hidden bg-white relative">
      {announcement && (
        <StepAnnouncement
          key={announcement.text}
          text={announcement.text}
          subtext={announcement.subtext}
          icon={announcement.icon}
          onDone={() => setAnnouncement(null)}
        />
      )}
      {/* ── Sidebar ── */}
      <div className="w-80 flex-shrink-0 border-r border-cream-200 bg-cream-50 flex flex-col">
        <div className="p-5 border-b border-cream-200">
          <h2 className="font-playfair text-2xl text-gray-800 mb-1">
            {phase === 'head' ? 'Place Your Head Table' : 'Floor Plan Elements'}
          </h2>
          <p className="font-raleway text-sm text-gray-500 leading-relaxed">
            {phase === 'head'
              ? 'Drag the head table to where it will sit in the room.'
              : phase === 'select'
                ? 'Pick which elements your venue will include.'
                : 'Click the floor plan to drop each element where it belongs.'}
          </p>
        </div>

        {phase === 'head' ? (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="p-4 bg-white border border-cream-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-gold-500" />
                  <span className="font-playfair text-lg text-gray-800">Head Table</span>
                </div>
                <p className="font-raleway text-sm text-gray-500 leading-relaxed">
                  {headTable ? (
                    <>
                      {headTable.shape === 'rectangle' ? 'Rectangle' : headTable.shape === 'circle' ? 'Round' : 'Square'}
                      , seats {headTable.capacity}. Drag it on the canvas to pick its spot.
                    </>
                  ) : 'No head table set up yet.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                <Move size={14} className="text-gold-600 flex-shrink-0 mt-0.5" />
                <p className="font-raleway text-xs text-gold-800 leading-relaxed">
                  Think about where the bride and groom should face the room.
                  Usually near a wall or at the end of the dance floor.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-cream-200 flex justify-between gap-3">
              <button
                onClick={() => setCurrentStep('head-table')}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl font-raleway text-sm text-gray-600 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="relative">
                {headTable && <ContinueArrow label="Ready? Continue!" />}
                <button
                  onClick={() => setPhase('select')}
                  disabled={!headTable}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Elements <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : phase === 'select' ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {VENUE_ELEMENTS.map(el => {
                const checked = selectedTypes.has(el.type);
                return (
                  <label
                    key={el.type}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'border-gold-500 bg-white'
                        : 'border-gray-200 bg-white hover:border-gold-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked ? 'border-gold-500 bg-gold-500 text-white' : 'border-gray-300'
                      }`}
                    >
                      {checked && <Check size={12} strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleType(el.type)}
                      className="hidden"
                    />
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ background: hexToRgba(el.color, 0.18) }}
                    >
                      {el.icon}
                    </span>
                    <span className="font-raleway text-sm text-gray-700 flex-1">{el.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-cream-200 flex justify-between gap-3">
              <button
                onClick={() => setPhase('head')}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl font-raleway text-sm text-gray-600 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="relative">
                {selectedTypes.size > 0 && <ContinueArrow label="Let's place them!" />}
                <button
                  onClick={enterPlacePhase}
                  disabled={selectedTypes.size === 0}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Elements <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Now placing banner */}
            <div className="p-4 bg-gold-50 border-b border-gold-200">
              {placingType ? (
                <>
                  <p className="font-raleway text-xs text-gold-700 uppercase tracking-wider mb-1.5">
                    Now placing
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{venueConfig(placingType)?.icon}</span>
                    <span className="font-playfair text-lg text-gray-800">
                      {venueConfig(placingType)?.label}
                    </span>
                  </div>
                  <p className="font-raleway text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                    <MousePointerClick size={12} />
                    Click the floor plan to drop it.
                  </p>
                </>
              ) : (
                <p className="font-raleway text-sm text-green-700 font-medium">
                  ✓ All elements placed — ready to continue.
                </p>
              )}
            </div>

            {/* Placement queue */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {Array.from(selectedTypes).map(type => {
                const cfg = venueConfig(type);
                const isPlaced = placedTypes.has(type);
                const isActive = type === placingType;
                if (!cfg) return null;
                return (
                  <div
                    key={type}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      isActive
                        ? 'border-gold-500 bg-gold-50'
                        : isPlaced
                          ? 'border-cream-200 bg-white'
                          : 'border-dashed border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                      {isPlaced
                        ? <Check size={14} className="text-gold-600" strokeWidth={3} />
                        : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                    </div>
                    <span className="text-sm">{cfg.icon}</span>
                    <span className="font-raleway text-sm text-gray-700 flex-1">{cfg.label}</span>
                    {isPlaced && (
                      <button
                        onClick={() => replaceType(type)}
                        className="flex items-center gap-1 text-xs font-raleway text-gray-400 hover:text-gold-700 px-2 py-0.5 rounded"
                        title="Re-place this element"
                      >
                        <RotateCcw size={11} /> Redo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-cream-200 flex justify-between gap-3">
              <button
                onClick={() => setPhase('select')}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl font-raleway text-sm text-gray-600 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Edit Selection
              </button>
              <div className="relative">
                {allPlaced && <ContinueArrow label="All placed — continue!" />}
                <button
                  onClick={() => setCurrentStep('setup')}
                  disabled={!allPlaced}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Tables <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 relative overflow-hidden bg-cream-50">
        <PlacementCanvas
          headTable={headTable}
          elements={venueElements}
          placingType={phase === 'place' ? placingType : null}
          headTableInteractive={phase === 'head'}
          onPlace={handlePlace}
          onMoveElement={(id, x, y) => updateVenueElement(id, { x, y })}
          onRotateElement={(id, rotation) => updateVenueElement(id, { rotation })}
          onRemoveElement={removeVenueElement}
          onMoveHeadTable={(x, y) => headTable && updateTable(headTable.id, { position: { x, y } })}
          onRotateHeadTable={(rotation) => headTable && updateTable(headTable.id, { rotation })}
        />
      </div>
    </div>
  );
}

// ─── Canvas ────────────────────────────────────────────────────────────────────

function PlacementCanvas({
  headTable,
  elements,
  placingType,
  headTableInteractive,
  onPlace,
  onMoveElement,
  onRotateElement,
  onRemoveElement,
  onMoveHeadTable,
  onRotateHeadTable,
}: {
  headTable: Table | null;
  elements: VenueElement[];
  placingType: string | null;
  headTableInteractive: boolean;
  onPlace: (worldX: number, worldY: number) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onRotateElement: (id: string, rotation: number) => void;
  onRemoveElement: (id: string) => void;
  onMoveHeadTable: (x: number, y: number) => void;
  onRotateHeadTable: (rotation: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; sx: number; sy: number; ex: number; ey: number; moved: boolean } | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const pad = 32;
  const scale = size.w && size.h
    ? Math.min((size.w - pad * 2) / WORLD_W, (size.h - pad * 2) / WORLD_H)
    : 1;
  const offsetX = (size.w - WORLD_W * scale) / 2;
  const offsetY = (size.h - WORLD_H * scale) / 2;

  const screenToWorld = (clientX: number, clientY: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return {
      x: (clientX - r.left - offsetX) / scale,
      y: (clientY - r.top - offsetY) / scale,
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!placingType) return;
    // Ignore clicks that came from finishing a drag
    if (dragRef.current?.moved) return;
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    if (x < 0 || x > WORLD_W || y < 0 || y > WORLD_H) return;
    onPlace(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!placingType) { setHover(null); return; }
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    if (x < 0 || x > WORLD_W || y < 0 || y > WORLD_H) {
      setHover(null);
    } else {
      setHover({ x, y });
    }
  };

  const startDrag = (e: React.MouseEvent, el: VenueElement) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      id: el.id, sx: e.clientX, sy: e.clientY,
      ex: el.x, ey: el.y, moved: false,
    };
    const onMove = (me: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (me.clientX - d.sx) / scale;
      const dy = (me.clientY - d.sy) / scale;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true;
      onMoveElement(d.id, Math.max(0, d.ex + dx), Math.max(0, d.ey + dy));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // Reset dragRef.moved after a frame so click-to-place doesn't fire
      setTimeout(() => { dragRef.current = null; }, 0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startHeadDrag = (e: React.MouseEvent) => {
    if (!headTable) return;
    e.stopPropagation();
    e.preventDefault();
    const startMX = e.clientX;
    const startMY = e.clientY;
    const startX = headTable.position.x;
    const startY = headTable.position.y;
    let moved = false;
    const onMove = (me: MouseEvent) => {
      const dx = (me.clientX - startMX) / scale;
      const dy = (me.clientY - startMY) / scale;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
      onMoveHeadTable(
        Math.max(0, Math.min(WORLD_W, startX + dx)),
        Math.max(0, Math.min(WORLD_H, startY + dy)),
      );
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // Same guard as startDrag: suppress click-to-place from this gesture
      if (moved) {
        dragRef.current = { id: '__head__', sx: 0, sy: 0, ex: 0, ey: 0, moved: true };
        setTimeout(() => { dragRef.current = null; }, 0);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Shared rotation handler. `centerWorld` is the element's center in world
  // coords; we use the container rect + offset/scale to translate to screen
  // coords for angle math.
  const startRotateAt = (
    e: React.MouseEvent,
    centerWorldX: number,
    centerWorldY: number,
    startRotation: number,
    commit: (deg: number) => void,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + offsetX + centerWorldX * scale;
    const cy = r.top + offsetY + centerWorldY * scale;
    const startMouseAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    const onMove = (me: MouseEvent) => {
      const currentAngle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      let deg = startRotation + (currentAngle - startMouseAngle);
      if (me.shiftKey) deg = Math.round(deg / 15) * 15;
      commit(deg);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // Suppress canvas click-to-place that'd fire right after the drag
      dragRef.current = { id: '__rot__', sx: 0, sy: 0, ex: 0, ey: 0, moved: true };
      setTimeout(() => { dragRef.current = null; }, 0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const ghostCfg = placingType ? venueConfig(placingType) : null;
  const ghostSize = ghostCfg?.defaultSize ?? (placingType ? venueDefaultSize(placingType) : { w: 90, h: 90 });

  const headDims = headTable ? headTableDims(headTable) : null;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${placingType ? 'cursor-crosshair' : ''}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      {/* Floor plan frame */}
      <div
        className="absolute bg-white border-2 border-gray-200 shadow-sm"
        style={{
          left: offsetX,
          top: offsetY,
          width: WORLD_W * scale,
          height: WORLD_H * scale,
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
        }}
      />

      {/* Head table reference (interactive in 'head' phase) */}
      {headTable && headDims && (
        <div
          onMouseDown={headTableInteractive ? (e) => startHeadDrag(e) : undefined}
          className={`absolute group flex items-center justify-center select-none ${
            headTableInteractive ? 'cursor-move' : 'pointer-events-none'
          }`}
          style={{
            left: offsetX + (headTable.position.x - headDims.w / 2) * scale,
            top: offsetY + (headTable.position.y - headDims.h / 2) * scale,
            width: headDims.w * scale,
            height: headDims.h * scale,
            transform: headTable.rotation ? `rotate(${headTable.rotation}deg)` : undefined,
            transformOrigin: 'center',
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: headTableInteractive ? 'rgba(201,135,58,0.18)' : 'rgba(201,135,58,0.1)',
              border: `${headTableInteractive ? 2.5 : 2}px ${headTableInteractive ? 'solid' : 'dashed'} rgba(201,135,58,${headTableInteractive ? 0.9 : 0.7})`,
              borderRadius: headTable.shape === 'circle' ? '50%' : 8,
              boxShadow: headTableInteractive ? '0 4px 12px rgba(201,135,58,0.25)' : undefined,
            }}
          >
            <span className="font-playfair text-gold-700" style={{ fontSize: Math.max(10, 16 * scale) }}>
              👑 Head Table
            </span>
          </div>
          {headTableInteractive && (
            <button
              onMouseDown={e => startRotateAt(
                e,
                headTable.position.x,
                headTable.position.y,
                headTable.rotation ?? 0,
                onRotateHeadTable,
              )}
              title="Drag to rotate (Shift for 15°)"
              className="absolute left-1/2 -translate-x-1/2 -top-9 w-7 h-7 bg-white border-2 border-gold-500 rounded-full flex items-center justify-center shadow cursor-grab active:cursor-grabbing"
            >
              <RotateCw size={13} className="text-gold-600" />
            </button>
          )}
        </div>
      )}

      {/* Placed elements */}
      {elements.map(el => {
        const color = venueColor(el.type);
        return (
          <div
            key={el.id}
            onMouseDown={e => startDrag(e, el)}
            className="absolute group cursor-move select-none"
            style={{
              left: offsetX + el.x * scale,
              top: offsetY + el.y * scale,
              width: el.w * scale,
              height: el.h * scale,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              transformOrigin: 'center',
            }}
          >
            <div
              className="w-full h-full flex flex-col items-center justify-center rounded-lg"
              style={{
                background: hexToRgba(color, 0.14),
                border: `2px solid ${hexToRgba(color, 0.65)}`,
              }}
            >
              <span style={{ fontSize: Math.max(14, Math.min(el.w, el.h) * scale * 0.4) }}>
                {el.icon}
              </span>
              <span
                className="font-raleway text-gray-600 px-1.5 py-0.5 bg-white/85 rounded mt-0.5"
                style={{ fontSize: Math.max(9, 11 * scale), whiteSpace: 'nowrap' }}
              >
                {el.label}
              </span>
            </div>
            <button
              onMouseDown={e => startRotateAt(
                e,
                el.x + el.w / 2,
                el.y + el.h / 2,
                el.rotation ?? 0,
                (deg) => onRotateElement(el.id, deg),
              )}
              title="Drag to rotate (Shift for 15°)"
              className="absolute left-1/2 -translate-x-1/2 -top-8 w-6 h-6 bg-white border-2 rounded-full flex items-center justify-center shadow cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ borderColor: color }}
            >
              <RotateCw size={11} style={{ color }} />
            </button>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onRemoveElement(el.id); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
              title="Remove"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      {/* Ghost while placing */}
      {placingType && ghostCfg && hover && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: offsetX + (hover.x - ghostSize.w / 2) * scale,
            top: offsetY + (hover.y - ghostSize.h / 2) * scale,
            width: ghostSize.w * scale,
            height: ghostSize.h * scale,
          }}
        >
          <div
            className="w-full h-full flex flex-col items-center justify-center rounded-lg"
            style={{
              background: hexToRgba(ghostCfg.color, 0.2),
              border: `2px dashed ${hexToRgba(ghostCfg.color, 0.9)}`,
              opacity: 0.75,
            }}
          >
            <span style={{ fontSize: Math.max(14, Math.min(ghostSize.w, ghostSize.h) * scale * 0.4) }}>
              {ghostCfg.icon}
            </span>
          </div>
          {/* Label below the ghost so the user knows what they're placing */}
          <div
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-raleway text-xs px-2 py-1 rounded-full shadow-sm"
            style={{
              top: '100%',
              marginTop: 8,
              background: 'white',
              border: `1.5px solid ${hexToRgba(ghostCfg.color, 0.9)}`,
              color: ghostCfg.color,
              fontWeight: 600,
            }}
          >
            {ghostCfg.label}
          </div>
        </div>
      )}

      {/* Empty hint */}
      {placingType && !hover && (
        <div className="absolute left-1/2 top-6 -translate-x-1/2 px-3 py-1.5 bg-gray-800/80 text-white rounded-full font-raleway text-xs pointer-events-none">
          Click anywhere on the floor plan to place {venueConfig(placingType)?.label}
        </div>
      )}
    </div>
  );
}
