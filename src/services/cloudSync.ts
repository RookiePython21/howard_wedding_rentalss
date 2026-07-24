import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
  Guest,
  Table,
  VenueElement,
  RelationshipTag,
  SeatingVersion,
  AppStep,
  ViewMode,
} from '../types/seating';

export interface CloudChartPayload {
  guests: Guest[];
  tables: Table[];
  venueElements: VenueElement[];
  relationships: RelationshipTag[];
  versions: SeatingVersion[];
  currentStep: AppStep;
  viewMode: ViewMode;
}

// One chart per user — saved at users/{uid}/charts/primary.
const chartDoc = (uid: string) => doc(db, 'users', uid, 'charts', 'primary');

// Lead-capture write — collected at email-gated export points for future upsells.
// Best-effort: callers should swallow errors so a failed write never blocks the export.
export async function saveLead(
  email: string,
  meta: { source: string; guestCount: number; tableCount: number },
) {
  await addDoc(collection(db, 'leads'), {
    email: email.trim().toLowerCase(),
    ...meta,
    createdAt: serverTimestamp(),
  });
}

export async function saveChartToCloud(
  uid: string,
  email: string | null,
  payload: CloudChartPayload,
) {
  await setDoc(
    chartDoc(uid),
    {
      ...payload,
      email,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  );
}

export async function loadChartFromCloud(
  uid: string,
): Promise<CloudChartPayload | null> {
  const snap = await getDoc(chartDoc(uid));
  if (!snap.exists()) return null;
  const d = snap.data() as Partial<CloudChartPayload>;
  return {
    guests: d.guests ?? [],
    tables: d.tables ?? [],
    venueElements: d.venueElements ?? [],
    relationships: d.relationships ?? [],
    versions: d.versions ?? [],
    currentStep: (d.currentStep as AppStep) ?? 'import',
    viewMode: (d.viewMode as ViewMode) ?? 'list',
  };
}
