import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { FloatingChatButton } from '../chat/FloatingChatButton.js';
import { DisclaimerBanner } from '../common/DisclaimerBanner.js';
import { useTheme } from '../../context/ThemeContext.js';

export const AppLayout: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isLandingOrAuth = ['/', '/login', '/register', '/onboarding'].includes(location.pathname);
  const isFullChat = location.pathname === '/chat';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'cyber'
        ? 'cyber-bg-overlay bg-[#030d08] text-slate-100'
        : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      <Navbar />

      {!isLandingOrAuth && !isFullChat && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-3">
          <DisclaimerBanner variant="compact" />
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isFullChat && <Footer />}

      {/* Floating FinHealth AI button available everywhere except the dedicated /chat page */}
      {!isFullChat && <FloatingChatButton />}
    </div>
  );
};
