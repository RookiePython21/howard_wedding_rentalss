import { Users, CheckCircle2, Clock, Table } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';

export default function StatsPanel() {
  const { guests, tables } = useSeatingStore();

  const total = guests.length;
  const seated = guests.filter(g => g.tableId !== null).length;
  const confirmed = guests.filter(g => g.rsvpStatus === 'Yes').length;
  const pending = guests.filter(g => g.rsvpStatus === 'Pending').length;
  const pct = total > 0 ? Math.round((seated / total) * 100) : 0;
  const filledTables = tables.filter(t => t.guestIds.length > 0).length;

  return (
    <div className="bg-white border border-cream-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-playfair text-gray-700">Seating Progress</h3>
        <span className="font-raleway text-sm font-semibold text-gold-600">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Users size={14} className="text-gold-600" />
          </div>
          <div>
            <p className="font-raleway text-xs text-gray-400">Seated</p>
            <p className="font-raleway text-sm font-semibold text-gray-700">{seated} / {total}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} className="text-green-600" />
          </div>
          <div>
            <p className="font-raleway text-xs text-gray-400">Confirmed RSVP</p>
            <p className="font-raleway text-sm font-semibold text-gray-700">{confirmed}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock size={14} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-raleway text-xs text-gray-400">Pending</p>
            <p className="font-raleway text-sm font-semibold text-gray-700">{pending}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Table size={14} className="text-blue-600" />
          </div>
          <div>
            <p className="font-raleway text-xs text-gray-400">Tables Filled</p>
            <p className="font-raleway text-sm font-semibold text-gray-700">{filledTables} / {tables.length}</p>
          </div>
        </div>
      </div>

      {seated === total && total > 0 && (
        <div className="mt-3 py-2 px-3 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="font-raleway text-sm text-green-700">🎉 All guests are seated!</p>
        </div>
      )}
    </div>
  );
}
