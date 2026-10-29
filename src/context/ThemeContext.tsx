import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeId, DynamicFxSettings, PulseEvent, ThemeColors } from '../types/theme.js';
import { THEME_PRESETS } from '../config/themePresets.js';

export type Theme = ThemeId;

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeId) => void;
  fxSettings: DynamicFxSettings;
  updateFxSettings: (settings: Partial<DynamicFxSettings>) => void;
  triggerPulse: (x?: number, y?: number, intensity?: number) => void;
  pulseEvent: PulseEvent | null;
  isHudOpen: boolean;
  setIsHudOpen: (open: boolean) => void;
}

const DEFAULT_FX_SETTINGS: DynamicFxSettings = {
  motionEnabled: true,
  interactionMode: 'magnetic',
  speed: 'fluid',
  candlestickDensity: 'balanced',
  cursorGlow: true,
  glowIntensity: 'radiant',
  soundEnabled: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('finhealth_theme_active') as ThemeId;
    if (saved && THEME_PRESETS[saved]) return saved;
    // Default to 'quantum' which embodies the user's reference image!
    return 'quantum';
  });

  const [fxSettings, setFxSettingsState] = useState<DynamicFxSettings>(() => {
    try {
      const saved = localStorage.getItem('finhealth_fx_settings');
      if (saved) {
        return { ...DEFAULT_FX_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_FX_SETTINGS;
  });

  const [pulseEvent, setPulseEvent] = useState<PulseEvent | null>(null);
  const [isHudOpen, setIsHudOpen] = useState(false);

  // Apply theme to HTML root & CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const config = THEME_PRESETS[theme] || THEME_PRESETS.quantum;

    // Clear previous theme classes
    root.classList.remove(
      'cyber-theme',
      'light-theme',
      'theme-quantum',
      'theme-cyber',
      'theme-solar',
      'theme-dark',
      'theme-light'
    );

    // Add active theme classes
    root.classList.add(`theme-${theme}`);
    if (theme === 'cyber') root.classList.add('cyber-theme');

    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-theme');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = 'dark';
    }

    // Set CSS custom properties on documentElement
    root.style.setProperty('--theme-primary', config.primary);
    root.style.setProperty('--theme-accent', config.accent);
    root.style.setProperty('--theme-accent-sec', config.accentSecondary);
    root.style.setProperty('--theme-bg-base', config.bgBase);
    root.style.setProperty('--theme-glow', config.glowColor);
    root.style.setProperty('--theme-card-bg', config.cardBg);
    root.style.setProperty('--theme-card-border', config.cardBorder);
    root.style.setProperty('--theme-candle-bull', config.candleBull);
    root.style.setProperty('--theme-candle-bear', config.candleBear);

    localStorage.setItem('finhealth_theme_active', theme);
    localStorage.setItem('finhealth_theme', theme);
  }, [theme]);

  const updateFxSettings = (partial: Partial<DynamicFxSettings>) => {
    setFxSettingsState(prev => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('finhealth_fx_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const triggerPulse = useCallback((x?: number, y?: number, intensity: number = 1.0) => {
    const effectiveX = x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const effectiveY = y ?? (typeof window !== 'undefined' ? window.innerHeight / 3 : 300);
    setPulseEvent({
      id: Date.now() + Math.random(),
      x: effectiveX,
      y: effectiveY,
      intensity,
      timestamp: Date.now(),
    });
  }, []);

  const toggleTheme = () => {
    const themeCycle: ThemeId[] = ['quantum', 'cyber', 'solar', 'dark', 'light'];
    setThemeState(prev => {
      const idx = themeCycle.indexOf(prev);
      const next = themeCycle[(idx + 1) % themeCycle.length];
      return next;
    });
  };

  const setTheme = (newTheme: ThemeId) => {
    if (THEME_PRESETS[newTheme]) {
      setThemeState(newTheme);
    }
  };

  const themeConfig = THEME_PRESETS[theme] || THEME_PRESETS.quantum;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        toggleTheme,
        setTheme,
        fxSettings,
        updateFxSettings,
        triggerPulse,
        pulseEvent,
        isHudOpen,
        setIsHudOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
