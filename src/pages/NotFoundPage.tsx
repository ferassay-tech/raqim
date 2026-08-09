import { Link, useLocation } from "react-router-dom";
import { Helmet } from "../components/Helmet";
import { useLanguage } from "../context/LanguageContext";

export default function NotFoundPage() {
  const location = useLocation();
  const { t, dir, localizePath } = useLanguage();
  return (
    <div dir={dir} className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
      <Helmet
        title={t("notFound.seo.title")}
        description={t("notFound.seo.description")}
        path={location.pathname}
        noindex
      />
      <span className="font-logotype text-6xl text-gold">{t("notFound.code")}</span>
      <h1 className="font-display text-3xl text-ink">{t("notFound.title")}</h1>
      <p className="max-w-md text-ink-soft">{t("notFound.body")}</p>
      <Link
        to={localizePath("/")}
        className="mt-2 rounded-full border border-gold px-6 py-3 text-sm text-ink transition-colors hover:bg-gold hover:text-ivory"
      >
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}

