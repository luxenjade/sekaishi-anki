import {
  ArrowRight,
  BarChart3,
  Layers,
  RotateCcw,
  Shuffle,
  Tags,
  Users,
} from "lucide-react";
import { SiteShell } from "../site/SiteShell";

const APP_PATH = "/app";

const FEATURES: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}[] = [
  {
    icon: Shuffle,
    title: "出来事と年号を双方向で",
    body: "「出来事から年号」を数字で答える記述式と、「年号から出来事」を選ぶ4択式の2モード。一方向だけの暗記では抜けやすい対応を、両側から固めます。",
  },
  {
    icon: Layers,
    title: "範囲を選んで集中",
    body: "章ごと、または時代区分ごとに出題範囲を絞れます。出題数は5・10・20問か全問から選べます。",
  },
  {
    icon: Tags,
    title: "背景まで一緒に確認",
    body: "各問題に章・テーマ・国や地域のタグ・補足説明を用意。回答のあとに、その出来事がどの流れの中にあるかを確認できます。",
  },
  {
    icon: RotateCcw,
    title: "間違いは自動で復習リストへ",
    body: "間違えた問題は復習リストに入り、あとでまとめて解き直せます。正解すればリストから外れます。",
  },
  {
    icon: BarChart3,
    title: "成績が見える",
    body: "章ごとの正答率、連続学習日数、ランクを確認できます。どこが弱いかが一目で分かります。",
  },
  {
    icon: Users,
    title: "問題は育てていく",
    body: "年と出来事名だけで問題を提出できます。管理者が確認して分類を付け、承認されると全体の出題範囲に加わります。",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "アカウントを作る",
    body: "メールアドレスで登録すると、復習リストや成績がクラウドに保存されます。",
  },
  {
    title: "モードと範囲を選ぶ",
    body: "記述式か4択式か、章か時代区分か、問題数はいくつか。1画面で決められます。",
  },
  {
    title: "解いて、復習する",
    body: "解答のたびに正誤と補足説明が出ます。間違えた問題は、あとで復習リストから解き直せます。",
  },
];

export function Landing() {
  return (
    <SiteShell>
        {/* ヒーロー */}
        <section className="max-w-5xl mx-auto px-4 pt-14 pb-16 sm:pt-20 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-block px-3 py-1 rounded-full border-[1.5px] border-qz-accent bg-qz-accent-light text-xs font-bold tracking-wide text-qz-accent-text">
              世界史の年号暗記アプリ
            </p>
            <h1 className="text-[clamp(2rem,6vw,3rem)] font-bold leading-tight tracking-tight">
              出来事と年号を、
              <br />
              双方向で覚える。
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-qz-sub max-w-xl">
              「フランス革命は何年？」にも「1789年は何の年？」にも答えられるように。
              記述式と4択式のクイズで、世界史の重要な出来事を年号と結びつけます。
              間違えた問題は自動で復習リストに入ります。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={APP_PATH}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-qz-md active:scale-[0.98] transition"
              >
                アプリを開く
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-qz-sm border border-qz-border text-qz-sub font-semibold hover:border-qz-accent hover:text-qz-text transition"
              >
                特長を見る
              </a>
            </div>
          </div>

          <QuizPreview />
        </section>

        {/* 特長 */}
        <section id="features" className="border-t border-qz-border bg-qz-surface">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <SectionTitle eyebrow="Features" title="覚えるための、6つの仕組み" />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="p-5 rounded-qz-md border border-qz-border bg-qz-surface2"
                >
                  <div className="w-10 h-10 rounded-qz-sm bg-qz-accent-light border border-qz-accent flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-qz-accent-text" />
                  </div>
                  <h3 className="font-bold mb-1.5">{title}</h3>
                  <p className="text-sm leading-relaxed text-qz-sub">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 使い方 */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <SectionTitle eyebrow="How it works" title="使い方は3ステップ" />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="p-5 rounded-qz-md border border-qz-border bg-qz-surface"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-qz-accent text-qz-ink text-sm font-bold mb-3">
                  {i + 1}
                </span>
                <h3 className="font-bold mb-1.5">{step.title}</h3>
                <p className="text-sm leading-relaxed text-qz-sub">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 p-4 rounded-qz-md border border-qz-border bg-qz-surface2 text-sm leading-relaxed text-qz-sub">
            <strong className="text-qz-text">紀元前の年も入力しやすく。</strong>{" "}
            スマホではテンキーが開き、「西暦 / 紀元前」を切り替えるだけで答えられます。PC
            では、回答後に Enter キーで次の問題へ進めます。
          </div>
        </section>

        {/* 締めの呼びかけ */}
        <section className="border-t border-qz-border bg-qz-surface">
          <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              まずは10問、解いてみよう。
            </h2>
            <p className="text-qz-sub">
              アカウントを作れば、復習リストと成績がそのまま残ります。
            </p>
            <a
              href={APP_PATH}
              className="inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold hover:opacity-90 hover:-translate-y-px hover:shadow-qz-md active:scale-[0.98] transition"
            >
              アプリを開く
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </SiteShell>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-qz-accent-text">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

/** 出題画面のイメージ（装飾用。操作はできない） */
function QuizPreview() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto bg-qz-surface border border-qz-border rounded-qz-lg shadow-qz-md p-6 space-y-5 select-none"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[5px] bg-qz-border rounded-[3px] overflow-hidden">
          <div className="h-full w-[30%] bg-qz-accent rounded-[3px]" />
        </div>
        <span className="text-xs font-semibold text-qz-sub tabular-nums">3 / 10</span>
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-2xl font-bold leading-snug">フランス革命の勃発</h3>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="px-3 py-[3px] border-[1.5px] border-qz-accent rounded-full bg-qz-accent-light text-xs font-bold text-qz-accent-text">
            近代ヨーロッパ
          </span>
          <span className="px-2 py-[2px] rounded-qz-sm border border-qz-border bg-qz-surface2 text-[11px] font-semibold text-qz-sub">
            政治・戦争
          </span>
          <span className="px-2 py-[2px] rounded-qz-sm border border-qz-border bg-qz-surface2 text-[11px] font-semibold text-qz-sub">
            #フランス
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="grid grid-cols-2 gap-2 w-full max-w-[220px]">
          <span className="py-1.5 text-center rounded-qz-sm border-[1.5px] border-qz-accent bg-qz-accent-light ring-[3px] ring-qz-accent-ring text-sm font-medium">
            西暦
          </span>
          <span className="py-1.5 text-center rounded-qz-sm border-[1.5px] border-qz-border bg-qz-surface2 text-sm font-medium text-qz-sub">
            紀元前
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-[150px] py-3 text-center rounded-qz-md border-2 border-qz-accent ring-[3px] ring-qz-accent-ring text-[1.4rem] font-bold tabular-nums">
            1789
          </span>
          <span className="text-lg font-bold text-qz-sub">年</span>
        </div>
        <span className="px-10 py-3 rounded-qz-sm bg-qz-accent text-qz-ink font-semibold">
          確定
        </span>
      </div>
    </div>
  );
}
