// ── Auth Context ──────────────────────────────────────────────────────────────
// Provides auth state (user, session, loading) and actions (login, signup, logout)
// to the entire app via React Context.

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { track, identify } from "./analytics";
import { supabase } from "../data/supabaseClient";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import type { User, Session } from "@supabase/supabase-js";
import { clearGameLocalStorage, stopSync } from "../data/syncService";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  nick: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, nick: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Safe no-op fallback returned during brief HMR transition gaps so consumers
// never throw — they just see loading=true and render nothing.
const HMR_FALLBACK: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  nick: null,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  // During HMR, the provider may briefly unmount before remounting.
  // Return a safe loading fallback instead of crashing the whole tree.
  if (!ctx) return HMR_FALLBACK;
  return ctx;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8f0246f6`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    nick: null,
  });

  // Load nick from profile
  const loadNick = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("nick")
        .eq("id", userId)
        .single();
      if (data?.nick) {
        setState(s => ({ ...s, nick: data.nick }));
      }
    } catch (e) {
      console.log("Error loading nick:", e);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({
        ...s,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
      if (session?.user) {
        loadNick(session.user.id);
        identify(session.user.id, session.user.email ?? undefined);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(s => ({
          ...s,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
        if (session?.user) {
          loadNick(session.user.id);
        } else {
          setState(s => ({ ...s, nick: null }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadNick]);

  // Sign up via Edge Function (uses service role to auto-confirm email)
  const signUp = useCallback(async (email: string, password: string, nick: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(`${SERVER_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, nick }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.log("Signup error from server:", result);
        return { error: result.error || "Erro ao criar conta" };
      }

      // Auto-login after signup
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        console.log("Auto-login after signup error:", loginError);
        return { error: loginError.message };
      }

      track("sign_up", { method: "email" });
      return { error: null };
    } catch (e: any) {
      console.log("Signup network error:", e);
      return { error: "Erro de conexao. Tente novamente." };
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log("SignIn error:", error);
      return { error: error.message };
    }
    track("sign_in", { method: "email" });
    return { error: null };
  }, []);

  // Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.log("Google OAuth error:", error);
      return { error: error.message };
    }
    track("sign_in", { method: "google" });
    return { error: null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    console.log("[Auth] signOut called");

    // 1. Stop ALL sync timers, listeners, realtime — prevents any more pushes
    //    Pass isLogout=true so the cached access token is also cleared.
    stopSync(true);

    // 2. Clear ALL game data from localStorage (9 keys) + reload empty in-memory stores
    clearGameLocalStorage();

    // 3. Sign out of Supabase Auth (clears session from localStorage)
    await supabase.auth.signOut();

    // 4. Clear React auth state → triggers RootLayout to show AuthScreen
    setState(s => ({ ...s, user: null, session: null, nick: null }));

    console.log("[Auth] Signed out — sync stopped, localStorage wiped, session cleared");
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      await loadNick(state.user.id);
    }
  }, [state.user, loadNick]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}