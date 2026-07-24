import React, { useState } from 'react';
import { X, Printer, LayoutGrid, FileText, Table, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { useCheckout } from '../../../hooks/useCheckout';
import { useAuth } from '../../../hooks/useAuth';
import { saveLead } from '../../../services/cloudSync';
import { openFoamBoardPrintPreview } from './FoamBoardPrintLayout';
import ChartRequiredForFoamBoardModal from '../../shop/ChartRequiredForFoamBoardModal';
import { canPurchaseFoamBoard } from '../../../utils/seatingChartEligibility';

const LEAD_EMAIL_KEY = 'hwr_lead_email';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readStoredLeadEmail(): string | null {
  try {
    return localStorage.getItem(LEAD_EMAIL_KEY);
  } catch {
    return null;
  }
}

function storeLeadEmail(email: string) {
  try {
    localStorage.setItem(LEAD_EMAIL_KEY, email);
  } catch {
    /* localStorage unavailable — not fatal */
  }
}

type TabId = 'chart' | 'placecards' | 'csv' | 'foam-board';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { guests, tables, venueElements } = useSeatingStore();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabId | null>(null);
  const [foamChartGateOpen, setFoamChartGateOpen] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(() => readStoredLeadEmail());
  const [chartEmail, setChartEmail] = useState('');
  const [chartEmailError, setChartEmailError] = useState<string | null>(null);
  const { initiateCheckout, loading: checkoutLoading, error: checkoutError } = useCheckout();

  // Email we already have on file — skip the gate when present.
  const knownEmail = storedEmail ?? user?.email ?? null;

  const placecardsPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_PLACECARDS;
  const placecardsPriceDisplay = import.meta.env.VITE_STRIPE_PRICE_DISPLAY_PLACECARDS;
  const foamBoardPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_FOAM_BOARD;
  const foamBoardPriceDisplay = import.meta.env.VITE_STRIPE_PRICE_DISPLAY_FOAM_BOARD;

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

  // Best-effort lead capture — never blocks the print if Firestore is unavailable.
  const recordChartLead = (email: string) => {
    saveLead(email, {
      source: 'printable-seating-chart',
      guestCount: guests.length,
      tableCount: tables.length,
    }).catch((err) => console.error('Lead capture failed', err));
  };

  // Gated entry point for the Printable Seating Chart "Print / Save as PDF" button.
  const handlePrintChartClick = () => {
    if (knownEmail) {
      recordChartLead(knownEmail);
      handlePrintChart();
    }
    // Otherwise the inline email form is shown; submit runs handleChartEmailSubmit.
  };

  const handleChartEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = chartEmail.trim();
    if (!EMAIL_REGEX.test(email)) {
      setChartEmailError('Please enter a valid email address.');
      return;
    }
    setChartEmailError(null);
    recordChartLead(email);
    storeLeadEmail(email);
    setStoredEmail(email);
    handlePrintChart();
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

  const handleBuyPlacecards = () => {
    if (!placecardsPriceId) return;
    const names = guests.map(g => g.name.trim()).filter(Boolean);
    if (names.length === 0) return;
    initiateCheckout(placecardsPriceId, names.length, names);
  };

  const handlePrintFoamBoardLayout = () => {
    openFoamBoardPrintPreview(guests, tables, venueElements);
  };

  const handleBuyFoamBoard = () => {
    if (!foamBoardPriceId) return;
    if (!canPurchaseFoamBoard(guests, tables)) {
      setFoamChartGateOpen(true);
      return;
    }
    const seated = guests.filter(g => g.tableId !== null).length;
    initiateCheckout(foamBoardPriceId, 1, undefined, {
      product: 'foam_board',
      tables: String(tables.length),
      guests_seated: String(seated),
    });
  };

  const toggleTab = (id: TabId) => setSelectedTab(prev => (prev === id ? null : id));

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between sticky top-0 bg-white z-10">
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
          <ExportOption
            icon={<Printer size={22} className="text-gold-600" />}
            title="Printable Seating Chart"
            description="Full seating chart by table — great for the venue coordinator."
            isSelected={selectedTab === 'chart'}
            onSelect={() => toggleTab('chart')}
            color="gold"
          >
            {knownEmail ? (
              <div className="flex justify-end">
                <button
                  onClick={handlePrintChartClick}
                  className="px-4 py-2 bg-gold-100 text-gold-700 hover:bg-gold-200 rounded-lg text-sm font-raleway font-medium transition-colors"
                >
                  Print / Save as PDF
                </button>
              </div>
            ) : (
              <form onSubmit={handleChartEmailSubmit} className="space-y-2">
                <label htmlFor="chart-email" className="block font-raleway text-xs text-gray-500">
                  Enter your email to print or save your seating chart.
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                  <div className="flex-1">
                    <input
                      id="chart-email"
                      type="email"
                      value={chartEmail}
                      onChange={(e) => {
                        setChartEmail(e.target.value);
                        if (chartEmailError) setChartEmailError(null);
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-gold-400"
                    />
                    {chartEmailError && (
                      <p className="mt-1 font-raleway text-xs text-red-600">{chartEmailError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gold-100 text-gold-700 hover:bg-gold-200 rounded-lg text-sm font-raleway font-medium transition-colors whitespace-nowrap"
                  >
                    Print / Save as PDF
                  </button>
                </div>
              </form>
            )}
          </ExportOption>

          <ExportOption
            icon={<Table size={22} className="text-blue-600" />}
            title="Place Cards"
            description="3-up printable cards with guest name and table number."
            isSelected={selectedTab === 'placecards'}
            onSelect={() => toggleTab('placecards')}
            color="blue"
          >
            <img
              src="/images/placecard.jpg"
              alt="Printed wedding place card preview"
              className="w-full h-48 object-cover rounded-lg border border-cream-200 mb-4"
            />
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handlePrintPlaceCards}
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-raleway font-medium transition-colors"
              >
                Print at Home (Free)
              </button>
              {placecardsPriceId && (
                <button
                  onClick={handleBuyPlacecards}
                  disabled={checkoutLoading || guests.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 hover:bg-gold-200 rounded-lg text-sm font-raleway font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                  Buy Now{placecardsPriceDisplay ? ` (${placecardsPriceDisplay} each)` : ''}
                </button>
              )}
            </div>
            {placecardsPriceId && guests.length > 0 && (
              <p className="font-raleway text-xs text-gray-500 mt-3 text-right">
                Buy Now prints one card per guest ({guests.length} {guests.length === 1 ? 'name' : 'names'} from your seating chart).
              </p>
            )}
          </ExportOption>

          <ExportOption
            icon={<FileText size={22} className="text-green-600" />}
            title="Table Assignment List (CSV)"
            description="Spreadsheet with guest names, tables, and RSVP status."
            isSelected={selectedTab === 'csv'}
            onSelect={() => toggleTab('csv')}
            color="green"
          >
            <div className="flex justify-end">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-raleway font-medium transition-colors"
              >
                Download CSV
              </button>
            </div>
          </ExportOption>

          <ExportOption
            icon={<LayoutGrid size={22} className="text-purple-600" />}
            title="Seating Chart Foam Board"
            description="Floor-plan layout with table numbers and a seating-by-table list — print a proof at home, or order a printed board."
            isSelected={selectedTab === 'foam-board'}
            onSelect={() => toggleTab('foam-board')}
            color="purple"
          >
            <img
              src="/images/seating_chart_foam_board_list.png"
              alt="Seating chart foam board preview"
              className="w-full h-48 object-cover rounded-lg border border-cream-200 mb-4"
            />
            <p className="font-raleway text-xs text-gray-500 mb-3">
              Preview matches what we print: your chart layout on top, guest names by table below.
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={handlePrintFoamBoardLayout}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg text-sm font-raleway font-medium transition-colors"
              >
                <Printer size={14} />
                Print / Save as PDF
              </button>
              {foamBoardPriceId ? (
                <button
                  type="button"
                  onClick={handleBuyFoamBoard}
                  disabled={checkoutLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 hover:bg-gold-200 rounded-lg text-sm font-raleway font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                  Buy Now{foamBoardPriceDisplay ? ` (${foamBoardPriceDisplay})` : ''}
                </button>
              ) : (
                <p className="font-raleway text-xs text-gray-500 self-center">Printed board: available soon</p>
              )}
            </div>
          </ExportOption>
        </div>

        {checkoutError && (
          <div className="mx-5 mb-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="font-raleway text-xs text-red-600 leading-relaxed">{checkoutError}</p>
          </div>
        )}

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
    <ChartRequiredForFoamBoardModal
      isOpen={foamChartGateOpen}
      onClose={() => setFoamChartGateOpen(false)}
    />
    </>
  );
}

function ExportOption({
  icon,
  title,
  description,
  isSelected,
  onSelect,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  color: 'gold' | 'blue' | 'green' | 'purple';
  children?: React.ReactNode;
}) {
  const selectedStyles = {
    gold: 'border-gold-400 bg-gold-50/40',
    blue: 'border-blue-400 bg-blue-50/40',
    green: 'border-green-400 bg-green-50/40',
    purple: 'border-purple-400 bg-purple-50/40',
  };

  return (
    <div
      className={`border rounded-xl transition-colors ${
        isSelected
          ? selectedStyles[color]
          : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-4 p-4 text-left"
        aria-expanded={isSelected}
      >
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-raleway font-semibold text-gray-700 text-sm">{title}</p>
          <p className="font-raleway text-xs text-gray-400">{description}</p>
        </div>
      </button>
      {isSelected && children && (
        <div className="px-4 pb-4 pt-1 border-t border-cream-200/60">{children}</div>
      )}
    </div>
  );
}
