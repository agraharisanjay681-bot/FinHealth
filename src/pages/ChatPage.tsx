import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Download, 
  Mic, 
  MicOff, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  TrendingDown,
  Layers,
  ArrowRight,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Logo } from '../components/common/Logo.js';
import { ChatMessageItem } from '../components/chat/ChatMessageItem.js';
import type { ChatMessage, ChatSession, ChatSuggestion } from '../types/index.js';

export const ChatPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
    api.getChatSuggestions()
      .then(res => setSuggestions(res.suggestions || []))
      .catch(() => {});
  }, []);

  const loadSessions = async () => {
    try {
      const res = await api.getChatSessions();
      setSessions(res.sessions || []);
      if (res.sessions && res.sessions.length > 0 && !currentSessionId) {
        // Load the first session
        loadSession(res.sessions[0].id);
      } else if (!currentSessionId) {
        initDefaultGreeting();
      }
    } catch {
      initDefaultGreeting();
    }
  };

  const initDefaultGreeting = () => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const emergencyMonths = profile && profile.monthly_expenses > 0 
      ? (profile.emergency_fund_balance / profile.monthly_expenses).toFixed(1) 
      : '1.7';

    const welcome: ChatMessage = {
      id: 'welcome_1',
      session_id: 'default',
      sender: 'assistant',
      message: `Hello **${firstName}**! 👋 Welcome to your dedicated **FinHealth AI Intelligence Advisor**.\n\n` +
        `How can I help you today? You can ask me questions regarding your credit score, Debt-to-Income (DTI), utilization optimization, loan strategies, or general financial planning.`,
      created_at: new Date().toISOString()
    };
    setMessages([welcome]);
  };

  const loadSession = async (sessId: string) => {
    setIsLoading(true);
    setCurrentSessionId(sessId);
    try {
      const res = await api.getChatSession(sessId);
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        initDefaultGreeting();
      }
    } catch {
      initDefaultGreeting();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const res = await api.createChatSession(`Conversation ${new Date().toLocaleDateString('en-IN')}`);
      setSessions(prev => [res.session, ...prev]);
      setCurrentSessionId(res.session.id);
      setMessages([]);
      initDefaultGreeting();
    } catch {
      setCurrentSessionId(undefined);
      setMessages([]);
      initDefaultGreeting();
    }
  };

  const handleDeleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteChatSession(sessId);
      setSessions(prev => prev.filter(s => s.id !== sessId));
      if (currentSessionId === sessId) {
        handleNewSession();
      }
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice speech-to-text
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
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
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

  const handleSend = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setError(null);

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      session_id: currentSessionId || 'curr',
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, currentSessionId);
      setCurrentSessionId(res.sessionId);
      setMessages(prev => [...prev, res.reply]);
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with FinHealth AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export conversation as Markdown file
  const handleExportChat = () => {
    const chatTitle = sessions.find(s => s.id === currentSessionId)?.title || 'FinHealth_AI_Advisory_Session';
    const header = `# FinHealth AI Advisory Session\nDate: ${new Date().toLocaleString('en-IN')}\nUser: ${user?.name || 'User'}\n\n---\n\n`;
    const content = messages.map(m => `### ${m.sender === 'user' ? '👤 User' : '🤖 FinHealth AI'}\n*${new Date(m.created_at).toLocaleTimeString('en-IN')}*\n\n${m.message}\n\n`).join('---\n\n');
    
    const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${chatTitle.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const emergencyMonths = profile && profile.monthly_expenses > 0 
    ? (profile.emergency_fund_balance / profile.monthly_expenses).toFixed(1) 
    : '1.7';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 h-[calc(100vh-80px)] min-h-[600px] flex flex-col">
      {/* Top Connected Profile Summary Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs mb-4 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
            <Logo variant="icon" size="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                FinHealth AI Advisor
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini 3.6 Flash / GPT-4o
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized credit intelligence and bottleneck diagnosis for {user?.name || 'User'}.
            </p>
          </div>
        </div>

        {/* Live Mini Indicators */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto no-scrollbar py-1">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
            <span className="text-slate-400">CIBIL:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{profile?.current_credit_score || 742}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
            <span className="text-slate-400">Utilization:</span>
            <span className={profile && profile.credit_utilization_ratio > 30 ? 'text-amber-500 font-bold' : 'text-slate-900 dark:text-white font-bold'}>
              {profile?.credit_utilization_ratio || 28}%
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
            <span className="text-slate-400">DTI:</span>
            <span className="text-slate-900 dark:text-white font-bold">{profile?.debt_to_income_ratio || 17}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 hidden md:flex">
            <span className="text-slate-400">Emergency:</span>
            <span className="text-slate-900 dark:text-white font-bold">{emergencyMonths} mo</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Left Sidebar: Chat Sessions & Quick Topics */}
        <div className="hidden lg:flex lg:col-span-1 flex-col space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs overflow-hidden">
          <button
            onClick={handleNewSession}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-1 mb-1">
              Conversations
            </span>
            {sessions.length === 0 ? (
              <div className="text-xs text-slate-400 p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40">
                Active Session
              </div>
            ) : (
              sessions.map((sess) => {
                const isActive = currentSessionId === sess.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => loadSession(sess.id)}
                    className={`group p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-semibold border border-emerald-200 dark:border-emerald-800/60'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      title="Delete conversation"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Categories Navigation */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block px-1 mb-1">
              Diagnostic Topics
            </span>
            <button
              onClick={() => handleSend('Identify my primary financial bottlenecks and give me a clear action plan.')}
              className="w-full text-left p-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Bottleneck Diagnosis</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={() => handleSend('How can I optimize my credit card utilization below 20% before statement dates?')}
              className="w-full text-left p-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5 truncate">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Credit Utilization Fix</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
            <button
              onClick={() => handleSend('Analyze my DTI ratio and EMI schedule to recommend a debt payoff strategy.')}
              className="w-full text-left p-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5 truncate">
                <TrendingDown className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>DTI & Debt Avalanche</span>
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Main Column: Chat Stream */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
          {/* Action Bar */}
          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Interactive Session
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportChat}
                title="Export Conversation to Markdown"
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleNewSession}
                title="Reset conversation"
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            </div>
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-850/60 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Prompts:
            </span>
            {suggestions.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSend(item.prompt)}
                disabled={isLoading}
                className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap shadow-2xs shrink-0 font-medium disabled:opacity-50"
              >
                {item.prompt}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/30">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 rounded-tl-xs shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>FinHealth AI is thinking...</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                  <button
                    onClick={() => handleSend(messages[messages.length - 1]?.message)}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-bold hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Retry Message
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-2">
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
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about your CIBIL score, loan interest, utilization, or debt reduction plan..."
                  disabled={isLoading}
                  className="w-full text-xs sm:text-sm px-4 py-3 pr-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-2xs transition-all"
                />

                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Stop voice recording' : 'Voice Input'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-colors ${
                    isListening
                      ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 animate-pulse'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm disabled:opacity-40 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Personalized for Indian Personal Finance (CIBIL scale 300–900, Section 80C)
              </span>
              <span>Educational guidance only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
