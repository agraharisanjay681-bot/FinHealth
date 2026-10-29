import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  CreditCard, 
  Target,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatMessage } from '../../types/index.js';

interface ChatMessageItemProps {
  message: ChatMessage;
  onNavigate?: () => void;
  compact?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onNavigate, compact = false }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render markdown text with bolding, headers, lists, and callout blocks
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();

      // Heading 3: ### Heading
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace('### ', '');
        return (
          <h4 key={lineIdx} className="font-bold text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{parseInline(title)}</span>
          </h4>
        );
      }

      // Heading 4: #### Step or Subtitle
      if (trimmed.startsWith('#### ')) {
        const title = trimmed.replace('#### ', '');
        return (
          <h5 key={lineIdx} className="font-semibold text-emerald-600 dark:text-emerald-400 mt-2.5 mb-1 text-xs">
            {parseInline(title)}
          </h5>
        );
      }

      // Blockquote: > text
      if (trimmed.startsWith('> ')) {
        const quoteContent = trimmed.replace(/^>\s*/, '');
        return (
          <div key={lineIdx} className="my-2 p-2.5 rounded-xl bg-emerald-500/10 border-l-3 border-emerald-500 text-slate-800 dark:text-slate-200 text-xs">
            {parseInline(quoteContent)}
          </div>
        );
      }

      // Divider: ---
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={lineIdx} className="my-2.5 border-slate-200/80 dark:border-slate-800" />;
      }

      // Bullet points: * or • or -
      if (trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const bulletText = trimmed.replace(/^(\*|•|-)\s+/, '');
        return (
          <div key={lineIdx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span className="flex-1">{parseInline(bulletText)}</span>
          </div>
        );
      }

      // Numbered list: 1. 2. etc
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 my-1.5 pl-1">
            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <span className="flex-1">{parseInline(numMatch[2])}</span>
          </div>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={lineIdx} className="h-1.5" />;
      }

      // Standard paragraph
      return (
        <p key={lineIdx} className="my-1 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    });
  };

  // Parse inline bolding (**text**) and code (`text`)
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Determine if response should offer contextual action buttons
  const showCreditAction = !isUser && (message.message.includes('CIBIL') || message.message.includes('utilization') || message.message.includes('score'));
  const showLoanAction = !isUser && (message.message.includes('EMI') || message.message.includes('loan') || message.message.includes('prepay') || message.message.includes('DTI'));
  const showAdvisorAction = !isUser && (message.message.includes('recommendation') || message.message.includes('action plan') || message.message.includes('bottleneck'));

  return (
    <div className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[86%] sm:max-w-[82%] rounded-2xl p-3 sm:p-4 text-xs sm:text-[13px] leading-relaxed relative ${
          isUser
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-sm'
            : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/70 dark:border-slate-700/70 shadow-2xs'
        }`}
      >
        {/* Main Content */}
        <div className="whitespace-normal break-words font-sans">
          {isUser ? message.message : renderFormattedText(message.message)}
        </div>

        {/* Action Shortcuts for Assistant Messages */}
        {!isUser && (showCreditAction || showLoanAction || showAdvisorAction) && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-1.5">
            {showCreditAction && (
              <Link
                to="/credit"
                onClick={onNavigate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <CreditCard className="w-3 h-3" />
                <span>Credit Breakdown</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </Link>
            )}
            {showLoanAction && (
              <Link
                to="/loans"
                onClick={onNavigate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[11px] font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Loans & EMIs</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </Link>
            )}
            {showAdvisorAction && (
              <Link
                to="/advisor"
                onClick={onNavigate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
              >
                <Target className="w-3 h-3" />
                <span>5-Step AI Action Plan</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        )}

        {/* Message Footer: Timestamp & Quick Actions */}
        <div
          className={`flex items-center justify-between gap-3 mt-2 pt-1.5 border-t text-[10px] ${
            isUser
              ? 'border-emerald-500/40 text-emerald-100'
              : 'border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500'
          }`}
        >
          <span>
            {new Date(message.created_at).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          <div className="flex items-center gap-2">
            {!isUser && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  title="Helpful response"
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    feedback === 'up' ? 'text-emerald-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  title="Not helpful"
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    feedback === 'down' ? 'text-rose-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={handleCopy}
              title="Copy message"
              className={`flex items-center gap-1 transition-opacity ${
                isUser ? 'hover:text-white' : 'hover:text-slate-700 dark:hover:text-slate-200'
              } opacity-0 group-hover:opacity-100`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
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
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
