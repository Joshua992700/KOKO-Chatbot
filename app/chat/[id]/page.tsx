'use client';
import ChatPage from '@/components/chat/ChatPage';
import Sidebar from '@/components/home/Sidebar';
import Header from '@/components/home/Header';
import Layout from '@/components/home/Layout';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <ChatPage conversationId={params.id} />
    </ Layout>
  );
}