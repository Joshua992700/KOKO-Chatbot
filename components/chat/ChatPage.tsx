'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/supabase';
import ChatInterface from '../home/ChatInterface';
import { Message } from '@/types';

interface ChatPageProps {
  conversationId: string;
}

const ChatPage = ({ conversationId }: ChatPageProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (error) throw error;

        if (!conversation) {
          router.push('/');
          return;
        }

        setMessages(conversation.messages || []);
      } catch (error) {
        console.error('Error loading conversation:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload: any) => {
          if (payload.new?.messages) {
            setMessages(payload.new.messages);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return <ChatInterface initialMessages={messages} conversationId={conversationId} />;
};

export default ChatPage;