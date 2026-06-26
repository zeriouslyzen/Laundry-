export const theme = {
  brand: {
    name: "North Coast Laundry",
    shortName: "NCL",
    tagline: "Trusted pickup, wash & delivery across Humboldt County.",
  },
  colors: {
    fog: "#F8FAFC",
    mist: "#EEF4FA",
    foam: "#D6E6F5",
    sand: "#F0EDE8",
    charcoal: "#1A2B3C",
    slate: "#4A6278",
    ocean: "#2E5F8A",
    oceanLight: "#4A8BB8",
    oceanDark: "#1E4466",
    sky: "#7EB8E0",
    driftwood: "#8B9AAB",
    white: "#FFFFFF",
    error: "#C45C5C",
  },
  fonts: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    display: "var(--font-display), Georgia, serif",
    mono: "var(--font-geist-mono), monospace",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
} as const;

export type Theme = typeof theme;
