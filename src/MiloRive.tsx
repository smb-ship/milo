import { useEffect, useRef, useState } from 'react';
import { Alignment, Fit, Layout, useRive, useStateMachineInput } from '@rive-app/react-canvas';
import type { MiloState } from './useMilo';

const SM = 'MiloController';
const FILE = `${import.meta.env.BASE_URL}milo.riv`;

/** Looks for public/milo.riv and checks it really is a Rive file ("RIVE" header). */
export function useRiveFile(): 'checking' | 'rive' | 'preview' {
  const [mode, setMode] = useState<'checking' | 'rive' | 'preview'>('checking');
  useEffect(() => {
    let alive = true;
    fetch(FILE)
      .then(async (r) => {
        if (!r.ok) throw new Error('missing');
        const head = new Uint8Array((await r.arrayBuffer()).slice(0, 4));
        if (String.fromCharCode(...head) !== 'RIVE') throw new Error('not a .riv file');
        if (alive) setMode('rive');
      })
      .catch(() => alive && setMode('preview'));
    return () => { alive = false; };
  }, []);
  return mode;
}

type Props = {
  state: MiloState;
  celebrateCount: number;
  onMissing: (names: string[]) => void;
};

/** The real Rive character, driven by the MiloController state machine. */
export default function MiloRive({ state, celebrateCount, onMissing }: Props) {
  const { rive, RiveComponent } = useRive({
    src: FILE,
    stateMachines: SM,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  const listening = useStateMachineInput(rive, SM, 'listening');
  const speaking = useStateMachineInput(rive, SM, 'speaking');
  const thinking = useStateMachineInput(rive, SM, 'thinking');
  const celebrate = useStateMachineInput(rive, SM, 'celebrate');
  const lastFired = useRef(0);

  useEffect(() => {
    if (!rive) return;
    const missing = [
      ['listening', listening], ['speaking', speaking],
      ['thinking', thinking], ['celebrate', celebrate],
    ].filter(([, input]) => !input).map(([name]) => name as string);
    onMissing(missing);
  }, [rive, listening, speaking, thinking, celebrate, onMissing]);

  useEffect(() => { if (listening) listening.value = state === 'listening'; }, [listening, state]);
  useEffect(() => { if (speaking) speaking.value = state === 'speaking'; }, [speaking, state]);
  useEffect(() => { if (thinking) thinking.value = state === 'thinking'; }, [thinking, state]);
  useEffect(() => {
    if (celebrate && celebrateCount > lastFired.current) {
      lastFired.current = celebrateCount;
      celebrate.fire();
    }
  }, [celebrate, celebrateCount]);

  return <RiveComponent className="rive-canvas" />;
}
