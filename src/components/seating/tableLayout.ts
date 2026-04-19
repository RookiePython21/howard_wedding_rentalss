import { Table, VenueElement } from '../../types/seating';

// World dimensions used by the floorplan canvas. Must match FloorPlanView.
export const CANVAS_W = 1400;
export const CANVAS_H = 1000;

export function tableDefaultSize(shape: Table['shape']): { w: number; h: number } {
  if (shape === 'rectangle') return { w: 150, h: 95 };
  if (shape === 'square') return { w: 105, h: 105 };
  return { w: 110, h: 110 }; // circle
}

export function getTableSize(table: Table): { w: number; h: number } {
  const d = tableDefaultSize(table.shape);
  return { w: table.width ?? d.w, h: table.height ?? d.h };
}

export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  margin = 24,
): boolean {
  return ax < bx + bw + margin && ax + aw + margin > bx &&
         ay < by + bh + margin && ay + ah + margin > by;
}

// Places guest tables in concentric arcs fanning out from the head table
// toward the interior of the canvas. Produces a layout closer to how an
// actual reception room is arranged: closest tables in front of the head
// table, further rings bowing around the dance floor / open center.
// If the arcs saturate before all tables are placed, falls back to a grid
// scan for the remaining tables so we never silently drop any.
export function autoPlaceGuestTables(
  count: number,
  shape: Table['shape'],
  capacity: number,
  offset: number,
  existingTables: Table[],
  existingVenueEls: VenueElement[],
): Table[] {
  const { w, h } = tableDefaultSize(shape);
  const margin = 28;

  const occupied = [
    ...existingTables.map(t => {
      const s = getTableSize(t);
      return { x: t.position.x, y: t.position.y, w: s.w, h: s.h };
    }),
    ...existingVenueEls.map(e => ({ x: e.x, y: e.y, w: e.w, h: e.h })),
  ];

  const placed: Array<{ x: number; y: number }> = [];
  const head = existingTables.find(t => t.isHeadTable);

  // ── Phase 1: elliptical arcs around the head table ─────────────────────
  if (head) {
    const headSize = getTableSize(head);
    const headCx = head.position.x + headSize.w / 2;
    const headCy = head.position.y + headSize.h / 2;

    // Fan forward from head table toward the centre of the floor plan.
    const canvasCx = CANVAS_W / 2;
    const canvasCy = CANVAS_H / 2;
    let fwdX = canvasCx - headCx;
    let fwdY = canvasCy - headCy;
    const fwdLen = Math.hypot(fwdX, fwdY);
    if (fwdLen < 1) { fwdX = 0; fwdY = 1; } // head is at centre → fan down
    const fwd = Math.atan2(fwdY, fwdX);

    // Slight horizontal "ellipse" stretch so rings look more like a room
    // than a perfect circle. Interior is wider than deep.
    const stretchX = 1.15;
    const stretchY = 0.95;

    // Minimum radius leaves the aisle in front of the head table clear.
    const baseRadius = Math.max(headSize.w, headSize.h) / 2 + Math.max(w, h) * 0.9 + 40;

    // Arc covers ~220° on the guest-facing side.
    const arcSpan = (220 / 180) * Math.PI;

    // Pitch between rings: one table footprint plus a walking aisle.
    const ringPitch = Math.max(w, h) + 52;

    const tableFootprint = Math.max(w, h) + margin;

    for (let ring = 0; placed.length < count && ring < 24; ring++) {
      const r = baseRadius + ring * ringPitch;
      const arcLen = arcSpan * r;
      const slots = Math.max(3, Math.floor(arcLen / tableFootprint));
      // Stagger alternating rings by a half-slot so tables interleave
      // instead of stacking radially — looks more organic.
      const offsetT = (ring % 2) * 0.5;

      for (let i = 0; placed.length < count && i < slots; i++) {
        const t = slots === 1 ? 0.5 : (i + offsetT) / slots;
        const angle = fwd - arcSpan / 2 + t * arcSpan;
        const cx = headCx + r * Math.cos(angle) * stretchX;
        const cy = headCy + r * Math.sin(angle) * stretchY;
        const x = cx - w / 2;
        const y = cy - h / 2;

        // Bounds
        if (x < margin || x + w > CANVAS_W - margin) continue;
        if (y < margin || y + h > CANVAS_H - margin) continue;

        // Collision
        const allRects = [...occupied, ...placed.map(p => ({ x: p.x, y: p.y, w, h }))];
        if (allRects.some(o => rectsOverlap(x, y, w, h, o.x, o.y, o.w, o.h, 18))) continue;

        placed.push({ x, y });
      }
    }
  }

  // ── Phase 2: grid fill for anything the arcs couldn't place ────────────
  if (placed.length < count) {
    outer:
    for (let row = 0; placed.length < count; row++) {
      for (let col = 0; col < Math.floor((CANVAS_W - margin * 2) / (w + margin)); col++) {
        if (placed.length >= count) break outer;
        const x = margin + col * (w + margin);
        const y = margin + row * (h + margin);
        if (y + h > CANVAS_H - margin) break outer;
        const allRects = [...occupied, ...placed.map(p => ({ x: p.x, y: p.y, w, h }))];
        if (!allRects.some(o => rectsOverlap(x, y, w, h, o.x, o.y, o.w, o.h))) {
          placed.push({ x, y });
        }
      }
    }
  }

  return placed.map((pos, i) => ({
    id: `table-${Date.now()}-${i}`,
    name: `Table ${offset + i + 1}`,
    shape,
    capacity,
    isHeadTable: false,
    isKidsTable: false,
    guestIds: [],
    seats: Array.from({ length: capacity }, () => null),
    position: pos,
  }));
}
