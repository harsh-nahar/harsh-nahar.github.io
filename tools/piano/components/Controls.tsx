
import React from 'react';
import { Waveform, KeyLabel } from '../types';
import { SineIcon, SquareIcon, SawtoothIcon, TriangleIcon } from './icons/WaveformIcons';
import { REFERENCE_OCTAVE_NUMBER } from '../constants';


interface ControlButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, isActive, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm rounded-md font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50
      ${isActive
        ? 'bg-sky-500 text-white shadow-md hover:bg-sky-600'
        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
      } ${className}`}
  >
    {children}
  </button>
);


interface ControlsProps {
  waveform: Waveform;
  setWaveform: (waveform: Waveform) => void;
  volume: number;
  setVolume: (volume: number) => void;
  octave: number; // This is octaveShift
  setOctave: (octave: number) => void;
  keyLabelType: KeyLabel;
  setKeyLabelType: (type: KeyLabel) => void;
  minOctave: number;
  maxOctave: number;
}

export const Controls: React.FC<ControlsProps> = ({
  waveform,
  setWaveform,
  volume,
  setVolume,
  octave,
  setOctave,
  keyLabelType,
  setKeyLabelType,
  minOctave,
  maxOctave
}) => {
  const waveformOptions: { value: Waveform; label: string; icon: React.ReactNode }[] = [
    { value: 'sine', label: 'Sine', icon: <SineIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { value: 'square', label: 'Square', icon: <SquareIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { value: 'sawtooth', label: 'Sawtooth', icon: <SawtoothIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { value: 'triangle', label: 'Triangle', icon: <TriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
  ];

  const displayedOctave = REFERENCE_OCTAVE_NUMBER + octave;

  return (
    <div className="space-y-5 sm:space-y-6 mb-6 sm:mb-8">
      {/* Waveform Controls */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">Waveform</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {waveformOptions.map(opt => (
            <ControlButton
              key={opt.value}
              onClick={() => setWaveform(opt.value)}
              isActive={waveform === opt.value}
              className="flex items-center justify-center"
            >
              {opt.icon}
              {opt.label}
            </ControlButton>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div>
        <label htmlFor="volume" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          id="volume"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
      </div>

      {/* Octave Control */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
          Octave Shift: {octave} (Current Base: C{displayedOctave})
        </label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <ControlButton onClick={() => setOctave(Math.max(minOctave, octave - 1))} isActive={false}>Octave -</ControlButton>
          <ControlButton onClick={() => setOctave(Math.min(maxOctave, octave + 1))} isActive={false}>Octave +</ControlButton>
        </div>
      </div>

      {/* Key Labels Control */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">Key Labels</label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <ControlButton onClick={() => setKeyLabelType('keyboard')} isActive={keyLabelType === 'keyboard'}>Keyboard</ControlButton>
          <ControlButton onClick={() => setKeyLabelType('note')} isActive={keyLabelType === 'note'}>Note</ControlButton>
        </div>
      </div>
    </div>
  );
};
