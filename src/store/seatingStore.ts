import { create } from 'zustand';
import {
  Guest,
  Table,
  RelationshipTag,
  SeatingVersion,
  AppStep,
  ViewMode,
  HistorySnapshot,
  VenueElement,
} from '../types/seating';
import {
  saveChartToCloud,
  loadChartFromCloud,
  CloudChartPayload,
} from '../services/cloudSync';

const MAX_HISTORY = 50;
const STORAGE_KEY = 'seating_chart_state';

// Debounced save — position drag fires on every mousemove; batch saves to 400ms after last move
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSave = (state: Parameters<typeof saveToLS>[0]) => {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => saveToLS(state), 400);
};

interface SeatingState {
  guests: Guest[];
  tables: Table[];
  venueElements: VenueElement[];
  relationships: RelationshipTag[];
  versions: SeatingVersion[];
  currentStep: AppStep;
  viewMode: ViewMode;
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Guest actions
  setGuests: (guests: Guest[]) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  moveGuestToTable: (guestId: string, tableId: string | null) => void;
  assignGuestToSeat: (tableId: string, seatIndex: number, guestId: string | null) => void;

  // Table actions
  setTables: (tables: Table[]) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;

  // Venue element actions
  setVenueElements: (els: VenueElement[]) => void;
  addVenueElement: (el: VenueElement) => void;
  updateVenueElement: (id: string, updates: Partial<VenueElement>) => void;
  removeVenueElement: (id: string) => void;

  // Relationship actions
  addRelationship: (rel: RelationshipTag) => void;
  removeRelationship: (id: string) => void;

  // Version actions
  saveVersion: (name: string) => void;
  loadVersion: (versionId: string) => void;
  deleteVersion: (versionId: string) => void;

  // UI
  setCurrentStep: (step: AppStep) => void;
  setViewMode: (mode: ViewMode) => void;

  // Fun
  chaosMode: () => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Onboarding
  showTutorial: boolean;
  setShowTutorial: (v: boolean) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  reset: () => void;

  // Cloud persistence
  cloudSaving: boolean;
  cloudLoading: boolean;
  cloudLastSavedAt: number | null;
  cloudError: string | null;
  saveToCloud: (uid: string, email: string | null) => Promise<void>;
  loadFromCloud: (uid: string) => Promise<boolean>;
}

// Ensure table.seats is a fixed-length array matching capacity.
// Migrates legacy persisted tables (no seats field) and repairs length drift.
const normalizeTable = (t: Table): Table => {
  const seats = Array.isArray(t.seats) ? [...t.seats] : [];
  while (seats.length < t.capacity) seats.push(null);
  if (seats.length > t.capacity) seats.length = t.capacity;
  // Drop seat assignments for guests no longer in guestIds
  const allowed = new Set(t.guestIds);
  for (let i = 0; i < seats.length; i++) {
    if (seats[i] && !allowed.has(seats[i]!)) seats[i] = null;
  }
  return { ...t, seats };
};

const snapshot = (state: SeatingState): HistorySnapshot => ({
  guests: JSON.parse(JSON.stringify(state.guests)),
  tables: JSON.parse(JSON.stringify(state.tables)),
});

const saveToLS = (state: Pick<SeatingState, 'guests' | 'tables' | 'venueElements' | 'relationships' | 'versions' | 'currentStep' | 'viewMode'>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      guests: state.guests,
      tables: state.tables,
      venueElements: state.venueElements,
      relationships: state.relationships,
      versions: state.versions,
      currentStep: state.currentStep,
      viewMode: state.viewMode,
    }));
  } catch {
    // storage full
  }
};

export const useSeatingStore = create<SeatingState>((set, get) => ({
  guests: [],
  tables: [],
  venueElements: [],
  relationships: [],
  versions: [],
  currentStep: 'import',
  viewMode: 'list',
  past: [],
  future: [],
  showTutorial: false,
  cloudSaving: false,
  cloudLoading: false,
  cloudLastSavedAt: null,
  cloudError: null,

  pushHistory: () => {
    const state = get();
    const snap = snapshot(state);
    set({
      past: [...state.past.slice(-MAX_HISTORY + 1), snap],
      future: [],
    });
  },

  setGuests: (guests) => {
    get().pushHistory();
    set({ guests });
    saveToLS({ ...get(), guests });
  },

  updateGuest: (id, updates) => {
    get().pushHistory();
    const guests = get().guests.map(g => g.id === id ? { ...g, ...updates } : g);
    set({ guests });
    saveToLS({ ...get(), guests });
  },

  removeGuest: (id) => {
    get().pushHistory();
    const guest = get().guests.find(g => g.id === id);
    const tables = get().tables.map(t => ({
      ...t,
      guestIds: t.guestIds.filter(gid => gid !== id),
      seats: t.seats.map(s => (s === id ? null : s)),
    }));
    const guests = get().guests.filter(g => g.id !== id);
    const relationships = get().relationships.filter(r => r.guestId1 !== id && r.guestId2 !== id);
    set({ guests, tables, relationships });
    saveToLS({ ...get(), guests, tables, relationships });
    void guest; // suppress unused warning
  },

  moveGuestToTable: (guestId, tableId) => {
    get().pushHistory();
    const state = get();
    const guest = state.guests.find(g => g.id === guestId);
    if (!guest) return;

    const oldTableId = guest.tableId;

    const guests = state.guests.map(g =>
      g.id === guestId ? { ...g, tableId } : g
    );

    const tables = state.tables.map(t => {
      let guestIds = t.guestIds.filter(id => id !== guestId);
      let seats = t.seats.map(s => (s === guestId ? null : s));
      if (t.id === tableId) guestIds = [...guestIds, guestId];
      return { ...t, guestIds, seats };
    });

    set({ guests, tables });
    saveToLS({ ...get(), guests, tables });
    void oldTableId;
  },

  assignGuestToSeat: (tableId, seatIndex, guestId) => {
    get().pushHistory();
    const state = get();
    const table = state.tables.find(t => t.id === tableId);
    if (!table) return;
    if (seatIndex < 0 || seatIndex >= table.capacity) return;

    // Guest currently at this seat (if any) gets bumped back to the pool
    const displacedId = table.seats[seatIndex] ?? null;

    const affectedGuestIds = new Set<string>();
    if (displacedId) affectedGuestIds.add(displacedId);
    if (guestId) affectedGuestIds.add(guestId);

    const tables = state.tables.map(t => {
      let guestIds = [...t.guestIds];
      let seats = [...t.seats];

      // Clear the incoming guest out of every other seat on every table
      if (guestId) {
        seats = seats.map(s => (s === guestId ? null : s));
        if (t.id !== tableId) guestIds = guestIds.filter(id => id !== guestId);
      }
      // Clear the displaced guest out of this table entirely
      if (displacedId && t.id === tableId) {
        guestIds = guestIds.filter(id => id !== displacedId);
      }

      if (t.id === tableId) {
        seats[seatIndex] = guestId;
        if (guestId && !guestIds.includes(guestId)) guestIds.push(guestId);
      }

      return { ...t, guestIds, seats };
    });

    const guests = state.guests.map(g => {
      if (g.id === guestId) return { ...g, tableId };
      if (g.id === displacedId) return { ...g, tableId: null };
      return g;
    });

    set({ guests, tables });
    saveToLS({ ...get(), guests, tables });
  },

  setTables: (tables) => {
    const normalized = tables.map(normalizeTable);
    set({ tables: normalized });
    saveToLS({ ...get(), tables: normalized });
  },

  addTable: (table) => {
    const tables = [...get().tables, normalizeTable(table)];
    set({ tables });
    saveToLS({ ...get(), tables });
  },

  updateTable: (id, updates) => {
    const tables = get().tables.map(t => t.id === id ? normalizeTable({ ...t, ...updates }) : t);
    set({ tables });
    saveToLS({ ...get(), tables });
  },

  removeTable: (id) => {
    get().pushHistory();
    // unassign guests from this table
    const guests = get().guests.map(g =>
      g.tableId === id ? { ...g, tableId: null } : g
    );
    const tables = get().tables.filter(t => t.id !== id);
    set({ guests, tables });
    saveToLS({ ...get(), guests, tables });
  },

  updateTablePosition: (id, position) => {
    const tables = get().tables.map(t => t.id === id ? { ...t, position } : t);
    set({ tables });
    // Debounced — don't serialize on every mousemove frame
    debouncedSave({ ...get(), tables });
  },

  setVenueElements: (venueElements) => {
    set({ venueElements });
    saveToLS({ ...get(), venueElements });
  },

  addVenueElement: (el) => {
    const venueElements = [...get().venueElements, el];
    set({ venueElements });
    saveToLS({ ...get(), venueElements });
  },

  updateVenueElement: (id, updates) => {
    const venueElements = get().venueElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    set({ venueElements });
    saveToLS({ ...get(), venueElements });
  },

  removeVenueElement: (id) => {
    const venueElements = get().venueElements.filter(el => el.id !== id);
    set({ venueElements });
    saveToLS({ ...get(), venueElements });
  },

  addRelationship: (rel) => {
    const relationships = [...get().relationships, rel];
    set({ relationships });
    saveToLS({ ...get(), relationships });
  },

  removeRelationship: (id) => {
    const relationships = get().relationships.filter(r => r.id !== id);
    set({ relationships });
    saveToLS({ ...get(), relationships });
  },

  saveVersion: (name) => {
    const state = get();
    const guestTableAssignments: Record<string, string | null> = {};
    const tableGuestIds: Record<string, string[]> = {};

    state.guests.forEach(g => { guestTableAssignments[g.id] = g.tableId; });
    state.tables.forEach(t => { tableGuestIds[t.id] = [...t.guestIds]; });

    const version: SeatingVersion = {
      id: `v-${Date.now()}`,
      name,
      guestTableAssignments,
      tableGuestIds,
      timestamp: new Date().toISOString(),
    };

    const versions = [...state.versions, version];
    set({ versions });
    saveToLS({ ...get(), versions });
  },

  loadVersion: (versionId) => {
    get().pushHistory();
    const state = get();
    const version = state.versions.find(v => v.id === versionId);
    if (!version) return;

    const guests = state.guests.map(g => ({
      ...g,
      tableId: version.guestTableAssignments[g.id] ?? null,
    }));

    const tables = state.tables.map(t => ({
      ...t,
      guestIds: version.tableGuestIds[t.id] ?? [],
    }));

    set({ guests, tables });
    saveToLS({ ...get(), guests, tables });
  },

  deleteVersion: (versionId) => {
    const versions = get().versions.filter(v => v.id !== versionId);
    set({ versions });
    saveToLS({ ...get(), versions });
  },

  setCurrentStep: (step) => {
    set({ currentStep: step });
    saveToLS({ ...get(), currentStep: step });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
    saveToLS({ ...get(), viewMode: mode });
  },

  setShowTutorial: (showTutorial) => set({ showTutorial }),

  chaosMode: () => {
    get().pushHistory();
    const state = get();

    // Collect all unseated guests + randomly redistribution all guests
    const allGuests = [...state.guests];
    const shuffled = [...allGuests].sort(() => Math.random() - 0.5);

    const tables = state.tables.map(t => ({ ...t, guestIds: [] as string[] }));
    const guests = shuffled.map(g => ({ ...g, tableId: null as string | null }));

    let tableIdx = 0;
    for (const guest of guests) {
      while (tableIdx < tables.length && tables[tableIdx].guestIds.length >= tables[tableIdx].capacity) {
        tableIdx++;
      }
      if (tableIdx < tables.length) {
        tables[tableIdx].guestIds.push(guest.id);
        guests.find(g => g.id === guest.id)!.tableId = tables[tableIdx].id;
      }
    }

    set({ guests, tables });
    saveToLS({ ...get(), guests, tables });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    const currentSnap = snapshot(state);
    set({
      past: newPast,
      future: [currentSnap, ...state.future],
      guests: previous.guests,
      tables: previous.tables,
    });
    saveToLS({ ...get(), guests: previous.guests, tables: previous.tables });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    const currentSnap = snapshot(state);
    set({
      past: [...state.past, currentSnap],
      future: newFuture,
      guests: next.guests,
      tables: next.tables,
    });
    saveToLS({ ...get(), guests: next.guests, tables: next.tables });
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const rawTables: Table[] = data.tables ?? [];
      // Legacy: older persisted state had step 'vip'; collapse it forward.
      const step: AppStep = data.currentStep === 'vip' ? 'workspace' : (data.currentStep ?? 'import');
      set({
        guests: data.guests ?? [],
        tables: rawTables.map(normalizeTable),
        venueElements: data.venueElements ?? [],
        relationships: data.relationships ?? [],
        versions: data.versions ?? [],
        currentStep: step,
        viewMode: data.viewMode ?? 'list',
      });
    } catch {
      // ignore
    }
  },

  saveToStorage: () => {
    saveToLS(get());
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      guests: [],
      tables: [],
      venueElements: [],
      relationships: [],
      versions: [],
      currentStep: 'import',
      viewMode: 'list',
      past: [],
      future: [],
      showTutorial: false,
    });
  },

  saveToCloud: async (uid, email) => {
    const s = get();
    set({ cloudSaving: true, cloudError: null });
    try {
      const payload: CloudChartPayload = {
        guests: s.guests,
        tables: s.tables,
        venueElements: s.venueElements,
        relationships: s.relationships,
        versions: s.versions,
        currentStep: s.currentStep,
        viewMode: s.viewMode,
      };
      await saveChartToCloud(uid, email, payload);
      set({ cloudSaving: false, cloudLastSavedAt: Date.now() });
    } catch (e) {
      set({ cloudSaving: false, cloudError: (e as Error).message });
      throw e;
    }
  },

  loadFromCloud: async (uid) => {
    set({ cloudLoading: true, cloudError: null });
    try {
      const data = await loadChartFromCloud(uid);
      if (!data) {
        set({ cloudLoading: false });
        return false;
      }
      const tables = data.tables.map(normalizeTable);
      set({
        guests: data.guests,
        tables,
        venueElements: data.venueElements,
        relationships: data.relationships,
        versions: data.versions,
        currentStep: data.currentStep,
        viewMode: data.viewMode,
        past: [],
        future: [],
        cloudLoading: false,
      });
      saveToLS({ ...get() });
      return true;
    } catch (e) {
      set({ cloudLoading: false, cloudError: (e as Error).message });
      throw e;
    }
  },
}));
