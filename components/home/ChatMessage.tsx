'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import { Brain, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { TypeAnimation } from 'react-type-animation';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showFullContent, setShowFullContent] = useState(false);
  const [isTyping, setIsTyping] = useState(!isUser);

  useEffect(() => {
    if (!isUser) {
      // Show the full content after typing animation
      const timeout = setTimeout(() => {
        setShowFullContent(true);
        setIsTyping(false);
      }, message.content.length * 20); // Adjust typing speed here

      return () => clearTimeout(timeout);
    }
  }, [message.content, isUser]);

  return (
    <div
      className={`
        flex gap-4 w-full px-12 py-2
        ${isUser ? 'pr-80 justify-end' : 'pl-8 justify-start'}
        animate-fadeIn
      `}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 h-8 w-8 
          rounded-full 
          flex items-center justify-center
          ${isUser ? 'order-2' : 'order-1'}
          ${isUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}
        `}
      >
        {isUser ? (
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`
          py-3 px-4
          rounded-2xl
          max-w-[70%]
          ${isUser
            ? 'order-1 bg-blue-600 text-white dark:bg-blue-700'
            : 'order-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
        `}
      >
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <div className="markdown-content prose dark:prose-invert max-w-none prose-sm">
            {isTyping ? (
              <TypeAnimation
                sequence={[message.content]}
                cursor={true}
                speed={65}
                style={{ whiteSpace: 'pre-line' }}
                omitDeletionAnimation={true}
                onComplete={() => {
                  setShowFullContent(true);
                  setIsTyping(false);
                }}
              />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const value = String(children).replace(/\n$/, '');

                    if (inline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return <CodeBlock language={language} value={value} />;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
