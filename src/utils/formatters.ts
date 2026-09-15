// Indian Currency Formatter with ₹ symbol and Lakhs/Crores grouping
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

export function formatCompactINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount}`;
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
}

// CIBIL Credit Score Tier & Color
export function getCreditScoreTier(score: number): {
  label: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  color: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
  description: string;
} {
  if (score >= 750) {
    return {
      label: 'Excellent',
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      barColor: 'bg-emerald-500',
      description: 'Lenders offer their lowest interest rates and quickest approvals.'
    };
  }
  if (score >= 700) {
    return {
      label: 'Good',
      color: 'text-teal-600 dark:text-teal-400',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      badgeText: 'text-teal-700 dark:text-teal-300',
      barColor: 'bg-teal-500',
      description: 'Healthy standing. Eligible for most competitive credit cards and loans.'
    };
  }
  if (score >= 650) {
    return {
      label: 'Fair',
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      badgeText: 'text-amber-700 dark:text-amber-300',
      barColor: 'bg-amber-500',
      description: 'Acceptable but interest rates may be higher. Room for improvement.'
    };
  }
  return {
    label: 'Poor',
    color: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    badgeText: 'text-rose-700 dark:text-rose-300',
    barColor: 'bg-rose-500',
    description: 'Higher rejection probability. Focus on clearing dues and reducing utilization.'
  };
}

// Financial Health Score Tier (0 - 100)
export function getHealthScoreTier(score: number): {
  label: 'Critical' | 'Moderate' | 'Healthy' | 'Excellent';
  color: string;
  badgeBg: string;
  badgeText: string;
} {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      badgeText: 'text-emerald-700 dark:text-emerald-300'
    };
  }
  if (score >= 68) {
    return {
      label: 'Healthy',
      color: 'text-teal-600 dark:text-teal-400',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800',
      badgeText: 'text-teal-700 dark:text-teal-300'
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate',
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      badgeText: 'text-amber-700 dark:text-amber-300'
    };
  }
  return {
    label: 'Critical',
    color: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    badgeText: 'text-rose-700 dark:text-rose-300'
  };
}

// DTI Tier
export function getDtiTier(dti: number): {
  label: 'Excellent' | 'Healthy' | 'Moderate' | 'High' | 'Critical';
  color: string;
  badgeBg: string;
  description: string;
} {
  if (dti <= 20) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', description: 'Exceptional debt profile; low risk to any Indian retail lender.' };
  if (dti <= 35) return { label: 'Healthy', color: 'text-teal-600 dark:text-teal-400', badgeBg: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300', description: 'Standard benchmark threshold; well-balanced obligations.' };
  if (dti <= 45) return { label: 'Moderate', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', description: 'Moderate leverage; avoid acquiring additional retail liabilities.' };
  if (dti <= 55) return { label: 'High', color: 'text-orange-600 dark:text-orange-400', badgeBg: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300', description: 'High debt concentration; focus on rapid payoff strategies.' };
  return { label: 'Critical', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', description: 'Overleveraged; monthly EMI burden significantly strains income.' };
}

// Credit Utilization Tier
export function getUtilizationTier(util: number): {
  label: 'Optimal' | 'Healthy' | 'Elevated' | 'Critical';
  color: string;
  badgeBg: string;
} {
  if (util <= 20) return { label: 'Optimal', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' };
  if (util <= 30) return { label: 'Healthy', color: 'text-teal-600 dark:text-teal-400', badgeBg: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' };
  if (util <= 50) return { label: 'Elevated', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' };
  return { label: 'Critical', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' };
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}
