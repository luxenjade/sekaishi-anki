import { ChevronRight } from "lucide-react";
import { SiteShell } from "./SiteShell";
import { A, ContactLink, PageContainer, PageHeader } from "./prose";
import { CHAPTERS } from "../../lib/taxonomy";

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

const FAQ_GROUPS: { title: string; items: FaqItem[] }[] = [
  {
    title: "はじめに",
    items: [
      {
        q: "無料で使えますか？",
        a: "はい。現在、すべての機能を無料で利用できます。",
      },
      {
        q: "アカウントは必要ですか？",
        a: "はい。復習リストや成績を保存するため、メールアドレスとパスワードでのアカウント登録が必要です。",
      },
      {
        q: "確認メールが届きません。",
        a: (
          <>
            迷惑メールフォルダに入っていないか、登録したメールアドレスに入力ミスがないかを確認してください。
            メールが届くまで数分かかることもあります。それでも届かない場合は、お問い合わせください。
          </>
        ),
      },
      {
        q: "スマホでも使えますか？",
        a: "はい。ブラウザで動作し、スマホ・タブレット・PCのどれでも使えます。記述式では、スマホでは数字用のキーボードが開きます。",
      },
    ],
  },
  {
    title: "クイズの使い方",
    items: [
      {
        q: "紀元前の年はどう入力しますか？",
        a: "入力欄の上にある「西暦 / 紀元前」を切り替えて、数字だけを入力します。たとえば前221年なら、「紀元前」を選んで 221 と入力します。",
      },
      {
        q: "出題される範囲を教えてください。",
        a: (
          <>
            「出来事 → 年号」では、次の12章から範囲を選べます。
            <span className="block mt-2 text-qz-sub">
              {CHAPTERS.map((c) => c.label).join(" / ")}
            </span>
            <span className="block mt-2">
              「年号 → 出来事」では、章ではなく時代区分（紀元前、1〜1000年、…）で範囲を選びます。
            </span>
          </>
        ),
      },
      {
        q: "間違えた問題はどうなりますか？",
        a: "復習リストに追加されます。復習リストはStatsタブで確認でき、まとめて、または1問ずつ解き直せます。その問題に次に正解すると、リストから外れます。",
      },
      {
        q: "キーボードで操作できますか？",
        a: "はい。回答後は Enter キーで次の問題へ進めます。4択では、数字キーの 1〜4 で選択肢を選べます。",
      },
    ],
  },
  {
    title: "問題について",
    items: [
      {
        q: "年号が手元の教科書や参考書と違います。",
        a: (
          <>
            年号には、学説や教科書によって異なるものがあります（たとえば、百年戦争の開始を
            1337年とする場合と1339年とする場合）。採用している年は問題ごとに決めてあり、
            判断が分かれるものは補足説明に注記しています。明らかな誤りを見つけたときは、
            お問い合わせください。
          </>
        ),
      },
      {
        q: "問題を提出するには？",
        a: "「Post」タブで、年と出来事名を入力して提出します。説明やWikipediaのURLは任意です。章やタグなどの分類は入力不要で、管理者が確認して付けます。承認されると全員の出題範囲に加わりますが、内容によっては承認されないこともあります。",
      },
      {
        q: "提出した問題に、自分の名前は表示されますか？",
        a: "いいえ。問題の出題画面に、提出者のユーザー名やメールアドレスが表示されることはありません。",
      },
      {
        q: "同じ年の問題を提出できますか？",
        a: "できます。同じ年に別の出来事があるのは普通のことなので、年だけでは弾きません。ただし、提出フォームに同じ年の既存の問題が表示されるので、同じ内容でないか確認してください。年と出来事名が完全に一致するものは登録できません。",
      },
    ],
  },
  {
    title: "データとアカウント",
    items: [
      {
        q: "パスワードを忘れました。",
        a: (
          <>
            ログイン画面の「パスワードを忘れた方はこちら」を押し、登録したメールアドレスを入力してください。
            再設定用のリンクが届くので、リンクを開いて新しいパスワードを入力します。
            リンクには有効期限があり、期限が切れていたり、すでに使ったりした場合は、もう一度メールを送信してください。
            メールが届かないときは、迷惑メールフォルダを確認してください。
          </>
        ),
      },
      {
        q: "学習データを消したい。",
        a: "設定の「Clear Learning Data」で、成績・復習リスト・集計を消去できます。アカウントや提出履歴は残ります。",
      },
      {
        q: "アカウントを削除したい。",
        a: (
          <>
            設定の「Delete Account」から削除できます。アカウント情報、学習データ、審査待ちの提出が削除されます。
            詳しくは<A href="/privacy-policy">プライバシーポリシー</A>をご覧ください。
          </>
        ),
      },
    ],
  },
];

export function FaqPage() {
  return (
    <SiteShell title="よくある質問">
      <PageContainer>
        <PageHeader
          eyebrow="FAQ"
          title="よくある質問"
          lead="使い方やデータの扱いについて、よくいただく質問をまとめています。"
        />

        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-qz-sub">
                {group.title}
              </h2>
              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-qz-md border border-qz-border bg-qz-surface open:border-qz-accent transition-colors"
                  >
                    <summary className="flex items-start gap-3 cursor-pointer list-none px-4 py-3.5 font-semibold [&::-webkit-details-marker]:hidden">
                      <ChevronRight
                        aria-hidden
                        className="mt-1 w-4 h-4 shrink-0 text-qz-accent-text transition-transform group-open:rotate-90"
                      />
                      <span className="leading-snug">{item.q}</span>
                    </summary>
                    <div className="pl-11 pr-4 pb-4 text-sm leading-[1.9] text-qz-text/90">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-qz-md border border-qz-border bg-qz-surface2">
          <p className="font-bold mb-1">解決しない場合</p>
          <p className="text-sm leading-relaxed text-qz-sub">
            ここにない質問や、不具合・問題の誤りのご報告は、こちらへお願いします。
          </p>
          <p className="mt-2 text-sm">
            <ContactLink />
          </p>
        </div>
      </PageContainer>
    </SiteShell>
  );
}
