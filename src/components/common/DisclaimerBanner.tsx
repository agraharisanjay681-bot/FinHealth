import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ variant = 'compact', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div 
        id="finhealth-disclaimer-compact"
        className={`flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60 ${className}`}
      >
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
        <p className="leading-tight">
          <strong className="font-semibold text-slate-600 dark:text-slate-300">Notice:</strong> FinHealth provides educational insights and self-reported score tracking. It does not replace professional financial advice or official CIBIL reports.
        </p>
      </div>
    );
  }

  return (
    <div 
      id="finhealth-disclaimer-full"
      className={`p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200/90 flex gap-3 ${className}`}
    >
      <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-amber-950 dark:text-amber-100 text-sm">
          Regulatory & Financial Disclaimer
        </p>
        <p className="leading-relaxed opacity-90">
          FinHealth provides educational financial information and personalized insights based on user-provided data. It does not provide guaranteed financial outcomes, official CIBIL scores, banking services, loans, investment advice, or professional financial advice. All credit scores displayed are user-provided or simulated educational estimates.
        </p>
      </div>
    </div>
  );
};
