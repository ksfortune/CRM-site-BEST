import { SOCIAL_TYPES } from '../constants/socials';
import type { SocialChannel } from '../types';

interface SocialChipsProps {
  channels?: SocialChannel[];
  onChange: (channels: SocialChannel[]) => void;
  allowValues?: boolean;
}

/** Bitrix-style social chips: toggle types, optional values per type */
export default function SocialChips({ channels = [], onChange, allowValues = true }: SocialChipsProps) {
  const active = new Set(channels.map((c) => c.type));

  const toggle = (type: string) => {
    if (active.has(type)) {
      onChange(channels.filter((c) => c.type !== type));
    } else {
      onChange([...channels, { type, value: '' }]);
    }
  };

  const setValue = (type: string, value: string) => {
    onChange(channels.map((c) => (c.type === type ? { ...c, value } : c)));
  };

  return (
    <div className="social-chips">
      <div className="social-chips-row">
        {SOCIAL_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`social-chip ${active.has(t.id) ? 'active' : ''}`}
            onClick={() => toggle(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {allowValues &&
        channels.map((ch) => (
          <div key={ch.type} className="social-chip-value">
            <span className="social-chip-value-label">{socialLabel(ch.type)}</span>
            <input
              type="text"
              placeholder={placeholderFor(ch.type)}
              value={ch.value || ''}
              onChange={(e) => setValue(ch.type, e.target.value)}
            />
          </div>
        ))}
    </div>
  );
}

function socialLabel(type: string): string {
  return SOCIAL_TYPES.find((t) => t.id === type)?.label || type;
}

function placeholderFor(type: string): string {
  switch (type) {
    case 'tg':
      return '@username или ссылка';
    case 'vk':
      return 'vk.com/...';
    case 'fb':
      return 'facebook.com/...';
    case 'phone':
      return '+7...';
    case 'email':
      return 'mail@example.com';
    case 'web':
      return 'https://...';
    default:
      return 'Значение';
  }
}
