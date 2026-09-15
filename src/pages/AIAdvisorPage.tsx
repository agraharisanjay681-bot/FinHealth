import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Target, 
  Lightbulb, 
  ArrowRight,
  ListTodo
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR, formatPercent, getHealthScoreTier } from '../utils/formatters.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';
import type { AIRecommendation } from '../types/index.js';

export const AIAdvisorPage: React.FC = () => {
  const { profile, user } = useAuth();
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const fetchAnalysis = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.getAIRecommendations();
      setRecommendation(res.recommendation);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const toggleStep = (stepNum: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const healthTier = getHealthScoreTier(profile?.financial_health_score || 78);

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const totalSteps = recommendation?.recommendations?.length || 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Gemini AI Financial Engine
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
              Live Synthesis
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            AI Financial Advisor & Action Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Personalized credit optimization, debt reduction, and financial health intelligence for {user?.name || 'User'}.
          </p>
        </div>

        <button
          onClick={() => fetchAnalysis(true)}
          disabled={refreshing || loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Synthesizing with Gemini...' : 'Regenerate Analysis'}</span>
        </button>
      </div>

      {/* Top AI Summary Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-500/30 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Executive Health Assessment
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthesized across CIBIL history, debt commitments, and cashflow ratios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Wellness Standing
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-block mt-0.5 ${healthTier.badgeBg} ${healthTier.badgeText}`}>
                {healthTier.label} ({profile?.financial_health_score || 78}/100)
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {recommendation?.summary ||
              'Your financial profile demonstrates admirable debt discipline with an on-time payment track record. Your CIBIL score is currently in good standing, while your Debt-to-Income ratio remains well under the 35% Indian banking guideline.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Primary Bottleneck */}
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Identified Bottleneck
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {recommendation?.bottleneck ||
                    'Elevated revolving card utilization at 28% and ₹12,000 monthly EMI concentration in a single personal loan.'}
                </p>
              </div>
            </div>

            {/* Checklist Progress */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-emerald-600" />
                  Action Plan Progress
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {completedCount} of {totalSteps} recommendations completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                  {Math.round((completedCount / totalSteps) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Prioritized Action Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Prioritized 5-Step Action Plan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Concrete interventions designed to maximize credit resilience and minimize interest loss.
            </p>
          </div>
          <span className="text-xs text-slate-400">Click circle to mark completed</span>
        </div>

        <div className="space-y-3">
          {(recommendation?.recommendations || []).map((step) => {
            const isDone = !!checkedSteps[step.step];

            return (
              <div
                key={step.step}
                onClick={() => toggleStep(step.step)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number Checkbox */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : `0${step.step}`}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {step.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          step.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : step.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {step.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.timeframe}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 pl-13 sm:pl-0">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Projected Impact
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {step.impact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 90-Day Financial Health Roadmap */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              90-Day Financial Health Roadmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Structured 3-month progression to establish sustainable financial wellness.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Month 1 */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Month 1 (Days 1–30)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Quick Wins
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Utilization Clamp & Auto-Debits
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {recommendation?.roadmap?.month1 ||
                'Pay down credit card outstanding balance by ₹12,000 before statement date to bring utilization below 20%. Activate NACH auto-debit for loan EMIs.'}
            </p>
          </div>

          {/* Month 2 */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Month 2 (Days 31–60)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                Habit Consolidation
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Debt Acceleration & Reserve
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {recommendation?.roadmap?.month2 ||
                'Channel an extra ₹3,000 prepayment to your highest-interest loan. Allocate ₹10,000 into a liquid high-yield emergency savings fund.'}
            </p>
          </div>

          {/* Month 3 */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Month 3 (Days 61–90)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Milestone Review
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              CIBIL Refresh & Limit Review
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {recommendation?.roadmap?.month3 ||
                'Pull your updated quarterly CIBIL credit report to verify score appreciation. Request an approved credit limit enhancement without hard inquiries.'}
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner variant="full" />
    </div>
  );
};
