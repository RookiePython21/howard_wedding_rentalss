import { useState, useEffect } from 'react';
import { CloudUpload, Check, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useSeatingStore } from '../../store/seatingStore';
import AuthModal from './AuthModal';

interface SaveProgressButtonProps {
  // Compact shows just the icon + short label; useful inside busy toolbars.
  compact?: boolean;
}

export default function SaveProgressButton({ compact = false }: SaveProgressButtonProps) {
  const { user, initializing } = useAuth();
  const { saveToCloud, cloudSaving, cloudError, cloudLastSavedAt } = useSeatingStore();

  const [showAuth, setShowAuth] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 2000);
    return () => clearTimeout(t);
  }, [justSaved]);

  const doSave = async () => {
    if (!user) return;
    try {
      await saveToCloud(user.uid, user.email);
      setJustSaved(true);
    } catch {
      // error surfaced via cloudError
    }
  };

  const handleClick = async () => {
    if (initializing) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    await doSave();
  };

  const handleAuthed = async () => {
    setShowAuth(false);
    // Save immediately after a fresh sign-in. User.uid is on auth.currentUser by now.
    const u = auth.currentUser;
    if (u) {
      try {
        await saveToCloud(u.uid, u.email);
        setJustSaved(true);
      } catch {
        // error surfaced via cloudError
      }
    }
  };

  const baseBtn = `flex items-center gap-1.5 font-raleway transition-colors rounded-xl ${
    compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm'
  }`;

  // Resolve icon/text/colors based on state.
  let icon = <CloudUpload size={compact ? 14 : 15} />;
  let label = 'Save Progress';
  let cls = 'border border-gold-400 text-gold-700 hover:bg-gold-50';

  if (cloudSaving) {
    icon = <Loader2 size={compact ? 14 : 15} className="animate-spin" />;
    label = 'Saving…';
    cls = 'border border-gold-300 text-gold-600 bg-gold-50 cursor-wait';
  } else if (justSaved) {
    icon = <Check size={compact ? 14 : 15} />;
    label = 'Saved';
    cls = 'border border-green-400 text-green-700 bg-green-50';
  } else if (cloudError) {
    icon = <AlertCircle size={compact ? 14 : 15} />;
    label = 'Retry Save';
    cls = 'border border-red-300 text-red-600 hover:bg-red-50';
  }

  return (
    <>
      <div className="relative inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleClick}
          disabled={cloudSaving || initializing}
          className={`${baseBtn} ${cls} disabled:opacity-60`}
          title={
            cloudError
              ? `Save failed: ${cloudError}`
              : cloudLastSavedAt
                ? `Last saved ${new Date(cloudLastSavedAt).toLocaleTimeString()}`
                : user
                  ? `Save to ${user.email ?? 'your account'}`
                  : 'Sign in to save your chart'
          }
        >
          {icon}
          <span>{label}</span>
        </button>

        {user && !compact && (
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            title={user.email ?? 'Account'}
            className="w-8 h-8 rounded-full bg-gold-500 text-white font-raleway text-xs font-semibold flex items-center justify-center hover:bg-gold-600 transition-colors"
          >
            {(user.email?.[0] ?? 'U').toUpperCase()}
          </button>
        )}

        {menuOpen && user && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-raleway text-xs text-gray-400">Signed in as</p>
                <p className="font-raleway text-sm text-gray-700 truncate">{user.email ?? user.uid}</p>
              </div>
              <button
                onClick={async () => { setMenuOpen(false); await signOut(auth); }}
                className="w-full px-3 py-2 flex items-center gap-2 font-raleway text-sm text-gray-600 hover:bg-gray-50 text-left"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </>
        )}
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthed={handleAuthed}
        />
      )}
    </>
  );
}
