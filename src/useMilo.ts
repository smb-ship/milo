import { useCallback, useEffect, useRef, useState } from 'react';

export type MiloState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'celebrating';

const LINES = [
  "Hi! I'm Milo. Let's learn something fun today!",
  'Did you know foxes use their big ears to hear tiny sounds?',
  "You're doing great! Want to try a question together?",
  'Every mistake helps your brain grow stronger!',
];

const CAPTIONS: Record<Exclude<MiloState, 'speaking'>, string> = {
  idle: "Hi! I'm Milo. Tap me or press a button!",
  listening: "I'm listening… tell me anything! 👂",
  thinking: 'Hmm… let me think about that. 💭',
  celebrating: 'Hooray! You did it! 🎉',
};

/**
 * One source of truth for Milo. Exactly one state is active at a time,
 * which is what keeps the Rive booleans (listening / speaking / thinking)
 * mutually exclusive and the transitions predictable.
 */
export function useMilo(voiceOn: boolean) {
  const [state, setState] = useState<MiloState>('idle');
  const [line, setLine] = useState(LINES[0]);
  const [celebrateCount, setCelebrateCount] = useState(0);
  const timer = useRef(0);
  const token = useRef(0);
  const lineIx = useRef(0);

  const reset = useCallback(() => {
    token.current++;
    window.clearTimeout(timer.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => reset, [reset]);

  const idle = useCallback(() => { reset(); setState('idle'); }, [reset]);
  const listen = useCallback(() => { reset(); setState('listening'); }, [reset]);
  const think = useCallback(() => { reset(); setState('thinking'); }, [reset]);

  const celebrate = useCallback(() => {
    reset();
    setState('celebrating');
    setCelebrateCount((c) => c + 1);
    timer.current = window.setTimeout(() => setState('idle'), 3200);
  }, [reset]);

  const speak = useCallback(
    (text?: string, onDone?: () => void) => {
      reset();
      const words = text ?? LINES[lineIx.current++ % LINES.length];
      const mine = token.current;
      let done = false;
      const finish = () => {
        if (done || mine !== token.current) return;
        done = true;
        window.clearTimeout(timer.current);
        setState('idle');
        onDone?.();
      };
      const canTalk = voiceOn && 'speechSynthesis' in window;
      setLine(words);
      setState('speaking');
      // Safety net: some browsers never fire onend.
      timer.current = window.setTimeout(finish, words.length * 85 + (canTalk ? 5500 : 1500));
      if (canTalk) {
        const u = new SpeechSynthesisUtterance(words);
        u.pitch = 1.5;
        u.rate = 0.95;
        u.onend = finish;
        u.onerror = finish;
        window.speechSynthesis.speak(u);
      }
    },
    [reset, voiceOn]
  );

  return {
    state,
    caption: state === 'speaking' ? line : CAPTIONS[state],
    celebrateCount,
    idle, listen, think, speak, celebrate,
    // These map 1:1 to the Rive state machine inputs.
    inputs: {
      listening: state === 'listening',
      speaking: state === 'speaking',
      thinking: state === 'thinking',
    },
  };
}

export type Milo = ReturnType<typeof useMilo>;
