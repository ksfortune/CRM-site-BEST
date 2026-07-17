import { useCallback, useEffect, useState } from 'react';

const FILTERS = [
  'hue-rotate(40deg) saturate(1.6)',
  'hue-rotate(120deg) saturate(1.8) contrast(1.1)',
  'hue-rotate(200deg) saturate(1.5)',
  'hue-rotate(280deg) saturate(1.7) brightness(1.05)',
  'hue-rotate(320deg) saturate(1.9)',
  'saturate(2) contrast(1.15) hue-rotate(60deg)',
  'hue-rotate(90deg) sepia(0.2) saturate(1.8)',
];

const BURSTS = [
  '🏳️‍🌈', '🏳️‍⚧️', '💜', '🩷', '💙', '✨', '💅', '✊', '♀️', '💖',
  '🖤', '🦇', '🕷️', '💀', '🥀', '🎸', '🔮', '⛓️',
];

/**
 * Pride filters on clicks + rainbow typing vibes for admin chaos.
 */
export function usePrideFx() {
  const [filterIdx, setFilterIdx] = useState(0);
  const [bursts, setBursts] = useState([]);
  const [typingPride, setTypingPride] = useState(false);

  const boom = useCallback((e) => {
    setFilterIdx((i) => (i + 1) % FILTERS.length);
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const batch = Array.from({ length: 6 }, (_, i) => ({
      id: `${Date.now()}-${Math.random()}-${i}`,
      x: x + (Math.random() - 0.5) * 70,
      y: y + (Math.random() - 0.5) * 50,
      emoji: BURSTS[Math.floor(Math.random() * BURSTS.length)],
    }));
    setBursts((prev) => [...prev.slice(-24), ...batch]);
    batch.forEach((b) => {
      setTimeout(() => setBursts((prev) => prev.filter((p) => p.id !== b.id)), 900);
    });
    document.body.classList.add('gaf-body-shake', 'admin-boom-shake');
    setTimeout(() => document.body.classList.remove('gaf-body-shake', 'admin-boom-shake'), 450);
  }, []);

  const onType = useCallback(() => {
    setTypingPride(true);
  }, []);

  useEffect(() => {
    if (!typingPride) return undefined;
    const t = setTimeout(() => setTypingPride(false), 700);
    return () => clearTimeout(t);
  }, [typingPride]);

  return {
    filterStyle: { filter: FILTERS[filterIdx], transition: 'filter 0.35s ease' },
    filterClass: `pride-filter-${filterIdx}`,
    bursts,
    boom,
    onType,
    typingPride,
  };
}

export function PrideBurstLayer({ bursts }) {
  return (
    <div className="pride-burst-layer" aria-hidden="true">
      {bursts.map((b) => (
        <span key={b.id} className="pride-burst" style={{ left: b.x, top: b.y }}>
          {b.emoji}
        </span>
      ))}
    </div>
  );
}
