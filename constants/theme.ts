/**
 * Design system tokens and colors for PlayerNation Match Reporter.
 * warm, crazy, fresh football pitch style.
 */

export const Colors = {
  light: {
    text: '#111311',
    textSecondary: '#5A625A',
    background: '#F4F6F4',
    tint: '#FF7A00',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#FF7A00',
    primary: '#FF7A00',      // Electric Amber
    secondary: '#A7FF00',    // Electric Neon Lime
    accent: '#FF7A00',       // Amber accent
    card: '#FFFFFF',
    border: '#E2E8E2',
    success: '#00D154',
    error: '#FF3B30',
    warning: '#FFCC00',
    gold: '#FFD700',         // Warm Gold
    pitchGreen: '#ADFF2F',
    pitchDark: '#090A09',
    glass: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(9, 10, 9, 0.1)',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#090A09',   // Slate Pitch Charcoal
    tint: '#A7FF00',         // Electric Neon Lime tint in dark mode
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#A7FF00',
    primary: '#A7FF00',      // Electric Neon Lime
    secondary: '#FF7A00',    // Electric Amber
    accent: '#A7FF00',       // Lime accent
    card: '#111311',         // Dark Pitch Card
    border: '#222522',
    success: '#00D154',
    error: '#FF3549',
    warning: '#FFCC00',
    gold: '#FFD700',         // Warm Gold
    pitchGreen: '#A7FF00',
    pitchDark: '#090A09',
    glass: 'rgba(17, 19, 17, 0.75)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 38,
  },
};

export const Layout = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
};
