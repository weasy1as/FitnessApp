import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setBooting(false);
      return;
    }

    let active = true;

    async function restore() {
      try {
        const { data, error: sessionError } = await supabase!.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!data.session) {
          setSession(null);
          return;
        }

        const { error: claimsError } = await supabase!.auth.getClaims();

        if (claimsError) {
          await supabase!.auth.signOut();
          setSession(null);
          return;
        }

        setSession(data.session);
      } catch (error) {
        console.warn('Unable to restore the Supabase session.', error);
        setSession(null);
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    void restore();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setBooting(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, booting };
}
