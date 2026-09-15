import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'horizontal' | 'vertical' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showBadge = true,
  badgeText = 'AI',
  className = '',
}) => {
  const iconSizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizeMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 max-w-[240px]">
          <img
            src="/logo.png"
            alt="FinHealth - Understand Your Money. Improve Your Credit. Build Your Future."
            className="w-full h-auto object-contain rounded-xl"
          />
        </div>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div
        className={`relative ${iconSizeMap[size]} rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-0.5 group-hover:scale-105 transition-all duration-200 ${className}`}
      >
        <img
          src="/logo.png"
          alt="FinHealth Logo"
          className="w-full h-full object-cover object-top scale-[1.35] translate-y-1"
        />
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div
          className={`${iconSizeMap[size]} rounded-2xl overflow-hidden shadow-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1`}
        >
          <img
            src="/logo.png"
            alt="FinHealth Logo"
            className="w-full h-full object-cover object-top scale-[1.35] translate-y-1"
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight font-display text-slate-900 dark:text-white ${textSizeMap[size]}`}>
              <span className="text-slate-900 dark:text-white">Fin</span>
              <span className="text-emerald-600 dark:text-emerald-400">Health</span>
            </span>
            {showBadge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                {badgeText}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Credit & Wealth Platform
          </span>
        </div>
      </div>
    );
  }

  // Default: horizontal variant
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${iconSizeMap[size]} rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-0.5 shrink-0 group-hover:scale-105 transition-all duration-200`}
      >
        <img
          src="/logo.png"
          alt="FinHealth Logo"
          className="w-full h-full object-cover object-top scale-[1.35] translate-y-1"
        />
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight font-display ${textSizeMap[size]}`}>
            <span className="text-slate-900 dark:text-white">Fin</span>
            <span className="text-emerald-600 dark:text-emerald-400">Health</span>
          </span>
          {showBadge && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {badgeText}
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline mt-0.5">
          Credit & Wealth Platform
        </span>
      </div>
    </div>
  );
};
