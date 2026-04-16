import { useCallback, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { useSeatingStore } from '../../../store/seatingStore';
import { Guest } from '../../../types/seating';
import GuestCard from './GuestCard';
import GuestPool from './GuestPool';
import TableColumn from './TableColumn';
import StatsPanel from './StatsPanel';
import RelationshipPanel from './RelationshipPanel';
import { useState } from 'react';

export default function ListView() {
  const { guests, tables, relationships, moveGuestToTable } = useSeatingStore();
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const confettiFired = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const unseatedGuests = guests.filter(g => g.tableId === null);

  // Fire confetti when all guests are seated
  useEffect(() => {
    const total = guests.length;
    const seated = guests.filter(g => g.tableId !== null).length;
    if (total > 0 && seated === total && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c9873a', '#f2d9a2', '#e8be6a', '#ffffff', '#fdf8ee'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { x: 0, y: 0.5 },
        });
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { x: 1, y: 0.5 },
        });
      }, 400);
    } else if (seated < total) {
      confettiFired.current = false;
    }
  }, [guests]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const guest = guests.find(g => g.id === event.active.id);
    setActiveGuest(guest ?? null);
  }, [guests]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveGuest(null);
    const { active, over } = event;
    if (!over) return;

    const guestId = active.id as string;
    const targetId = over.id as string;

    if (targetId === 'pool') {
      moveGuestToTable(guestId, null);
      return;
    }

    const targetTable = tables.find(t => t.id === targetId);
    if (!targetTable) return;

    // Check capacity (allow but warn via UI)
    moveGuestToTable(guestId, targetTable.id);
  }, [tables, moveGuestToTable]);

  // Compute relationship conflicts per table
  const getConflicts = (tableId: string) => {
    const tableGuestIds = tables.find(t => t.id === tableId)?.guestIds ?? [];

    const keepApart = relationships.filter(r => r.type === 'keep-apart').some(
      r => tableGuestIds.includes(r.guestId1) && tableGuestIds.includes(r.guestId2)
    );

    const mustTogether = relationships.filter(r => r.type === 'must-sit-together').some(
      r => (tableGuestIds.includes(r.guestId1) && !tableGuestIds.includes(r.guestId2)) ||
           (!tableGuestIds.includes(r.guestId1) && tableGuestIds.includes(r.guestId2))
    );

    return { keepApart, mustTogether };
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full overflow-hidden">
        {/* Left sidebar: pool + stats + relationships */}
        <div className="w-64 flex-shrink-0 border-r border-cream-200 flex flex-col bg-cream-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <StatsPanel />
            <div className="flex-1">
              <GuestPool guests={unseatedGuests} />
            </div>
            <RelationshipPanel />
          </div>
        </div>

        {/* Main tables area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <div className="flex gap-4 items-start min-w-max">
            {tables.map(table => {
              const tableGuests = table.guestIds.map(id => guests.find(g => g.id === id)!).filter(Boolean);
              const conflicts = getConflicts(table.id);
              return (
                <TableColumn
                  key={table.id}
                  table={table}
                  guests={tableGuests}
                  relationships={relationships}
                  conflicts={conflicts}
                />
              );
            })}

            {tables.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                <div className="text-5xl mb-4">🪑</div>
                <p className="font-playfair text-xl text-gray-600 mb-2">No tables yet</p>
                <p className="font-raleway text-sm text-gray-400">Go back to setup to configure your tables.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeGuest && <GuestCard guest={activeGuest} compact isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
