import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { StartScreen } from "./features/quiz/StartScreen";
import { QuizScreen } from "./features/quiz/QuizScreen";
import { ResultScreen } from "./features/quiz/ResultScreen";
import { StatsTab } from "./features/stats/StatsTab";
import { SubmitTab } from "./features/submit/SubmitTab";
import { SettingsTab } from "./features/settings/SettingsTab";
import { AuthScreen } from "./features/auth/AuthScreen";
import { mockHistoryData } from "./data/mockEvents";
import { useQuiz } from "./hooks/useQuiz";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./contexts/AuthContext";
import { supabase } from "./lib/supabase";
import { fetchQuestions, getRangeOptions } from "./lib/questions";
import { mapWhDateToQuizItem, quizModeToDb, type DbWhDate } from "./lib/database";
import { getPeriodFromYear } from "./lib/periods";
import type { AppTab, HistoryQuizItem, QuizScreen as QuizScreenType } from "./types/quiz";

// helper to get rank based on points
function getRank(points: number): string {
  if (points < 100) return "見習い史家 (Apprentice)";
  if (points < 300) return "初学者 (Novice)";
  if (points < 700) return "年代記者 (Chronicler)";
  if (points < 1500) return "歴史家 (Historian)";
  if (points < 3000) return "碩学 (Scholar)";
  return "歴史の証人 (Witness)";
}

// helper to map item to category
function getCategoryName(item: HistoryQuizItem): string {
  const ch = item.chapter || "";
  if (ch.includes("古代文明")) return "古代文明";
  if (ch.includes("中世ヨーロッパ")) return "中世ヨーロッパ";
  if (ch.includes("近現代ヨーロッパ") || ch.includes("市民革命") || ch.includes("大戦") || ch.includes("冷戦")) return "近現代ヨーロッパ";
  if (ch.includes("中国史")) return "中国史";
  if (ch.includes("日本の歴史")) return "日本の歴史";
  return "イスラーム・アジア・他";
}

// helper to map year to periods — see lib/periods.ts

// helper to calculate consecutive streak
function calculateStreak(historyRecords: { date: string }[]): number {
  if (historyRecords.length === 0) return 0;
  
  const dates = Array.from(new Set(historyRecords.map((r) => r.date)))
    .sort()
    .reverse();
  
  if (dates.length === 0) return 0;
  
  const todayStr = new Date().toLocaleDateString("en-CA");
  const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = new Date(dates[0]);
  
  for (let i = 1; i < dates.length; i++) {
    const prevDateStr = dates[i];
    const expectedPrevDateStr = new Date(currentDate.getTime() - 86400000).toLocaleDateString("en-CA");
    if (prevDateStr === expectedPrevDateStr) {
      streak++;
      currentDate = new Date(prevDateStr);
    } else {
      break;
    }
  }
  
  return streak;
}

const SAMPLE_REVIEWS: HistoryQuizItem[] = [];

export default function App() {
  const {
    user,
    profile,
    loading,
    isOfflineMode,
    updateProfile,
    updateTheme,
    syncReviewItem,
    submitEvent,
    saveQuizResults,
    signOut,
    resetPassword,
    deleteAccount,
  } = useAuth();

  const { theme, setTheme } = useTheme(profile?.theme);

  const [activeTab, setActiveTab] = useState<AppTab>("quiz");
  const [questionPool, setQuestionPool] = useState<HistoryQuizItem[]>(mockHistoryData);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionSource, setQuestionSource] = useState<"supabase" | "mock">("mock");
  
  // Local Review Items state
  const [reviewItems, setReviewItems] = useState<HistoryQuizItem[]>(SAMPLE_REVIEWS);

  // Custom Pool state (submissions that are approved/active)
  const [customPool, setCustomPool] = useState<HistoryQuizItem[]>(() => {
    const saved = localStorage.getItem("sekaishi-custom-pool");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // User Submissions History
  const [submissions, setSubmissions] = useState<any[]>(() => {
    const saved = localStorage.getItem("sekaishi-submissions");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Play history (mostly for offline mode, synced to localStorage)
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("sekaishi-history");
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Category stats (mostly for offline fallback, synced to localStorage)
  const [categoryStats, setCategoryStats] = useState<{ [cat: string]: { answered: number; correct: number } }>(() => {
    const saved = localStorage.getItem("sekaishi-category-stats");
    if (saved) return JSON.parse(saved);
    return {};
  });

  // Review session state
  const [isReviewSession, setIsReviewSession] = useState(false);

  // Load question master data from Supabase (fallback: mock)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setQuestionsLoading(true);
      const { items, source } = await fetchQuestions();
      if (!cancelled) {
        setQuestionPool(items);
        setQuestionSource(source);
        setQuestionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Combined pool
  const combinedPool = useMemo(() => {
    return [...questionPool, ...customPool];
  }, [questionPool, customPool]);

  // Quiz state hook
  const quiz = useQuiz({ pool: combinedPool });

  // Sync quiz mode with profile setting
  useEffect(() => {
    if (profile?.quizMode && quiz.mode !== profile.quizMode) {
      quiz.setMode(profile.quizMode);
    }
  }, [profile?.quizMode]);

  // Load review items from Supabase or LocalStorage on mount / auth change
  useEffect(() => {
    const loadReviews = async () => {
      if (!user) return;
      if (isOfflineMode) {
        const saved = localStorage.getItem("sekaishi-reviews");
        if (saved) setReviewItems(JSON.parse(saved));
        return;
      }
      try {
        const { data, error } = await supabase
          .from("review_items")
          .select("question_id, wh_dates(*)")
          .eq("user_id", user.id);
        
        if (!error && data) {
          type ReviewRow = { wh_dates: DbWhDate | null };
          const rows = Array.isArray(data)
            ? (data as unknown as ReviewRow[])
            : [];
          const items = rows
            .filter((d): d is { wh_dates: DbWhDate } => Boolean(d.wh_dates))
            .map((d) => mapWhDateToQuizItem(d.wh_dates))
            .filter((item): item is HistoryQuizItem => item !== null);
          setReviewItems(items);
          localStorage.setItem("sekaishi-reviews", JSON.stringify(items));
        }
      } catch (e) {
        console.error("Error loading reviews from Supabase:", e);
      }
    };
    
    if (user) {
      loadReviews();
    }
  }, [user, isOfflineMode]);

  // Load submissions from Supabase or LocalStorage
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user) return;
      if (isOfflineMode) {
        const saved = localStorage.getItem("sekaishi-submissions");
        if (saved) setSubmissions(JSON.parse(saved));
        return;
      }
      try {
        const { data, error } = await supabase
          .from("wh_submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (!error && data) {
          setSubmissions(data);
          localStorage.setItem("sekaishi-submissions", JSON.stringify(data));
        }
      } catch (e) {
        console.error("Error loading submissions from Supabase:", e);
      }
    };
    
    if (user) {
      loadSubmissions();
    }
  }, [user, isOfflineMode]);

  const [prevScreen, setPrevScreen] = useState<QuizScreenType>("start");

  // Track session ending and log progress
  useEffect(() => {
    if (prevScreen === "quiz" && quiz.screen === "result") {
      const total = quiz.items.length;
      const score = quiz.score;
      const today = new Date().toLocaleDateString("en-CA");
      
      // Update local history
      const newHistory = [...history, { date: today, score, total }];
      setHistory(newHistory);
      localStorage.setItem("sekaishi-history", JSON.stringify(newHistory));

      saveQuizResults(score, total, quiz.mistakes);

      // Local Stats Backup Update
      setCategoryStats((prev) => {
        const updated = { ...prev };
        quiz.items.forEach((item) => {
          const cat = getCategoryName(item);
          if (!updated[cat]) {
            updated[cat] = { answered: 0, correct: 0 };
          }
          updated[cat].answered += 1;
          const wasCorrect = !quiz.mistakes.some((m) => m.item.id === item.id);
          if (wasCorrect) {
            updated[cat].correct += 1;
          }
        });
        localStorage.setItem("sekaishi-category-stats", JSON.stringify(updated));
        return updated;
      });

      // Update local review queue backup (if it was NOT a review session)
      if (!isReviewSession) {
        setReviewItems((prev) => {
          const updated = [...prev];
          quiz.mistakes.forEach((m) => {
            if (!updated.some((item) => item.id === m.item.id)) {
              updated.push(m.item);
            }
          });
          localStorage.setItem("sekaishi-reviews", JSON.stringify(updated));
          return updated;
        });
      }
      
      if (isReviewSession) {
        setIsReviewSession(false);
      }
    }
    setPrevScreen(quiz.screen);
  }, [quiz.screen, quiz.score, quiz.items, quiz.mistakes, isReviewSession, history, prevScreen, saveQuizResults]);

  // Remove correctly answered questions from review queue in real-time
  useEffect(() => {
    if (isReviewSession && quiz.screen === "quiz" && quiz.hasAnswered && quiz.isCorrect) {
      const currentItem = quiz.items[quiz.currentIndex];
      if (currentItem) {
        // Sync to Supabase
        syncReviewItem(currentItem, "remove");

        // Sync local queue
        setReviewItems((prev) => {
          const updated = prev.filter((item) => item.id !== currentItem.id);
          localStorage.setItem("sekaishi-reviews", JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [isReviewSession, quiz.hasAnswered, quiz.isCorrect, quiz.currentIndex, quiz.screen, quiz.items, syncReviewItem]);

  const handleStartQuiz = (): void => {
    setIsReviewSession(false);
    const started = quiz.startQuiz(false);
    if (!started) {
      alert(
        "選択された範囲のクイズデータが見つかりませんでした。別の範囲を選択してください。",
      );
    }
  };

  const handleAbortQuiz = () => {
    if (
      confirm(
        "クイズを終了してスタート画面に戻りますか？進行状況は消去されます。",
      )
    ) {
      quiz.resetToStart();
      setIsReviewSession(false);
    }
  };

  /** 復習リスト全体からクイズを開始 */
  const handleStartReview = (items: HistoryQuizItem[]) => {
    setIsReviewSession(true);
    const started = quiz.startQuizWithItems(items);
    if (!started) {
      alert("復習クイズを開始できませんでした。");
      return;
    }
    setActiveTab("quiz");
  };

  /** 個別の復習問題を1問だけのクイズとして開始 */
  const handleStartReviewOne = (item: HistoryQuizItem) => {
    setIsReviewSession(true);
    const started = quiz.startQuizWithItems([item]);
    if (!started) {
      alert("復習クイズを開始できませんでした。");
      return;
    }
    setActiveTab("quiz");
  };

  /** 手動で復習アイテムを削除 */
  const handleRemoveReviewItem = (id: string) => {
    const item = reviewItems.find((ri) => ri.id === id);
    if (item) {
      syncReviewItem(item, "remove");
    }
    setReviewItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("sekaishi-reviews", JSON.stringify(updated));
      return updated;
    });
  };

  /** アカウント情報の保存 */
  const handleSaveProfile = async (username: string) => {
    const res = await updateProfile(username);
    if (res.error) {
      alert("プロフィールの更新に失敗しました: " + res.error.message);
    } else {
      alert("プロフィールを保存しました。");
    }
  };

  const handleThemeChange = async (next: "light" | "dark") => {
    setTheme(next);
    await updateTheme(next);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "アカウントとすべての学習データを完全に削除します。この操作は取り消せません。",
      )
    ) {
      return;
    }
    const res = await deleteAccount();
    if (res.error) {
      alert("アカウント削除に失敗しました: " + res.error.message);
    }
  };

  const handleResetPassword = async (email: string) => {
    return resetPassword(email);
  };

  /** 全学習データの消去 */
  const handleClearData = async () => {
    if (
      confirm(
        "すべての学習履歴、復習キュー、投稿データを完全に消去しますか？この操作は取り消せません。",
      )
    ) {
      localStorage.removeItem("sekaishi-reviews");
      localStorage.removeItem("sekaishi-custom-pool");
      localStorage.removeItem("sekaishi-submissions");
      localStorage.removeItem("sekaishi-history");
      localStorage.removeItem("sekaishi-category-stats");
      
      // If Supabase, we can also clear their review items
      if (!isOfflineMode && user) {
        await supabase.from("review_items").delete().eq("user_id", user.id);
        await supabase
          .from("profiles")
          .update({
            total_answered: 0,
            total_correct: 0,
            streak_current: 0,
            streak_best: 0,
            last_played_at: null,
            rank_points: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      setReviewItems([]);
      setCustomPool([]);
      setSubmissions([]);
      setHistory([]);
      setCategoryStats({});
      setIsReviewSession(false);
      quiz.resetToStart();
      
      alert("学習データをリセットしました。");
    }
  };

  /** クイズモードの設定変更 */
  const handleChangeQuizMode = async (m: import("./types/quiz").QuizMode) => {
    quiz.setMode(m);
    if (!isOfflineMode && user) {
      await supabase
        .from("profiles")
        .update({ quiz_mode: quizModeToDb(m), updated_at: new Date().toISOString() })
        .eq("id", user.id);
    } else if (profile) {
      const updated = { ...profile, quizMode: m };
      localStorage.setItem("sekaishi-profile", JSON.stringify(updated));
    }
  };

  /** ユーザーからの問題投稿 */
  const handleSubmitSubmission = async (form: any) => {
    const parsedYear = form.year !== null ? Number(form.year) : 0;
    
    // Send to Supabase (if online)
    const res = await submitEvent(form);
    if (res.error) {
      alert("投稿に失敗しました: " + res.error.message);
      return;
    }

    // Dynamic locally-injected question representation
    const newItem: HistoryQuizItem = {
      id: `custom-${Date.now()}`,
      event: form.event,
      year: parsedYear,
      is_bc: parsedYear < 0,
      chapter: `投稿問題 · ${form.field}`,
      period: getPeriodFromYear(parsedYear),
      region: form.regions[0] || "europe",
      field: form.field.toLowerCase(),
      description: form.description || undefined,
    };

    // Update custom pool for immediate local query
    const newPool = [...customPool, newItem];
    setCustomPool(newPool);
    localStorage.setItem("sekaishi-custom-pool", JSON.stringify(newPool));

    // Update submissions list
    const newSubmissions = [...submissions, form];
    setSubmissions(newSubmissions);
    localStorage.setItem("sekaishi-submissions", JSON.stringify(newSubmissions));

    alert(
      "問題が投稿され、データベースに登録されました！承認されると全体の出題範囲に反映されます。(現在はローカル検証用に直ちに出題範囲に追加されています。)"
    );
  };

  // Stats calculations
  const getCategoryVal = useCallback(
    (cat: string) => {
      const stat = categoryStats[cat];
      if (!stat || stat.answered === 0) return 0;
      return Math.round((stat.correct / stat.answered) * 100);
    },
    [categoryStats],
  );

  const displayCategories = useMemo(() => {
    return [
      { label: "古代文明", val: getCategoryVal("古代文明"), era: "Ancient" },
      {
        label: "中世ヨーロッパ",
        val: getCategoryVal("中世ヨーロッパ"),
        era: "Medieval",
      },
      {
        label: "近現代ヨーロッパ",
        val: getCategoryVal("近現代ヨーロッパ"),
        era: "Modern",
      },
      { label: "中国史", val: getCategoryVal("中国史"), era: "China" },
      { label: "日本の歴史", val: getCategoryVal("日本の歴史"), era: "Japan" },
      {
        label: "その他アジア・アフリカ",
        val: getCategoryVal("イスラーム・アジア・他"),
        era: "Others",
      },
    ];
  }, [getCategoryVal]);

  // Read stats from either supabase profile (online) or local state profile
  const totalAnswered = profile?.totalAnswered ?? 0;
  const totalCorrect = profile?.totalCorrect ?? 0;
  const streakCurrent = profile?.streakCurrent ?? 0;
  const rankPoints = profile?.rankPoints ?? 0;

  const accuracyPercent = useMemo(() => {
    if (totalAnswered === 0) return "0%";
    return `${Math.round((totalCorrect / totalAnswered) * 100)}%`;
  }, [totalAnswered, totalCorrect]);

  const streakLabelText = useMemo(() => {
    return `${streakCurrent}d`;
  }, [streakCurrent]);

  const rangeOptions = useMemo(
    () => getRangeOptions(combinedPool, quiz.mode),
    [combinedPool, quiz.mode],
  );

  const rangeLabel =
    quiz.mode === "event-to-year"
      ? questionSource === "supabase"
        ? "出題地域"
        : "出題章"
      : "時代区分";

  const rankLabelText = useMemo(() => {
    return getRank(rankPoints);
  }, [rankPoints]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] dark:bg-[#141414] text-[#1a1a1a] dark:text-[#f0f0ec] flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 mt-4 tracking-wider uppercase">Loading Session...</p>
      </div>
    );
  }

  // Require Auth Screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a] dark:bg-[#141414] dark:text-[#f0f0ec] transition-colors duration-200 font-sans flex flex-col pb-20">
      <Header
        showAbort={activeTab === "quiz" && quiz.screen !== "start"}
        onAbort={handleAbortQuiz}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col justify-start overflow-y-auto">
        {activeTab === "quiz" && (
          <>
            {quiz.screen === "start" && (
              <StartScreen
                mode={quiz.mode}
                range={quiz.range}
                count={quiz.count}
                loading={questionsLoading}
                rangeOptions={rangeOptions}
                rangeLabel={rangeLabel}
                onChangeMode={handleChangeQuizMode}
                onChangeRange={quiz.setRange}
                onChangeCount={quiz.setCount}
                onStart={handleStartQuiz}
              />
            )}
            {quiz.screen === "quiz" && quiz.items.length > 0 && (
              <QuizScreen
                mode={quiz.mode}
                items={quiz.items}
                currentIndex={quiz.currentIndex}
                choices={quiz.currentChoices}
                hasAnswered={quiz.hasAnswered}
                isCorrect={quiz.isCorrect}
                selectedChoice={quiz.selectedChoice}
                userAnswerText={quiz.userAnswerText}
                validationError={quiz.validationError}
                progress={quiz.progress}
                onTextAnswer={quiz.handleTextSubmit}
                onChoiceSelect={quiz.handleChoiceSelect}
                onNext={quiz.nextQuestion}
              />
            )}
            {quiz.screen === "result" && (
              <ResultScreen
                mode={quiz.mode}
                score={quiz.score}
                total={quiz.items.length}
                mistakes={quiz.mistakes}
                onRetryMistakes={() => quiz.startQuiz(true)}
                onFinish={quiz.resetToStart}
              />
            )}
          </>
        )}

        {activeTab === "stats" && (
          <StatsTab
            reviewItems={reviewItems}
            categoryPerformance={displayCategories}
            onStartReview={handleStartReview}
            onStartReviewOne={handleStartReviewOne}
            onRemoveReviewItem={handleRemoveReviewItem}
            totalLabel={String(totalAnswered)}
            accuracyLabel={accuracyPercent}
            streakLabel={streakLabelText}
            rankLabel={rankLabelText}
          />
        )}

        {activeTab === "submit" && (
          <SubmitTab
            onSubmit={handleSubmitSubmission}
            pastSubmissions={submissions}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            account={{
              username: profile?.username || user.email?.split("@")[0] || "User",
              email: user.email ?? "",
            }}
            isSynced={!isOfflineMode}
            theme={theme}
            onChangeTheme={handleThemeChange}
            onSaveProfile={handleSaveProfile}
            onClearData={handleClearData}
            onSignOut={signOut}
            onDeleteAccount={handleDeleteAccount}
            onResetPassword={handleResetPassword}
          />
        )}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
