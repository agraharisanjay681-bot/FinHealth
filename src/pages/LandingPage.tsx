import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Award, 
  Percent, 
  BarChart3, 
  Target,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleExploreDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Credit & Financial Wellness Platform for India</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-[1.15]">
            Take Control of Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
              Financial Health
            </span>{' '}
            with AI
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FinHealth analyzes your credit score, loans, utilization, and financial habits to deliver personalized insights, actionable recommendations, and a clear path toward financial freedom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Open My Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <button
              onClick={handleExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Explore Live Demo (Alex Sharma)</span>
            </button>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>CIBIL-Aligned Range (300-900)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>DTI & Utilization Analysis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Google Gemini AI Advisor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Educational & Secure</span>
            </div>
          </div>
        </div>

        {/* Interactive FinTech Dashboard Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Live Snapshot Preview
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Alex Sharma
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Good morning, Alex 👋
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                FinHealth Score: 78/100 (Healthy)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Credit Score (CIBIL)</span>
                <span className="text-emerald-600 font-bold text-[11px]">+12 pts</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">742</p>
              <div className="flex items-center gap-2 text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span>Good Standing (300-900)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Credit Utilization</span>
                <span className="text-slate-400 text-[11px]">Ideal &lt;30%</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">28%</p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ₹42,000 / ₹1,50,000 Limit
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Debt-to-Income (DTI)</span>
                <span className="text-emerald-600 font-bold text-[11px]">Healthy</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">17%</p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ₹14,500 EMI / ₹85k Income
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total Active Debt</span>
                <span className="text-slate-400 text-[11px]">2 Active Loans</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">₹2,80,000</p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                ₹14,500 Monthly EMI
              </div>
            </div>
          </div>

          {/* AI Quick Insight Banner in preview */}
          <div className="mt-6 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-semibold">Gemini AI Advisor:</strong> "Alex, your utilization dropped to 28% this cycle. Maintaining this below 25% over the next 90 days may support progression toward the 775+ tier."
              </p>
            </div>
            <button
              onClick={handleExploreDemo}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Explore Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Intelligent FinTech Engine
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Engineered for Every Stage of Your Financial Journey
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            From tackling high-interest loans to raising your CIBIL score, FinHealth equips you with actionable intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Financial Advisor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Personalized guidance powered by Google Gemini. Identifies major bottlenecks and provides a 5-step prioritized action plan tailored to your profile.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Credit Health Monitoring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track CIBIL-aligned score history, understand credit factor weightings (payment history, utilization, age, mix), and run "what-if" score simulations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Smart Analytics & DTI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instantly calculate Debt-to-Income and credit card utilization ratios with automated visual breakdowns of cashflow, EMIs, and debt reduction trends.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">FinHealth AI Chatbot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Have real-time conversations with your financial assistant. Ask about personal loans, prepayment strategies, credit repair, or Indian tax savings (80C).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Progress Tracking & History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visualize your credit-score trajectories over 1M, 3M, 6M, 1Y, and all time with smooth interactive Recharts graphs and milestone achievements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Financial Goals & 90-Day Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Set customized goals for credit score improvement, debt reduction, and emergency fund reserves with structured Month 1-2-3 milestone roadmaps.
            </p>
          </div>
        </div>
      </section>

      {/* 5-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            How FinHealth Works
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            A Clear 5-Step Pathway to Financial Wellness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            { step: '01', title: 'Create Profile', desc: 'Sign up securely with email or Google/GitHub single sign-on.' },
            { step: '02', title: 'Enter Financial Data', desc: 'Provide your income, active loans, EMIs, and self-reported credit score.' },
            { step: '03', title: 'Analyze Health', desc: 'FinHealth computes your 0-100 health score, DTI ratio, and utilization.' },
            { step: '04', title: 'Get AI Recommendations', desc: 'Gemini AI delivers a tailored 5-step action plan and identifies bottlenecks.' },
            { step: '05', title: 'Track & Improve', desc: 'Monitor your credit history, log payments, and celebrate milestone improvements.' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 relative"
            >
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                {item.step}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Security */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Security & Privacy Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">
              Bank-Grade Security Principles Designed for Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We understand the sensitivity of financial data. FinHealth isolates credentials, hashes passwords using bcrypt, protects all endpoints with JSON Web Tokens, and strictly keeps all AI interactions server-side.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted Password Hashing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>JWT Session Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Client-Side Secret Exposure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-Click Data Export</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <DisclaimerBanner variant="full" />
        </div>
      </section>
    </div>
  );
};
