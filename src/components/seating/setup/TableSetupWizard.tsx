import { useMemo, useState } from 'react';
import { ChevronRight, ChevronLeft, Circle, Square, RectangleHorizontal, LucideIcon } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { Table } from '../../../types/seating';
import { autoPlaceGuestTables } from '../tableLayout';
import StepAnnouncement from '../StepAnnouncement';
import ContinueArrow from '../ContinueArrow';

const SHAPES: Array<{ value: Table['shape']; label: string; Icon: LucideIcon }> = [
  { value: 'circle',    label: 'Round',     Icon: Circle },
  { value: 'rectangle', label: 'Rectangle', Icon: RectangleHorizontal },
  { value: 'square',    label: 'Square',    Icon: Square },
];

export default function TableSetupWizard() {
  const {
    guests, tables, venueElements,
    setTables, setCurrentStep, setViewMode,
  } = useSeatingStore();

  const headTable = useMemo(() => tables.find(t => t.isHeadTable) ?? null, [tables]);
  const headTableSeated = headTable ? headTable.guestIds.length : 0;

  const confirmedGuests = guests.filter(g => g.rsvpStatus !== 'No');
  const remainingGuests = Math.max(0, confirmedGuests.length - headTableSeated);

  const [shape, setShape] = useState<Table['shape']>('circle');
  const [capacity, setCapacity] = useState(8);
  const [tableCount, setTableCount] = useState(() =>
    Math.max(1, Math.ceil(remainingGuests / 8) || 5)
  );

  const [announcement, setAnnouncement] = useState<{ text: string; subtext?: string; icon?: React.ReactNode } | null>({
    text: 'Set Up Guest Tables',
    subtext: 'Pick a shape, seats, and how many.',
    icon: <span style={{ fontSize: 54 }}>🪑</span>,
  });

  const totalCapacity = tableCount * capacity + (headTable?.capacity ?? 0);
  const capacityOk = totalCapacity >= confirmedGuests.length;

  const handleFinish = () => {
    const existingOther = tables.filter(t => !t.isHeadTable);
    const offset = existingOther.length;
    let newTables = autoPlaceGuestTables(
      tableCount,
      shape,
      capacity,
      offset,
      tables,
      venueElements,
    );

    // Re-number so Table 1 is closest to the head table, Table 2 next, etc.
    // autoPlaceGuestTables returns in scan order (reading-left-to-right); we
    // want proximity order to match how the guided-seating walk introduces them.
    if (headTable) {
      newTables = [...newTables]
        .sort((a, b) =>
          Math.hypot(a.position.x - headTable.position.x, a.position.y - headTable.position.y) -
          Math.hypot(b.position.x - headTable.position.x, b.position.y - headTable.position.y)
        )
        .map((t, i) => ({ ...t, name: `Table ${offset + i + 1}` }));
    }

    // Preserve existing tables (head table + any previously-created guest tables).
    setTables([...tables, ...newTables]);
    setViewMode('floorplan');
    setCurrentStep('seat');
  };

  const notEnoughRoom = false; // autoPlace may return fewer than requested, but UI warns post-hoc if needed

  return (
    <div className="flex-1 overflow-y-auto relative">
      {announcement && (
        <StepAnnouncement
          key={announcement.text}
          text={announcement.text}
          subtext={announcement.subtext}
          icon={announcement.icon}
          onDone={() => setAnnouncement(null)}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🪑</div>
          <h2 className="font-playfair text-3xl text-gray-800 mb-1">Configure Guest Tables</h2>
          <p className="font-raleway text-sm text-gray-500">
            We'll auto-place them on your floor plan without overlapping the head table or any elements.
          </p>
        </div>

        {/* Shape */}
        <div className="bg-white border border-cream-200 rounded-2xl p-5">
          <label className="block font-raleway text-xs text-gray-500 uppercase tracking-wider mb-3">
            Table shape
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SHAPES.map(({ value, label, Icon }) => {
              const sel = shape === value;
              return (
                <button
                  key={value}
                  onClick={() => setShape(value)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                    sel ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-gray-200 text-gray-500 hover:border-gold-300'
                  }`}
                >
                  <Icon size={22} />
                  <span className="font-raleway text-sm">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Capacity + count */}
        <div className="bg-white border border-cream-200 rounded-2xl p-5 grid grid-cols-2 gap-6">
          <div>
            <label className="block font-raleway text-xs text-gray-500 uppercase tracking-wider mb-3">
              Seats per table
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCapacity(c => Math.max(2, c - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >−</button>
              <input
                type="number"
                min={2}
                max={20}
                value={capacity}
                onChange={e => setCapacity(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 font-playfair text-2xl text-center text-gray-800 focus:outline-none focus:border-gold-400"
              />
              <button
                onClick={() => setCapacity(c => Math.min(20, c + 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >+</button>
            </div>
          </div>

          <div>
            <label className="block font-raleway text-xs text-gray-500 uppercase tracking-wider mb-3">
              Number of tables
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTableCount(c => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >−</button>
              <input
                type="number"
                min={1}
                max={50}
                value={tableCount}
                onChange={e => setTableCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 font-playfair text-2xl text-center text-gray-800 focus:outline-none focus:border-gold-400"
              />
              <button
                onClick={() => setTableCount(c => Math.min(50, c + 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold"
              >+</button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-cream-50 border border-cream-200 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-playfair text-2xl text-gray-800">{tableCount}</p>
              <p className="font-raleway text-xs text-gray-500">Tables</p>
            </div>
            <div>
              <p className="font-playfair text-2xl text-gray-800">{totalCapacity}</p>
              <p className="font-raleway text-xs text-gray-500">Total seats</p>
            </div>
            <div>
              <p className="font-playfair text-2xl text-gray-800">{confirmedGuests.length}</p>
              <p className="font-raleway text-xs text-gray-500">Confirmed guests</p>
            </div>
          </div>
        </div>

        {!capacityOk && (
          <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl font-raleway text-sm text-yellow-700">
            ⚠️ Total capacity ({totalCapacity}) is less than confirmed guests ({confirmedGuests.length}).
            Add more tables or increase seats per table.
          </div>
        )}

        {notEnoughRoom && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl font-raleway text-sm text-red-700">
            Not enough room on the floor plan for {tableCount} tables at this size. Try fewer or smaller.
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setCurrentStep('elements')}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-raleway text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Elements
          </button>
          <div className="relative">
            {capacityOk && <ContinueArrow label="Looks good — let's seat them!" />}
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway font-medium transition-colors"
            >
              Place Tables & Start Seating <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
