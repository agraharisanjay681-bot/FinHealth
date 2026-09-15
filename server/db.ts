import fs from 'fs';
import path from 'path';
import type { 
  User, 
  FinancialProfile, 
  CreditScoreRecord, 
  Loan, 
  Payment, 
  FinancialGoal, 
  AIRecommendation, 
  ChatSession, 
  ChatMessage, 
  Notification 
} from '../src/types/index.js';

interface DatabaseSchema {
  users: (User & { password_hash: string })[];
  profiles: FinancialProfile[];
  credit_history: CreditScoreRecord[];
  loans: Loan[];
  payments: Payment[];
  goals: FinancialGoal[];
  recommendations: AIRecommendation[];
  chat_sessions: ChatSession[];
  chat_messages: ChatMessage[];
  notifications: Notification[];
}

const DATA_FILE = path.join(process.cwd(), 'finhealth_data.json');

// Default initial seed data with realistic figures for Indian financial context
const initialSeed: DatabaseSchema = {
  users: [
    {
      id: 'usr_alex_sharma',
      name: 'Alex Sharma',
      email: 'alex.sharma@example.com',
      password_hash: '$2a$10$w09u.2Bw7xZtXkX0m4yW/O8jTzWw3G7uXn5gZ8b3L/Y9QkL9uM1.G', // 'password123'
      age: 29,
      employment: 'salaried',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      created_at: '2025-01-01T10:00:00.000Z',
      updated_at: '2025-05-15T14:30:00.000Z',
    }
  ],
  profiles: [
    {
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
      debt_to_income_ratio: 17, // 14500 / 85000 approx 17%
      credit_utilization_ratio: 28, // 42000 / 150000 = 28%
      updated_at: '2025-05-15T14:30:00.000Z',
    }
  ],
  credit_history: [
    { id: 'ch_1', user_id: 'usr_alex_sharma', score: 690, recorded_at: '2025-01-15T00:00:00.000Z', note: 'Higher credit utilization' },
    { id: 'ch_2', user_id: 'usr_alex_sharma', score: 705, recorded_at: '2025-02-15T00:00:00.000Z', note: 'Paid down credit card balance' },
    { id: 'ch_3', user_id: 'usr_alex_sharma', score: 718, recorded_at: '2025-03-15T00:00:00.000Z', note: 'On-time personal loan EMI' },
    { id: 'ch_4', user_id: 'usr_alex_sharma', score: 730, recorded_at: '2025-04-15T00:00:00.000Z', note: 'Utilization dropped below 30%' },
    { id: 'ch_5', user_id: 'usr_alex_sharma', score: 742, recorded_at: '2025-05-15T00:00:00.000Z', note: 'Consistent disciplined payment record' },
  ],
  loans: [
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
      remaining_amount: 43000,
      interest_rate: 9.8,
      emi: 5000,
      start_date: '2023-11-01',
      end_date: '2025-11-01',
      status: 'active',
      lender: 'State Bank of India',
    },
    {
      id: 'loan_3',
      user_id: 'usr_alex_sharma',
      name: 'ICICI Consumer Durable Loan',
      type: 'Other',
      principal: 45000,
      remaining_amount: 0,
      interest_rate: 0,
      emi: 0,
      start_date: '2023-01-15',
      end_date: '2023-10-15',
      status: 'paid',
      lender: 'ICICI Bank',
    }
  ],
  payments: [
    {
      id: 'pay_1',
      user_id: 'usr_alex_sharma',
      loan_id: 'loan_1',
      loan_name: 'HDFC Personal Loan',
      amount: 9500,
      due_date: '2025-06-05',
      status: 'upcoming',
      type: 'EMI'
    },
    {
      id: 'pay_2',
      user_id: 'usr_alex_sharma',
      loan_id: 'loan_2',
      loan_name: 'SBI Two-Wheeler Loan',
      amount: 5000,
      due_date: '2025-06-10',
      status: 'upcoming',
      type: 'EMI'
    },
    {
      id: 'pay_3',
      user_id: 'usr_alex_sharma',
      loan_name: 'Axis Bank Credit Card',
      amount: 14200,
      due_date: '2025-06-18',
      status: 'upcoming',
      type: 'Credit Card'
    },
    {
      id: 'pay_4',
      user_id: 'usr_alex_sharma',
      loan_id: 'loan_1',
      loan_name: 'HDFC Personal Loan',
      amount: 9500,
      due_date: '2025-05-05',
      paid_date: '2025-05-04',
      status: 'paid',
      type: 'EMI'
    },
    {
      id: 'pay_5',
      user_id: 'usr_alex_sharma',
      loan_id: 'loan_2',
      loan_name: 'SBI Two-Wheeler Loan',
      amount: 5000,
      due_date: '2025-05-10',
      paid_date: '2025-05-09',
      status: 'paid',
      type: 'EMI'
    },
    {
      id: 'pay_6',
      user_id: 'usr_alex_sharma',
      loan_name: 'Axis Bank Credit Card',
      amount: 16800,
      due_date: '2025-05-18',
      paid_date: '2025-05-17',
      status: 'paid',
      type: 'Credit Card'
    }
  ],
  goals: [
    {
      id: 'goal_1',
      user_id: 'usr_alex_sharma',
      title: 'Achieve 775+ CIBIL Score',
      category: 'credit_score',
      current_value: 742,
      target_value: 775,
      target_date: '2025-12-31',
      status: 'in_progress',
      notes: 'Maintain utilization <25% and ensure 100% timely EMI payments.'
    },
    {
      id: 'goal_2',
      user_id: 'usr_alex_sharma',
      title: 'Pay Off Two-Wheeler Loan',
      category: 'debt_reduction',
      current_value: 77000,
      target_value: 120000,
      target_date: '2025-11-01',
      status: 'in_progress',
      notes: '₹43,000 principal remaining out of ₹1,20,000.'
    },
    {
      id: 'goal_3',
      user_id: 'usr_alex_sharma',
      title: 'Emergency Fund (6 Months Expenses)',
      category: 'emergency_fund',
      current_value: 65000,
      target_value: 200000,
      target_date: '2026-03-31',
      status: 'in_progress',
      notes: 'Accumulate in high-interest liquid fund or sweep FD.'
    }
  ],
  recommendations: [
    {
      id: 'rec_1',
      user_id: 'usr_alex_sharma',
      summary: 'Your financial profile reflects steady improvement with healthy credit utilization and manageable debt burden.',
      health_status: 'Healthy',
      key_issues: [
        'Credit card utilization sits at 28%, which is healthy but approaching the 30% upper threshold.',
        'Emergency reserve of ₹65,000 covers only ~1.7 months of essential expenses.',
        'Active personal loan carries 11.5% interest rate.'
      ],
      recommendations: [
        {
          step: 1,
          title: 'Maintain Credit Card Utilization Below 20%',
          description: 'Aim to reduce credit balance to under ₹30,000 before the monthly bill generation date to boost CIBIL rating.',
          impact: 'High'
        },
        {
          step: 2,
          title: 'Accelerate Emergency Fund Allocation',
          description: 'Direct at least ₹10,000 monthly into an emergency fund to achieve the ₹2,00,000 safety cushion target.',
          impact: 'High'
        },
        {
          step: 3,
          title: 'Pre-pay High Interest Personal Loan',
          description: 'Allocate any festival bonus or surplus towards HDFC Personal Loan principal to save interest charges.',
          impact: 'Medium'
        },
        {
          step: 4,
          title: 'Maintain 100% On-Time Payment Discipline',
          description: 'Keep auto-debits active across all active loan EMIs and credit card minimum/total dues.',
          impact: 'High'
        },
        {
          step: 5,
          title: 'Avoid Unnecessary Hard Inquiries',
          description: 'Hold off applying for new credit cards or unsecured loans over the next 6 months.',
          impact: 'Medium'
        }
      ],
      priority: 'Medium',
      expected_direction: 'Consistent adherence to these steps may support gradual credit score improvement into the 770+ range over 4–6 months.',
      disclaimer: 'FinHealth provides educational and informational insights and does not replace professional financial advice.',
      created_at: '2025-05-15T15:00:00.000Z'
    }
  ],
  chat_sessions: [
    {
      id: 'sess_1',
      user_id: 'usr_alex_sharma',
      title: 'Credit Score & EMI Planning',
      created_at: '2025-05-15T16:00:00.000Z',
      updated_at: '2025-05-15T16:10:00.000Z'
    }
  ],
  chat_messages: [
    {
      id: 'msg_1',
      session_id: 'sess_1',
      sender: 'user',
      message: 'How is my overall financial health looking right now?',
      created_at: '2025-05-15T16:00:00.000Z'
    },
    {
      id: 'msg_2',
      session_id: 'sess_1',
      sender: 'assistant',
      message: 'Based on your current FinHealth profile:\n\n• **CIBIL/Credit Score**: 742 (Good) — you have improved by 12 points since April.\n• **Credit Utilization**: 28% (₹42,000 of ₹1,50,000 limit), which is in the healthy zone under the 30% guideline.\n• **Debt-to-Income (DTI)**: ~17% with ₹14,500 monthly EMI against ₹85,000 total income, well within safe parameters.\n• **Overall FinHealth Score**: 78/100 (Healthy).\n\nYour primary opportunity is bolstering your emergency reserve (currently ₹65,000) towards 3 to 6 months of expenses (~₹1.5L–₹2L).',
      created_at: '2025-05-15T16:00:10.000Z'
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      user_id: 'usr_alex_sharma',
      title: 'Credit Score Updated',
      message: 'Your CIBIL score increased by 12 points to 742 this month!',
      type: 'success',
      is_read: false,
      created_at: '2025-05-15T09:00:00.000Z'
    },
    {
      id: 'notif_2',
      user_id: 'usr_alex_sharma',
      title: 'Upcoming EMI Reminder',
      message: 'HDFC Personal Loan EMI of ₹9,500 is due on June 5th.',
      type: 'info',
      is_read: false,
      created_at: '2025-05-16T08:00:00.000Z'
    },
    {
      id: 'notif_3',
      user_id: 'usr_alex_sharma',
      title: 'Healthy Utilization Milestone',
      message: 'Your credit card utilization dropped to 28%, keeping you in the optimal scoring band.',
      type: 'success',
      is_read: true,
      created_at: '2025-05-10T11:20:00.000Z'
    }
  ]
};

// Persistent database instance
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...initialSeed, ...parsed };
      }
    } catch (err) {
      console.warn('Could not read persistent data file, using default seed:', err);
    }
    return JSON.parse(JSON.stringify(initialSeed));
  }

  private saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User & { password_hash: string }) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updated_at: new Date().toISOString() };
      this.saveData();
      return this.data.users[idx];
    }
    return null;
  }

  // Financial Profiles
  getProfileByUserId(userId: string): FinancialProfile | undefined {
    return this.data.profiles.find(p => p.user_id === userId);
  }

  createOrUpdateProfile(profile: FinancialProfile): FinancialProfile {
    const idx = this.data.profiles.findIndex(p => p.user_id === profile.user_id);
    if (idx !== -1) {
      this.data.profiles[idx] = { ...this.data.profiles[idx], ...profile, updated_at: new Date().toISOString() };
    } else {
      this.data.profiles.push(profile);
    }
    this.saveData();
    return this.getProfileByUserId(profile.user_id)!;
  }

  // Credit History
  getCreditHistory(userId: string): CreditScoreRecord[] {
    return this.data.credit_history
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }

  addCreditRecord(record: CreditScoreRecord) {
    this.data.credit_history.push(record);
    this.saveData();
    return record;
  }

  // Loans
  getLoans(userId: string): Loan[] {
    return this.data.loans.filter(l => l.user_id === userId);
  }

  addLoan(loan: Loan): Loan {
    this.data.loans.push(loan);
    this.saveData();
    return loan;
  }

  updateLoan(id: string, userId: string, updates: Partial<Loan>): Loan | null {
    const idx = this.data.loans.findIndex(l => l.id === id && l.user_id === userId);
    if (idx !== -1) {
      this.data.loans[idx] = { ...this.data.loans[idx], ...updates };
      this.saveData();
      return this.data.loans[idx];
    }
    return null;
  }

  deleteLoan(id: string, userId: string): boolean {
    const initialLen = this.data.loans.length;
    this.data.loans = this.data.loans.filter(l => !(l.id === id && l.user_id === userId));
    const deleted = this.data.loans.length < initialLen;
    if (deleted) this.saveData();
    return deleted;
  }

  // Payments
  getPayments(userId: string): Payment[] {
    return this.data.payments
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  addPayment(payment: Payment): Payment {
    this.data.payments.push(payment);
    this.saveData();
    return payment;
  }

  updatePayment(id: string, userId: string, updates: Partial<Payment>): Payment | null {
    const idx = this.data.payments.findIndex(p => p.id === id && p.user_id === userId);
    if (idx !== -1) {
      this.data.payments[idx] = { ...this.data.payments[idx], ...updates };
      this.saveData();
      return this.data.payments[idx];
    }
    return null;
  }

  // Goals
  getGoals(userId: string): FinancialGoal[] {
    return this.data.goals.filter(g => g.user_id === userId);
  }

  addGoal(goal: FinancialGoal): FinancialGoal {
    this.data.goals.push(goal);
    this.saveData();
    return goal;
  }

  updateGoal(id: string, userId: string, updates: Partial<FinancialGoal>): FinancialGoal | null {
    const idx = this.data.goals.findIndex(g => g.id === id && g.user_id === userId);
    if (idx !== -1) {
      this.data.goals[idx] = { ...this.data.goals[idx], ...updates };
      this.saveData();
      return this.data.goals[idx];
    }
    return null;
  }

  deleteGoal(id: string, userId: string): boolean {
    const initialLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => !(g.id === id && g.user_id === userId));
    const deleted = this.data.goals.length < initialLen;
    if (deleted) this.saveData();
    return deleted;
  }

  // AI Recommendations
  getRecommendations(userId: string): AIRecommendation[] {
    return this.data.recommendations
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addRecommendation(rec: AIRecommendation): AIRecommendation {
    this.data.recommendations.unshift(rec);
    this.saveData();
    return rec;
  }

  // Chat Sessions & Messages
  getChatSessions(userId: string): ChatSession[] {
    return this.data.chat_sessions
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getChatSession(sessionId: string, userId: string): ChatSession | undefined {
    return this.data.chat_sessions.find(s => s.id === sessionId && s.user_id === userId);
  }

  createChatSession(session: ChatSession): ChatSession {
    this.data.chat_sessions.unshift(session);
    this.saveData();
    return session;
  }

  deleteChatSession(sessionId: string, userId: string): boolean {
    const initialLen = this.data.chat_sessions.length;
    this.data.chat_sessions = this.data.chat_sessions.filter(s => !(s.id === sessionId && s.user_id === userId));
    this.data.chat_messages = this.data.chat_messages.filter(m => m.session_id !== sessionId);
    const deleted = this.data.chat_sessions.length < initialLen;
    if (deleted) this.saveData();
    return deleted;
  }

  getChatMessages(sessionId: string): ChatMessage[] {
    return this.data.chat_messages
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addChatMessage(msg: ChatMessage): ChatMessage {
    this.data.chat_messages.push(msg);
    const session = this.data.chat_sessions.find(s => s.id === msg.session_id);
    if (session) {
      session.updated_at = new Date().toISOString();
    }
    this.saveData();
    return msg;
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): boolean {
    let updated = false;
    this.data.notifications.forEach(n => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        updated = true;
      }
    });
    if (updated) this.saveData();
    return updated;
  }

  // Reset to initial demo data
  resetDemoData() {
    this.data = JSON.parse(JSON.stringify(initialSeed));
    this.saveData();
    return true;
  }

  // Delete all user records
  deleteUserData(userId: string) {
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.profiles = this.data.profiles.filter(p => p.user_id !== userId);
    this.data.credit_history = this.data.credit_history.filter(c => c.user_id !== userId);
    this.data.loans = this.data.loans.filter(l => l.user_id !== userId);
    this.data.payments = this.data.payments.filter(p => p.user_id !== userId);
    this.data.goals = this.data.goals.filter(g => g.user_id !== userId);
    this.data.recommendations = this.data.recommendations.filter(r => r.user_id !== userId);
    this.data.chat_sessions = this.data.chat_sessions.filter(s => s.user_id !== userId);
    this.data.notifications = this.data.notifications.filter(n => n.user_id !== userId);
    this.saveData();
    return true;
  }

  // Export all user data
  exportUserData(userId: string) {
    const user = this.getUserById(userId);
    if (!user) return null;
    const { password_hash, ...safeUser } = user as any;
    return {
      user: safeUser,
      profile: this.getProfileByUserId(userId),
      credit_history: this.getCreditHistory(userId),
      loans: this.getLoans(userId),
      payments: this.getPayments(userId),
      goals: this.getGoals(userId),
      recommendations: this.getRecommendations(userId),
      notifications: this.getNotifications(userId),
      exported_at: new Date().toISOString(),
      platform: 'FinHealth'
    };
  }
}

export const db = new Database();
