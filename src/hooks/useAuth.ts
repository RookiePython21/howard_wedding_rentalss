import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthState {
  user: User | null;
  initializing: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, initializing: true });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setState({ user, initializing: false });
    });
    return unsub;
  }, []);

  return state;
}
