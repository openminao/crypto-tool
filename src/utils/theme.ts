import { DefaultTheme } from "expo-router";

// Retro pixel-art terminal color palette
export const theme = {
  // Backgrounds
  bg: "#080707",            // Main deep dark background
  bgPanel: "#0d1a0f",       // Card / panel background
  bgInset: "#060e08",       // Input field / code block background
  bgHighlight: "#102214",   // Hover / selected item background

  // Text
  textPrimary: "#38fe38",   // Bright pixel-green — headlines, values
  textSecondary: "#9bbc0f", // Game Boy yellow-green — labels, sub-text
  textMuted: "#4a6e35",     // Muted dim green — hints, tips
  textDark: "#1e3a1e",      // Very dark, used for inverted text on highlight

  // Borders
  border: "#38fe38",        // Bright green border
  borderMuted: "#2a5c2a",   // Muted panel borders

  // Accents
  accentBlue: "#0aff9d",    // Teal for active toggles
  accentRed: "#ff4444",     // Error / reset
  accentYellow: "#d4e600",  // Template buttons, quick actions

  // Pixel glow (box shadow / text shadow color)
  glow: "rgba(56, 254, 56, 0.35)",
  glowStrong: "rgba(56, 254, 56, 0.6)",
};

export const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent', 
  },
};


// Retro font family — monospace only
export const fontMono = "\"Courier New\", Courier, monospace";
