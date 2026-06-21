import type { Session } from '@supabase/supabase-js';
import { createContext, type PropsWithChildren, useContext } from 'react';

import { useAuthSession } from './useAuthSession';

type AuthContextValue = {
  session: Session | null;
  booting: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const auth = useAuthSession();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
