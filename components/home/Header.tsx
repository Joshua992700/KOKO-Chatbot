import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Brain, Moon, Sun, Menu } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center space-x-2 translate-x-10">
        <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">KOKO</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-gray-200" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </button>
        
        <button className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>
    </header>
  );
};

export default Header;