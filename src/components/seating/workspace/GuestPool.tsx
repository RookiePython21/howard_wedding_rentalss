import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Search, UserPlus, X } from 'lucide-react';
import { Guest } from '../../../types/seating';
import { useSeatingStore } from '../../../store/seatingStore';
import GuestCard from './GuestCard';

interface GuestPoolProps {
  guests: Guest[];
}

export default function GuestPool({ guests }: GuestPoolProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'pool' });
  const { updateGuest } = useSeatingStore();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', side: 'Both' as Guest['side'], relationship: 'Guest', rsvpStatus: 'Yes' as Guest['rsvpStatus'] });

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.relationship.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddGuest = () => {
    if (!newGuest.name.trim()) return;
    updateGuest('', {});  // no-op to trigger store
    const store = useSeatingStore.getState();
    const guest: Guest = {
      id: `guest-${Date.now()}`,
      name: newGuest.name.trim(),
      side: newGuest.side,
      relationship: newGuest.relationship || 'Guest',
      plusOne: null,
      rsvpStatus: newGuest.rsvpStatus,
      notes: '',
      photoUrl: null,
      howWeMet: null,
      memory: null,
      tableId: null,
    };
    store.setGuests([...store.guests, guest]);
    setNewGuest({ name: '', side: 'Both', relationship: 'Guest', rsvpStatus: 'Yes' });
    setShowAddForm(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full transition-colors rounded-2xl border-2 ${
        isOver ? 'border-gold-400 bg-gold-50' : 'border-transparent'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-cream-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-playfair text-gray-700 text-lg">
            Unseated Guests
            <span className="ml-2 text-sm font-raleway text-gray-400">({guests.length})</span>
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs font-raleway text-gold-600 hover:text-gold-700 transition-colors"
          >
            <UserPlus size={14} />
            Add Guest
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg font-raleway focus:outline-none focus:border-gold-400"
          />
        </div>
      </div>

      {/* Add Guest Form */}
      {showAddForm && (
        <div className="px-4 py-3 bg-cream-50 border-b border-cream-200">
          <p className="font-raleway text-xs font-semibold text-gray-600 mb-2">Add Guest Manually</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Full Name *"
              value={newGuest.name}
              onChange={e => setNewGuest(p => ({ ...p, name: e.target.value }))}
              className="col-span-2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-raleway focus:outline-none focus:border-gold-400"
            />
            <select
              value={newGuest.side}
              onChange={e => setNewGuest(p => ({ ...p, side: e.target.value as Guest['side'] }))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-raleway focus:outline-none focus:border-gold-400"
            >
              <option value="Both">Both Sides</option>
              <option value="Bride">Bride's Side</option>
              <option value="Groom">Groom's Side</option>
            </select>
            <select
              value={newGuest.rsvpStatus}
              onChange={e => setNewGuest(p => ({ ...p, rsvpStatus: e.target.value as Guest['rsvpStatus'] }))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-raleway focus:outline-none focus:border-gold-400"
            >
              <option value="Yes">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="No">Declined</option>
            </select>
            <input
              type="text"
              placeholder="Relationship (Family, Friends...)"
              value={newGuest.relationship}
              onChange={e => setNewGuest(p => ({ ...p, relationship: e.target.value }))}
              className="col-span-2 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-raleway focus:outline-none focus:border-gold-400"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddGuest}
              className="flex-1 py-1.5 bg-gold-500 text-white rounded-lg text-sm font-raleway hover:bg-gold-600 transition-colors"
            >
              Add Guest
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Guest list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            {guests.length === 0 ? (
              <div className="text-gray-400">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-raleway text-sm">All guests are seated!</p>
              </div>
            ) : (
              <p className="font-raleway text-sm text-gray-400">No guests match your search.</p>
            )}
          </div>
        ) : (
          filtered.map(guest => (
            <GuestCard key={guest.id} guest={guest} compact />
          ))
        )}
      </div>

      {isOver && (
        <div className="px-4 py-2 text-center">
          <p className="font-raleway text-xs text-gold-600">Drop here to unseat guest</p>
        </div>
      )}
    </div>
  );
}
