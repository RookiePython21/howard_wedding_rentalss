export interface VenueElementConfig {
  icon: string;
  label: string;
  type: string;
  color: string;
  defaultSize?: { w: number; h: number };
}

export const VENUE_ELEMENTS: VenueElementConfig[] = [
  { icon: '💃', label: 'Dance Floor',         type: 'dance',    color: '#a855f7' },
  { icon: '🍸', label: 'Bar',                 type: 'bar',      color: '#f59e0b' },
  { icon: '🍽️', label: 'Dinner Service Area', type: 'dinner',   color: '#a16207', defaultSize: { w: 260, h: 80 } },
  { icon: '🚻', label: 'Restrooms',           type: 'bathroom', color: '#3b82f6' },
  { icon: '🎤', label: 'Stage/DJ',            type: 'stage',    color: '#ef4444' },
  { icon: '🚪', label: 'Entrance',            type: 'entrance', color: '#22c55e' },
  { icon: '🚶', label: 'Exit',                type: 'exit',     color: '#f97316' },
];

export const venueConfig = (type: string): VenueElementConfig | undefined =>
  VENUE_ELEMENTS.find(e => e.type === type);

export const venueColor = (type: string): string =>
  venueConfig(type)?.color ?? '#9ca3af';

export const venueDefaultSize = (type: string): { w: number; h: number } =>
  venueConfig(type)?.defaultSize ?? { w: 90, h: 90 };

export const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
