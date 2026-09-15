import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Logo } from '../common/Logo.js';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <Logo variant="horizontal" size="sm" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              "Understand Your Money. Improve Your Credit. Build Your Future."
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailored for the Indian Financial Ecosystem</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Financial Dashboard
                </Link>
              </li>
              <li>
                <Link to="/credit" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  CIBIL & Credit Health
                </Link>
              </li>
              <li>
                <Link to="/loans" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Debt & EMI Management
                </Link>
              </li>
              <li>
                <Link to="/goals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Financial Goals & 90-Day Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Intelligence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              AI Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/advisor" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  AI Financial Advisor
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  FinHealth AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Predictive Cashflow Trends
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Financial Health Diagnostic
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Trust & Security
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Protected APIs, encrypted password storage, client credential isolation, and user data privacy.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Disclaimer:</strong> FinHealth provides educational financial information, personalized analytical frameworks, and credit wellness insights based exclusively on user-provided financial disclosures. FinHealth is not a bank, non-banking financial company (NBFC), registered investment advisor, or credit bureau. We do not claim official CIBIL bureau affiliation or issue credit scores directly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 text-slate-400 text-[11px]">
            <span>© {new Date().getFullYear()} FinHealth. All rights reserved.</span>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <span>Privacy Shield</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>RBI Educational Guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
