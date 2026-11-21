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
import type { Profile } from "../types/quiz";

type AuthResult = { error: AuthError | Error | null };

/** 1問ぶんの解答結果（id は HistoryQuizItem.id） */
export interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

/** 問題の提出内容。分類（章・タグ・テーマ）は admin が承認時に付ける */
export interface SubmitEventInput {
  event: string;
  year: number;
  description?: string;
  wikiUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isOfflineMode: boolean;
  /** admin_users に登録されているか（画面表示用。実際の権限は DB 側の RLS / RPC が守る） */
  isAdmin: boolean;
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  updateProfile: (username: string) => Promise<AuthResult>;
  updateTheme: (theme: Profile["theme"]) => Promise<void>;
  /** 復習キューから手動で外す（= 正解扱いにする） */
  dismissReviewItem: (questionId: string) => Promise<void>;
  submitEvent: (input: SubmitEventInput) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  /** クイズ結果を記録（スコア・連続日数・ランクはサーバー側 RPC が計算） */
  saveQuizResults: (answers: QuizAnswer[]) => Promise<AuthResult>;
  /** 学習データ（成績・集計）のリセット */
  resetStats: () => Promise<AuthResult>;
  bypassAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const OFFLINE_USER_KEY = "sekaishi-mock-user";
const OFFLINE_PROFILE_KEY = "sekaishi-profile";

function defaultOfflineProfile(userId: string, username: string): Profile {
  return {
    id: userId,
    username,
    avatarUrl: null,
    theme: "light",
    totalAnswered: 0,
    totalCorrect: 0,
    streakCurrent: 0,
    streakBest: 0,
    lastPlayedAt: null,
    rankPoints: 0,
  };
}

/** オフライン（デモ）モード用: サーバー RPC と同じ規則でプロフィール集計を更新 */
function applyResultsToProfile(p: Profile, score: number, total: number): Profile {
  const today = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");

  let streak = p.streakCurrent;
  if (p.lastPlayedAt !== today) {
    streak = p.lastPlayedAt === yesterday ? streak + 1 : 1;
  }

  return {
    ...p,
    totalAnswered: p.totalAnswered + total,
    totalCorrect: p.totalCorrect + score,
    streakCurrent: streak,
    streakBest: Math.max(p.streakBest, streak),
    lastPlayedAt: today,
    rankPoints: p.rankPoints + score * 10,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(!isSupabaseConfigured());
  const [isAdmin, setIsAdmin] = useState(false);

  const configured = isSupabaseConfigured();
  const userId = user?.id ?? null;

  const fetchProfile = useCallback(
    async (id: string, email?: string | null) => {
      if (!configured || isOfflineMode) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setProfile(mapProfileFromDb(data as DbProfile));
        return;
      }

      // トリガーがまだ走っていない場合のフォールバック（id と username のみ挿入可能）
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ id, username: email?.split("@")[0] ?? "User" })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError.message);
      } else if (created) {
        setProfile(mapProfileFromDb(created as DbProfile));
      }
    },
    [configured, isOfflineMode],
  );

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id, user.email);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!configured) {
      const mockUser = localStorage.getItem(OFFLINE_USER_KEY);
      if (mockUser) {
        const u = JSON.parse(mockUser) as { id: string; email: string };
        setUser({ id: u.id, email: u.email } as User);
        const savedProfile = localStorage.getItem(OFFLINE_PROFILE_KEY);
        setProfile(
          savedProfile
            ? (JSON.parse(savedProfile) as Profile)
            : defaultOfflineProfile(u.id, u.email.split("@")[0]),
        );
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id, s.user.email);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id, s.user.email);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured, fetchProfile]);

  // admin 判定（画面の出し分け用）。権限そのものは RLS / RPC が守る
  useEffect(() => {
    if (!userId || !configured || isOfflineMode) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    supabase.rpc("is_admin").then(({ data, error }) => {
      if (!cancelled) setIsAdmin(!error && data === true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, configured, isOfflineMode]);

  const bypassAuth = useCallback(() => {
    setIsOfflineMode(true);
    const mockU = { id: "offline-user", email: "student@example.com" };
    setUser({ id: mockU.id, email: mockU.email } as User);
    localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(mockU));

    const savedProfile = localStorage.getItem(OFFLINE_PROFILE_KEY);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile) as Profile);
    } else {
      const p = defaultOfflineProfile(mockU.id, "J. Student");
      setProfile(p);
      localStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(p));
    }
  }, []);

  const signUp = async (
    email: string,
    password: string,
    username: string,
  ): Promise<AuthResult> => {
    if (!configured || isOfflineMode) {
      const mockU = { id: `user-${Date.now()}`, email };
      setUser({ id: mockU.id, email } as User);
      localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(mockU));
      const p = defaultOfflineProfile(mockU.id, username);
      setProfile(p);
      localStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(p));
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { error };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!configured || isOfflineMode) {
      const mockUserStr = localStorage.getItem(OFFLINE_USER_KEY);
      let u = mockUserStr
        ? (JSON.parse(mockUserStr) as { id: string; email: string })
        : null;
      if (!u || u.email !== email) {
        u = { id: "offline-user", email };
        localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(u));
      }
      setUser({ id: u.id, email: u.email } as User);
      const savedProfile = localStorage.getItem(OFFLINE_PROFILE_KEY);
      setProfile(
        savedProfile
          ? (JSON.parse(savedProfile) as Profile)
          : defaultOfflineProfile(u.id, email.split("@")[0]),
      );
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (!configured || isOfflineMode) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem(OFFLINE_USER_KEY);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!configured || isOfflineMode) {
      return { error: new Error("パスワードリセットはオンライン認証が必要です。") };
    }
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error };
  };

  /** アカウント削除（DB 側 RPC が原子的に処理。失敗時はサインアウトしない） */
  const deleteAccount = async (): Promise<AuthResult> => {
    if (!configured || isOfflineMode || !user) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem(OFFLINE_USER_KEY);
      localStorage.removeItem(OFFLINE_PROFILE_KEY);
      return { error: null };
    }

    const { error } = await supabase.rpc("delete_own_account");
    if (error) return { error };

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  const updateProfile = async (username: string): Promise<AuthResult> => {
    if (!configured || isOfflineMode) {
      setProfile((prev) => {
        if (!prev) return null;
        const updated = { ...prev, username };
        localStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(updated));
        return updated;
      });
      return { error: null };
    }
    if (!user) return { error: new Error("Not authenticated") };

    // updated_at は DB のトリガーが更新する
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (!error) await refreshProfile();
    return { error };
  };

  const updateTheme = async (theme: Profile["theme"]) => {
    setProfile((prev) => (prev ? { ...prev, theme } : prev));

    if (!configured || isOfflineMode || !user) {
      if (profile) {
        localStorage.setItem(
          OFFLINE_PROFILE_KEY,
          JSON.stringify({ ...profile, theme }),
        );
      }
      return;
    }

    await supabase.from("profiles").update({ theme }).eq("id", user.id);
  };

  const dismissReviewItem = async (questionId: string) => {
    if (!configured || isOfflineMode || !user) return;
    if (!isPersistableQuestionId(questionId)) return;

    const { error } = await supabase.rpc("dismiss_review_item", {
      p_question_id: Number(questionId),
    });
    if (error) console.error("dismiss_review_item failed:", error.message);
  };

  const submitEvent = async (input: SubmitEventInput): Promise<AuthResult> => {
    if (!configured || isOfflineMode || !user) {
      return { error: null };
    }

    const { error } = await supabase.from("wh_submissions").insert({
      user_id: user.id,
      year: input.year,
      event: input.event,
      description: input.description?.trim() || null,
      wiki_url: input.wikiUrl?.trim() || null,
    });
    return { error };
  };

  const saveQuizResults = async (answers: QuizAnswer[]): Promise<AuthResult> => {
    if (!user || answers.length === 0) return { error: null };

    // オフライン: サーバー RPC と同じ規則でローカルのプロフィールを更新
    if (!configured || isOfflineMode) {
      if (profile) {
        const score = answers.filter((a) => a.isCorrect).length;
        const updated = applyResultsToProfile(profile, score, answers.length);
        setProfile(updated);
        localStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(updated));
      }
      return { error: null };
    }

    // モックの "wh-1" のような非数値IDは保存できないので除外
    const persistable = answers
      .filter((a) => isPersistableQuestionId(a.questionId))
      .map((a) => ({ question_id: Number(a.questionId), is_correct: a.isCorrect }));
    if (persistable.length === 0) return { error: null };

    const { error } = await supabase.rpc("record_quiz_result", {
      p_answers: persistable,
    });
    if (error) return { error };

    await refreshProfile();
    return { error: null };
  };

  const resetStats = async (): Promise<AuthResult> => {
    if (!configured || isOfflineMode || !user) {
      if (profile) {
        const reset: Profile = {
          ...profile,
          totalAnswered: 0,
          totalCorrect: 0,
          streakCurrent: 0,
          streakBest: 0,
          lastPlayedAt: null,
          rankPoints: 0,
        };
        setProfile(reset);
        localStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(reset));
      }
      return { error: null };
    }

    const { error } = await supabase.rpc("reset_own_stats");
    if (error) return { error };
    await refreshProfile();
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isOfflineMode,
        isAdmin,
        signUp,
        signIn,
        signOut,
        resetPassword,
        deleteAccount,
        updateProfile,
        updateTheme,
        dismissReviewItem,
        submitEvent,
        refreshProfile,
        saveQuizResults,
        resetStats,
        bypassAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
