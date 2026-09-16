import React, { useState } from 'react';
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
  Percent, 
  BarChart3, 
  Target,
  Zap,
  ChevronRight,
  Send,
  Sliders,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';
import { formatINR } from '../utils/formatters.js';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  // Interactive Showcase Tab
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'simulator'>('dashboard');
  
  // Interactive Chart Range Filter
  const [chartRange, setChartRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'All'>('6M');

  // Interactive Live Score Simulator State on Landing
  const [simIncome, setSimIncome] = useState(75000);
  const [simEmi, setSimEmi] = useState(14500);
  const [simCreditLimit, setSimCreditLimit] = useState(150000);
  const [simCardBalance, setSimCardBalance] = useState(42000);
  const [simBaseScore, setSimBaseScore] = useState(742);

  // Interactive Chat State in Mobile Mockup
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'user',
      text: 'How can I improve my credit score?'
    },
    {
      sender: 'assistant',
      text: "Based on your profile, the biggest opportunity is to reduce your credit utilization and maintain consistent on-time payments.\n\nHere's a quick 5-step plan:\n1. Reduce credit utilization below 30%\n2. Pay all bills on time\n3. Avoid new credit applications\n4. Reduce high-interest debt\n5. Build an emergency fund\n\nThese steps may support better credit behavior over time."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Your debt-to-income ratio is in a healthy range. Maintaining prompt payments across your active loans will consistently build your CIBIL profile.";
      const lower = userText.toLowerCase();
      if (lower.includes('loan') || lower.includes('emi')) {
        reply = "Prepaying just ₹2,000 extra per month on your highest-interest loan could save you up to ₹18,400 in interest and shorten your payoff period by 8 months!";
      } else if (lower.includes('card') || lower.includes('utilization')) {
        reply = "Try keeping your credit card balance under ₹30,000 before the monthly bill generation date. This ensures a utilization ratio under 20%, which bureaus love.";
      } else if (lower.includes('cibil') || lower.includes('score')) {
        reply = "To reach a 780+ CIBIL score, maintain 100% on-time payments for the next 6 months and keep revolving credit utilization under 20%.";
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  const handleExploreDemo = async () => {
    await demoLogin();
    navigate('/dashboard');
  };

  // Dynamic DTI & Utilization Calculations
  const calculatedDti = simIncome > 0 ? Math.round((simEmi / simIncome) * 100) : 0;
  const calculatedUtil = simCreditLimit > 0 ? Math.round((simCardBalance / simCreditLimit) * 100) : 0;
  
  // Dynamic Health Score formula
  const calculatedHealthScore = Math.min(99, Math.max(20, Math.round(
    (((simBaseScore - 300) / 600) * 100 * 0.4) +
    (Math.max(0, 100 - calculatedDti * 1.5) * 0.3) +
    (Math.max(0, 100 - calculatedUtil * 1.5) * 0.3)
  )));

  return (
    <div className="space-y-24 pb-20 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* 1. Hero Section with Emerald Mesh Glow */}
      <section className="relative pt-8 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-xs animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>AI-Powered Financial Wellness Platform</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-[1.12]">
            Take Control of Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400">
              Financial Health
            </span>{' '}
            with AI
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            FinHealth analyzes your credit and financial data to provide personalized insights, actionable recommendations, and a clear path toward better financial health.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
            >
              <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={handleExploreDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-slate-900/10 dark:bg-slate-900/80 hover:bg-slate-900/20 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-sm backdrop-blur-md shadow-xs transition-all flex items-center justify-center gap-2 hover:border-emerald-500/50"
            >
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Explore FinHealth</span>
            </button>
          </div>

          {/* 3 Core Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white">Secure</p>
                <p className="text-[11px] text-slate-500">Your data is safe and encrypted</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white">AI Powered</p>
                <p className="text-[11px] text-slate-500">Personalized insights with Gemini AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-white">Trusted</p>
                <p className="text-[11px] text-slate-500">Build a healthier financial future</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive 3D Device Showcase (Laptop + Mobile Phone) */}
        <div className="mt-14 relative max-w-6xl mx-auto">
          {/* Floating Pill Badge 1 (Top Left) */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-xl shadow-emerald-500/20 absolute -top-5 left-8 z-30">
            <ArrowUpRight className="w-4 h-4 bg-white/20 rounded-full p-0.5" />
            <div>
              <p className="text-[11px] font-bold leading-tight">Better Credit</p>
              <p className="text-[9px] text-emerald-100 font-normal">Brighter Future</p>
            </div>
          </div>

          {/* Floating Card Badge 2 (Top Right) */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-semibold shadow-2xl backdrop-blur-md absolute -top-4 right-12 z-30">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-cyan-400">Track Analyze Improve</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-3 bg-emerald-400 rounded-xs animate-pulse"></span>
                <span className="w-1.5 h-4 bg-teal-400 rounded-xs"></span>
                <span className="w-1.5 h-5 bg-cyan-400 rounded-xs"></span>
                <span className="w-1.5 h-2.5 bg-emerald-300 rounded-xs"></span>
              </div>
            </div>
          </div>

          {/* Tabs Selector for Interactive Mode */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setActivePreviewTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activePreviewTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              ✨ Dashboard View
            </button>
            <button
              onClick={() => setActivePreviewTab('simulator')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activePreviewTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              🎛️ Live Dynamic Simulator
            </button>
          </div>

          {/* Main Dual Device Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* LEFT / CENTER: Laptop Frame (8 cols on lg) */}
            <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-700/80 relative">
              {/* Laptop Top Bezel & Camera */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 rounded-t-xl border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <div className="text-[10px] text-slate-400 font-mono">finhealth.web.app</div>
              </div>

              {/* Laptop Screen Content */}
              <div className="bg-slate-950 text-slate-100 rounded-b-xl p-4 sm:p-5 space-y-4 font-sans text-xs">
                
                {/* Internal App Navigation Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                      <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
                        FH
                      </div>
                      <span>FinHealth</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 pl-4 border-l border-slate-800">
                      <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded">Dashboard</span>
                      <span className="hover:text-white cursor-pointer">Credit Health</span>
                      <span className="hover:text-white cursor-pointer">Analytics</span>
                      <span className="hover:text-white cursor-pointer">Loans</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-300 font-medium">Alex Sharma</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                      AS
                    </div>
                  </div>
                </div>

                {/* Good morning header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                      Good morning, Alex 👋
                    </h3>
                    <p className="text-[11px] text-slate-400">Here's your financial health overview</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                    Health Score: {calculatedHealthScore}/100
                  </div>
                </div>

                {/* 4 Top Metric KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Metric 1 */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400">Credit Score</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-white">{simBaseScore}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">↑ 18</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Good</span>
                      <span className="text-slate-500">vs last mo</span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400">Financial Health</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-white">{calculatedHealthScore}/100</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">↑ 6</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Healthy</span>
                      <span className="text-slate-500">vs last mo</span>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400">Debt-to-Income</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-white">{calculatedDti}%</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">↓ 4%</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Good</span>
                      <span className="text-slate-500">vs last mo</span>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400">Credit Utilization</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-white">{calculatedUtil}%</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">↓ 7%</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Healthy</span>
                      <span className="text-slate-500">vs last mo</span>
                    </div>
                  </div>
                </div>

                {/* Conditional View: Live Dashboard vs Simulator */}
                {activePreviewTab === 'dashboard' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    {/* Dynamic Chart Box (7 cols) */}
                    <div className="sm:col-span-7 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">Credit Score History</span>
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-800 text-[9px]">
                          {(['1M', '3M', '6M', '1Y', 'All'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => setChartRange(r)}
                              className={`px-1.5 py-0.5 rounded ${chartRange === r ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* SVG Line Chart Graph */}
                      <div className="h-28 w-full flex items-end justify-between px-2 pt-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-lg" />
                        <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 80">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 0 60 Q 60 50, 120 40 T 200 25 T 300 10 L 300 80 L 0 80 Z`}
                            fill="url(#chartGrad)"
                          />
                          <path
                            d={`M 0 60 Q 60 50, 120 40 T 200 25 T 300 10`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="300" cy="10" r="4" fill="#34d399" />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[9px] text-slate-500 px-1 font-mono">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span className="text-emerald-400 font-bold">Jun ({simBaseScore})</span>
                      </div>
                    </div>

                    {/* Utilization Ring & Quick Actions (5 cols) */}
                    <div className="sm:col-span-5 flex flex-col justify-between gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-[11px]">Credit Utilization</p>
                          <p className="text-[10px] text-slate-400 mt-1">₹42k / ₹1.5L Limit</p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-300 font-medium">{calculatedUtil}% Used</span>
                          </div>
                        </div>

                        {/* Circular Donut Ring */}
                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-800"
                              strokeWidth="3.8"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-500 transition-all duration-500"
                              strokeDasharray={`${calculatedUtil}, 100`}
                              strokeWidth="3.8"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute font-extrabold text-white text-xs">{calculatedUtil}%</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[10px] text-emerald-200">
                            Prepay ₹2k EMI to save ₹18.4k interest
                          </span>
                        </div>
                        <button
                          onClick={handleExploreDemo}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dynamic Interactive Slider Controls */
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        Live Dynamic Financial Metrics Simulator
                      </span>
                      <span className="text-[10px] text-slate-400">Adjust sliders to see live impact</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Monthly Income</span>
                          <span className="font-bold text-emerald-400">{formatINR(simIncome)}</span>
                        </div>
                        <input
                          type="range"
                          min="30000"
                          max="200000"
                          step="5000"
                          value={simIncome}
                          onChange={e => setSimIncome(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Total Monthly EMI</span>
                          <span className="font-bold text-teal-400">{formatINR(simEmi)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80000"
                          step="2000"
                          value={simEmi}
                          onChange={e => setSimEmi(Number(e.target.value))}
                          className="w-full accent-teal-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-slate-300">
                          <span>Credit Card Balance</span>
                          <span className="font-bold text-cyan-400">{formatINR(simCardBalance)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="150000"
                          step="5000"
                          value={simCardBalance}
                          onChange={e => setSimCardBalance(Number(e.target.value))}
                          className="w-full accent-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT: Smartphone Mockup (4 cols on lg) */}
            <div className="lg:col-span-4 max-w-[320px] mx-auto w-full bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-700/80 relative">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Phone Screen Display */}
              <div className="bg-slate-950 rounded-[26px] p-3 text-slate-100 flex flex-col justify-between h-[420px] border border-slate-800">
                {/* Chat Header */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">FinHealth AI</p>
                    <p className="text-[9px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Gemini Advisory Active
                    </p>
                  </div>
                </div>

                {/* Chat Messages List */}
                <div className="space-y-2.5 overflow-y-auto pr-1 my-2 flex-1 scrollbar-thin text-[11px]">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-xs'
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-xs whitespace-pre-line'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Message Input Box */}
                <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about your loans, CIBIL..."
                    className="flex-1 px-3 py-1.5 text-[11px] rounded-full bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Powerful Features Grid (Matching the Mockup Icons & Badges) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <span>POWERFUL FEATURES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
            Everything You Need for Financial Freedom
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            From credit monitoring to AI-powered advice, FinHealth gives you the tools to build a stronger financial future.
          </p>
        </div>

        {/* 6 Grid Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: AI Financial Advisor */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                AI Financial Advisor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Personalized guidance powered by Gemini AI with custom 5-step prioritized action plans and bottleneck diagnostics.
              </p>
            </div>
          </div>

          {/* Card 2: Credit Monitoring */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Credit Monitoring
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track your CIBIL score (300-900), bureau score trajectory, and 5 key credit health factors with "what-if" simulators.
              </p>
            </div>
          </div>

          {/* Card 3: Smart Analytics */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Smart Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualize your income, expenses & trends. Compute exact DTI, credit utilization, and savings rates automatically.
              </p>
            </div>
          </div>

          {/* Card 4: AI Chatbot */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                AI Chatbot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask anything about your financial health, loan interest rates, prepayment strategies, or Indian tax savings.
              </p>
            </div>
          </div>

          {/* Card 5: Progress Tracking */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Progress Tracking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                See your improvement over time with rich historical charting, debt payoff countdowns, and health milestones.
              </p>
            </div>
          </div>

          {/* Card 6: Financial Goals */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Financial Goals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Set goals and achieve them. Plan 6-month emergency funds, loan closures, and credit score targets with 90-day roadmaps.
              </p>
            </div>
          </div>

        </div>

        {/* Small Steps Big Dreams Badge */}
        <div className="mt-8 flex justify-end">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold italic text-sm shadow-xs transform rotate-2 hover:rotate-0 transition-transform">
            <span>✨ Small Steps Big Dreams</span>
          </div>
        </div>
      </section>

      {/* 4. Interactive 5-Step Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Diagnostic & Action Engine
            </h3>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">
              A Structured Pathway to Indian Financial Resilience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { num: '01', title: 'Sign In & Verify', desc: 'Instant Google/GitHub SSO or secure email auth.' },
              { num: '02', title: '7-Step Diagnostic', desc: 'Input income, loans, EMIs, and credit limits.' },
              { num: '03', title: 'Dynamic Health Score', desc: 'Weighted 0-100 score + DTI & utilization computation.' },
              { num: '04', title: 'AI Action Roadmap', desc: 'Gemini AI prioritizes high-impact financial steps.' },
              { num: '05', title: 'Track & Accelerate', desc: 'Log payments, run simulators, and hit your goals.' },
            ].map(s => (
              <div key={s.num} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-2xl font-extrabold text-emerald-400 font-display">{s.num}</span>
                <p className="font-bold text-xs text-white">{s.title}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner variant="full" />
      </section>
    </div>
  );
};

