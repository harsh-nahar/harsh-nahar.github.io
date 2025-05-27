
import React from 'react';

interface PianoKeyProps {
  label: string;
  isBlack: boolean;
  isActive: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PianoKey: React.FC<PianoKeyProps> = ({
  label,
  isBlack,
  isActive,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  className = "",
  style = {}
}) => {
  const baseClasses = "border flex items-end justify-center p-1 sm:p-2 cursor-pointer transition-all duration-50 ease-in-out select-none";
  
  let keyClasses = "";
  if (isBlack) {
    keyClasses = `
      ${baseClasses}
      w-7 sm:w-8 h-32 sm:h-40 
      bg-slate-800 dark:bg-black hover:bg-slate-700 dark:hover:bg-slate-900
      text-white text-xs sm:text-sm font-medium
      border-slate-900 dark:border-slate-700
      z-10 rounded-b-md shadow-md
      ${isActive ? 'bg-sky-700 dark:bg-sky-600 ring-2 ring-sky-400 ring-offset-1 ring-offset-black' : ''}
      ${className}
    `;
  } else {
    keyClasses = `
      ${baseClasses}
      h-full % white keys take full height of container
      bg-white dark:bg-slate-300 hover:bg-slate-100 dark:hover:bg-slate-200
      text-slate-700 dark:text-slate-800 text-sm sm:text-base font-semibold
      border-slate-400 dark:border-slate-500 rounded-md shadow
      ${isActive ? 'bg-sky-300 dark:bg-sky-400 ring-2 ring-sky-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-300' : ''}
      ${className}
    `;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(); }}
      onMouseUp={(e) => { e.preventDefault(); onMouseUp(); }}
      onMouseLeave={onMouseLeave}
      onTouchStart={(e) => { e.preventDefault(); onMouseDown(); }} // Basic touch support
      onTouchEnd={(e) => { e.preventDefault(); onMouseUp(); }}     // Basic touch support
      className={keyClasses}
      style={style}
    >
      {label}
    </div>
  );
};
