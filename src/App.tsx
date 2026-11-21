import { useState, useMemo, useEffect, useRef } from "react";
import { BottomNav } from "./components/layout/BottomNav";
import { StartScreen } from "./features/quiz/StartScreen";
import { QuizScreen } from "./features/quiz/QuizScreen";
import { ResultScreen } from "./features/quiz/ResultScreen";
import { StatsTab } from "./features/stats/StatsTab";
import { SubmitTab, type SubmitFormState } from "./features/submit/SubmitTab";
import { SettingsTab } from "./features/settings/SettingsTab";
import { AdminTab } from "./features/admin/AdminTab";
import { AuthScreen } from "./features/auth/AuthScreen";
import { mockHistoryData } from "./data/mockEvents";
import { useQuiz } from "./hooks/useQuiz";
import { useTheme } from "./hooks/useTheme";
import { useUserData } from "./hooks/useUserData";
import { useAuth, type QuizAnswer } from "./contexts/AuthContext";
import {
  fetchQuestions,
  fetchPublishedByYear,
  getRangeOptions,
  type FallbackReason,
} from "./lib/questions";
import { getRank } from "./lib/rank";
import { CHAPTERS } from "./lib/taxonomy";
import type { AppTab, HistoryQuizItem } from "./types/quiz";

export default function App() {
  const {
    user,
    profile,
    loading,
    isOfflineMode,
    isAdmin,
    updateProfile,
    updateTheme,
    dismissReviewItem,
    submitEvent,
    saveQuizResults,
    resetStats,
    signOut,
    resetPassword,
    deleteAccount,
  } = useAuth();

  const { theme, setTheme } = useTheme(profile?.theme);

  const [activeTab, setActiveTab] = useState<AppTab>("quiz");
  const [questionPool, setQuestionPool] =
    useState<HistoryQuizItem[]>(mockHistoryData);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionSource, setQuestionSource] = useState<"supabase" | "mock">(
    "mock",
  );
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(
    null,
  );

  // 復習キュー・提出履歴・章別成績
  const userData = useUserData(user?.id ?? null, isOfflineMode);

  // 公開済みの問題マスターを読み込む（取得できなければモックにフォールバック）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setQuestionsLoading(true);
      const result = await fetchQuestions();
      if (!cancelled) {
        setQuestionPool(result.items);
        setQuestionSource(result.source);
        setFallbackReason(result.fallbackReason ?? null);
        setQuestionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const quiz = useQuiz({ pool: questionPool });

  // セッション終了時に結果を記録する
  const prevScreenRef = useRef(quiz.screen);
  useEffect(() => {
    const prev = prevScreenRef.current;
    prevScreenRef.current = quiz.screen;
    if (!(prev === "quiz" && quiz.screen === "result")) return;

    const wrongIds = new Set(quiz.mistakes.map((m) => m.item.id));
    const answers: QuizAnswer[] = quiz.items.map((item) => ({
      questionId: item.id,
      isCorrect: !wrongIds.has(item.id),
    }));
    const items = quiz.items;

    void (async () => {
      const res = await saveQuizResults(answers);
      if (res.error) {
        console.error("Failed to save quiz results:", res.error.message);
        alert("成績の保存に失敗しました: " + res.error.message);
        return;
      }
      if (isOfflineMode) {
        const correctIds = new Set(
          answers.filter((a) => a.isCorrect).map((a) => a.questionId),
        );
        userData.applyLocalResults(items, correctIds);
      } else {
        await Promise.all([
          userData.reloadReviews(),
          userData.reloadChapterStats(),
        ]);
      }
    })();
    // saveQuizResults / userData は毎レンダー作り直されるため意図的に依存から外す
    // （ref で「quiz → result」の遷移を一度だけ検出している）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.screen]);

  const handleStartQuiz = (): void => {
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
    }
  };

  /** 復習リスト全体からクイズを開始 */
  const handleStartReview = (items: HistoryQuizItem[]) => {
    const started = quiz.startQuizWithItems(items);
    if (!started) {
      alert("復習クイズを開始できませんでした。");
      return;
    }
    setActiveTab("quiz");
  };

  /** 個別の復習問題を1問だけのクイズとして開始 */
  const handleStartReviewOne = (item: HistoryQuizItem) => {
    handleStartReview([item]);
  };

  /** 手動で復習キューから外す */
  const handleRemoveReviewItem = (id: string) => {
    void dismissReviewItem(id);
    userData.setReviewItems((prev) => prev.filter((item) => item.id !== id));
  };

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

  /** 学習データ（成績・復習キュー・集計）の消去。アカウントと提出履歴は残る */
  const handleClearData = async () => {
    if (
      !confirm(
        "すべての学習履歴・復習キュー・集計を完全に消去しますか？この操作は取り消せません。",
      )
    ) {
      return;
    }

    const res = await resetStats();
    if (res.error) {
      alert("学習データの消去に失敗しました: " + res.error.message);
      return;
    }

    userData.clearLocalData();
    if (!isOfflineMode) await userData.reloadSubmissions();
    quiz.resetToStart();
    alert("学習データをリセットしました。");
  };

  /** 問題の提出（承認されるまで他のユーザーには出題されない） */
  const handleSubmitSubmission = async (
    form: SubmitFormState,
  ): Promise<boolean> => {
    const res = await submitEvent({
      event: form.event,
      year: form.year,
      description: form.description,
      wikiUrl: form.wikiUrl,
    });
    if (res.error) {
      alert("提出に失敗しました: " + res.error.message);
      return false;
    }

    if (isOfflineMode) {
      userData.addLocalSubmission({
        id: `local-${Date.now()}`,
        year: form.year,
        event: form.event,
        description: form.description || null,
        wiki_url: form.wikiUrl || null,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    } else {
      await userData.reloadSubmissions();
    }

    alert("提出しました。管理者の承認後に、全体の出題範囲へ公開されます。");
    return true;
  };

  // 統計
  const displayCategories = useMemo(() => {
    const labels = CHAPTERS.map((c) => c.label);
    const extra = Object.keys(userData.chapterStats).filter(
      (label) => !labels.includes(label),
    );
    return [...labels, ...extra].map((label) => {
      const s = userData.chapterStats[label];
      const val =
        s && s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
      return { label, val, era: label };
    });
  }, [userData.chapterStats]);

  const totalAnswered = profile?.totalAnswered ?? 0;
  const totalCorrect = profile?.totalCorrect ?? 0;
  const streakCurrent = profile?.streakCurrent ?? 0;
  const rankPoints = profile?.rankPoints ?? 0;

  const accuracyPercent = useMemo(() => {
    if (totalAnswered === 0) return "0%";
    return `${Math.round((totalCorrect / totalAnswered) * 100)}%`;
  }, [totalAnswered, totalCorrect]);

  const rangeOptions = useMemo(
    () => getRangeOptions(questionPool, quiz.mode),
    [questionPool, quiz.mode],
  );

  const rangeLabel = quiz.mode === "event-to-year" ? "出題章" : "時代区分";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] dark:bg-[#141414] text-[#1a1a1a] dark:text-[#f0f0ec] flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 mt-4 tracking-wider uppercase">
          Loading Session...
        </p>
      </div>
    );
  }

  // 未ログインなら認証画面のみ
  if (!user) {
    return <AuthScreen />;
  }

  // クイズ中はナビを隠して画面を広く使う（中止ボタンから抜ける）
  const inQuiz = activeTab === "quiz" && quiz.screen === "quiz";

  const showFallbackNotice =
    !questionsLoading &&
    questionSource === "mock" &&
    fallbackReason !== null &&
    fallbackReason !== "not-configured";

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a] dark:bg-[#141414] dark:text-[#f0f0ec] transition-colors duration-200 font-sans flex flex-col">
      <main
        className={`flex-1 max-w-2xl w-full mx-auto px-4 pt-6 flex flex-col justify-start overflow-y-auto ${
          inQuiz ? "pb-8" : "pb-24"
        }`}
      >
        {activeTab === "quiz" && (
          <>
            {quiz.screen === "start" && (
              <>
                {showFallbackNotice && (
                  <div className="mb-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-[11px] font-semibold leading-relaxed">
                    {fallbackReason === "empty"
                      ? "公開済みの問題がまだ登録されていないため、デモ用データで出題しています。成績は保存されません。"
                      : "問題データの取得に失敗したため、デモ用データで出題しています。成績は保存されません。"}
                  </div>
                )}
                <StartScreen
                  mode={quiz.mode}
                  range={quiz.range}
                  count={quiz.count}
                  loading={questionsLoading}
                  rangeOptions={rangeOptions}
                  rangeLabel={rangeLabel}
                  onChangeMode={quiz.setMode}
                  onChangeRange={quiz.setRange}
                  onChangeCount={quiz.setCount}
                  onStart={handleStartQuiz}
                />
              </>
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
                onAbort={handleAbortQuiz}
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
            reviewItems={userData.reviewItems}
            categoryPerformance={displayCategories}
            onStartReview={handleStartReview}
            onStartReviewOne={handleStartReviewOne}
            onRemoveReviewItem={handleRemoveReviewItem}
            totalLabel={String(totalAnswered)}
            accuracyLabel={accuracyPercent}
            streakLabel={`${streakCurrent}d`}
            rankLabel={getRank(rankPoints)}
          />
        )}

        {activeTab === "submit" && (
          <SubmitTab
            onSubmit={handleSubmitSubmission}
            pastSubmissions={userData.submissions}
            checkSameYear={fetchPublishedByYear}
          />
        )}

        {activeTab === "admin" && isAdmin && <AdminTab />}

        {activeTab === "settings" && (
          <SettingsTab
            account={{
              username:
                profile?.username || user.email?.split("@")[0] || "User",
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

      {!inQuiz && (
        <BottomNav
          active={activeTab}
          onChange={setActiveTab}
          showAdmin={isAdmin}
        />
      )}
    </div>
  );
}
