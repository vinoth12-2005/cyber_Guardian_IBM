import React from 'react';
import type { ChatbotHistoryItem } from '../../types/dashboard';
import { Bot, MessageSquare, ArrowRight, Clock } from 'lucide-react';

interface ChatbotHistoryProps {
  chats: ChatbotHistoryItem[];
  onContinueChat: (chat: ChatbotHistoryItem) => void;
}

export const ChatbotHistory: React.FC<ChatbotHistoryProps> = ({ chats, onContinueChat }) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Bot className="w-4 h-4" style={{ color: 'var(--accent-info)' }} strokeWidth={2} />
            AI Assistant History
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Previous security consultation sessions
          </p>
        </div>
        <span
          className="badge"
          style={{ background: 'var(--accent-primary-faint)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary-border)' }}
        >
          {chats.length} Sessions
        </span>
      </div>

      {chats.length === 0 ? (
        <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          No previous chat consultations recorded. Start a new conversation above with FlotBot.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chats.map((chat) => (
          <div
            key={chat.id}
            className="p-4 rounded-xl flex flex-col justify-between transition-all duration-200"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-medium)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'; }}
          >
            <div>
              {/* Meta row */}
              <div className="flex items-center justify-between mb-3 text-[11px]">
                <span
                  className="badge"
                  style={{ background: 'var(--accent-info-faint)', color: 'var(--accent-info)', borderColor: 'var(--accent-info-border)' }}
                >
                  {chat.category}
                </span>
                <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" />
                  {chat.date}
                </span>
              </div>

              {/* Question */}
              <h4 className="text-[12px] font-semibold mb-2 line-clamp-2 flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.75} />
                &ldquo;{chat.question}&rdquo;
              </h4>

              {/* AI summary */}
              <div
                className="p-2.5 rounded-xl text-[11px] mb-4"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="line-clamp-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {chat.aiSummary}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-3 text-[11px]"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                {chat.messageCount} exchanges
              </span>
              <button
                onClick={() => onContinueChat(chat)}
                className="flex items-center gap-1 font-semibold transition-colors"
                style={{ color: 'var(--accent-primary)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.75')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
