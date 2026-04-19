import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import StepAnnouncement from '../StepAnnouncement';
import ContinueArrow from '../ContinueArrow';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Plus,
  Search,
  User,
  X,
} from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { Guest, Table } from '../../../types/seating';

type Shape = Table['shape'];

// ─── Seat layout helpers ──────────────────────────────────────────────────────
// Returns seat (x, y) offsets in pixels relative to the table center.

interface SeatLayout {
  seats: { x: number; y: number }[];
  tableWidth: number;
  tableHeight: number;
}

const SEAT_SIZE = 54;
const SEAT_GAP = 22; // visible air between two adjacent seats
const SEAT_PITCH = SEAT_SIZE + SEAT_GAP; // distance between seat centers

const layoutSeats = (shape: Shape, capacity: number): SeatLayout => {
  const n = Math.max(1, capacity);
  const seatOffset = 38; // distance from table edge to seat center

  if (shape === 'circle') {
    // Radius must be large enough that arc-length between seats >= SEAT_PITCH.
    const minRadiusFromPacking = n > 1 ? SEAT_PITCH / (2 * Math.sin(Math.PI / n)) : 80;
    const radius = Math.max(90, minRadiusFromPacking);
    const tableSize = radius * 2;
    const ringR = radius + seatOffset;
    const seats = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * ringR, y: Math.sin(a) * ringR };
    });
    return { seats, tableWidth: tableSize, tableHeight: tableSize };
  }

  if (shape === 'rectangle') {
    // Classic head-table: all seats along the top edge facing the room.
    const pad = 40;
    const w = Math.max(280, (n - 1) * SEAT_PITCH + pad * 2);
    const h = 90;
    const stepX = n === 1 ? 0 : (w - pad * 2) / (n - 1);
    const y = -h / 2 - seatOffset;
    const seats = Array.from({ length: n }, (_, i) => ({
      x: -w / 2 + pad + stepX * i,
      y,
    }));
    return { seats, tableWidth: w, tableHeight: h };
  }

  // square — distribute evenly around all four sides
  const perSide = Math.max(1, Math.ceil(n / 4));
  const side = Math.max(180, (perSide - 1) * SEAT_PITCH + 56);
  const half = side / 2;
  const seats: { x: number; y: number }[] = [];
  const buckets: number[][] = [[], [], [], []];
  for (let i = 0; i < n; i++) buckets[i % 4].push(i);
  const placeSide = (indices: number[], dir: 'top' | 'right' | 'bottom' | 'left') => {
    const m = indices.length;
    if (m === 0) return;
    for (let k = 0; k < m; k++) {
      const t = m === 1 ? 0.5 : k / (m - 1);
      const pos = -half + 28 + t * (side - 56);
      if (dir === 'top') seats[indices[k]] = { x: pos, y: -half - seatOffset };
      if (dir === 'bottom') seats[indices[k]] = { x: pos, y: half + seatOffset };
      if (dir === 'left') seats[indices[k]] = { x: -half - seatOffset, y: pos };
      if (dir === 'right') seats[indices[k]] = { x: half + seatOffset, y: pos };
    }
  };
  placeSide(buckets[0], 'top');
  placeSide(buckets[1], 'right');
  placeSide(buckets[2], 'bottom');
  placeSide(buckets[3], 'left');
  return { seats, tableWidth: side, tableHeight: side };
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function HeadTableSetup() {
  const {
    guests,
    tables,
    addTable,
    updateTable,
    setCurrentStep,
  } = useSeatingStore();

  const existingHead = useMemo(
    () => tables.find(t => t.isHeadTable) ?? null,
    [tables]
  );

  const [subStep, setSubStep] = useState<'config' | 'seat'>(
    existingHead ? 'seat' : 'config'
  );
  const [shape, setShape] = useState<Shape>(existingHead?.shape ?? 'rectangle');
  const [capacity, setCapacity] = useState<number>(existingHead?.capacity ?? 10);

  const [announcement, setAnnouncement] = useState<
    { text: string; subtext?: string; icon?: React.ReactNode } | null
  >(() => existingHead ? null : {
    text: 'Set Up the Head Table',
    subtext: 'Shape, size, and who sits at the VIPs of the evening.',
    icon: <span style={{ fontSize: 54 }}>👑</span>,
  });
  useEffect(() => {
    if (subStep === 'seat') {
      setAnnouncement({
        text: 'Seat the Head Table',
        subtext: 'Drag guests into each chair.',
        icon: <span style={{ fontSize: 54 }}>👑</span>,
      });
    }
  }, [subStep]);

  const handleConfirmConfig = () => {
    if (existingHead) {
      updateTable(existingHead.id, { shape, capacity });
    } else {
      const id = `head-table-${Date.now()}`;
      addTable({
        id,
        name: 'Head Table',
        shape,
        capacity,
        isHeadTable: true,
        isKidsTable: false,
        guestIds: [],
        seats: Array.from({ length: capacity }, () => null),
        position: { x: 600, y: 400 },
      });
    }
    setSubStep('seat');
  };

  const banner = announcement && (
    <StepAnnouncement
      key={announcement.text}
      text={announcement.text}
      subtext={announcement.subtext}
      icon={announcement.icon}
      onDone={() => setAnnouncement(null)}
    />
  );

  if (subStep === 'config') {
    return (
      <>
        {banner}
        <ConfigStep
          shape={shape}
          capacity={capacity}
          onShapeChange={setShape}
          onCapacityChange={setCapacity}
          onBack={() => setCurrentStep('import')}
          onContinue={handleConfirmConfig}
        />
      </>
    );
  }

  return (
    <>
      {banner}
      <SeatStep
        headTable={tables.find(t => t.isHeadTable)!}
        guests={guests}
        onBack={() => setSubStep('config')}
        onContinue={() => setCurrentStep('elements')}
      />
    </>
  );
}

// ─── Sub-step 1: shape + capacity ─────────────────────────────────────────────

const SHAPES: Array<{
  value: Shape;
  label: string;
  sub: string;
  svg: (sel: boolean) => React.ReactNode;
}> = [
  {
    value: 'circle',
    label: 'Round',
    sub: 'Sweetheart table',
    svg: (sel) => (
      <svg viewBox="0 0 60 60" width={48} height={48}>
        <circle cx={30} cy={30} r={26}
          fill={sel ? '#fdf3e3' : '#f9fafb'}
          stroke={sel ? '#c9873a' : '#d1d5db'}
          strokeWidth={2} />
      </svg>
    ),
  },
  {
    value: 'rectangle',
    label: 'Rectangle',
    sub: 'Classic head table',
    svg: (sel) => (
      <svg viewBox="0 0 80 48" width={64} height={38}>
        <rect x={2} y={7} width={76} height={34} rx={7}
          fill={sel ? '#fdf3e3' : '#f9fafb'}
          stroke={sel ? '#c9873a' : '#d1d5db'}
          strokeWidth={2} />
      </svg>
    ),
  },
  {
    value: 'square',
    label: 'Square',
    sub: 'Modern & symmetrical',
    svg: (sel) => (
      <svg viewBox="0 0 60 60" width={48} height={48}>
        <rect x={3} y={3} width={54} height={54} rx={8}
          fill={sel ? '#fdf3e3' : '#f9fafb'}
          stroke={sel ? '#c9873a' : '#d1d5db'}
          strokeWidth={2} />
      </svg>
    ),
  },
];

function ConfigStep({
  shape,
  capacity,
  onShapeChange,
  onCapacityChange,
  onBack,
  onContinue,
}: {
  shape: Shape;
  capacity: number;
  onShapeChange: (s: Shape) => void;
  onCapacityChange: (n: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👑</div>
          <h2 className="font-playfair text-3xl text-gray-800 mb-2">
            Set up your head table
          </h2>
          <p className="font-raleway text-sm text-gray-500 leading-relaxed">
            Choose the shape and number of seats. You'll assign guests next.
          </p>
        </div>

        {/* Shape selector */}
        <div className="mb-8">
          <p className="font-raleway text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Table shape
          </p>
          <div className="grid grid-cols-3 gap-3">
            {SHAPES.map(({ value, label, sub, svg }) => {
              const sel = shape === value;
              return (
                <button
                  key={value}
                  onClick={() => onShapeChange(value)}
                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all ${
                    sel
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gold-300 hover:bg-gold-50/40'
                  }`}
                >
                  {svg(sel)}
                  <div className="text-center">
                    <p className={`font-raleway text-xs font-semibold leading-tight ${sel ? 'text-gold-700' : 'text-gray-700'}`}>
                      {label}
                    </p>
                    <p className="font-raleway text-xs text-gray-400 leading-tight mt-0.5">{sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capacity */}
        <div className="mb-8">
          <p className="font-raleway text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Seats at the head table
          </p>
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => onCapacityChange(Math.max(2, capacity - 1))}
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xl font-bold transition-colors"
            >−</button>
            <div className="text-center w-16">
              <p className="font-playfair text-5xl text-gray-800 leading-none">{capacity}</p>
              <p className="font-raleway text-xs text-gray-400 mt-1">guests</p>
            </div>
            <button
              onClick={() => onCapacityChange(Math.min(50, capacity + 1))}
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xl font-bold transition-colors"
            >+</button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-raleway text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway font-medium transition-colors"
          >
            Assign Seats <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-step 2: drag-and-drop seating ────────────────────────────────────────

function SeatStep({
  headTable,
  guests,
  onBack,
  onContinue,
}: {
  headTable: Table;
  guests: Guest[];
  onBack: () => void;
  onContinue: () => void;
}) {
  const assignGuestToSeat = useSeatingStore(s => s.assignGuestToSeat);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const seatedIds = useMemo(
    () => new Set(headTable.seats.filter(Boolean) as string[]),
    [headTable.seats]
  );

  const pool = useMemo(
    () =>
      guests
        .filter(g => !seatedIds.has(g.id))
        .filter(g =>
          search
            ? g.name.toLowerCase().includes(search.toLowerCase()) ||
              g.relationship.toLowerCase().includes(search.toLowerCase())
            : true
        ),
    [guests, seatedIds, search]
  );

  const layout = useMemo(
    () => layoutSeats(headTable.shape, headTable.capacity),
    [headTable.shape, headTable.capacity]
  );

  const nextEmptySeat = useMemo(
    () => headTable.seats.findIndex(s => s === null),
    [headTable.seats]
  );

  const quickSeat = useCallback(
    (guestId: string) => {
      if (nextEmptySeat === -1) return;
      assignGuestToSeat(headTable.id, nextEmptySeat, guestId);
    },
    [assignGuestToSeat, headTable.id, nextEmptySeat]
  );

  const createAndSeat = useCallback(
    (name: string, seatIndex: number) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const store = useSeatingStore.getState();
      const newGuest: Guest = {
        id: `guest-${Date.now()}`,
        name: trimmed,
        side: 'Both',
        relationship: 'Head Table',
        plusOne: null,
        rsvpStatus: 'Yes',
        notes: '',
        photoUrl: null,
        howWeMet: null,
        memory: null,
        tableId: null,
      };
      store.setGuests([...store.guests, newGuest]);
      store.assignGuestToSeat(headTable.id, seatIndex, newGuest.id);
    },
    [headTable.id]
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const g = guests.find(x => x.id === e.active.id);
    setActiveGuest(g ?? null);
  }, [guests]);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveGuest(null);
    const { active, over } = e;
    if (!over) return;

    const guestId = active.id as string;
    const overId = String(over.id);

    // Seat target: `seat:<tableId>:<index>`
    if (overId.startsWith('seat:')) {
      const [, tableId, idxStr] = overId.split(':');
      if (tableId === headTable.id) {
        assignGuestToSeat(tableId, Number(idxStr), guestId);
      }
    }
  }, [headTable.id, assignGuestToSeat]);

  const seatedCount = seatedIds.size;
  const isFull = seatedCount === headTable.capacity && headTable.capacity > 0;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex overflow-hidden">
        {/* Left: guest pool */}
        <div className="w-72 flex-shrink-0 border-r border-cream-200 bg-cream-50 flex flex-col">
          <div className="px-4 py-3 border-b border-cream-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-playfair text-gray-700 text-lg">
                Guests
                <span className="ml-2 text-sm font-raleway text-gray-400">({pool.length})</span>
              </h3>
            </div>
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

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {pool.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-raleway text-sm">
                {guests.length === 0
                  ? 'No guests imported yet.'
                  : 'Every guest has a seat 🎉'}
              </div>
            ) : (
              pool.map(g => (
                <DraggableGuest
                  key={g.id}
                  guest={g}
                  onQuickSeat={nextEmptySeat === -1 ? undefined : () => quickSeat(g.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: head table visual */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-shrink-0 px-6 py-3 border-b border-cream-200 flex items-center justify-between">
            <div>
              <h2 className="font-playfair text-lg text-gray-800 flex items-center gap-2">
                <Crown size={16} className="text-gold-500" />
                Head Table
              </h2>
              <p className="font-raleway text-xs text-gray-500">
                Drag guests from the left into any seat.
                <span className="ml-2 text-gold-600 font-medium">
                  {seatedCount} / {headTable.capacity} seated
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl font-raleway text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Edit shape
              </button>
              <div className="relative">
                {isFull && <ContinueArrow label="All seated — continue!" placement="below" />}
                <button
                  onClick={onContinue}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-10 gap-6">
            <HeadTableVisual
              table={headTable}
              guests={guests}
              layout={layout}
              pool={pool}
              onCreateAndSeat={createAndSeat}
            />
            {isFull && (
              <button
                onClick={onContinue}
                className="flex items-center gap-2 px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-base font-semibold transition-colors animate-flash-gold"
              >
                Continue to Floor Plan <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeGuest && <SeatAvatar guest={activeGuest} overlay />}
      </DragOverlay>
    </DndContext>
  );
}

// Round avatar sized to match a seat slot. Used as the drag overlay so the
// cursor visual fits the seat it will drop into.
function SeatAvatar({ guest, overlay = false }: { guest: Guest; overlay?: boolean }) {
  return (
    <div
      className={`rounded-full border-2 bg-white flex items-center justify-center shadow-md ${
        overlay ? 'border-gold-500 cursor-grabbing' : 'border-gold-300'
      }`}
      style={{ width: SEAT_SIZE, height: SEAT_SIZE }}
      title={guest.name}
    >
      <User size={22} className="text-gold-600" />
    </div>
  );
}

// ─── Draggable guest chip ─────────────────────────────────────────────────────

function DraggableGuest({
  guest,
  onQuickSeat,
}: {
  guest: Guest;
  onQuickSeat?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { guest },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle covers the chip; button below sits outside its listeners */}
      <div {...listeners} {...attributes}>
        <GuestChip guest={guest} trailing={onQuickSeat ? <span className="w-6" /> : null} />
      </div>
      {onQuickSeat && (
        <button
          type="button"
          onClick={onQuickSeat}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-gold-600 transition-opacity"
          title="Seat in next empty chair"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

function GuestChip({
  guest,
  overlay = false,
  trailing = null,
}: {
  guest: Guest;
  overlay?: boolean;
  trailing?: React.ReactNode;
}) {
  const sideColor =
    guest.side === 'Bride' ? 'bg-pink-400' :
    guest.side === 'Groom' ? 'bg-blue-400' : 'bg-purple-400';
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 bg-white border rounded-lg shadow-sm select-none ${
        overlay
          ? 'shadow-lg border-gold-300 rotate-1 cursor-grabbing'
          : 'border-gray-200 hover:border-gold-300 hover:shadow cursor-grab'
      }`}
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
      {trailing}
    </div>
  );
}

// ─── Head table SVG-style visual ──────────────────────────────────────────────

function HeadTableVisual({
  table,
  guests,
  layout,
  pool,
  onCreateAndSeat,
}: {
  table: Table;
  guests: Guest[];
  layout: SeatLayout;
  pool: Guest[];
  onCreateAndSeat: (name: string, seatIndex: number) => void;
}) {
  const guestById = useMemo(() => {
    const m = new Map<string, Guest>();
    for (const g of guests) m.set(g.id, g);
    return m;
  }, [guests]);

  const { tableWidth, tableHeight, seats } = layout;
  const pad = 70;
  const canvasW = tableWidth + pad * 2;
  const canvasH = tableHeight + pad * 2;
  const cx = canvasW / 2;
  const cy = canvasH / 2;

  return (
    <div
      className="relative"
      style={{ width: canvasW, height: canvasH }}
    >
      {/* Table body */}
      <div
        className="absolute flex items-center justify-center bg-cream-100 border-2 border-gold-400/70 shadow-inner"
        style={{
          width: tableWidth,
          height: tableHeight,
          left: cx - tableWidth / 2,
          top: cy - tableHeight / 2,
          borderRadius:
            table.shape === 'circle'
              ? '50%'
              : table.shape === 'rectangle'
                ? 12
                : 16,
        }}
      >
        <div className="flex items-center gap-1.5 text-gold-600">
          <Crown size={14} />
          <span className="font-playfair text-sm tracking-wide">
            {table.name}
          </span>
        </div>
      </div>

      {/* Seats */}
      {seats.map((pos, i) => {
        const guestId = table.seats[i] ?? null;
        const guest = guestId ? guestById.get(guestId) ?? null : null;
        return (
          <SeatSlot
            key={i}
            tableId={table.id}
            index={i}
            guest={guest}
            pool={pool}
            onCreateAndSeat={onCreateAndSeat}
            left={cx + pos.x}
            top={cy + pos.y}
          />
        );
      })}
    </div>
  );
}

function SeatSlot({
  tableId,
  index,
  guest,
  pool,
  onCreateAndSeat,
  left,
  top,
}: {
  tableId: string;
  index: number;
  guest: Guest | null;
  pool: Guest[];
  onCreateAndSeat: (name: string, seatIndex: number) => void;
  left: number;
  top: number;
}) {
  const id = `seat:${tableId}:${index}`;
  const { isOver, setNodeRef } = useDroppable({ id });
  const assignGuestToSeat = useSeatingStore(s => s.assignGuestToSeat);

  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const size = SEAT_SIZE;

  const suggestions = useMemo(() => {
    if (!editing) return [];
    const q = query.trim().toLowerCase();
    if (!q) return pool.slice(0, 6);
    return pool
      .filter(g => g.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [editing, query, pool]);

  useEffect(() => {
    if (editing) {
      setHighlight(0);
      // Focus on next tick so the input exists in the DOM
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [editing]);

  const closeEdit = useCallback(() => {
    setEditing(false);
    setQuery('');
  }, []);

  const commit = useCallback(() => {
    const picked = suggestions[highlight];
    if (picked) {
      assignGuestToSeat(tableId, index, picked.id);
    } else if (query.trim()) {
      onCreateAndSeat(query, index);
    }
    closeEdit();
  }, [assignGuestToSeat, closeEdit, highlight, index, onCreateAndSeat, query, suggestions, tableId]);

  const handleSeatClick = () => {
    if (guest || editing) return;
    setEditing(true);
  };

  return (
    <div
      ref={setNodeRef}
      className={`absolute rounded-full border-2 flex items-center justify-center text-center transition-all ${
        guest
          ? isOver
            ? 'bg-gold-100 border-gold-500'
            : 'bg-white border-gold-300 shadow-sm'
          : editing
            ? 'bg-white border-gold-500 shadow-md'
            : isOver
              ? 'bg-gold-50 border-gold-500 border-dashed'
              : 'bg-gray-50 border-gray-300 border-dashed hover:border-gold-400 hover:bg-gold-50 cursor-text'
      }`}
      style={{
        width: size,
        height: size,
        left: left - size / 2,
        top: top - size / 2,
      }}
      title={guest ? guest.name : `Seat ${index + 1} — click to type`}
      onClick={handleSeatClick}
    >
      {guest ? (
        <>
          <span className="font-raleway text-[10px] font-medium text-gray-700 leading-tight px-1 truncate max-w-full">
            {guest.name.split(' ')[0]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              assignGuestToSeat(tableId, index, null);
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-400 flex items-center justify-center shadow-sm"
            title="Unseat"
          >
            <X size={10} />
          </button>
        </>
      ) : editing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                closeEdit();
              } else if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlight(h => Math.min(suggestions.length - 1, h + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight(h => Math.max(0, h - 1));
              }
            }}
            onBlur={() => setTimeout(closeEdit, 150)}
            placeholder="Name…"
            className="w-[90%] text-center font-raleway text-[11px] bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-300"
          />
          {(suggestions.length > 0 || query.trim()) && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestions.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    assignGuestToSeat(tableId, index, s.id);
                    closeEdit();
                  }}
                  className={`w-full px-3 py-1.5 text-left font-raleway text-xs flex items-center gap-2 ${
                    i === highlight ? 'bg-gold-50 text-gold-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={12} className="text-gold-500" />
                  <span className="truncate">{s.name}</span>
                  <span className="ml-auto text-gray-400 truncate text-[10px]">
                    {s.relationship}
                  </span>
                </button>
              ))}
              {query.trim() &&
                !suggestions.some(s => s.name.toLowerCase() === query.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onCreateAndSeat(query, index);
                      closeEdit();
                    }}
                    className="w-full px-3 py-1.5 text-left font-raleway text-xs border-t border-gray-100 text-gold-700 hover:bg-gold-50 flex items-center gap-2"
                  >
                    <Plus size={12} />
                    <span className="truncate">Add "{query.trim()}"</span>
                  </button>
                )}
            </div>
          )}
        </>
      ) : (
        <span className="font-raleway text-[10px] text-gray-400">
          {index + 1}
        </span>
      )}
    </div>
  );
}
