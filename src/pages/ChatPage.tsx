import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  User, 
  ShieldAlert, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner.js';
import { Logo } from '../components/common/Logo.js';
import type { ChatMessage } from '../types/index.js';

export const ChatPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message tailored to profile
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'welcome_1',
        session_id: 'initial',
        sender: 'assistant',
        message: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm **FinHealth AI**, your credit wellness and financial advisor. \n\nI have real-time access to your current profile:
• **Credit Score:** ${profile?.current_credit_score || 742} (CIBIL Scale)
• **Credit Utilization:** ${profile?.credit_utilization_ratio || 28}% (₹${(profile?.credit_card_balance || 42000).toLocaleString('en-IN')} / ₹${(profile?.total_credit_limit || 150000).toLocaleString('en-IN')})
• **Debt-to-Income:** ${profile?.debt_to_income_ratio || 17}% (₹${(profile?.monthly_emi || 14500).toLocaleString('en-IN')} Monthly EMI)
• **Active Loans:** ${profile?.active_loans_count || 2}

How can I help you improve your credit health or financial roadmap today?`,
        created_at: new Date().toISOString()
      };
      setMessages([welcome]);
    }
  }, [user, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      session_id: sessionId || 'curr',
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, sessionId);
      setSessionId(res.sessionId);
      setMessages(prev => [...prev, res.reply]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        session_id: sessionId || 'curr',
        sender: 'assistant',
        message: 'I apologize, but I encountered an issue communicating with the AI service. Please verify your connection or try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = async () => {
    setMessages([]);
    setSessionId(undefined);
    const welcome: ChatMessage = {
      id: `welcome_${Date.now()}`,
      session_id: 'fresh',
      sender: 'assistant',
      message: `Fresh conversation started! Ask me anything regarding credit bureaus, EMI prepayments, or tax planning.`,
      created_at: new Date().toISOString()
    };
    setMessages([welcome]);
  };

  const suggestedQuestions = [
    'How can I improve my CIBIL score from 742 to 780?',
    'Should I pay off my personal loan early or invest?',
    'What is a healthy Debt-to-Income ratio for Indian home loans?',
    'How does credit card statement date utilization work?',
    'What are smart tax-saving instruments under Section 80C?',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-90px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Logo variant="icon" size="md" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              FinHealth AI Assistant
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Gemini
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive credit advisor with continuous financial profile context.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" /> Prompts:
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors whitespace-nowrap shadow-2xs shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                  {msg.message}
                </div>

                <div className={`flex items-center justify-between gap-4 mt-2 pt-1 border-t text-[10px] ${isUser ? 'border-emerald-500/50 text-emerald-100' : 'border-slate-200/60 dark:border-slate-700/60 text-slate-400'}`}>
                  <span>{new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>

                  <button
                    onClick={() => handleCopy(msg.id, msg.message)}
                    title="Copy message"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-300" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 rounded-tl-xs flex items-center gap-2">
              <span className="text-xs">FinHealth AI is thinking</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about improving your credit score, paying off loans, lowering utilization..."
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-40 shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center">
          Educational guidance only • FinHealth AI is powered by Gemini and does not provide legal, tax, or official bureau credit repairs.
        </p>
      </div>
    </div>
  );
};
