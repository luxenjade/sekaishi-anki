import { AboutPage } from "./features/site/AboutPage";
import { FaqPage } from "./features/site/FaqPage";
import { PrivacyPolicyPage } from "./features/site/PrivacyPolicyPage";

export type SitePageId = "about" | "faq" | "privacy-policy";

/** About / FAQ / プライバシーポリシー。main.tsx から遅延読み込みされる */
export default function SitePages({ page }: { page: SitePageId }) {
  switch (page) {
    case "about":
      return <AboutPage />;
    case "faq":
      return <FaqPage />;
    case "privacy-policy":
      return <PrivacyPolicyPage />;
  }
}
