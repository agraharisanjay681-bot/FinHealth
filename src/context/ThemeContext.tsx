import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'cyber' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Migration: If user previously had old 'light'/'dark', set to 'cyber' as default
    const saved = localStorage.getItem('finhealth_theme_active') as Theme;
    if (saved === 'cyber' || saved === 'dark' || saved === 'light') return saved;
    return 'cyber';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Clear all previous theme classes
    root.classList.remove('cyber-theme', 'dark', 'light-theme');
    
    if (theme === 'cyber') {
      root.classList.add('dark', 'cyber-theme');
      root.setAttribute('data-theme', 'cyber');
      root.style.colorScheme = 'dark';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light-theme');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    
    localStorage.setItem('finhealth_theme_active', theme);
    localStorage.setItem('finhealth_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'cyber') return 'light';
      if (prev === 'light') return 'dark';
      return 'cyber';
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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

