import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  ShieldAlert, 
  Percent, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { formatINR, formatPercent, getDtiTier, getUtilizationTier } from '../utils/formatters.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';

export const AnalyticsPage: React.FC = () => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(res => {
      setAnalytics(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const dti = profile?.debt_to_income_ratio || 17;
  const dtiTier = getDtiTier(dti);

  const monthlyIncome = profile?.monthly_income || 85000;
  const totalEmi = profile?.monthly_emi || 14500;
  const livingExpenses = profile?.monthly_expenses || 38000;
  const netSurplus = Math.max(0, monthlyIncome - totalEmi - livingExpenses);
  const savingsRate = Math.round((netSurplus / monthlyIncome) * 100);

  // Cashflow Pie Chart Data
  const cashflowData = [
    { name: 'Living Expenses', value: livingExpenses, color: '#3b82f6' },
    { name: 'Loan EMIs', value: totalEmi, color: '#f59e0b' },
    { name: 'Net Savings Surplus', value: netSurplus, color: '#10b981' },
  ];

  // 6-Month Projected Cashflow Trend Bar Data
  const projectionData = [
    { month: 'Month 1', income: monthlyIncome, expenses: livingExpenses, emi: totalEmi, surplus: netSurplus },
    { month: 'Month 2', income: monthlyIncome, expenses: livingExpenses, emi: totalEmi, surplus: netSurplus },
    { month: 'Month 3', income: monthlyIncome, expenses: livingExpenses - 2000, emi: totalEmi, surplus: netSurplus + 2000 },
    { month: 'Month 4', income: monthlyIncome, expenses: livingExpenses - 2000, emi: totalEmi, surplus: netSurplus + 2000 },
    { month: 'Month 5', income: monthlyIncome, expenses: livingExpenses - 3000, emi: totalEmi - 4500, surplus: netSurplus + 7500 },
    { month: 'Month 6', income: monthlyIncome, expenses: livingExpenses - 3000, emi: totalEmi - 4500, surplus: netSurplus + 7500 },
  ];

  const dtiBenchmarks = [
    { range: '< 20%', label: 'Prime / Excellent', desc: 'Top tier for Indian lenders; effortless approval and lowest interest margins.' },
    { range: '20% - 35%', label: 'Healthy & Manageable', desc: 'Standard sweet spot for salaried borrowers per RBI guidelines.' },
    { range: '36% - 45%', label: 'Moderate Caution', desc: 'Higher scrutiny for large home loans; limit further unsecured borrowings.' },
    { range: '> 45%', label: 'Stressed / Overleveraged', desc: 'Risk of debt trap during income disruption; urgent restructuring advised.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Financial Health Diagnostics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Cashflow, DTI & Solvency Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            In-depth mathematical breakdowns of your debt commitments, surplus savings velocity, and lender benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Savings Rate: <strong className="text-emerald-600 dark:text-emerald-400">{savingsRate}%</strong>
          </span>
        </div>
      </div>

      {/* DTI Core Diagnostic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DTI Focus Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Debt-to-Income (DTI) Ratio
              </h3>
              <p className="text-[11px] text-slate-400">Monthly Debt Outflow vs Gross Income</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${dtiTier.badgeBg}`}>
              {dtiTier.label}
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <span className="text-6xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
              {dti}%
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatINR(totalEmi)} EMI on {formatINR(monthlyIncome)} Monthly Income
            </p>
          </div>

          {/* DTI Gauge bar */}
          <div className="space-y-1">
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '20%' }} title="Excellent (<20%)" />
              <div className="bg-teal-400 h-full" style={{ width: '15%' }} title="Healthy (20-35%)" />
              <div className="bg-amber-400 h-full" style={{ width: '10%' }} title="Moderate (36-45%)" />
              <div className="bg-rose-500 h-full flex-1" title="High (>45%)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span>20%</span>
              <span>35%</span>
              <span>50%+</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
            {dtiTier.description} In India, NBFCs and banks generally cap retail exposure at 40–50% of net verifiable income.
          </p>
        </div>

        {/* Cashflow Distribution Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Income Allocation
              </h3>
              <p className="text-[11px] text-slate-400">Total Inflow: {formatINR(monthlyIncome)}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Surplus: {formatINR(netSurplus)}
            </span>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cashflowData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cashflowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatINR(val), 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {savingsRate}%
              </span>
              <span className="text-[10px] text-slate-400">Saved</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
              <span className="text-[9px] block">Living</span>
              <span className="font-bold">{formatINR(livingExpenses)}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              <span className="text-[9px] block">EMIs</span>
              <span className="font-bold">{formatINR(totalEmi)}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              <span className="text-[9px] block">Surplus</span>
              <span className="font-bold">{formatINR(netSurplus)}</span>
            </div>
          </div>
        </div>

        {/* Solvency & Risk Indicators */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Solvency Risk Radar
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                <span>DTI Solvency</span>
                <span>Low Risk</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                DTI is {dti}%, comfortably within the safe banking limit of 35%.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Emergency Buffer</span>
                <span>Moderate</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatINR(profile?.emergency_fund_balance || 45000)} represents ~1.5 months of living expenses. Ideal target is 6 months ({formatINR(livingExpenses * 6)}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Revolving Card Exposure</span>
                <span>Healthy</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Utilization at {profile?.credit_utilization_ratio || 28}% remains below the 30% warning threshold.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Projected Cashflow Bar Chart */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              6-Month Cashflow & Prepayment Impact Simulation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Projected surplus expansion as personal loans are amortized and repaid.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded bg-blue-500" /> Living Costs
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-3 h-3 rounded bg-amber-500" /> EMI Outflow
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Net Savings
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px'
                }}
                formatter={(val: any, name: any) => [formatINR(val), name]}
              />
              <Bar dataKey="expenses" fill="#3b82f6" name="Living Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="emi" fill="#f59e0b" name="Loan EMI" radius={[4, 4, 0, 0]} />
              <Bar dataKey="surplus" fill="#10b981" name="Net Savings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DTI Benchmark Reference Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Indian Banking Industry DTI Benchmarks
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          How major Indian financial institutions (SBI, HDFC, ICICI, Axis) evaluate Debt-to-Income when approving credit:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {dtiBenchmarks.map((b, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white">{b.range}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {b.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerBanner variant="compact" />
    </div>
  );
};
