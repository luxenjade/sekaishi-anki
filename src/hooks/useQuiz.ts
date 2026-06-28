import { useCallback, useState } from "react";
import type {
  HistoryQuizItem,
  QuizMistake,
  QuizMode,
  QuizScreen,
} from "../types/quiz";
import {
  buildChoiceOptions,
  buildQuizSet,
  filterByRange,
  formatYear,
  parseYearInput,
} from "../lib/quiz";

export interface UseQuizOptions {
  /** 出題プール */
  pool: HistoryQuizItem[];
}

export interface UseQuizReturn {
  // ----- 状態 -----
  mode: QuizMode;
  range: string;
  count: number | "all";
  screen: QuizScreen;
  items: HistoryQuizItem[];
  currentIndex: number;
  userAnswerText: string;
  selectedChoice: string | null;
  currentChoices: string[];
  hasAnswered: boolean;
  isCorrect: boolean;
  validationError: string | null;
  score: number;
  mistakes: QuizMistake[];
  // ----- アクション -----
  setMode: (m: QuizMode) => void;
  setRange: (r: string) => void;
  setCount: (c: number | "all") => void;
  startQuiz: (retryMistakesOnly?: boolean) => boolean;
  /** 任意のアイテム配列で直接クイズを開始する(復習モード用) */
  startQuizWithItems: (items: HistoryQuizItem[]) => boolean;
  handleTextSubmit: (input: string) => void;
  handleChoiceSelect: (choice: string) => void;
  nextQuestion: () => void;
  resetToStart: () => void;
  // ----- 派生 -----
  progress: number; // 0-1
}

/**
 * クイズフローの状態管理を集約したフック。
 * 旧App.tsxに散らばっていたstateとハンドラを1か所にまとめる。
 */
export function useQuiz({ pool }: UseQuizOptions): UseQuizReturn {
  const [mode, setMode] = useState<QuizMode>("event-to-year");
  const [range, setRange] = useState<string>("all");
  const [count, setCount] = useState<number | "all">(10);

  const [screen, setScreen] = useState<QuizScreen>("start");
  const [items, setItems] = useState<HistoryQuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [userAnswerText, setUserAnswerText] = useState<string>("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<QuizMistake[]>([]);

  // モード切替時に範囲をリセット
  const handleSetMode = useCallback((m: QuizMode) => {
    setMode(m);
    setRange("all");
  }, []);

  const startQuiz = useCallback(
    (retryMistakesOnly = false): boolean => {
      let filtered: HistoryQuizItem[] = [];

      if (retryMistakesOnly) {
        filtered = mistakes.map((m) => m.item);
      } else {
        filtered = filterByRange(pool, mode, range);
      }

      if (filtered.length === 0) {
        return false;
      }

      const quiz = retryMistakesOnly ? filtered : buildQuizSet(filtered, count);
      setItems(quiz);
      setCurrentIndex(0);
      setScore(0);
      if (!retryMistakesOnly) setMistakes([]);

      // 最初の問題設定
      setUserAnswerText("");
      setSelectedChoice(null);
      setHasAnswered(false);
      setValidationError(null);
      if (mode === "year-to-event") {
        setCurrentChoices(buildChoiceOptions(quiz[0], pool));
      } else {
        setCurrentChoices([]);
      }

      setScreen("quiz");
      return true;
    },
    [pool, mode, range, count, mistakes],
  );

  /**
   * 復習モードなど、出題内容を外部から直接注入してクイズを開始する。
   * 範囲選択・問題数選択・シャッフルは行わず、与えられた配列をそのまま使う。
   */
  const startQuizWithItems = useCallback(
    (customItems: HistoryQuizItem[]): boolean => {
      if (customItems.length === 0) return false;

      setItems(customItems);
      setCurrentIndex(0);
      setScore(0);
      setMistakes([]);

      setUserAnswerText("");
      setSelectedChoice(null);
      setHasAnswered(false);
      setValidationError(null);
      if (mode === "year-to-event") {
        setCurrentChoices(buildChoiceOptions(customItems[0], pool));
      } else {
        setCurrentChoices([]);
      }

      setScreen("quiz");
      return true;
    },
    [mode, pool],
  );

  const handleTextSubmit = useCallback(
    (input: string) => {
      if (hasAnswered) return;
      const parsed = parseYearInput(input);
      if (parsed === null) {
        setValidationError(
          "半角の数値を入力してください（紀元前はマイナスを付与）。",
        );
        return;
      }
      setValidationError(null);
      setUserAnswerText(input.trim());

      const currentItem = items[currentIndex];
      const correct = parsed === currentItem.year;
      setIsCorrect(correct);
      setHasAnswered(true);

      if (correct) {
        setScore((s) => s + 1);
      } else {
        setMistakes((prev) => [
          ...prev,
          {
            item: currentItem,
            userAnswer: formatYear(parsed),
            correctLabel: formatYear(currentItem.year),
          },
        ]);
      }
    },
    [hasAnswered, items, currentIndex],
  );

  const handleChoiceSelect = useCallback(
    (choice: string) => {
      if (hasAnswered) return;
      setSelectedChoice(choice);
      const currentItem = items[currentIndex];
      const correct = choice === currentItem.event;
      setIsCorrect(correct);
      setHasAnswered(true);

      if (correct) {
        setScore((s) => s + 1);
      } else {
        setMistakes((prev) => [
          ...prev,
          {
            item: currentItem,
            userAnswer: choice,
            correctLabel: currentItem.event,
          },
        ]);
      }
    },
    [hasAnswered, items, currentIndex],
  );

  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < items.length) {
      setCurrentIndex(nextIndex);
      const currentItem = items[nextIndex];
      setUserAnswerText("");
      setSelectedChoice(null);
      setHasAnswered(false);
      setValidationError(null);
      if (mode === "year-to-event") {
        setCurrentChoices(buildChoiceOptions(currentItem, pool));
      }
    } else {
      setScreen("result");
    }
  }, [currentIndex, items, mode, pool]);

  const resetToStart = useCallback(() => {
    setScreen("start");
    setItems([]);
    setCurrentIndex(0);
    setScore(0);
    setMistakes([]);
    setUserAnswerText("");
    setSelectedChoice(null);
    setHasAnswered(false);
    setIsCorrect(false);
    setValidationError(null);
  }, []);

  // 派生: 進捗率
  const progress = items.length === 0 ? 0 : (currentIndex + 1) / items.length;

  return {
    mode,
    range,
    count,
    screen,
    items,
    currentIndex,
    userAnswerText,
    selectedChoice,
    currentChoices,
    hasAnswered,
    isCorrect,
    validationError,
    score,
    mistakes,
    setMode: handleSetMode,
    setRange,
    setCount,
    startQuiz,
    startQuizWithItems,
    handleTextSubmit,
    handleChoiceSelect,
    nextQuestion,
    resetToStart,
    progress,
  };
}
