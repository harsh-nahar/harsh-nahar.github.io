
import React from 'react';
import { SunIcon, MoonIcon } from './icons/ThemeIcons';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Digital Piano</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-slate-500" />}
        </button>
      </div>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Click keys or use your keyboard. Use 'Z'/'X' to change octaves.</p>
    </header>
  );
};
