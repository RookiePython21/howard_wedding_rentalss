import type { Guest, Table, VenueElement } from '../../../types/seating';
import { CANVAS_W, CANVAS_H, getTableSize } from '../tableLayout';
import { venueColor, hexToRgba } from '../venueElements';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function guestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

/** Guests in seat order when any seat is assigned; then any remaining at that table. */
export function orderedGuestsForTable(table: Table, guests: Guest[]): Guest[] {
  const byId = new Map(guests.map(g => [g.id, g]));
  const hasSeatAssignments = table.seats.some(s => s);
  const ordered: Guest[] = [];
  const seen = new Set<string>();
  if (hasSeatAssignments) {
    for (const id of table.seats) {
      if (!id) continue;
      const g = byId.get(id);
      if (g && !seen.has(g.id)) {
        ordered.push(g);
        seen.add(g.id);
      }
    }
  }
  for (const id of table.guestIds) {
    if (seen.has(id)) continue;
    const g = byId.get(id);
    if (g) {
      ordered.push(g);
      seen.add(id);
    }
  }
  return ordered;
}

function tableSortIndex(table: Table, fallbackIndex: number): number {
  const m = table.name.match(/(\d+)/);
  if (m) return parseInt(m[1], 10);
  return 10000 + fallbackIndex;
}

function sortedTables(tables: Table[]): Table[] {
  return [...tables].sort((a, b) => {
    const da = tableSortIndex(a, 0);
    const db = tableSortIndex(b, 0);
    if (da !== db) return da - db;
    return a.name.localeCompare(b.name);
  });
}

const AVATAR_R = 11;
const AVATAR_ORBIT_PAD = 14;

function tableBorderColor(table: Table, guestCount: number): string {
  const pct = table.capacity > 0 ? guestCount / table.capacity : 0;
  return pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#22c55e';
}

function renderVenueSvg(el: VenueElement): string {
  const c = venueColor(el.type);
  const fill = hexToRgba(c, 0.12);
  const stroke = hexToRgba(c, 0.55);
  const rot = el.rotation ?? 0;
  const cx = el.x + el.w / 2;
  const cy = el.y + el.h / 2;
  const emoji = escapeXml(el.icon);
  const label = escapeXml(el.label);
  const fs = Math.max(18, Math.min(Math.min(el.w, el.h) * 0.45, 52));
  const labelFs = Math.max(9, Math.min(14, el.w * 0.12));

  return `
  <g transform="translate(${cx},${cy}) rotate(${rot}) translate(${-el.w / 2},${-el.h / 2})">
    <rect x="0" y="0" width="${el.w}" height="${el.h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <text x="${el.w / 2}" y="${el.h / 2 - 6}" text-anchor="middle" dominant-baseline="middle" font-size="${fs}">${emoji}</text>
    <text x="${el.w / 2}" y="${el.h / 2 + fs * 0.35}" text-anchor="middle" font-size="${labelFs}" fill="#4b5563" font-family="system-ui, sans-serif">${label}</text>
  </g>`;
}

function renderTableSvg(table: Table, guests: Guest[]): string {
  const { w, h } = getTableSize(table);
  const x = table.position.x;
  const y = table.position.y;
  const rot = table.rotation ?? 0;
  const tGuests = orderedGuestsForTable(table, guests);
  const stroke = tableBorderColor(table, tGuests.length);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const nameFs = Math.max(10, Math.min(16, w * 0.09));
  const fill = tGuests.length > 0 ? 'url(#tblGrad)' : '#ffffff';

  let shapeSvg: string;
  if (table.shape === 'circle') {
    shapeSvg = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${Math.max(w / 2 - 2, 8)}" ry="${Math.max(h / 2 - 2, 8)}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
  } else {
    const rx = table.shape === 'square' ? 10 : 12;
    shapeSvg = `<rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
  }

  const crown = table.isHeadTable ? `<text x="${w / 2}" y="${18}" text-anchor="middle" font-size="14">👑</text>` : '';
  const kids = table.isKidsTable ? `<text x="${w / 2}" y="${table.isHeadTable ? 34 : 18}" text-anchor="middle" font-size="14">🧸</text>` : '';

  const topPad = (table.isHeadTable ? 10 : 0) + (table.isKidsTable ? 10 : 0);
  const nameY = topPad + h / 2 - 4;
  const nameText = escapeXml(table.name);
  const countText = `${tGuests.length}/${table.capacity}`;

  const orbitInner: string[] = [];
  if (tGuests.length > 0) {
    const tcx = w / 2;
    const tcy = h / 2;
    const rx = w / 2 + AVATAR_ORBIT_PAD + AVATAR_R;
    const ry = h / 2 + AVATAR_ORBIT_PAD + AVATAR_R;
    const total = tGuests.length;
    tGuests.forEach((g, i) => {
      const angle = -Math.PI / 2 + (i / total) * 2 * Math.PI;
      const ax = tcx + rx * Math.cos(angle);
      const ay = tcy + ry * Math.sin(angle);
      const ini = escapeXml(guestInitials(g.name));
      const rsvp =
        g.rsvpStatus === 'Yes' ? '#16a34a' : g.rsvpStatus === 'No' ? '#dc2626' : '#d97706';
      orbitInner.push(`
        <circle cx="${ax}" cy="${ay}" r="${AVATAR_R}" fill="#f3f4f6" stroke="${rsvp}" stroke-width="2"/>
        <text x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central" font-size="8" font-weight="700" font-family="system-ui, sans-serif" fill="#374151">${ini}</text>
      `);
    });
  }

  return `
  <g transform="translate(${cx},${cy}) rotate(${rot}) translate(${-w / 2},${-h / 2})">
    ${shapeSvg}
    ${crown}
    ${kids}
    <text x="${w / 2}" y="${nameY}" text-anchor="middle" dominant-baseline="middle" font-weight="700" font-family="Georgia, serif" font-size="${nameFs}" fill="#1f2937">${nameText}</text>
    <text x="${w / 2}" y="${nameY + nameFs + 4}" text-anchor="middle" font-size="10" fill="#9ca3af" font-family="system-ui, sans-serif">${escapeXml(countText)}</text>
    ${orbitInner.join('')}
  </g>`;
}

function renderSeatingListHtml(tables: Table[], guests: Guest[], unseated: Guest[]): string {
  const rows = sortedTables(tables)
    .map(table => {
      const list = orderedGuestsForTable(table, guests);
      const li =
        list.length === 0
          ? '<li class="empty">No guests assigned</li>'
          : list
              .map((g) => {
                const seatIdx = table.seats.findIndex(s => s === g.id);
                const seatLabel =
                  seatIdx >= 0 ? `<span class="seat">Seat ${seatIdx + 1}</span>` : '';
                return `<li><span class="guest-name">${escapeXml(g.name)}</span>${seatLabel}</li>`;
              })
              .join('');
      const badges = `${table.isHeadTable ? ' 👑' : ''}${table.isKidsTable ? ' 🧸' : ''}`;
      return `
        <div class="table-list-block">
          <h3>${escapeXml(table.name)}${badges} <span class="cap">(${list.length}/${table.capacity})</span></h3>
          <ul>${li}</ul>
        </div>`;
    })
    .join('');

  const unseatedBlock =
    unseated.length > 0
      ? `<div class="unseated"><p><strong>Note:</strong> ${unseated.length} guest(s) not yet assigned to a table: ${unseated.map(g => escapeXml(g.name)).join(', ')}</p></div>`
      : '';

  return `
    <section class="seating-list">
      <h2>Seating by table</h2>
      <div class="table-grid">${rows}</div>
      ${unseatedBlock}
    </section>`;
}

/**
 * Full HTML document for print / Save as PDF: floor-plan SVG + seating list.
 */
export function buildFoamBoardPrintDocumentHtml(
  guests: Guest[],
  tables: Table[],
  venueElements: VenueElement[],
): string {
  const seatedIds = new Set(guests.filter(g => g.tableId !== null).map(g => g.id));
  const unseated = guests.filter(g => !seatedIds.has(g.id));

  const venueSvg = venueElements.map(renderVenueSvg).join('');
  const tablesSvg = tables.map(t => renderTableSvg(t, guests)).join('');

  const defs = `
  <defs>
    <linearGradient id="tblGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fdf8ee"/>
      <stop offset="100%" style="stop-color:#ffffff"/>
    </linearGradient>
  </defs>`;

  const floorSvg = `
  <div class="floor-wrap">
    <svg class="floor-svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Seating floor plan">
      <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="#fafafa" stroke="#e5e7eb"/>
      ${defs}
      ${venueSvg}
      ${tablesSvg}
    </svg>
  </div>`;

  const listHtml = renderSeatingListHtml(tables, guests, unseated);
  const subtitle = `${tables.length} tables · ${guests.filter(g => g.tableId !== null).length} guests seated · ${new Date().toLocaleDateString()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Foam board — seating chart</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1f2937; padding: 24px; background: #fff; }
    h1 { text-align: center; font-size: 26px; color: #b06a2f; margin-bottom: 6px; }
    .subtitle { text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 20px; font-family: system-ui, sans-serif; }
    .floor-wrap { max-width: 100%; margin: 0 auto 28px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fafafa; }
    .floor-svg { display: block; width: 100%; height: auto; }
    .seating-list h2 { font-size: 20px; color: #374151; margin-bottom: 16px; border-bottom: 2px solid #c9873a; padding-bottom: 8px; }
    .table-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .table-list-block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; break-inside: avoid; background: #fff; }
    .table-list-block h3 { font-size: 14px; color: #374151; margin-bottom: 10px; font-family: system-ui, sans-serif; }
    .table-list-block .cap { font-weight: 400; color: #9ca3af; font-size: 12px; }
    .table-list-block ul { list-style: none; }
    .table-list-block li { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; font-family: system-ui, sans-serif; }
    .table-list-block li:last-child { border-bottom: none; }
    .guest-name { font-weight: 600; color: #1f2937; }
    .seat { font-size: 11px; color: #9ca3af; flex-shrink: 0; }
    .table-list-block li.empty { color: #9ca3af; font-style: italic; }
    .unseated { margin-top: 20px; padding: 12px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; font-size: 12px; font-family: system-ui, sans-serif; }
    @media print {
      body { padding: 12px; }
      .floor-wrap { page-break-inside: avoid; }
      .seating-list { page-break-before: auto; }
    }
  </style>
</head>
<body>
  <h1>Wedding seating chart</h1>
  <p class="subtitle">${escapeXml(subtitle)}</p>
  ${floorSvg}
  ${listHtml}
</body>
</html>`;
}

export function openFoamBoardPrintPreview(guests: Guest[], tables: Table[], venueElements: VenueElement[]): void {
  const html = buildFoamBoardPrintDocumentHtml(guests, tables, venueElements);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 400);
}
