// Sketchbook Neo-Brutalist Theme Tokens
// Aligned with the Web App Design System in src/index.css

export const colors = {
  // Base Inks
  ink: '#1e293b',          // Dark graphite ink
  inkMuted: '#64748b',     // Faded pencil grey
  inkLight: '#94a3b8',     // Light graphite
  border: '#1e293b',       // Solid ink border
  
  // Base Paper & Canvas
  bgPaper: '#faf8f5',      // Warm sketchpad paper
  bgPaperWarm: '#f5f2eb',  // Slightly deeper paper
  bgCanvas: '#faf8f5',     // Main background
  bgCard: '#ffffff',       // Crisp white paper card
  white: '#ffffff',
  
  // Highlighter Accent Colors
  primary: '#3b82f6',      // Ink Blue
  primaryLight: '#60a5fa', // Light Ink Blue
  primaryDark: '#1d4ed8',  // Deep Ink Blue
  success: '#10b981',      // Marker Green
  warning: '#f59e0b',      // Highlighter Orange
  error: '#ef4444',        // Red Ink Error
  accentPurple: '#8b5cf6', // Violet Highlighter
  
  // Sticky Note Pastel Colors (exact match to web app)
  noteYellow: '#fef9c3',   // Yellow sticky
  noteYellowBorder: '#fde047',
  noteBlue: '#dbeafe',     // Blue sticky
  noteBlueBorder: '#93c5fd',
  noteGreen: '#dcfce7',    // Green sticky
  noteGreenBorder: '#86efac',
  notePurple: '#f3e8ff',   // Purple sticky
  notePurpleBorder: '#d8b4fe',
  noteOrange: '#ffedd5',   // Orange sticky
  noteOrangeBorder: '#fdba74',
  noteRose: '#ffe4e6',     // Rose sticky
  noteRoseBorder: '#fda4af',

  // Badges & Tag Backgrounds & Texts
  yellowBadgeBg: '#fef9c3',
  yellowBadgeText: '#854d0e',
  mintBadgeBg: '#dcfce7',
  mintBadgeText: '#166534',
  blueBadgeBg: '#dbeafe',
  blueBadgeText: '#1e40af',
  amberBadgeBg: '#ffedd5',
  amberBadgeText: '#9a3412',
  purpleBadgeBg: '#f3e8ff',
  purpleBadgeText: '#6b21a8',
  roseBadgeBg: '#ffe4e6',
  roseBadgeText: '#9f1239',

  // Grid, Line & Track Accents
  gridLine: 'rgba(226, 222, 211, 0.75)',
  marginLine: 'rgba(239, 68, 68, 0.35)', // Soft red notebook margin
  sketchTrack: '#e2e8f0',
  sketchTrackDone: '#10b981',

  // Compatibility Aliases (to ensure existing code works flawlessly)
  sketchInk: '#1e293b',
  sketchSubtle: '#64748b',
  brandDark: '#1d4ed8',
  brandMint: '#10b981',
};

// Reusable Neo-Brutalist Shadow Styles
export const shadows = {
  flatSmall: {
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  flat: {
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  flatLarge: {
    shadowColor: colors.ink,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  flatPressed: {
    shadowColor: colors.ink,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
};
