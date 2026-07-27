import { Link, useLocation } from "react-router-dom";
import { Helmet } from "../components/Helmet";

export default function NotFoundPage() {
  const location = useLocation();
  return (
    <div dir="rtl" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
      <Helmet
        title="٤٠٤ — الصفحة غير موجودة — رقيم"
        description="الصفحة التي تبحثين عنها غير موجودة أو تم نقلها."
        path={location.pathname}
        noindex
      />
      <span className="font-logotype text-6xl text-gold">٤٠٤</span>
      <h1 className="font-display text-3xl text-ink">هذه الصفحة غير موجودة</h1>
      <p className="max-w-md text-ink-soft">
        يبدو أن الصفحة التي تبحثين عنها قد انتقلت أو لم تعد متوفرة.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full border border-gold px-6 py-3 text-sm text-ink transition-colors hover:bg-gold hover:text-ivory"
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}

