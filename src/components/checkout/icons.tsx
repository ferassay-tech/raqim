import React from "react";

export const IconEtsy: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M9 8h5.5M9 8v8m0-8v3.5m0 0h4M9 11.5V16m0 0h5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconVodafone: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M14.5 15.5c-3 0-6-3-6-6.5 0-1.4.6-2.3 1.3-2.3.5 0 .8.4 1 1 .2.5.3.8 0 1.3-.2.4-.5.5-.4.9.2 1.6 1.8 3.1 3.4 3.3.4 0 .5-.3.9-.4.5-.3.8-.2 1.3 0 .6.2 1 .5 1 1 0 .7-1 1.7-2.5 1.7Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconInstapay: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M13 7 8 13h3.2l-.7 4L16 11h-3.2l.7-4Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const IconBank: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M4 10.5 12 5l8 5.5M5 10.5h14M6 10.5V18M10 10.5V18M14 10.5V18M18 10.5V18M4 19h16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconCopy: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const IconCheck: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconArrowLeft: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path
      d="M19 12H5m0 0 6-6m-6 6 6 6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconSuccess: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="var(--color-beige)" stroke="var(--color-gold)" strokeWidth="1.5" />
    <path
      d="M32 51l12 12 24-26"
      fill="none"
      stroke="var(--color-gold-deep)"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const iconMap = {
  etsy: IconEtsy,
  vodafone: IconVodafone,
  bank: IconBank,
  instapay: IconInstapay,
};