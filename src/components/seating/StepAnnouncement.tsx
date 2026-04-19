import { useEffect } from 'react';

interface Props {
  text: string;
  subtext?: string;
  icon?: React.ReactNode;
  onDone: () => void;
  durationMs?: number;
}

// Briefly shows a large centered headline over the current step so the user
// knows what's expected of them next. Auto-dismisses; click to skip early.
export default function StepAnnouncement({
  text,
  subtext,
  icon,
  onDone,
  durationMs = 2200,
}: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [onDone, durationMs, text]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      onClick={onDone}
    >
      <div
        className="absolute inset-0 bg-white/55 backdrop-blur-[2px] animate-announce-backdrop"
        style={{ animationDuration: `${durationMs}ms` }}
      />
      <div
        className="relative px-10 py-8 text-center pointer-events-auto cursor-pointer animate-announce select-none"
        style={{ animationDuration: `${durationMs}ms` }}
      >
        {icon && <div className="text-6xl mb-3">{icon}</div>}
        <h2 className="font-playfair text-5xl sm:text-6xl text-gray-800 leading-tight drop-shadow-sm">
          {text}
        </h2>
        {subtext && (
          <p className="font-raleway text-base sm:text-lg text-gray-500 mt-3">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
