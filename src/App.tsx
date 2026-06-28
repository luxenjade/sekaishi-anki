import { useState } from "react";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { StartScreen } from "./features/quiz/StartScreen";
import { QuizScreen } from "./features/quiz/QuizScreen";
import { ResultScreen } from "./features/quiz/ResultScreen";
import { StatsTab } from "./features/stats/StatsTab";
import { SubmitTab } from "./features/submit/SubmitTab";
import { SettingsTab } from "./features/settings/SettingsTab";
import { mockHistoryData } from "./data/mockEvents";
import { useQuiz } from "./hooks/useQuiz";
import { useTheme } from "./hooks/useTheme";
import type { AppTab, HistoryQuizItem } from "./types/quiz";

// 統計タブ用のサンプル(Supabase接続前はモック)
const SAMPLE_CATEGORIES = [
  { label: "古代文明", val: 92, era: "Ancient" },
  { label: "中世ヨーロッパ", val: 78, era: "Medieval" },
  { label: "近現代ヨーロッパ", val: 65, era: "Modern" },
  { label: "中国史", val: 88, era: "China" },
  { label: "日本の歴史", val: 71, era: "Japan" },
];

const SAMPLE_REVIEWS: HistoryQuizItem[] = [
  {
    id: "review-1",
    event: "ミラノ勅令",
    year: 313,
    is_bc: false,
    chapter: "第2章 | 中世ヨーロッパ",
    period: "1〜1000年",
  },
  {
    id: "review-2",
    event: "ピューリタン革命の開始",
    year: 1642,
    is_bc: false,
    chapter: "第3章 | 近現代ヨーロッパ",
    period: "1501〜1700年",
  },
  {
    id: "review-3",
    event: "ウェストファリア条約の締結",
    year: 1648,
    is_bc: false,
    chapter: "第3章 | 近現代ヨーロッパ",
    period: "1501〜1700年",
  },
];

export default function App() {
  // テーマはアプリ全体で1つだけ管理
  useTheme();

  const [activeTab, setActiveTab] = useState<AppTab>("quiz");
  const [reviewItems] = useState<HistoryQuizItem[]>(SAMPLE_REVIEWS);

  const quiz = useQuiz({ pool: mockHistoryData });

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
    const started = quiz.startQuizWithItems([item]);
    if (!started) {
      alert("復習クイズを開始できませんでした。");
      return;
    }
    setActiveTab("quiz");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200 font-sans flex flex-col pb-20">
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
                onChangeMode={quiz.setMode}
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
            categoryPerformance={SAMPLE_CATEGORIES}
            onStartReview={handleStartReview}
            onStartReviewOne={handleStartReviewOne}
          />
        )}

        {activeTab === "submit" && <SubmitTab />}

        {activeTab === "settings" && <SettingsTab />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
