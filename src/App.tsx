import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
  Calendar,
} from "lucide-react";

// クイズアイテムの型定義
interface HistoryQuizItem {
  id: string;
  event: string;
  year: number;      // 紀元前は負の値 (例: -221)
  is_bc: boolean;    // 紀元前フラグ
  chapter: string;   // 出来事→年号の分類（章）
  period: string;    // 年号→出来事の分類（時代区分）
}

// 豊富な世界史年代モックデータ
const mockHistoryData: HistoryQuizItem[] = [
  // 第1章 古代文明圏 & 紀元前
  { id: "wh-1", event: "秦の始皇帝による中国統一", year: -221, is_bc: true, chapter: "第1章 | 古代文明圏", period: "紀元前" },
  { id: "wh-2", event: "アレクサンドロス大王の東征開始", year: -334, is_bc: true, chapter: "第1章 | 古代文明圏", period: "紀元前" },
  { id: "wh-3", event: "アケメネス朝ペルシアの成立（キュロス2世）", year: -550, is_bc: true, chapter: "第1章 | 古代文明圏", period: "紀元前" },
  { id: "wh-4", event: "アクティウムの海戦（プトレマイオス朝エジプト滅亡）", year: -31, is_bc: true, chapter: "第1章 | 古代文明圏", period: "紀元前" },
  
  // 第2章 中世ヨーロッパ & 1〜1000年
  { id: "wh-5", event: "ミラノ勅令（キリスト教の公認）", year: 313, is_bc: false, chapter: "第2章 | 中世ヨーロッパ", period: "1〜1000年" },
  { id: "wh-6", event: "カールの戴冠", year: 800, is_bc: false, chapter: "第2章 | 中世ヨーロッパ", period: "1〜1000年" },
  { id: "wh-7", event: "ヴェルダン条約（フランク王国の分裂）", year: 843, is_bc: false, chapter: "第2章 | 中世ヨーロッパ", period: "1〜1000年" },
  { id: "wh-8", event: "西ローマ帝国の滅亡", year: 476, is_bc: false, chapter: "第2章 | 中世ヨーロッパ", period: "1〜1000年" },

  // 第3章 近現代ヨーロッパ & 1001〜1500年 / 1501〜1700年 / 1701〜1800年
  { id: "wh-9", event: "コンスタンティノープル陥落（ビザンツ帝国滅亡）", year: 1453, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1001〜1500年" },
  { id: "wh-10", event: "ルターの宗教改革（95ヶ条の論題）", year: 1517, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1501〜1700年" },
  { id: "wh-11", event: "レパントの海戦", year: 1571, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1501〜1700年" },
  { id: "wh-12", event: "ピューリタン革命の開始", year: 1642, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1501〜1700年" },
  { id: "wh-13", event: "ウェストファリア条約の締結", year: 1648, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1501〜1700年" },
  { id: "wh-14", event: "名誉革命（権利の章典）", year: 1689, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1501〜1700年" },
  { id: "wh-15", event: "アメリカ独立宣言", year: 1776, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1701〜1800年" },
  { id: "wh-16", event: "フランス革命の勃発（バスティーユ牢獄襲撃）", year: 1789, is_bc: false, chapter: "第3章 | 近現代ヨーロッパ", period: "1701〜1800年" },

  // 第9章・第10章 近現代世界大戦 & 1901〜1945年
  { id: "wh-17", event: "サラエボ事件（第一次世界大戦の契機）", year: 1914, is_bc: false, chapter: "第9章 | 第一次世界大戦", period: "1901〜1945年" },
  { id: "wh-18", event: "ロシア十月革命", year: 1917, is_bc: false, chapter: "第9章 | 第一次世界大戦", period: "1901〜1945年" },
  { id: "wh-19", event: "ヴェルサイユ条約の調印", year: 1919, is_bc: false, chapter: "第9章 | 第一次世界大戦", period: "1901〜1945年" },
  { id: "wh-20", event: "ドイツ軍のポーランド侵攻（第二次世界大戦勃発）", year: 1939, is_bc: false, chapter: "第10章 | 第二次世界大戦", period: "1901〜1945年" },
  { id: "wh-21", event: "ヤルタ会談の開催", year: 1945, is_bc: false, chapter: "第10章 | 第二次世界大戦", period: "1901〜1945年" },

  // 第11章 戦後国際史 & 1946〜1989年 / 1990年〜
  { id: "wh-22", event: "中華人民共和国の建国", year: 1949, is_bc: false, chapter: "第11章 | 戦後国際史", period: "1946〜1989年" },
  { id: "wh-23", event: "キューバ危機", year: 1962, is_bc: false, chapter: "第11章 | 戦後国際史", period: "1946〜1989年" },
  { id: "wh-24", event: "マルタ会談（冷戦の終結）", year: 1989, is_bc: false, chapter: "第11章 | 戦後国際史", period: "1946〜1989年" },
  { id: "wh-25", event: "ソビエト社会主義共和国連邦の解体", year: 1991, is_bc: false, chapter: "第11章 | 戦後国際史", period: "1990年〜" },
];

// 年号の表示フォーマット関数
const formatYear = (year: number): string => {
  if (year < 0) {
    return `前${Math.abs(year)}年`;
  }
  return `${year}年`;
};

// シャッフル関数 (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// クイズモードの定義
type QuizMode = "event-to-year" | "year-to-event";

export default function App() {
  const [dark, setDark] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<"start" | "quiz" | "result">("start");
  
  // クイズ設定用の State
  const [quizMode, setQuizMode] = useState<QuizMode>("event-to-year");
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number | "all">(10);

  // クイズ進行状態管理
  const [quizItems, setQuizItems] = useState<HistoryQuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // 回答状態（記述用：西暦のinput、4択用：選択肢）
  const [userAnswerText, setUserAnswerText] = useState<string>("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 成績管理
  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<Array<{ item: HistoryQuizItem; userAnswer: string; correctLabel: string }>>([]);
  const [reviewMode, setReviewMode] = useState<boolean>(false);

  // ダークモードの適用
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // モードや選択範囲が変わったときに、選択範囲の初期値を設定する
  useEffect(() => {
    setSelectedRange("all");
  }, [quizMode]);

  // クイズ用のデータ抽出と選択肢構築
  const startQuiz = (isRetryMistakesOnly = false) => {
    let filtered: HistoryQuizItem[] = [];

    if (isRetryMistakesOnly) {
      // 間違えた問題だけを再挑戦
      filtered = mistakes.map((m) => m.item);
    } else {
      // 通常の条件抽出
      filtered = mockHistoryData.filter((item) => {
        if (quizMode === "event-to-year") {
          return selectedRange === "all" || item.chapter === selectedRange;
        } else {
          return selectedRange === "all" || item.period === selectedRange;
        }
      });
    }

    if (filtered.length === 0) {
      alert("選択された範囲のクイズデータが見つかりませんでした。別の範囲を選択してください。");
      return;
    }

    // シャッフル
    let shuffled = shuffleArray(filtered);
    
    // 出題数の制限
    if (!isRetryMistakesOnly && questionCount !== "all") {
      shuffled = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    }

    setQuizItems(shuffled);
    setCurrentIndex(0);
    setScore(0);
    if (!isRetryMistakesOnly) {
      setMistakes([]);
      setReviewMode(false);
    } else {
      setReviewMode(true);
    }
    
    // クイズ開始の準備
    setupQuestion(0, shuffled);
    setCurrentScreen("quiz");
  };

  // 次の問題の設定
  const setupQuestion = (index: number, items: HistoryQuizItem[]) => {
    const currentItem = items[index];
    setUserAnswerText("");
    setSelectedChoice(null);
    setHasAnswered(false);
    setValidationError(null);

    // 4択モードの場合、ダミー選択肢（同じ時代区分からランダム抽出）を作成
    if (quizMode === "year-to-event") {
      const correctEvent = currentItem.event;
      // 同じ時代区分からダミーを抽出
      const samePeriodItems = mockHistoryData.filter(
        (x) => x.period === currentItem.period && x.event !== correctEvent
      );
      
      const shuffledDummies = shuffleArray(samePeriodItems).slice(0, 3);
      const dummyEvents = shuffledDummies.map((x) => x.event);
      
      // 正解と混ぜてシャッフル
      const choices = shuffleArray([correctEvent, ...dummyEvents]);
      setCurrentChoices(choices);
    }
  };

  // 年号入力のバリデーションと判定 (記述式/西暦のinput用)
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered) return;

    const trimmedInput = userAnswerText.trim();

    // 厳格なバリデーション (西暦の数値入力: マイナス記号と数字のみ許容)
    if (!/^-?\d+$/.test(trimmedInput)) {
      setValidationError("半角の数値を入力してください（紀元前はマイナスを付与）。");
      return;
    }

    setValidationError(null);
    const parsedYear = parseInt(trimmedInput, 10);
    const currentItem = quizItems[currentIndex];
    
    // 正解判定 (正解の数値と一致するか)
    const correctVal = currentItem.year; // BCなら負数
    const correct = parsedYear === correctVal;
    
    setIsCorrect(correct);
    setHasAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => [
        ...prev,
        {
          item: currentItem,
          userAnswer: formatYear(parsedYear),
          correctLabel: formatYear(correctVal),
        },
      ]);
    }
  };

  // 4択クイズの選択判定
  const handleChoiceSelect = (choice: string) => {
    if (hasAnswered) return;

    setSelectedChoice(choice);
    const currentItem = quizItems[currentIndex];
    const correct = choice === currentItem.event;

    setIsCorrect(correct);
    setHasAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
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
  };

  // 次の問題へ進むか、結果画面へ移行
  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < quizItems.length) {
      setCurrentIndex(nextIndex);
      setupQuestion(nextIndex, quizItems);
    } else {
      setCurrentScreen("result");
    }
  };

  // チャプターの一覧
  const chapters = Array.from(new Set(mockHistoryData.map((item) => item.chapter))).sort();
  // 時代区分の一覧
  const periods = [
    "紀元前",
    "1〜1000年",
    "1001〜1500年",
    "1501〜1700年",
    "1701〜1800年",
    "1801〜1900年",
    "1901〜1945年",
    "1946〜1989年",
    "1990年〜",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200 font-sans flex flex-col">
      
      {/* 1. HEADER */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3.5 px-6 sticky top-0 z-40 transition-colors shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-amber-500 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              世界史年代クイズ
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {quizMode === "event-to-year" ? "出来事 ➔ 年号 (西暦入力)" : "年号 ➔ 出来事 (4択)"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* ダークモードトグル */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition"
              aria-label={dark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            >
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {currentScreen !== "start" && (
              <button
                onClick={() => {
                  if (confirm("クイズを終了してスタート画面に戻りますか？進行状況は消去されます。")) {
                    setCurrentScreen("start");
                  }
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                ホームに戻る
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-start">
        
        {/* START SCREEN */}
        {currentScreen === "start" && (
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md p-6 sm:p-8 space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                <BookOpen className="w-3.5 h-3.5" />
                年代暗記ツール
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">世界史年代マスター</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                出来事と年号（西暦）の対応を効率よく暗記するためのスマート学習クイズです。
              </p>
            </div>

            {/* モード選択 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">出題形式</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQuizMode("event-to-year")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                    quizMode === "event-to-year"
                      ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10 text-slate-900 dark:text-zinc-50 shadow-sm ring-1 ring-amber-400"
                      : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850"
                  }`}
                >
                  <span className="font-bold text-sm">出来事 ➔ 年号</span>
                  <span className="text-xs text-slate-400 mt-1">西暦を入力して回答</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setQuizMode("year-to-event")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                    quizMode === "year-to-event"
                      ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/10 text-slate-900 dark:text-zinc-50 shadow-sm ring-1 ring-amber-400"
                      : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850"
                  }`}
                >
                  <span className="font-bold text-sm">年号 ➔ 出来事</span>
                  <span className="text-xs text-slate-400 mt-1">4つの選択肢から回答</span>
                </button>
              </div>
            </div>

            {/* 出題範囲選択 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                {quizMode === "event-to-year" ? "出題範囲（章）" : "出題範囲（時代区分）"}
              </label>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition"
              >
                <option value="all">すべての範囲から出題</option>
                {quizMode === "event-to-year"
                  ? chapters.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  : periods.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
              </select>
            </div>

            {/* 問題数選択 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-zinc-300">出題問題数</label>
              <div className="grid grid-cols-4 gap-2">
                {([5, 10, 20, "all"] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                      questionCount === count
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400"
                        : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850"
                    }`}
                  >
                    {count === "all" ? "全問" : `${count}問`}
                  </button>
                ))}
              </div>
            </div>

            {/* クイズ開始ボタン */}
            <button
              onClick={() => startQuiz()}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-md shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
            >
              クイズを開始する
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* QUIZ SCREEN */}
        {currentScreen === "quiz" && quizItems.length > 0 && (
          <div className="w-full space-y-6 animate-fadeIn">
            {/* 上部プログレスバー */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 truncate max-w-[70%]">
                  {quizMode === "event-to-year" ? quizItems[currentIndex].chapter : quizItems[currentIndex].period}
                </span>
                <span>
                  問題 {currentIndex + 1} / {quizItems.length}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quizItems.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 問題カード */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md p-6 sm:p-8 space-y-6">
              
              {/* 問題文 */}
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  {quizMode === "event-to-year" ? "この出来事の年は？" : "この年に起きた出来事は？"}
                </span>
                
                {quizMode === "event-to-year" ? (
                  // 出来事 ➔ 年号
                  <h3 className="text-xl sm:text-2xl font-bold leading-relaxed py-4 text-slate-900 dark:text-zinc-100">
                    {quizItems[currentIndex].event}
                  </h3>
                ) : (
                  // 年号 ➔ 出来事
                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight py-4 text-amber-500">
                    {formatYear(quizItems[currentIndex].year)}
                  </h3>
                )}
              </div>

              {/* 回答エリア */}
              {!hasAnswered ? (
                quizMode === "event-to-year" ? (
                  // 出来事 ➔ 年号 (記述式：西暦のinput)
                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="-?[0-9]*"
                          value={userAnswerText}
                          onChange={(e) => {
                            setUserAnswerText(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          placeholder="例: 1789 または -221"
                          autoFocus
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center font-bold text-lg tracking-wider"
                        />
                        <button
                          type="submit"
                          className="px-6 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition-all active:scale-[0.98]"
                        >
                          確定
                        </button>
                      </div>
                      
                      {validationError && (
                        <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold">
                          {validationError}
                        </p>
                      )}
                      
                      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                        ※ 紀元前はマイナス記号 ( - ) をつけて入力してください。（例：前221年は <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono font-bold">-221</code>）
                      </p>
                    </div>
                  </form>
                ) : (
                  // 年号 ➔ 出来事 (4択ボタン)
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentChoices.map((choice, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleChoiceSelect(choice)}
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 text-left font-semibold text-sm transition-all hover:translate-x-0.5 active:translate-x-0 duration-150 text-slate-800 dark:text-zinc-200 flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-xs text-slate-500 shrink-0">
                          {i + 1}
                        </span>
                        <span>{choice}</span>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                // 回答後の判定フィードバック
                <div className="space-y-4 animate-scaleUp">
                  
                  {isCorrect ? (
                    // 正解フィードバック
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm">正解です！</p>
                        <p className="text-xs opacity-90 leading-relaxed">
                          正解: {formatYear(quizItems[currentIndex].year)} ➔ {quizItems[currentIndex].event}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // 不正解フィードバック
                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm">不正解...</p>
                        <p className="text-xs opacity-90 leading-relaxed">
                          あなたの回答:{" "}
                          <span className="line-through">
                            {quizMode === "event-to-year" ? userAnswerText : selectedChoice}
                          </span>
                        </p>
                        <p className="text-sm font-bold text-rose-900 dark:text-rose-200 mt-1">
                          正解: {quizMode === "event-to-year" ? formatYear(quizItems[currentIndex].year) : quizItems[currentIndex].event}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 次へボタン */}
                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition flex items-center justify-center gap-1 text-sm shadow-md"
                  >
                    {currentIndex + 1 < quizItems.length ? "次の問題へ" : "結果を見る"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {currentScreen === "result" && (
          <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md p-6 sm:p-8 space-y-6 animate-fadeIn">
            
            {/* スコアヘッダー */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold">クイズ結果発表！</h2>
              <div className="inline-block py-2 px-6 bg-slate-100 dark:bg-zinc-850 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-semibold">正解数</p>
                <p className="text-3xl font-extrabold text-amber-500">
                  {score} <span className="text-base font-semibold text-slate-400">/ {quizItems.length} 問</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
                  正解率: {Math.round((score / quizItems.length) * 100)}%
                </p>
              </div>
            </div>

            {/* 間違えた問題の復習 */}
            {mistakes.length > 0 ? (
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">間違えた問題の復習 ({mistakes.length}問)</h3>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/20">
                  {mistakes.map(({ item, userAnswer, correctLabel }, i) => (
                    <div key={i} className="p-3.5 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                      <p className="font-bold text-slate-900 dark:text-zinc-100 leading-normal flex items-start gap-1">
                        <span className="text-rose-500 shrink-0 font-mono">✗</span>
                        <span>{item.event}</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 pl-3 mt-1 text-slate-500 dark:text-zinc-400">
                        <p>
                          あなたの回答: <span className="text-rose-600 font-semibold line-through">{userAnswer || "（未回答）"}</span>
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          正解: {quizMode === "event-to-year" ? formatYear(item.year) : item.event}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center text-emerald-800 dark:text-emerald-300 space-y-1">
                <p className="font-extrabold text-sm">🎉 パーフェクト達成！</p>
                <p className="text-xs opacity-95">全問正解です。素晴らしい年代暗記力です！</p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-2 pt-2">
              {mistakes.length > 0 && (
                <button
                  onClick={() => startQuiz(true)}
                  className="w-full py-3 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  間違えた問題だけ解き直す ({mistakes.length}問)
                </button>
              )}
              
              <button
                onClick={() => setCurrentScreen("start")}
                className="w-full py-3 rounded-xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-200 font-bold text-sm tracking-wide transition shadow-sm"
              >
                スタート画面に戻る
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 py-4 px-6 text-center text-xs text-slate-400 transition-colors">
        <p>© 2026 世界史年代暗記アプリ (luxenjade | Shoei451)</p>
      </footer>
    </div>
  );
}
