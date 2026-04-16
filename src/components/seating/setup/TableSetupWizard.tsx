import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Circle, Square, RectangleHorizontal, Crown, Baby } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { Table } from '../../../types/seating';

type TableConfig = Omit<Table, 'guestIds' | 'position'>;

const ShapeIcon = ({ shape, size = 20 }: { shape: Table['shape']; size?: number }) => {
  if (shape === 'circle') return <Circle size={size} />;
  if (shape === 'square') return <Square size={size} />;
  return <RectangleHorizontal size={size} />;
};

const defaultTable = (idx: number): TableConfig => ({
  id: `table-${Date.now()}-${idx}`,
  name: `Table ${idx + 1}`,
  shape: 'circle',
  capacity: 8,
  isHeadTable: false,
  isKidsTable: false,
});

export default function TableSetupWizard() {
  const { guests, setTables, setCurrentStep, setViewMode } = useSeatingStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tableCount, setTableCount] = useState(Math.ceil(guests.filter(g => g.rsvpStatus !== 'No').length / 8) || 5);
  const [configs, setConfigs] = useState<TableConfig[]>(() =>
    Array.from({ length: Math.ceil(guests.filter(g => g.rsvpStatus !== 'No').length / 8) || 5 }, (_, i) => defaultTable(i))
  );
  const [selectedView, setSelectedView] = useState<'list' | 'floorplan'>('floorplan');

  const confirmedGuests = guests.filter(g => g.rsvpStatus !== 'No');
  const totalCapacity = configs.reduce((sum, t) => sum + t.capacity, 0);
  const capacityOk = totalCapacity >= confirmedGuests.length;

  const updateTableCount = (n: number) => {
    const count = Math.max(1, Math.min(50, n));
    setTableCount(count);
    setConfigs(prev => {
      if (count > prev.length) {
        return [...prev, ...Array.from({ length: count - prev.length }, (_, i) => defaultTable(prev.length + i))];
      }
      return prev.slice(0, count);
    });
  };

  const updateConfig = (idx: number, updates: Partial<TableConfig>) => {
    setConfigs(prev => prev.map((c, i) => i === idx ? { ...c, ...updates } : c));
  };

  const removeConfig = (idx: number) => {
    setConfigs(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setTableCount(next.length);
      return next;
    });
  };

  const addTable = () => {
    const newConfig = defaultTable(configs.length);
    newConfig.name = `Table ${configs.length + 1}`;
    setConfigs(prev => [...prev, newConfig]);
    setTableCount(prev => prev + 1);
  };

  const handleFinish = () => {
    const tables: Table[] = configs.map((c, i) => ({
      ...c,
      id: c.id,
      guestIds: [],
      position: {
        x: 100 + (i % 4) * 220,
        y: 100 + Math.floor(i / 4) * 200,
      },
    }));
    setTables(tables);
    setViewMode(selectedView);
    setCurrentStep('workspace');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <button
              onClick={() => s < step && setStep(s as 1 | 2 | 3)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-raleway text-sm font-semibold transition-all ${
                step === s ? 'bg-gold-500 text-white' :
                s < step ? 'bg-gold-200 text-gold-700 cursor-pointer hover:bg-gold-300' :
                'bg-gray-100 text-gray-400'
              }`}
            >
              {s}
            </button>
            {s < 3 && <div className={`w-16 h-0.5 ${s < step ? 'bg-gold-400' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Guest Summary */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-playfair text-4xl text-gray-800 mb-2">Guest Summary</h2>
            <p className="font-raleway text-gray-500">Review your guest list before configuring tables.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-cream-200 rounded-2xl p-5 text-center">
              <div className="text-3xl font-playfair text-gold-600 mb-1">{guests.length}</div>
              <div className="font-raleway text-sm text-gray-500">Total Guests</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="text-3xl font-playfair text-green-600 mb-1">
                {guests.filter(g => g.rsvpStatus === 'Yes').length}
              </div>
              <div className="font-raleway text-sm text-green-700">Confirmed</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
              <div className="text-3xl font-playfair text-yellow-600 mb-1">
                {guests.filter(g => g.rsvpStatus === 'Pending').length}
              </div>
              <div className="font-raleway text-sm text-yellow-700">Pending</div>
            </div>
          </div>

          <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6">
            <h3 className="font-playfair text-gray-700 mb-3">By Relationship</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(
                guests.reduce<Record<string, number>>((acc, g) => {
                  acc[g.relationship] = (acc[g.relationship] ?? 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([rel, count]) => (
                <div key={rel} className="flex justify-between items-center py-1">
                  <span className="font-raleway text-sm text-gray-600">{rel}</span>
                  <span className="font-raleway text-sm font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {guests.length === 0 && (
            <div className="text-center text-gray-400 font-raleway py-4">
              No guests imported. You can add guests manually in the workspace.
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('import')}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-raleway text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Import
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway font-medium transition-colors"
            >
              Configure Tables <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Table Configuration */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-playfair text-4xl text-gray-800 mb-2">Configure Tables</h2>
            <p className="font-raleway text-gray-500">Set up your table layout and seating capacity.</p>
          </div>

          {/* Count selector */}
          <div className="bg-white border border-cream-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-playfair text-gray-700">Number of Tables</p>
              <p className="font-raleway text-sm text-gray-400">
                {totalCapacity} seats total — {confirmedGuests.length} confirmed guests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateTableCount(tableCount - 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-raleway font-bold text-gray-600"
              >
                −
              </button>
              <span className="font-playfair text-2xl text-gold-600 w-8 text-center">{tableCount}</span>
              <button
                onClick={() => updateTableCount(tableCount + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-raleway font-bold text-gray-600"
              >
                +
              </button>
            </div>
          </div>

          {!capacityOk && (
            <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl font-raleway text-yellow-700 text-sm">
              ⚠️ Total capacity ({totalCapacity}) is less than confirmed guests ({confirmedGuests.length}).
              Consider adding more tables or increasing capacity.
            </div>
          )}

          {/* Table cards */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {configs.map((table, idx) => (
              <div key={table.id} className="bg-white border border-cream-200 rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {/* Name */}
                    <div className="col-span-2">
                      <label className="block font-raleway text-xs text-gray-500 mb-1">Table Name</label>
                      <input
                        type="text"
                        value={table.name}
                        onChange={e => updateConfig(idx, { name: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 font-raleway text-sm focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    {/* Shape */}
                    <div>
                      <label className="block font-raleway text-xs text-gray-500 mb-1">Shape</label>
                      <div className="flex gap-1">
                        {(['circle', 'rectangle', 'square'] as Table['shape'][]).map(shape => (
                          <button
                            key={shape}
                            onClick={() => updateConfig(idx, { shape })}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-raleway flex flex-col items-center gap-1 transition-colors ${
                              table.shape === shape ? 'border-gold-500 bg-gold-50 text-gold-600' : 'border-gray-200 text-gray-500 hover:border-gold-300'
                            }`}
                          >
                            <ShapeIcon shape={shape} size={14} />
                            <span className="capitalize text-xs">{shape}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="block font-raleway text-xs text-gray-500 mb-1">Capacity (seats)</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={table.capacity}
                        onChange={e => updateConfig(idx, { capacity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 font-raleway text-sm focus:outline-none focus:border-gold-400"
                      />
                    </div>

                    {/* Special */}
                    <div className="col-span-2 flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={table.isHeadTable}
                          onChange={e => updateConfig(idx, { isHeadTable: e.target.checked })}
                          className="accent-gold-500"
                        />
                        <span className="font-raleway text-sm text-gray-600 flex items-center gap-1">
                          <Crown size={14} className="text-gold-500" /> Head Table
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={table.isKidsTable}
                          onChange={e => updateConfig(idx, { isKidsTable: e.target.checked })}
                          className="accent-gold-500"
                        />
                        <span className="font-raleway text-sm text-gray-600 flex items-center gap-1">
                          <Baby size={14} className="text-blue-400" /> Kids Table
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => removeConfig(idx)}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors mt-1"
                    title="Remove table"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addTable}
            className="w-full py-3 border-2 border-dashed border-gold-300 rounded-2xl font-raleway text-gold-600 hover:border-gold-400 hover:bg-gold-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Another Table
          </button>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-raleway text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={configs.length === 0}
              className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway font-medium transition-colors disabled:opacity-50"
            >
              Choose Layout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Layout Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-playfair text-4xl text-gray-800 mb-2">Choose Your View</h2>
            <p className="font-raleway text-gray-500">How would you like to arrange your seating chart?</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedView('list')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                selectedView === 'list' ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300'
              }`}
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-playfair text-lg text-gray-800 mb-2">List View</h3>
              <p className="font-raleway text-sm text-gray-500">
                Tables displayed as columns. Great for large guest lists and quick seating.
              </p>
              <div className="mt-3 text-xs font-raleway text-gold-600 font-medium">Recommended for beginners</div>
            </button>

            <button
              onClick={() => setSelectedView('floorplan')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                selectedView === 'floorplan' ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-300'
              }`}
            >
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-playfair text-lg text-gray-800 mb-2">Floor Plan</h3>
              <p className="font-raleway text-sm text-gray-500">
                Visual 2D venue layout. Drag tables around the room and see the full picture.
              </p>
              <div className="mt-3 text-xs font-raleway text-blue-500 font-medium">Visual planners love this</div>
            </button>
          </div>

          <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5">
            <h3 className="font-playfair text-gray-700 mb-2">Your Setup Summary</h3>
            <div className="font-raleway text-sm text-gray-600 space-y-1">
              <p>• {configs.length} tables configured</p>
              <p>• {totalCapacity} total seats</p>
              <p>• {guests.length} guests to seat</p>
              <p>• {guests.filter(g => g.rsvpStatus === 'Yes').length} confirmed guests</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl font-raleway text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway font-medium transition-colors"
            >
              Start Seating! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
