import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider?: 'google' | 'github' | 'linkedin' | null;
  onSuccess?: () => void;
}

export const OAuthModal: React.FC<OAuthModalProps> = ({
  isOpen,
  onClose,
  selectedProvider = 'google',
  onSuccess,
}) => {
  const { simulateOAuthLogin } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'google' | 'github' | 'linkedin'>(selectedProvider || 'google');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedProvider) {
      setActiveTab(selectedProvider);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (isOpen) {
      api.getOAuthStatus().then(res => setConfig(res)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const providerNames: Record<string, string> = {
    google: 'Google Account',
    github: 'GitHub Developer',
    linkedin: 'LinkedIn Professional'
  };

  const providerIsConfigured = config && config[activeTab]?.available;

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      await simulateOAuthLogin(activeTab, email || undefined, name || undefined);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="oauth-config-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              FH
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                OAuth 2.0 Integration Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure Single Sign-On Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          {(['google', 'github', 'linkedin'] as const).map(p => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={`pb-2.5 px-3 text-xs font-semibold capitalize transition-all border-b-2 ${
                activeTab === p
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {providerIsConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {providerNames[activeTab]} Provider Status
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {providerIsConfigured
                  ? `Environment credentials (${activeTab.toUpperCase()}_CLIENT_ID) are configured in .env.`
                  : `Real client credentials for ${activeTab.toUpperCase()} can be configured via environment variables. For development and evaluation, you can use the instant sandbox sign-in below.`}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Instant Sandbox Single Sign-On
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`Alex via ${activeTab}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder={`user@${activeTab}.demo`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Token-based session authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : `Sign in with ${activeTab.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
