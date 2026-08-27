import { IconAlertTriangle, IconRefresh } from "@/admin/icons";

interface LoadErrorBannerProps {
  message: string;
  onRetry: () => void;
}

/**
 * Shown when a module's initial Supabase fetch fails — previously these
 * failures only reached console.error, so the page silently kept rendering
 * whatever placeholder data it started with, with no indication anything
 * was wrong. Same visual language as the existing success/error flash
 * banners (SettingsPage, BooksListPage) — danger border/background, no new
 * pattern introduced.
 */
export function LoadErrorBanner({ message, onRetry }: LoadErrorBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      <span className="flex items-center gap-2.5">
        <IconAlertTriangle className="h-4 w-4 shrink-0" />
        {message}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-danger/30 px-3.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
      >
        <IconRefresh className="h-3.5 w-3.5" />
        إعادة المحاولة
      </button>
    </div>
  );
}
