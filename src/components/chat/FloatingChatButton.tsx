import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Maximize2, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Logo } from '../common/Logo.js';
import type { ChatMessage } from '../../types/index.js';

export const FloatingChatButton: React.FC = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'msg_welcome',
        session_id: 'temp',
        sender: 'assistant',
        message: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I'm **FinHealth AI**, your personal credit & financial health advisor. \n\nI have access to your financial metrics (Credit Score: **${profile?.current_credit_score || 'Not configured'}**, Utilization: **${profile?.credit_utilization_ratio || 0}%**). How can I assist you today?`,
        created_at: new Date().toISOString()
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, user, profile]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isAuthenticated) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || message).trim();
    if (!text || isLoading) return;

    setMessage('');
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      session_id: sessionId || 'temp',
      sender: 'user',
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, sessionId);
      setSessionId(res.sessionId);
      setMessages(prev => [...prev, res.reply]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        session_id: sessionId || 'temp',
        sender: 'assistant',
        message: 'I encountered an error connecting to FinHealth AI. Please check your network or try again shortly.',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How is my overall credit health?',
    'What is a good DTI ratio in India?',
    'How to lower my credit card utilization?',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="floating-ai-chat-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          aria-label="Open FinHealth AI Chat"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-600 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide">Ask FinHealth AI</span>
        </button>
      )}

      {/* Floating Chat Overlay */}
      {isOpen && (
        <div 
          id="floating-ai-chat-window"
          className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-96 h-[540px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <Logo variant="icon" size="xs" />
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-white">
                  FinHealth AI
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/20 font-semibold text-white">
                    Gemini
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-100">Personal Financial Health Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                title="Expand to Full Chat Page"
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages View */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-[10px] font-bold mt-1">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    {m.message}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-[10px] font-bold mt-1">
                  AI
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-bl-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about CIBIL, loans, DTI..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-1.5 flex items-center justify-center gap-1">
              <span>Educational guidance only • Not official CIBIL bureau</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};
