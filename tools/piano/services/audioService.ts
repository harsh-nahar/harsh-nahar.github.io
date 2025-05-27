
import { Waveform } from '../types';

let audioContextInstance: AudioContext | null = null;
const activeOscillators: Map<string, { oscillator: OscillatorNode, gain: GainNode }> = new Map();

export const getAudioContext = (): AudioContext => {
  if (typeof window !== 'undefined') {
    if (!audioContextInstance) {
      audioContextInstance = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextInstance;
  }
  // Fallback for environments where window is not defined (e.g. SSR, though not relevant for this client-side app)
  // This part should ideally not be reached in a browser environment.
  if (!audioContextInstance) {
     throw new Error("AudioContext could not be initialized.");
  }
  return audioContextInstance;
};

export const playNote = (
  context: AudioContext,
  frequency: number,
  waveform: Waveform,
  volume: number,
  noteId: string // Unique identifier for the note being played (e.g., keyboardKey)
): void => {
  if (context.state === 'suspended') {
    context.resume();
  }
  
  // If a note with the same ID is already playing, stop it first.
  // This handles cases like quickly re-pressing a key.
  if (activeOscillators.has(noteId)) {
    stopNote(context, noteId, true); // true for immediate stop without fade for re-trigger
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  
  // Attack envelope
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.02); // Quick attack (20ms)

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);

  activeOscillators.set(noteId, { oscillator, gain: gainNode });
};

export const stopNote = (
  context: AudioContext,
  noteId: string,
  immediate: boolean = false
): void => {
  const activeNode = activeOscillators.get(noteId);
  if (activeNode) {
    const { oscillator, gain } = activeNode;
    const releaseTime = 0.05; // 50ms release

    if (immediate) {
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0, context.currentTime);
        oscillator.stop(context.currentTime);
    } else {
        // Release envelope
        gain.gain.setValueAtTime(gain.gain.value, context.currentTime); // Hold current gain
        gain.gain.linearRampToValueAtTime(0, context.currentTime + releaseTime);
        oscillator.stop(context.currentTime + releaseTime);
    }
    
    // Clean up after stop
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    activeOscillators.delete(noteId);
  }
};

// Optional: Function to change global volume for all subsequent notes or update existing ones (more complex)
// For now, volume is set per note via playNote.
