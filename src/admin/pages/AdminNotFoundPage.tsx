import { Link } from "react-router-dom";
import { IconGrid } from "../icons";

export default function AdminNotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <span className="font-logotype text-6xl text-gold">٤٠٤</span>
      <div>
        <h1 className="font-display text-2xl text-ink">الصفحة غير موجودة</h1>
        <p className="mt-2 text-ink-soft">
          الصفحة التي تحاولين الوصول إليها غير موجودة داخل لوحة التحكم.
        </p>
      </div>
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
      >
        <IconGrid className="h-4 w-4" />
        العودة للوحة التحكم
      </Link>
    </div>
  );
}
