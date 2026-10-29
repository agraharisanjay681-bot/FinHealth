import { GoogleGenAI } from '@google/genai';
import type { FinancialProfile, AIRecommendation, Loan, FinancialGoal } from '../src/types/index.js';

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Model configuration for Gemini
const GEMINI_MODELS = ['gemini-3.6-flash'];

/**
 * Call OpenAI Chat Completions API securely from backend
 */
async function callOpenAI(messages: { role: 'system' | 'user' | 'assistant'; content: string }[], responseFormatJson = false): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') return null;

  const model = process.env.OPENAI_MODEL || 'gpt-5.6';

  const modelsToTry = [model, 'gpt-4o', 'gpt-4o-mini'];

  for (const m of modelsToTry) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: m,
          messages,
          temperature: 0.3,
          response_format: responseFormatJson ? { type: 'json_object' } : undefined,
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content.trim();
        }
      }
    } catch (error) {
      console.error(`Failed to call OpenAI API with model ${m}:`, error);
    }
  }

  return null;
}

/**
 * Generate structured 5-step financial advisor recommendations using Gemini or OpenAI
 */
export async function generateAdvisorRecommendation(
  profile: FinancialProfile,
  userName: string,
  loans: Loan[] = [],
  goals: FinancialGoal[] = []
): Promise<Omit<AIRecommendation, 'id' | 'user_id' | 'created_at'>> {
  const geminiClient = getGeminiClient();
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  const loansContext = loans.length > 0 
    ? loans.map(l => `- ${l.name} (${l.type}): Balance ₹${l.remaining_amount.toLocaleString('en-IN')}, EMI ₹${l.emi.toLocaleString('en-IN')}, Rate ${l.interest_rate}%`).join('\n')
    : 'No active loans.';

  const goalsContext = goals.length > 0
    ? goals.map(g => `- ${g.title}: Target ₹${g.target_value.toLocaleString('en-IN')}, Current ₹${g.current_value.toLocaleString('en-IN')}`).join('\n')
    : 'No goals set.';

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

ACTIVE LOANS:
${loansContext}

FINANCIAL GOALS:
${goalsContext}
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

  // Try Gemini if available
  if (geminiClient) {
    for (const model of GEMINI_MODELS) {
      try {
        const response = await geminiClient.models.generateContent({
          model,
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
      } catch (error: any) {
        console.warn(`Gemini model ${model} failed for advisor:`, error?.message || error);
      }
    }
  }

  // Try OpenAI if Gemini failed or OpenAI is configured
  if (hasOpenAI) {
    try {
      const openAiRes = await callOpenAI([
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `${userContext}\n\nPlease analyze this profile and output the required JSON format.` }
      ], true);

      if (openAiRes) {
        const parsed = JSON.parse(openAiRes);
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
      }
    } catch (err) {
      console.warn('OpenAI advisor recommendation failed:', err);
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
  if (hasMissed) key_issues.push(`${profile.missed_payments} missed payment(s) are depressing bureau scores.`);
  if (lowEmergency) key_issues.push(`Emergency fund of ₹${profile.emergency_fund_balance.toLocaleString('en-IN')} covers under 3 months of essential living costs.`);
  if (key_issues.length === 0) key_issues.push('Continue maintaining credit discipline and optimize surplus into emergency fund reserves.');

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

/**
 * Generate contextual AI Chatbot response tailored with full FinHealth profile data
 */
export async function generateChatResponse(
  message: string,
  profile: FinancialProfile | undefined,
  userName: string,
  history: { sender: 'user' | 'assistant'; message: string }[] = [],
  loans: Loan[] = [],
  goals: FinancialGoal[] = []
): Promise<string> {
  const geminiClient = getGeminiClient();
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  const firstName = userName ? userName.split(' ')[0] : 'there';

  const loansContext = loans.length > 0 
    ? loans.map(l => `  • ${l.name} (${l.type}): Balance ₹${l.remaining_amount.toLocaleString('en-IN')}, EMI ₹${l.emi.toLocaleString('en-IN')}, Rate ${l.interest_rate}%, Lender: ${l.lender}`).join('\n')
    : '  • No active loans.';

  const goalsContext = goals.length > 0
    ? goals.map(g => `  • ${g.title}: Target ₹${g.target_value.toLocaleString('en-IN')}, Saved ₹${g.current_value.toLocaleString('en-IN')}`).join('\n')
    : '  • No specific goals configured.';

  const emergencyMonths = profile && profile.monthly_expenses > 0 
    ? (profile.emergency_fund_balance / profile.monthly_expenses).toFixed(1) 
    : '0';

  const userFinancialContext = profile ? `
USER FINANCIAL CONTEXT (Supplementary - Use ONLY when relevant to the user's specific question):
- Name: ${userName}
- Current CIBIL / Credit Score: ${profile.current_credit_score} / 900
- Monthly In-Hand Income: ₹${profile.monthly_income.toLocaleString('en-IN')} (Other Income: ₹${profile.other_income.toLocaleString('en-IN')})
- Total Monthly Expenses: ₹${profile.monthly_expenses.toLocaleString('en-IN')} (Essential: ₹${profile.essential_expenses.toLocaleString('en-IN')}, Discretionary: ₹${profile.discretionary_expenses.toLocaleString('en-IN')})
- Total Outstanding Debt: ₹${profile.total_debt.toLocaleString('en-IN')}
- Monthly Total EMI: ₹${profile.monthly_emi.toLocaleString('en-IN')}
- Active Loans Count: ${profile.active_loans_count}
- Credit Cards Count: ${profile.credit_cards_count}
- Total Credit Limit: ₹${profile.total_credit_limit.toLocaleString('en-IN')}
- Credit Card Outstanding Balance: ₹${profile.credit_card_balance.toLocaleString('en-IN')}
- Credit Card Utilization Ratio: ${profile.credit_utilization_ratio}%
- Debt-to-Income (DTI) Ratio: ${profile.debt_to_income_ratio}%
- Missed Payments (Last 24m): ${profile.missed_payments}
- Late Payments (Last 24m): ${profile.late_payments}
- Savings Balance: ₹${profile.savings_balance.toLocaleString('en-IN')}
- Emergency Fund Balance: ₹${profile.emergency_fund_balance.toLocaleString('en-IN')} (~${emergencyMonths} months living buffer)
- Internal FinHealth Wellness Score: ${profile.financial_health_score}/100

ACTIVE LOANS:
${loansContext}

FINANCIAL GOALS:
${goalsContext}
` : `User has not configured a saved financial profile.`;

  const systemInstruction = `You are FinHealth AI. Help users with financial and credit-health questions.
Answer the user's current question directly. Use personal financial data only when relevant.

CORE PRIORITY RULES:
1. ALWAYS ANSWER THE USER'S CURRENT QUESTION DIRECTLY:
   - If the user asks a general financial/economic question (e.g., "What is DTI?", "What is an emergency fund?", "What is credit utilization?"), explain the concept clearly, directly, and educationally. Do NOT dump their personal credit score or metrics unless asked.
   - If the user asks about live market prices or specific stocks (e.g., "What is stock price of Tesla?", "Tata Motors share price", "Reliance price"), state clearly that you do not provide live real-time intraday ticker feeds and direct them to Google Finance, Yahoo Finance, or NSE/BSE. NEVER output the user's personal credit score, utilization, or financial analysis for stock/market questions.
   - If the user greets you (e.g., "Hello", "Hi", "Good morning"), reply warmly (e.g., "Hello! How can I help you with your financial health today?"). Do NOT dump their financial metrics.
   - If the user asks for advice on their credit score or utilization (e.g., "How can I improve my credit score?", "Why is my utilization high?"), give targeted actionable advice referencing their relevant metric.
   - If the user explicitly asks to analyze their financial health (e.g., "Analyze my financial health", "Identify my biggest bottleneck"), provide a comprehensive structured health summary.
   - If the user asks an unrelated question, answer it normally or explain that it is outside FinHealth's main scope.

2. NEVER AUTOMATICALLY RETURN THE USER'S FINANCIAL ANALYSIS:
   - Do NOT start normal responses with "Hello Mubin! I'm FinHealth AI, reviewing your real-time metrics... Credit Score: ... Credit Utilization: ...".
   - The user's question MUST determine the response.

3. PREVENT FABRICATED LIVE DATA:
   - Do not invent live stock prices or live intraday numbers.

4. SAFETY & COMPLIANCE:
   - Never guarantee exact score changes or loan approvals.
   - Maintain a helpful, encouraging tone formatted in clean Markdown.`;

  // 1. Try Google Gemini API
  if (geminiClient) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const historyParts = history.slice(-6).map(h => `${h.sender === 'user' ? 'User' : 'FinHealth AI'}: ${h.message}`).join('\n\n');
        
        const contents = [
          userFinancialContext,
          historyParts ? `CONVERSATION HISTORY:\n${historyParts}` : '',
          `User's Latest Question: ${message}`
        ].filter(Boolean).join('\n\n');

        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          }
        });

        const reply = response.text;
        if (reply && reply.trim().length > 0) {
          return reply.trim();
        }
      } catch (error: any) {
        console.warn(`Gemini attempt ${attempt + 1} failed:`, error?.message || error);
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 600));
        }
      }
    }
  }

  // 2. Try OpenAI API
  if (hasOpenAI) {
    try {
      const openAiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: `${systemInstruction}\n\n${userFinancialContext}` },
        ...history.slice(-6).map(h => ({
          role: (h.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: h.message,
        })),
        { role: 'user', content: message }
      ];

      const openAiReply = await callOpenAI(openAiMessages);
      if (openAiReply && openAiReply.trim().length > 0) {
        return openAiReply.trim();
      }
    } catch (error) {
      console.warn('OpenAI chat fallback error:', error);
    }
  }

  // 3. Fallback responses computed with real financial mathematics from profile
  return generateDeterministicFallback(message, profile, userName, loans, goals);
}

/**
 * Intelligent deterministic response engine based on user metrics
 */
export function generateDeterministicFallback(
  message: string,
  profile: FinancialProfile | undefined,
  userName: string,
  loans: Loan[] = [],
  goals: FinancialGoal[] = []
): string {
  const lower = message.toLowerCase().trim();
  const firstName = userName ? userName.split(' ')[0] : 'there';

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
    return `### 📈 Real-Time Market Data Notice\n\n` +
      `I do not have access to live intraday streaming market feeds for real-time stock prices (such as Tesla, Tata Motors, or Apple).\n\n` +
      `**Where to check live prices:**\n` +
      `• **Global & US Equities (Tesla / TSLA)**: Real-time quotes are available on **Google Finance**, **Yahoo Finance**, or **NASDAQ**.\n` +
      `• **Indian Equities (NSE/BSE)**: Track real-time prices on **Google Finance**, **Moneycontrol**, **Groww**, or **Zerodha Kite**.\n\n` +
      `Let me know if you would like guidance on budgeting for investments, building your emergency safety net, or long-term financial planning!`;
  }

  // 2. General greeting (Hello, Hi, Hey)
  if (
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
    return `Hello ${firstName}! 👋 How can I help you today with your financial health, credit score, debt management, or budget planning?`;
  }

  // 3. General Educational: What is DTI?
  if (
    lower.includes('what is dti') || 
    lower.includes('what is debt to income') || 
    lower.includes('explain dti') || 
    lower.includes('meaning of dti') || 
    lower.includes('define dti') ||
    lower === 'dti' ||
    lower === 'dti?'
  ) {
    return `### ⚖️ Debt-to-Income (DTI) Ratio Explained\n\n` +
      `**Debt-to-Income (DTI) Ratio** is a key financial metric measuring the percentage of your gross monthly income that goes toward paying fixed debt obligations (such as home loans, personal loans, and credit card minimum dues).\n\n` +
      `**Calculation Formula:**\n` +
      `$$\\text{DTI} = \\left( \\frac{\\text{Total Monthly Debt Payments}}{\\text{Gross Monthly Income}} \\right) \\times 100$$\n\n` +
      `**Lending Benchmarks:**\n` +
      `• **Under 35% (Healthy)**: Excellent balance; lenders view you as low risk with strong repayment capacity.\n` +
      `• **36% – 45% (Moderate)**: Manageable, but large new loans may face extra underwriting checks.\n` +
      `• **Over 45% (High Risk)**: High repayment risk; difficult to secure competitive interest rates.\n\n` +
      `Keeping DTI low ensures you have surplus cash flow for savings, investments, and emergencies.`;
  }

  // 4. General Educational: What is an emergency fund?
  if (
    lower.includes('emergency fund') && 
    (lower.includes('what is') || lower.includes('explain') || lower.includes('meaning') || lower.includes('define') || lower.includes('why'))
  ) {
    return `### 🛡️ Emergency Fund Explained\n\n` +
      `An **Emergency Fund** is a dedicated cash reserve set aside strictly for unexpected emergencies — such as medical crises, sudden vehicle repairs, or temporary loss of income.\n\n` +
      `**Key Guidelines:**\n` +
      `• **Target Size**: 3 to 6 months of essential living expenses (rent, utilities, groceries, insurance, mandatory EMIs).\n` +
      `• **Ideal Vehicles**: High-liquidity, capital-safe accounts such as High-Yield Savings Accounts, Auto-Sweep FDs, or Liquid Mutual Funds.\n` +
      `• **Core Purpose**: Prevents you from liquidating long-term investments or taking high-cost loans during financial shocks.`;
  }

  // 5. Specific question: Why is my utilization high?
  if (
    lower.includes('why is my utilization') || 
    lower.includes('utilization high') || 
    lower.includes('why utilization')
  ) {
    const util = profile?.credit_utilization_ratio ?? 28;
    const balance = profile?.credit_card_balance ?? 42000;
    const limit = profile?.total_credit_limit ?? 150000;

    return `### 💳 Why Credit Utilization Is Elevated\n\n` +
      `Credit utilization measures the portion of your total credit card limit currently in use.\n\n` +
      (profile ? `**Your Current Figures:**\n• **Card Balance:** ₹${balance.toLocaleString('en-IN')}\n• **Total Limit:** ₹${limit.toLocaleString('en-IN')}\n• **Current Utilization:** **${util}%** (${util > 30 ? '⚠️ High - Above recommended 30%' : util > 20 ? 'Moderate' : '✅ Optimal'})\n\n` : '') +
      `**Common reasons utilization appears high:**\n` +
      `1. **Statement Generation Timing**: Credit bureaus capture the balance on your monthly billing statement date, not your payment due date.\n` +
      `2. **Low Credit Limits**: Carrying regular expenses on cards with smaller credit limits increases the percentage.\n\n` +
      `**How to Lower It Fast:**\n` +
      `• **Pre-Statement Paydown**: Pay off balances **2 to 3 days before your statement generation date**.\n` +
      `• **Request Limit Increase**: Ask your bank for a credit limit enhancement without increasing spending.`;
  }

  // 6. Specific question: How can I improve my credit score?
  if (
    lower.includes('improve my credit score') || 
    lower.includes('improve credit score') || 
    lower.includes('increase credit score') || 
    lower.includes('raise credit score') || 
    lower.includes('boost credit score') ||
    lower.includes('improve score')
  ) {
    const score = profile?.current_credit_score ?? 742;

    return `### 🚀 Action Plan to Improve Your Credit Score\n\n` +
      (profile ? `Your current credit score is **${score} / 900**.\n\n` : '') +
      `**Top Action Steps:**\n` +
      `1. **Keep Credit Card Utilization Under 20%**: Pay balances before statement generation to report low balances to CIBIL & Experian.\n` +
      `2. **100% On-Time Payments**: Enable automated NACH e-mandates for all loans and card bills.\n` +
      `3. **Protect Credit Age**: Avoid closing your oldest credit card accounts.\n` +
      `4. **Limit Hard Inquiries**: Space out new loan and credit card applications by at least 6 months.\n` +
      `5. **Balanced Credit Mix**: Maintain a healthy balance of secured and unsecured credit lines over time.`;
  }

  // 7. Explicit analysis request: Analyze my financial health / bottlenecks
  if (
    lower.includes('analyze my financial health') || 
    lower.includes('analyze financial health') || 
    lower.includes('analyze my') || 
    lower.includes('bottleneck') || 
    lower.includes('financial audit') ||
    lower.includes('review my finances')
  ) {
    if (!profile) {
      return `Hello ${firstName}! 👋 Welcome to FinHealth AI. To get tailored credit health diagnosis, please complete your financial profile in the dashboard. In the meantime, feel free to ask me general questions about CIBIL scores, DTI ratios, loan EMIs, or tax planning under Section 80C!`;
    }

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

    return `### 📊 Personalized FinHealth Analysis for ${firstName}\n\n` +
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

  // 8. General Financial Topic: Mutual Funds & SIP
  if (lower.includes('mutual fund') || lower.includes('sip') || lower.includes('invest')) {
    return `### 📊 Mutual Funds & Systematic Investment Planning (SIP)\n\n` +
      `Investing through SIPs is a disciplined way to build long-term wealth while averaging market volatility.\n\n` +
      `**Key Principles:**\n` +
      `1. **Broad Index Funds**: Low-cost Nifty 50 or broad-market index funds provide strong core long-term equity exposure.\n` +
      `2. **Tax-Saving ELSS (Section 80C)**: Qualifies for tax deductions up to ₹1.5 Lakh with a 3-year lock-in.\n` +
      `3. **Emergency Fund First**: Maintain a 3-6 month liquid safety reserve before deploying surplus funds into equities.`;
  }

  // 9. General Financial Topic: Taxes & Section 80C
  if (lower.includes('tax') || lower.includes('80c') || lower.includes('deduction')) {
    return `### 🧾 Income Tax Planning Overview\n\n` +
      `• **Section 80C (Up to ₹1,50,000)**: Eligible avenues include PPF, EPF, ELSS mutual funds, life insurance premiums, and tax-saving fixed deposits.\n` +
      `• **Section 80D**: Deductions for health insurance premiums (up to ₹25,000 for self/family, additional for senior citizen parents).\n` +
      `• **Tax Regimes**: The New Tax Regime offers lower slab rates without exemptions, while the Old Regime benefits those with substantial 80C/80D and home loan interest deductions.`;
  }

  // 10. General conversational fallback
  return `Hello ${firstName}! You asked: *"${message}"*\n\n` +
    `I can help you explore credit bureau scores, Debt-to-Income (DTI), utilization optimization, debt payoff strategies, or general financial planning. Feel free to ask a specific question or select any suggested prompt!`;
}

