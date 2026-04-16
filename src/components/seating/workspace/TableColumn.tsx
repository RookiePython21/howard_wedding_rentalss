import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Crown, Baby, Edit2, Trash2, Check, X, Users, AlertTriangle } from 'lucide-react';
import { Table, Guest, RelationshipTag } from '../../../types/seating';
import { useSeatingStore } from '../../../store/seatingStore';
import GuestCard from './GuestCard';

interface TableColumnProps {
  table: Table;
  guests: Guest[];
  relationships?: RelationshipTag[];
  conflicts: { mustTogether: boolean; keepApart: boolean };
}

export default function TableColumn({ table, guests, conflicts }: TableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: table.id });
  const { updateTable, removeTable } = useSeatingStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(table.name);

  const isFull = guests.length >= table.capacity;
  const isOverCapacity = guests.length > table.capacity;

  const saveEdit = () => {
    updateTable(table.id, { name: editName });
    setEditing(false);
  };

  const ShapeIcon = () => {
    if (table.shape === 'circle') return <span>⭕</span>;
    if (table.shape === 'square') return <span>◼</span>;
    return <span>▭</span>;
  };

  const fillPct = Math.min(100, (guests.length / table.capacity) * 100);
  const barColor = isOverCapacity ? 'bg-red-500' : isFull ? 'bg-yellow-400' : 'bg-green-400';

  return (
    <div
      className={`flex flex-col bg-white border-2 rounded-2xl overflow-hidden transition-all min-w-[240px] w-64 flex-shrink-0 ${
        isOver ? 'border-gold-400 shadow-lg shadow-gold-100' :
        isOverCapacity ? 'border-red-300' :
        conflicts.keepApart ? 'border-red-200' :
        conflicts.mustTogether ? 'border-yellow-300' :
        'border-cream-200 hover:border-cream-300'
      }`}
    >
      {/* Header */}
      <div className={`px-3 py-2.5 border-b border-cream-200 ${isOver ? 'bg-gold-50' : 'bg-cream-50'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {table.isHeadTable && <Crown size={14} className="text-gold-500 flex-shrink-0" />}
            {table.isKidsTable && <Baby size={14} className="text-blue-400 flex-shrink-0" />}
            <ShapeIcon />
            {editing ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
                  className="flex-1 text-sm border border-gold-300 rounded px-1.5 py-0.5 font-raleway focus:outline-none"
                />
                <button onClick={saveEdit} className="text-green-500 hover:text-green-600"><Check size={13} /></button>
                <button onClick={() => setEditing(false)} className="text-red-400 hover:text-red-500"><X size={13} /></button>
              </div>
            ) : (
              <button
                onClick={() => { setEditName(table.name); setEditing(true); }}
                className="font-playfair text-sm text-gray-700 hover:text-gold-600 transition-colors truncate flex items-center gap-1 group"
              >
                {table.name}
                <Edit2 size={11} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <span className={`font-raleway text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
              isOverCapacity ? 'bg-red-100 text-red-600' :
              isFull ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              <Users size={10} /> {guests.length}/{table.capacity}
            </span>
            <button
              onClick={() => removeTable(table.id)}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="Remove table"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>

        {/* Conflict warnings */}
        {(conflicts.keepApart || conflicts.mustTogether) && (
          <div className="mt-1.5 flex items-center gap-1">
            <AlertTriangle size={11} className={conflicts.keepApart ? 'text-red-500' : 'text-yellow-500'} />
            <span className="font-raleway text-xs text-red-500">
              {conflicts.keepApart ? 'Keep-apart conflict!' : 'Must-sit-together separated'}
            </span>
          </div>
        )}
      </div>

      {/* Guest drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-1.5 min-h-[120px] transition-colors ${
          isOver ? 'bg-gold-50' : isFull && !isOver ? 'bg-red-50/30' : ''
        }`}
      >
        {isFull && !isOver && guests.length > 0 && (
          <div className="text-center py-1">
            <span className="font-raleway text-xs text-red-400">Table full</span>
          </div>
        )}

        {guests.map(guest => (
          <GuestCard key={guest.id} guest={guest} compact />
        ))}

        {guests.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[80px]">
            <p className="font-raleway text-xs text-gray-300">Drop guests here</p>
          </div>
        )}

        {isOver && (
          <div className="border-2 border-dashed border-gold-400 rounded-lg h-10 flex items-center justify-center">
            <span className="font-raleway text-xs text-gold-500">Release to seat</span>
          </div>
        )}
      </div>
    </div>
  );
}
