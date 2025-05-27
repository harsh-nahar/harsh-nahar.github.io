
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 text-center">
      <a
        href="https://harshnahar.com"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg shadow-md transition-colors duration-150 ease-in-out text-sm sm:text-base"
      >
        Back to Home
      </a>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
        Digital Piano App &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
};
