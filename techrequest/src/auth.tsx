import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Profile } from './types';
const Ctx = createContext<{ profile: Profile | null; loading: boolean; signOut: () => void }>({ profile: null, loading: true, signOut: () => {} });
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null); const [loading, setLoading] = useState(true);
  const load = async (uid?: string) => {
    if (!uid) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data as Profile); setLoading(false);
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => { load(sess?.user.id); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ profile, loading, signOut: () => supabase.auth.signOut() }}>{children}</Ctx.Provider>;
}
