import { SiteShell } from "./SiteShell";
import { A, ContactLink, H2, P, PageContainer, PageHeader, Ul } from "./prose";
import { SITE } from "./siteInfo";
import { CHAPTERS } from "../../lib/taxonomy";

export function AboutPage() {
  return (
    <SiteShell title="このアプリについて">
      <PageContainer>
        <PageHeader
          eyebrow="About"
          title="このアプリについて"
          lead="世界史の出来事と年号を、双方向のクイズで覚えるためのWebアプリです。"
        />

        <H2>つくった理由</H2>
        <P>
          世界史の年号は、「フランス革命は1789年」と一方向に覚えるだけでは、
          「1789年に何があった？」と聞かれたときに出てきません。
          出来事から年号、年号から出来事のどちらでも答えられるように、
          両方向で繰り返し確認できる道具として作りました。
        </P>

        <H2>できること</H2>
        <Ul>
          <li>出来事を見て西暦を答える記述式、年号を見て出来事を選ぶ4択式の2モード</li>
          <li>章または時代区分で出題範囲を絞り込み</li>
          <li>回答後に、章・テーマ・国や地域のタグ・補足説明を確認</li>
          <li>間違えた問題を自動で復習リストに追加（正解すると外れます）</li>
          <li>章ごとの正答率、連続学習日数、ランクの表示</li>
          <li>問題の提出（管理者が確認して公開）</li>
        </Ul>

        <H2>問題データの考え方</H2>
        <H3Block title="収録する内容">
          世界史の学習で扱われる重要な出来事を、年と出来事名の組として収録しています。
          現在は人物の生没年ではなく、出来事を中心にしています。
        </H3Block>
        <H3Block title="王朝・国家の扱い">
          期間のあるもの（王朝や国家など）は、「成立」と「滅亡」をそれぞれ独立した出来事として出題します。
        </H3Block>
        <H3Block title="年号が分かれるもの">
          学説や教科書によって年号が異なる出来事があります。その場合は、採用している年を示したうえで、
          補足説明に注記します。
        </H3Block>
        <H3Block title="分類">
          すべての問題に、次の3つの分類を付けています。
        </H3Block>
        <Ul>
          <li>
            <strong>章</strong>（1問につき1つ）: {CHAPTERS.map((c) => c.label).join(" / ")}
          </li>
          <li>
            <strong>テーマ</strong>（1問につき1つ）: 政治・戦争、経済・社会、宗教、文化・科学
          </li>
          <li>
            <strong>タグ</strong>（0個以上）: フランス、日本、ロシアなどの国や地域
          </li>
        </Ul>

        <H2>問題が増える仕組み</H2>
        <P>
          アプリの「Post」から、年と出来事名を提出できます。提出された内容は、管理者が確認し、
          章・テーマ・タグを付けて承認すると、全員の出題範囲に加わります。
          内容によっては、承認されないこともあります。
        </P>
        <P>
          提出者に分類は求めません。分類を管理者が付けることで、問題ごとの分類をそろえています。
        </P>

        <H2>使っている技術</H2>
        <P>
          React と TypeScript で作り、認証とデータベースに Supabase、配信に Netlify を使っています。
          取り扱う情報の詳細は、<A href="/privacy-policy">プライバシーポリシー</A>
          をご覧ください。
        </P>

        <H2>運営者</H2>
        <P>
          {SITE.operator}（個人）が運営しています。
        </P>

        <H2>お問い合わせ</H2>
        <P>
          ご意見、問題の誤りのご指摘、不具合のご報告は、次の連絡先へお願いします。
        </P>
        <P>
          <ContactLink />
        </P>
        <P>
          よくある質問は、<A href="/faq">よくある質問</A>にまとめています。
        </P>
      </PageContainer>
    </SiteShell>
  );
}

/** 小見出し + 本文（段落）。About の短い項目用 */
function H3Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-4">
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="leading-[1.9] text-qz-text/90">{children}</p>
    </div>
  );
}
