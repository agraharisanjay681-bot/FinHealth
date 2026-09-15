import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  IndianRupee, 
  Flame, 
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { api } from '../services/api.js';
import { formatINR, formatDate } from '../utils/formatters.js';
import type { Payment, Loan } from '../types/index.js';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPayment, setNewPayment] = useState({
    loan_id: '',
    amount: 12000,
    due_date: new Date().toISOString().split('T')[0],
    paid_date: new Date().toISOString().split('T')[0],
    status: 'paid' as Payment['status'],
    payment_method: 'Auto-Debit (NACH)',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, loanRes] = await Promise.all([
        api.getPayments(),
        api.getLoans()
      ]);
      setPayments(payRes.payments);
      setLoans(loanRes.loans);
      if (loanRes.loans.length > 0 && !newPayment.loan_id) {
        setNewPayment(prev => ({ ...prev, loan_id: loanRes.loans[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPayment(newPayment);
      await fetchData();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTimeStreak = 14; // Months of consecutive on-time payments
  const upcomingPayments = payments.filter(p => p.status === 'upcoming');
  const pastPayments = payments.filter(p => p.status !== 'upcoming');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Payment Discipline Tracker
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
            EMI & Credit Card Payment Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Maintain your clean payment record to protect the 35% payment history component of your CIBIL score.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Streak & Consistency Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">On-Time Payment Streak</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {onTimeStreak} Months
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% On-Time Record</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Payment History Weight</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              35% Factor
            </span>
            <p className="text-[11px] text-slate-500">Highest single CIBIL weight</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Next Upcoming Debits</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {upcomingPayments.length} Due Soon
            </span>
            <p className="text-[11px] text-slate-500">Scheduled via NACH / e-Mandate</p>
          </div>
        </div>
      </div>

      {/* Upcoming Payments Schedule */}
      {upcomingPayments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Upcoming Dues & Auto-Debits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingPayments.map((pay) => (
              <div
                key={pay.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/40 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {pay.loan_name || 'Loan EMI'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 uppercase">
                      Due Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Payment Method: {pay.payment_method}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Due Date: <strong className="text-slate-700 dark:text-slate-300">{formatDate(pay.due_date)}</strong>
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                    {formatINR(pay.amount)}
                  </span>
                  <span className="text-[11px] text-emerald-600 block font-semibold">
                    NACH Enabled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Payments Log Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Payment History Log
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Complete ledger of past EMI and card settlements verified against bank records.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="pb-3 font-semibold">Loan / Credit Account</th>
                <th className="pb-3 font-semibold">Amount Paid</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Paid Date</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pastPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-semibold text-slate-900 dark:text-white">
                    {pay.loan_name || 'Personal Loan EMI'}
                  </td>
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                    {formatINR(pay.amount)}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {formatDate(pay.due_date)}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {pay.paid_date ? formatDate(pay.paid_date) : '—'}
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {pay.payment_method}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      pay.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>On-Time Paid</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record EMI or Bill Payment
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Loan or Facility
                </label>
                <select
                  value={newPayment.loan_id}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, loan_id: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  {loans.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.lender}) - EMI: {formatINR(l.monthly_emi)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  required
                  step="500"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newPayment.due_date}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newPayment.paid_date}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, paid_date: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={newPayment.payment_method}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="Auto-Debit (NACH)">Auto-Debit (NACH / e-Mandate)</option>
                  <option value="UPI / Net Banking">UPI / Net Banking</option>
                  <option value="IMPS / NEFT">IMPS / NEFT Transfer</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
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
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
