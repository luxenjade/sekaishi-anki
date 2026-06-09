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
  BarChart3,
  PlusSquare,
  Settings as SettingsIcon,
  PlayCircle,
  History,
  User,
  Layout,
  FileText,
  LogOut,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  Mail,
  KeyRound,
  Shield,
  Database,
  Trash2,
  Info,
  Palette,
  AtSign,
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
  const [activeTab, setActiveTab] = useState<"quiz" | "stats" | "submit" | "settings">("quiz");
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
  
  // 統計用表示ステート
  const [statsView, setStatsView] = useState<"summary" | "review-cards">("summary");

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200 font-sans flex flex-col pb-20">
      
      {/* 1. HEADER (Minimal) */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 px-6 sticky top-0 z-40 transition-colors shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-amber-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            sekaishi-anki
          </h1>
          
          <div className="flex items-center gap-3">
            {activeTab === "quiz" && currentScreen !== "start" && (
              <button
                onClick={() => {
                  if (confirm("クイズを終了してスタート画面に戻りますか？進行状況は消去されます。")) {
                    setCurrentScreen("start");
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-rose-500 transition"
              >
                中止
              </button>
            )}
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
              JS
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col justify-start overflow-y-auto">
        
        {activeTab === "quiz" && (
          <>
            {/* START SCREEN */}
            {currentScreen === "start" && (
              <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                    <BookOpen className="w-3 h-3" />
                    New Session
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">学習を開始</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    出来事と年号（西暦）の対応を効率よく暗記するためのスマート学習クイズです。
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Mode Selection</label>
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
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">記述回答</span>
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
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">4択選択</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {quizMode === "event-to-year" ? "Chapter Range" : "Period Range"}
                  </label>
                  <select
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition appearance-none cursor-pointer"
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Question Count</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([5, 10, 20, "all"] as const).map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                          questionCount === count
                            ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400"
                            : "border-slate-200 dark:border-zinc-800 bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-850"
                        }`}
                      >
                        {count === "all" ? "全問" : `${count}問`}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startQuiz()}
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  クイズを開始する
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* QUIZ SCREEN */}
            {currentScreen === "quiz" && quizItems.length > 0 && (
              <div className="w-full space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    <span className="truncate max-w-[70%]">
                      {quizMode === "event-to-year" ? quizItems[currentIndex].chapter : quizItems[currentIndex].period}
                    </span>
                    <span className="text-amber-500">
                      {currentIndex + 1} <span className="text-slate-300 dark:text-zinc-700">/</span> {quizItems.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / quizItems.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                      {quizMode === "event-to-year" ? "Question: Event to Year" : "Question: Year to Event"}
                    </span>
                    
                    {quizMode === "event-to-year" ? (
                      <h3 className="text-xl sm:text-2xl font-bold leading-relaxed py-4 text-slate-900 dark:text-zinc-100">
                        {quizItems[currentIndex].event}
                      </h3>
                    ) : (
                      <h3 className="text-4xl sm:text-5xl font-black tracking-tighter py-4 text-amber-500">
                        {formatYear(quizItems[currentIndex].year)}
                      </h3>
                    )}
                  </div>

                  {!hasAnswered ? (
                    quizMode === "event-to-year" ? (
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
                              className="flex-1 px-4 py-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center font-bold text-xl tracking-widest"
                            />
                            <button
                              type="submit"
                              className="px-6 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition-all active:scale-[0.98]"
                            >
                              確定
                            </button>
                          </div>
                          
                          {validationError && (
                            <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold text-center">
                              {validationError}
                            </p>
                          )}
                          
                          <p className="text-[10px] text-slate-400 text-center font-semibold uppercase tracking-wide">
                            ※ 紀元前はマイナス記号 ( - ) をつけて入力
                          </p>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {currentChoices.map((choice, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleChoiceSelect(choice)}
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 text-left font-bold text-sm transition-all hover:translate-x-1 active:translate-x-0 duration-150 text-slate-700 dark:text-zinc-200 flex items-start gap-4"
                          >
                            <span className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-[10px] text-slate-400 shrink-0 shadow-sm">
                              {i + 1}
                            </span>
                            <span className="leading-tight">{choice}</span>
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="space-y-4 animate-scaleUp">
                      {isCorrect ? (
                        <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold text-sm">Excellent!</p>
                            <p className="text-xs opacity-90 leading-relaxed">
                              正解: {formatYear(quizItems[currentIndex].year)} ➔ {quizItems[currentIndex].event}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold text-sm">Not quite...</p>
                            <div className="text-xs opacity-90 space-y-1">
                              <p>あなたの回答: <span className="line-through font-semibold text-rose-500">{quizMode === "event-to-year" ? userAnswerText : selectedChoice}</span></p>
                              <p className="text-sm font-bold text-rose-900 dark:text-rose-100 mt-2">
                                正解: <span className="text-emerald-600 dark:text-emerald-400">{quizMode === "event-to-year" ? formatYear(quizItems[currentIndex].year) : quizItems[currentIndex].event}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={nextQuestion}
                        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold transition flex items-center justify-center gap-1 text-sm shadow-lg active:scale-[0.98]"
                      >
                        {currentIndex + 1 < quizItems.length ? "次の問題へ" : "結果を見る"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentScreen === "result" && (
              <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 space-y-8 animate-fadeIn">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/20 text-amber-500">
                    <Award className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">Session Complete</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Performance Analysis</p>
                  </div>
                  
                  <div className="inline-grid grid-cols-2 gap-px bg-slate-100 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="bg-white dark:bg-zinc-900 p-4 min-w-[120px]">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Score</p>
                      <p className="text-3xl font-black text-amber-500">
                        {score}<span className="text-sm text-slate-300 ml-1">/{quizItems.length}</span>
                      </p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 min-w-[120px]">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Accuracy</p>
                      <p className="text-3xl font-black text-emerald-500">
                        {Math.round((score / quizItems.length) * 100)}<span className="text-sm text-slate-300 ml-1">%</span>
                      </p>
                    </div>
                  </div>
                </div>

                {mistakes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review List ({mistakes.length})</h3>
                      <button className="text-[10px] font-bold text-amber-500 uppercase hover:underline">Save to Review</button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {mistakes.map(({ item, userAnswer, correctLabel }, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 space-y-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                            {item.event}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-bold">
                            <span className="text-rose-500 line-through opacity-60">{userAnswer || "MISS"}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                            <span className="text-emerald-500 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-100 dark:border-emerald-900/30">
                              {quizMode === "event-to-year" ? formatYear(item.year) : item.event}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-2">
                    <p className="text-2xl">🏆</p>
                    <p className="font-black text-emerald-600 dark:text-emerald-400">Perfect Score!</p>
                    <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest">Zero Mistakes Identified</p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  {mistakes.length > 0 && (
                    <button
                      onClick={() => startQuiz(true)}
                      className="w-full py-4 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Retry Mistakes Only
                    </button>
                  )}
                  
                  <button
                    onClick={() => setCurrentScreen("start")}
                    className="w-full py-4 rounded-xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-200 font-bold text-sm tracking-wide transition shadow-md"
                  >
                    Finish Session
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div className="w-full space-y-8 animate-fadeIn">
            {statsView === "summary" ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">Statistics</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Learning Progress</p>
                  </div>
                  <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-amber-200 dark:border-amber-900/30">
                    Rank: Elite
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total</p>
                    <p className="text-xl font-black">1.2k</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Accuracy</p>
                    <p className="text-xl font-black text-emerald-500">84%</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Streak</p>
                    <p className="text-xl font-black text-amber-500">12d</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                        Category Performance
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "古代文明", val: 92, era: "Ancient" },
                        { label: "中世ヨーロッパ", val: 78, era: "Medieval" },
                        { label: "近現代ヨーロッパ", val: 65, era: "Modern" },
                        { label: "中国史", val: 88, era: "China" },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-slate-600 dark:text-zinc-300">{item.label}</span>
                            <span className="text-amber-500">{item.val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-rose-500" />
                        Review Queue
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { event: "ミラノ勅令", year: "313年", strength: 30 },
                        { event: "ピューリタン革命", year: "1642年", strength: 45 },
                        { event: "ウェストファリア条約", year: "1648年", strength: 20 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold">{item.event}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.year}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[8px] font-bold text-slate-400 uppercase">Retention</p>
                              <p className="text-[10px] font-bold text-rose-500">{item.strength}%</p>
                            </div>
                            <button className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-amber-500 shadow-sm active:scale-95 transition">
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setStatsView("review-cards")}
                      className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 active:scale-[0.98] transition"
                    >
                      Start Smart Review
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStatsView("summary")} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                  <h2 className="text-sm font-black uppercase tracking-widest">Smart Review Cards</h2>
                  <div className="w-9" />
                </div>

                <div className="aspect-[3/4] w-full max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-3xl border-2 border-slate-200 dark:border-zinc-800 shadow-xl p-8 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
                  
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Chapter 3 | 近現代ヨーロッパ
                  </span>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-black leading-tight">
                      ピューリタン革命の開始
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      イギリスでチャールズ1世の専制に反対して起きた市民革命の始まり。
                    </p>
                  </div>

                  <div className="w-full pt-8 border-t border-slate-100 dark:border-zinc-800">
                    <button className="text-amber-500 font-black text-sm uppercase tracking-widest hover:underline">
                      Tap to Reveal Year
                    </button>
                  </div>
                  
                  {/* Mock reveal state hint */}
                  <div className="absolute inset-0 bg-amber-500 flex flex-col items-center justify-center text-white p-8 opacity-0 group-active:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">The Year is</span>
                    <h4 className="text-6xl font-black tracking-tighter">1642</h4>
                    <div className="mt-12 flex gap-4">
                      <button className="px-6 py-2 rounded-full border-2 border-white/30 font-bold text-xs">Easy</button>
                      <button className="px-6 py-2 rounded-full border-2 border-white/30 font-bold text-xs">Hard</button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black">12</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Remaining</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800" />
                  <div className="text-center">
                    <p className="text-xl font-black">4</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mastered</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT TAB */}
        {activeTab === "submit" && (
          <div className="w-full space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">Contribution</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Database Submission</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[8px] font-black uppercase tracking-tighter">Verified Creator</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Event Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="例: ローマ帝国の分裂"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Start Year <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      placeholder="-221"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                    <p className="text-[8px] text-slate-400 font-bold uppercase pl-1">Negative = BC</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">End Year (Optional)</label>
                    <input
                      type="number"
                      placeholder="395"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Record Type <span className="text-rose-500">*</span></label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer">
                      <option value="event">Event</option>
                      <option value="period">Period</option>
                      <option value="person">Person</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Field Category</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold outline-none cursor-pointer">
                      <option>Politics</option>
                      <option>Economy</option>
                      <option>Culture/Religion</option>
                      <option>Social</option>
                      <option>War/Diplomacy</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Regions (Multiple)</label>
                  <div className="flex flex-wrap gap-2 p-1">
                    {["East Asia", "Europe", "Middle East", "Americas", "Africa", "South Asia"].map((region) => (
                      <button key={region} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-[10px] font-bold hover:border-amber-400 hover:text-amber-500 transition">
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Wikipedia URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://ja.wikipedia.org/wiki/..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                    <button className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Search</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short summary for the quiz card..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none transition"
                  />
                </div>
              </div>

              <button className="w-full py-4 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition">
                Submit to Database
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="w-full space-y-8 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Settings</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account, Theme, Privacy</p>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-black">
                      JS
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black">J. Student</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase truncate">student@example.com</p>
                    </div>
                    <span className="ml-auto px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-black uppercase">
                      Synced
                    </span>
                  </div>

                  <div className="p-5 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        Display Name
                      </label>
                      <input
                        type="text"
                        defaultValue="J. Student"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="student@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                          <KeyRound className="w-3 h-3" />
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs uppercase tracking-widest shadow-md active:scale-[0.98] transition">
                        Save Account
                      </button>
                      <button className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-300 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
                        Send Reset Link
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
                    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-850 transition group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">Sign Out</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">End current session</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition" />
                    </button>
                    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/10 transition group text-rose-600 dark:text-rose-400">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">Delete Account</p>
                          <p className="text-[10px] font-bold uppercase opacity-60">Remove profile and saved progress</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-300 group-hover:translate-x-1 transition" />
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Appearance</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Theme</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Switch the app appearance</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Toggle dark mode"
                      onClick={() => setDark(!dark)}
                      className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${dark ? "bg-amber-500" : "bg-slate-200 dark:bg-zinc-800"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${dark ? "left-7" : "left-1"}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-zinc-950 p-1 border border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setDark(false)}
                      className={`py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition ${
                        !dark ? "bg-white dark:bg-zinc-900 text-amber-500 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setDark(true)}
                      className={`py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition ${
                        dark ? "bg-white dark:bg-zinc-900 text-amber-500 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <Layout className="w-4 h-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Layout</p>
                      </div>
                      <p className="text-sm font-black">Compact</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <Shield className="w-4 h-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Privacy</p>
                      </div>
                      <p className="text-sm font-black">Local First</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Management</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                  <button className="w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 transition group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Clear Learning Data</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Reset stats and review queue</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Reset</span>
                  </button>
                  <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/10 transition text-rose-600 dark:text-rose-400">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Delete All Data</p>
                        <p className="text-[10px] font-bold uppercase opacity-60">Keep account, remove learning records</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Permanent</span>
                  </button>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Documents</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                  <button className="w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Privacy Policy</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Data handling and deletion policy</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  </button>
                  <button className="w-full px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">About Sekaishi-Anki</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Version, roadmap, credits</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                  <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-850 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Help Center</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">FAQ and support contact</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Developer</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a href="https://x.com/" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-300 hover:text-sky-500 hover:border-sky-500/30 transition-all shadow-sm flex items-center gap-3">
                    <AtSign className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Twitter</span>
                  </a>
                  <a href="https://github.com/" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-900/30 dark:hover:border-white/30 transition-all shadow-sm flex items-center gap-3">
                    <LinkIcon className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">GitHub</span>
                  </a>
                  <a href="https://sekaishi-anki.example.com" target="_blank" rel="noreferrer" className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-300 hover:text-amber-500 hover:border-amber-500/30 transition-all shadow-sm flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Website</span>
                  </a>
                </div>
              </section>
              
              <div className="text-center pt-4">
                <p className="text-[10px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-[0.2em]">Version 0.2.1-Alpha</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-2 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${activeTab === "quiz" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:text-zinc-500"}`}
          >
            <PlayCircle className={`w-6 h-6 transition-transform ${activeTab === "quiz" ? "scale-110" : ""}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Learn</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("stats");
              setStatsView("summary");
            }}
            className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${activeTab === "stats" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:text-zinc-500"}`}
          >
            <BarChart3 className={`w-6 h-6 transition-transform ${activeTab === "stats" ? "scale-110" : ""}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("submit")}
            className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${activeTab === "submit" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:text-zinc-500"}`}
          >
            <PlusSquare className={`w-6 h-6 transition-transform ${activeTab === "submit" ? "scale-110" : ""}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Post</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${activeTab === "settings" ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:text-zinc-500"}`}
          >
            <SettingsIcon className={`w-6 h-6 transition-transform ${activeTab === "settings" ? "scale-110" : ""}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
