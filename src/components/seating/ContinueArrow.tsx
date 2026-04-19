// A bouncing tutorial-style hint that points at the current "continue" button.
// Place it inside a `relative` wrapper that hosts the button — it absolute-
// positions itself above or below with a speech-bubble + triangle arrow.

interface Props {
  label?: string;
  placement?: 'above' | 'below';
}

export default function ContinueArrow({ label = 'Next!', placement = 'above' }: Props) {
  if (placement === 'below') {
    return (
      <div
        aria-hidden
        className="absolute left-1/2 top-full mt-3 flex flex-col items-center pointer-events-none z-10 animate-hint-bounce-down"
      >
        {/* triangle pointing up (to the button above) */}
        <svg width="22" height="12" viewBox="0 0 22 12" className="text-gold-500 mb-0.5">
          <polygon points="0,12 22,12 11,0" fill="currentColor" />
        </svg>
        <div className="px-3 py-1.5 bg-gold-500 text-white rounded-full font-raleway text-xs font-semibold shadow-lg whitespace-nowrap">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="absolute left-1/2 bottom-full mb-3 flex flex-col items-center pointer-events-none z-10 animate-hint-bounce-up"
    >
      <div className="px-3 py-1.5 bg-gold-500 text-white rounded-full font-raleway text-xs font-semibold shadow-lg whitespace-nowrap">
        {label}
      </div>
      {/* triangle pointing down (to the button below) */}
      <svg width="22" height="12" viewBox="0 0 22 12" className="text-gold-500 -mt-0.5">
        <polygon points="0,0 22,0 11,12" fill="currentColor" />
      </svg>
    </div>
  );
}
