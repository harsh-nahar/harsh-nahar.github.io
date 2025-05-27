
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { Piano } from './components/Piano';
import { Footer } from './components/Footer';
import { Waveform, KeyLabel } from './types';
import { VISIBLE_KEYS_CONFIG, KEY_TO_SEMITONE_OFFSET_MAP, BASE_MIDI_NOTE_C4, OCTAVE_SEMITONES, midiToFreq, REFERENCE_OCTAVE_NUMBER, DEFAULT_OCTAVE_SHIFT, MIN_OCTAVE_SHIFT, MAX_OCTAVE_SHIFT } from './constants';
import { getAudioContext, playNote as audioPlayNote, stopNote as audioStopNote } from './services/audioService';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode) return savedMode === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [waveform, setWaveform] = useState<Waveform>('sine');
  const [volume, setVolume] = useState<number>(0.25); // 0 to 1
  const [octaveShift, setOctaveShift] = useState<number>(DEFAULT_OCTAVE_SHIFT); // -2, -1, 0, 1, 2
  const [keyLabelType, setKeyLabelType] = useState<KeyLabel>('keyboard');
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = getAudioContext();
    }
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
  }, [darkMode]);

  const playNote = useCallback((keyboardKey: string) => {
    if (!audioContextRef.current) return;

    const semitoneOffset = KEY_TO_SEMITONE_OFFSET_MAP[keyboardKey.toUpperCase()];
    if (semitoneOffset === undefined) return;

    const currentOctaveBaseMidi = BASE_MIDI_NOTE_C4 + (octaveShift * OCTAVE_SEMITONES);
    const midiNote = currentOctaveBaseMidi + semitoneOffset;
    const frequency = midiToFreq(midiNote);

    audioPlayNote(audioContextRef.current, frequency, waveform, volume, keyboardKey);
    setActiveKeys(prev => new Set(prev).add(keyboardKey));
  }, [octaveShift, waveform, volume]);

  const stopNote = useCallback((keyboardKey: string) => {
    if (!audioContextRef.current) return;
    audioStopNote(audioContextRef.current, keyboardKey);
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(keyboardKey);
      return newSet;
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toUpperCase();
    if (KEY_TO_SEMITONE_OFFSET_MAP[key] !== undefined && !activeKeys.has(key)) {
      playNote(key);
    }
    if (key === 'Z') { // Octave down
        setOctaveShift(prev => Math.max(MIN_OCTAVE_SHIFT, prev - 1));
    }
    if (key === 'X') { // Octave up
        setOctaveShift(prev => Math.min(MAX_OCTAVE_SHIFT, prev + 1));
    }
  }, [playNote, activeKeys]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toUpperCase();
    if (KEY_TO_SEMITONE_OFFSET_MAP[key] !== undefined) {
      stopNote(key);
    }
  }, [stopNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const currentDisplayedOctave = REFERENCE_OCTAVE_NUMBER + octaveShift;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-slate-800 dark:text-slate-200">
      <main className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(prev => !prev)} />
        <Controls
          waveform={waveform}
          setWaveform={setWaveform}
          volume={volume}
          setVolume={setVolume}
          octave={octaveShift} // Displaying octave shift value
          setOctave={(newOctave) => setOctaveShift(newOctave)}
          keyLabelType={keyLabelType}
          setKeyLabelType={setKeyLabelType}
          minOctave={MIN_OCTAVE_SHIFT}
          maxOctave={MAX_OCTAVE_SHIFT}
        />
        <Piano
          keysConfig={VISIBLE_KEYS_CONFIG}
          keyLabelType={keyLabelType}
          onNotePlay={playNote}
          onNoteStop={stopNote}
          activeKeys={activeKeys}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
