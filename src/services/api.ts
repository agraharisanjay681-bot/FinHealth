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

const API_BASE_URL = (import.meta.env.VITE_FASTAPI_URL || import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/api${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(`Unable to connect to FinHealth API at ${url}. Please verify the backend service is running (${netErr.message || 'Network error'})`);
  }

  const text = await response.text();

  // If response is HTML instead of JSON (e.g. static hosting fallback index.html)
  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
    throw new Error(
      `Backend API returned unexpected non-JSON response (HTTP ${response.status}). If deployed, ensure VITE_FASTAPI_URL is configured to the live backend server.`
    );
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (jsonErr: any) {
    throw new Error(`Failed to parse backend response as JSON: ${jsonErr.message}`);
  }

  if (!response.ok) {
    const errorMsg = data.detail || data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
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

  getChatSuggestions: async () => {
    try {
      return await request<{ suggestions: { category: string; prompt: string; icon?: string }[] }>('/chat/suggestions');
    } catch {
      const profile = clientStorage.getProfile() || defaultAlexProfile;
      return {
        suggestions: [
          { category: 'Bottlenecks', prompt: 'Identify my biggest financial bottlenecks and provide an actionable plan.' },
          { category: 'Credit Utilization', prompt: `How can I lower my ${profile.credit_utilization_ratio}% credit utilization to boost my CIBIL score?` },
          { category: 'DTI Analysis', prompt: `My DTI is ${profile.debt_to_income_ratio}%. How does this impact my loan eligibility?` },
          { category: 'Emergency Reserve', prompt: 'How much emergency fund reserve should I maintain for my current expenses?' },
          { category: 'Score Roadmap', prompt: `What are the exact steps to raise my score from ${profile.current_credit_score} to 780+?` }
        ]
      };
    }
  },

  sendChatMessage: async (message: string, sessionId?: string) => {
    console.log("USER MESSAGE:", message);

    const effectiveSessionId = sessionId || `sess_${Date.now()}`;
    const payload = {
      message: message.trim(),
      conversation_id: effectiveSessionId,
      sessionId: effectiveSessionId,
    };

    try {
      const res = await request<any>('/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const replyText = res.reply?.message || res.response;

      if (replyText) {
        const reply: ChatMessage = {
          id: res.reply?.id || `msg_${Date.now()}`,
          session_id: res.sessionId || res.conversation_id || effectiveSessionId,
          sender: 'assistant',
          message: replyText,
          created_at: res.reply?.created_at || new Date().toISOString(),
        };

        return {
          reply,
          sessionId: res.sessionId || res.conversation_id || effectiveSessionId,
          disclaimer: res.disclaimer || 'FinHealth AI provides educational financial insights based on your provided data. It does not replace professional financial advice.'
        };
      }
    } catch {
      // Backend not running (e.g. on static Firebase Hosting) -> Fallback to client-side financial intelligence
    }

    // Client-side fallback using actual user profile from clientStorage
    const user = clientStorage.getUser();
    const profile = clientStorage.getProfile() || defaultAlexProfile;
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const lower = message.toLowerCase().trim();

    let replyText = '';

    // 1. Stock market / Share price / Specific companies (Tesla, Tata, Apple, Nifty, Sensex, etc.)
    if (
      lower.includes('tesla') || 
      lower.includes('stock') || 
      lower.includes('share') || 
      lower.includes('price') || 
      lower.includes('market') || 
      lower.includes('tata') || 
      lower.includes('nifty') || 
      lower.includes('sensex') || 
      lower.includes('crypto') ||
      lower.includes('bitcoin')
    ) {
      replyText = `### 📈 Real-Time Market Data Notice\n\n` +
        `I do not have access to live intraday streaming market feeds for real-time stock prices (such as Tesla, Tata Motors, or Apple).\n\n` +
        `**Where to check live prices:**\n` +
        `• **Global & US Equities (Tesla / TSLA)**: Real-time quotes are available on **Google Finance**, **Yahoo Finance**, or **NASDAQ**.\n` +
        `• **Indian Equities (NSE/BSE)**: Track real-time prices on **Google Finance**, **Moneycontrol**, **Groww**, or **Zerodha Kite**.\n\n` +
        `Let me know if you would like guidance on budgeting for investments, building your emergency safety net, or long-term financial planning!`;
    }
    // 2. Greeting (Hello, Hi)
    else if (
      lower === 'hello' || 
      lower === 'hi' || 
      lower === 'hey' || 
      lower === 'hello!' || 
      lower === 'hi!' || 
      lower.startsWith('hello ') || 
      lower.startsWith('hi ') ||
      lower === 'good morning' ||
      lower === 'good evening'
    ) {
      replyText = `Hello ${firstName}! 👋 How can I help you today with your financial health, credit score, debt management, or budget planning?`;
    }
    // 3. What is DTI?
    else if (
      lower.includes('what is dti') || 
      lower.includes('what is debt to income') || 
      lower.includes('explain dti') || 
      lower.includes('meaning of dti') || 
      lower.includes('define dti') ||
      lower === 'dti' ||
      lower === 'dti?'
    ) {
      replyText = `### ⚖️ Debt-to-Income (DTI) Ratio Explained\n\n` +
        `**Debt-to-Income (DTI) Ratio** is a key financial metric measuring the percentage of your gross monthly income that goes toward paying fixed debt obligations (such as home loans, personal loans, and credit card minimum dues).\n\n` +
        `**Calculation Formula:**\n` +
        `$$\\text{DTI} = \\left( \\frac{\\text{Total Monthly Debt Payments}}{\\text{Gross Monthly Income}} \\right) \\times 100$$\n\n` +
        `**Lending Benchmarks:**\n` +
        `• **Under 35% (Healthy)**: Excellent balance; lenders view you as low risk with strong repayment capacity.\n` +
        `• **36% – 45% (Moderate)**: Manageable, but large new loans may face extra underwriting checks.\n` +
        `• **Over 45% (High Risk)**: High repayment risk; difficult to secure competitive interest rates.\n\n` +
        `Keeping DTI low ensures you have surplus cash flow for savings, investments, and emergencies.`;
    }
    // 4. What is an emergency fund?
    else if (
      lower.includes('emergency fund') && 
      (lower.includes('what is') || lower.includes('explain') || lower.includes('meaning') || lower.includes('define') || lower.includes('why'))
    ) {
      replyText = `### 🛡️ Emergency Fund Explained\n\n` +
        `An **Emergency Fund** is a dedicated cash reserve set aside strictly for unexpected emergencies — such as medical crises, sudden vehicle repairs, or temporary loss of income.\n\n` +
        `**Key Guidelines:**\n` +
        `• **Target Size**: 3 to 6 months of essential living expenses (rent, utilities, groceries, insurance, mandatory EMIs).\n` +
        `• **Ideal Vehicles**: High-liquidity, capital-safe accounts such as High-Yield Savings Accounts, Auto-Sweep FDs, or Liquid Mutual Funds.\n` +
        `• **Core Purpose**: Prevents you from liquidating long-term investments or taking high-cost loans during financial shocks.`;
    }
    // 5. Why is my utilization high?
    else if (
      lower.includes('why is my utilization') || 
      lower.includes('utilization high') || 
      lower.includes('why utilization')
    ) {
      const util = profile?.credit_utilization_ratio ?? 28;
      const balance = profile?.credit_card_balance ?? 42000;
      const limit = profile?.total_credit_limit ?? 150000;

      replyText = `### 💳 Why Credit Utilization Is Elevated\n\n` +
        `Credit utilization measures the portion of your total credit card limit currently in use.\n\n` +
        (profile ? `**Your Current Figures:**\n• **Card Balance:** ₹${balance.toLocaleString('en-IN')}\n• **Total Limit:** ₹${limit.toLocaleString('en-IN')}\n• **Current Utilization:** **${util}%** (${util > 30 ? '⚠️ High - Above recommended 30%' : util > 20 ? 'Moderate' : '✅ Optimal'})\n\n` : '') +
        `**Common reasons utilization appears high:**\n` +
        `1. **Statement Generation Timing**: Credit bureaus capture the balance on your monthly billing statement date, not your payment due date.\n` +
        `2. **Low Credit Limits**: Carrying regular expenses on cards with smaller credit limits increases the percentage.\n\n` +
        `**How to Lower It Fast:**\n` +
        `• **Pre-Statement Paydown**: Pay off balances **2 to 3 days before your statement generation date**.\n` +
        `• **Request Limit Increase**: Ask your bank for a credit limit enhancement without increasing spending.`;
    }
    // 6. How can I improve my credit score?
    else if (
      lower.includes('improve my credit score') || 
      lower.includes('improve credit score') || 
      lower.includes('increase credit score') || 
      lower.includes('raise credit score') || 
      lower.includes('boost credit score') ||
      lower.includes('improve score')
    ) {
      const score = profile?.current_credit_score ?? 742;

      replyText = `### 🚀 Action Plan to Improve Your Credit Score\n\n` +
        (profile ? `Your current credit score is **${score} / 900**.\n\n` : '') +
        `**Top Action Steps:**\n` +
        `1. **Keep Credit Card Utilization Under 20%**: Pay balances before statement generation to report low balances to CIBIL & Experian.\n` +
        `2. **100% On-Time Payments**: Enable automated NACH e-mandates for all loans and card bills.\n` +
        `3. **Protect Credit Age**: Avoid closing your oldest credit card accounts.\n` +
        `4. **Limit Hard Inquiries**: Space out new loan and credit card applications by at least 6 months.\n` +
        `5. **Balanced Credit Mix**: Maintain a healthy balance of secured and unsecured credit lines over time.`;
    }
    // 7. Analyze my financial health / bottlenecks
    else if (
      lower.includes('analyze my financial health') || 
      lower.includes('analyze financial health') || 
      lower.includes('analyze my') || 
      lower.includes('bottleneck') || 
      lower.includes('financial audit') ||
      lower.includes('review my finances')
    ) {
      const emergencyMonths = profile.monthly_expenses > 0 ? (profile.emergency_fund_balance / profile.monthly_expenses).toFixed(1) : '1.7';
      const isLowEmergency = Number(emergencyMonths) < 3;
      const isHighUtil = profile.credit_utilization_ratio > 20;
      const isHighDti = profile.debt_to_income_ratio > 35;
      const hasLate = (profile.late_payments || 0) > 0 || (profile.missed_payments || 0) > 0;

      const bottlenecks: string[] = [];
      const steps: string[] = [];

      if (isLowEmergency) {
        bottlenecks.push(`**Emergency Fund Reserve (${emergencyMonths} months)**: Your emergency fund balance of ₹${profile.emergency_fund_balance.toLocaleString('en-IN')} covers under 3 months of essential living expenses (₹${(profile.monthly_expenses * 3).toLocaleString('en-IN')}).`);
        steps.push(`**Build Liquid Shield**: Allocate ₹10,000–₹15,000/month from cash flow into an instant-access liquid fund or auto-sweep FD.`);
      }

      if (isHighUtil) {
        bottlenecks.push(`**Credit Card Utilization (${profile.credit_utilization_ratio}%)**: Your credit card balance of ₹${profile.credit_card_balance.toLocaleString('en-IN')} consumes ${profile.credit_utilization_ratio}% of your ₹${profile.total_credit_limit.toLocaleString('en-IN')} limit.`);
        steps.push(`**Pre-Statement Paydown**: Pay off card balances 2 to 3 days before your monthly billing statement date.`);
      }

      if (hasLate) {
        bottlenecks.push(`**Past Payment Irregularity**: ${profile.late_payments} late payment(s) recorded in the past 24 months.`);
        steps.push(`**Automate Standing Instructions**: Set up 100% automated NACH mandates for all loan EMIs.`);
      }

      if (isHighDti) {
        bottlenecks.push(`**Debt-to-Income (DTI) at ${profile.debt_to_income_ratio}%**: Monthly EMIs of ₹${profile.monthly_emi.toLocaleString('en-IN')} constrain monthly cash flow.`);
        steps.push(`**Prepay High-Interest Debt**: Target discretionary surplus to prepay highest-interest unsecured loans.`);
      }

      if (bottlenecks.length === 0) {
        bottlenecks.push(`**Strong Financial Foundation**: Your CIBIL score of **${profile.current_credit_score}** and **${profile.credit_utilization_ratio}%** utilization are healthy.`);
        steps.push(`**Optimize Wealth Accumulation**: Maximize tax-advantaged instruments and long-term goal SIPs.`);
      }

      replyText = `### 📊 Personalized FinHealth Analysis for ${firstName}\n\n` +
        `**Profile Snapshot:**\n` +
        `• **Credit Score:** **${profile.current_credit_score} / 900**\n` +
        `• **Credit Utilization:** **${profile.credit_utilization_ratio}%**\n` +
        `• **Debt-to-Income (DTI):** **${profile.debt_to_income_ratio}%**\n` +
        `• **Emergency Fund:** **₹${profile.emergency_fund_balance.toLocaleString('en-IN')}** (~${emergencyMonths} months)\n\n` +
        `### 🔍 Key Bottlenecks Identified\n\n` +
        bottlenecks.map((b, i) => `${i + 1}. ${b}`).join('\n\n') +
        `\n\n### 🛠️ Recommended Action Plan\n\n` +
        steps.map((s, i) => `• **Step ${i + 1}:** ${s}`).join('\n');
    }
    // 8. Mutual funds & SIP
    else if (lower.includes('mutual fund') || lower.includes('sip') || lower.includes('invest')) {
      replyText = `### 📊 Mutual Funds & Systematic Investment Planning (SIP)\n\n` +
        `Investing through SIPs is a disciplined way to build long-term wealth while averaging market volatility.\n\n` +
        `**Key Principles:**\n` +
        `1. **Broad Index Funds**: Low-cost Nifty 50 or broad-market index funds provide strong core long-term equity exposure.\n` +
        `2. **Tax-Saving ELSS (Section 80C)**: Qualifies for tax deductions up to ₹1.5 Lakh with a 3-year lock-in.\n` +
        `3. **Emergency Fund First**: Maintain a 3-6 month liquid safety reserve before deploying surplus funds into equities.`;
    }
    // 9. Taxes & Section 80C
    else if (lower.includes('tax') || lower.includes('80c') || lower.includes('deduction')) {
      replyText = `### 🧾 Income Tax Planning Overview\n\n` +
        `• **Section 80C (Up to ₹1,50,000)**: Eligible avenues include PPF, EPF, ELSS mutual funds, life insurance premiums, and tax-saving fixed deposits.\n` +
        `• **Section 80D**: Deductions for health insurance premiums (up to ₹25,000 for self/family, additional for senior citizen parents).\n` +
        `• **Tax Regimes**: The New Tax Regime offers lower slab rates without exemptions, while the Old Regime benefits those with substantial 80C/80D and home loan interest deductions.`;
    }
    // 10. General conversational fallback
    else {
      replyText = `Hello ${firstName}! You asked: *"${message}"*\n\n` +
        `I can help you explore credit bureau scores, Debt-to-Income (DTI), utilization optimization, debt payoff strategies, or general financial planning. Feel free to ask a specific question or select any suggested prompt!`;
    }

    const fallbackReply: ChatMessage = {
      id: `msg_${Date.now()}`,
      session_id: effectiveSessionId,
      sender: 'assistant',
      message: replyText,
      created_at: new Date().toISOString(),
    };

    return {
      reply: fallbackReply,
      sessionId: effectiveSessionId,
      disclaimer: 'FinHealth AI provides educational financial insights based on your provided data. It does not replace professional financial advice.'
    };
  },

  testChatConnection: async () => {
    return await request<{ status?: string; success?: boolean; message?: string; model?: string }>('/chat/test');
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
