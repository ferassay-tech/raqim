import type { CommunicationThemeTokens } from "../types/theme";

/**
 * Named theme-token presets a new Communication Theme can start from.
 * Registers presets only — the live/editable theme itself (Phase 2's
 * CommunicationTheme) is a separate, later-milestone Context, since reading
 * the app's real brand settings requires the useSettings() hook, which a
 * static registry module cannot call. "default" below is a placeholder in
 * the app's general palette, not a live copy of Settings → Brand — actually
 * seeding a new theme from real brand values is future work.
 */
const DEFAULT_TOKENS: CommunicationThemeTokens = {
  colors: {
    background: "#FBF7F1",
    surface: "#FFFFFF",
    text: "#2C2420",
    textMuted: "#7A6F65",
    accent: "#C9A24B",
    accentDeep: "#A9822F",
    border: "#E7DFD3",
    danger: "#B3462C",
  },
  typography: {
    headingFont: "serif",
    bodyFont: "sans-serif",
    baseFontSize: 15,
    headingWeight: 600,
  },
  spacing: { scale: [4, 8, 12, 16, 24, 32, 48] },
  radius: { sm: 6, md: 10, lg: 16 },
  buttons: { defaultColor: "#2C2420", textColor: "#FBF7F1", radius: 999 },
};

const THEME_PRESET_REGISTRY = new Map<string, CommunicationThemeTokens>([["default", DEFAULT_TOKENS]]);

export function listThemePresets(): string[] {
  return Array.from(THEME_PRESET_REGISTRY.keys());
}

export function getThemePreset(id: string): CommunicationThemeTokens | undefined {
  return THEME_PRESET_REGISTRY.get(id);
}

export function registerThemePreset(id: string, tokens: CommunicationThemeTokens): void {
  THEME_PRESET_REGISTRY.set(id, tokens);
}
