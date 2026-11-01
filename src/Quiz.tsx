import { useState } from 'react';
import type { Milo } from './useMilo';

const QS = [
  { q: 'What is 3 + 4?', o: ['6', '7', '8'], a: 1 },
  { q: 'Which animal says "moo"?', o: ['Cow', 'Cat', 'Duck'], a: 0 },
  { q: 'What color do you get when you mix blue and yellow?', o: ['Green', 'Purple', 'Orange'], a: 0 },
  { q: 'How many legs does a spider have?', o: ['6', '8', '10'], a: 1 },
  { q: 'What is the opposite of hot?', o: ['Warm', 'Cold', 'Spicy'], a: 1 },
  { q: 'Which planet do we live on?', o: ['Mars', 'Earth', 'Venus'], a: 1 },
];

type Phase = 'idle' | 'asking' | 'answer' | 'right' | 'wrong';

/** A tiny learning moment that exercises every Milo state in a natural order. */
export default function Quiz({ milo }: { milo: Milo }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [stars, setStars] = useState(0);
  const q = QS[i];

  const ask = (idx: number) => {
    setI(idx);
    setPhase('asking');
    milo.speak(QS[idx].q, () => { setPhase('answer'); milo.listen(); });
  };

  const pick = (n: number) => {
    if (n === q.a) {
      setStars((s) => s + 1);
      setPhase('right');
      milo.celebrate();
    } else {
      setPhase('wrong');
      milo.think();
      window.setTimeout(() => { setPhase('answer'); milo.listen(); }, 1800);
    }
  };

  return (
    <section className="card quiz">
      <h2>Learning time <span className="stars" aria-label={`${stars} stars`}>{'⭐'.repeat(Math.min(stars, 8)) || '☆'}</span></h2>
      {phase === 'idle' ? (
        <button className="cta" onClick={() => ask(0)}>Ask me a question! 🦊</button>
      ) : (
        <>
          <p className="q">{q.q}</p>
          {(phase === 'answer' || phase === 'wrong') && (
            <div className="opts">
              {q.o.map((t, n) => (
                <button key={t} disabled={phase === 'wrong'} onClick={() => pick(n)}>{t}</button>
              ))}
            </div>
          )}
          {phase === 'asking' && <p className="hint">Milo is asking…</p>}
          {phase === 'wrong' && <p className="hint">Hmm, not quite. Let's try again! 💪</p>}
          {phase === 'right' && (
            <button className="cta" onClick={() => ask((i + 1) % QS.length)}>Yes! Next question ➜</button>
          )}
        </>
      )}
    </section>
  );
}
