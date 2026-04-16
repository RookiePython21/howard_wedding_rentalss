import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import {
  PlacementGuide, VenuePlacementBanner, TourOverlay, GuestTablesStep,
  HeadTableScreenRect, VENUE_STEPS,
} from '../onboarding/FloorPlanTutorial';
import { ZoomIn, ZoomOut, Maximize, Plus, Trash2, Circle, Square, RectangleHorizontal, Camera, X, Heart, Users, RotateCw, User } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { Table, Guest } from '../../../types/seating';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.5;
const CANVAS_W = 1400;
const CANVAS_H = 1000;
const HANDLE_SIZE = 8;
const ROT_HANDLE_OFFSET = 32;

const VENUE_ELEMENTS = [
  { icon: '💃', label: 'Dance Floor', type: 'dance' },
  { icon: '🍸', label: 'Bar', type: 'bar' },
  { icon: '🚻', label: 'Restrooms', type: 'bathroom' },
  { icon: '🎤', label: 'Stage/DJ', type: 'stage' },
  { icon: '🚪', label: 'Entrance', type: 'entrance' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transform { scale: number; x: number; y: number; }

interface VenueEl {
  id: string; type: string; icon: string; label: string;
  x: number; y: number; w: number; h: number; rotation: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

// ─── Tutorial phase ordering ───────────────────────────────────────────────────

type TutorialPhase = 'placement' | 'entrance' | 'bar' | 'dancefloor' | 'bathrooms' | 'guestTables' | 'tour' | null;

const VENUE_PHASE_ORDER: Array<'entrance' | 'bar' | 'dancefloor' | 'bathrooms'> =
  ['entrance', 'bar', 'dancefloor', 'bathrooms'];

// Map phase name → VENUE_STEPS index
const VENUE_PHASE_IDX: Record<string, number> = {
  entrance: 0, bar: 1, dancefloor: 2, bathrooms: 3,
};

// Map VENUE_STEPS type → VENUE_ELEMENTS type (same values here, kept for clarity)
const VENUE_TYPE_MAP: Record<string, string> = {
  entrance: 'entrance', bar: 'bar', dance: 'dance', bathroom: 'bathroom',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tableDefaultSize(shape: Table['shape']): { w: number; h: number } {
  if (shape === 'rectangle') return { w: 150, h: 95 };
  if (shape === 'square') return { w: 105, h: 105 };
  return { w: 110, h: 110 }; // circle
}

// Alias used by generateEquallySpacedTables
function tableSize(shape: Table['shape']): { w: number; h: number } {
  return tableDefaultSize(shape);
}

function getTableSize(table: Table): { w: number; h: number } {
  const d = tableDefaultSize(table.shape);
  return { w: table.width ?? d.w, h: table.height ?? d.h };
}

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  margin = 24,
): boolean {
  return ax < bx + bw + margin && ax + aw + margin > bx &&
         ay < by + bh + margin && ay + ah + margin > by;
}

function autoPlaceGuestTables(
  count: number,
  shape: Table['shape'],
  capacity: number,
  offset: number,
  existingTables: Table[],
  existingVenueEls: VenueEl[],
): Table[] {
  const { w, h } = tableDefaultSize(shape);
  const margin = 28;

  // Build list of all occupied rectangles
  const occupied = [
    ...existingTables.map(t => { const s = getTableSize(t); return { x: t.position.x, y: t.position.y, w: s.w, h: s.h }; }),
    ...existingVenueEls.map(e => ({ x: e.x, y: e.y, w: e.w, h: e.h })),
  ];

  const placed: Array<{ x: number; y: number }> = [];

  outer:
  for (let row = 0; placed.length < count; row++) {
    for (let col = 0; col < Math.floor((CANVAS_W - margin * 2) / (w + margin)); col++) {
      if (placed.length >= count) break outer;
      const x = margin + col * (w + margin);
      const y = margin + row * (h + margin);
      if (y + h > CANVAS_H - margin) break outer; // ran out of canvas space
      const allRects = [...occupied, ...placed.map(p => ({ x: p.x, y: p.y, w, h }))];
      if (!allRects.some(o => rectsOverlap(x, y, w, h, o.x, o.y, o.w, o.h))) {
        placed.push({ x, y });
      }
    }
  }

  return placed.map((pos, i) => ({
    id: `table-${Date.now()}-${i}`,
    name: `Table ${offset + i + 1}`,
    shape, capacity,
    isHeadTable: false, isKidsTable: false,
    guestIds: [], position: pos,
  }));
}

function generateEquallySpacedTables(
  count: number,
  shape: Table['shape'],
  capacity: number,
  offset: number,
): Table[] {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const { w, h } = tableSize(shape);
  const marginX = 100;
  const marginY = 100;
  const usableW = CANVAS_W - marginX * 2;
  const usableH = CANVAS_H - marginY * 2;
  const spacingX = usableW / cols;
  const spacingY = usableH / rows;

  return Array.from({ length: count }, (_, i) => ({
    id: `table-${Date.now()}-${i}`,
    name: `Table ${offset + i + 1}`,
    shape,
    capacity,
    isHeadTable: false,
    isKidsTable: false,
    guestIds: [],
    position: {
      x: marginX + (i % cols) * spacingX + spacingX / 2 - w / 2,
      y: marginY + Math.floor(i / cols) * spacingY + spacingY / 2 - h / 2,
    },
  }));
}

// ─── ResizeHandles ────────────────────────────────────────────────────────────
// Renders 8 resize handles + a rotation handle for any selected element.

function ResizeHandles({
  w, h, onResizeStart, onRotateStart,
}: {
  w: number; h: number;
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onRotateStart: (e: React.MouseEvent) => void;
}) {
  const hs = HANDLE_SIZE;
  const handles: Array<{ id: ResizeHandle; x: number; y: number; cursor: string }> = [
    { id: 'nw', x: -hs / 2,    y: -hs / 2,    cursor: 'nw-resize' },
    { id: 'n',  x: w / 2 - hs / 2, y: -hs / 2, cursor: 'n-resize' },
    { id: 'ne', x: w - hs / 2, y: -hs / 2,    cursor: 'ne-resize' },
    { id: 'e',  x: w - hs / 2, y: h / 2 - hs / 2, cursor: 'e-resize' },
    { id: 'se', x: w - hs / 2, y: h - hs / 2, cursor: 'se-resize' },
    { id: 's',  x: w / 2 - hs / 2, y: h - hs / 2, cursor: 's-resize' },
    { id: 'sw', x: -hs / 2,    y: h - hs / 2, cursor: 'sw-resize' },
    { id: 'w',  x: -hs / 2,    y: h / 2 - hs / 2, cursor: 'w-resize' },
  ];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: w, height: h,
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: 20,
    }}>
      {/* Rotation stem */}
      <div style={{
        position: 'absolute',
        left: w / 2 - 0.5,
        top: -ROT_HANDLE_OFFSET,
        width: 1,
        height: ROT_HANDLE_OFFSET,
        background: '#c9873a',
        opacity: 0.7,
        pointerEvents: 'none',
      }} />

      {/* Rotation handle */}
      <div
        onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onRotateStart(e); }}
        title="Rotate — hold Shift to snap to 15°"
        style={{
          position: 'absolute',
          left: w / 2 - 10,
          top: -(ROT_HANDLE_OFFSET + 20),
          width: 20, height: 20,
          borderRadius: '50%',
          background: 'white',
          border: '2px solid #c9873a',
          cursor: 'grab',
          pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 30,
        }}
      >
        <RotateCw size={11} color="#c9873a" />
      </div>

      {/* Resize handles */}
      {handles.map(({ id, x, y, cursor }) => (
        <div
          key={id}
          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onResizeStart(e, id); }}
          style={{
            position: 'absolute',
            left: x, top: y,
            width: hs, height: hs,
            background: 'white',
            border: '1.5px solid #c9873a',
            borderRadius: 2,
            cursor,
            pointerEvents: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
            zIndex: 30,
          }}
        />
      ))}
    </div>
  );
}

// ─── TableShape ───────────────────────────────────────────────────────────────

function TableShape({
  table, guests, isSelected, w, h,
}: {
  table: Table; guests: Guest[]; isSelected: boolean; w: number; h: number;
}) {
  const filled = guests.length;
  const pct = table.capacity > 0 ? filled / table.capacity : 0;
  const borderColor = isSelected
    ? '#c9873a'
    : pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#22c55e';
  const radius = table.shape === 'circle' ? '50%' : '12px';

  return (
    <div
      style={{
        width: w, height: h, borderRadius: radius,
        border: `2.5px solid ${borderColor}`,
        boxShadow: isSelected
          ? `0 0 0 3px rgba(201,135,58,0.25), 0 4px 12px rgba(0,0,0,0.12)`
          : '0 2px 8px rgba(0,0,0,0.09)',
        background: isSelected
          ? 'linear-gradient(135deg,#fdf8ee 0%,#fff 100%)'
          : pct > 0 ? 'linear-gradient(135deg,#fff 0%,#fafafa 100%)' : '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', cursor: 'grab', padding: 4,
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      {table.isHeadTable && <div style={{ fontSize: 14 }}>👑</div>}
      {table.isKidsTable && <div style={{ fontSize: 14 }}>🧸</div>}
      <div className="font-playfair text-center leading-tight"
        style={{
          fontSize: Math.max(9, Math.min(12, w * 0.08)),
          color: '#374151', maxWidth: '90%', wordBreak: 'break-word',
        }}>
        {table.name}
      </div>
      <div className="font-raleway" style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
        {filled}/{table.capacity}
      </div>
      <div style={{ width: '65%', height: 3, background: '#f3f4f6', borderRadius: 4, marginTop: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, pct * 100)}%`, height: '100%', background: borderColor, borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ─── GuestAvatars ─────────────────────────────────────────────────────────────

const AVATAR_R = 11;
const AVATAR_ORBIT_PAD = 14;

function GuestAvatars({
  guests, onAvatarClick, w, h,
}: {
  guests: Guest[]; onAvatarClick: (guest: Guest) => void; w: number; h: number;
}) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 + AVATAR_ORBIT_PAD + AVATAR_R;
  const ry = h / 2 + AVATAR_ORBIT_PAD + AVATAR_R;
  const total = guests.length;
  if (total === 0) return null;

  return (
    <>
      {guests.map((g, i) => {
        const angle = -Math.PI / 2 + (i / total) * 2 * Math.PI;
        const ax = cx + rx * Math.cos(angle);
        const ay = cy + ry * Math.sin(angle);
        const border = g.rsvpStatus === 'Yes' ? '#16a34a' : g.rsvpStatus === 'No' ? '#dc2626' : '#d97706';
        const d = AVATAR_R * 2;
        return (
          <div
            key={g.id}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAvatarClick(g); }}
            style={{
              position: 'absolute',
              left: ax - AVATAR_R,
              top: ay - AVATAR_R,
              width: d, height: d,
              borderRadius: '50%',
              background: g.photoUrl ? `url(${g.photoUrl}) center/cover` : '#f3f4f6',
              border: `2px solid ${border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff',
              fontFamily: 'Raleway, sans-serif',
              userSelect: 'none', cursor: 'pointer',
              zIndex: 3, pointerEvents: 'auto',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.35)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.30)';
              (e.currentTarget as HTMLDivElement).style.zIndex = '20';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.22)';
              (e.currentTarget as HTMLDivElement).style.zIndex = '3';
            }}
          >
            {!g.photoUrl && <User size={10} color="#9ca3af" />}
          </div>
        );
      })}
    </>
  );
}

// ─── GuestProfileModal ────────────────────────────────────────────────────────

function GuestProfileModal({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const { updateGuest } = useSeatingStore();
  const [memory, setMemory] = useState(guest.memory ?? guest.howWeMet ?? '');
  const [memorySaved, setMemorySaved] = useState(false);
  // True while the field still shows the imported example (not yet user-edited)
  const [isExample, setIsExample] = useState(!guest.memory && !!guest.howWeMet);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      updateGuest(guest.id, { photoUrl: url });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMemory = () => {
    updateGuest(guest.id, { memory: memory.trim() || null });
    setMemorySaved(true);
    setTimeout(() => setMemorySaved(false), 2000);
  };

  const rsvpColor = guest.rsvpStatus === 'Yes' ? 'bg-green-100 text-green-700' :
    guest.rsvpStatus === 'No' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header band */}
        <div className="relative bg-gradient-to-br from-gold-100 to-cream-100 px-5 pt-5 pb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center"
                style={{ background: guest.photoUrl ? undefined : '#e5e7eb' }}
              >
                {guest.photoUrl ? (
                  <img src={guest.photoUrl} alt={guest.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={36} color="#9ca3af" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold-500 hover:bg-gold-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
                title="Upload photo"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <h2 className="font-playfair text-xl text-gray-800 text-center leading-tight">{guest.name}</h2>
            <span className={`font-raleway text-xs px-2.5 py-0.5 rounded-full font-semibold ${rsvpColor}`}>
              {guest.rsvpStatus === 'Yes' ? '✓ Attending' : guest.rsvpStatus === 'No' ? '✗ Declined' : '? Pending'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 font-raleway text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Heart size={11} className="text-gold-500" /> Memory / How We Met
            </label>
            <textarea
              value={memory}
              onChange={e => { setMemory(e.target.value); setIsExample(false); }}
              onFocus={() => { if (isExample) { setMemory(''); setIsExample(false); } }}
              placeholder="Write a memory or how you know this guest…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 font-raleway text-sm text-gray-700 resize-none focus:outline-none focus:border-gold-400 placeholder-gray-300"
              style={isExample ? { fontStyle: 'italic', color: '#9ca3af' } : undefined}
            />
            <button
              onClick={handleSaveMemory}
              className="mt-1.5 w-full py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-raleway font-semibold rounded-lg transition-colors"
            >
              {memorySaved ? '✓ Saved!' : 'Save Memory'}
            </button>
          </div>

          <div>
            <p className="font-raleway text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Guest Details</p>
            <div className="space-y-2">
              {[
                { label: 'Side', value: guest.side },
                { label: 'Relationship', value: guest.relationship || '—' },
                { label: 'Plus One', value: guest.plusOne || 'No' },
                ...(guest.notes ? [{ label: 'Notes', value: guest.notes }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-3 text-sm">
                  <span className="font-raleway text-gray-400 flex-shrink-0">{label}</span>
                  <span className="font-raleway text-gray-700 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DraggableTable ───────────────────────────────────────────────────────────

function DraggableTable({
  table, guests, scale, onMove, onDrop, onSelect, isSelected, onAvatarClick,
  onResize, onRotate, onInteractionStart,
}: {
  table: Table; guests: Guest[]; scale: number;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onDrop?: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onAvatarClick: (guest: Guest) => void;
  onResize: (id: string, dims: { w: number; h: number; x: number; y: number }) => void;
  onRotate: (id: string, deg: number) => void;
  onInteractionStart: () => void;
}) {
  const { w, h } = getTableSize(table);
  const rotation = table.rotation ?? 0;
  const dragRef = useRef<{ sx: number; sy: number; tx: number; ty: number; moved: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, tx: table.position.x, ty: table.position.y, moved: false };

    const onMove_ = (me: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (me.clientX - drag.sx) / scale;
      const dy = (me.clientY - drag.sy) / scale;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.moved = true;
      onMove(table.id, {
        x: Math.max(0, Math.min(CANVAS_W - w, drag.tx + dx)),
        y: Math.max(0, Math.min(CANVAS_H - h, drag.ty + dy)),
      });
    };
    const onUp = () => {
      const moved = dragRef.current?.moved ?? true;
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove_);
      window.removeEventListener('mouseup', onUp);
      if (!moved) {
        onSelect(table.id);
      } else {
        onDrop?.(table.id);
      }
    };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    onInteractionStart();

    const startMX = e.clientX;
    const startMY = e.clientY;
    const startW = w;
    const startH = h;
    const startX = table.position.x;
    const startY = table.position.y;
    const MIN = 60;

    const onMouseMove = (me: MouseEvent) => {
      const dx = (me.clientX - startMX) / scale;
      const dy = (me.clientY - startMY) / scale;

      let newW = startW, newH = startH, newX = startX, newY = startY;

      if (handle === 'se') {
        newW = Math.max(MIN, startW + dx);
        newH = Math.max(MIN, startH + dy);
      } else if (handle === 'nw') {
        newW = Math.max(MIN, startW - dx);
        newH = Math.max(MIN, startH - dy);
        newX = startX + (startW - newW);
        newY = startY + (startH - newH);
      } else if (handle === 'ne') {
        newW = Math.max(MIN, startW + dx);
        newH = Math.max(MIN, startH - dy);
        newY = startY + (startH - newH);
      } else if (handle === 'sw') {
        newW = Math.max(MIN, startW - dx);
        newH = Math.max(MIN, startH + dy);
        newX = startX + (startW - newW);
      } else if (handle === 'n') {
        newH = Math.max(MIN, startH - dy);
        newY = startY + (startH - newH);
      } else if (handle === 's') {
        newH = Math.max(MIN, startH + dy);
      } else if (handle === 'e') {
        newW = Math.max(MIN, startW + dx);
      } else if (handle === 'w') {
        newW = Math.max(MIN, startW - dx);
        newX = startX + (startW - newW);
      }

      onResize(table.id, { w: newW, h: newH, x: newX, y: newY });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onInteractionStart();

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = rotation;
    const startMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    const onMouseMove = (me: MouseEvent) => {
      const currentAngle = Math.atan2(me.clientY - centerY, me.clientX - centerX) * (180 / Math.PI);
      let newAngle = startAngle + (currentAngle - startMouseAngle);
      if (me.shiftKey) newAngle = Math.round(newAngle / 15) * 15;
      onRotate(table.id, newAngle);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: table.position.x,
        top: table.position.y,
        zIndex: isSelected ? 10 : 1,
        overflow: 'visible',
        transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: `${w / 2}px ${h / 2}px`,
      }}
    >
      <TableShape table={table} guests={guests} isSelected={isSelected} w={w} h={h} />
      <GuestAvatars guests={guests} onAvatarClick={onAvatarClick} w={w} h={h} />
      {isSelected && (
        <ResizeHandles
          w={w} h={h}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
        />
      )}
    </div>
  );
}

// ─── DraggableVenueEl ─────────────────────────────────────────────────────────

function DraggableVenueEl({
  el, scale, onMove, onDrop, onRemove, onResize, onRotate, isSelected, onSelect,
}: {
  el: VenueEl; scale: number;
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onDrop?: (id: string) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, dims: { w: number; h: number; x: number; y: number }) => void;
  onRotate: (id: string, rotation: number) => void;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const dragRef = useRef<{ sx: number; sy: number; ex: number; ey: number; moved: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, ex: el.x, ey: el.y, moved: false };
    const onMove_ = (me: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (me.clientX - drag.sx) / scale;
      const dy = (me.clientY - drag.sy) / scale;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.moved = true;
      onMove(el.id, {
        x: Math.max(0, drag.ex + dx),
        y: Math.max(0, drag.ey + dy),
      });
    };
    const onUp = () => {
      const moved = dragRef.current?.moved ?? true;
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove_);
      window.removeEventListener('mouseup', onUp);
      if (!moved) {
        onSelect(el.id);
      } else {
        onDrop?.(el.id);
      }
    };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();

    const startMX = e.clientX;
    const startMY = e.clientY;
    const startW = el.w;
    const startH = el.h;
    const startX = el.x;
    const startY = el.y;
    const MIN = 40;

    const onMouseMove = (me: MouseEvent) => {
      const dx = (me.clientX - startMX) / scale;
      const dy = (me.clientY - startMY) / scale;

      let newW = startW, newH = startH, newX = startX, newY = startY;

      if (handle === 'se') {
        newW = Math.max(MIN, startW + dx);
        newH = Math.max(MIN, startH + dy);
      } else if (handle === 'nw') {
        newW = Math.max(MIN, startW - dx);
        newH = Math.max(MIN, startH - dy);
        newX = startX + (startW - newW);
        newY = startY + (startH - newH);
      } else if (handle === 'ne') {
        newW = Math.max(MIN, startW + dx);
        newH = Math.max(MIN, startH - dy);
        newY = startY + (startH - newH);
      } else if (handle === 'sw') {
        newW = Math.max(MIN, startW - dx);
        newH = Math.max(MIN, startH + dy);
        newX = startX + (startW - newW);
      } else if (handle === 'n') {
        newH = Math.max(MIN, startH - dy);
        newY = startY + (startH - newH);
      } else if (handle === 's') {
        newH = Math.max(MIN, startH + dy);
      } else if (handle === 'e') {
        newW = Math.max(MIN, startW + dx);
      } else if (handle === 'w') {
        newW = Math.max(MIN, startW - dx);
        newX = startX + (startW - newW);
      }

      onResize(el.id, { w: newW, h: newH, x: newX, y: newY });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = el.rotation;
    const startMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    const onMouseMove = (me: MouseEvent) => {
      const currentAngle = Math.atan2(me.clientY - centerY, me.clientX - centerX) * (180 / Math.PI);
      let newAngle = startAngle + (currentAngle - startMouseAngle);
      if (me.shiftKey) newAngle = Math.round(newAngle / 15) * 15;
      onRotate(el.id, newAngle);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
  };

  const emojiSize = Math.max(27, Math.min(Math.min(el.w, el.h) * 0.675, 78));

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: el.x, top: el.y,
        width: el.w, height: el.h,
        zIndex: isSelected ? 8 : 5,
        cursor: 'move',
        transform: el.rotation !== 0 ? `rotate(${el.rotation}deg)` : undefined,
        transformOrigin: `${el.w / 2}px ${el.h / 2}px`,
        overflow: 'visible',
      }}
      className="select-none group"
    >
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: isSelected ? 'rgba(201,135,58,0.06)' : 'transparent',
        border: isSelected ? '1.5px dashed #c9873a' : '1.5px dashed transparent',
        borderRadius: 8,
      }}>
        <div style={{ fontSize: emojiSize, lineHeight: 1 }}>{el.icon}</div>
        <div
          className="font-raleway text-gray-500 bg-white/90 px-1.5 py-0.5 rounded"
          style={{ marginTop: 4, whiteSpace: 'nowrap', fontSize: 18 }}
        >
          {el.label}
        </div>
      </div>

      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={() => onRemove(el.id)}
        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        style={{ fontSize: 10, zIndex: 40 }}
      >×</button>

      {isSelected && (
        <ResizeHandles
          w={el.w} h={el.h}
          onResizeStart={handleResizeStart}
          onRotateStart={handleRotateStart}
        />
      )}
    </div>
  );
}

// ─── Left panel: selected table seating ───────────────────────────────────────

function TableSeatingPanel({
  table, seated, unseated, onClose, onAddGuest, onUnassign,
}: {
  table: Table;
  seated: Guest[];
  unseated: Guest[];
  onClose: () => void;
  onAddGuest: (guestId: string) => void;
  onUnassign: (guestId: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [search, setSearch] = useState('');

  const filled = seated.length;
  const pct = table.capacity > 0 ? filled / table.capacity : 0;
  const isFull = filled >= table.capacity;
  const barColor = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#22c55e';

  const filtered = unseated.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.relationship.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-52 flex-shrink-0 border-r border-cream-200 bg-white flex flex-col overflow-hidden">

      <div className="px-3 py-3 border-b border-cream-200 bg-cream-50 flex-shrink-0">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="font-playfair text-gray-800 text-sm leading-tight truncate">{table.name}</p>
            <p className="font-raleway text-xs text-gray-400 mt-0.5">
              {table.isHeadTable ? '👑 · ' : ''}{table.isKidsTable ? '🧸 · ' : ''}
              <span className="capitalize">{table.shape}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 flex-shrink-0 text-lg leading-none mt-0.5">×</button>
        </div>
        <div className="mt-2.5">
          <div className="flex justify-between items-center mb-1">
            <span className="font-raleway text-xs text-gray-500">Seats filled</span>
            <span className="font-raleway text-xs font-semibold" style={{ color: barColor }}>{filled}/{table.capacity}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct * 100)}%`, background: barColor }} />
          </div>
        </div>
      </div>

      {picking ? (
        <>
          <div className="px-2 pt-2 pb-1.5 border-b border-cream-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-raleway text-xs font-semibold text-gray-600">Add Guests</span>
              <button
                onClick={() => { setPicking(false); setSearch(''); }}
                className="font-raleway text-xs text-gold-600 hover:text-gold-700"
              >
                ← Done
              </button>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Search guests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-raleway focus:outline-none focus:border-gold-400"
            />
            {isFull && (
              <p className="font-raleway text-xs text-red-500 mt-1 text-center">Table is at capacity</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {filtered.length === 0 ? (
              <p className="font-raleway text-xs text-gray-400 text-center py-6">
                {unseated.length === 0 ? 'All guests are seated!' : 'No guests match your search.'}
              </p>
            ) : (
              filtered.map(g => (
                <div key={g.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cream-50 border border-transparent hover:border-cream-200 transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    g.rsvpStatus === 'Yes' ? 'bg-green-500' :
                    g.rsvpStatus === 'No' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-raleway text-xs font-medium text-gray-700 truncate">{g.name}</p>
                    <p className="font-raleway text-xs text-gray-400 truncate">
                      {g.side !== 'Both' ? `${g.side} · ` : ''}{g.relationship}
                    </p>
                  </div>
                  <button
                    onClick={() => onAddGuest(g.id)}
                    disabled={isFull}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 hover:bg-gold-600 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Add to table"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {seated.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">🪑</div>
                <p className="font-raleway text-xs text-gray-400 mb-3">No guests seated here yet.</p>
                <button
                  onClick={() => setPicking(true)}
                  className="flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-raleway rounded-lg transition-colors"
                >
                  <Plus size={12} /> Add Guests
                </button>
              </div>
            ) : (
              seated.map(g => (
                <div key={g.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cream-50 group border border-transparent hover:border-cream-200 transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    g.rsvpStatus === 'Yes' ? 'bg-green-500' :
                    g.rsvpStatus === 'No' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-raleway text-xs font-medium text-gray-700 truncate">{g.name}</p>
                    <p className="font-raleway text-xs text-gray-400 truncate">
                      {g.side !== 'Both' ? `${g.side} · ` : ''}{g.relationship}
                    </p>
                  </div>
                  <button
                    onClick={() => onUnassign(g.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
                    title="Remove from table"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {seated.length > 0 && (
            <div className="flex-shrink-0 px-2 pb-2 pt-1 border-t border-cream-100">
              <button
                onClick={() => setPicking(true)}
                disabled={isFull}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-gold-300 text-gold-600 hover:bg-gold-50 rounded-lg text-xs font-raleway transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={12} /> {isFull ? 'Table Full' : 'Add Guests'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FloorPlanView() {
  const { tables, guests, updateTablePosition, updateTable, setTables, moveGuestToTable, pushHistory, showTutorial, setShowTutorial } = useSeatingStore();

  const [transform, setTransform] = useState<Transform>({ scale: 0.5, x: 50, y: 30 });
  const [venueEls, setVenueEls] = useState<VenueEl[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedVenueElId, setSelectedVenueElId] = useState<string | null>(null);
  const [profileGuest, setProfileGuest] = useState<Guest | null>(null);

  // ── Tutorial / onboarding ──────────────────────────────────────────────────
  const [tutorialPhase, setTutorialPhase] = useState<TutorialPhase>(null);
  const [headTableScreenRect, setHeadTableScreenRect] = useState<HeadTableScreenRect | null>(null);
  const tutorialPhaseRef = useRef<TutorialPhase>(null);
  const headTableIdRef = useRef<string | null>(null);
  const headTableMovedRef = useRef(false);
  // Tracks the venue element currently being placed during onboarding
  const activeVenueElIdRef = useRef<string | null>(null);
  const [venueElScreenRect, setVenueElScreenRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [newShape, setNewShape] = useState<Table['shape']>('circle');
  const [newCapacity, setNewCapacity] = useState(8);
  const [newCount, setNewCount] = useState(5);

  const viewportRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const selectedTable = selectedTableId ? tables.find(t => t.id === selectedTableId) ?? null : null;
  const selectedGuests = selectedTable
    ? selectedTable.guestIds.map(id => guests.find(g => g.id === id)!).filter(Boolean)
    : [];

  // ── Scroll-to-zoom ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTransform(prev => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * factor));
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const canvasX = (cx - prev.x) / prev.scale;
        const canvasY = (cy - prev.y) / prev.scale;
        return { scale: newScale, x: cx - canvasX * newScale, y: cy - canvasY * newScale };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ── Tutorial lifecycle ────────────────────────────────────────────────────

  // Fit entire canvas into the viewport with some padding
  const fitCanvas = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const { width, height } = vp.getBoundingClientRect();
    // Guard: if layout hasn't painted yet, dimensions will be 0 — bail out
    if (width < 50 || height < 50) return;
    const PAD = 40;
    const scale = Math.min(
      (width  - PAD * 2) / CANVAS_W,
      (height - PAD * 2) / CANVAS_H,
      0.72,
    );
    const x = Math.max(20, (width  - CANVAS_W * scale) / 2);
    const y = Math.max(20, (height - CANVAS_H * scale) / 2);
    setTransform({ scale, x, y });
  }, []);

  // Kick off placement phase when store flag is set
  useEffect(() => {
    if (showTutorial && tutorialPhase === null) {
      setTutorialPhase('placement');
    }
  }, [showTutorial]);                                     // eslint-disable-line

  // Fit the canvas as soon as the layout is committed (runs before paint)
  useLayoutEffect(() => {
    if (showTutorial && tutorialPhase === 'placement') {
      fitCanvas();
    }
  }, [showTutorial, tutorialPhase, fitCanvas]);

  // Keep ref in sync and capture head table ID at placement start
  useEffect(() => {
    tutorialPhaseRef.current = tutorialPhase;
    if (tutorialPhase === 'placement') {
      headTableMovedRef.current = false;
      headTableIdRef.current = tables.find(t => t.isHeadTable)?.id ?? null;
    }
  }, [tutorialPhase, tables]);

  // Recompute head-table screen rect whenever transform or table position changes
  useEffect(() => {
    if (tutorialPhase !== 'placement') { setHeadTableScreenRect(null); return; }
    const ht = tables.find(t => t.isHeadTable);
    if (!ht || !viewportRef.current) { setHeadTableScreenRect(null); return; }
    const vr = viewportRef.current.getBoundingClientRect();
    const { w, h } = getTableSize(ht);
    setHeadTableScreenRect({
      x: vr.left + transform.x + ht.position.x * transform.scale,
      y: vr.top  + transform.y + ht.position.y * transform.scale,
      w: w * transform.scale,
      h: h * transform.scale,
      shape: ht.shape,
    });
  }, [tables, transform, tutorialPhase]);

  // ── Background pan ────────────────────────────────────────────────────────
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelectedTableId(null);
    setSelectedVenueElId(null);
    panRef.current = { sx: e.clientX, sy: e.clientY, px: transform.x, py: transform.y };
    const onMouseMove = (me: MouseEvent) => {
      const pan = panRef.current;
      if (!pan) return;
      const targetX = pan.px + me.clientX - pan.sx;
      const targetY = pan.py + me.clientY - pan.sy;
      setTransform(prev => ({ ...prev, x: targetX, y: targetY }));
    };
    const onMouseUp = () => {
      panRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoomBy = useCallback((factor: number) => {
    setTransform(prev => {
      const el = viewportRef.current;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * factor));
      if (!el) return { ...prev, scale: newScale };
      const { width, height } = el.getBoundingClientRect();
      const cx = width / 2; const cy = height / 2;
      const canvasX = (cx - prev.x) / prev.scale;
      const canvasY = (cy - prev.y) / prev.scale;
      return { scale: newScale, x: cx - canvasX * newScale, y: cy - canvasY * newScale };
    });
  }, []);

  const resetTransform = useCallback(() => fitCanvas(), [fitCanvas]);

  // ── Add equally-spaced tables ─────────────────────────────────────────────
  const handleAddTables = () => {
    if (newCount < 1) return;
    const newTables = generateEquallySpacedTables(newCount, newShape, newCapacity, tables.length);
    setTables([...tables, ...newTables]);
  };

  // ── Table move ────────────────────────────────────────────────────────────
  const handleTableMove = useCallback((id: string, pos: { x: number; y: number }) => {
    updateTablePosition(id, pos);
  }, [updateTablePosition]);

  // ── Table drop (mouseup after drag) — advances to venue placement ─────────
  const handleTableDrop = useCallback((id: string) => {
    if (
      tutorialPhaseRef.current === 'placement' &&
      !headTableMovedRef.current &&
      id === headTableIdRef.current
    ) {
      headTableMovedRef.current = true;
      setTimeout(() => setTutorialPhase('entrance'), 400);
    }
  }, []);

  // ── Venue element drag-placement (steps 2–5) ─────────────────────────────
  // When a venue phase starts, spawn the element at canvas center so the user
  // can drag it anywhere — mirrors exactly how the head table is placed.
  useEffect(() => {
    const phase = tutorialPhase;
    if (!phase || !(phase in VENUE_PHASE_IDX)) return;

    const stepCfg = VENUE_STEPS[VENUE_PHASE_IDX[phase]];
    const elDef = VENUE_ELEMENTS.find(e => e.type === VENUE_TYPE_MAP[stepCfg.type])!;
    const id = `vel-onboard-${phase}-${Date.now()}`;
    activeVenueElIdRef.current = id;

    // Place at canvas center so it's always in view
    setVenueEls(prev => [...prev, {
      id, type: elDef.type, icon: elDef.icon, label: elDef.label,
      x: Math.round((CANVAS_W - 90) / 2),
      y: Math.round((CANVAS_H - 90) / 2),
      w: 90, h: 90, rotation: 0,
    }]);
  }, [tutorialPhase]);  // eslint-disable-line

  // Recompute venue element screen rect so the spotlight follows it
  useEffect(() => {
    const id = activeVenueElIdRef.current;
    if (!id || !tutorialPhase || !(tutorialPhase in VENUE_PHASE_IDX)) {
      setVenueElScreenRect(null);
      return;
    }
    const el = venueEls.find(v => v.id === id);
    if (!el || !viewportRef.current) { setVenueElScreenRect(null); return; }
    const vr = viewportRef.current.getBoundingClientRect();
    setVenueElScreenRect({
      x: vr.left + transform.x + el.x * transform.scale,
      y: vr.top  + transform.y + el.y * transform.scale,
      w: el.w * transform.scale,
      h: el.h * transform.scale,
    });
  }, [venueEls, transform, tutorialPhase]);

  // Called when the active venue element is released after a drag
  const handleVenueDrop = useCallback((id: string) => {
    if (id !== activeVenueElIdRef.current) return;
    activeVenueElIdRef.current = null;
    setTimeout(() => advanceVenuePhase(), 300);
  }, []);  // eslint-disable-line

  const handleVenueSkip = useCallback(() => {
    // Remove the spawned element if the user skips without placing
    const id = activeVenueElIdRef.current;
    if (id) {
      setVenueEls(prev => prev.filter(v => v.id !== id));
      activeVenueElIdRef.current = null;
    }
    advanceVenuePhase();
  }, []);  // eslint-disable-line

  function advanceVenuePhase() {
    const phase = tutorialPhaseRef.current;
    const idx = VENUE_PHASE_ORDER.indexOf(phase as typeof VENUE_PHASE_ORDER[number]);
    if (idx === -1) return;
    const next: TutorialPhase = idx < VENUE_PHASE_ORDER.length - 1
      ? VENUE_PHASE_ORDER[idx + 1]
      : 'guestTables';
    setTutorialPhase(next);
  }

  // ── Guest tables auto-placement (step 6) ──────────────────────────────────
  const handleGuestTablesConfirm = useCallback((
    shape: 'circle' | 'rectangle' | 'square',
    capacity: number,
    count: number,
  ) => {
    const newTables = autoPlaceGuestTables(count, shape, capacity, tables.length, tables, venueEls);
    setTables([...tables, ...newTables]);
    setTimeout(() => setTutorialPhase('tour'), 200);
  }, [tables, venueEls, setTables]);

  const handleGuestTablesSkip = useCallback(() => setTutorialPhase('tour'), []);

  // ── Table resize / rotate ─────────────────────────────────────────────────
  const handleTableResize = useCallback((id: string, dims: { w: number; h: number; x: number; y: number }) => {
    updateTable(id, { width: dims.w, height: dims.h, position: { x: dims.x, y: dims.y } });
  }, [updateTable]);

  const handleTableRotate = useCallback((id: string, deg: number) => {
    updateTable(id, { rotation: deg });
  }, [updateTable]);

  // ── Venue elements ────────────────────────────────────────────────────────
  const addVenueEl = (type: string) => {
    const el = VENUE_ELEMENTS.find(e => e.type === type)!;
    const vp = viewportRef.current?.getBoundingClientRect();
    const cx = vp ? (vp.width / 2 - transform.x) / transform.scale : 400;
    const cy = vp ? (vp.height / 2 - transform.y) / transform.scale : 300;
    setVenueEls(prev => [...prev, {
      id: `vel-${Date.now()}`, type, icon: el.icon, label: el.label,
      x: cx + (Math.random() - 0.5) * 100,
      y: cy + (Math.random() - 0.5) * 80,
      w: 90, h: 90, rotation: 0,
    }]);
  };

  const moveVenueEl = useCallback((id: string, pos: { x: number; y: number }) => {
    setVenueEls(prev => prev.map(el => el.id === id ? { ...el, ...pos } : el));
  }, []);

  const removeVenueEl = useCallback((id: string) => {
    setVenueEls(prev => prev.filter(el => el.id !== id));
    setSelectedVenueElId(prev => prev === id ? null : prev);
  }, []);

  const resizeVenueEl = useCallback((id: string, dims: { w: number; h: number; x: number; y: number }) => {
    setVenueEls(prev => prev.map(el => el.id === id ? { ...el, ...dims } : el));
  }, []);

  const rotateVenueEl = useCallback((id: string, rotation: number) => {
    setVenueEls(prev => prev.map(el => el.id === id ? { ...el, rotation } : el));
  }, []);

  const handleUnassignGuest = (guestId: string) => {
    moveGuestToTable(guestId, null);
  };

  const scaleLabel = `${Math.round(transform.scale * 100)}%`;

  return (
    <>
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Title bar ── */}
      <div className="flex-shrink-0 flex items-center justify-center py-2 border-b border-cream-200 bg-white">
        <h2 className="font-playfair text-xl text-gray-700 tracking-wide">Floor Setup</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: selected table seating ── */}
        {selectedTable ? (
          <div data-tutorial="left-panel" onMouseDown={e => e.stopPropagation()}>
            <TableSeatingPanel
              table={selectedTable}
              seated={selectedGuests}
              unseated={guests.filter(g => g.tableId === null)}
              onClose={() => setSelectedTableId(null)}
              onAddGuest={(guestId) => moveGuestToTable(guestId, selectedTableId!)}
              onUnassign={handleUnassignGuest}
            />
          </div>
        ) : (
          <div data-tutorial="left-panel" className="w-52 flex-shrink-0 border-r border-cream-200 bg-cream-50 flex flex-col items-center justify-center text-center px-4" onMouseDown={e => e.stopPropagation()}>
            <div className="text-3xl mb-2">🪑</div>
            <p className="font-playfair text-sm text-gray-500">Click a table</p>
            <p className="font-raleway text-xs text-gray-400 mt-1">to view its seating arrangement</p>
          </div>
        )}

        {/* ── Canvas viewport ── */}
        <div
          data-tutorial="canvas"
          ref={viewportRef}
          onMouseDown={handleViewportMouseDown}
          className="flex-1 overflow-hidden relative"
          style={{ background: '#f3f4f6', cursor: 'default' }}
        >
          {/* Zoom controls */}
          <div
            className="absolute top-3 left-3 z-20 flex flex-col gap-1"
            onMouseDown={e => e.stopPropagation()}
          >
            <button onClick={() => zoomBy(1.2)}
              className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 shadow-sm" title="Zoom in">
              <ZoomIn size={14} />
            </button>
            <button onClick={() => zoomBy(1 / 1.2)}
              className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 shadow-sm" title="Zoom out">
              <ZoomOut size={14} />
            </button>
            <button onClick={resetTransform}
              className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 shadow-sm" title="Reset view">
              <Maximize size={14} />
            </button>
            <div className="w-8 h-6 bg-white/90 border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
              <span className="font-raleway text-xs text-gray-500">{scaleLabel}</span>
            </div>
          </div>

          {/* Transformed canvas */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            transformOrigin: '0 0',
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            willChange: 'transform',
          }}>
            <div style={{
              width: CANVAS_W, height: CANVAS_H, position: 'relative',
              background: 'white',
              backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              border: '2px solid #d1d5db', borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              {tables.map(table => {
                const tGuests = table.guestIds.map(id => guests.find(g => g.id === id)!).filter(Boolean);
                return (
                  <DraggableTable
                    key={table.id}
                    table={table}
                    guests={tGuests}
                    scale={transform.scale}
                    onMove={handleTableMove}
                    onDrop={handleTableDrop}
                    onSelect={id => { setSelectedTableId(id); setSelectedVenueElId(null); }}
                    isSelected={selectedTableId === table.id}
                    onAvatarClick={setProfileGuest}
                    onResize={handleTableResize}
                    onRotate={handleTableRotate}
                    onInteractionStart={pushHistory}
                  />
                );
              })}
              {venueEls.map(el => (
                <DraggableVenueEl
                  key={el.id}
                  el={el}
                  scale={transform.scale}
                  onMove={moveVenueEl}
                  onDrop={handleVenueDrop}
                  onRemove={removeVenueEl}
                  onResize={resizeVenueEl}
                  onRotate={rotateVenueEl}
                  isSelected={selectedVenueElId === el.id}
                  onSelect={id => { setSelectedVenueElId(id); setSelectedTableId(null); }}
                />
              ))}
            </div>
          </div>

          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-white/80 rounded-2xl px-8 py-6 shadow-sm border border-cream-200">
                <div className="text-4xl mb-2">🪑</div>
                <p className="font-playfair text-lg text-gray-500">No tables yet</p>
                <p className="font-raleway text-sm text-gray-400 mt-1">Use the panel on the right to add tables</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="w-56 flex-shrink-0 border-l border-cream-200 bg-cream-50 overflow-y-auto" onMouseDown={e => e.stopPropagation()}>
          <div className="p-3 space-y-4">

            {/* ── Table Creator ── */}
            <div data-tutorial="right-panel-tables">
              <p className="font-playfair text-sm text-gray-700 mb-2">Tables</p>

              <div className="mb-2">
                <label className="font-raleway text-xs text-gray-500 block mb-1">Shape</label>
                <div className="flex gap-1">
                  {([
                    { shape: 'circle' as const, Icon: Circle },
                    { shape: 'rectangle' as const, Icon: RectangleHorizontal },
                    { shape: 'square' as const, Icon: Square },
                  ]).map(({ shape, Icon }) => (
                    <button key={shape}
                      onClick={() => setNewShape(shape)}
                      className={`flex-1 py-1.5 rounded-lg border flex flex-col items-center gap-0.5 transition-colors ${
                        newShape === shape
                          ? 'border-gold-500 bg-gold-50 text-gold-600'
                          : 'border-gray-200 text-gray-400 hover:border-gold-300'
                      }`}
                    >
                      <Icon size={13} />
                      <span className="font-raleway text-xs capitalize">{shape}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <label className="font-raleway text-xs text-gray-500 block mb-1">Capacity per table</label>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setNewCapacity(c => Math.max(1, c - 1))}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-sm">−</button>
                  <input type="number" min={1} max={30} value={newCapacity}
                    onChange={e => setNewCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm font-raleway text-center focus:outline-none focus:border-gold-400" />
                  <button onClick={() => setNewCapacity(c => Math.min(30, c + 1))}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-sm">+</button>
                </div>
              </div>

              <div className="mb-3">
                <label className="font-raleway text-xs text-gray-500 block mb-1">Number of tables</label>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setNewCount(c => Math.max(1, c - 1))}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-sm">−</button>
                  <input type="number" min={1} max={50} value={newCount}
                    onChange={e => setNewCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm font-raleway text-center focus:outline-none focus:border-gold-400" />
                  <button onClick={() => setNewCount(c => Math.min(50, c + 1))}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-sm">+</button>
                </div>
              </div>

              <button onClick={handleAddTables}
                className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm font-raleway rounded-xl transition-colors flex items-center justify-center gap-1.5">
                <Plus size={14} /> Add {newCount} Table{newCount !== 1 ? 's' : ''}
              </button>

              {tables.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 justify-center">
                  <Users size={11} className="text-gray-400" />
                  <span className="font-raleway text-xs text-gray-400">
                    {tables.length} table{tables.length !== 1 ? 's' : ''} · {tables.reduce((s, t) => s + t.capacity, 0)} seats total
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-cream-200" />

            {/* ── Venue Elements ── */}
            <div data-tutorial="right-panel-venue">
              <p className="font-playfair text-sm text-gray-700 mb-2">Venue Elements</p>
              <p className="font-raleway text-xs text-gray-400 mb-2">Click to place on canvas</p>
              <div className="space-y-0.5">
                {VENUE_ELEMENTS.map(el => (
                  <button key={el.type} onClick={() => addVenueEl(el.type)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-cream-100 transition-colors">
                    <span className="text-base">{el.icon}</span>
                    <span className="font-raleway text-sm text-gray-600">{el.label}</span>
                    <Plus size={11} className="ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-cream-200" />

            {/* ── Controls hint ── */}
            <div>
              <p className="font-raleway text-xs text-gray-400 mb-1.5">Controls</p>
              <div className="font-raleway text-xs text-gray-400 space-y-1">
                <p>🖱 Scroll — zoom</p>
                <p>🖱 Drag background — pan</p>
                <p>✋ Drag table — move</p>
                <p>🖱 Click table — seating</p>
                <p>↔ Drag corner handle — resize</p>
                <p>↻ Drag top handle — rotate</p>
                <p>⇧ Hold Shift — snap 15°</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    {/* ── Tutorial overlays ── */}
    {tutorialPhase === 'placement' && (
      <PlacementGuide
        headTableRect={headTableScreenRect}
        onSkip={() => setTutorialPhase('entrance')}
      />
    )}

    {VENUE_PHASE_ORDER.includes(tutorialPhase as typeof VENUE_PHASE_ORDER[number]) && (
      <VenuePlacementBanner
        key={tutorialPhase}
        stepConfig={VENUE_STEPS[VENUE_PHASE_IDX[tutorialPhase!]]}
        stepIndex={VENUE_PHASE_IDX[tutorialPhase!]}
        venueElScreenRect={venueElScreenRect}
        onSkip={handleVenueSkip}
      />
    )}

    {tutorialPhase === 'guestTables' && (
      <GuestTablesStep
        totalGuests={guests.length}
        onConfirm={handleGuestTablesConfirm}
        onSkip={handleGuestTablesSkip}
      />
    )}

    {tutorialPhase === 'tour' && (
      <TourOverlay
        onDone={() => { setTutorialPhase(null); setShowTutorial(false); }}
      />
    )}

    {/* ── Guest profile modal ── */}
    {profileGuest && (
      <GuestProfileModal
        guest={guests.find(g => g.id === profileGuest.id) ?? profileGuest}
        onClose={() => setProfileGuest(null)}
      />
    )}
    </>
  );
}
