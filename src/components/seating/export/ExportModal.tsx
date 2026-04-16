import React, { useState } from 'react';
import { X, Printer, QrCode, FileText, Table } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import QRCodeGenerator from './QRCodeGenerator';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { guests, tables } = useSeatingStore();
  const [showQR, setShowQR] = useState(false);

  const seatedGuests = guests.filter(g => g.tableId !== null);
  const unseatedGuests = guests.filter(g => g.tableId === null);

  const handlePrintChart = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = tables.map(table => {
      const tableGuests = table.guestIds.map(id => guests.find(g => g.id === id)!).filter(Boolean);
      return `
        <div class="table-block">
          <h3>${table.name}${table.isHeadTable ? ' 👑' : ''}${table.isKidsTable ? ' 🧸' : ''} (${tableGuests.length}/${table.capacity})</h3>
          <ul>
            ${tableGuests.map(g => `
              <li>
                <strong>${g.name}</strong>
                <span>${g.side} · ${g.relationship}</span>
                <span class="rsvp ${g.rsvpStatus.toLowerCase()}">${g.rsvpStatus}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Wedding Seating Chart</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Georgia', serif; padding: 30px; color: #1f2937; }
            h1 { text-align: center; font-size: 28px; color: #b06a2f; margin-bottom: 6px; }
            .subtitle { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 30px; font-family: Arial, sans-serif; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .table-block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; break-inside: avoid; }
            .table-block h3 { font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; }
            ul { list-style: none; space-y: 4px; }
            li { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #f9fafb; font-size: 12px; }
            li strong { color: #1f2937; flex: 1; }
            li span { color: #9ca3af; margin-left: 8px; font-family: Arial, sans-serif; }
            .rsvp { font-size: 10px; padding: 1px 6px; border-radius: 10px; }
            .rsvp.yes { background: #dcfce7; color: #166534; }
            .rsvp.pending { background: #fef9c3; color: #854d0e; }
            .rsvp.no { background: #fee2e2; color: #991b1b; }
            .footer { text-align: center; margin-top: 30px; font-family: Arial; font-size: 12px; color: #9ca3af; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <h1>Wedding Seating Chart</h1>
          <p class="subtitle">${tables.length} Tables · ${seatedGuests.length} Guests Seated · Printed ${new Date().toLocaleDateString()}</p>
          <div class="grid">${tableRows}</div>
          ${unseatedGuests.length > 0 ? `
            <div class="footer">
              <p>⚠️ ${unseatedGuests.length} guest(s) not yet assigned to a table: ${unseatedGuests.map(g => g.name).join(', ')}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handlePrintPlaceCards = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cards = seatedGuests.map(guest => {
      const table = tables.find(t => t.id === guest.tableId);
      return `
        <div class="card">
          <div class="table-label">${table?.name ?? 'Unassigned'}</div>
          <div class="name">${guest.name}</div>
          ${guest.notes ? `<div class="note">${guest.notes}</div>` : ''}
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Place Cards</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Georgia, serif; padding: 10px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .card {
              border: 1px solid #c9873a;
              border-radius: 8px;
              padding: 20px 16px;
              text-align: center;
              break-inside: avoid;
              min-height: 120px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0;
              height: 3px;
              background: linear-gradient(90deg, #c9873a, #e8be6a, #c9873a);
              border-radius: 8px 8px 0 0;
            }
            .table-label { font-size: 11px; color: #b06a2f; font-family: Arial; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
            .name { font-size: 20px; color: #1f2937; font-weight: bold; }
            .note { font-size: 10px; color: #9ca3af; margin-top: 6px; font-family: Arial; }
            @media print { @page { margin: 0.5cm; } }
          </style>
        </head>
        <body>
          <div class="grid">${cards}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Guest Name', 'Table', 'Side', 'Relationship', 'RSVP Status', 'Notes'],
      ...guests.map(g => {
        const table = tables.find(t => t.id === g.tableId);
        return [
          g.name,
          table?.name ?? 'Unassigned',
          g.side,
          g.relationship,
          g.rsvpStatus,
          g.notes,
        ];
      }),
    ];

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seating-chart.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showQR) {
    return <QRCodeGenerator tables={tables} guests={guests} onClose={() => setShowQR(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="font-playfair text-2xl text-gray-800">Export Seating Chart</h2>
            <p className="font-raleway text-sm text-gray-500">
              {seatedGuests.length} of {guests.length} guests seated across {tables.length} tables
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* Seating Chart */}
          <ExportOption
            icon={<Printer size={22} className="text-gold-600" />}
            title="Printable Seating Chart"
            description="Full seating chart by table — great for the venue coordinator."
            action="Print / Save as PDF"
            onClick={handlePrintChart}
            color="gold"
          />

          {/* Place Cards */}
          <ExportOption
            icon={<Table size={22} className="text-blue-600" />}
            title="Place Cards"
            description="3-up printable cards with guest name and table number."
            action="Print Place Cards"
            onClick={handlePrintPlaceCards}
            color="blue"
          />

          {/* CSV */}
          <ExportOption
            icon={<FileText size={22} className="text-green-600" />}
            title="Table Assignment List (CSV)"
            description="Spreadsheet with guest names, tables, and RSVP status."
            action="Download CSV"
            onClick={handleExportCSV}
            color="green"
          />

          {/* QR Codes */}
          <ExportOption
            icon={<QrCode size={22} className="text-purple-600" />}
            title="QR Memory Codes ⭐"
            description="Per-table QR codes guests scan to see who's at their table + stories."
            action="Generate QR Codes"
            onClick={() => setShowQR(true)}
            color="purple"
          />
        </div>

        {unseatedGuests.length > 0 && (
          <div className="mx-5 mb-5 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="font-raleway text-sm text-yellow-700">
              ⚠️ {unseatedGuests.length} guest{unseatedGuests.length > 1 ? 's are' : ' is'} not yet seated.
              Consider assigning them before exporting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExportOption({
  icon,
  title,
  description,
  action,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  color: 'gold' | 'blue' | 'green' | 'purple';
}) {
  const buttonColors = {
    gold: 'bg-gold-100 text-gold-700 hover:bg-gold-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-cream-200 rounded-xl hover:border-cream-300 hover:bg-cream-50 transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-raleway font-semibold text-gray-700 text-sm">{title}</p>
        <p className="font-raleway text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-raleway font-medium transition-colors ${buttonColors[color]}`}
      >
        {action}
      </button>
    </div>
  );
}
