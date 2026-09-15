import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Download, 
  Trash2, 
  Lock, 
  Moon, 
  Sun, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Key,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { api } from '../services/api.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';
import { formatINR } from '../utils/formatters.js';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || profile?.age || 28);
  const [employment, setEmployment] = useState(user?.employment || profile?.employment_status || 'salaried');
  const [income, setIncome] = useState(profile?.monthly_income || 85000);
  const [expenses, setExpenses] = useState(profile?.monthly_expenses || 38000);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateProfile({
        name,
        age,
        employment_status: employment,
        monthly_income: income,
        monthly_expenses: expenses,
      });
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finhealth_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your FinHealth account and erase all stored financial records? This action cannot be undone.')) {
      try {
        await api.deleteAccount();
        logout();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Account & Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mt-1">
          Profile & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your financial demographics, data privacy, display themes, and credentials.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal & Financial Demographics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updating these recalculates your Financial Health Score and DTI ratio.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Email (Login ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Status
              </label>
              <select
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              >
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self-Employed</option>
                <option value="business_owner">Business Owner</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Net Monthly In-Hand Income (₹)
              </label>
              <input
                type="number"
                step="1000"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preferences & Appearance */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Display & Appearance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize the aesthetic mode of FinHealth across your sessions.
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Interface Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Switch to Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Connected Accounts & OAuth */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Connected Identities & Single Sign-On
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Link or manage third-party authentication providers.
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-slate-900 dark:text-white">Google OAuth</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Connected
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Primary Single Sign-On</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-slate-900 dark:text-white">GitHub OAuth</span>
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                Available
              </span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline">
              Connect
            </span>
          </div>
        </div>
      </div>

      {/* Data Sovereignty & Account Danger Zone */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Data Sovereignty & Privacy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You own your financial data. Export your full records at any time in machine-readable JSON format.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Export Complete Financial Archive
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Includes credit history, active loans, payment ledgers, goals, and AI syntheses.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-rose-100 dark:border-rose-950/40 space-y-3">
          <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Danger Zone
          </h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Permanently Delete Account
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Irreversibly wipe all credentials, profile entries, and financial history from the server.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      </div>

      <DisclaimerBanner variant="full" />
    </div>
  );
};
