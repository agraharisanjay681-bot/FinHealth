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
    const saved = localStorage.getItem('finhealth_theme') as Theme;
    if (saved === 'cyber' || saved === 'dark' || saved === 'light') return saved;
    return 'cyber'; // Default to the stunning Cyber Emerald FinTech theme
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'cyber') {
      root.classList.add('dark', 'cyber-theme');
      root.setAttribute('data-theme', 'cyber');
      root.style.colorScheme = 'dark';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('cyber-theme');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark', 'cyber-theme');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    
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

