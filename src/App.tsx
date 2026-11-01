import { useEffect, useState } from 'react';
import { useMilo, type MiloState } from './useMilo';
import MiloFallback from './MiloFallback';
import MiloRive, { useRiveFile } from './MiloRive';
import Burst from './Burst';
import Quiz from './Quiz';

const CONTROLS = [
  { id: 'idle', label: 'Idle', icon: '😌' },
  { id: 'listening', label: 'Listen', icon: '👂' },
  { id: 'thinking', label: 'Think', icon: '💭' },
  { id: 'speaking', label: 'Speak', icon: '💬' },
  { id: 'celebrating', label: 'Celebrate', icon: '🎉' },
] as const;

const TITLE_COLORS = ['#F28C38', '#4FB871', '#3BA0F5', '#FF6F9C', '#F5B800', '#9A7BFF'];

export default function App() {
  const [voiceOn, setVoiceOn] = useState(true);
  const [pokes, setPokes] = useState(0);
  const [missing, setMissing] = useState<string[]>([]);
  const milo = useMilo(voiceOn);
  const mode = useRiveFile();

  const actions: Record<MiloState, () => void> = {
    idle: milo.idle,
    listening: milo.listen,
    thinking: milo.think,
    speaking: () => milo.speak(),
    celebrating: milo.celebrate,
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target instanceof HTMLInputElement) return;
      const i = Number(e.key) - 1;
      if (i >= 0 && i < CONTROLS.length) actions[CONTROLS[i].id]();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const letters = 'Meet Milo'.split('');
  let c = 0;

  return (
    <div className="page">
      <div className="blobs" aria-hidden>
        <i /><i /><i /><i /><i />
      </div>

      <header>
        <h1>
          {letters.map((ch, i) => (
            <span key={i} className="ch" style={{ color: ch === ' ' ? undefined : TITLE_COLORS[c++ % TITLE_COLORS.length], animationDelay: `${i * 0.07}s` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h1>
        <p>Your friendly learning companion</p>
      </header>

      <main className="grid">
        <section className="stage" data-state={milo.state}>
          <div className="chip"><b className="dot" />{CONTROLS.find((x) => x.id === milo.state)!.label}</div>
          <div className={`mode ${mode}`}>
            {mode === 'rive' ? '✅ Rive runtime · MiloController' : mode === 'preview' ? '🧪 Preview mode · SVG/CSS stand-in' : 'Loading…'}
          </div>
          <div className="halo" />
          <button className="character" onClick={() => setPokes((p) => p + 1)} aria-label="Poke Milo">
            {mode === 'rive' && <MiloRive state={milo.state} celebrateCount={milo.celebrateCount} onMissing={setMissing} />}
            {mode === 'preview' && <MiloFallback state={milo.state} pokeKey={pokes} />}
          </button>
          <div className="bubble" key={milo.caption} aria-live="polite">{milo.caption}</div>
          <Burst n={milo.celebrateCount} kind="confetti" />
          <Burst n={pokes} kind="hearts" />
        </section>

        <aside className="side">
          <section className="card">
            <h2>Make Milo react</h2>
            <div className="controls">
              {CONTROLS.map((b, i) => (
                <button key={b.id} className={`btn ${b.id}`} aria-pressed={milo.state === b.id} onClick={actions[b.id]}>
                  <span className="ico">{b.icon}</span>
                  {b.label}
                  <kbd>{i + 1}</kbd>
                </button>
              ))}
            </div>
            <label className="voice">
              <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} />
              <span>🔊 Milo speaks out loud</span>
            </label>
          </section>

          <Quiz milo={milo} />

          <section className="card inputs">
            <h2>MiloController inputs</h2>
            <div className="pills">
              {(['listening', 'speaking', 'thinking'] as const).map((k) => (
                <span key={k} className={`pill ${milo.inputs[k] ? 'on' : ''}`}>{k}<b>{String(milo.inputs[k])}</b></span>
              ))}
              <span className={`pill trig ${milo.state === 'celebrating' ? 'on' : ''}`}>celebrate<b>fired ×{milo.celebrateCount}</b></span>
            </div>
            {mode === 'preview' && (
              <p className="note">Showing a preview built from the same artwork. Export <code>milo.riv</code> from Rive and drop it in <code>public/</code> to switch to the real animation.</p>
            )}
            {mode === 'rive' && missing.length > 0 && (
              <p className="note warn">milo.riv loaded, but these inputs weren't found: <b>{missing.join(', ')}</b>. Names are case-sensitive.</p>
            )}
          </section>
        </aside>
      </main>

      <footer>Made with React, Vite, TypeScript &amp; Rive · Tip: tap Milo, move your mouse, press keys 1–5</footer>
    </div>
  );
}
