import * as XLSX from 'xlsx';
import { Guest } from '../types/seating';

const parseSide = (val: unknown): Guest['side'] => {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'bride') return 'Bride';
  if (s === 'groom') return 'Groom';
  return 'Both';
};

const parseRsvp = (val: unknown): Guest['rsvpStatus'] => {
  const s = String(val ?? '').toLowerCase().trim();
  if (s === 'yes' || s === 'confirmed' || s === 'y') return 'Yes';
  if (s === 'no' || s === 'declined' || s === 'n') return 'No';
  return 'Pending';
};

const findColumn = (row: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const found = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
    if (found !== undefined && row[found] !== undefined && row[found] !== null) {
      return String(row[found]).trim();
    }
  }
  return '';
};

export interface ParseResult {
  guests: Guest[];
  errors: string[];
  warnings: string[];
}

export const parseExcelFile = (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        if (rows.length === 0) {
          resolve({ guests: [], errors: ['No data found in file.'], warnings: [] });
          return;
        }

        const errors: string[] = [];
        const warnings: string[] = [];
        const nameCount: Record<string, number> = {};
        const guests: Guest[] = [];

        rows.forEach((row, idx) => {
          const name = findColumn(row, 'name', 'guest name', 'guest', 'full name');
          if (!name) {
            warnings.push(`Row ${idx + 2}: Missing name, skipped.`);
            return;
          }

          // Handle duplicates
          nameCount[name] = (nameCount[name] ?? 0) + 1;
          const displayName = nameCount[name] > 1 ? `${name} (${nameCount[name]})` : name;

          const plusOneRaw = findColumn(row, 'plus one', 'plusone', 'plus_one', 'guest plus one');
          let plusOne: string | null = null;
          if (plusOneRaw && plusOneRaw.toLowerCase() !== 'no' && plusOneRaw !== '0') {
            plusOne = plusOneRaw.toLowerCase() === 'yes' || plusOneRaw === '1'
              ? `${displayName}'s Plus One`
              : plusOneRaw;
          }

          guests.push({
            id: `guest-${Date.now()}-${idx}`,
            name: displayName,
            side: parseSide(findColumn(row, 'side', 'bride/groom', 'bride or groom')),
            relationship: findColumn(row, 'relationship', 'group', 'category') || 'Guest',
            plusOne,
            rsvpStatus: parseRsvp(findColumn(row, 'rsvp', 'rsvp status', 'attending')),
            notes: findColumn(row, 'notes', 'note', 'comments', 'dietary'),
            photoUrl: findColumn(row, 'photo', 'photo url', 'image', 'image url') || null,
            howWeMet: findColumn(row, 'how we met', 'story', 'how met') || null,
            memory: null,
            tableId: null,
          });
        });

        if (guests.length === 0) {
          errors.push('No valid guests found. Make sure your file has a "Name" column.');
        }

        resolve({ guests, errors, warnings });
      } catch (err) {
        reject(new Error('Unable to read file. Please try Excel (.xlsx, .xls) or CSV format.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
};
