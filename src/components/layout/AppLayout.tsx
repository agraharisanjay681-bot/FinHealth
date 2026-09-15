import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { FloatingChatButton } from '../chat/FloatingChatButton.js';
import { DisclaimerBanner } from '../common/DisclaimerBanner.js';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLandingOrAuth = ['/', '/login', '/register', '/onboarding'].includes(location.pathname);
  const isFullChat = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
