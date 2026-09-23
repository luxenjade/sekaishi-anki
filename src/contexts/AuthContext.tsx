import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  mapProfileFromDb,
  isPersistableQuestionId,
  type DbProfile,
} from "../lib/database";
import { mapSubmitField, mapSubmitRegions } from "../lib/submit-mappers";
import type { Profile } from "../types/quiz";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ error: AuthError | Error | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string,
  ) => Promise<{ error: AuthError | Error | null }>;
  deleteAccount: () => Promise<{ error: AuthError | Error | null }>;
  updateProfile: (
    username: string,
  ) => Promise<{ error: AuthError | Error | null }>;
  updateTheme: (theme: Profile["theme"]) => Promise<void>;
  syncReviewItem: (
    item: { id: string },
    action: "add" | "remove",
  ) => Promise<void>;
  submitEvent: (eventData: {
    event: string;
    year: number | null;
    yearEnd?: number | null;
    description?: string;
    field?: string;
    regions?: string[];
  }) => Promise<{ error: AuthError | Error | null }>;
  refreshProfile: () => Promise<void>;
  saveQuizResults: (
    score: number,
    total: number,
    mistakes: { item: { id: string } }[],
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const notConfiguredError = () =>
  new Error(
    "Supabase が設定されていません。VITE_SUPABASE_URL と VITE_SUPABASE_PB_KEY を設定してください。",
  );

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const configured = isSupabaseConfigured();

  const fetchProfile = useCallback(
    async (userId: string, emailHint?: string) => {
      if (!configured) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setProfile(mapProfileFromDb(data as DbProfile));
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username: emailHint?.split("@")[0] ?? "ユーザー",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError.message);
      } else if (created) {
        setProfile(mapProfileFromDb(created as DbProfile));
      }
    },
    [configured],
  );

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id, user.email ?? undefined);
  }, [user, fetchProfile]);

  useEffect(() => {
    // 旧デモモードの残骸を掃除
    localStorage.removeItem("sekaishi-mock-user");
    localStorage.removeItem("sekaishi-profile");
    localStorage.removeItem("sekaishi-custom-pool");

    if (!configured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id, s.user.email ?? undefined);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id, s.user.email ?? undefined);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured, fetchProfile]);

  const signUp = async (email: string, password: string, username: string) => {
    if (!configured) return { error: notConfiguredError() };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!configured) return { error: notConfiguredError() };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (configured) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!configured) return { error: notConfiguredError() };

    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error };
  };

  const deleteAccount = async () => {
    if (!configured || !user) {
      return { error: new Error("認証されていません") };
    }

    await supabase.from("review_items").delete().eq("user_id", user.id);
    await supabase.from("field_stats").delete().eq("user_id", user.id);
    await supabase.from("wh_submissions").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);

    const { error } = await supabase.rpc("delete_user");
    if (error) {
      console.warn("delete_user RPC unavailable:", error.message);
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  const updateProfile = async (username: string) => {
    if (!configured) return { error: notConfiguredError() };
    if (!user) return { error: new Error("認証されていません") };

    const { error } = await supabase
      .from("profiles")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (!error) await refreshProfile();
    return { error };
  };

  const updateTheme = async (theme: Profile["theme"]) => {
    setProfile((prev) => (prev ? { ...prev, theme } : prev));
    if (!configured || !user) return;

    await supabase
      .from("profiles")
      .update({ theme, updated_at: new Date().toISOString() })
      .eq("id", user.id);
  };

  const syncReviewItem = async (
    item: { id: string },
    action: "add" | "remove",
  ) => {
    if (!configured || !user) return;
    if (!isPersistableQuestionId(item.id)) return;

    if (action === "add") {
      await supabase.from("review_items").upsert(
        {
          user_id: user.id,
          question_id: Number(item.id),
          last_reviewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,question_id" },
      );
    } else {
      await supabase
        .from("review_items")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", Number(item.id));
    }
  };

  const submitEvent = async (eventData: {
    event: string;
    year: number | null;
    yearEnd?: number | null;
    description?: string;
    field?: string;
    regions?: string[];
  }) => {
    const trimmedEvent = eventData.event.trim();
    if (!trimmedEvent) {
      return { error: new Error("出来事名を入力してください。") };
    }
    if (eventData.year === null || Number.isNaN(eventData.year)) {
      return { error: new Error("年代を入力してください。") };
    }

    if (!configured) return { error: notConfiguredError() };
    if (!user) return { error: new Error("認証されていません") };

    const { error } = await supabase.from("wh_submissions").insert({
      user_id: user.id,
      year: eventData.year,
      year_end: eventData.yearEnd ?? null,
      event: trimmedEvent,
      description: eventData.description ?? null,
      region: mapSubmitRegions(eventData.regions ?? []),
      field: eventData.field ? mapSubmitField(eventData.field) : null,
      status: "pending",
    });
    return { error };
  };

  const saveQuizResults = async (
    score: number,
    total: number,
    mistakes: { item: { id: string } }[],
  ) => {
    if (!configured || !user) return;

    const today = new Date().toLocaleDateString("en-CA");

    const { data: profileData, error: profileErr } = await supabase
      .from("profiles")
      .select(
        "streak_current, streak_best, last_played_at, total_answered, total_correct, rank_points",
      )
      .eq("id", user.id)
      .single();

    if (!profileErr && profileData) {
      let streakCurrent = profileData.streak_current as number;
      const lastPlay = profileData.last_played_at as string | null;
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(
        "en-CA",
      );

      if (lastPlay !== today) {
        streakCurrent = lastPlay === yesterday ? streakCurrent + 1 : 1;
      }

      const streakBest = Math.max(
        profileData.streak_best as number,
        streakCurrent,
      );
      const rankPoints = (profileData.rank_points as number) + score * 10;

      await supabase
        .from("profiles")
        .update({
          total_answered: (profileData.total_answered as number) + total,
          total_correct: (profileData.total_correct as number) + score,
          streak_current: streakCurrent,
          streak_best: streakBest,
          last_played_at: today,
          rank_points: rankPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const persistable = mistakes.filter((m) =>
      isPersistableQuestionId(m.item.id),
    );
    if (persistable.length > 0) {
      await supabase.from("review_items").upsert(
        persistable.map((m) => ({
          user_id: user.id,
          question_id: Number(m.item.id),
          added_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,question_id" },
      );
    }

    await refreshProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: configured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        deleteAccount,
        updateProfile,
        updateTheme,
        syncReviewItem,
        submitEvent,
        refreshProfile,
        saveQuizResults,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
