
import { PianoKeyDefinition } from './types';

export const BASE_MIDI_NOTE_C4 = 60; // MIDI note number for C4
export const OCTAVE_SEMITONES = 12;
export const REFERENCE_OCTAVE_NUMBER = 4; // The "middle" C is C4. Octave shift is relative to this.

// Configuration for the keys displayed on the piano (one octave C to C')
export const VISIBLE_KEYS_CONFIG: PianoKeyDefinition[] = [
  { noteBaseName: 'C',  keyboardKey: 'A', isBlack: false, semitoneOffset: 0 },
  { noteBaseName: 'C#', keyboardKey: 'W', isBlack: true,  semitoneOffset: 1 },
  { noteBaseName: 'D',  keyboardKey: 'S', isBlack: false, semitoneOffset: 2 },
  { noteBaseName: 'D#', keyboardKey: 'E', isBlack: true,  semitoneOffset: 3 },
  { noteBaseName: 'E',  keyboardKey: 'D', isBlack: false, semitoneOffset: 4 },
  { noteBaseName: 'F',  keyboardKey: 'F', isBlack: false, semitoneOffset: 5 },
  { noteBaseName: 'F#', keyboardKey: 'T', isBlack: true,  semitoneOffset: 6 },
  { noteBaseName: 'G',  keyboardKey: 'G', isBlack: false, semitoneOffset: 7 },
  { noteBaseName: 'G#', keyboardKey: 'Y', isBlack: true,  semitoneOffset: 8 },
  { noteBaseName: 'A',  keyboardKey: 'H', isBlack: false, semitoneOffset: 9 }, // Note: This 'A' keyboard key plays what is considered 'A' in the scale.
  { noteBaseName: 'A#', keyboardKey: 'U', isBlack: true,  semitoneOffset: 10 },
  { noteBaseName: 'B',  keyboardKey: 'J', isBlack: false, semitoneOffset: 11 },
  { noteBaseName: 'C',  keyboardKey: 'K', isBlack: false, semitoneOffset: 12 }, // This is the C of the next octave
];

// For quick lookup of semitone offset by keyboard key
export const KEY_TO_SEMITONE_OFFSET_MAP: Record<string, number> = VISIBLE_KEYS_CONFIG.reduce((acc, keyConfig) => {
  acc[keyConfig.keyboardKey.toUpperCase()] = keyConfig.semitoneOffset;
  return acc;
}, {} as Record<string, number>);

// Function to calculate frequency from MIDI note number
// A4 (MIDI note 69) is 440 Hz
export const midiToFreq = (midiNote: number): number => {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};

export const MIN_OCTAVE_SHIFT = -2; // Relative to REFERENCE_OCTAVE_NUMBER (e.g., Octave 2 if C4 is base)
export const MAX_OCTAVE_SHIFT = 2;  // Relative to REFERENCE_OCTAVE_NUMBER (e.g., Octave 6)
export const DEFAULT_OCTAVE_SHIFT = 0;
