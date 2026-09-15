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

const STORAGE_KEYS = {
  USER: 'finhealth_user',
  PROFILE: 'finhealth_profile',
  TOKEN: 'finhealth_auth_token',
  CREDIT_HISTORY: 'finhealth_credit_history',
  LOANS: 'finhealth_loans',
  PAYMENTS: 'finhealth_payments',
  GOALS: 'finhealth_goals',
  RECOMMENDATIONS: 'finhealth_recommendations',
  NOTIFICATIONS: 'finhealth_notifications',
  CHAT_MESSAGES: 'finhealth_chat_messages',
};

// Default initial seed profile
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

export const defaultCreditHistory: CreditScoreRecord[] = [
  { id: 'ch_1', user_id: 'usr_alex_sharma', score: 690, recorded_at: '2025-01-15T00:00:00.000Z', note: 'Higher credit utilization' },
  { id: 'ch_2', user_id: 'usr_alex_sharma', score: 705, recorded_at: '2025-02-15T00:00:00.000Z', note: 'Paid down credit card balance' },
  { id: 'ch_3', user_id: 'usr_alex_sharma', score: 718, recorded_at: '2025-03-15T00:00:00.000Z', note: 'On-time personal loan EMI' },
  { id: 'ch_4', user_id: 'usr_alex_sharma', score: 730, recorded_at: '2025-04-15T00:00:00.000Z', note: 'Utilization dropped below 30%' },
  { id: 'ch_5', user_id: 'usr_alex_sharma', score: 742, recorded_at: '2025-05-15T00:00:00.000Z', note: 'Consistent disciplined payment record' },
];

export const defaultLoans: Loan[] = [
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

export const defaultPayments: Payment[] = [
  { id: 'pay_1', user_id: 'usr_alex_sharma', loan_name: 'HDFC Personal Loan EMI', amount: 9500, due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], type: 'EMI', status: 'upcoming' },
  { id: 'pay_2', user_id: 'usr_alex_sharma', loan_name: 'SBI Vehicle Loan EMI', amount: 5000, due_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0], type: 'EMI', status: 'upcoming' },
  { id: 'pay_3', user_id: 'usr_alex_sharma', loan_name: 'ICICI Coral Credit Card Bill', amount: 18500, due_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0], type: 'Credit Card', status: 'upcoming' },
];

export const defaultGoals: FinancialGoal[] = [
  { id: 'goal_1', user_id: 'usr_alex_sharma', title: 'Reach 780+ CIBIL Score', target_value: 780, current_value: 742, category: 'credit_score', target_date: '2025-12-31', status: 'in_progress' },
  { id: 'goal_2', user_id: 'usr_alex_sharma', title: 'Pay off HDFC Personal Loan Early', target_value: 195000, current_value: 105000, category: 'debt_payoff', target_date: '2026-03-31', status: 'in_progress' },
  { id: 'goal_3', user_id: 'usr_alex_sharma', title: 'Emergency Fund (6 Months Expenses)', target_value: 228000, current_value: 65000, category: 'emergency_fund', target_date: '2026-06-30', status: 'in_progress' },
];

export const defaultNotifications: Notification[] = [
  { id: 'notif_1', user_id: 'usr_alex_sharma', title: 'CIBIL Score Updated', message: 'Your estimated credit score increased by 12 points to 742.', type: 'success', is_read: false, created_at: new Date().toISOString() },
  { id: 'notif_2', user_id: 'usr_alex_sharma', title: 'Upcoming Loan EMI', message: 'HDFC Personal Loan EMI of ₹9,500 is due in 5 days.', type: 'info', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
];

export const clientStorage = {
  getUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getProfile(): FinancialProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return defaultAlexProfile;
    try { return JSON.parse(raw); } catch { return defaultAlexProfile; }
  },

  setProfile(profile: FinancialProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },

  initializeSession(user: Partial<User>, provider = 'google'): { user: User; profile: FinancialProfile; token: string } {
    const existingUser = this.getUser();
    const token = `finhealth_token_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const newUser: User = {
      id: user.id || existingUser?.id || `usr_${provider}_${Date.now()}`,
      name: user.name || existingUser?.name || `${provider.toUpperCase()} User`,
      email: user.email || existingUser?.email || `${provider}.user@example.com`,
      age: user.age || existingUser?.age || 28,
      employment: (user.employment as EmploymentStatus) || existingUser?.employment || 'salaried',
      avatar: user.avatar || existingUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      created_at: existingUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingProfile = this.getProfile();
    const newProfile: FinancialProfile = {
      ...defaultAlexProfile,
      ...existingProfile,
      user_id: newUser.id,
      updated_at: new Date().toISOString(),
    };

    this.setUser(newUser);
    this.setProfile(newProfile);
    this.setToken(token);

    if (!localStorage.getItem(STORAGE_KEYS.CREDIT_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.CREDIT_HISTORY, JSON.stringify(defaultCreditHistory));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(defaultLoans));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(defaultPayments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(defaultGoals));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    }

    return { user: newUser, profile: newProfile, token };
  },

  getLoans(): Loan[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!raw) return defaultLoans;
    try { return JSON.parse(raw); } catch { return defaultLoans; }
  },

  setLoans(loans: Loan[]): void {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  },

  getCreditHistory(): CreditScoreRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDIT_HISTORY);
    if (!raw) return defaultCreditHistory;
    try { return JSON.parse(raw); } catch { return defaultCreditHistory; }
  },

  getPayments(): Payment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) return defaultPayments;
    try { return JSON.parse(raw); } catch { return defaultPayments; }
  },

  getGoals(): FinancialGoal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) return defaultGoals;
    try { return JSON.parse(raw); } catch { return defaultGoals; }
  },

  getNotifications(): Notification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return defaultNotifications;
    try { return JSON.parse(raw); } catch { return defaultNotifications; }
  }
};
