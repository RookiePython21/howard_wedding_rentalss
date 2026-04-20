import { useState } from 'react';
import { Mail, Lock, X, LogIn, UserPlus } from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';

interface AuthModalProps {
  onClose: () => void;
  onAuthed: () => void;
  // When true, shown as "Sign in to resume" instead of "Sign in to save"
  mode?: 'save' | 'resume';
}

type Panel = 'signin' | 'signup' | 'reset';

export default function AuthModal({ onClose, onAuthed, mode = 'save' }: AuthModalProps) {
  const [panel, setPanel] = useState<Panel>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const friendlyError = (code: string, msg: string) => {
    if (code.includes('user-not-found')) return 'No account found with that email.';
    if (code.includes('wrong-password') || code.includes('invalid-credential'))
      return 'Incorrect password. Try again or reset it.';
    if (code.includes('email-already-in-use')) return 'That email is already registered — try signing in.';
    if (code.includes('weak-password')) return 'Password must be at least 6 characters.';
    if (code.includes('invalid-email')) return 'That email address looks invalid.';
    if (code.includes('popup-closed-by-user')) return 'Sign-in window was closed.';
    return msg;
  };

  const withBusy = async (fn: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try { await fn(); }
    catch (e) {
      const err = e as { code?: string; message: string };
      setError(friendlyError(err.code ?? '', err.message));
    }
    finally { setBusy(false); }
  };

  const handleGoogle = () => withBusy(async () => {
    await signInWithPopup(auth, googleProvider);
    onAuthed();
  });

  const handleEmailSignIn = () => withBusy(async () => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    onAuthed();
  });

  const handleEmailSignUp = () => withBusy(async () => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
    onAuthed();
  });

  const handleReset = () => withBusy(async () => {
    await sendPasswordResetEmail(auth, email.trim());
    setResetSent(true);
  });

  const title = panel === 'signup'
    ? 'Create an account'
    : panel === 'reset'
      ? 'Reset your password'
      : mode === 'resume' ? 'Sign in to resume' : 'Save your progress';

  const subtitle = panel === 'signup'
    ? "We'll use your email so you can resume later and export your chart."
    : panel === 'reset'
      ? "Enter your email and we'll send you a reset link."
      : mode === 'resume'
        ? 'Sign in to load the chart you were working on.'
        : "Sign in so you can come back to this chart anytime.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-cream-200">
          <div>
            <h2 className="font-playfair text-xl text-gray-800">{title}</h2>
            <p className="font-raleway text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {panel !== 'reset' && (
            <>
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-xl font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="font-raleway text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          <div className="space-y-3">
            <label className="block">
              <span className="font-raleway text-xs text-gray-500 uppercase tracking-wider">Email</span>
              <div className="mt-1 relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm focus:outline-none focus:border-gold-400"
                />
              </div>
            </label>

            {panel !== 'reset' && (
              <label className="block">
                <span className="font-raleway text-xs text-gray-500 uppercase tracking-wider">Password</span>
                <div className="mt-1 relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    autoComplete={panel === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={panel === 'signup' ? 'At least 6 characters' : 'Your password'}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm focus:outline-none focus:border-gold-400"
                  />
                </div>
              </label>
            )}
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg font-raleway text-sm text-red-700">
              {error}
            </div>
          )}

          {resetSent && panel === 'reset' && (
            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg font-raleway text-sm text-green-700">
              Reset link sent — check your inbox.
            </div>
          )}

          {panel === 'signin' && (
            <button
              onClick={handleEmailSignIn}
              disabled={busy || !email || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50"
            >
              <LogIn size={15} /> Sign in
            </button>
          )}

          {panel === 'signup' && (
            <button
              onClick={handleEmailSignUp}
              disabled={busy || !email || password.length < 6}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50"
            >
              <UserPlus size={15} /> Create account
            </button>
          )}

          {panel === 'reset' && (
            <button
              onClick={handleReset}
              disabled={busy || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50"
            >
              Send reset link
            </button>
          )}

          <div className="flex items-center justify-between font-raleway text-xs text-gray-500">
            {panel === 'signin' && (
              <>
                <button onClick={() => { setPanel('reset'); setError(null); setResetSent(false); }} className="underline hover:text-gold-700">
                  Forgot password?
                </button>
                <button onClick={() => { setPanel('signup'); setError(null); }} className="hover:text-gold-700">
                  Need an account? <span className="underline">Sign up</span>
                </button>
              </>
            )}
            {panel === 'signup' && (
              <button onClick={() => { setPanel('signin'); setError(null); }} className="ml-auto hover:text-gold-700">
                Already have an account? <span className="underline">Sign in</span>
              </button>
            )}
            {panel === 'reset' && (
              <button onClick={() => { setPanel('signin'); setError(null); setResetSent(false); }} className="ml-auto hover:text-gold-700">
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
