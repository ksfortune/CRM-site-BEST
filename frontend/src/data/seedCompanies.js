/** Шаблонные компании для демо — намеренно дурацкие */
export const SEED_COMPANIES = [
  {
    id: 'seed-01',
    name: 'ООО «Сигма Бойз Инвест»',
    industries: ['Финтех', 'Мемы'],
    status: 'hot',
    contacts: [
      { id: 'seed-01-c1', name: 'Артём Скибиди', nickname: 'skibidi_ceo', phone: '+7 900 111-11-11', channels: [{ type: 'tg', value: '@skibidi_ceo' }, { type: 'vk', value: 'vk.com/sigma' }] },
      { id: 'seed-01-c2', name: 'Валера Рizzа', nickname: 'rizzler', phone: '+7 900 111-11-12', channels: [{ type: 'tg', value: '@rizzler' }] },
    ],
  },
  {
    id: 'seed-02',
    name: 'ИП «Альтушка.косметикс»',
    industries: ['Бьюти', 'E-commerce'],
    status: 'warm',
    contacts: [
      { id: 'seed-02-c1', name: 'Кира Вейп', nickname: 'alt_kira', phone: '+7 900 222-22-21', channels: [{ type: 'tg', value: '@alt_kira' }, { type: 'web', value: 'https://altushka.example' }] },
    ],
  },
  {
    id: 'seed-03',
    name: 'ЗАО «КриптоХомяк 3000»',
    industries: ['Крипта', 'Гемблинг'],
    status: 'hot',
    contacts: [
      { id: 'seed-03-c1', name: 'Денис Pump', nickname: 'to_the_moon', phone: '+7 900 333-33-31', channels: [{ type: 'tg', value: '@moonboy' }, { type: 'email', value: 'denis@hamster.pump' }] },
    ],
  },
  {
    id: 'seed-04',
    name: 'ООО «Нейро-Шаурма AI»',
    industries: ['Общепит', 'AI'],
    status: 'warm',
    contacts: [
      { id: 'seed-04-c1', name: 'Шеф GPT', nickname: 'shawarma_ai', phone: '+7 900 444-44-41', channels: [{ type: 'tg', value: '@shawarma_ai' }, { type: 'phone', value: '+7 900 444-44-41' }] },
      { id: 'seed-04-c2', name: 'Кассир Llama', nickname: 'llama_kassa', phone: '', channels: [{ type: 'tg', value: '@llama_kassa' }] },
    ],
  },
  {
    id: 'seed-05',
    name: 'Стартап «OnlyVibes»',
    industries: ['Медиа', 'Инфлюенс'],
    status: 'hot',
    contacts: [
      { id: 'seed-05-c1', name: 'Милана Main Character', nickname: 'main_char', phone: '+7 900 555-55-51', channels: [{ type: 'tg', value: '@main_char' }, { type: 'fb', value: 'facebook.com/vibes' }] },
    ],
  },
  {
    id: 'seed-06',
    name: 'ООО «ТикТок Консалтинг»',
    industries: ['Маркетинг', 'SMM'],
    status: 'warm',
    contacts: [
      { id: 'seed-06-c1', name: 'Женя FYP', nickname: 'fyp_queen', phone: '+7 900 666-66-61', channels: [{ type: 'tg', value: '@fyp_queen' }] },
    ],
  },
  {
    id: 'seed-07',
    name: 'ИП «Душнила Софт»',
    industries: ['IT', 'SaaS'],
    status: 'warm',
    contacts: [
      { id: 'seed-07-c1', name: 'Игорь Code Review', nickname: 'nitpick', phone: '+7 900 777-77-71', channels: [{ type: 'email', value: 'igor@dushnila.dev' }, { type: 'tg', value: '@nitpick' }] },
    ],
  },
  {
    id: 'seed-08',
    name: 'ООО «Братва Delivery»',
    industries: ['Логистика', 'Общепит'],
    status: 'hot',
    contacts: [
      { id: 'seed-08-c1', name: 'Серёга Курьер', nickname: 'za_15_min', phone: '+7 900 888-88-81', channels: [{ type: 'tg', value: '@za_15_min' }, { type: 'phone', value: '+7 900 888-88-81' }] },
    ],
  },
  {
    id: 'seed-09',
    name: 'Лаборатория «Скибиди Science»',
    industries: ['Биотех', 'R&D'],
    status: 'warm',
    contacts: [
      { id: 'seed-09-c1', name: 'Доктор Toilet', nickname: 'phd_ohio', phone: '+7 900 999-99-91', channels: [{ type: 'email', value: 'toilet@ohio.lab' }] },
    ],
  },
  {
    id: 'seed-10',
    name: 'ООО «Вайб Кодинг Студио»',
    industries: ['IT', 'Геймдев'],
    status: 'hot',
    contacts: [
      { id: 'seed-10-c1', name: 'Лера Cursor', nickname: 'vibe_lerа', phone: '+7 901 101-01-01', channels: [{ type: 'tg', value: '@vibe_lera' }, { type: 'web', value: 'https://vibe.example' }] },
      { id: 'seed-10-c2', name: 'Макс Copilot', nickname: 'tab_tab', phone: '+7 901 101-01-02', channels: [{ type: 'tg', value: '@tab_tab' }] },
    ],
  },
  {
    id: 'seed-11',
    name: 'Бренд «Эмо-Худи Limited»',
    industries: ['Fashion', 'E-commerce'],
    status: 'warm',
    contacts: [
      { id: 'seed-11-c1', name: 'Настя Black Nail', nickname: 'emo_nastya', phone: '+7 901 202-02-01', channels: [{ type: 'tg', value: '@emo_nastya' }, { type: 'vk', value: 'vk.com/emo_hoodie' }] },
    ],
  },
  {
    id: 'seed-12',
    name: 'ООО «Позяб forever»',
    industries: ['Медиа', 'Подкасты'],
    status: 'hot',
    contacts: [
      { id: 'seed-12-c1', name: 'Тимур Relatable', nickname: 'relatable_tm', phone: '+7 901 303-03-01', channels: [{ type: 'tg', value: '@relatable_tm' }] },
    ],
  },
  {
    id: 'seed-13',
    name: 'Стартап «NPC Simulator»',
    industries: ['Геймдев', 'AI'],
    status: 'warm',
    contacts: [
      { id: 'seed-13-c1', name: 'Саша Default Dance', nickname: 'npc_sasha', phone: '+7 901 404-04-01', channels: [{ type: 'tg', value: '@npc_sasha' }, { type: 'email', value: 'sasha@npc.sim' }] },
    ],
  },
  {
    id: 'seed-14',
    name: 'ООО «Чилл Гай Логистик»',
    industries: ['Логистика'],
    status: 'warm',
    contacts: [
      { id: 'seed-14-c1', name: 'Паша Chill', nickname: 'im_chill', phone: '+7 901 505-05-01', channels: [{ type: 'tg', value: '@im_chill' }, { type: 'phone', value: '+7 901 505-05-01' }] },
    ],
  },
  {
    id: 'seed-15',
    name: 'Агентство «Слухи & Драма»',
    industries: ['PR', 'Медиа'],
    status: 'hot',
    contacts: [
      { id: 'seed-15-c1', name: 'Оля Tea', nickname: 'spill_tea', phone: '+7 901 606-06-01', channels: [{ type: 'tg', value: '@spill_tea' }, { type: 'vk', value: 'vk.com/drama' }] },
      { id: 'seed-15-c2', name: 'Вика Gossip', nickname: 'gossip_girl', phone: '+7 901 606-06-02', channels: [{ type: 'tg', value: '@gossip_girl' }] },
    ],
  },
  {
    id: 'seed-16',
    name: 'ООО «Братский Кофеин»',
    industries: ['Общепит', 'Ритейл'],
    status: 'warm',
    contacts: [
      { id: 'seed-16-c1', name: 'Костя Латте', nickname: 'oat_milk', phone: '+7 901 707-07-01', channels: [{ type: 'tg', value: '@oat_milk' }] },
    ],
  },
  {
    id: 'seed-17',
    name: 'Фабрика «Мем Пакс»',
    industries: ['Медиа', 'Мерч'],
    status: 'hot',
    contacts: [
      { id: 'seed-17-c1', name: 'Даня Template', nickname: 'meme_danya', phone: '+7 901 808-08-01', channels: [{ type: 'tg', value: '@meme_danya' }, { type: 'web', value: 'https://memepacks.example' }] },
    ],
  },
  {
    id: 'seed-18',
    name: 'ООО «Зум-Зум Коллцентр»',
    industries: ['Аутсорс', 'Поддержка'],
    status: 'warm',
    contacts: [
      { id: 'seed-18-c1', name: 'Инна Mute', nickname: 'youre_muted', phone: '+7 901 909-09-01', channels: [{ type: 'tg', value: '@youre_muted' }, { type: 'email', value: 'inna@zoomzoom.support' }] },
    ],
  },
  {
    id: 'seed-19',
    name: 'Лейбл «Nightcore & Слёзы»',
    industries: ['Музыка', 'Ивенты'],
    status: 'hot',
    contacts: [
      { id: 'seed-19-c1', name: 'Лиза Bassdrop', nickname: 'nightcore_liz', phone: '+7 902 101-10-01', channels: [{ type: 'tg', value: '@nightcore_liz' }] },
    ],
  },
  {
    id: 'seed-20',
    name: 'ООО «Главный Персонаж HR»',
    industries: ['HR', 'EdTech'],
    status: 'warm',
    contacts: [
      { id: 'seed-20-c1', name: 'Катя Soft Skills', nickname: 'hr_katya', phone: '+7 902 202-20-01', channels: [{ type: 'tg', value: '@hr_katya' }, { type: 'email', value: 'katya@mainchar.hr' }] },
      { id: 'seed-20-c2', name: 'Рома Onboarding', nickname: 'welcome_bro', phone: '+7 902 202-20-02', channels: [{ type: 'tg', value: '@welcome_bro' }] },
    ],
  },
  {
    id: 'seed-21',
    name: 'Бутик «Y2K Возвращение»',
    industries: ['Fashion', 'Ритейл'],
    status: 'hot',
    contacts: [
      { id: 'seed-21-c1', name: 'Полина Butterfly', nickname: 'y2k_poli', phone: '+7 902 303-30-01', channels: [{ type: 'tg', value: '@y2k_poli' }, { type: 'vk', value: 'vk.com/y2kshop' }] },
    ],
  },
  {
    id: 'seed-22',
    name: 'ООО «Дофаминовый Магазин»',
    industries: ['E-commerce', 'Гаджеты'],
    status: 'warm',
    contacts: [
      { id: 'seed-22-c1', name: 'Илья Unbox', nickname: 'dopamine_ilya', phone: '+7 902 404-40-01', channels: [{ type: 'tg', value: '@dopamine_ilya' }] },
    ],
  },
  {
    id: 'seed-23',
    name: 'Студия «Гиперпоп Ремонт»',
    industries: ['Строительство', 'Ивенты'],
    status: 'warm',
    contacts: [
      { id: 'seed-23-c1', name: 'Жора Glitch', nickname: 'hyper_zhora', phone: '+7 902 505-50-01', channels: [{ type: 'tg', value: '@hyper_zhora' }, { type: 'phone', value: '+7 902 505-50-01' }] },
    ],
  },
  {
    id: 'seed-24',
    name: 'ООО «Рандом Вайб Капитал»',
    industries: ['Финтех', 'Инвестиции'],
    status: 'hot',
    contacts: [
      { id: 'seed-24-c1', name: 'Андрей Portfolio', nickname: 'ape_andrey', phone: '+7 902 606-60-01', channels: [{ type: 'tg', value: '@ape_andrey' }, { type: 'email', value: 'andrey@randomvibes.cap' }] },
    ],
  },
].map((c) => ({
  ...c,
  occupiedBy: null,
  occupiedByName: null,
  createdAt: '2026-01-15T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
}));

export function ensureSeedCompanies(list) {
  const existing = Array.isArray(list) ? list : [];
  const ids = new Set(existing.map((c) => c.id));
  const missing = SEED_COMPANIES.filter((c) => !ids.has(c.id));
  return [...existing, ...missing];
}
