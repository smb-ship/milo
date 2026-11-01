import { useEffect, useRef } from 'react';
import { PARTS } from './foxParts';
import type { MiloState } from './useMilo';

type PartId = keyof typeof PARTS;

const G = ({ id }: { id: PartId }) => (
  <g className={`p-${id}`} dangerouslySetInnerHTML={{ __html: PARTS[id] }} />
);

/**
 * PREVIEW MODE: an SVG + CSS stand-in built from the same artwork layers that
 * go into Rive. It is NOT the Rive animation. It is shown until public/milo.riv exists.
 */
export default function MiloFallback({ state, pokeKey }: { state: MiloState; pokeKey: number }) {
  const ref = useRef<SVGSVGElement>(null);

  // Pupils follow the pointer.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 280);
      el.style.setProperty('--px', `${(dx / d) * 8 * k}px`);
      el.style.setProperty('--py', `${(dy / d) * 7 * k}px`);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      className={`milo s-${state}`}
      data-poke={pokeKey === 0 ? undefined : pokeKey % 2}
      role="img"
      aria-label={`Milo the fox, ${state}`}
    >
      <ellipse className="shadow" cx="200" cy="392" rx="104" ry="8" />
      <g className="rig">
        <g className="poke">
          <G id="tail" />
          <g className="bodyG">
            <G id="body" />
            <G id="chest" />
            <G id="paws" />
          </g>
          <g className="headG">
            <G id="earL" />
            <G id="earR" />
            <G id="head" />
            <G id="muzzle" />
            <G id="cheeks" />
            <G id="nose" />
            <G id="browL" />
            <G id="browR" />
            <g className="eyes">
              <G id="eyeWhites" />
              <G id="pupils" />
            </g>
            <G id="eyesHappy" />
            <G id="mouthSmile" />
            <G id="mouthOpen" />
            <G id="mouthHmm" />
          </g>
        </g>
      </g>
      <G id="listenWaves" />
      <G id="thought" />
    </svg>
  );
}
