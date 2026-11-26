import { socialLabel } from '../constants/socials';
import type { ActivityChange, Company, SocialChannel } from '../types';

const EMPTY = '—';

const statusLabel = (status: string) => (status === 'hot' ? 'Горячий' : 'Тёплый');
const text = (value?: string) => (value && value.trim() ? value.trim() : EMPTY);

const channelsText = (channels: SocialChannel[]) =>
  channels.length
    ? channels.map((c) => `${socialLabel(c.type)}: ${c.value || EMPTY}`).join(', ')
    : EMPTY;

/**
 * Список изменений между двумя версиями компании для журнала.
 * Для новой компании (prev = null) сравнение идёт с пустыми значениями.
 */
export function diffCompanies(prev: Company | null, next: Company): ActivityChange[] {
  const changes: ActivityChange[] = [];
  const push = (field: string, oldValue: string, newValue: string) => {
    if (oldValue !== newValue) changes.push({ field, oldValue, newValue });
  };

  push('Название', text(prev?.name), text(next.name));
  push('Статус', prev ? statusLabel(prev.status) : EMPTY, statusLabel(next.status));
  push('Сферы', text((prev?.industries || []).join(', ')), text((next.industries || []).join(', ')));

  const prevContacts = prev?.contacts || [];
  const nextContacts = next.contacts || [];
  const prevById = new Map(prevContacts.map((c) => [c.id, c]));
  const nextIds = new Set(nextContacts.map((c) => c.id));

  nextContacts.forEach((contact) => {
    const old = prevById.get(contact.id);
    if (!old) {
      push('Представитель добавлен', EMPTY, text(contact.name));
      return;
    }
    const label = `Представитель «${text(old.name)}»`;
    push(`${label}: ФИО`, text(old.name), text(contact.name));
    push(`${label}: Телефон`, text(old.phone), text(contact.phone));
    push(`${label}: Социальные сети`, channelsText(old.channels || []), channelsText(contact.channels || []));
  });

  prevContacts.forEach((contact) => {
    if (!nextIds.has(contact.id)) push('Представитель удалён', text(contact.name), EMPTY);
  });

  return changes;
}
