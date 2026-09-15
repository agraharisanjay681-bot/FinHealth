import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Award, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { formatINR, formatDate } from '../utils/formatters.js';
import type { FinancialGoal } from '../types/index.js';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'credit_score' as FinancialGoal['category'],
    target_value: 780,
    current_value: 742,
    target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.getGoals();
      setGoals(res.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createGoal(newGoal);
      await fetchGoals();
      setIsAddModalOpen(false);
      setNewGoal({
        title: '',
        category: 'credit_score',
        target_value: 780,
        current_value: 742,
        target_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      await fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const badges = [
    { title: 'Good Credit Standing', desc: 'Maintained a CIBIL score above 740', icon: ShieldCheck, earned: true },
    { title: 'Utilization Champion', desc: 'Kept credit card balance below 30%', icon: Zap, earned: true },
    { title: 'Zero Missed Payments', desc: '100% timely EMI debits for 12+ months', icon: CheckCircle2, earned: true },
    { title: 'Emergency Cushion', desc: 'Secured ₹50,000+ in liquid reserves', icon: Award, earned: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Roadmap & Milestones
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            Financial Goals & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set ambitious financial targets and celebrate key financial independence milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Active Financial Targets ({goals.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
            const isCompleted = percent >= 100;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {goal.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      {goal.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      {goal.category === 'credit_score' ? `${goal.current_value} pts` : formatINR(goal.current_value)} / {goal.category === 'credit_score' ? `${goal.target_value} pts` : formatINR(goal.target_value)}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Target: {formatDate(goal.target_date)}
                  </span>
                  <span className={`text-[11px] font-bold ${isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isCompleted ? 'Achieved 🎉' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Achievements Badges */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Milestone Badges & Financial Discipline
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Unlock recognition as you fortify your credit profile and clear obligations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 flex flex-col justify-between ${
                  b.earned
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.earned ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.earned ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                    {b.earned ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Set New Financial Goal
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reach 780 CIBIL, Save Emergency Reserve"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Category
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="credit_score">Credit Score Target</option>
                  <option value="debt_payoff">Debt Payoff Target</option>
                  <option value="utilization">Credit Utilization Target</option>
                  <option value="emergency_fund">Emergency Fund Reserve</option>
                  <option value="savings">Savings Target</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Value
                  </label>
                  <input
                    type="number"
                    required
                    value={newGoal.current_value}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, current_value: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    required
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Achievement Date
                </label>
                <input
                  type="date"
                  required
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
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
                  {isSubmitting ? 'Saving...' : 'Set Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
