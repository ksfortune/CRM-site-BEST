/** Инициалы для аватара из ФИО одним полем: «Настя Шедрина» → «НШ». */
export function getInitials(fullName?: string): string {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
