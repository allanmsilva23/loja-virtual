import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextValue = {
  user: User | null;
  loadingAuth: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loadingAuth: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getUser().then(({ data }) => {
      if (ativo) {
        setUser(data.user);
        setLoadingAuth(false);
      }
    }).catch(() => {
      if (ativo) setLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (ativo) {
        setUser(sessao?.user || null);
        setLoadingAuth(false);
      }
    });

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
