import { SITE } from "./siteInfo";

/** 文章ページ（About / プライバシーポリシー）の共通部品 */

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <article className="max-w-3xl mx-auto px-4 py-12 sm:py-16">{children}</article>;
}

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="pb-8 mb-8 border-b border-qz-border space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-qz-accent-text">
        {eyebrow}
      </p>
      <h1 className="text-[clamp(1.7rem,5vw,2.4rem)] font-bold leading-tight tracking-tight">
        {title}
      </h1>
      {lead && <p className="text-base leading-relaxed text-qz-sub">{lead}</p>}
    </header>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 pb-2 border-b border-qz-border text-xl font-bold tracking-tight">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-2 font-bold">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="my-3 leading-[1.9] text-qz-text/90">{children}</p>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="my-3 ml-5 list-disc space-y-1.5 leading-[1.9] text-qz-text/90 marker:text-qz-accent">
      {children}
    </ul>
  );
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="text-qz-accent-text underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  );
}

/** お問い合わせ先。siteInfo.contactUrl が未設定のときは準備中と表示する */
export function ContactLink() {
  if (!SITE.contactUrl) {
    return <span>運営者（{SITE.operator}）までご連絡ください（連絡先は準備中です）</span>;
  }
  const label = SITE.contactUrl.replace(/^mailto:/, "");
  return <A href={SITE.contactUrl}>{label}</A>;
}
