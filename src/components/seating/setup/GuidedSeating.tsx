import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Crown, Search, SkipForward, User, Users, X } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { Guest, Table, VenueElement } from '../../../types/seating';
import { CANVAS_W, CANVAS_H, getTableSize } from '../tableLayout';
import { venueColor, hexToRgba } from '../venueElements';
import StepAnnouncement from '../StepAnnouncement';
import ContinueArrow from '../ContinueArrow';

export default function GuidedSeating() {
  const {
    guests,
    tables,
    venueElements,
    setGuests,
    assignGuestToSeat,
    updateTablePosition,
    setCurrentStep,
  } = useSeatingStore();

  const headTable = useMemo(() => tables.find(t => t.isHeadTable) ?? null, [tables]);

  // Non-head tables sorted by distance to head table.
  const sortedTables = useMemo(() => {
    const others = tables.filter(t => !t.isHeadTable);
    if (!headTable) return others;
    return [...others].sort((a, b) => {
      const da = Math.hypot(
        a.position.x - headTable.position.x,
        a.position.y - headTable.position.y,
      );
      const db = Math.hypot(
        b.position.x - headTable.position.x,
        b.position.y - headTable.position.y,
      );
      return da - db;
    });
  }, [tables, headTable]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [search, setSearch] = useState('');

  // Pulse the seat pills to guide the user's eye; stop once they interact.
  // Resets when the user moves to a different table.
  const [seatsTouched, setSeatsTouched] = useState(false);
  useEffect(() => {
    setSeatsTouched(false);
  }, [currentIdx]);

  const [announcement, setAnnouncement] = useState<
    { text: string; subtext?: string; icon?: React.ReactNode } | null
  >({
    text: 'Seat Your Guests',
    subtext: 'Starting with the table closest to the head table.',
    icon: <span style={{ fontSize: 54 }}>🪑</span>,
  });
  const mountedRef = useRef(false);
  useEffect(() => {
    // Skip the announcement on the first render (already shown via initial state)
    if (!mountedRef.current) { mountedRef.current = true; return; }
    setAnnouncement({
      text: `Seat Table ${currentIdx + 1}`,
      subtext: currentIdx === 0 ? 'Closest to the head table.' : `${ordinal(currentIdx + 1)} closest.`,
    });
  }, [currentIdx]);

  const currentTable = sortedTables[currentIdx] ?? null;

  const seatedAtCurrent = useMemo(
    () => (currentTable
      ? guests.filter(g => g.tableId === currentTable.id)
      : []
    ),
    [guests, currentTable]
  );

  const guestsById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const unseatedPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter(g =>
      g.tableId === null &&
      g.rsvpStatus !== 'No' &&
      (!q || g.name.toLowerCase().includes(q) || g.relationship.toLowerCase().includes(q))
    );
  }, [guests, search]);

  const totalUnseated = useMemo(
    () => guests.filter(g => g.tableId === null && g.rsvpStatus !== 'No').length,
    [guests]
  );

  const currentFull = currentTable
    ? seatedAtCurrent.length >= currentTable.capacity
    : false;

  const seatGuest = (guestId: string) => {
    if (!currentTable) return;
    const nextEmpty = currentTable.seats.findIndex(s => s === null);
    if (nextEmpty === -1) return; // no room
    assignGuestToSeat(currentTable.id, nextEmpty, guestId);
  };

  const seatGuestAtIndex = (guestId: string, seatIdx: number) => {
    if (!currentTable) return;
    assignGuestToSeat(currentTable.id, seatIdx, guestId);
  };

  const unseatAtIndex = (seatIdx: number) => {
    if (!currentTable) return;
    assignGuestToSeat(currentTable.id, seatIdx, null);
  };

  // Create a new guest from a typed name and seat them at a specific seat.
  const createAndSeat = (name: string, seatIdx: number) => {
    if (!currentTable) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const newGuest: Guest = {
      id: `guest-${Date.now()}`,
      name: trimmed,
      side: 'Both',
      relationship: '',
      plusOne: null,
      rsvpStatus: 'Yes',
      notes: '',
      photoUrl: null,
      howWeMet: null,
      memory: null,
      tableId: null,
    };
    setGuests([...guests, newGuest]);
    assignGuestToSeat(currentTable.id, seatIdx, newGuest.id);
  };

  const goPrev = () => setCurrentIdx(i => Math.max(0, i - 1));
  const goNext = () => setCurrentIdx(i => Math.min(sortedTables.length - 1, i + 1));

  const finish = () => setCurrentStep('workspace');

  const atLast = currentIdx >= sortedTables.length - 1;

  if (!currentTable || !headTable) {
    // Shouldn't normally happen — we only reach this step after TableSetupWizard.
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-cream-50">
        <div className="text-center max-w-md">
          <p className="font-playfair text-2xl text-gray-700 mb-2">No tables to seat</p>
          <p className="font-raleway text-sm text-gray-500 mb-5">
            Set up a head table and guest tables first.
          </p>
          <button
            onClick={() => setCurrentStep('setup')}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm transition-colors"
          >
            Back to Tables
          </button>
        </div>
      </div>
    );
  }

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
      {/* ── Guest pool sidebar ── */}
      <div className="w-72 flex-shrink-0 border-r border-cream-200 bg-cream-50 flex flex-col">
        <div className="p-4 border-b border-cream-200">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-playfair text-gray-700 text-base flex items-center gap-1.5">
              <Users size={15} className="text-gold-500" />
              Unseated
              <span className="font-raleway text-sm text-gray-400 ml-1">
                ({totalUnseated})
              </span>
            </h3>
          </div>
          <p className="font-raleway text-xs text-gray-500 mb-2">
            Click a guest to seat them at {currentTable.name}.
          </p>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg font-raleway focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {unseatedPool.length === 0 ? (
            <div className="text-center py-10 font-raleway text-sm text-gray-400">
              {totalUnseated === 0 ? 'Everyone is seated 🎉' : 'No matches.'}
            </div>
          ) : (
            unseatedPool.map(g => (
              <PoolGuestCard
                key={g.id}
                guest={g}
                disabled={currentFull}
                onSeat={() => seatGuest(g.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-cream-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-xl text-gray-800">{currentTable.name}</h2>
                <span className="font-raleway text-xs text-gray-400">
                  — table {currentIdx + 1} of {sortedTables.length}
                </span>
              </div>
              <p className="font-raleway text-xs text-gray-500">
                {currentIdx === 0 ? 'Closest to the head table.' : `${ordinal(currentIdx + 1)} closest to the head table.`}
              </p>
            </div>
            <div className={`text-right ${currentFull ? 'text-gold-600' : 'text-gray-500'}`}>
              <p className="font-playfair text-2xl leading-none">
                {seatedAtCurrent.length} / {currentTable.capacity}
              </p>
              <p className="font-raleway text-xs">seated</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Seat placeholders */}
          <div
            className="w-72 flex-shrink-0 border-r border-cream-200 flex flex-col"
            onMouseDown={() => setSeatsTouched(true)}
          >
            <div className="p-4 border-b border-cream-200">
              <p className="font-raleway text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Seats
              </p>
              <p className="font-raleway text-xs text-gray-400 mt-0.5">
                Click a name on the left or tap a seat to type.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {currentTable.seats.map((seatGuestId, idx) => (
                <SeatPlaceholder
                  key={idx}
                  index={idx}
                  guestId={seatGuestId}
                  guestsById={guestsById}
                  pool={unseatedPool}
                  pulse={!seatsTouched && seatedAtCurrent.length === 0}
                  onAssign={(guestId) => seatGuestAtIndex(guestId, idx)}
                  onCreate={(name) => createAndSeat(name, idx)}
                  onClear={() => unseatAtIndex(idx)}
                />
              ))}
            </div>

            {currentFull && (
              <div className="p-3 border-t border-cream-200 bg-green-50">
                <p className="font-raleway text-xs text-green-700 text-center">
                  ✓ Table full — move on to the next one.
                </p>
              </div>
            )}
          </div>

          {/* Mini floor plan */}
          <div className="flex-1 bg-cream-50 relative overflow-hidden">
            <MiniFloorPlan
              tables={tables}
              headTable={headTable}
              venueElements={venueElements}
              highlightTableId={currentTable.id}
              onPickTable={(id) => {
                const idx = sortedTables.findIndex(t => t.id === id);
                if (idx >= 0) setCurrentIdx(idx);
              }}
              onMoveTable={(id, x, y) => updateTablePosition(id, { x, y })}
            />
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 px-3 py-1.5 bg-white/90 rounded-full border border-cream-200 font-raleway text-xs text-gray-500 shadow-sm pointer-events-none">
              Click a table to seat it — drag to reposition
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-cream-200 bg-white flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl font-raleway text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {!atLast && (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-4 py-2 font-raleway text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <SkipForward size={14} /> Skip for now
              </button>
            )}
            {atLast ? (
              <div className="relative">
                {currentFull && <ContinueArrow label="You're done — finish up!" />}
                <button
                  onClick={finish}
                  className="flex items-center gap-1.5 px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors"
                >
                  Finish <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                {currentFull && <ContinueArrow label="Table full — next!" />}
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors"
                >
                  Next Table <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pool guest card ──────────────────────────────────────────────────────────

function PoolGuestCard({
  guest,
  disabled,
  onSeat,
}: {
  guest: Guest;
  disabled: boolean;
  onSeat: () => void;
}) {
  const sideColor =
    guest.side === 'Bride' ? 'bg-pink-400' :
    guest.side === 'Groom' ? 'bg-blue-400' : 'bg-purple-400';

  return (
    <button
      type="button"
      onClick={onSeat}
      disabled={disabled}
      title={disabled ? 'Table is full' : `Seat ${guest.name}`}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-gold-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
    >
      <div className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center flex-shrink-0">
        <User size={12} className="text-gold-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-raleway text-xs font-medium text-gray-700 truncate">{guest.name}</p>
        <div className="flex items-center gap-1">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sideColor}`} />
          <p className="font-raleway text-xs text-gray-400 truncate">{guest.relationship}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Mini floor plan ──────────────────────────────────────────────────────────

function MiniFloorPlan({
  tables,
  headTable,
  venueElements,
  highlightTableId,
  onPickTable,
  onMoveTable,
}: {
  tables: Table[];
  headTable: Table;
  venueElements: VenueElement[];
  highlightTableId: string;
  onPickTable: (id: string) => void;
  onMoveTable: (id: string, x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);

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

  const pad = 24;
  const scale = size.w && size.h
    ? Math.min((size.w - pad * 2) / CANVAS_W, (size.h - pad * 2) / CANVAS_H)
    : 1;
  const offsetX = (size.w - CANVAS_W * scale) / 2;
  const offsetY = (size.h - CANVAS_H * scale) / 2;

  // Head-table display dims (same approach as ElementsSetup)
  const headDims = headTable.shape === 'rectangle'
    ? { w: 320, h: 80 }
    : { w: 200, h: 200 };

  // Drag-or-click handler for guest tables. Moves > 3px → drag; otherwise
  // treated as a click (jump to that table).
  const startTableInteraction = (e: React.MouseEvent, t: Table) => {
    e.preventDefault();
    e.stopPropagation();
    const startMX = e.clientX;
    const startMY = e.clientY;
    const startX = t.position.x;
    const startY = t.position.y;
    let moved = false;

    setDraggingId(t.id);

    const onMove = (me: MouseEvent) => {
      const dx = (me.clientX - startMX) / scale;
      const dy = (me.clientY - startMY) / scale;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      if (moved) {
        const dims = getTableSize(t);
        const nx = Math.max(0, Math.min(CANVAS_W - dims.w, startX + dx));
        const ny = Math.max(0, Math.min(CANVAS_H - dims.h, startY + dy));
        onMoveTable(t.id, nx, ny);
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setDraggingId(null);
      if (!moved) onPickTable(t.id);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Floor plan frame */}
      <div
        className="absolute bg-white border border-gray-200 shadow-sm"
        style={{
          left: offsetX,
          top: offsetY,
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
        }}
      />

      {/* Venue elements */}
      {venueElements.map(el => {
        const color = venueColor(el.type);
        return (
          <div
            key={el.id}
            className="absolute pointer-events-none select-none"
            style={{
              left: offsetX + el.x * scale,
              top: offsetY + el.y * scale,
              width: el.w * scale,
              height: el.h * scale,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              transformOrigin: 'center',
              background: hexToRgba(color, 0.1),
              border: `1.5px solid ${hexToRgba(color, 0.5)}`,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.max(10, Math.min(el.w, el.h) * scale * 0.35),
            }}
          >
            {el.icon}
          </div>
        );
      })}

      {/* Head table */}
      <div
        className="absolute pointer-events-none select-none flex items-center justify-center"
        style={{
          left: offsetX + (headTable.position.x - headDims.w / 2) * scale,
          top: offsetY + (headTable.position.y - headDims.h / 2) * scale,
          width: headDims.w * scale,
          height: headDims.h * scale,
          transform: headTable.rotation ? `rotate(${headTable.rotation}deg)` : undefined,
          transformOrigin: 'center',
          background: 'rgba(201,135,58,0.12)',
          border: '2px solid rgba(201,135,58,0.7)',
          borderRadius: headTable.shape === 'circle' ? '50%' : 6,
        }}
      >
        <Crown size={Math.max(10, 14 * scale)} className="text-gold-600" />
      </div>

      {/* Guest tables */}
      {tables.filter(t => !t.isHeadTable).map(t => {
        const dims = getTableSize(t);
        const isHighlighted = t.id === highlightTableId;
        const filled = t.guestIds.length;
        const pct = t.capacity > 0 ? filled / t.capacity : 0;
        const complete = filled >= t.capacity;
        const radius = t.shape === 'circle' ? '50%' : 6;
        const isDragging = draggingId === t.id;
        return (
          <div
            key={t.id}
            className="absolute"
            style={{
              left: offsetX + t.position.x * scale,
              top: offsetY + t.position.y * scale,
              width: dims.w * scale,
              height: dims.h * scale,
              zIndex: isDragging ? 30 : isHighlighted ? 10 : 1,
            }}
          >
            {isHighlighted && !isDragging && (
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none animate-halo-ping bg-gold-400"
                style={{ borderRadius: radius, transformOrigin: 'center' }}
              />
            )}
            <div
              onMouseDown={(e) => startTableInteraction(e, t)}
              role="button"
              tabIndex={0}
              title={`${t.name} — ${filled}/${t.capacity} (drag to move, click to seat)`}
              className={`relative w-full h-full flex items-center justify-center select-none transition-shadow ${
                isDragging ? 'cursor-grabbing shadow-lg' :
                isHighlighted ? 'animate-pulse-ring-gold cursor-grab' :
                'cursor-grab hover:shadow-md'
              }`}
              style={{
                transform: t.rotation ? `rotate(${t.rotation}deg)` : undefined,
                transformOrigin: 'center',
                background: isHighlighted
                  ? 'rgba(201,135,58,0.14)'
                  : complete
                    ? 'rgba(34,197,94,0.1)'
                    : 'white',
                border: `1.5px solid ${
                  isHighlighted ? '#c9873a' : complete ? 'rgba(34,197,94,0.6)' : '#d1d5db'
                }`,
                borderRadius: radius,
                padding: 2,
              }}
            >
              <div className="flex flex-col items-center leading-tight">
                <span
                  className="font-playfair text-gray-700"
                  style={{ fontSize: Math.max(9, 11 * scale) }}
                >
                  {t.name}
                </span>
                <span
                  className="font-raleway"
                  style={{
                    fontSize: Math.max(8, 10 * scale),
                    color: isHighlighted ? '#c9873a' : complete ? '#15803d' : '#9ca3af',
                    fontWeight: isHighlighted ? 600 : 400,
                  }}
                >
                  {filled}/{t.capacity}
                </span>
              </div>
              {!isHighlighted && !complete && pct > 0 && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 bg-gold-400"
                  style={{ width: `${pct * 100}%` }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Seat placeholder ─────────────────────────────────────────────────────────

function SeatPlaceholder({
  index,
  guestId,
  guestsById,
  pool,
  pulse,
  onAssign,
  onCreate,
  onClear,
}: {
  index: number;
  guestId: string | null;
  guestsById: Map<string, Guest>;
  pool: Guest[];
  pulse: boolean;
  onAssign: (guestId: string) => void;
  onCreate: (name: string) => void;
  onClear: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const guest = guestId ? guestsById.get(guestId) ?? null : null;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!editing) return [];
    if (!q) return pool.slice(0, 6);
    return pool.filter(g => g.name.toLowerCase().includes(q)).slice(0, 6);
  }, [editing, pool, query]);

  useEffect(() => {
    if (editing) {
      setHighlight(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [editing]);

  const close = () => { setEditing(false); setQuery(''); };

  const commit = () => {
    const picked = suggestions[highlight];
    if (picked) onAssign(picked.id);
    else if (query.trim()) onCreate(query);
    close();
  };

  // Empty seat — curved placeholder pill, click to type
  if (!guest && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-full border-2 border-dashed bg-white hover:border-gold-400 hover:bg-gold-50 transition-colors text-left ${
          pulse ? 'animate-pulse-seat' : 'border-gray-300'
        }`}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-raleway text-xs font-semibold">
          {index + 1}
        </span>
        <span className="font-raleway text-sm text-gray-400">Seat {index + 1}</span>
      </button>
    );
  }

  // Filled seat — guest name pill with × to unseat
  if (guest && !editing) {
    return (
      <div className="group w-full flex items-center gap-2 px-3 py-2 rounded-full border-2 border-gold-300 bg-gold-50">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center font-raleway text-xs font-semibold">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-raleway text-sm font-medium text-gray-700 truncate">
            {guest.name}
          </p>
          {guest.relationship && (
            <p className="font-raleway text-xs text-gray-400 truncate leading-tight">
              {guest.relationship}
            </p>
          )}
        </div>
        <button
          onClick={onClear}
          className="w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Unseat"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  // Editing — input with autocomplete
  return (
    <div className="relative">
      <div className="w-full flex items-center gap-2 px-3 py-2 rounded-full border-2 border-gold-500 bg-white shadow-sm">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center font-raleway text-xs font-semibold">
          {index + 1}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); close(); }
            else if (e.key === 'Enter') { e.preventDefault(); commit(); }
            else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight(h => Math.min(suggestions.length - 1, h + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight(h => Math.max(0, h - 1));
            }
          }}
          onBlur={() => setTimeout(close, 150)}
          placeholder="Type a name..."
          className="flex-1 font-raleway text-sm bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300 min-w-0"
        />
      </div>
      {(suggestions.length > 0 || query.trim()) && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onAssign(s.id); close(); }}
              className={`w-full px-3 py-1.5 text-left font-raleway text-xs flex items-center gap-2 ${
                i === highlight ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={12} className="text-gold-500 flex-shrink-0" />
              <span className="truncate flex-1">{s.name}</span>
              {s.relationship && (
                <span className="text-gray-400 truncate text-[10px]">{s.relationship}</span>
              )}
            </button>
          ))}
          {query.trim() &&
            !suggestions.some(s => s.name.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onCreate(query); close(); }}
                className="w-full px-3 py-1.5 text-left font-raleway text-xs border-t border-gray-100 text-gold-700 hover:bg-gold-50 flex items-center gap-2"
              >
                <span className="text-base leading-none">＋</span>
                <span className="truncate">Add "{query.trim()}"</span>
              </button>
            )}
        </div>
      )}
    </div>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
