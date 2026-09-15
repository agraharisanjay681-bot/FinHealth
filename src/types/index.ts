export type EmploymentStatus = 'salaried' | 'self_employed' | 'business_owner' | 'student' | 'unemployed';

export type LoanType = 
  | 'Personal Loan'
  | 'Home Loan'
  | 'Education Loan'
  | 'Vehicle Loan'
  | 'Credit Card'
  | 'Gold Loan'
  | 'Business Loan'
  | 'Other';

export type PaymentStatus = 'paid' | 'upcoming' | 'late' | 'missed';

export type GoalStatus = 'in_progress' | 'completed' | 'on_hold';

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  employment?: EmploymentStatus;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialProfile {
  id: string;
  user_id: string;
  age?: number;
  employment_status?: EmploymentStatus;
  monthly_income: number;
  other_income: number;
  monthly_expenses: number;
  essential_expenses: number;
  discretionary_expenses: number;
  current_credit_score: number;
  previous_credit_score: number;
  credit_cards_count: number;
  total_credit_limit: number;
  credit_card_balance: number;
  total_debt: number;
  monthly_emi: number;
  active_loans_count: number;
  missed_payments: number;
  late_payments: number;
  savings_balance: number;
  emergency_fund_balance: number;
  financial_health_score: number; // 0 - 100
  debt_to_income_ratio: number; // percentage
  credit_utilization_ratio: number; // percentage
  updated_at: string;
}

export interface CreditScoreRecord {
  id: string;
  user_id: string;
  score: number;
  recorded_at: string;
  note?: string;
}

export interface Loan {
  id: string;
  user_id: string;
  name: string;
  type: LoanType;
  principal: number;
  remaining_amount: number;
  interest_rate: number;
  emi: number;
  monthly_emi?: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'paid';
  lender?: string;
}

export interface Payment {
  id: string;
  user_id: string;
  loan_id?: string;
  loan_name?: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  type?: 'EMI' | 'Credit Card' | 'Utility' | 'Other';
  payment_method?: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  category: 'credit_score' | 'debt_payoff' | 'debt_reduction' | 'utilization' | 'emergency_fund' | 'savings' | 'investment' | 'custom';
  current_value: number;
  target_value: number;
  target_date: string;
  status: GoalStatus;
  notes?: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  summary: string;
  bottleneck?: string;
  health_status: 'Critical' | 'Fair' | 'Good' | 'Healthy' | 'Excellent';
  key_issues: string[];
  recommendations: {
    step: number;
    title: string;
    description: string;
    impact: string;
    priority?: 'High' | 'Medium' | 'Low' | string;
    timeframe?: string;
  }[];
  roadmap?: {
    month1: string;
    month2: string;
    month3: string;
  };
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  expected_direction: string;
  disclaimer: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  is_read: boolean;
  created_at: string;
}

export interface RoadmapStep {
  month: number;
  title: string;
  goals: string[];
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface AuthResponse {
  user: User;
  token: string;
  hasCompletedOnboarding: boolean;
}
