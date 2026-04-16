import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';

// ── One-time style injection ───────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes fpt-pulse {
    0%   { box-shadow: 0 0 0 4px rgba(201,135,58,0.5), 0 0 0 9999px rgba(8,8,8,0.62); }
    55%  { box-shadow: 0 0 0 22px rgba(201,135,58,0),  0 0 0 9999px rgba(8,8,8,0.62); }
    100% { box-shadow: 0 0 0 4px rgba(201,135,58,0.5), 0 0 0 9999px rgba(8,8,8,0.62); }
  }
  @keyframes fpt-tip-in {
    from { opacity: 0; transform: scale(0.91) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0px);  }
  }
`;

let _injected = false;
function ensureStyles() {
  if (_injected || typeof document === 'undefined') return;
  const s = document.createElement('style');
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
  _injected = true;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HeadTableScreenRect {
  x: number; y: number; w: number; h: number;
  shape: 'circle' | 'rectangle' | 'square';
}

export interface VenuePosition {
  id: string;
  label: string;
  canvasX: number;
  canvasY: number;
}

export interface VenueStepConfig {
  type: string;
  icon: string;
  label: string;
  question: string;
  hint: string;
}

// Canvas dimensions (must match FloorPlanView constants)
const CW = 1400;
const CH = 1000;
const VEL = 90; // default venue element size

export const VENUE_STEPS: VenueStepConfig[] = [
  {
    type: 'entrance',
    icon: '🚪',
    label: 'Entrance',
    question: 'Where is your entrance?',
    hint: 'Guests arrive here first. Seat greeters, close family, and anyone who loves welcoming people nearby — they\'ll set the tone for the whole evening.',
  },
  {
    type: 'bar',
    icon: '🍸',
    label: 'Bar',
    question: 'Where is the bar?',
    hint: 'Social butterflies gravitate here. Seat your outgoing, talkative guests close to the bar — they\'ll thrive in the energy and keep conversations flowing.',
  },
  {
    type: 'dance',
    icon: '💃',
    label: 'Dance Floor',
    question: 'Where is the dance floor?',
    hint: 'Seat younger, energetic guests and those you know will hit the floor right up front. Elderly guests or anyone who prefers quiet conversation will be happier farther back.',
  },
  {
    type: 'bathroom',
    icon: '🚻',
    label: 'Restrooms',
    question: 'Where are the restrooms?',
    hint: 'Elderly guests, parents with young children, and anyone with mobility needs will appreciate being seated within easy reach of the restrooms.',
  },
];

// 9-position room grid with canvas coordinates
export const GRID_POSITIONS: VenuePosition[] = [
  { id: 'tl', label: 'Top Left',      canvasX: 80,                       canvasY: 80 },
  { id: 'tc', label: 'Top Center',    canvasX: Math.round((CW - VEL) / 2), canvasY: 80 },
  { id: 'tr', label: 'Top Right',     canvasX: CW - VEL - 80,            canvasY: 80 },
  { id: 'ml', label: 'Middle Left',   canvasX: 80,                       canvasY: Math.round((CH - VEL) / 2) },
  { id: 'mc', label: 'Center',        canvasX: Math.round((CW - VEL) / 2), canvasY: Math.round((CH - VEL) / 2) },
  { id: 'mr', label: 'Middle Right',  canvasX: CW - VEL - 80,            canvasY: Math.round((CH - VEL) / 2) },
  { id: 'bl', label: 'Bottom Left',   canvasX: 80,                       canvasY: CH - VEL - 80 },
  { id: 'bc', label: 'Bottom Center', canvasX: Math.round((CW - VEL) / 2), canvasY: CH - VEL - 80 },
  { id: 'br', label: 'Bottom Right',  canvasX: CW - VEL - 80,            canvasY: CH - VEL - 80 },
];

// ── TourOverlay steps (shown after onboarding completes) ──────────────────────

interface TourStep {
  icon: string; title: string; body: string;
  target: string; side: 'left' | 'right' | 'bottom';
}

const STEPS: TourStep[] = [
  {
    icon: '🪑', title: 'Add More Tables',
    body: 'Pick a shape and seat count, then add as many tables as you need across the floor.',
    target: 'right-panel-tables', side: 'left',
  },
  {
    icon: '🎪', title: 'Adjust Venue Elements',
    body: 'Drag any venue element to fine-tune its position. You can also add extras like a stage or DJ booth.',
    target: 'right-panel-venue', side: 'left',
  },
  {
    icon: '✋', title: 'Arrange Freely',
    body: 'Drag any table to reposition it. Scroll to zoom, drag the background to pan around.',
    target: 'canvas', side: 'bottom',
  },
  {
    icon: '👥', title: 'Seat Your Guests',
    body: 'Click any table to open its seating panel — search and assign guests with one tap.',
    target: 'left-panel', side: 'right',
  },
];

// ── PlacementGuide ────────────────────────────────────────────────────────────

export function PlacementGuide({
  headTableRect,
  onSkip,
}: {
  headTableRect: HeadTableScreenRect | null;
  onSkip: () => void;
}) {
  ensureStyles();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const pad = 16;
  const br = headTableRect?.shape === 'circle' ? '50%' : 14;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      opacity: ready ? 1 : 0,
      transition: 'opacity 0.4s ease',
      pointerEvents: 'none',
    }}>
      {headTableRect ? (
        <div style={{
          position: 'fixed',
          top: headTableRect.y - pad, left: headTableRect.x - pad,
          width: headTableRect.w + pad * 2, height: headTableRect.h + pad * 2,
          borderRadius: br,
          animation: 'fpt-pulse 2.4s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 801,
          transition: 'top 0.12s, left 0.12s, width 0.12s, height 0.12s',
        }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.62)' }} />
      )}

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        transform: ready ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        zIndex: 802, pointerEvents: 'none',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(17,17,17,0.88)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '0 0 18px 18px',
          padding: '10px 20px 10px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          pointerEvents: 'auto',
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>👑</span>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap' }}>
            Drag the glowing table into position
          </span>
          <button
            onClick={onSkip}
            style={{
              marginLeft: 6, padding: '5px 12px',
              background: 'none', border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 8, fontFamily: 'Raleway, sans-serif', fontSize: 12,
              color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c9873a'; (e.currentTarget as HTMLButtonElement).style.color = '#c9873a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'; }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VenuePlacementBanner ──────────────────────────────────────────────────────
// Steps 2–5: pulsing spotlight on the spawned venue element + slim top banner
// with the seating hint. User drags the element to their desired position;
// dropping it (mouseup after drag) advances to the next step.

export function VenuePlacementBanner({
  stepConfig,
  stepIndex,
  venueElScreenRect,
  onSkip,
}: {
  stepConfig: VenueStepConfig;
  stepIndex: number;
  venueElScreenRect: { x: number; y: number; w: number; h: number } | null;
  onSkip: () => void;
}) {
  ensureStyles();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [stepConfig.type]);

  const pad = 14;
  const totalSteps = 6;
  const currentStep = stepIndex + 2;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      opacity: ready ? 1 : 0,
      transition: 'opacity 0.35s ease',
      pointerEvents: 'none',
    }}>
      {/* Veil + pulsing cutout on the venue element */}
      {venueElScreenRect ? (
        <div style={{
          position: 'fixed',
          top:  venueElScreenRect.y - pad,
          left: venueElScreenRect.x - pad,
          width:  venueElScreenRect.w + pad * 2,
          height: venueElScreenRect.h + pad * 2,
          borderRadius: 14,
          animation: 'fpt-pulse 2.4s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 801,
          transition: 'top 0.12s, left 0.12s, width 0.12s, height 0.12s',
        }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.62)' }} />
      )}

      {/* Floating centered pill — instruction + hint */}
      <div style={{
        position: 'fixed', top: 80, left: '50%',
        transform: ready
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-28px)',
        opacity: ready ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
        zIndex: 802, pointerEvents: 'none',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'inline-flex', flexDirection: 'column',
          alignItems: 'flex-start',
          background: 'rgba(17,17,17,0.92)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 20,
          padding: '12px 22px 16px 18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          pointerEvents: 'auto',
          maxWidth: 540,
          minWidth: 320,
        }}>
          {/* Main instruction row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{stepConfig.icon}</span>
            <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)', flex: 1 }}>
              Drag the {stepConfig.label} into position
            </span>
            <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 8, whiteSpace: 'nowrap' }}>
              Step {currentStep} of {totalSteps}
            </span>
            <button
              onClick={onSkip}
              style={{
                marginLeft: 10, padding: '4px 11px',
                background: 'none', border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 7, fontFamily: 'Raleway, sans-serif', fontSize: 11,
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c9873a'; (e.currentTarget as HTMLButtonElement).style.color = '#c9873a'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
            >
              Skip
            </button>
          </div>
          {/* Hint row */}
          <p style={{
            fontFamily: 'Raleway, sans-serif', fontSize: 11.5,
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.55,
            fontStyle: 'italic', marginTop: 6,
            borderLeft: '2px solid rgba(201,135,58,0.6)',
            paddingLeft: 9,
          }}>
            {stepConfig.hint}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── GuestTablesStep ───────────────────────────────────────────────────────────
// Final setup step: configure + auto-place guest tables.

const stepperStyle: React.CSSProperties = {
  width: 34, height: 34,
  border: '1.5px solid #e5e7eb', borderRadius: 9,
  background: 'white', cursor: 'pointer',
  fontFamily: 'Raleway, sans-serif', fontSize: 17, color: '#374151',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
};

export function GuestTablesStep({
  totalGuests,
  onConfirm,
  onSkip,
}: {
  totalGuests: number;
  onConfirm: (shape: 'circle' | 'rectangle' | 'square', capacity: number, count: number) => void;
  onSkip: () => void;
}) {
  ensureStyles();
  type Shape = 'circle' | 'rectangle' | 'square';
  const [shape, setShape] = useState<Shape>('circle');
  const [capacity, setCapacity] = useState(8);
  const [count, setCount] = useState(Math.max(1, Math.ceil(totalGuests / 8)));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Keep count in sync when capacity changes
  useEffect(() => {
    if (totalGuests > 0) setCount(Math.max(1, Math.ceil(totalGuests / capacity)));
  }, [capacity, totalGuests]);

  const shapes: Array<{ s: Shape; label: string; path: React.ReactNode }> = [
    {
      s: 'circle', label: 'Round',
      path: <svg width={54} height={54} viewBox="0 0 54 54"><circle cx={27} cy={27} r={23} fill={shape === 'circle' ? '#fdf3e3' : 'white'} stroke={shape === 'circle' ? '#c9873a' : '#d1d5db'} strokeWidth={2} /></svg>,
    },
    {
      s: 'rectangle', label: 'Banquet',
      path: <svg width={72} height={44} viewBox="0 0 72 44"><rect x={2} y={6} width={68} height={32} rx={7} fill={shape === 'rectangle' ? '#fdf3e3' : 'white'} stroke={shape === 'rectangle' ? '#c9873a' : '#d1d5db'} strokeWidth={2} /></svg>,
    },
    {
      s: 'square', label: 'Square',
      path: <svg width={54} height={54} viewBox="0 0 54 54"><rect x={3} y={3} width={48} height={48} rx={8} fill={shape === 'square' ? '#fdf3e3' : 'white'} stroke={shape === 'square' ? '#c9873a' : '#d1d5db'} strokeWidth={2} /></svg>,
    },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      background: 'rgba(8,8,8,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: ready ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        background: 'white', borderRadius: 24,
        padding: '28px 30px 24px',
        width: 430, maxWidth: 'calc(100vw - 32px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        animation: 'fpt-tip-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>🪑</div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
          Last step — guest tables
        </h3>
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 22 }}>
          We'll automatically arrange them across the floor, avoiding everything you've already placed. You can drag any table to adjust it afterward.
        </p>

        {/* Shape */}
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Table shape</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {shapes.map(({ s, label, path }) => (
            <button
              key={s}
              onClick={() => setShape(s)}
              style={{
                flex: 1, padding: '10px 6px 8px',
                border: shape === s ? '2px solid #c9873a' : '1.5px solid #e5e7eb',
                borderRadius: 14, background: shape === s ? '#fdf8ee' : 'white',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                transition: 'all 0.14s',
              }}
            >
              {path}
              <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: shape === s ? '#c9873a' : '#6b7280', fontWeight: shape === s ? 700 : 400 }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Capacity */}
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Seats per table</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setCapacity(c => Math.max(2, c - 1))} style={stepperStyle}>−</button>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 700, color: '#111827', minWidth: 28, textAlign: 'center' }}>{capacity}</span>
          <button onClick={() => setCapacity(c => Math.min(20, c + 1))} style={stepperStyle}>+</button>
          {totalGuests > 0 && (
            <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>
              → {count} tables for {totalGuests} guests
            </span>
          )}
        </div>

        {/* Table count override */}
        <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Number of tables</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
          <button onClick={() => setCount(c => Math.max(1, c - 1))} style={stepperStyle}>−</button>
          <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: 20, fontWeight: 700, color: '#111827', minWidth: 28, textAlign: 'center' }}>{count}</span>
          <button onClick={() => setCount(c => Math.min(60, c + 1))} style={stepperStyle}>+</button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSkip}
            style={{
              padding: '10px 18px', border: '1.5px solid #f3f4f6', borderRadius: 10,
              background: 'white', fontFamily: 'Raleway, sans-serif', fontSize: 12,
              color: '#9ca3af', cursor: 'pointer',
            }}
          >
            Skip
          </button>
          <button
            onClick={() => onConfirm(shape, capacity, count)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              background: 'linear-gradient(135deg, #d8983f 0%, #c9873a 100%)',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 700,
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            Auto-place tables 🎉
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TourOverlay ───────────────────────────────────────────────────────────────

export function TourOverlay({ onDone }: { onDone: () => void }) {
  ensureStyles();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const doMeasure = () => {
      const el = document.querySelector(`[data-tutorial="${STEPS[step].target}"]`);
      if (!el || cancelled) return;
      setRect(el.getBoundingClientRect());
    };
    const el = document.querySelector(`[data-tutorial="${STEPS[step].target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      const t = setTimeout(doMeasure, 360);
      doMeasure();
      const onResize = () => doMeasure();
      window.addEventListener('resize', onResize);
      return () => { cancelled = true; clearTimeout(t); window.removeEventListener('resize', onResize); };
    } else {
      doMeasure();
    }
  }, [step]);

  const goNext = () => step < STEPS.length - 1 ? setStep(s => s + 1) : finish();
  const finish = () => { setReady(false); setTimeout(onDone, 320); };

  if (!rect) return null;

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const PAD = 12;
  const sx = rect.left - PAD, sy = rect.top - PAD;
  const sw = rect.width + PAD * 2, sh = rect.height + PAD * 2;
  const TIP_W = 308;
  const TIP_H = 270;

  const tipTopRaw = sy + sh / 2 - TIP_H / 2;
  const tipTop = Math.max(20, Math.min(tipTopRaw, window.innerHeight - TIP_H - 20));

  const tipStyle: React.CSSProperties =
    cur.side === 'left'
      ? { top: tipTop, right: Math.max(20, window.innerWidth - sx + 16) }
      : cur.side === 'right'
      ? { top: tipTop, left: Math.min(sx + sw + 16, window.innerWidth - TIP_W - 20) }
      : { top: Math.min(sy + sh + 16, window.innerHeight - TIP_H - 20), left: Math.max(20, Math.min(sx + sw / 2 - TIP_W / 2, window.innerWidth - TIP_W - 20)) };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, opacity: ready ? 1 : 0, transition: 'opacity 0.32s ease' }}>
      <div style={{
        position: 'fixed', top: sy, left: sx, width: sw, height: sh,
        borderRadius: 14, boxShadow: '0 0 0 9999px rgba(8,8,8,0.74)',
        border: '2px solid rgba(201,135,58,0.7)', pointerEvents: 'none',
        transition: 'top 0.42s cubic-bezier(0.4,0,0.2,1), left 0.42s cubic-bezier(0.4,0,0.2,1), width 0.42s cubic-bezier(0.4,0,0.2,1), height 0.42s cubic-bezier(0.4,0,0.2,1)',
      }} />
      <div key={step} style={{ position: 'fixed', ...tipStyle, width: TIP_W, zIndex: 901, animation: 'fpt-tip-in 0.38s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '24px 26px', boxShadow: '0 28px 72px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 10 }}>{cur.icon}</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{cur.title}</h3>
          <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 18 }}>{cur.body}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ height: 4, borderRadius: 2, width: i === step ? 26 : 8, background: i <= step ? '#c9873a' : '#e5e7eb', opacity: i < step ? 0.4 : 1, transition: 'all 0.32s ease' }} />
            ))}
            <span style={{ marginLeft: 'auto', fontFamily: 'Raleway, sans-serif', fontSize: 11, color: '#9ca3af' }}>{step + 1}/{STEPS.length}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={finish} style={{ padding: '9px 16px', border: '1.5px solid #f3f4f6', borderRadius: 10, background: 'white', fontFamily: 'Raleway, sans-serif', fontSize: 12, color: '#9ca3af', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Skip tour
            </button>
            <button onClick={goNext} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #d8983f 0%, #c9873a 100%)', fontFamily: 'Raleway, sans-serif', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              {isLast ? <span>Let's go 🎉</span> : <><span>Next</span><ChevronRight size={13} /></>}
            </button>
          </div>
        </div>
      </div>
      <button onClick={finish} style={{ position: 'fixed', top: 18, right: 18, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 902, transition: 'background 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'}
      >
        <X size={15} />
      </button>
    </div>
  );
}
