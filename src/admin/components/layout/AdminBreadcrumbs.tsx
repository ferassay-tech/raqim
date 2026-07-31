import { Link, useLocation } from "react-router-dom";
import { ADMIN_SEGMENT_LABELS } from "@/admin/nav";
import { IconChevronStart } from "@/admin/icons";

/** Builds a breadcrumb trail from the current URL, always anchored at Dashboard. */
export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean).filter((s) => s !== "admin");

  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return (
      <p className="px-4 py-4 text-sm text-ink-soft sm:px-6 lg:px-8">لوحة التحكم</p>
    );
  }

  let path = "/admin";
  const crumbs = segments.map((segment, i) => {
    path += `/${segment}`;
    const isLast = i === segments.length - 1;
    const label = ADMIN_SEGMENT_LABELS[segment] ?? decodeURIComponent(segment);
    return { path, label, isLast };
  });

  return (
    <nav aria-label="مسار التصفح" className="px-4 py-4 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link to="/admin/dashboard" className="text-ink-soft transition-colors hover:text-ink">
            لوحة التحكم
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.path} className="flex items-center gap-1.5">
            <IconChevronStart className="h-3.5 w-3.5 text-ink-faint" />
            {crumb.isLast ? (
              <span className="text-ink">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="text-ink-soft transition-colors hover:text-ink">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
