import { GoogleGenAI } from '@google/genai';
import type { FinancialProfile, AIRecommendation } from '../src/types/index.js';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Generate structured 5-step financial advisor recommendations using Gemini
export async function generateAdvisorRecommendation(
  profile: FinancialProfile,
  userName: string
): Promise<Omit<AIRecommendation, 'id' | 'user_id' | 'created_at'>> {
  const client = getGeminiClient();

  const userContext = `
USER FINANCIAL PROFILE:
Name: ${userName}
Current Credit/CIBIL Score: ${profile.current_credit_score} / 900
Monthly In-hand Income: ₹${profile.monthly_income.toLocaleString('en-IN')}
Other Income: ₹${profile.other_income.toLocaleString('en-IN')}
Monthly Total Expenses: ₹${profile.monthly_expenses.toLocaleString('en-IN')} (Essential: ₹${profile.essential_expenses.toLocaleString('en-IN')}, Discretionary: ₹${profile.discretionary_expenses.toLocaleString('en-IN')})
Total Outstanding Debt: ₹${profile.total_debt.toLocaleString('en-IN')}
Monthly Total EMI: ₹${profile.monthly_emi.toLocaleString('en-IN')}
Credit Cards Count: ${profile.credit_cards_count}
Total Credit Limit: ₹${profile.total_credit_limit.toLocaleString('en-IN')}
Credit Card Outstanding Balance: ₹${profile.credit_card_balance.toLocaleString('en-IN')}
Credit Utilization Ratio: ${profile.credit_utilization_ratio}%
Debt-to-Income (DTI) Ratio: ${profile.debt_to_income_ratio}%
Missed Payments (Last 24m): ${profile.missed_payments}
Late Payments (Last 24m): ${profile.late_payments}
Current Savings Balance: ₹${profile.savings_balance.toLocaleString('en-IN')}
Emergency Fund Balance: ₹${profile.emergency_fund_balance.toLocaleString('en-IN')}
Internal FinHealth Wellness Score: ${profile.financial_health_score}/100
`;

  const systemInstruction = `You are FinHealth AI Advisor, an expert financial wellness and credit intelligence consultant tailored for the Indian financial ecosystem.
Your job is to analyze the user's financial profile and return a structured JSON response containing:
1. "summary": Concise 2-3 sentence overview of their financial health standing.
2. "health_status": One of "Critical", "Fair", "Good", "Healthy", "Excellent".
3. "key_issues": Array of 3 specific financial bottlenecks or risks (e.g. credit utilization near threshold, low emergency fund reserve, high interest loan).
4. "recommendations": Exactly 5 practical, sequential action steps. Each step object must have:
   - "step": integer 1-5
   - "title": Short action title
   - "description": Practical 1-2 sentence instruction taking into account Indian financial realities (e.g. bill dates, high-interest debt payoff, emergency liquid funds)
   - "impact": "High", "Medium", or "Low"
5. "priority": One of "Low", "Medium", "High", "Critical".
6. "expected_direction": Cautious, encouraging outlook. Strictly NEVER guarantee exact point increases (e.g., say "These actions may support healthier credit behavior and score recovery over time", never "Your score will increase by 50 points").
7. "disclaimer": "FinHealth provides educational and informational insights and does not replace professional financial advice."

IMPORTANT: Return ONLY valid JSON with no markdown wrapping or ticks.`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${userContext}\n\nPlease analyze this profile and output the required JSON format.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      if (parsed.summary && Array.isArray(parsed.recommendations)) {
        return {
          summary: parsed.summary,
          health_status: parsed.health_status || 'Good',
          key_issues: parsed.key_issues || [],
          recommendations: parsed.recommendations,
          priority: parsed.priority || 'Medium',
          expected_direction: parsed.expected_direction || 'Consistent disciplined behavior may support steady financial progress over time.',
          disclaimer: 'FinHealth provides educational and informational insights and does not replace professional financial advice.',
        };
      }
    } catch (error) {
      console.error('Gemini API call failed, falling back to rule-based analysis:', error);
    }
  }

  // Intelligent deterministic fallback based on financial rules
  const isHighUtil = profile.credit_utilization_ratio > 30;
  const isHighDti = profile.debt_to_income_ratio > 40;
  const hasMissed = profile.missed_payments > 0;
  const lowEmergency = profile.emergency_fund_balance < (profile.essential_expenses * 3);

  const key_issues: string[] = [];
  if (isHighUtil) key_issues.push(`Credit utilization is ${profile.credit_utilization_ratio}%, surpassing the recommended 30% threshold.`);
  if (isHighDti) key_issues.push(`Debt-to-Income (DTI) ratio is ${profile.debt_to_income_ratio}%, placing pressure on monthly cash flow.`);
  if (hasMissed) key_issues.push(`${profile.missed_payments} missed payment(s) are severely depressing credit bureau scores.`);
  if (lowEmergency) key_issues.push(`Emergency fund of ₹${profile.emergency_fund_balance.toLocaleString('en-IN')} covers under 3 months of essential living costs.`);
  if (key_issues.length === 0) key_issues.push('Continue maintaining existing credit discipline and optimize surplus into low-cost investments.');

  return {
    summary: `Your FinHealth profile shows a ${profile.current_credit_score >= 750 ? 'strong' : profile.current_credit_score >= 700 ? 'healthy' : 'recovering'} foundation with a credit score of ${profile.current_credit_score} and ${profile.credit_utilization_ratio}% credit utilization.`,
    health_status: profile.financial_health_score >= 80 ? 'Excellent' : profile.financial_health_score >= 70 ? 'Healthy' : profile.financial_health_score >= 50 ? 'Fair' : 'Critical',
    key_issues: key_issues.slice(0, 3),
    recommendations: [
      {
        step: 1,
        title: isHighUtil ? 'Lower Credit Card Utilization Under 30%' : 'Keep Credit Utilization Under 20%',
        description: 'Pay down balances before statement generation dates or request a credit limit enhancement without spending more.',
        impact: 'High'
      },
      {
        step: 2,
        title: 'Maintain 100% On-Time Payment Discipline',
        description: 'Enable automated NACH/e-mandate standing instructions for all EMIs and credit card total amounts due.',
        impact: 'High'
      },
      {
        step: 3,
        title: 'Build 3-to-6 Month Emergency Safety Net',
        description: 'Direct surplus into an instant-access liquid mutual fund or sweep-in fixed deposit to prevent taking high-interest emergency debt.',
        impact: 'High'
      },
      {
        step: 4,
        title: 'Prioritize High-Interest Debt Clearance',
        description: 'Target highest interest unsecured debts first while paying minimum dues on all other accounts.',
        impact: 'Medium'
      },
      {
        step: 5,
        title: 'Limit Unplanned Hard Credit Inquiries',
        description: 'Space out any new loan or card applications by at least 6 months to avoid signaling credit hunger to bureaus.',
        impact: 'Medium'
      }
    ],
    priority: isHighUtil || hasMissed ? 'High' : 'Medium',
    expected_direction: 'Consistent adherence to these disciplined habits may support positive credit trajectory and reduced interest expense over the coming 3 to 6 months.',
    disclaimer: 'FinHealth provides educational and informational insights and does not replace professional financial advice.',
  };
}

// Generate contextual AI Chatbot response
export async function generateChatResponse(
  message: string,
  profile: FinancialProfile | undefined,
  userName: string,
  history: { sender: 'user' | 'assistant'; message: string }[]
): Promise<string> {
  const client = getGeminiClient();

  const userContext = profile ? `
USER FINANCIAL CONTEXT:
- Name: ${userName}
- Current Credit Score: ${profile.current_credit_score} (Indian CIBIL range: 300 to 900, 750+ is ideal)
- Monthly Income: ₹${profile.monthly_income.toLocaleString('en-IN')} (Other: ₹${profile.other_income.toLocaleString('en-IN')})
- Monthly Expenses: ₹${profile.monthly_expenses.toLocaleString('en-IN')}
- Total Debt: ₹${profile.total_debt.toLocaleString('en-IN')}
- Monthly Total EMI: ₹${profile.monthly_emi.toLocaleString('en-IN')}
- Total Credit Limit: ₹${profile.total_credit_limit.toLocaleString('en-IN')}
- Credit Card Balance: ₹${profile.credit_card_balance.toLocaleString('en-IN')}
- Credit Utilization: ${profile.credit_utilization_ratio}%
- Debt-to-Income (DTI): ${profile.debt_to_income_ratio}%
- Missed Payments: ${profile.missed_payments}
- Late Payments: ${profile.late_payments}
- Savings: ₹${profile.savings_balance.toLocaleString('en-IN')}
- Emergency Fund: ₹${profile.emergency_fund_balance.toLocaleString('en-IN')}
- FinHealth Internal Health Score: ${profile.financial_health_score}/100
` : `User is not yet fully profiled or in guest view.`;

  const systemInstruction = `You are FinHealth AI, the dedicated financial health & credit intelligence assistant designed specifically for Indian personal finance.
${userContext}

CORE CAPABILITIES & KNOWLEDGE:
- Indian financial terminology: CIBIL score (300-900), Credit bureaus (TransUnion CIBIL, Experian, CRIF High Mark, Equifax), EMI, DTI, Credit Utilization, Fixed Deposits (FD), Recurring Deposits (RD), PPF, Section 80C, NACH e-mandates.
- Credit score optimization: Timely payments (35% impact), Utilization under 30% (30% impact), Credit age (15%), Credit mix (10%), New inquiries (10%).

SAFETY & COMPLIANCE RULES:
1. Avoid guaranteeing investment returns or credit score increases (e.g. say "Taking these steps typically supports credit recovery over several reporting cycles", NEVER "Your score will jump 50 points").
2. Avoid pretending to be a bank or claiming live bureau integration; always clarify data is based on user-provided profile.
3. If the user asks about their personal health (e.g. "How is my credit score?", "Can I afford a car loan?", "What should I focus on?"), reference their specific figures respectfully and constructively!
4. Format with clean bullet points and bold headers when giving advice.
5. Always keep tone professional, empathetic, and encouraging. Include the standard reminder that insights are educational when high-stakes decisions are involved.`;

  if (client) {
    try {
      // Build conversation turns
      const recentHistory = history.slice(-6).map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.message}`).join('\n\n');
      const prompt = `${recentHistory ? `PREVIOUS CONVERSATION:\n${recentHistory}\n\n` : ''}User Question: ${message}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      const reply = response.text;
      if (reply && reply.trim().length > 0) {
        return reply.trim();
      }
    } catch (error) {
      console.error('Gemini chat generation failed, using intelligent fallback:', error);
    }
  }

  // Fallback responses tailored for common financial questions
  const lower = message.toLowerCase();

  if (lower.includes('health') || lower.includes('profile') || lower.includes('how am i doing') || lower.includes('overview')) {
    if (!profile) {
      return "You haven't completed your financial profile yet! Please complete the onboarding wizard or enter your details in the dashboard so I can provide personalized metrics.";
    }
    return `Based on your current FinHealth profile:\n\n• **CIBIL / Credit Score**: **${profile.current_credit_score}** (${profile.current_credit_score >= 750 ? 'Excellent' : profile.current_credit_score >= 700 ? 'Good' : 'Fair'}).\n• **Credit Utilization**: **${profile.credit_utilization_ratio}%** (${profile.credit_utilization_ratio <= 30 ? 'Healthy — within the optimal 30% band' : 'Elevated — aim to bring below 30%'}).\n• **Debt-to-Income (DTI)**: **${profile.debt_to_income_ratio}%** with monthly EMIs of ₹${profile.monthly_emi.toLocaleString('en-IN')}.\n• **FinHealth Score**: **${profile.financial_health_score}/100**.\n\n${profile.credit_utilization_ratio > 30 ? 'Your prime action item is paying down credit card balances before statement dates.' : 'Your payment history is steady! Consider expanding your emergency fund to cover at least 3 to 6 months of expenses.'}`;
  }

  if (lower.includes('dti') || lower.includes('debt to income')) {
    return `**Debt-to-Income (DTI) Ratio** measures the percentage of your monthly gross income that goes toward paying debts and EMIs.\n\n• **Formula**: (Total Monthly EMIs ÷ Total Monthly Income) × 100\n• **Ideal Range in India**:\n  - **Under 35%**: Healthy. Lenders readily approve new loans at competitive rates.\n  - **36% – 45%**: Moderate. Manageable, but lenders may scrutinize new applications.\n  - **Over 45%**: High / Critical. Signals high repayment stress.\n\n${profile ? `Your current DTI is **${profile.debt_to_income_ratio}%** (₹${profile.monthly_emi.toLocaleString('en-IN')} EMIs against ₹${profile.monthly_income.toLocaleString('en-IN')} income).` : ''}`;
  }

  if (lower.includes('utilization') || lower.includes('credit card limit')) {
    return `**Credit Utilization Ratio** is the percentage of your available credit card limit currently in use.\n\n• **Ideal Benchmark**: Keep total credit utilization **under 30%** (and under 20% for optimal CIBIL score growth).\n• **Why it matters**: Credit bureaus (CIBIL, Experian) calculate utilization as ~30% of your score weighting. High utilization signals credit hunger.\n• **Pro Tip**: You can pay down part of your bill a few days *before* the monthly billing cycle statement generation date to report a lower balance!`;
  }

  if (lower.includes('improve') || lower.includes('increase') || lower.includes('score') || lower.includes('cibil')) {
    return `Here is a proven 4-pillar roadmap to improve your credit health in India:\n\n1. **100% On-Time Payments**: Set auto-debit (NACH/e-mandate) on all loan EMIs and credit card total dues. Even a single 30-day late payment can drop scores by 30–60 points.\n2. **Tame Credit Utilization Below 30%**: If your limit is ₹1,00,000, keep revolving balances below ₹30,000.\n3. **Preserve Old Credit Cards**: Score algorithms reward length of credit history. Do not close your oldest credit card without a compelling reason.\n4. **Avoid Clustered Loan Inquiries**: Multiple loan or card applications within a short window create "hard inquiries" that signal financial urgency.\n\n*Note: Credit improvements generally show over 3 to 6 consecutive billing cycles of disciplined behavior.*`;
  }

  return `Thank you for asking! In the Indian financial ecosystem, balanced money management rests on three pillars: **on-time EMI payments**, **keeping credit card utilization under 30%**, and **building a 3-6 month liquid emergency fund**.\n\n${profile ? `Currently, your credit score is **${profile.current_credit_score}** and your utilization is **${profile.credit_utilization_ratio}%**.` : ''}\n\nFeel free to ask me anything specific about your loans, DTI ratio, debt repayment strategies (Snowball vs Avalanche), or how to plan for an upcoming loan!`;
}
