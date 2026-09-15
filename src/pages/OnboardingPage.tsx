import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  IndianRupee, 
  CreditCard, 
  Receipt, 
  Target, 
  CalendarCheck, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const OnboardingPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: user?.name || 'Alex Sharma',
    age: 28,
    employment: 'salaried',

    // Step 2: Income
    monthly_income: 65000,
    other_income: 10000,

    // Step 3: Expenses
    monthly_expenses: 32000,
    essential_expenses: 22000,
    discretionary_expenses: 10000,

    // Step 4: Credit
    current_credit_score: 720,
    credit_cards_count: 2,
    total_credit_limit: 120000,
    credit_card_balance: 30000,

    // Step 5: Debt
    total_debt: 210000,
    monthly_emi: 12000,
    active_loans_count: 1,

    // Step 6: Payment History
    missed_payments: 0,
    late_payments: 0,

    // Step 7: Savings & Goals
    savings_balance: 85000,
    emergency_fund_balance: 45000,
    primary_goal: 'Improve Credit Score',
  });

  const steps = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Income', icon: IndianRupee },
    { num: 3, label: 'Expenses', icon: Receipt },
    { num: 4, label: 'Credit', icon: CreditCard },
    { num: 5, label: 'Debt & EMI', icon: Receipt },
    { num: 6, label: 'Payments', icon: CalendarCheck },
    { num: 7, label: 'Goals', icon: Target },
  ];

  const updateField = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.completeOnboarding(formData);
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      setIsSubmitting(false);
    }
  };

  const goalsList = [
    { title: 'Improve credit score (Reach 750+ CIBIL)', desc: 'Optimize utilization and build prime credit eligibility.' },
    { title: 'Reduce active debt burden', desc: 'Accelerate repayments on personal and high-interest loans.' },
    { title: 'Lower credit card utilization (<20%)', desc: 'Keep revolving balances low before statement generation.' },
    { title: 'Build a 6-month emergency fund', desc: 'Ensure liquid safety net for unexpected medical or career events.' },
    { title: 'Improve overall financial stability', desc: 'Maintain disciplined DTI and steady savings rate.' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FinHealth Diagnostic Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Set Up Your Financial Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Step {currentStep} of 7 — FinHealth uses this to generate your calculated Health Score and AI recommendations.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="hidden sm:flex items-center justify-between relative px-2">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] font-semibold ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Step Bar */}
        <div className="sm:hidden space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>Step {currentStep}: {steps[currentStep - 1].label}</span>
            <span>{Math.round((currentStep / 7) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* STEP 1: Personal */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Basic details to tailor your financial demographics.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={(e) => updateField('age', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employment Status
                    </label>
                    <select
                      value={formData.employment}
                      onChange={(e) => updateField('employment', e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="salaried">Salaried Professional</option>
                      <option value="self_employed">Self-Employed / Freelance</option>
                      <option value="business_owner">Business Owner</option>
                      <option value="student">Student</option>
                      <option value="unemployed">Between Roles</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Income */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Income
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your recurring monthly earnings in Indian Rupees (₹).
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Net Monthly Salary / Income (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.monthly_income}
                    onChange={(e) => updateField('monthly_income', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">In-hand post tax amount</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Other Regular Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.other_income}
                    onChange={(e) => updateField('other_income', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Rental, freelancing, dividends, etc.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Expenses */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Expenses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimate your living costs (excluding loan EMIs).
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Monthly Living Expenses (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.monthly_expenses}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      updateField('monthly_expenses', total);
                      updateField('essential_expenses', Math.round(total * 0.7));
                      updateField('discretionary_expenses', Math.round(total * 0.3));
                    }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Essential Expenses (₹)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={formData.essential_expenses}
                      onChange={(e) => updateField('essential_expenses', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Rent, groceries, utilities</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Discretionary Expenses (₹)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={formData.discretionary_expenses}
                      onChange={(e) => updateField('discretionary_expenses', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Dining, shopping, leisure</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Credit */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Credit & CIBIL Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Self-reported credit score (300 to 900) and card details.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Estimated Current Credit Score (CIBIL / Experian)
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {formData.current_credit_score}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="900"
                    step="5"
                    value={formData.current_credit_score}
                    onChange={(e) => updateField('current_credit_score', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>300 (Poor)</span>
                    <span>650 (Fair)</span>
                    <span>750 (Good)</span>
                    <span>900 (Excellent)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Credit Cards Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={formData.credit_cards_count}
                      onChange={(e) => updateField('credit_cards_count', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Credit Limit (₹)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={formData.total_credit_limit}
                      onChange={(e) => updateField('total_credit_limit', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Outstanding Credit Card Balance (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.credit_card_balance}
                    onChange={(e) => updateField('credit_card_balance', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Calculated Utilization: {formData.total_credit_limit > 0 ? Math.round((formData.credit_card_balance / formData.total_credit_limit) * 100) : 0}% (Ideal is under 30%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Debt */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Debt & Monthly EMIs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track active loans and overall commitments.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Outstanding Loan Debt (₹)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.total_debt}
                    onChange={(e) => updateField('total_debt', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Sum of personal, vehicle, education, home loan principals</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Monthly EMI Outflow (₹)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={formData.monthly_emi}
                      onChange={(e) => updateField('monthly_emi', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Active Loans Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.active_loans_count}
                      onChange={(e) => updateField('active_loans_count', Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Payment History */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment Track Record
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Payment consistency accounts for ~35% of your credit bureau score.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Missed Payments (Last 24m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={formData.missed_payments}
                    onChange={(e) => updateField('missed_payments', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Payments defaulted &gt;90 days</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Late Payments (Last 24m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={formData.late_payments}
                    onChange={(e) => updateField('late_payments', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Payments delayed 1–30 days</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>On-time payments are the single most effective way to protect your CIBIL rating.</span>
              </div>
            </div>
          )}

          {/* STEP 7: Goals & Confirmation */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Financial Goals & Safety Cushion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your primary objective to calibrate your 90-day AI roadmap.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Liquid Savings (₹)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.savings_balance}
                    onChange={(e) => updateField('savings_balance', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Fund Reserve (₹)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={formData.emergency_fund_balance}
                    onChange={(e) => updateField('emergency_fund_balance', Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Your Primary Financial Goal
                </label>
                <div className="space-y-2">
                  {goalsList.map((g, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.primary_goal === g.title
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="primary_goal"
                        checked={formData.primary_goal === g.title}
                        onChange={() => updateField('primary_goal', g.title)}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {g.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {g.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Analyzing Health...' : 'Generate My Financial Health Report'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
