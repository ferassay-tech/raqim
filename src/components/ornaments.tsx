/**
 * Marafi — inline SVG ornament library.
 * Fine gold arabesque line-work used for dividers, corner marks, and the
 * brand monogram. All strokes use currentColor so callers set the gold tone
 * via `text-gold` / `text-ink` etc. Kept as data, not images, per the "no
 * more concept generation" directive — these are structural chrome, not art.
 */

export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 12H90" stroke="currentColor" strokeWidth="1" />
      <path d="M150 12H240" stroke="currentColor" strokeWidth="1" />
      <path
        d="M120 4c4 0 6 3 6 8s-2 8-6 8-6-3-6-8 2-8 6-8Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="105" cy="12" r="2" fill="currentColor" />
      <circle cx="135" cy="12" r="2" fill="currentColor" />
      <path d="M96 12h6M138 12h6" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 4c20 0 30 2 40 12s12 20 12 40"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M4 20c14 0 22 3 29 10s10 15 10 29"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.6"
      />
      <circle cx="4" cy="4" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function StarMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 2l3.2 9.8L29 15l-9.8 3.2L16 28l-3.2-9.8L3 15l9.8-3.2L16 2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 0C6 6 0 15 0 25c0 12 8 20 18 20 8 0 14-6 14-14 0-7-5-12-11-12-2 0-3 0-4 1C18 12 22 4 30 0l-16 0Z"
        fill="currentColor"
      />
      <path
        d="M48 0c-8 6-14 15-14 25 0 12 8 20 18 20 8 0 14-6 14-14 0-7-5-12-11-12-2 0-3 0-4 1C52 12 56 4 64 0l-16 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ArchFrame({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 260V90C8 40 50 8 100 8s92 32 92 82v170"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M22 260V92c0-42 34-70 78-70s78 28 78 70v168"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.5"
      />
    </svg>
  );
}

/** 8-glyph line-icon set — book, quill, crescent, journal, heart, open-hands, star, leaf. */
export function IconBook({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 7c-3-2-7-3-11-2v18c4-1 8 0 11 2 3-2 7-3 11-2V5c-4-1-8 0-11 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 7v18" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconQuill({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M27 5c-9 1-17 8-19 17l-3 5 6-2C20 23 27 15 27 5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 20 5 27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconCrescent({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 6a11 11 0 1 0 0 20 13 13 0 0 1 0-20Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconJournal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 4v24" stroke="currentColor" strokeWidth="1.4" />
      <path d="M15 11h7M15 16h7M15 21h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 27S4 19 4 11.5C4 7 7.5 4 11.5 4c2 0 3.7.8 4.5 2.4C16.8 4.8 18.5 4 20.5 4 24.5 4 28 7 28 11.5 28 19 16 27 16 27Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconOpenHands({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 26c0-6 2-10 4-14M26 26c0-6-2-10-4-14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10 12c0-3 1-6 2-8M22 12c0-3-1-6-2-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M16 5v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconStar({ className = "" }: { className?: string }) {
  return <StarMotif className={className} />;
}

export function IconLeaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 26C6 14 14 6 26 6c0 12-8 20-20 20Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M6 26 22 10" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

