import { Router, Response } from 'express';
import { db } from './db.js';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authenticateToken, 
  AuthenticatedRequest 
} from './auth.js';
import { generateAdvisorRecommendation, generateChatResponse } from './gemini.js';
import type { FinancialProfile, Loan, Payment, FinancialGoal, CreditScoreRecord } from '../src/types/index.js';

export const apiRouter = Router();

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FinHealth API',
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ----------------------------------------------------
// Authentication Routes
// ----------------------------------------------------
apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createUser(newUser);

  const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });

  res.status(201).json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token,
    hasCompletedOnboarding: false,
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email);
  if (!user || !comparePassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  const profile = db.getProfileByUserId(user.id);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, age: user.age, employment: user.employment, avatar: user.avatar },
    token,
    hasCompletedOnboarding: Boolean(profile),
  });
});

// Demo login for 1-click evaluation (Alex Sharma)
apiRouter.post('/auth/demo', (req, res) => {
  const user = db.getUserByEmail('alex.sharma@example.com');
  if (!user) {
    return res.status(500).json({ error: 'Demo user not seeded' });
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  const profile = db.getProfileByUserId(user.id);

  res.json({
    user: { id: user.id, name: user.name, email: user.email, age: user.age, employment: user.employment, avatar: user.avatar },
    token,
    hasCompletedOnboarding: Boolean(profile),
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password_hash, ...safeUser } = user as any;
  const profile = db.getProfileByUserId(user.id);
  res.json({
    user: safeUser,
    hasCompletedOnboarding: Boolean(profile),
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

apiRouter.get('/auth/oauth/config', (req, res) => {
  res.json({
    google: {
      available: Boolean(process.env.GOOGLE_CLIENT_ID),
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : null,
    },
    github: {
      available: Boolean(process.env.GITHUB_CLIENT_ID),
      clientId: process.env.GITHUB_CLIENT_ID ? 'Configured' : null,
    },
    linkedin: {
      available: Boolean(process.env.LINKEDIN_CLIENT_ID),
      clientId: process.env.LINKEDIN_CLIENT_ID ? 'Configured' : null,
    },
  });
});

// OAuth Simulation / Sandbox sign-in for testing when real client secrets are absent
apiRouter.post('/auth/oauth/simulate', (req, res) => {
  const { provider, email, name } = req.body;
  const mockEmail = email || `demo.${provider || 'oauth'}@example.com`;
  const mockName = name || `${provider ? provider.toUpperCase() : 'OAuth'} User`;

  let user = db.getUserByEmail(mockEmail);
  if (!user) {
    user = {
      id: `usr_${provider}_${Date.now()}`,
      name: mockName,
      email: mockEmail,
      password_hash: hashPassword('oauth-demo-secret'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.createUser(user);
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  const profile = db.getProfileByUserId(user.id);

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
    hasCompletedOnboarding: Boolean(profile),
  });
});

// ----------------------------------------------------
// Financial Profile & Onboarding
// ----------------------------------------------------
apiRouter.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getProfileByUserId(req.userId!);
  res.json({ profile: profile || null });
});

apiRouter.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body;
  const existing = db.getProfileByUserId(req.userId!);
  
  if (!existing) {
    return res.status(404).json({ error: 'Profile not found. Please complete onboarding first.' });
  }

  const totalIncome = (updates.monthly_income ?? existing.monthly_income) + (updates.other_income ?? existing.other_income);
  const totalEmi = updates.monthly_emi ?? existing.monthly_emi;
  const dti = totalIncome > 0 ? Math.round((totalEmi / totalIncome) * 100) : 0;

  const totalLimit = updates.total_credit_limit ?? existing.total_credit_limit;
  const cardBalance = updates.credit_card_balance ?? existing.credit_card_balance;
  const utilization = totalLimit > 0 ? Math.round((cardBalance / totalLimit) * 100) : 0;

  // Recalculate health score (0 - 100)
  const creditScore = updates.current_credit_score ?? existing.current_credit_score;
  const missed = updates.missed_payments ?? existing.missed_payments;
  
  let healthScore = 50;
  healthScore += Math.min(30, Math.max(0, Math.round(((creditScore - 300) / 600) * 30)));
  healthScore += utilization <= 20 ? 25 : utilization <= 30 ? 20 : utilization <= 50 ? 10 : 0;
  healthScore += dti <= 25 ? 25 : dti <= 40 ? 18 : dti <= 50 ? 10 : 0;
  healthScore -= (missed * 15);
  healthScore = Math.max(10, Math.min(99, healthScore));

  const updatedProfile: FinancialProfile = {
    ...existing,
    ...updates,
    debt_to_income_ratio: dti,
    credit_utilization_ratio: utilization,
    financial_health_score: healthScore,
    updated_at: new Date().toISOString(),
  };

  db.createOrUpdateProfile(updatedProfile);

  res.json({ profile: updatedProfile });
});

apiRouter.post('/profile/onboarding', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    age,
    employment,
    monthly_income = 50000,
    other_income = 0,
    monthly_expenses = 25000,
    essential_expenses = 18000,
    discretionary_expenses = 7000,
    current_credit_score = 700,
    credit_cards_count = 1,
    total_credit_limit = 100000,
    credit_card_balance = 20000,
    total_debt = 150000,
    monthly_emi = 10000,
    active_loans_count = 1,
    missed_payments = 0,
    late_payments = 0,
    savings_balance = 50000,
    emergency_fund_balance = 30000,
    primary_goal = 'Improve Credit Score'
  } = req.body;

  if (name || age || employment) {
    db.updateUser(req.userId!, { name, age, employment });
  }

  const totalIncome = monthly_income + other_income;
  const dti = totalIncome > 0 ? Math.round((monthly_emi / totalIncome) * 100) : 0;
  const utilization = total_credit_limit > 0 ? Math.round((credit_card_balance / total_credit_limit) * 100) : 0;

  // Calculate internal financial health score
  let healthScore = 50;
  healthScore += Math.min(30, Math.max(0, Math.round(((current_credit_score - 300) / 600) * 30)));
  healthScore += utilization <= 20 ? 25 : utilization <= 30 ? 20 : utilization <= 50 ? 10 : 0;
  healthScore += dti <= 25 ? 25 : dti <= 40 ? 18 : dti <= 50 ? 10 : 0;
  healthScore -= (missed_payments * 15);
  healthScore = Math.max(10, Math.min(99, healthScore));

  const profile: FinancialProfile = {
    id: `prof_${req.userId}`,
    user_id: req.userId!,
    monthly_income: Number(monthly_income),
    other_income: Number(other_income),
    monthly_expenses: Number(monthly_expenses),
    essential_expenses: Number(essential_expenses),
    discretionary_expenses: Number(discretionary_expenses),
    current_credit_score: Number(current_credit_score),
    previous_credit_score: Math.max(300, Number(current_credit_score) - 10),
    credit_cards_count: Number(credit_cards_count),
    total_credit_limit: Number(total_credit_limit),
    credit_card_balance: Number(credit_card_balance),
    total_debt: Number(total_debt),
    monthly_emi: Number(monthly_emi),
    active_loans_count: Number(active_loans_count),
    missed_payments: Number(missed_payments),
    late_payments: Number(late_payments),
    savings_balance: Number(savings_balance),
    emergency_fund_balance: Number(emergency_fund_balance),
    financial_health_score: healthScore,
    debt_to_income_ratio: dti,
    credit_utilization_ratio: utilization,
    updated_at: new Date().toISOString(),
  };

  db.createOrUpdateProfile(profile);

  // Add initial credit history point
  db.addCreditRecord({
    id: `ch_${Date.now()}`,
    user_id: req.userId!,
    score: profile.current_credit_score,
    recorded_at: new Date().toISOString(),
    note: 'Initial onboarding score',
  });

  // Create initial goal based on selection
  db.addGoal({
    id: `goal_${Date.now()}`,
    user_id: req.userId!,
    title: primary_goal,
    category: primary_goal.toLowerCase().includes('credit') ? 'credit_score' : 'debt_reduction',
    current_value: profile.current_credit_score,
    target_value: Math.min(800, profile.current_credit_score + 50),
    target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'in_progress',
    notes: 'Generated during financial onboarding.'
  });

  // Welcome notification
  db.addNotification({
    id: `notif_${Date.now()}`,
    user_id: req.userId!,
    title: 'Welcome to FinHealth!',
    message: 'Your financial profile has been analyzed. Check your dashboard for actionable credit insights.',
    type: 'success',
    is_read: false,
    created_at: new Date().toISOString()
  });

  // Generate initial AI recommendation asynchronously or synchronously
  try {
    const user = db.getUserById(req.userId!);
    const recData = await generateAdvisorRecommendation(profile, user?.name || 'Valued User');
    db.addRecommendation({
      id: `rec_${Date.now()}`,
      user_id: req.userId!,
      ...recData,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error generating onboarding AI recommendation:', err);
  }

  res.status(201).json({
    profile,
    message: 'Onboarding completed successfully'
  });
});

// ----------------------------------------------------
// Dashboard Aggregation
// ----------------------------------------------------
apiRouter.get('/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const user = db.getUserById(userId);
  const profile = db.getProfileByUserId(userId);
  const creditHistory = db.getCreditHistory(userId);
  const loans = db.getLoans(userId);
  const payments = db.getPayments(userId);
  const goals = db.getGoals(userId);
  const recommendations = db.getRecommendations(userId);
  const notifications = db.getNotifications(userId);

  res.json({
    user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null,
    profile,
    creditHistory: creditHistory.slice(-6),
    loansSummary: {
      total: loans.length,
      active: loans.filter(l => l.status === 'active').length,
      totalRemaining: loans.reduce((acc, l) => acc + (l.status === 'active' ? l.remaining_amount : 0), 0),
      totalEmi: loans.reduce((acc, l) => acc + (l.status === 'active' ? l.emi : 0), 0),
    },
    recentPayments: payments.slice(0, 5),
    activeGoals: goals.filter(g => g.status === 'in_progress').slice(0, 3),
    latestRecommendation: recommendations[0] || null,
    unreadNotificationsCount: notifications.filter(n => !n.is_read).length,
  });
});

// ----------------------------------------------------
// Credit History & Simulator
// ----------------------------------------------------
apiRouter.get('/credit/history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const history = db.getCreditHistory(req.userId!);
  res.json({ history });
});

apiRouter.post('/credit/history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { score, note } = req.body;
  const numScore = Number(score);

  if (isNaN(numScore) || numScore < 300 || numScore > 900) {
    return res.status(400).json({ error: 'Credit score must be a number between 300 and 900.' });
  }

  const record: CreditScoreRecord = {
    id: `ch_${Date.now()}`,
    user_id: req.userId!,
    score: numScore,
    recorded_at: new Date().toISOString(),
    note: note || 'Manual score update',
  };

  db.addCreditRecord(record);

  // Update profile current and previous score
  const profile = db.getProfileByUserId(req.userId!);
  if (profile) {
    profile.previous_credit_score = profile.current_credit_score;
    profile.current_credit_score = numScore;
    profile.updated_at = new Date().toISOString();
    db.createOrUpdateProfile(profile);
  }

  res.status(201).json({ record, profile });
});

// ----------------------------------------------------
// Loans Management
// ----------------------------------------------------
apiRouter.get('/loans', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const loans = db.getLoans(req.userId!);
  res.json({ loans });
});

apiRouter.post('/loans', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { name, type, principal, remaining_amount, interest_rate, emi, start_date, end_date, lender } = req.body;

  if (!name || !principal || isNaN(Number(principal))) {
    return res.status(400).json({ error: 'Valid loan name and principal amount are required.' });
  }

  const newLoan: Loan = {
    id: `loan_${Date.now()}`,
    user_id: req.userId!,
    name,
    type: type || 'Personal Loan',
    principal: Number(principal),
    remaining_amount: Number(remaining_amount ?? principal),
    interest_rate: Number(interest_rate || 10),
    emi: Number(emi || 0),
    start_date: start_date || new Date().toISOString().split('T')[0],
    end_date: end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    lender: lender || '',
  };

  db.addLoan(newLoan);

  // Refresh profile totals
  const allLoans = db.getLoans(req.userId!);
  const activeLoans = allLoans.filter(l => l.status === 'active');
  const profile = db.getProfileByUserId(req.userId!);
  if (profile) {
    profile.total_debt = activeLoans.reduce((sum, l) => sum + l.remaining_amount, 0) + profile.credit_card_balance;
    profile.monthly_emi = activeLoans.reduce((sum, l) => sum + l.emi, 0);
    profile.active_loans_count = activeLoans.length;
    db.createOrUpdateProfile(profile);
  }

  res.status(201).json({ loan: newLoan });
});

apiRouter.put('/loans/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateLoan(req.params.id, req.userId!, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  // Refresh profile totals
  const allLoans = db.getLoans(req.userId!);
  const activeLoans = allLoans.filter(l => l.status === 'active');
  const profile = db.getProfileByUserId(req.userId!);
  if (profile) {
    profile.total_debt = activeLoans.reduce((sum, l) => sum + l.remaining_amount, 0) + profile.credit_card_balance;
    profile.monthly_emi = activeLoans.reduce((sum, l) => sum + l.emi, 0);
    profile.active_loans_count = activeLoans.length;
    db.createOrUpdateProfile(profile);
  }

  res.json({ loan: updated });
});

apiRouter.delete('/loans/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteLoan(req.params.id, req.userId!);
  if (!success) {
    return res.status(404).json({ error: 'Loan not found' });
  }

  // Refresh profile totals
  const allLoans = db.getLoans(req.userId!);
  const activeLoans = allLoans.filter(l => l.status === 'active');
  const profile = db.getProfileByUserId(req.userId!);
  if (profile) {
    profile.total_debt = activeLoans.reduce((sum, l) => sum + l.remaining_amount, 0) + profile.credit_card_balance;
    profile.monthly_emi = activeLoans.reduce((sum, l) => sum + l.emi, 0);
    profile.active_loans_count = activeLoans.length;
    db.createOrUpdateProfile(profile);
  }

  res.json({ message: 'Loan removed successfully' });
});

// ----------------------------------------------------
// Payments Management
// ----------------------------------------------------
apiRouter.get('/payments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const payments = db.getPayments(req.userId!);
  res.json({ payments });
});

apiRouter.post('/payments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { loan_id, loan_name, amount, due_date, status, type } = req.body;

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: 'Valid payment amount is required.' });
  }

  const payment: Payment = {
    id: `pay_${Date.now()}`,
    user_id: req.userId!,
    loan_id,
    loan_name: loan_name || 'Loan EMI',
    amount: Number(amount),
    due_date: due_date || new Date().toISOString().split('T')[0],
    status: status || 'upcoming',
    type: type || 'EMI',
    paid_date: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined
  };

  db.addPayment(payment);

  res.status(201).json({ payment });
});

apiRouter.put('/payments/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updatePayment(req.params.id, req.userId!, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  res.json({ payment: updated });
});

// ----------------------------------------------------
// Financial Goals
// ----------------------------------------------------
apiRouter.get('/goals', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const goals = db.getGoals(req.userId!);
  res.json({ goals });
});

apiRouter.post('/goals', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { title, category, current_value, target_value, target_date, notes } = req.body;

  if (!title || !target_value) {
    return res.status(400).json({ error: 'Goal title and target value are required.' });
  }

  const goal: FinancialGoal = {
    id: `goal_${Date.now()}`,
    user_id: req.userId!,
    title,
    category: category || 'custom',
    current_value: Number(current_value || 0),
    target_value: Number(target_value),
    target_date: target_date || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'in_progress',
    notes: notes || '',
  };

  db.addGoal(goal);
  res.status(201).json({ goal });
});

apiRouter.put('/goals/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateGoal(req.params.id, req.userId!, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  res.json({ goal: updated });
});

apiRouter.delete('/goals/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteGoal(req.params.id, req.userId!);
  if (!success) {
    return res.status(404).json({ error: 'Goal not found' });
  }
  res.json({ message: 'Goal removed successfully' });
});

// ----------------------------------------------------
// AI Financial Advisor Recommendations
// ----------------------------------------------------
apiRouter.get('/recommendations', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const recs = db.getRecommendations(req.userId!);
  res.json({ recommendations: recs });
});

apiRouter.post('/recommendations/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const profile = db.getProfileByUserId(userId);
  const user = db.getUserById(userId);

  if (!profile) {
    return res.status(400).json({ error: 'Please complete your financial profile first.' });
  }

  try {
    const analysis = await generateAdvisorRecommendation(profile, user?.name || 'User');
    const newRec = db.addRecommendation({
      id: `rec_${Date.now()}`,
      user_id: userId,
      ...analysis,
      created_at: new Date().toISOString()
    });

    res.json({ recommendation: newRec });
  } catch (error) {
    console.error('Failed to generate recommendation:', error);
    res.status(500).json({ error: 'Failed to generate recommendation. Please try again.' });
  }
});

// ----------------------------------------------------
// AI Chatbot (Sessions & Messaging)
// ----------------------------------------------------
apiRouter.get('/chat/sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const sessions = db.getChatSessions(req.userId!);
  res.json({ sessions });
});

apiRouter.post('/chat/sessions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { title } = req.body;
  const session = db.createChatSession({
    id: `sess_${Date.now()}`,
    user_id: req.userId!,
    title: title || 'New Conversation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  res.status(201).json({ session });
});

apiRouter.get('/chat/sessions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const session = db.getChatSession(req.params.id, req.userId!);
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  const messages = db.getChatMessages(req.params.id);
  res.json({ session, messages });
});

apiRouter.delete('/chat/sessions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteChatSession(req.params.id, req.userId!);
  if (!success) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  res.json({ message: 'Session deleted successfully' });
});

apiRouter.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const userId = req.userId!;
  const user = db.getUserById(userId);
  const profile = db.getProfileByUserId(userId);

  // Ensure valid session
  let currentSessionId = sessionId;
  if (!currentSessionId) {
    const newSession = db.createChatSession({
      id: `sess_${Date.now()}`,
      user_id: userId,
      title: message.slice(0, 30) + '...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    currentSessionId = newSession.id;
  }

  // Save user message
  const userMsg = db.addChatMessage({
    id: `msg_u_${Date.now()}`,
    session_id: currentSessionId,
    sender: 'user',
    message: message.trim(),
    created_at: new Date().toISOString(),
  });

  // Get previous messages for conversation context
  const history = db.getChatMessages(currentSessionId).map(m => ({
    sender: m.sender,
    message: m.message
  }));

  try {
    const aiReplyText = await generateChatResponse(
      message.trim(),
      profile,
      user?.name || 'User',
      history
    );

    const assistantMsg = db.addChatMessage({
      id: `msg_a_${Date.now()}`,
      session_id: currentSessionId,
      sender: 'assistant',
      message: aiReplyText,
      created_at: new Date().toISOString(),
    });

    res.json({
      reply: assistantMsg,
      sessionId: currentSessionId,
      disclaimer: 'FinHealth AI provides educational financial insights based on the information you provide. It is not a substitute for professional financial advice.'
    });
  } catch (err) {
    console.error('Chat generation error:', err);
    res.status(500).json({ error: 'Failed to process chat response' });
  }
});

// ----------------------------------------------------
// Notifications
// ----------------------------------------------------
apiRouter.get('/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.getNotifications(req.userId!);
  res.json({ notifications });
});

apiRouter.put('/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.markNotificationRead(req.params.id, req.userId!);
  res.json({ success: updated });
});

apiRouter.post('/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.markAllNotificationsRead(req.userId!);
  res.json({ success: updated });
});

// ----------------------------------------------------
// Financial Analytics
// ----------------------------------------------------
apiRouter.get('/analytics', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const profile = db.getProfileByUserId(userId);
  const creditHistory = db.getCreditHistory(userId);
  const loans = db.getLoans(userId);

  // Calculate loan distribution by type
  const loanDistribution: { [key: string]: number } = {};
  loans.forEach(l => {
    loanDistribution[l.type] = (loanDistribution[l.type] || 0) + l.remaining_amount;
  });

  const loanPieData = Object.entries(loanDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Debt reduction projection / history
  const debtHistory = [
    { month: 'Jan', debt: (profile?.total_debt || 280000) + 35000 },
    { month: 'Feb', debt: (profile?.total_debt || 280000) + 26000 },
    { month: 'Mar', debt: (profile?.total_debt || 280000) + 18000 },
    { month: 'Apr', debt: (profile?.total_debt || 280000) + 9000 },
    { month: 'May', debt: profile?.total_debt || 280000 },
  ];

  // Income vs Expenses
  const cashflowData = [
    { name: 'Income', amount: (profile?.monthly_income || 0) + (profile?.other_income || 0) },
    { name: 'Essential Expenses', amount: profile?.essential_expenses || 0 },
    { name: 'Discretionary', amount: profile?.discretionary_expenses || 0 },
    { name: 'EMIs', amount: profile?.monthly_emi || 0 },
    { name: 'Surplus / Savings', amount: Math.max(0, ((profile?.monthly_income || 0) + (profile?.other_income || 0)) - (profile?.monthly_expenses || 0) - (profile?.monthly_emi || 0)) },
  ];

  res.json({
    profile,
    creditHistory,
    loanPieData,
    debtHistory,
    cashflowData,
    insights: {
      credit: profile?.credit_utilization_ratio && profile.credit_utilization_ratio <= 30
        ? 'Your credit utilization is well contained under the recommended 30% ceiling.'
        : 'Credit utilization is slightly high; lower your card statement balance to boost score.',
      debt: 'Your outstanding debt trend shows disciplined month-on-month principal repayment.',
      savings: `Surplus cashflow is ~₹${Math.max(0, ((profile?.monthly_income || 0) + (profile?.other_income || 0)) - (profile?.monthly_expenses || 0) - (profile?.monthly_emi || 0)).toLocaleString('en-IN')} per month.`,
      action: 'Allocate at least 50% of monthly surplus into liquid emergency reserve building.'
    }
  });
});

// ----------------------------------------------------
// Export User Data & Reset
// ----------------------------------------------------
apiRouter.get('/export', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const data = db.exportUserData(req.userId!);
  if (!data) {
    return res.status(404).json({ error: 'No data to export' });
  }
  res.setHeader('Content-Disposition', 'attachment; filename="finhealth_export.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

apiRouter.delete('/account', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  db.deleteUserData(req.userId!);
  res.json({ message: 'Account and associated records deleted permanently' });
});

apiRouter.post('/reset-demo', (req, res) => {
  db.resetDemoData();
  res.json({ message: 'Demo data has been reset successfully' });
});
