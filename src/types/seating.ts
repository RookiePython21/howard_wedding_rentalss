export interface Guest {
  id: string;
  name: string;
  side: 'Bride' | 'Groom' | 'Both';
  relationship: string;
  plusOne: string | null;
  rsvpStatus: 'Yes' | 'No' | 'Pending';
  notes: string;
  photoUrl: string | null;
  howWeMet: string | null;
  memory: string | null;
  tableId: string | null;
}

export interface VenueElement {
  id: string;
  type: string;
  icon: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export interface Table {
  id: string;
  name: string;
  shape: 'circle' | 'rectangle' | 'square';
  capacity: number;
  isHeadTable: boolean;
  isKidsTable: boolean;
  position: { x: number; y: number };
  guestIds: string[];
  seats: (string | null)[];
  width?: number;
  height?: number;
  rotation?: number;
}

export interface RelationshipTag {
  id: string;
  guestId1: string;
  guestId2: string;
  type: 'must-sit-together' | 'keep-apart';
  note?: string;
}

export interface SeatingVersion {
  id: string;
  name: string;
  guestTableAssignments: Record<string, string | null>;
  tableGuestIds: Record<string, string[]>;
  timestamp: string;
}

export type AppStep = 'import' | 'head-table' | 'elements' | 'setup' | 'seat' | 'workspace';
export type ViewMode = 'list' | 'floorplan';

export interface HistorySnapshot {
  guests: Guest[];
  tables: Table[];
}
