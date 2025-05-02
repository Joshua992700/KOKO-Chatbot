import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Brain } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert FileList to Array and append to existing files
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (fileToRemove: File) => {
    setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  return (
    <div className="sticky bottom-0 w-full bg-gradient-to-t from-gray-50 dark:from-gray-900 pt-6 pb-8 px-4">
      {/* File Previews */}
      {attachedFiles.length > 0 && (
        <div className="max-w-3xl mx-auto mb-2 px-4 space-y-2">
          {attachedFiles.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 py-2 px-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm"
            >
              <Paperclip className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachedFile(file)}
                className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 px-3 py-2"
      >
        {/* Logo */}
        <div className="p-2 flex items-center justify-center">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Hidden file input - Modified for multiple files */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple // Enable multiple file selection
          accept="image/*,.pdf,.doc,.docx,.txt" // Add accepted file types
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={handleFileClick}
          className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 flex items-center justify-center"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message KOKO..."
          className="flex-1 py-2 px-3 outline-none resize-none max-h-40 bg-transparent text-gray-800 dark:text-gray-200"
          rows={1}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim()}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center justify-center
            ${input.trim() 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default InputBar;