import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import ChatMessage from './ChatMessage';
import InputBar from './InputBar';
import { Message } from '@/types';
import { getGeminiResponse } from '@/utils/gemini';
import { WELCOME_MESSAGE } from '@/constants/messages';

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  initialMessages = [WELCOME_MESSAGE],
  conversationId
}) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to generate a title from the first message
  const generateTitle = (content: string): string => {
    // Take first 5-7 words or 50 characters
    const title = content
      .split(' ')
      .slice(0, 6)
      .join(' ')
      .substring(0, 50);
    return `${title}${title.length >= 50 ? '...' : ''}`;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // If no conversationId, create new conversation
      if (!conversationId) {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            title: generateTitle(content),
            user_id: (await supabase.auth.getUser()).data.user?.id,
            workspace: 'default',
            messages: [WELCOME_MESSAGE, userMessage],
          })
          .select()
          .single();

        if (convError) throw convError;
        
        router.push(`/chat/${conversation.id}`);
        conversationId = conversation.id;
      }

      const response = await getGeminiResponse(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation in Supabase with new messages
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          messages: [...messages, userMessage, assistantMessage],
          last_message: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error handling message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full">
      <div className="flex-1 overflow-y-auto space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 animate-pulse pl-4">
            <div className="h-2 w-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-500 dark:bg-purple-400 rounded-full animation-delay-200"></div>
            <div className="h-2 w-2 bg-purple-500 dark:bg-purple-400 rounded-full animation-delay-400"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Bar Container */}
      <div className="flex justify-center w-full px-4 py-4 border-t border-gray-200 dark:border-gray-700 -translate-x-40">
        <div className="w-full max-w-4xl">
          <InputBar onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;