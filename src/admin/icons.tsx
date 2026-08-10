import type { FC } from "react";

/**
 * Self-contained admin icon set — hand-rolled SVGs, deliberately not shared
 * with src/components/checkout/icons.tsx, so the admin subsystem has zero
 * import coupling to the public site (per the isolation requirement).
 * Same stroke-based visual language (24x24, currentColor, rounded caps).
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  "aria-hidden": true as const,
};

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconGrid: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...strokeProps} />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...strokeProps} />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...strokeProps} />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...strokeProps} />
  </svg>
);

export const IconChartLine: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M4 19V5M4 19h16" {...strokeProps} />
    <path d="M7.5 15.5 11 11l3 2.5 4-5.5" {...strokeProps} />
  </svg>
);

export const IconBook: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M5 5.5c0-1.1.9-2 2-2h9.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7a2 2 0 0 0-2 2Z"
      {...strokeProps}
    />
    <path d="M5 5.5v13a2 2 0 0 0 2 2h10.5" {...strokeProps} />
  </svg>
);

export const IconTag: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M11.5 4.5H7A2.5 2.5 0 0 0 4.5 7v4.5a2 2 0 0 0 .59 1.41l6.5 6.5a2 2 0 0 0 2.82 0l4.59-4.59a2 2 0 0 0 0-2.82l-6.5-6.5a2 2 0 0 0-1.41-.59Z"
      {...strokeProps}
    />
    <circle cx="9" cy="9" r="1.35" {...strokeProps} />
  </svg>
);

export const IconBag: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M6 8h12l-.9 11.1a2 2 0 0 1-2 1.9H8.9a2 2 0 0 1-2-1.9Z" {...strokeProps} />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" {...strokeProps} />
  </svg>
);

export const IconTicket: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.2a1.6 1.6 0 0 0 0 3.1V15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.7a1.6 1.6 0 0 0 0-3.1Z"
      {...strokeProps}
    />
    <path d="M14.5 7.5v9" strokeDasharray="1.6 2.2" {...strokeProps} />
  </svg>
);

export const IconUsers: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="8.5" r="3" {...strokeProps} />
    <path d="M3.5 19c.6-3 2.6-4.7 5.5-4.7s4.9 1.7 5.5 4.7" {...strokeProps} />
    <path d="M15.5 6a3 3 0 0 1 0 5.8" {...strokeProps} />
    <path d="M15.2 14.5c2.5.3 4.1 1.9 4.6 4.5" {...strokeProps} />
  </svg>
);

export const IconDocument: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" {...strokeProps} />
    <path d="M14 3.5V8h4.5" {...strokeProps} />
    <path d="M9 12.5h6M9 15.5h6M9 9.5h2" {...strokeProps} />
  </svg>
);

export const IconImage: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" {...strokeProps} />
    <circle cx="8.5" cy="9.5" r="1.5" {...strokeProps} />
    <path d="M20.5 15.5 15 11l-4 4-2.5-2L4 17.5" {...strokeProps} />
  </svg>
);

export const IconMail: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" {...strokeProps} />
    <path d="M4 6.5 12 13l8-6.5" {...strokeProps} />
  </svg>
);

export const IconGear: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" {...strokeProps} />
    <path
      d="M12 3.8v2M12 18.2v2M20.2 12h-2M5.8 12h-2M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4M17.5 17.5l-1.4-1.4M7.9 7.9 6.5 6.5"
      {...strokeProps}
    />
  </svg>
);

export const IconUser: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="8.3" r="3.3" {...strokeProps} />
    <path d="M5 19c.8-3.4 3.1-5.2 7-5.2s6.2 1.8 7 5.2" {...strokeProps} />
  </svg>
);

export const IconSearch: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="10.5" cy="10.5" r="6" {...strokeProps} />
    <path d="M15.2 15.2 20 20" {...strokeProps} />
  </svg>
);

export const IconBell: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M6 10.5a6 6 0 0 1 12 0c0 3.4.9 5 1.6 5.8H4.4C5.1 15.5 6 13.9 6 10.5Z"
      {...strokeProps}
    />
    <path d="M9.7 19.5a2.4 2.4 0 0 0 4.6 0" {...strokeProps} />
  </svg>
);

export const IconPlus: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" {...strokeProps} />
  </svg>
);

export const IconChevronDown: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M6 9.5 12 15l6-5.5" {...strokeProps} />
  </svg>
);

export const IconChevronStart: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M15 5.5 8.5 12l6.5 6.5" {...strokeProps} />
  </svg>
);

export const IconMenu: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" {...strokeProps} />
  </svg>
);

export const IconClose: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6 6 18" {...strokeProps} />
  </svg>
);

export const IconTrendUp: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M4 16 10 10l4 4 6-6.5" {...strokeProps} />
    <path d="M14.5 7h5.5v5.5" {...strokeProps} />
  </svg>
);

export const IconTrendDown: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M4 8 10 14l4-4 6 6.5" {...strokeProps} />
    <path d="M14.5 17h5.5v-5.5" {...strokeProps} />
  </svg>
);

export const IconDots: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconEye: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...strokeProps} />
    <circle cx="12" cy="12" r="2.8" {...strokeProps} />
  </svg>
);

export const IconPencil: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M14.3 5.3 18.7 9.7 8 20.4H3.6V16Z"
      {...strokeProps}
    />
    <path d="M12.6 7 17 11.4" {...strokeProps} />
  </svg>
);

export const IconCopy: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="9" y="9" width="11" height="11" rx="2" {...strokeProps} />
    <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" {...strokeProps} />
  </svg>
);

export const IconArchive: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="4.5" width="17" height="4.5" rx="1.3" {...strokeProps} />
    <path d="M5 9v8.5A2 2 0 0 0 7 19.5h10a2 2 0 0 0 2-2V9" {...strokeProps} />
    <path d="M10 13.2h4" {...strokeProps} />
  </svg>
);

export const IconTrash: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M4.5 6.5h15" {...strokeProps} />
    <path d="M9 6.5V4.8a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 4.8v1.7" {...strokeProps} />
    <path d="M6.5 6.5 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12.5" {...strokeProps} />
    <path d="M10.3 10.5v6M13.7 10.5v6" {...strokeProps} />
  </svg>
);

export const IconUpload: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M12 15.5V4M8 8l4-4 4 4" {...strokeProps} />
    <path d="M4.5 15.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5" {...strokeProps} />
  </svg>
);

export const IconCheck: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M5 13l4 4L19 7" {...strokeProps} />
  </svg>
);

export const IconAlertTriangle: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M12 4.5 21 19.5H3Z"
      {...strokeProps}
    />
    <path d="M12 10v4" {...strokeProps} />
    <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconWallet: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M4 7.5A2.5 2.5 0 0 1 6.5 5h10A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 4 16.5Z"
      {...strokeProps}
    />
    <path d="M4 10h14.5a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H16a2 2 0 1 1 0-4h2.5" {...strokeProps} />
  </svg>
);

export const IconRefresh: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3M19.5 12a7.5 7.5 0 0 1-12.8 5.3"
      {...strokeProps}
    />
    <path d="M17.3 3.5v3.5h-3.5M6.7 20.5V17H10.2" {...strokeProps} />
  </svg>
);

export const IconBroadcast: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4M15.2 8.8a4.5 4.5 0 0 1 0 6.4" {...strokeProps} />
    <path d="M5.8 18.2a8.5 8.5 0 0 1 0-12.4M18.2 5.8a8.5 8.5 0 0 1 0 12.4" {...strokeProps} />
  </svg>
);

export const IconArrowUp: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M12 19V5M6 10.5 12 5l6 5.5" {...strokeProps} />
  </svg>
);

export const IconArrowDown: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M6 13.5 12 19l6-5.5" {...strokeProps} />
  </svg>
);

export const IconPanelCollapse: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" {...strokeProps} />
    <path d="M14.5 4.5v15" {...strokeProps} />
    <path d="M11.2 10 9 12l2.2 2" {...strokeProps} />
  </svg>
);

export const IconPalette: FC<IconProps> = ({ className }) => (
  <svg {...base} className={className}>
    <path
      d="M12 3.5c-4.7 0-8.5 3.6-8.5 8s3.4 7 6.5 7c1 0 1.5-.5 1.5-1.3 0-.4-.2-.7-.4-1a1.4 1.4 0 0 1-.3-.9c0-.7.6-1.3 1.3-1.3H14c3 0 6.5-2 6.5-6 0-2.5-3.7-4.5-8.5-4.5Z"
      {...strokeProps}
    />
    <circle cx="7.7" cy="10.2" r="1" fill="currentColor" stroke="none" />
    <circle cx="10.8" cy="7.3" r="1" fill="currentColor" stroke="none" />
    <circle cx="14.9" cy="7.6" r="1" fill="currentColor" stroke="none" />
    <circle cx="17.3" cy="10.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);
