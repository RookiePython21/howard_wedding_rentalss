import { useState } from 'react';
import { Plus, X, Heart, Swords } from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';
import { RelationshipTag } from '../../../types/seating';

export default function RelationshipPanel() {
  const { guests, relationships, addRelationship, removeRelationship } = useSeatingStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    guestId1: string;
    guestId2: string;
    type: RelationshipTag['type'];
    note: string;
  }>({ guestId1: '', guestId2: '', type: 'must-sit-together', note: '' });

  const seated = guests;

  const handleAdd = () => {
    if (!form.guestId1 || !form.guestId2 || form.guestId1 === form.guestId2) return;
    // Check for duplicate
    const exists = relationships.some(
      r => (r.guestId1 === form.guestId1 && r.guestId2 === form.guestId2) ||
           (r.guestId1 === form.guestId2 && r.guestId2 === form.guestId1)
    );
    if (exists) return;

    addRelationship({
      id: `rel-${Date.now()}`,
      guestId1: form.guestId1,
      guestId2: form.guestId2,
      type: form.type,
      note: form.note || undefined,
    });
    setForm({ guestId1: '', guestId2: '', type: 'must-sit-together', note: '' });
    setShowForm(false);
  };

  const getGuestName = (id: string) => guests.find(g => g.id === id)?.name ?? 'Unknown';

  const together = relationships.filter(r => r.type === 'must-sit-together');
  const apart = relationships.filter(r => r.type === 'keep-apart');

  return (
    <div className="bg-white border border-cream-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-cream-200 flex items-center justify-between">
        <h3 className="font-playfair text-gray-700">Relationships</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-raleway text-gold-600 hover:text-gold-700 transition-colors"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <div className="p-3 bg-cream-50 border-b border-cream-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.guestId1}
              onChange={e => setForm(p => ({ ...p, guestId1: e.target.value }))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 font-raleway focus:outline-none focus:border-gold-400"
            >
              <option value="">Guest 1...</option>
              {seated.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select
              value={form.guestId2}
              onChange={e => setForm(p => ({ ...p, guestId2: e.target.value }))}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 font-raleway focus:outline-none focus:border-gold-400"
            >
              <option value="">Guest 2...</option>
              {seated.filter(g => g.id !== form.guestId1).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setForm(p => ({ ...p, type: 'must-sit-together' }))}
              className={`flex-1 py-1.5 rounded-lg text-xs font-raleway flex items-center justify-center gap-1 transition-colors ${
                form.type === 'must-sit-together' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'border border-gray-200 text-gray-500'
              }`}
            >
              <Heart size={12} /> Sit Together
            </button>
            <button
              onClick={() => setForm(p => ({ ...p, type: 'keep-apart' }))}
              className={`flex-1 py-1.5 rounded-lg text-xs font-raleway flex items-center justify-center gap-1 transition-colors ${
                form.type === 'keep-apart' ? 'bg-red-100 text-red-700 border border-red-300' : 'border border-gray-200 text-gray-500'
              }`}
            >
              <Swords size={12} /> Keep Apart
            </button>
          </div>
          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 font-raleway focus:outline-none focus:border-gold-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!form.guestId1 || !form.guestId2}
              className="flex-1 py-1.5 bg-gold-500 text-white rounded-lg text-xs font-raleway hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              Add Relationship
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="p-3 space-y-3">
        {together.length > 0 && (
          <div>
            <p className="font-raleway text-xs text-blue-600 font-semibold mb-1.5 flex items-center gap-1">
              <Heart size={11} /> Must Sit Together ({together.length})
            </p>
            <div className="space-y-1">
              {together.map(rel => (
                <RelTag key={rel.id} rel={rel} getName={getGuestName} onRemove={removeRelationship} />
              ))}
            </div>
          </div>
        )}

        {apart.length > 0 && (
          <div>
            <p className="font-raleway text-xs text-red-500 font-semibold mb-1.5 flex items-center gap-1">
              <Swords size={11} /> Keep Apart ({apart.length})
            </p>
            <div className="space-y-1">
              {apart.map(rel => (
                <RelTag key={rel.id} rel={rel} getName={getGuestName} onRemove={removeRelationship} />
              ))}
            </div>
          </div>
        )}

        {relationships.length === 0 && (
          <p className="font-raleway text-xs text-gray-400 text-center py-3">
            No relationships defined yet.
          </p>
        )}
      </div>
    </div>
  );
}

function RelTag({
  rel,
  getName,
  onRemove,
}: {
  rel: RelationshipTag;
  getName: (id: string) => string;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-raleway ${
      rel.type === 'must-sit-together' ? 'bg-blue-50 border border-blue-100' : 'bg-red-50 border border-red-100'
    }`}>
      <span className="truncate text-gray-700">
        {getName(rel.guestId1)} & {getName(rel.guestId2)}
        {rel.note && <span className="text-gray-400 ml-1">({rel.note})</span>}
      </span>
      <button
        onClick={() => onRemove(rel.id)}
        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
