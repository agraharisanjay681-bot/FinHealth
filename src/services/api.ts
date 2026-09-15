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

const TOKEN_KEY = 'finhealth_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
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

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  demoLogin: () =>
    request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/demo', {
      method: 'POST',
    }),

  simulateOAuth: (provider: string, email?: string, name?: string) =>
    request<{ user: User; token: string; hasCompletedOnboarding: boolean }>('/auth/oauth/simulate', {
      method: 'POST',
      body: JSON.stringify({ provider, email, name }),
    }),

  getOAuthStatus: () =>
    request<{ google: any; github: any; linkedin: any }>('/auth/oauth/config'),

  getMe: () =>
    request<{ user: User; hasCompletedOnboarding: boolean }>('/auth/me'),

  logout: () =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }),

  // Profile & Onboarding
  getProfile: () =>
    request<{ profile: FinancialProfile | null }>('/profile'),

  updateProfile: (profile: Partial<FinancialProfile> & { name?: string; age?: number; employment?: EmploymentStatus }) =>
    request<{ profile: FinancialProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  completeOnboarding: (data: any) =>
    request<{ profile: FinancialProfile; message: string }>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboardData: () =>
    request<{
      user: User | null;
      profile: FinancialProfile | null;
      creditHistory: CreditScoreRecord[];
      loansSummary: { total: number; active: number; totalRemaining: number; totalEmi: number };
      recentPayments: Payment[];
      activeGoals: FinancialGoal[];
      latestRecommendation: AIRecommendation | null;
      unreadNotificationsCount: number;
    }>('/dashboard'),

  // Credit History
  getCreditHistory: () =>
    request<{ history: CreditScoreRecord[] }>('/credit/history'),

  addCreditRecord: (score: number, note?: string) =>
    request<{ record: CreditScoreRecord; profile: FinancialProfile }>('/credit/history', {
      method: 'POST',
      body: JSON.stringify({ score, note }),
    }),

  // Loans
  getLoans: () =>
    request<{ loans: Loan[] }>('/loans'),

  addLoan: (loan: Partial<Loan>) =>
    request<{ loan: Loan }>('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    }),

  createLoan: (loan: Partial<Loan>) =>
    request<{ loan: Loan }>('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    }),

  updateLoan: (id: string, loan: Partial<Loan>) =>
    request<{ loan: Loan }>(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loan),
    }),

  deleteLoan: (id: string) =>
    request<{ message: string }>(`/loans/${id}`, {
      method: 'DELETE',
    }),

  // Payments
  getPayments: () =>
    request<{ payments: Payment[] }>('/payments'),

  addPayment: (payment: Partial<Payment>) =>
    request<{ payment: Payment }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  createPayment: (payment: Partial<Payment>) =>
    request<{ payment: Payment }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  updatePayment: (id: string, payment: Partial<Payment>) =>
    request<{ payment: Payment }>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payment),
    }),

  // Goals
  getGoals: () =>
    request<{ goals: FinancialGoal[] }>('/goals'),

  addGoal: (goal: Partial<FinancialGoal>) =>
    request<{ goal: FinancialGoal }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),

  createGoal: (goal: Partial<FinancialGoal>) =>
    request<{ goal: FinancialGoal }>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),

  updateGoal: (id: string, goal: Partial<FinancialGoal>) =>
    request<{ goal: FinancialGoal }>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    }),

  deleteGoal: (id: string) =>
    request<{ message: string }>(`/goals/${id}`, {
      method: 'DELETE',
    }),

  // AI Advisor
  getRecommendations: () =>
    request<{ recommendations: AIRecommendation[] }>('/recommendations'),

  getAIRecommendations: async () => {
    try {
      const res = await request<{ recommendations: AIRecommendation[] }>('/recommendations');
      if (res.recommendations && res.recommendations.length > 0) {
        return { recommendation: res.recommendations[0] };
      }
    } catch {
      // fallback
    }
    return request<{ recommendation: AIRecommendation }>('/recommendations/generate', {
      method: 'POST',
    });
  },

  generateRecommendation: () =>
    request<{ recommendation: AIRecommendation }>('/recommendations/generate', {
      method: 'POST',
    }),

  // AI Chat
  getChatSessions: () =>
    request<{ sessions: ChatSession[] }>('/chat/sessions'),

  createChatSession: (title?: string) =>
    request<{ session: ChatSession }>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  getChatSession: (id: string) =>
    request<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/sessions/${id}`),

  deleteChatSession: (id: string) =>
    request<{ message: string }>(`/chat/sessions/${id}`, {
      method: 'DELETE',
    }),

  sendChatMessage: (message: string, sessionId?: string) =>
    request<{ reply: ChatMessage; sessionId: string; disclaimer: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: Notification[] }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  // Analytics
  getAnalytics: () =>
    request<{
      profile: FinancialProfile | null;
      creditHistory: CreditScoreRecord[];
      loanPieData: { name: string; value: number }[];
      debtHistory: { month: string; debt: number }[];
      cashflowData: { name: string; amount: number }[];
      insights: { credit: string; debt: string; savings: string; action: string };
    }>('/analytics'),

  // Export
  exportDataUrl: '/api/export',

  exportData: () =>
    request<any>('/export'),

  deleteAccount: () =>
    request<{ message: string }>('/account', { method: 'DELETE' }),

  // Reset demo
  resetDemo: () =>
    request<{ message: string }>('/reset-demo', { method: 'POST' }),
};
