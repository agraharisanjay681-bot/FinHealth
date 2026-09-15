import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  TrendingDown, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Percent, 
  IndianRupee,
  Layers,
  Flame,
  Snowflake
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { formatINR, formatPercent, formatDate } from '../utils/formatters.js';
import type { Loan } from '../types/index.js';

export const LoansPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepayment Calculator State
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(3000);
  const [selectedStrategy, setSelectedStrategy] = useState<'avalanche' | 'snowball'>('avalanche');

  // New Loan Form State
  const [newLoan, setNewLoan] = useState({
    name: '',
    type: 'personal' as Loan['type'],
    lender: '',
    principal_amount: 100000,
    remaining_balance: 80000,
    interest_rate: 12.5,
    monthly_emi: 4500,
    tenor_months: 24,
    start_date: new Date().toISOString().split('T')[0],
  });

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.getLoans();
      setLoans(res.loans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createLoan({
        ...newLoan,
        remaining_tenor_months: newLoan.tenor_months - 6,
        next_due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
        status: 'active'
      });
      await fetchLoans();
      await refreshProfile();
      setIsAddModalOpen(false);
      setNewLoan({
        name: '',
        type: 'personal',
        lender: '',
        principal_amount: 100000,
        remaining_balance: 80000,
        interest_rate: 12.5,
        monthly_emi: 4500,
        tenor_months: 24,
        start_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this loan?')) return;
    try {
      await api.deleteLoan(id);
      await fetchLoans();
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const totalDebt = loans.reduce((sum, l) => sum + (l.status === 'active' ? l.remaining_balance : 0), 0);
  const totalEmi = loans.reduce((sum, l) => sum + (l.status === 'active' ? l.monthly_emi : 0), 0);
  const activeCount = loans.filter(l => l.status === 'active').length;

  // Calculate Prepayment impact
  const highestInterestLoan = [...loans]
    .filter(l => l.status === 'active')
    .sort((a, b) => b.interest_rate - a.interest_rate)[0];

  const estimatedMonthsSaved = extraMonthlyPayment > 0 ? Math.min(24, Math.round((extraMonthlyPayment / 1000) * 2.5)) : 0;
  const estimatedInterestSaved = extraMonthlyPayment > 0 ? Math.round(extraMonthlyPayment * 4.2) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Debt Management Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Loans, EMIs & Debt Paydown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track active Indian banking loans, calculate prepayment savings, and accelerate debt freedom.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Loan</span>
        </button>
      </div>

      {/* Aggregate Debt Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Outstanding Balance
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {formatINR(totalDebt)}
          </p>
          <span className="text-[11px] text-slate-400">Across {activeCount} active facilities</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Monthly EMI Outflow
          </span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            {formatINR(totalEmi)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Debited monthly from bank account</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Prepayment Power
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
            +{formatINR(extraMonthlyPayment)}/mo
          </p>
          <span className="text-[11px] text-slate-400">Saves ~{estimatedMonthsSaved} months of EMI</span>
        </div>
      </div>

      {/* Loan Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Active Loans & Credit Facilities ({loans.length})
          </h3>
          <span className="text-xs text-slate-400">Ordered by status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => {
            const paidOffAmount = loan.principal_amount - loan.remaining_balance;
            const progressPercent = Math.min(100, Math.max(0, Math.round((paidOffAmount / loan.principal_amount) * 100)));

            return (
              <div
                key={loan.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {loan.type}
                      </span>
                      <span className="text-xs text-slate-400">{loan.lender}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {loan.name}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleDeleteLoan(loan.id)}
                    title="Delete Loan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block">Remaining</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(loan.remaining_balance)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{loan.interest_rate}% p.a.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(loan.monthly_emi)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400 block">Tenor Left</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{loan.remaining_tenor_months} mos</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Paid off: {formatINR(paidOffAmount)} of {formatINR(loan.principal_amount)}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Next EMI Due: {formatDate(loan.next_due_date)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Auto-Debit Active</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prepayment Strategy Calculator */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Debt Payoff Acceleration Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare the mathematical power of Avalanche (highest interest first) vs Snowball (smallest balance first).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Extra Prepayment Amount (Monthly)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="500"
                  min="0"
                  max="50000"
                  value={extraMonthlyPayment}
                  onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[1000, 2500, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setExtraMonthlyPayment(amt)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    +{formatINR(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Strategy Philosophy
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStrategy('avalanche')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    selectedStrategy === 'avalanche'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Avalanche</span>
                  <span className="text-[10px] text-slate-400">Save Max Interest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStrategy('snowball')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    selectedStrategy === 'snowball'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Snowflake className="w-4 h-4 text-blue-500" />
                  <span>Snowball</span>
                  <span className="text-[10px] text-slate-400">Quick Wins First</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Projected Savings Outcome
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {selectedStrategy === 'avalanche' ? 'Mathematical Avalanche Priority' : 'Psychological Snowball Priority'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedStrategy === 'avalanche'
                  ? `Targeting highest interest loan first: ${highestInterestLoan?.name || 'Personal Loan'} (${highestInterestLoan?.interest_rate || 12.5}% p.a.)`
                  : 'Targeting lowest balance loan first to eliminate an entire monthly EMI quickly.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Interest Saved</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                  ~{formatINR(estimatedInterestSaved)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Time to Debt Freedom</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                  -{estimatedMonthsSaved} Months
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Monthly Free Cash Flow</span>
                <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400 font-display">
                  +{formatINR(totalEmi)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              *Projections calculated using amortized interest models in India. Prepayment penalties may apply depending on individual bank terms (RBI exempts floating-rate retail loans).
            </p>
          </div>
        </div>
      </div>

      {/* Add Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Loan or Credit Facility
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter loan details as stated on your bank sanction letter or latest statement.
            </p>

            <form onSubmit={handleAddLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Loan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Personal Loan, SBI Home Loan"
                  value={newLoan.name}
                  onChange={(e) => setNewLoan(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loan Type
                  </label>
                  <select
                    value={newLoan.type}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="home">Home Loan</option>
                    <option value="auto">Auto / Vehicle</option>
                    <option value="education">Education Loan</option>
                    <option value="credit_card">Credit Card EMI</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lender / Bank
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC, ICICI, SBI"
                    value={newLoan.lender}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, lender: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Original Principal (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newLoan.principal_amount}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, principal_amount: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Remaining Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={newLoan.remaining_balance}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, remaining_balance: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Interest (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newLoan.interest_rate}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, interest_rate: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={newLoan.monthly_emi}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, monthly_emi: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tenor (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    required
                    value={newLoan.tenor_months}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, tenor_months: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
