import type { SocialChannel, SocialTypeId, UserSocial } from '../types';

export const SOCIAL_TYPES: { id: SocialTypeId; label: string }[] = [
  { id: 'tg', label: 'Telegram' },
  { id: 'vk', label: 'VK' },
  { id: 'fb', label: 'Facebook' },
  { id: 'phone', label: 'Телефон' },
  { id: 'email', label: 'Email' },
  { id: 'web', label: 'Сайт' },
  { id: 'other', label: 'Другое' },
];

export function socialLabel(type: string): string {
  return SOCIAL_TYPES.find((t) => t.id === type)?.label || type;
}

/** Социальные сети пользователя → каналы для SocialChips. */
export function channelsFromSocials(list: UserSocial[] | undefined): SocialChannel[] {
  return (list || []).map((s) => ({ type: s.type, value: s.url || s.value || '' }));
}

/** Каналы из SocialChips → социальные сети пользователя. */
export function socialsFromChannels(channels: SocialChannel[]): UserSocial[] {
  return channels.map((c) => ({ type: c.type, url: c.value || '' }));
}

/**
 * Ссылка для значения социальной сети или null, если это обычный текст
 * (например, «@test_username», телефон или email).
 */
export function socialHref(type: string, raw: string | undefined): string | null {
  const value = (raw || '').trim();
  if (!value || type === 'phone' || type === 'email') return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes('@') || /\s/.test(value)) return null;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(value)) return `https://${value}`;
  return null;
}
