import React, { useEffect, useState } from 'react';

const FLOATERS = [
  '🏳️‍🌈', '🏳️‍⚧️', '💜', '🩷', '💙', '🤍', '✨', '💅', '💖', '🫶',
  '✊', '🖤', '♀️', '🌸', '🦄', '💫', '🔥', '🪩', '👩', '🖤',
  // альтушки / неформал (additive)
  '🦇', '🕷️', '🔮', '🥀', '⛓️', '🎸', '💀', '🌙', '🕸️', '💉',
  '😈', '🖤', '👓', '🎧', '💔', '🔪', '🦴', '🌑', '⚡', '☠️',
];

const PHRASES = [
  'trans women are women 🏳️‍⚧️',
  'LGBTQ+ welcome here',
  'protect Black lives ✊',
  'Black Lives Matter',
  'women supporting women',
  'you are valid ✨',
  'pride every day 🌈',
  'safe space vibes',
  'love is love',
  'trans rights are human rights',
  'amplify Black voices',
  'sisterhood first',
  'slay safely 💅',
  'queer joy 💖',
  // альтушки / нефор
  'альтушка spotted 🖤',
  'нефор в чате',
  'emo forever',
  'goth gf energy',
  'rawr xd',
  'y2k scene kid',
  'чёрный лак обязателен',
  'похуй вайб 🦇',
  'spider bites activated',
  'hot topic flashback',
];

const TICKER =
  '🏳️‍🌈 LGBTQ+ FRIENDLY 🏳️‍⚧️ TRANS WOMEN ARE WOMEN ✊ BLACK LIVES MATTER ♀️ WOMEN SUPPORTING WOMEN 💜 SAFE SPACE ✨ LOVE IS LOVE 🖤 PROTECT BLACK LIVES 🩷 YOU ARE VALID 🌈 PRIDE 🖤 АЛЬТУШКИ В ЗДАНИИ 🦇 НЕФОР ZONE 🕷️ EMO FOREVER 🎸 SCENE KID 💀 RAWR XD  ';

export default function ChaosLayer() {
  const [trail, setTrail] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      const id = `${Date.now()}-${Math.random()}`;
      const emoji = FLOATERS[Math.floor(Math.random() * FLOATERS.length)];
      setTrail((prev) => [...prev.slice(-18), { id, x: e.clientX, y: e.clientY, emoji }]);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (!trail.length) return;
    const t = setTimeout(() => setTrail((prev) => prev.slice(1)), 400);
    return () => clearTimeout(t);
  }, [trail]);

  useEffect(() => {
    const id = setInterval(() => {
      const toastId = Date.now();
      setToasts((prev) => [
        ...prev.slice(-4),
        {
          id: toastId,
          text: PHRASES[Math.floor(Math.random() * PHRASES.length)],
          left: 8 + Math.random() * 70,
          top: 15 + Math.random() * 60,
          kind: Math.random() > 0.5 ? 'pride' : 'solidarity',
        },
      ]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 2400);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }, 28000);
    return () => clearInterval(id);
  }, []);

  // постоянная тряска слоя (additive)
  useEffect(() => {
    const id = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 280);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`chaos-layer chaos-layer-always-jitter ${shake ? 'chaos-shake chaos-shake-hard' : ''}`} aria-hidden="true">
      <div className="chaos-aurora chaos-aurora-pride" />
      <div className="pride-flag-bar pride-flag-top" />
      <div className="trans-flag-bar" />
      <div className="alt-checker" />
      <div className="chaos-scanlines" />
      <div className="chaos-sparkle-field" />
      {/* double floaters for denser alt swarm */}
      {[...FLOATERS, ...FLOATERS].map((e, i) => (
        <span
          key={e + i}
          className={`chaos-floater ${i % 3 === 0 ? 'chaos-floater-alt' : ''}`}
          style={{
            left: `${(i * 7) % 100}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${5 + (i % 6)}s`,
            fontSize: `${1.2 + (i % 4) * 0.35}rem`,
          }}
        >
          {e}
        </span>
      ))}
      {trail.map((p) => (
        <span key={p.id} className="chaos-cursor-dust" style={{ left: p.x, top: p.y }}>
          {p.emoji}
        </span>
      ))}
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`chaos-toast chaos-toast-${t.kind} ${t.text.includes('альт') || t.text.includes('нефор') || t.text.includes('emo') || t.text.includes('goth') ? 'chaos-toast-alt' : ''}`}
          style={{ left: `${t.left}%`, top: `${t.top}%` }}
        >
          {t.text}
        </div>
      ))}
      <div className="chaos-ticker pride-ticker">
        <div className="chaos-ticker-track">
          {TICKER}
          {TICKER}
        </div>
      </div>
      <div className="chaos-ticker chaos-ticker-alt">
        <div className="chaos-ticker-track">
          🖤 НЕФОР 🖤 АЛЬТУШКА 🖤 EMO 🖤 GOTH 🖤 SCENE 🖤 Y2K 🖤 RAWR 🖤 SPIDER BITES 🖤 &nbsp;
          🖤 НЕФОР 🖤 АЛЬТУШКА 🖤 EMO 🖤 GOTH 🖤 SCENE 🖤 Y2K 🖤 RAWR 🖤 SPIDER BITES 🖤 &nbsp;
        </div>
      </div>
    </div>
  );
}
