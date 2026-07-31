/** Global design tokens every Template's content resolves style references
 * against at render time (a block's `settings` prefers `{ token: "colors.
 * accent" }` over a literal value) — the mechanism that makes template
 * styling inherit from one shared theme instead of duplicating it per
 * template. Values only; the resolver itself is a later milestone. */
export interface CommunicationThemeTokens {
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    accentDeep: string;
    border: string;
    danger: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
    headingWeight: number;
  };
  spacing: {
    scale: number[];
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  buttons: {
    defaultColor: string;
    textColor: string;
    radius: number;
  };
}

export interface CommunicationTheme {
  id: string;
  draft: CommunicationThemeTokens;
  publishedVersionId: string | null;
}
