import React from 'react';
import { ChatbotHistory } from '../dashboard/ChatbotHistory';
import type { ChatbotHistoryItem } from '../../types/dashboard';

interface AIAssistantPageProps {
  chats: ChatbotHistoryItem[];
  onContinueChat: (chat: ChatbotHistoryItem) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ chats, onContinueChat }) => {
  return (
    <div className="space-y-4">
      <ChatbotHistory chats={chats} onContinueChat={onContinueChat} />
    </div>
  );
};
