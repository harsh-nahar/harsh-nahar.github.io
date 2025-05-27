
import React from 'react';
import { PianoKeyDefinition, KeyLabel } from '../types';
import { PianoKey } from './PianoKey';

interface PianoProps {
  keysConfig: PianoKeyDefinition[];
  keyLabelType: KeyLabel;
  onNotePlay: (keyboardKey: string) => void;
  onNoteStop: (keyboardKey: string) => void;
  activeKeys: Set<string>;
}

export const Piano: React.FC<PianoProps> = ({ keysConfig, keyLabelType, onNotePlay, onNoteStop, activeKeys }) => {
  const whiteKeys = keysConfig.filter(key => !key.isBlack);
  const blackKeys = keysConfig.filter(key => key.isBlack);

  // Calculate approximate positions for black keys.
  // This assumes white keys are of equal width.
  // A standard piano has black keys positioned relative to specific white keys.
  // C# is after C, D# after D, F# after F, G# after G, A# after A.
  // These are the 1st, 2nd, 4th, 5th, 6th white keys in a C-octave (0-indexed).
  const blackKeyOffsets: Record<string, number> = { // keyboardKey -> white key index it's after
    'W': 0, // C# after C (key 'A')
    'E': 1, // D# after D (key 'S')
    'T': 3, // F# after F (key 'F')
    'Y': 4, // G# after G (key 'G')
    'U': 5, // A# after A (key 'H')
  };
  
  // Width of a white key "slot" as a percentage of the total white key area
  const whiteKeySlotWidth = 100 / whiteKeys.length;

  return (
    <div className="p-2 sm:p-4 bg-slate-300 dark:bg-slate-600 rounded-lg shadow-inner select-none">
      <div className="relative flex w-full h-48 sm:h-64">
        {/* White Keys */}
        {whiteKeys.map((keyConfig) => (
          <PianoKey
            key={keyConfig.keyboardKey}
            label={keyLabelType === 'keyboard' ? keyConfig.keyboardKey : keyConfig.noteBaseName}
            isBlack={false}
            isActive={activeKeys.has(keyConfig.keyboardKey)}
            onMouseDown={() => onNotePlay(keyConfig.keyboardKey)}
            onMouseUp={() => onNoteStop(keyConfig.keyboardKey)}
            onMouseLeave={() => { /* Optional: stop note if mouse leaves while pressed */
                if (activeKeys.has(keyConfig.keyboardKey)) {
                    onNoteStop(keyConfig.keyboardKey);
                }
            }}
            className="flex-1" // White keys share space equally
          />
        ))}

        {/* Black Keys */}
        {blackKeys.map((keyConfig) => {
          const whiteKeyIndexBefore = blackKeyOffsets[keyConfig.keyboardKey.toUpperCase()];
          if (whiteKeyIndexBefore === undefined) return null; // Should not happen with correct config

          // Position black key towards the right edge of the white key it's "after"
          // e.g., if white key is 12.5% width, C# is at ~12.5% left, minus half its own width
          const leftPosition = `calc(${ (whiteKeyIndexBefore + 1) * whiteKeySlotWidth}% - 0.875rem)`; // 0.875rem is approx half of a 1.75rem black key

          return (
            <PianoKey
              key={keyConfig.keyboardKey}
              label={keyLabelType === 'keyboard' ? keyConfig.keyboardKey : keyConfig.noteBaseName}
              isBlack={true}
              isActive={activeKeys.has(keyConfig.keyboardKey)}
              onMouseDown={() => onNotePlay(keyConfig.keyboardKey)}
              onMouseUp={() => onNoteStop(keyConfig.keyboardKey)}
               onMouseLeave={() => { 
                if (activeKeys.has(keyConfig.keyboardKey)) {
                    onNoteStop(keyConfig.keyboardKey);
                }
            }}
              className="absolute" // PianoKey component handles its own w,h,bg,z-index based on isBlack
              style={{ left: leftPosition }}
            />
          );
        })}
      </div>
    </div>
  );
};
