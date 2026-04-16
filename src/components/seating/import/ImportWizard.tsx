import React, { useState, useCallback, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle2, Users, ChevronRight, FileSpreadsheet, X } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { parseExcelFile, ParseResult } from '../../../utils/excelParser';
import { Guest, Table } from '../../../types/seating';

export default function ImportWizard() {
  const { setGuests, setCurrentStep, setViewMode, addTable, setShowTutorial } = useSeatingStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHeadTableModal, setShowHeadTableModal] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseExcelFile(file);
      setParseResult(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.guests.length === 0) return;
    setGuests(parseResult.guests);
    setShowHeadTableModal(true);
  };

  const handleHeadTableConfirm = (shape: Table['shape'], capacity: number) => {
    const defaults: Record<Table['shape'], { w: number; h: number }> = {
      circle: { w: 110, h: 110 },
      rectangle: { w: 150, h: 95 },
      square: { w: 105, h: 105 },
    };
    const { w } = defaults[shape];
    addTable({
      id: `head-table-${Date.now()}`,
      name: 'Main Table',
      shape,
      capacity,
      isHeadTable: true,
      isKidsTable: false,
      guestIds: [],
      position: { x: Math.round(700 - w / 2), y: Math.round(500 - defaults[shape].h / 2) },
    });
    setShowTutorial(true);
    setViewMode('floorplan');
    setCurrentStep('workspace');
  };

  const handleSkipHeadTable = () => {
    setShowHeadTableModal(false);
    setViewMode('floorplan');
    setCurrentStep('workspace');
  };

  const handleSkipImport = () => {
    setViewMode('floorplan');
    setCurrentStep('workspace');
  };

  const rsvpCounts = parseResult
    ? {
        yes: parseResult.guests.filter(g => g.rsvpStatus === 'Yes').length,
        pending: parseResult.guests.filter(g => g.rsvpStatus === 'Pending').length,
        no: parseResult.guests.filter(g => g.rsvpStatus === 'No').length,
      }
    : null;

  const sideCounts = parseResult
    ? {
        bride: parseResult.guests.filter(g => g.side === 'Bride').length,
        groom: parseResult.guests.filter(g => g.side === 'Groom').length,
        both: parseResult.guests.filter(g => g.side === 'Both').length,
      }
    : null;

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">💍</div>
        <h2 className="font-playfair text-3xl text-gray-800 mb-2">Build Your Seating Chart</h2>
        <p className="font-raleway text-gray-400 text-base">
          Free, private, and takes about 2 minutes.
        </p>
      </div>

      {/* How it works */}
      {!parseResult && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: '1', icon: '📋', title: 'Upload guest list', desc: 'Drop in your Excel or CSV file' },
            { step: '2', icon: '🪑', title: 'Arrange tables',    desc: 'Drag tables onto your floor plan' },
            { step: '3', icon: '👥', title: 'Seat everyone',     desc: 'Assign guests with one click' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="text-center bg-cream-50 rounded-2xl px-3 py-4 border border-cream-200">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-raleway text-xs font-semibold text-gray-700 mb-1">{title}</p>
              <p className="font-raleway text-xs text-gray-400 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      )}

      {!parseResult && (
        <>
          {/* Upload Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              isDragging ? 'border-gold-500 bg-gold-50' : 'border-gold-300 bg-cream-50 hover:border-gold-400 hover:bg-gold-50'
            }`}
          >
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleInput}
              />
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-gold-300 border-t-gold-500 rounded-full animate-spin" />
                  <p className="font-raleway text-gray-500">Parsing your file...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="w-10 h-10 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-playfair text-xl text-gray-700 mb-1">
                      Drop your file here, or <span className="text-gold-600 underline">browse</span>
                    </p>
                    <p className="font-raleway text-sm text-gray-400">
                      Supports .xlsx, .xls, .csv
                    </p>
                  </div>
                  <div className="mt-2 px-4 py-2 bg-gold-500 text-white rounded-lg font-raleway text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </div>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-raleway text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Column Guide */}
          <div className="mt-8 bg-white border border-cream-200 rounded-2xl p-6">
            <h3 className="font-playfair text-lg text-gray-700 mb-4">Expected Columns</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { col: 'Name', required: true, desc: 'Guest full name' },
                { col: 'Side', required: false, desc: 'Bride / Groom / Both' },
                { col: 'Relationship', required: false, desc: 'Family, Friends, Work...' },
                { col: 'Plus One', required: false, desc: 'Yes/No or their name' },
                { col: 'RSVP', required: false, desc: 'Yes / No / Pending' },
                { col: 'Notes', required: false, desc: 'Dietary restrictions, etc.' },
                { col: 'How We Met', required: false, desc: 'Story for QR memory' },
                { col: 'Photo URL', required: false, desc: 'Link to guest photo' },
              ].map(({ col, required, desc }) => (
                <div key={col} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${required ? 'bg-gold-500' : 'bg-gray-300'}`} />
                  <div>
                    <span className="font-raleway font-semibold text-gray-700">{col}</span>
                    {required && <span className="text-gold-600 text-xs ml-1">*required</span>}
                    <p className="text-gray-400 font-raleway">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleSkipImport}
              className="font-raleway text-gray-400 hover:text-gray-600 underline text-sm transition-colors"
            >
              Skip — I'll add guests manually
            </button>
          </div>
        </>
      )}

      {parseResult && (
        <div className="space-y-6">
          {/* Success header */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-raleway font-semibold text-green-800">
                {parseResult.guests.length} guests imported successfully!
              </p>
              {parseResult.warnings.length > 0 && (
                <p className="font-raleway text-green-600 text-sm">
                  {parseResult.warnings.length} rows skipped — see details below
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-cream-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gold-500" />
                <h3 className="font-playfair text-gray-700">RSVP Breakdown</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-raleway text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Confirmed
                  </span>
                  <span className="font-raleway font-semibold text-gray-700">{rsvpCounts?.yes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-raleway text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending
                  </span>
                  <span className="font-raleway font-semibold text-gray-700">{rsvpCounts?.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-raleway text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> Declined
                  </span>
                  <span className="font-raleway font-semibold text-gray-700">{rsvpCounts?.no}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-cream-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💒</span>
                <h3 className="font-playfair text-gray-700">By Side</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-raleway text-sm text-gray-500">Bride's Side</span>
                  <span className="font-raleway font-semibold text-gray-700">{sideCounts?.bride}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-raleway text-sm text-gray-500">Groom's Side</span>
                  <span className="font-raleway font-semibold text-gray-700">{sideCounts?.groom}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-raleway text-sm text-gray-500">Both / Shared</span>
                  <span className="font-raleway font-semibold text-gray-700">{sideCounts?.both}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest preview table */}
          <div className="bg-white border border-cream-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-cream-200 flex items-center justify-between">
              <h3 className="font-playfair text-gray-700">Guest Preview</h3>
              <span className="font-raleway text-xs text-gray-400">Showing first 10 of {parseResult.guests.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-raleway">
                <thead className="bg-cream-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Name</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Side</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">Relationship</th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">RSVP</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.guests.slice(0, 10).map((g: Guest) => (
                    <tr key={g.id} className="border-t border-cream-100 hover:bg-cream-50">
                      <td className="px-4 py-2 text-gray-700">{g.name}</td>
                      <td className="px-4 py-2 text-gray-500">{g.side}</td>
                      <td className="px-4 py-2 text-gray-500">{g.relationship}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          g.rsvpStatus === 'Yes' ? 'bg-green-100 text-green-700' :
                          g.rsvpStatus === 'No' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {g.rsvpStatus === 'Yes' ? '✓' : g.rsvpStatus === 'No' ? '✗' : '?'} {g.rsvpStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warnings */}
          {parseResult.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="font-raleway font-semibold text-yellow-800 text-sm mb-2">Warnings:</p>
              <ul className="space-y-1">
                {parseResult.warnings.map((w, i) => (
                  <li key={i} className="font-raleway text-yellow-700 text-sm">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={() => { setParseResult(null); setError(null); }}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-raleway text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" /> Try Another File
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parseResult.guests.length === 0}
              className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway font-medium transition-colors disabled:opacity-50"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showHeadTableModal && (
        <HeadTableConfigModal
          onConfirm={handleHeadTableConfirm}
          onSkip={handleSkipHeadTable}
        />
      )}
    </div>
    </div>
  );
}

// ─── HeadTableConfigModal ─────────────────────────────────────────────────────

function HeadTableConfigModal({
  onConfirm,
  onSkip,
}: {
  onConfirm: (shape: Table['shape'], capacity: number) => void;
  onSkip: () => void;
}) {
  const [shape, setShape] = useState<Table['shape']>('rectangle');
  const [capacity, setCapacity] = useState(10);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const SHAPES: Array<{
    value: Table['shape'];
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(5px)' }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4"
        style={{
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.96)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.42s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-cream-100">
          <div className="text-5xl mb-3">👑</div>
          <h2 className="font-playfair text-2xl text-gray-800 mb-1.5">
            Set up your main table
          </h2>
          <p className="font-raleway text-sm text-gray-500 leading-relaxed">
            The head table faces your guests — it's where the couple and wedding party sit.
          </p>
        </div>

        <div className="px-8 py-6 space-y-7">

          {/* Shape selector */}
          <div>
            <p className="font-raleway text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Table shape
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SHAPES.map(({ value, label, sub, svg }) => {
                const sel = shape === value;
                return (
                  <button
                    key={value}
                    onClick={() => setShape(value)}
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
          <div>
            <p className="font-raleway text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Seats at the main table
            </p>
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => setCapacity(c => Math.max(2, c - 1))}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xl font-bold transition-colors"
              >−</button>
              <div className="text-center w-16">
                <p className="font-playfair text-5xl text-gray-800 leading-none">{capacity}</p>
                <p className="font-raleway text-xs text-gray-400 mt-1">guests</p>
              </div>
              <button
                onClick={() => setCapacity(c => Math.min(50, c + 1))}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xl font-bold transition-colors"
              >+</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 space-y-2">
          <button
            onClick={() => onConfirm(shape, capacity)}
            className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white rounded-2xl font-raleway font-semibold text-base transition-colors flex items-center justify-center gap-2"
          >
            Place Main Table <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2 text-gray-400 hover:text-gray-600 font-raleway text-sm transition-colors"
          >
            Skip this step
          </button>
        </div>
      </div>
    </div>
  );
}
