import React, { useEffect, useState, useCallback } from 'react';

const ALT_BURSTS = [
  '🖤', '💀', '🕷️', '🔮', '🦇', '⛓️', '🖤', '🥀', '💉', '👓',
  '🖤', '🌙', '🕸️', '💔', '🎸', '🚬', '🎧', '🖤', '😈', '🔪',
  '🏳️‍🌈', '🏳️‍⚧️', '💅', '✨', '🩷', '💜', '✊', '♀️',
  'альтушка', 'нефор', 'emo', 'goth', 'y2k', 'rawr xd',
];

const FLASH_CLASSES = [
  'gaf-flash-pink',
  'gaf-flash-cyan',
  'gaf-flash-lime',
  'gaf-flash-purple',
  'gaf-flash-invert',
];

/**
 * Global FX on EVERY interaction — additive layer, doesn't replace existing chaos.
 */
export default function GlobalActionFX() {
  const [bursts, setBursts] = useState([]);
  const [shakeHard, setShakeHard] = useState(false);
  const [flash, setFlash] = useState('');
  const [ripple, setRipple] = useState(null);
  const [quake, setQuake] = useState(0);

  const spawnBurst = useCallback((x, y, count = 5) => {
    const batch = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${Math.random()}-${i}`,
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 60,
      emoji: ALT_BURSTS[Math.floor(Math.random() * ALT_BURSTS.length)],
      rot: (Math.random() - 0.5) * 60,
    }));
    setBursts((prev) => [...prev.slice(-40), ...batch]);
    batch.forEach((b) => {
      setTimeout(() => setBursts((prev) => prev.filter((p) => p.id !== b.id)), 1000);
    });
  }, []);

  const triggerAll = useCallback(
    (x, y, intensity = 1) => {
      spawnBurst(x, y, 4 + intensity * 3);
      setShakeHard(true);
      setQuake((q) => q + 1);
      setFlash(FLASH_CLASSES[Math.floor(Math.random() * FLASH_CLASSES.length)]);
      setRipple({ id: Date.now(), x, y });
      document.documentElement.classList.add('gaf-root-shake');
      document.body.classList.add('gaf-body-shake', 'gaf-everything-jitters');
      window.setTimeout(() => {
        setShakeHard(false);
        setFlash('');
        document.documentElement.classList.remove('gaf-root-shake');
        document.body.classList.remove('gaf-body-shake');
      }, 420 + intensity * 80);
      window.setTimeout(() => setRipple(null), 700);
    },
    [spawnBurst]
  );

  useEffect(() => {
    const onClick = (e) => triggerAll(e.clientX, e.clientY, 2);
    const onKey = (e) => {
      triggerAll(
        window.innerWidth * (0.2 + Math.random() * 0.6),
        window.innerHeight * (0.25 + Math.random() * 0.5),
        e.key === 'Enter' ? 3 : 1
      );
    };
    const onScroll = () => {
      triggerAll(window.innerWidth / 2, 80, 1);
    };
    const onInput = (e) => {
      if (e.target.matches('input, textarea, select')) {
        const r = e.target.getBoundingClientRect();
        triggerAll(r.left + r.width / 2, r.top, 1);
      }
    };
    const onPointer = (e) => {
      if (Math.random() > 0.92) spawnBurst(e.clientX, e.clientY, 2);
    };

    window.addEventListener('click', onClick, true);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('input', onInput, true);
    window.addEventListener('pointermove', onPointer, { passive: true });

    // perpetual micro-quake
    const forever = setInterval(() => {
      document.body.classList.add('gaf-micro-quake');
      setTimeout(() => document.body.classList.remove('gaf-micro-quake'), 180);
    }, 900);

    return () => {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('input', onInput, true);
      window.removeEventListener('pointermove', onPointer);
      clearInterval(forever);
      document.documentElement.classList.remove('gaf-root-shake');
      document.body.classList.remove('gaf-body-shake', 'gaf-everything-jitters', 'gaf-micro-quake');
    };
  }, [triggerAll, spawnBurst]);

  return (
    <div
      className={`gaf-layer ${shakeHard ? 'gaf-layer-shake' : ''} ${flash}`}
      data-quake={quake}
      aria-hidden="true"
    >
      <div className="gaf-alt-grid" />
      <div className="gaf-vhs" />
      {ripple && (
        <span
          className="gaf-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          key={ripple.id}
        />
      )}
      {bursts.map((b) => (
        <span
          key={b.id}
          className="gaf-burst"
          style={{
            left: b.x,
            top: b.y,
            transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
          }}
        >
          {b.emoji}
        </span>
      ))}
      <div className="gaf-alt-stamp">нефор zone · альтушки only · rawr</div>
    </div>
  );
}
