import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** "admin" shows dashboard-specific copy — same component, no second
   * implementation, matching how the rest of this codebase handles a single
   * shared mechanism with per-context copy (e.g. Helmet's noindex variants). */
  variant?: "public" | "admin";
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const COPY = {
  public: {
    ar: {
      title: "حدث خطأ غير متوقع",
      body: "نعتذر عن الإزعاج. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.",
      action: "تحديث الصفحة",
    },
    en: {
      title: "Something went wrong",
      body: "We're sorry for the inconvenience. Please refresh the page or try again later.",
      action: "Refresh page",
    },
  },
  admin: {
    ar: {
      title: "حدث خطأ في لوحة التحكم",
      body: "نعتذر عن الإزعاج. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.",
      action: "تحديث الصفحة",
    },
    en: {
      title: "Something went wrong in the dashboard",
      body: "We're sorry for the inconvenience. Please refresh the page or try again later.",
      action: "Refresh page",
    },
  },
} as const;

/**
 * Top-level safety net. Without this, an uncaught render error anywhere in
 * the tree unmounts the entire app — confirmed live during the Brand Studio
 * phase, when a schema-drift bug blanked the whole site (sidebar included)
 * because nothing caught it.
 *
 * Must be a class component — React has no hook equivalent for
 * getDerivedStateFromError/componentDidCatch. Reads
 * document.documentElement.lang/dir directly (already kept in sync by
 * LanguageContext's own effect) instead of useLanguage(), so the fallback
 * renders correctly even though a class component can't consume a context
 * hook, and even if the boundary needs to sit above/outside LanguageProvider.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const lang = document.documentElement.lang === "en" ? "en" : "ar";
    const dir = document.documentElement.dir === "ltr" ? "ltr" : "rtl";
    const copy = COPY[this.props.variant ?? "public"][lang];

    return (
      <div dir={dir} className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
        <h1 className="font-display text-3xl text-ink">{copy.title}</h1>
        <p className="max-w-md text-ink-soft">{copy.body}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full border border-gold px-6 py-3 text-sm text-ink transition-colors hover:bg-gold hover:text-ivory"
        >
          {copy.action}
        </button>
      </div>
    );
  }
}
