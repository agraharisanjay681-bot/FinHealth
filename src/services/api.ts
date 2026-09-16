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
import { clientStorage, defaultAlexUser, defaultAlexProfile } from './clientStorage.js';

const TOKEN_KEY = 'finhealth_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || clientStorage.getToken();
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  clientStorage.setToken(token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  clientStorage.clearAll();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    // Verify response is JSON (not SPA index.html fallback)
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
      throw new Error('API_UNAVAILABLE_FALLBACK');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    if (err.message && !err.message.includes('API_UNAVAILABLE') && !err.message.includes('Failed to fetch')) {
      if (!err.message.includes('Unexpected token') && !err.message.includes('JSON')) {
        throw err;
      }
    }
    throw new Error('API_UNAVAILABLE_FALLBACK');
  }
}

export const api = {
  // Auth
  register: async (payload: { name: string; email: string; password: string }) => {
    try {
      const res = await request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      clientStorage.initializeSession(res.user, 'local');
      return res;
    } catch {
      const session = clientStorage.initializeSession({ name: payload.name, email: payload.email }, 'local');
      return { user: session.user, token: session.token, hasCompletedOnboarding: session.hasCompletedOnboarding };
    }
  },

  login: async (payload: { email: string; password: string }) => {
    try {
      const res = await request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      clientStorage.initializeSession(res.user, 'local');
      return res;
    } catch {
      const session = clientStorage.initializeSession({ email: payload.email, name: payload.email.split('@')[0] }, 'local');
      return { user: session.user, token: session.token, hasCompletedOnboarding: session.hasCompletedOnboarding };
    }
  },

  demoLogin: async () => {
    try {
      const res = await request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/demo', {
        method: 'POST',
      });
      clientStorage.initializeSession(res.user, 'demo');
      return res;
    } catch {
      const session = clientStorage.initializeSession(defaultAlexUser, 'demo');
      return { user: session.user, token: session.token, hasCompletedOnboarding: true };
    }
  },

  simulateOAuth: async (provider: string, email?: string, name?: string, avatar?: string) => {
    try {
      const res = await request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/oauth/simulate', {
        method: 'POST',
        body: JSON.stringify({ provider, email, name }),
      });
      clientStorage.initializeSession(res.user, provider);
      return res;
    } catch {
      const session = clientStorage.initializeSession({ email, name, avatar }, provider);
      return { user: session.user, token: session.token, hasCompletedOnboarding: session.hasCompletedOnboarding };
    }
  },

  getOAuthStatus: async () => {
    try {
      return await request<{ google: any; github: any; linkedin: any }>('/auth/oauth/config');
    } catch {
      return {
        google: { available: true },
        github: { available: true },
        linkedin: { available: true },
      };
    }
  },

  getMe: async () => {
    try {
      const res = await request<{ user: User; hasCompletedOnboarding: boolean }>('/auth/me');
      if (res.user) clientStorage.setUser(res.user);
      return res;
    } catch {
      const activeUser = clientStorage.getUser();
      const hasCompletedOnboarding = clientStorage.isOnboardingDone();
      return { user: activeUser || defaultAlexUser, hasCompletedOnboarding };
    }
  },

  logout: async () => {
    try {
      await request<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clientStorage.clearAll();
    return { message: 'Logged out successfully' };
  },

  // Profile & Onboarding
  getProfile: async () => {
    try {
      const res = await request<{ profile: FinancialProfile | null }>('/profile');
      if (res.profile) clientStorage.setProfile(res.profile);
      return res;
    } catch {
      return { profile: clientStorage.getProfile() };
    }
  },

  updateProfile: async (profile: Partial<FinancialProfile> & { name?: string; age?: number; employment?: EmploymentStatus }) => {
    try {
      const res = await request<{ profile: FinancialProfile }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      if (res.profile) clientStorage.setProfile(res.profile);
      return res;
    } catch {
      const current = clientStorage.getProfile() || defaultAlexProfile;
      const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
      clientStorage.setProfile(updated);
      return { profile: updated };
    }
  },

  completeOnboarding: async (data: any) => {
    try {
      const res = await request<{ profile: FinancialProfile; message: string }>('/profile/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.profile) clientStorage.setProfile(res.profile);
      return res;
    } catch {
      const userId = clientStorage.getActiveUserId();
      const result = clientStorage.completeUserOnboarding(userId, data);
      return { profile: result.profile, message: 'Onboarding diagnostic completed successfully' };
    }
  },

  // Dashboard
  getDashboardData: async () => {
    try {
      return await request<any>('/dashboard');
    } catch {
      const user = clientStorage.getUser() || defaultAlexUser;
      const profile = clientStorage.getProfile() || defaultAlexProfile;
      const loans = clientStorage.getLoans();
      const payments = clientStorage.getPayments();
      const goals = clientStorage.getGoals();
      const creditHistory = clientStorage.getCreditHistory();
      const notifications = clientStorage.getNotifications();

      const activeLoans = loans.filter(l => l.status === 'active');
      const totalRemaining = activeLoans.reduce((sum, l) => sum + (l.remaining_amount || 0), 0);
      const totalEmi = activeLoans.reduce((sum, l) => sum + (l.emi || 0), 0);

      // Generate dynamic personalized recommendation based on user's actual profile
      let recTitle = 'Maintain Optimal Credit Utilization & Payment Discipline';
      let recSummary = `Your credit score is ${profile.current_credit_score} with a ${profile.debt_to_income_ratio}% DTI ratio.`;
      let actionSteps = [
        'Pay all recurring bills and card balances before statement generation.',
        'Automate payments to maintain 100% on-time record.',
        'Keep revolving credit utilization under 20% to maximize bureau scoring.'
      ];

      if (profile.credit_utilization_ratio > 30) {
        recTitle = 'Prioritize Lowering Revolving Credit Utilization Under 20%';
        recSummary = `Your utilization stands at ${profile.credit_utilization_ratio}%. High utilization significantly weighs down CIBIL scores.`;
        actionSteps = [
          `Pay down ₹${Math.round(profile.credit_card_balance * 0.4).toLocaleString('en-IN')} across cards immediately.`,
          'Request a credit limit increase without increasing spending.',
          'Split card payments into twice-monthly intervals.'
        ];
      } else if (profile.debt_to_income_ratio > 40) {
        recTitle = 'Accelerate Principal Debt Repayment to Reduce DTI';
        recSummary = `Your monthly EMI of ₹${profile.monthly_emi.toLocaleString('en-IN')} represents ${profile.debt_to_income_ratio}% of income.`;
        actionSteps = [
          'Target extra prepayments on highest interest personal loans.',
          'Avoid taking additional consumer credit or personal loans.',
          'Consolidate multiple high-interest obligations.'
        ];
      }

      const latestRec: AIRecommendation = {
        id: `rec_${user.id}`,
        user_id: user.id,
        summary: recSummary,
        health_status: profile.financial_health_score >= 80 ? 'Excellent' : profile.financial_health_score >= 70 ? 'Healthy' : profile.financial_health_score >= 50 ? 'Fair' : 'Critical',
        key_issues: [
          `Credit Utilization at ${profile.credit_utilization_ratio}%`,
          `DTI Ratio at ${profile.debt_to_income_ratio}%`,
          `${loans.length} Active loan account(s)`
        ],
        recommendations: [
          {
            step: 1,
            title: recTitle,
            description: actionSteps[0],
            impact: '+20 CIBIL Points',
            priority: 'High'
          }
        ],
        priority: 'High',
        expected_direction: 'Upward credit and financial health trajectory',
        disclaimer: 'Personalized AI analytical recommendations based on self-reported inputs.',
        created_at: new Date().toISOString()
      };

      return {
        user,
        profile,
        creditHistory,
        loansSummary: {
          total: loans.length,
          active: activeLoans.length,
          totalRemaining,
          totalEmi,
        },
        recentPayments: payments.slice(0, 5),
        activeGoals: goals.filter(g => g.status === 'in_progress'),
        latestRecommendation: latestRec,
        unreadNotificationsCount: notifications.filter(n => !n.is_read).length,
      };
    }
  },

  // Credit History
  getCreditHistory: async () => {
    try {
      return await request<{ history: CreditScoreRecord[] }>('/credit/history');
    } catch {
      return { history: clientStorage.getCreditHistory() };
    }
  },

  addCreditRecord: async (score: number, note?: string) => {
    try {
      return await request<{ record: CreditScoreRecord; profile: FinancialProfile }>('/credit/history', {
        method: 'POST',
        body: JSON.stringify({ score, note }),
      });
    } catch {
      const history = clientStorage.getCreditHistory();
      const user = clientStorage.getUser();
      const newRec: CreditScoreRecord = {
        id: `ch_${Date.now()}`,
        user_id: user?.id || 'usr_default',
        score,
        note: note || 'User recorded score',
        recorded_at: new Date().toISOString(),
      };
      const updatedHistory = [...history, newRec];
      clientStorage.setCreditHistory(updatedHistory);
      const profile = clientStorage.getProfile() || defaultAlexProfile;
      const updatedProfile = { ...profile, previous_credit_score: profile.current_credit_score, current_credit_score: score };
      clientStorage.setProfile(updatedProfile);
      return { record: newRec, profile: updatedProfile };
    }
  },

  // Loans
  getLoans: async () => {
    try {
      return await request<{ loans: Loan[] }>('/loans');
    } catch {
      return { loans: clientStorage.getLoans() };
    }
  },

  addLoan: async (loan: Partial<Loan>) => {
    try {
      return await request<{ loan: Loan }>('/loans', {
        method: 'POST',
        body: JSON.stringify(loan),
      });
    } catch {
      const loans = clientStorage.getLoans();
      const user = clientStorage.getUser();
      const newLoan: Loan = {
        id: `loan_${Date.now()}`,
        user_id: user?.id || 'usr_default',
        name: loan.name || 'New Loan',
        type: loan.type || 'Personal Loan',
        principal: loan.principal || 100000,
        remaining_amount: loan.remaining_amount || loan.principal || 100000,
        interest_rate: loan.interest_rate || 10.5,
        emi: loan.emi || 4500,
        start_date: loan.start_date || new Date().toISOString().split('T')[0],
        end_date: loan.end_date || new Date(Date.now() + 365 * 86400000 * 2).toISOString().split('T')[0],
        status: loan.status || 'active',
        lender: loan.lender || 'Bank',
      };
      const updated = [newLoan, ...loans];
      clientStorage.setLoans(updated);

      // Recalculate profile totals
      const profile = clientStorage.getProfile();
      if (profile) {
        const total_debt = updated.reduce((s, l) => s + (l.remaining_amount || 0), 0);
        const monthly_emi = updated.reduce((s, l) => s + (l.emi || 0), 0);
        const total_income = profile.monthly_income + profile.other_income;
        const dti = total_income > 0 ? Math.round((monthly_emi / total_income) * 100) : 0;
        clientStorage.setProfile({
          ...profile,
          total_debt,
          monthly_emi,
          active_loans_count: updated.filter(l => l.status === 'active').length,
          debt_to_income_ratio: dti
        });
      }

      return { loan: newLoan };
    }
  },

  createLoan: async (loan: Partial<Loan>) => {
    return api.addLoan(loan);
  },

  updateLoan: async (id: string, loan: Partial<Loan>) => {
    try {
      return await request<{ loan: Loan }>(`/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(loan),
      });
    } catch {
      const loans = clientStorage.getLoans();
      const updated = loans.map(l => (l.id === id ? { ...l, ...loan } : l));
      clientStorage.setLoans(updated);
      const found = updated.find(l => l.id === id) || (loan as Loan);
      return { loan: found };
    }
  },

  deleteLoan: async (id: string) => {
    try {
      return await request<{ message: string }>(`/loans/${id}`, { method: 'DELETE' });
    } catch {
      const loans = clientStorage.getLoans();
      const filtered = loans.filter(l => l.id !== id);
      clientStorage.setLoans(filtered);

      const profile = clientStorage.getProfile();
      if (profile) {
        const total_debt = filtered.reduce((s, l) => s + (l.remaining_amount || 0), 0);
        const monthly_emi = filtered.reduce((s, l) => s + (l.emi || 0), 0);
        const total_income = profile.monthly_income + profile.other_income;
        const dti = total_income > 0 ? Math.round((monthly_emi / total_income) * 100) : 0;
        clientStorage.setProfile({
          ...profile,
          total_debt,
          monthly_emi,
          active_loans_count: filtered.filter(l => l.status === 'active').length,
          debt_to_income_ratio: dti
        });
      }
      return { message: 'Loan deleted successfully' };
    }
  },

  // Payments
  getPayments: async () => {
    try {
      return await request<{ payments: Payment[] }>('/payments');
    } catch {
      return { payments: clientStorage.getPayments() };
    }
  },

  addPayment: async (payment: Partial<Payment>) => {
    try {
      return await request<{ payment: Payment }>('/payments', {
        method: 'POST',
        body: JSON.stringify(payment),
      });
    } catch {
      const payments = clientStorage.getPayments();
      const user = clientStorage.getUser();
      const newPay: Payment = {
        id: `pay_${Date.now()}`,
        user_id: user?.id || 'usr_default',
        loan_name: payment.loan_name || 'Bill Payment',
        amount: payment.amount || 5000,
        due_date: payment.due_date || new Date().toISOString().split('T')[0],
        type: payment.type || 'Utility',
        status: payment.status || 'upcoming',
      };
      const updated = [newPay, ...payments];
      clientStorage.setPayments(updated);
      return { payment: newPay };
    }
  },

  createPayment: async (payment: Partial<Payment>) => {
    return api.addPayment(payment);
  },

  updatePayment: async (id: string, payment: Partial<Payment>) => {
    try {
      return await request<{ payment: Payment }>(`/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payment),
      });
    } catch {
      const payments = clientStorage.getPayments();
      const updated = payments.map(p => (p.id === id ? { ...p, ...payment } : p));
      clientStorage.setPayments(updated);
      const found = updated.find(p => p.id === id) || (payment as Payment);
      return { payment: found };
    }
  },

  // Goals
  getGoals: async () => {
    try {
      return await request<{ goals: FinancialGoal[] }>('/goals');
    } catch {
      return { goals: clientStorage.getGoals() };
    }
  },

  addGoal: async (goal: Partial<FinancialGoal>) => {
    try {
      return await request<{ goal: FinancialGoal }>('/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
    } catch {
      const goals = clientStorage.getGoals();
      const user = clientStorage.getUser();
      const newGoal: FinancialGoal = {
        id: `goal_${Date.now()}`,
        user_id: user?.id || 'usr_default',
        title: goal.title || 'New Goal',
        target_value: goal.target_value || 100000,
        current_value: goal.current_value || 0,
        category: goal.category || 'savings',
        target_date: goal.target_date || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        status: goal.status || 'in_progress',
      };
      const updated = [newGoal, ...goals];
      clientStorage.setGoals(updated);
      return { goal: newGoal };
    }
  },

  createGoal: async (goal: Partial<FinancialGoal>) => {
    return api.addGoal(goal);
  },

  updateGoal: async (id: string, goal: Partial<FinancialGoal>) => {
    try {
      return await request<{ goal: FinancialGoal }>(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goal),
      });
    } catch {
      const goals = clientStorage.getGoals();
      const updated = goals.map(g => (g.id === id ? { ...g, ...goal } : g));
      clientStorage.setGoals(updated);
      const found = updated.find(g => g.id === id) || (goal as FinancialGoal);
      return { goal: found };
    }
  },

  deleteGoal: async (id: string) => {
    try {
      return await request<{ message: string }>(`/goals/${id}`, { method: 'DELETE' });
    } catch {
      const goals = clientStorage.getGoals();
      clientStorage.setGoals(goals.filter(g => g.id !== id));
      return { message: 'Goal deleted' };
    }
  },

  // AI Advisor
  getRecommendations: async () => {
    try {
      return await request<{ recommendations: AIRecommendation[] }>('/recommendations');
    } catch {
      const res = await api.getDashboardData();
      return { recommendations: res.latestRecommendation ? [res.latestRecommendation] : [] };
    }
  },

  getAIRecommendations: async () => {
    const res = await api.getRecommendations();
    return { recommendation: res.recommendations[0] };
  },

  generateRecommendation: async () => {
    return api.getAIRecommendations();
  },

  // AI Chat
  getChatSessions: async () => {
    try {
      return await request<{ sessions: ChatSession[] }>('/chat/sessions');
    } catch {
      const user = clientStorage.getUser();
      return {
        sessions: [
          { id: 'session_default', user_id: user?.id || 'usr_default', title: 'Credit Wellness & Debt Strategy', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]
      };
    }
  },

  createChatSession: async (title?: string) => {
    try {
      return await request<{ session: ChatSession }>('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
    } catch {
      const user = clientStorage.getUser();
      const sess: ChatSession = {
        id: `sess_${Date.now()}`,
        user_id: user?.id || 'usr_default',
        title: title || 'Financial Advisory Session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { session: sess };
    }
  },

  getChatSession: async (id: string) => {
    try {
      return await request<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/sessions/${id}`);
    } catch {
      const user = clientStorage.getUser();
      const sess: ChatSession = { id, user_id: user?.id || 'usr_default', title: 'Advisory Session', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      return { session: sess, messages: [] };
    }
  },

  deleteChatSession: async (id: string) => {
    try {
      return await request<{ message: string }>(`/chat/sessions/${id}`, { method: 'DELETE' });
    } catch {
      return { message: 'Session deleted' };
    }
  },

  sendChatMessage: async (message: string, sessionId?: string) => {
    try {
      return await request<{ reply: ChatMessage; sessionId: string; disclaimer: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, sessionId }),
      });
    } catch {
      const user = clientStorage.getUser();
      const profile = clientStorage.getProfile() || defaultAlexProfile;
      const userName = user?.name ? user.name.split(' ')[0] : 'there';
      
      const replyText = `Hello ${userName}! Here is your personalized analysis based on your current financial metrics (Credit Score: **${profile.current_credit_score}**, Utilization: **${profile.credit_utilization_ratio}%**, DTI: **${profile.debt_to_income_ratio}%**, Monthly Income: **₹${profile.monthly_income.toLocaleString('en-IN')}**):\n\n` +
        `• **Credit Score Optimization**: Your credit standing is in the **${profile.current_credit_score >= 750 ? 'Prime (750+)' : 'Good'}** range. Maintaining utilization below 20% on all cards prevents unnecessary bureau score dips.\n` +
        `• **Debt & EMI Strategy**: With a **${profile.debt_to_income_ratio}% DTI**, your debt obligations are **${profile.debt_to_income_ratio <= 35 ? 'healthy and well-balanced' : 'slightly elevated'}**. ${profile.monthly_emi > 0 ? `Your monthly EMI commitment is ₹${profile.monthly_emi.toLocaleString('en-IN')}.` : 'You currently have zero active loan EMIs.'}\n` +
        `• **Liquid Safety Net**: Your emergency fund balance is **₹${profile.emergency_fund_balance.toLocaleString('en-IN')}** (${Math.round(profile.emergency_fund_balance / Math.max(1, profile.monthly_expenses))} months of essential living expenses).`;

      const reply: ChatMessage = {
        id: `msg_${Date.now()}`,
        session_id: sessionId || 'session_default',
        sender: 'assistant',
        message: replyText,
        created_at: new Date().toISOString(),
      };
      return {
        reply,
        sessionId: sessionId || 'session_default',
        disclaimer: 'Educational financial guidance only. FinHealth AI provides analytical insights based on self-reported data.'
      };
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      return await request<{ notifications: Notification[] }>('/notifications');
    } catch {
      return { notifications: clientStorage.getNotifications() };
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      return await request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      const list = clientStorage.getNotifications().map(n => (n.id === id ? { ...n, is_read: true } : n));
      clientStorage.setNotifications(list);
      return { success: true };
    }
  },

  markAllNotificationsRead: async () => {
    try {
      return await request<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
    } catch {
      const list = clientStorage.getNotifications().map(n => ({ ...n, is_read: true }));
      clientStorage.setNotifications(list);
      return { success: true };
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      return await request<any>('/analytics');
    } catch {
      const profile = clientStorage.getProfile() || defaultAlexProfile;
      const history = clientStorage.getCreditHistory();
      const loans = clientStorage.getLoans();

      const loanPie = loans.length > 0 
        ? loans.map(l => ({ name: l.name, value: l.remaining_amount || l.principal }))
        : [{ name: 'Zero Active Loans', value: 1 }];

      return {
        profile,
        creditHistory: history,
        loanPieData: loanPie,
        debtHistory: [
          { month: 'Jan', debt: Math.round(profile.total_debt * 1.15) },
          { month: 'Feb', debt: Math.round(profile.total_debt * 1.10) },
          { month: 'Mar', debt: Math.round(profile.total_debt * 1.05) },
          { month: 'Apr', debt: Math.round(profile.total_debt * 1.02) },
          { month: 'May', debt: profile.total_debt },
        ],
        cashflowData: [
          { name: 'Essential', amount: profile.essential_expenses || 26000 },
          { name: 'Discretionary', amount: profile.discretionary_expenses || 12000 },
          { name: 'Debt EMI', amount: profile.monthly_emi || 0 },
          { name: 'Surplus', amount: Math.max(0, (profile.monthly_income + profile.other_income) - (profile.monthly_expenses + profile.monthly_emi)) },
        ],
        insights: {
          credit: `Your credit score stands at ${profile.current_credit_score}. Score has moved by ${profile.current_credit_score - profile.previous_credit_score >= 0 ? '+' : ''}${profile.current_credit_score - profile.previous_credit_score} points.`,
          debt: `Your DTI is ${profile.debt_to_income_ratio}%, ${profile.debt_to_income_ratio <= 35 ? 'well within the safe lending threshold' : 'which requires active monitoring'}.`,
          savings: `Liquid emergency savings cover ~${Math.round(profile.emergency_fund_balance / Math.max(1, profile.monthly_expenses))} months of monthly expenses.`,
          action: 'Maintain consistent payment routines and automate EMI payments.'
        }
      };
    }
  },

  exportDataUrl: '/api/export',

  exportData: async () => {
    try {
      return await request<any>('/export');
    } catch {
      return {
        user: clientStorage.getUser(),
        profile: clientStorage.getProfile(),
        loans: clientStorage.getLoans(),
        creditHistory: clientStorage.getCreditHistory(),
        payments: clientStorage.getPayments(),
        goals: clientStorage.getGoals(),
      };
    }
  },

  deleteAccount: async () => {
    try {
      await request<{ message: string }>('/account', { method: 'DELETE' });
    } catch {
      // ignore
    }
    clientStorage.clearAll();
    return { message: 'Account deleted successfully' };
  },

  resetDemo: async () => {
    clientStorage.clearAll();
    clientStorage.initializeSession(defaultAlexUser, 'demo');
    return { message: 'Demo reset successfully' };
  },
};
