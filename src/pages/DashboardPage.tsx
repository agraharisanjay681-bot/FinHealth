import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Percent, 
  CreditCard, 
  IndianRupee, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Bot, 
  Zap,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { formatINR, formatPercent, getCreditScoreTier, getHealthScoreTier, getDtiTier, getUtilizationTier, formatDate } from '../utils/formatters.js';
import { ScoreMeter } from '../components/common/ScoreMeter.js';
import type { FinancialProfile, CreditScoreRecord, Loan, Payment, FinancialGoal, AIRecommendation } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profile: FinancialProfile | null;
    creditHistory: CreditScoreRecord[];
    loansSummary: { total: number; active: number; totalRemaining: number; totalEmi: number };
    recentPayments: Payment[];
    activeGoals: FinancialGoal[];
    latestRecommendation: AIRecommendation | null;
  } | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const p = data?.profile || profile;

  // Chart data formatting
  const chartData = (data?.creditHistory || []).map(item => ({
    date: new Date(item.recorded_at).toLocaleDateString('en-IN', { month: 'short' }),
    score: item.score
  }));

  const creditScore = p?.current_credit_score || 700;
  const previousScore = p?.previous_credit_score || 690;
  const scoreChange = creditScore - previousScore;
  const scoreTier = getCreditScoreTier(creditScore);

  const healthScore = p?.financial_health_score || 70;
  const healthTier = getHealthScoreTier(healthScore);

  const dti = p?.debt_to_income_ratio || 0;
  const dtiTier = getDtiTier(dti);

  const util = p?.credit_utilization_ratio || 0;
  const utilTier = getUtilizationTier(util);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Good morning, {user?.name || 'Valued Member'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's your comprehensive financial health overview for the Indian financial ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/advisor"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Advisor Report</span>
          </Link>

          <Link
            to="/chat"
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-emerald-500 transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ask FinHealth AI</span>
          </Link>
        </div>
      </div>

      {/* Primary 6 Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Credit Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Credit Score
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreTier.badgeBg} ${scoreTier.badgeText}`}>
              {scoreTier.label}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {creditScore}
              </span>
              <span className="text-xs text-slate-400">/ 900</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              User-provided / CIBIL scale
            </p>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className={scoreChange >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {scoreChange >= 0 ? `+${scoreChange} pts` : `${scoreChange} pts`}
            </span>
            <Link to="/credit" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-medium flex items-center">
              Details <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Financial Health Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Health Score
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthTier.badgeBg} ${healthTier.badgeText}`}>
              {healthTier.label}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {healthScore}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Internal FinHealth wellness index
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${healthScore}%` }} />
          </div>
        </div>

        {/* Metric 3: Debt-to-Income (DTI) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              DTI Ratio
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dtiTier.badgeBg}`}>
              {dtiTier.label}
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              {dti}%
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              EMIs vs Gross Income
            </p>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1">
            Safe ceiling: &lt;35% in India
          </p>
        </div>

        {/* Metric 4: Credit Utilization */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Utilization
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${utilTier.badgeBg}`}>
              {utilTier.label}
            </span>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              {util}%
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {formatINR(p?.credit_card_balance)} / {formatINR(p?.total_credit_limit)}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1">
            Recommended: &lt;30%
          </p>
        </div>

        {/* Metric 5: Total Debt */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Debt
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              {p?.active_loans_count || 0} Loans
            </span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {formatINR(p?.total_debt)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Remaining Principal Balance
            </p>
          </div>
          <Link to="/loans" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline border-t border-slate-100 dark:border-slate-800 pt-1 block">
            Manage Loans →
          </Link>
        </div>

        {/* Metric 6: Monthly EMI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Monthly EMI
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {formatINR(p?.monthly_emi)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Monthly Debt Commitment
            </p>
          </div>
          <Link to="/payments" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline border-t border-slate-100 dark:border-slate-800 pt-1 block">
            View Schedule →
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Credit History & Arc Gauge */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Score History Line Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Credit Score Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Historical recording timeline based on disciplined payment behavior.
                </p>
              </div>
              <Link
                to="/credit"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Credit Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[650, 800]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`${val} CIBIL Score`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Recent Payments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quick Actions Bar */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/loans"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Add Loan</span>
                </Link>
                <Link
                  to="/payments"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Record Payment</span>
                </Link>
                <Link
                  to="/credit"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Update Score</span>
                </Link>
                <Link
                  to="/chat"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Ask AI</span>
                </Link>
              </div>
            </div>

            {/* Upcoming EMIs & Dues */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Upcoming Payments
                </h4>
                <Link to="/payments" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                  All ({data?.recentPayments?.length || 0})
                </Link>
              </div>
              <div className="space-y-2">
                {(data?.recentPayments || []).slice(0, 3).map(pay => (
                  <div key={pay.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {pay.loan_name || 'Loan EMI'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Due: {formatDate(pay.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {formatINR(pay.amount)}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${pay.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'}`}>
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Advisor Priority Recommendation & Goals */}
        <div className="space-y-6">
          {/* AI Advisor Priority Recommendation */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    AI Financial Advisor
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Powered by Gemini</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {data?.latestRecommendation?.priority || 'Priority'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {data?.latestRecommendation?.summary ||
                'Your financial profile reflects steady improvement with healthy credit utilization and manageable debt burden.'}
            </p>

            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Top Action Step:
              </h4>
              {data?.latestRecommendation?.recommendations?.[0] && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {data.latestRecommendation.recommendations[0].title}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    {data.latestRecommendation.recommendations[0].description}
                  </p>
                </div>
              )}
            </div>

            <Link
              to="/advisor"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>View Full 5-Step Action Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Financial Goals Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Active Financial Goals
              </h3>
              <Link to="/goals" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.activeGoals || []).map((goal) => {
                const percent = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {goal.title}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Target: {goal.category === 'credit_score' ? goal.target_value : formatINR(goal.target_value)}</span>
                      <span>By {formatDate(goal.target_date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
