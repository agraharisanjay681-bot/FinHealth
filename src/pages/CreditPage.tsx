import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  Info, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  PieChart as PieIcon, 
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { formatINR, formatPercent, getCreditScoreTier, formatDate } from '../utils/formatters.js';
import { ScoreMeter } from '../components/common/ScoreMeter.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';
import type { CreditScoreRecord } from '../types/index.js';

export const CreditPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [history, setHistory] = useState<CreditScoreRecord[]>([]);
  const [timeFilter, setTimeFilter] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newScore, setNewScore] = useState(profile?.current_credit_score || 742);
  const [scoreNote, setScoreNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulator State
  const [simUtilization, setSimUtilization] = useState(profile?.credit_utilization_ratio || 28);
  const [simOnTimeMonths, setSimOnTimeMonths] = useState(6);

  useEffect(() => {
    api.getCreditHistory().then(res => setHistory(res.history)).catch(() => {});
  }, []);

  const currentScore = profile?.current_credit_score || 742;
  const previousScore = profile?.previous_credit_score || 730;
  const tier = getCreditScoreTier(currentScore);

  // Simulated score calculation
  const utilDiff = (profile?.credit_utilization_ratio || 28) - simUtilization;
  const simulatedScore = Math.min(900, Math.max(300, Math.round(currentScore + (utilDiff * 0.8) + (simOnTimeMonths * 2.5))));

  // Filter history
  const chartData = history.map(item => ({
    date: new Date(item.recorded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: item.score,
    note: item.note
  }));

  // Utilization Donut Data
  const usedAmount = profile?.credit_card_balance || 42000;
  const totalLimit = profile?.total_credit_limit || 150000;
  const availableAmount = Math.max(0, totalLimit - usedAmount);

  const donutData = [
    { name: 'Used Credit', value: usedAmount, color: '#059669' },
    { name: 'Available Credit', value: availableAmount, color: '#e2e8f0' },
  ];

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.addCreditRecord(Number(newScore), scoreNote);
      setHistory(prev => [...prev, res.record]);
      await refreshProfile();
      setIsUpdateModalOpen(false);
      setScoreNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const creditFactors = [
    { name: 'Payment History', weight: '35%', status: 'Excellent', desc: 'Consistent, on-time repayments on credit cards & EMIs without 30+ day delays.' },
    { name: 'Credit Utilization', weight: '30%', status: profile && profile.credit_utilization_ratio <= 30 ? 'Healthy' : 'Needs Attention', desc: 'Ratio of outstanding revolving card balances to total approved credit lines.' },
    { name: 'Credit History Age', weight: '15%', status: 'Good', desc: 'Average age and vintage of your credit accounts. Older accounts boost credibility.' },
    { name: 'Credit Mix', weight: '10%', status: 'Balanced', desc: 'Healthy balance between secured loans (Home, Auto) and unsecured debt (Cards, Personal).' },
    { name: 'New Credit Inquiries', weight: '10%', status: 'Low Risk', desc: 'Hard inquiries made by lenders when evaluating new loan or credit card applications.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Credit Bureau Diagnostics
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded">
              Self-Reported
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            CIBIL & Credit Score Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Understand how Indian credit bureaus evaluate your profile and test simulated improvement paths.
          </p>
        </div>

        <button
          onClick={() => setIsUpdateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Score Update</span>
        </button>
      </div>

      {/* Top Section: Score Meter & Utilization Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Current Credit Score
            </span>
            <span className="text-[11px] text-slate-400">Range: 300 - 900</span>
          </div>

          <ScoreMeter score={currentScore} type="credit" previousScore={previousScore} />

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed px-4">
            {tier.description}
          </p>

          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Previous: {previousScore}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{currentScore - previousScore} points
            </span>
          </div>
        </div>

        {/* Credit Utilization Donut Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Credit Card Utilization
              </h3>
              <p className="text-[11px] text-slate-400">Recommended: Below 30%</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {profile?.credit_utilization_ratio || 28}% Used
            </span>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#cbd5e1" />
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatINR(val), 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {profile?.credit_utilization_ratio || 28}%
              </span>
              <span className="text-[10px] text-slate-400">Utilized</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-center border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Used Balance</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatINR(usedAmount)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] text-slate-400 block">Available Limit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(availableAmount)}</span>
            </div>
          </div>
        </div>

        {/* AI Credit Advice Insight Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-slate-900 dark:to-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Credit Utilization Insight
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Bureau Optimization Tip</p>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            "Your utilization is currently **{profile?.credit_utilization_ratio || 28}%**, which is healthy and under the 30% guideline. Keeping revolving balances below 20% right before your monthly billing cycle statement generation date may support faster credit score appreciation."
          </p>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/50 dark:border-emerald-800/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Did you know?
            </span>
            <p>
              Credit bureaus receive balance reports once a month. Paying mid-cycle reduces the reported balance even if your spending remains steady.
            </p>
          </div>

          <p className="text-[10px] text-slate-400">
            *Insights are educational estimates based on general bureau scoring algorithms.
          </p>
        </div>
      </div>

      {/* Credit Score History Recharts Line Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Historical Score Changes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual record of your self-reported credit score progression.
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeFilter === f
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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

      {/* Credit Score Simulator ("What-If" Tool) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Credit Score Simulator (What-If Analysis)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate how paying down credit card balances or maintaining on-time EMI streaks could impact your score.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <div className="space-y-6">
            {/* Slider 1: Utilization */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300">
                  Target Credit Utilization
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {simUtilization}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                value={simUtilization}
                onChange={(e) => setSimUtilization(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5% (Optimal)</span>
                <span>30% (Standard)</span>
                <span>90% (Maxed Out)</span>
              </div>
            </div>

            {/* Slider 2: On-time payment streak */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300">
                  Consecutive Months of 100% Timely EMI Payments
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {simOnTimeMonths} Months
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={simOnTimeMonths}
                onChange={(e) => setSimOnTimeMonths(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Month</span>
                <span>12 Months</span>
                <span>24 Months</span>
              </div>
            </div>
          </div>

          {/* Simulator Outcome Display */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between items-center text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Projected Credit Trajectory
            </span>

            <div className="space-y-1">
              <span className="text-5xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
                ~{simulatedScore}
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {simulatedScore - currentScore >= 0 ? `+${simulatedScore - currentScore}` : `${simulatedScore - currentScore}`} estimated points change
              </p>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Lowering card utilization from {profile?.credit_utilization_ratio || 28}% to {simUtilization}% and sustaining on-time payments for {simOnTimeMonths} months creates strong positive signals for credit bureaus.
            </p>

            <span className="text-[10px] text-slate-400 italic">
              *Educational projection only; actual bureau scoring algorithms vary.
            </span>
          </div>
        </div>
      </div>

      {/* Credit Factors Breakdown Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Indian Credit Score Weighting Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          How credit rating bureaus (TransUnion CIBIL, Experian, CRIF High Mark) weigh your profile attributes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {creditFactors.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>
                <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  {f.weight}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {f.desc}
              </p>
              <div className="pt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Standing: {f.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerBanner variant="full" />

      {/* Log Score Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log Credit Score Update
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your latest verified score from your bank or official CIBIL check.
            </p>

            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Credit Score (300 - 900)
                </label>
                <input
                  type="number"
                  min="300"
                  max="900"
                  required
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Reason for Change (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid off HDFC personal loan or credit card bill"
                  value={scoreNote}
                  onChange={(e) => setScoreNote(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
