import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Maximize2, 
  RotateCcw, 
  Mic, 
  MicOff, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Percent, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  Zap,
  ArrowDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Logo } from '../common/Logo.js';
import { ChatMessageItem } from './ChatMessageItem.js';
import type { ChatMessage, ChatSuggestion } from '../../types/index.js';

export const FloatingChatButton: React.FC = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [showContextDetails, setShowContextDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Global keyboard shortcut Ctrl+/ or Cmd+/ to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch contextual suggestions
  useEffect(() => {
    if (isAuthenticated) {
      api.getChatSuggestions()
        .then(res => setSuggestions(res.suggestions || []))
        .catch(() => {});
    }
  }, [isAuthenticated, profile]);

  // Initialize with personalized greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const firstName = user?.name ? user.name.split(' ')[0] : 'there';
      const welcome: ChatMessage = {
        id: 'msg_welcome',
        session_id: 'initial',
        sender: 'assistant',
        message: `Hello **${firstName}**! 👋 I'm **FinHealth AI**, your personal credit wellness and financial advisor.\n\n` +
          `How can I help you today? You can ask me questions about your credit score, Debt-to-Income (DTI), credit utilization, loan strategies, or general financial planning.`,
        created_at: new Date().toISOString()
      };
      setMessages([welcome]);
    }
  }, [isOpen, user, profile]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  // Handle scroll detection for "scroll to bottom" button
  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
  };

  // Voice speech-to-text setup
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  if (!isAuthenticated) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || message).trim();
    if (!text || isLoading) return;

    setMessage('');
    setError(null);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      session_id: sessionId || 'curr',
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
      setError(err?.message || "Failed to communicate with FinHealth AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    setSessionId(undefined);
    setError(null);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        session_id: 'fresh',
        sender: 'assistant',
        message: `Fresh conversation started! Ask me anything regarding credit bureaus, utilization optimization, loan prepayments, or financial bottlenecks.`,
        created_at: new Date().toISOString()
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            id="floating-ai-chat-btn"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-600/30 hover:scale-[1.03] active:scale-95 transition-all duration-200 border border-emerald-400/30"
            aria-label="Open FinHealth AI Advisor"
          >
            {/* Glowing beacon */}
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 text-white animate-bounce-subtle" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-emerald-700 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-emerald-700" />
            </div>

            <div className="text-left hidden xs:block sm:block">
              <span className="block text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                FinHealth AI
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 font-mono font-medium text-emerald-100">
                  Advisor
                </span>
              </span>
              <span className="block text-[10px] text-emerald-100 font-medium">Ask credit & money questions</span>
            </div>

            {/* Keyboard shortcut hint */}
            <span className="hidden md:inline-flex items-center text-[10px] bg-emerald-800/60 px-1.5 py-0.5 rounded text-emerald-200 font-mono border border-emerald-700/50">
              Ctrl + /
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div 
          id="floating-ai-chat-window"
          className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] h-[85vh] sm:h-[620px] max-h-[700px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
                <Logo variant="icon" size="xs" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-tight">FinHealth AI</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 font-semibold border border-emerald-300/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Live Context
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100">Credit Wellness & Bottleneck Diagnostics</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart Conversation"
                className="p-1.5 rounded-lg hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
                aria-label="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                title="Open in Full Page"
                className="p-1.5 rounded-lg hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
                aria-label="Full Page View"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-emerald-100 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connected Live Context Header Strip */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 px-3.5 py-2 shrink-0">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300 overflow-x-auto no-scrollbar">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-slate-400">Score:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{profile?.current_credit_score || 742}</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-slate-400">Util:</span>
                  <strong className={profile && profile.credit_utilization_ratio > 30 ? 'text-amber-500 font-bold' : 'text-slate-900 dark:text-white font-bold'}>
                    {profile?.credit_utilization_ratio || 28}%
                  </strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-slate-400">DTI:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{profile?.debt_to_income_ratio || 17}%</strong>
                </span>
              </div>

              <button
                onClick={() => setShowContextDetails(!showContextDetails)}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0 pl-2 font-semibold"
              >
                <span>{showContextDetails ? 'Hide' : 'Context'}</span>
                {showContextDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Expandable Context Accordion */}
            {showContextDetails && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[10px] animate-in fade-in duration-150">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block">Monthly Income</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(profile?.monthly_income || 75000).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block">Monthly Total EMI</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(profile?.monthly_emi || 14500).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block">Emergency Reserve</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(profile?.emergency_fund_balance || 65000).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block">FinHealth Score</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{profile?.financial_health_score || 78}/100</span>
                </div>
              </div>
            )}
          </div>

          {/* Messages Stream Container */}
          <div 
            ref={chatScrollRef}
            onScroll={handleScroll}
            className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 text-xs relative bg-slate-50/50 dark:bg-slate-950/40"
          >
            {messages.map((m) => (
              <ChatMessageItem 
                key={m.id} 
                message={m} 
                onNavigate={() => setIsOpen(false)}
                compact={true}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 rounded-tl-xs shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      FinHealth AI is thinking...
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Card */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  <button
                    onClick={() => handleSend(messages[messages.length - 1]?.message)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-bold hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Prompt
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Floating Scroll to Bottom Indicator */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-28 right-6 p-2 rounded-full bg-slate-900/80 text-white backdrop-blur shadow-md hover:bg-slate-900 transition-colors z-10"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Contextual Suggested Questions */}
          <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-850/80 border-t border-slate-200/70 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar pb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-500" /> Prompts:
              </span>
              {suggestions.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 shadow-2xs font-medium disabled:opacity-50"
                >
                  {item.category}: {item.prompt.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about bottlenecks, CIBIL, DTI, EMIs..."
                  disabled={isLoading}
                  className="w-full text-xs px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />

                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Stop voice recording' : 'Voice Input'}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    isListening
                      ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 animate-pulse'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 transition-all shadow-sm shrink-0"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-2 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Personalized with your FinHealth metrics • Educational advice</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};
