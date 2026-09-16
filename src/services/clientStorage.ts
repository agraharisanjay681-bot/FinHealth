import type { 
  User, 
  EmploymentStatus,
  FinancialProfile, 
  CreditScoreRecord, 
  Loan, 
  Payment, 
  FinancialGoal, 
  AIRecommendation, 
  ChatSession, 
  ChatMessage, 
  Notification 
} from '../types/index.js';

// Pre-seeded demo account for instant review mode (Alex Sharma)
export const defaultAlexUser: User = {
  id: 'usr_alex_sharma',
  name: 'Alex Sharma',
  email: 'alex.sharma@example.com',
  age: 29,
  employment: 'salaried',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  created_at: '2025-01-01T10:00:00.000Z',
  updated_at: new Date().toISOString(),
};

export const defaultAlexProfile: FinancialProfile = {
  id: 'prof_alex_sharma',
  user_id: 'usr_alex_sharma',
  monthly_income: 75000,
  other_income: 10000,
  monthly_expenses: 38000,
  essential_expenses: 26000,
  discretionary_expenses: 12000,
  current_credit_score: 742,
  previous_credit_score: 730,
  credit_cards_count: 2,
  total_credit_limit: 150000,
  credit_card_balance: 42000,
  total_debt: 280000,
  monthly_emi: 14500,
  active_loans_count: 2,
  missed_payments: 0,
  late_payments: 1,
  savings_balance: 110000,
  emergency_fund_balance: 65000,
  financial_health_score: 78,
  debt_to_income_ratio: 17,
  credit_utilization_ratio: 28,
  updated_at: new Date().toISOString(),
};

export const defaultAlexCreditHistory: CreditScoreRecord[] = [
  { id: 'ch_1', user_id: 'usr_alex_sharma', score: 690, recorded_at: '2025-01-15T00:00:00.000Z', note: 'Higher credit utilization' },
  { id: 'ch_2', user_id: 'usr_alex_sharma', score: 705, recorded_at: '2025-02-15T00:00:00.000Z', note: 'Paid down credit card balance' },
  { id: 'ch_3', user_id: 'usr_alex_sharma', score: 718, recorded_at: '2025-03-15T00:00:00.000Z', note: 'On-time personal loan EMI' },
  { id: 'ch_4', user_id: 'usr_alex_sharma', score: 730, recorded_at: '2025-04-15T00:00:00.000Z', note: 'Utilization dropped below 30%' },
  { id: 'ch_5', user_id: 'usr_alex_sharma', score: 742, recorded_at: '2025-05-15T00:00:00.000Z', note: 'Consistent disciplined payment record' },
];

export const defaultAlexLoans: Loan[] = [
  {
    id: 'loan_1',
    user_id: 'usr_alex_sharma',
    name: 'HDFC Personal Loan',
    type: 'Personal Loan',
    principal: 300000,
    remaining_amount: 195000,
    interest_rate: 11.5,
    emi: 9500,
    start_date: '2024-04-10',
    end_date: '2027-04-10',
    status: 'active',
    lender: 'HDFC Bank',
  },
  {
    id: 'loan_2',
    user_id: 'usr_alex_sharma',
    name: 'SBI Two-Wheeler Loan',
    type: 'Vehicle Loan',
    principal: 120000,
    remaining_amount: 85000,
    interest_rate: 9.2,
    emi: 5000,
    start_date: '2024-08-15',
    end_date: '2026-08-15',
    status: 'active',
    lender: 'State Bank of India',
  },
];

export const defaultAlexPayments: Payment[] = [
  { id: 'pay_1', user_id: 'usr_alex_sharma', loan_name: 'HDFC Personal Loan EMI', amount: 9500, due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], type: 'EMI', status: 'upcoming' },
  { id: 'pay_2', user_id: 'usr_alex_sharma', loan_name: 'SBI Vehicle Loan EMI', amount: 5000, due_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0], type: 'EMI', status: 'upcoming' },
  { id: 'pay_3', user_id: 'usr_alex_sharma', loan_name: 'ICICI Coral Credit Card Bill', amount: 18500, due_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0], type: 'Credit Card', status: 'upcoming' },
];

export const defaultAlexGoals: FinancialGoal[] = [
  { id: 'goal_1', user_id: 'usr_alex_sharma', title: 'Reach 780+ CIBIL Score', target_value: 780, current_value: 742, category: 'credit_score', target_date: '2025-12-31', status: 'in_progress' },
  { id: 'goal_2', user_id: 'usr_alex_sharma', title: 'Pay off HDFC Personal Loan Early', target_value: 195000, current_value: 105000, category: 'debt_payoff', target_date: '2026-03-31', status: 'in_progress' },
  { id: 'goal_3', user_id: 'usr_alex_sharma', title: 'Emergency Fund (6 Months Expenses)', target_value: 228000, current_value: 65000, category: 'emergency_fund', target_date: '2026-06-30', status: 'in_progress' },
];

export const defaultAlexNotifications: Notification[] = [
  { id: 'notif_1', user_id: 'usr_alex_sharma', title: 'CIBIL Score Updated', message: 'Your estimated credit score increased by 12 points to 742.', type: 'success', is_read: false, created_at: new Date().toISOString() },
  { id: 'notif_2', user_id: 'usr_alex_sharma', title: 'Upcoming Loan EMI', message: 'HDFC Personal Loan EMI of ₹9,500 is due in 5 days.', type: 'info', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
];

// Calculate Health Score (0-100) dynamically using Indian financial wellness benchmarks
export function calculateHealthScore(params: {
  creditScore: number;
  dti: number;
  utilization: number;
  missedPayments: number;
  latePayments: number;
  savingsRatio: number;
}): number {
  const { creditScore, dti, utilization, missedPayments, latePayments, savingsRatio } = params;

  // 1. Credit Score Component (35%)
  const creditFactor = Math.min(100, Math.max(0, ((creditScore - 300) / 600) * 100));

  // 2. DTI Component (25%)
  let dtiFactor = 100;
  if (dti > 55) dtiFactor = 20;
  else if (dti > 45) dtiFactor = 40;
  else if (dti > 35) dtiFactor = 65;
  else if (dti > 20) dtiFactor = 85;

  // 3. Utilization Component (20%)
  let utilFactor = 100;
  if (utilization > 50) utilFactor = 30;
  else if (utilization > 30) utilFactor = 60;
  else if (utilization > 20) utilFactor = 85;

  // 4. Payment History (10%)
  const paymentFactor = Math.max(0, 100 - (missedPayments * 30) - (latePayments * 15));

  // 5. Emergency Savings Coverage (10%)
  const savingsFactor = Math.min(100, Math.max(0, savingsRatio * 100));

  const total = Math.round(
    creditFactor * 0.35 +
    dtiFactor * 0.25 +
    utilFactor * 0.20 +
    paymentFactor * 0.10 +
    savingsFactor * 0.10
  );

  return Math.min(99, Math.max(15, total));
}

export const clientStorage = {
  // Active User Tracking
  getActiveUserId(): string {
    return localStorage.getItem('finhealth_active_user_id') || 'usr_alex_sharma';
  },

  setActiveUserId(id: string): void {
    localStorage.setItem('finhealth_active_user_id', id);
  },

  getToken(): string | null {
    return localStorage.getItem('finhealth_auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('finhealth_auth_token', token);
  },

  getUser(userId?: string): User | null {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_user_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexUser;
      return null;
    }
    try { return JSON.parse(raw); } catch { return null; }
  },

  setUser(user: User): void {
    this.setActiveUserId(user.id);
    localStorage.setItem(`finhealth_user_${user.id}`, JSON.stringify(user));
  },

  getProfile(userId?: string): FinancialProfile | null {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_profile_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexProfile;
      return null;
    }
    try { return JSON.parse(raw); } catch { return null; }
  },

  setProfile(profile: FinancialProfile): void {
    localStorage.setItem(`finhealth_profile_${profile.user_id}`, JSON.stringify(profile));
  },

  isOnboardingDone(userId?: string): boolean {
    const uid = userId || this.getActiveUserId();
    if (uid === 'usr_alex_sharma') return true;
    return localStorage.getItem(`finhealth_onboarding_done_${uid}`) === 'true';
  },

  setOnboardingDone(status: boolean, userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(`finhealth_onboarding_done_${uid}`, status ? 'true' : 'false');
  },

  clearAll(): void {
    const activeUid = this.getActiveUserId();
    localStorage.removeItem('finhealth_auth_token');
    localStorage.removeItem('finhealth_active_user_id');
  },

  // Initialize or restore session for a user
  initializeSession(user: Partial<User>, provider = 'google'): { 
    user: User; 
    profile: FinancialProfile | null; 
    token: string; 
    hasCompletedOnboarding: boolean 
  } {
    // 1. If explicitly Alex Sharma demo
    if (provider === 'demo' || user.id === 'usr_alex_sharma' || user.email === 'alex.sharma@example.com') {
      const alexUser = { ...defaultAlexUser };
      const alexProfile = { ...defaultAlexProfile };
      this.setUser(alexUser);
      this.setProfile(alexProfile);
      this.setOnboardingDone(true, alexUser.id);
      this.setLoans(defaultAlexLoans, alexUser.id);
      this.setPayments(defaultAlexPayments, alexUser.id);
      this.setGoals(defaultAlexGoals, alexUser.id);
      this.setCreditHistory(defaultAlexCreditHistory, alexUser.id);
      this.setNotifications(defaultAlexNotifications, alexUser.id);
      const token = `finhealth_demo_token_${Date.now()}`;
      this.setToken(token);
      return { user: alexUser, profile: alexProfile, token, hasCompletedOnboarding: true };
    }

    // 2. Real / New User Account
    const emailKey = (user.email || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const userId = user.id || `usr_${provider}_${emailKey || Date.now()}`;

    this.setActiveUserId(userId);
    const token = `finhealth_token_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.setToken(token);

    const existingUser = this.getUser(userId);
    const isAlreadyOnboarded = this.isOnboardingDone(userId);

    const activeUser: User = {
      id: userId,
      name: user.name || existingUser?.name || (user.email ? user.email.split('@')[0] : 'User'),
      email: user.email || existingUser?.email || `${provider}.user@example.com`,
      age: user.age || existingUser?.age || 26,
      employment: (user.employment as EmploymentStatus) || existingUser?.employment || 'salaried',
      avatar: user.avatar || existingUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      created_at: existingUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.setUser(activeUser);

    if (isAlreadyOnboarded) {
      const existingProfile = this.getProfile(userId);
      return { user: activeUser, profile: existingProfile, token, hasCompletedOnboarding: true };
    }

    // Brand new user: Start fresh, no demo loans attached!
    this.setOnboardingDone(false, userId);
    return { user: activeUser, profile: null, token, hasCompletedOnboarding: false };
  },

  // Save new user onboarding data and generate all personalized metrics dynamically
  completeUserOnboarding(userId: string, data: any): { profile: FinancialProfile } {
    const monthly_income = Number(data.monthly_income) || 0;
    const other_income = Number(data.other_income) || 0;
    const total_income = monthly_income + other_income;
    const monthly_expenses = Number(data.monthly_expenses) || 0;
    const essential_expenses = Number(data.essential_expenses) || Math.round(monthly_expenses * 0.7);
    const discretionary_expenses = Number(data.discretionary_expenses) || Math.max(0, monthly_expenses - essential_expenses);
    const current_credit_score = Number(data.current_credit_score) || 720;
    const total_credit_limit = Number(data.total_credit_limit) || 0;
    const credit_card_balance = Number(data.credit_card_balance) || 0;
    const credit_cards_count = Number(data.credit_cards_count) || (total_credit_limit > 0 ? 1 : 0);
    const total_debt = Number(data.total_debt) || 0;
    const monthly_emi = Number(data.monthly_emi) || 0;
    const active_loans_count = Number(data.active_loans_count) || (total_debt > 0 ? 1 : 0);
    const missed_payments = Number(data.missed_payments) || 0;
    const late_payments = Number(data.late_payments) || 0;
    const savings_balance = Number(data.savings_balance) || 0;
    const emergency_fund_balance = Number(data.emergency_fund_balance) || 0;

    const dti = total_income > 0 ? Math.round((monthly_emi / total_income) * 100) : 0;
    const util = total_credit_limit > 0 ? Math.round((credit_card_balance / total_credit_limit) * 100) : 0;
    const savingsRatio = monthly_expenses > 0 ? emergency_fund_balance / (monthly_expenses * 6) : 1;

    const healthScore = calculateHealthScore({
      creditScore: current_credit_score,
      dti,
      utilization: util,
      missedPayments: missed_payments,
      latePayments: late_payments,
      savingsRatio
    });

    const newProfile: FinancialProfile = {
      id: `prof_${userId}`,
      user_id: userId,
      monthly_income,
      other_income,
      monthly_expenses,
      essential_expenses,
      discretionary_expenses,
      current_credit_score,
      previous_credit_score: Math.max(300, current_credit_score - 10),
      credit_cards_count,
      total_credit_limit,
      credit_card_balance,
      total_debt,
      monthly_emi,
      active_loans_count,
      missed_payments,
      late_payments,
      savings_balance,
      emergency_fund_balance,
      financial_health_score: healthScore,
      debt_to_income_ratio: dti,
      credit_utilization_ratio: util,
      updated_at: new Date().toISOString(),
    };

    this.setProfile(newProfile);
    this.setOnboardingDone(true, userId);

    // Dynamic loans setup
    const userLoans: Loan[] = [];
    if (active_loans_count > 0 && total_debt > 0) {
      userLoans.push({
        id: `loan_${userId}_1`,
        user_id: userId,
        name: 'Personal / Primary Loan',
        type: 'Personal Loan',
        principal: total_debt,
        remaining_amount: total_debt,
        interest_rate: 10.5,
        emi: monthly_emi > 0 ? monthly_emi : Math.round(total_debt * 0.03),
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 86400000 * 3).toISOString().split('T')[0],
        status: 'active',
        lender: 'Commercial Lender'
      });
    }
    this.setLoans(userLoans, userId);

    // Dynamic payments setup
    const userPayments: Payment[] = [];
    if (monthly_emi > 0) {
      userPayments.push({
        id: `pay_${userId}_emi`,
        user_id: userId,
        loan_name: 'Monthly Loan EMI',
        amount: monthly_emi,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        type: 'EMI',
        status: 'upcoming'
      });
    }
    if (credit_card_balance > 0) {
      userPayments.push({
        id: `pay_${userId}_cc`,
        user_id: userId,
        loan_name: 'Credit Card Statement',
        amount: credit_card_balance,
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        type: 'Credit Card',
        status: 'upcoming'
      });
    }
    this.setPayments(userPayments, userId);

    // Dynamic credit history setup
    const userHistory: CreditScoreRecord[] = [
      {
        id: `ch_${userId}_init`,
        user_id: userId,
        score: current_credit_score,
        recorded_at: new Date().toISOString(),
        note: 'Diagnostic baseline credit record'
      }
    ];
    this.setCreditHistory(userHistory, userId);

    // Dynamic goals setup
    const userGoals: FinancialGoal[] = [
      {
        id: `goal_${userId}_1`,
        user_id: userId,
        title: data.primary_goal || 'Reach 750+ CIBIL Score',
        target_value: Math.max(780, current_credit_score + 30),
        current_value: current_credit_score,
        category: 'credit_score',
        target_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        status: 'in_progress'
      }
    ];
    if (emergency_fund_balance < monthly_expenses * 6 && monthly_expenses > 0) {
      userGoals.push({
        id: `goal_${userId}_2`,
        user_id: userId,
        title: 'Build 6-Month Emergency Fund',
        target_value: monthly_expenses * 6,
        current_value: emergency_fund_balance,
        category: 'emergency_fund',
        target_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        status: 'in_progress'
      });
    }
    this.setGoals(userGoals, userId);

    // Dynamic initial notifications
    const userNotifs: Notification[] = [
      {
        id: `notif_${userId}_welcome`,
        user_id: userId,
        title: 'Diagnostic Profile Complete',
        message: `Your FinHealth Score is computed at ${healthScore}/100 based on your submitted financials.`,
        type: 'success',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
    this.setNotifications(userNotifs, userId);

    return { profile: newProfile };
  },

  // Per-user collections
  getLoans(userId?: string): Loan[] {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_loans_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexLoans;
      return [];
    }
    try { return JSON.parse(raw); } catch { return []; }
  },

  setLoans(loans: Loan[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(`finhealth_loans_${uid}`, JSON.stringify(loans));
  },

  getCreditHistory(userId?: string): CreditScoreRecord[] {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_credit_history_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexCreditHistory;
      return [];
    }
    try { return JSON.parse(raw); } catch { return []; }
  },

  setCreditHistory(history: CreditScoreRecord[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(`finhealth_credit_history_${uid}`, JSON.stringify(history));
  },

  getPayments(userId?: string): Payment[] {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_payments_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexPayments;
      return [];
    }
    try { return JSON.parse(raw); } catch { return []; }
  },

  setPayments(payments: Payment[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(`finhealth_payments_${uid}`, JSON.stringify(payments));
  },

  getGoals(userId?: string): FinancialGoal[] {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_goals_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexGoals;
      return [];
    }
    try { return JSON.parse(raw); } catch { return []; }
  },

  setGoals(goals: FinancialGoal[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(`finhealth_goals_${uid}`, JSON.stringify(goals));
  },

  getNotifications(userId?: string): Notification[] {
    const uid = userId || this.getActiveUserId();
    const raw = localStorage.getItem(`finhealth_notifications_${uid}`);
    if (!raw) {
      if (uid === 'usr_alex_sharma') return defaultAlexNotifications;
      return [];
    }
    try { return JSON.parse(raw); } catch { return []; }
  },

  setNotifications(notifications: Notification[], userId?: string): void {
    const uid = userId || this.getActiveUserId();
    localStorage.setItem(`finhealth_notifications_${uid}`, JSON.stringify(notifications));
  }
};
