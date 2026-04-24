import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    return { requiresEmailConfirmation: !data.session };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
