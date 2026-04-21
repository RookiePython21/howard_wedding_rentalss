import { LogIn, Sparkles } from 'lucide-react';

interface WelcomePromptProps {
  onSignIn: () => void;
  onStartFresh: () => void;
}

export default function WelcomePrompt({ onSignIn, onStartFresh }: WelcomePromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 pt-6 pb-2 text-center">
          <div className="text-4xl mb-3">💍</div>
          <h2 className="font-playfair text-2xl text-gray-800 mb-1.5">
            Welcome back
          </h2>
          <p className="font-raleway text-sm text-gray-500 leading-relaxed">
            Already started a chart? Sign in to pick up where you left off.
            Otherwise, start fresh with your guest list.
          </p>
        </div>

        <div className="px-6 py-5 space-y-2.5">
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors"
          >
            <LogIn size={15} />
            Sign in to resume
          </button>
          <button
            onClick={onStartFresh}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl font-raleway text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Sparkles size={15} />
            Start fresh
          </button>
        </div>

        <p className="px-6 pb-5 font-raleway text-xs text-gray-400 text-center">
          Don't have an account yet? You'll be able to create one on the next screen.
        </p>
      </div>
    </div>
  );
}
