import type { Guest, Table } from '../types/seating';

/** True when the user has a guest list, tables, and at least one seated guest (foam board / print-ready). */
export function canPurchaseFoamBoard(guests: Guest[], tables: Table[]): boolean {
  if (guests.length === 0 || tables.length === 0) return false;
  return guests.some(g => g.tableId !== null);
}
