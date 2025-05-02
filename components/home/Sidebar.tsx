'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, LogOut, MoreVertical, Pencil, Share, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabase';
import Image from 'next/image';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const Sidebar = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [currentWorkspace, setCurrentWorkspace] = useState('default');
  const [workspaces, setWorkspaces] = useState<string[]>(['default']);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser({
          ...session.user,
          ...profile
        });

        // Fetch conversations
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (convError) {
          console.error('Error fetching conversations:', convError);
        } else {
          setConversations(conversations || []);
        }
      }
      setLoading(false);
    };

    getSession();

    // Subscribe to conversations changes
    const conversationsSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setConversations(prev => [payload.new as Conversation, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setConversations(prev => prev.filter(conv => conv.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      conversationsSubscription.unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Fetch conversations for current workspace
          const { data: conversations, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('workspace', currentWorkspace)
            .order('last_message', { ascending: false });

          if (error) throw error;
          setConversations(conversations || []);

          // Fetch unique workspaces using distinct on
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('conversations')
            .select('workspace')
            .eq('user_id', session.user.id);

          if (workspaceError) throw workspaceError;

          // Extract unique workspaces and ensure 'default' is always included
          const uniqueWorkspaces = new Set(['default']);
          workspaceData?.forEach(item => uniqueWorkspaces.add(item.workspace));
          setWorkspaces(Array.from(uniqueWorkspaces));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    getConversations();
  }, [currentWorkspace]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handleRenameConversation = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === id ? { ...conv, title } : conv
        )
      );
      setEditingTitle(null);
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      router.push('/');
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(url);
    // You might want to add a toast notification here
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 p-4">
      {/* Workspace Selector */}
      <select 
        value={currentWorkspace}
        onChange={(e) => setCurrentWorkspace(e.target.value)}
        className="mb-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
      >
        {workspaces.map(workspace => (
          <option key={workspace} value={workspace}>
            {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
          </option>
        ))}
      </select>

      <Link
        href="/"
        className="flex items-center space-x-2 p-3 mb-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span>New Chat</span>
      </Link>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div 
                className="flex items-center space-x-3"
                onClick={() => router.push(`/chat/${conv.id}`)}
              >
                <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div className="flex-1 min-w-0">
                  {editingTitle === conv.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleRenameConversation(conv.id, newTitle);
                        }
                        if (e.key === 'Escape') {
                          setEditingTitle(null);
                        }
                      }}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {conv.title}
                    </h3>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === conv.id ? null : conv.id);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>

                {activeDropdown === conv.id && (
                  <div 
                    className="absolute right-0 mt-1 w-48 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setNewTitle(conv.title);
                        setEditingTitle(conv.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => {
                        handleShare(conv.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                    >
                      <Share className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteConversation(conv.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No conversations yet
          </div>
        )}
      </div>

      {user ? (
        <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name || user.email}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {(user.user_metadata?.full_name || user.email)[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <Link
            href="/signin"
            className="block w-full p-2 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-gray-200"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="block w-full p-2 text-center rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
