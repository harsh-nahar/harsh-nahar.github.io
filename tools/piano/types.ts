
export type Waveform = OscillatorType; // 'sine' | 'square' | 'sawtooth' | 'triangle';
export type KeyLabel = 'keyboard' | 'note';

export interface PianoKeyDefinition {
  noteBaseName: string; // C, C#, D etc. (display name for 'note' label type)
  keyboardKey: string; // A, W, S etc. (unique identifier & display name for 'keyboard' label type)
  isBlack: boolean;
  semitoneOffset: number; // Offset from the C of the current visual octave (0 for C, 1 for C#, ..., 12 for next C)
}

export interface SVGIconProps {
  className?: string;
}
