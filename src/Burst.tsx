import { useMemo, type CSSProperties } from 'react';

const COLORS = ['#F28C38', '#7BD389', '#5FB4FF', '#FF8FB1', '#FFD25F', '#A98BFF'];
const GLYPHS = ['💛', '🧡', '💚', '💙', '✨', '⭐'];
const r = (min: number, max: number) => min + Math.random() * (max - min);

/** One-shot particle burst. Change `n` to fire it again. */
export default function Burst({ n, kind }: { n: number; kind: 'confetti' | 'hearts' }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: kind === 'confetti' ? 60 : 7 }, (_, i) => ({
        id: i,
        glyph: GLYPHS[i % GLYPHS.length],
        style: {
          '--c': COLORS[i % COLORS.length],
          '--dx': `${r(-1, 1) * (kind === 'confetti' ? 300 : 90)}px`,
          '--up': `${-r(kind === 'confetti' ? 120 : 90, kind === 'confetti' ? 300 : 190)}px`,
          '--fall': `${r(160, 300)}px`,
          '--rot': `${r(-720, 720)}deg`,
          animationDelay: `${r(0, kind === 'confetti' ? 0.15 : 0.35)}s`,
          borderRadius: Math.random() > 0.6 ? '50%' : undefined,
        } as CSSProperties,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, kind]
  );
  if (n === 0) return null;
  return (
    <div key={n} className={`burst ${kind}`} aria-hidden>
      {pieces.map((p) => (
        <i key={p.id} style={p.style}>{kind === 'hearts' ? p.glyph : ''}</i>
      ))}
    </div>
  );
}
