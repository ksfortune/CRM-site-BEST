export const SOCIAL_TYPES = [
  { id: 'tg', label: 'Telegram' },
  { id: 'vk', label: 'VK' },
  { id: 'fb', label: 'Facebook' },
  { id: 'phone', label: 'Телефон' },
  { id: 'email', label: 'Email' },
  { id: 'web', label: 'Сайт' },
  { id: 'other', label: 'Другое' },
];

export function socialLabel(type) {
  return SOCIAL_TYPES.find((t) => t.id === type)?.label || type;
}
