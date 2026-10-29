import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { FloatingChatButton } from '../chat/FloatingChatButton.js';
import { DisclaimerBanner } from '../common/DisclaimerBanner.js';
import { useTheme } from '../../context/ThemeContext.js';
import { InteractiveFinWaveCanvas } from '../theme/InteractiveFinWaveCanvas.js';
import { InteractiveCursorGlow } from '../theme/InteractiveCursorGlow.js';
import { DynamicThemeHUD } from '../theme/DynamicThemeHUD.js';

export const AppLayout: React.FC = () => {
  const { theme, themeConfig } = useTheme();
  const location = useLocation();
  const isLandingOrAuth = ['/', '/login', '/register', '/onboarding'].includes(location.pathname);
  const isFullChat = location.pathname === '/chat';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative ${
        theme === 'light'
          ? 'bg-slate-50 text-slate-900'
          : 'text-slate-100'
      }`}
      style={{
        backgroundColor: themeConfig.bgBase,
        backgroundImage: themeConfig.bgGradient,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 1. Full-screen Interactive 3D Candlestick & Neural Data Wave Canvas */}
      <InteractiveFinWaveCanvas />

      {/* 2. Interactive Cursor Spotlight Aura */}
      <InteractiveCursorGlow />

      {/* 3. Interactive Theme Studio Drawer & Floating Quick Launcher */}
      <DynamicThemeHUD />

      {/* 4. Sticky Header / Navigation */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {!isLandingOrAuth && !isFullChat && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-3 relative z-10">
          <DisclaimerBanner variant="compact" />
        </div>
      )}

      {/* 5. Main Application Content Area with Frosted Glassmorphism */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {!isFullChat && (
        <div className="relative z-20">
          <Footer />
        </div>
      )}

      {/* Floating FinHealth AI button available everywhere except the dedicated /chat page */}
      {!isFullChat && <FloatingChatButton />}
    </div>
  );
};
