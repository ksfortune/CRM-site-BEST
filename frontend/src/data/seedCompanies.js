const CREATED_AT = '2026-01-01T00:00:00.000Z';

export const SEED_COMPANIES = [
  {
    id: 'tpl-01',
    name: 'Северная логистика',
    industries: ['Логистика'],
    status: 'warm',
    contacts: [
      {
        id: 'tpl-01-c1',
        name: 'Анна Соколова',
        nickname: 'sokolova',
        phone: '+7 900 101-01-01',
        channels: [
          { type: 'tg', value: '@sokolova_log' },
          { type: 'email', value: 'anna@severlog.example' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-02',
    name: 'Студия Пиксель',
    industries: ['IT', 'Дизайн'],
    status: 'hot',
    contacts: [
      {
        id: 'tpl-02-c1',
        name: 'Марк Левин',
        nickname: 'pixel_mark',
        phone: '+7 900 202-02-02',
        channels: [
          { type: 'tg', value: '@pixel_mark' },
          { type: 'web', value: 'https://pixel.example' },
        ],
      },
      {
        id: 'tpl-02-c2',
        name: 'Ольга Ким',
        nickname: 'kim_design',
        phone: '+7 900 202-02-03',
        channels: [{ type: 'email', value: 'olga@pixel.example' }],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-03',
    name: 'Кафе Утро',
    industries: ['Общепит'],
    status: 'warm',
    contacts: [
      {
        id: 'tpl-03-c1',
        name: 'Елена Морозова',
        nickname: 'utro_cafe',
        phone: '+7 900 303-03-03',
        channels: [
          { type: 'phone', value: '+7 900 303-03-03' },
          { type: 'tg', value: '@utro_cafe' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-04',
    name: 'Клиника Медлайн',
    industries: ['Медицина'],
    status: 'hot',
    contacts: [
      {
        id: 'tpl-04-c1',
        name: 'Павел Орлов',
        nickname: 'dr_orlov',
        phone: '+7 900 404-04-04',
        channels: [
          { type: 'email', value: 'orlov@medline.example' },
          { type: 'phone', value: '+7 900 404-04-04' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-05',
    name: 'Агентство Вектор',
    industries: ['Маркетинг'],
    status: 'warm',
    contacts: [
      {
        id: 'tpl-05-c1',
        name: 'Дарья Волкова',
        nickname: 'vector_daria',
        phone: '+7 900 505-05-05',
        channels: [
          { type: 'tg', value: '@vector_daria' },
          { type: 'vk', value: 'vk.com/vector_agency' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-06',
    name: 'СтройДом',
    industries: ['Строительство'],
    status: 'warm',
    contacts: [
      {
        id: 'tpl-06-c1',
        name: 'Игорь Белов',
        nickname: 'stroy_igor',
        phone: '+7 900 606-06-06',
        channels: [
          { type: 'phone', value: '+7 900 606-06-06' },
          { type: 'email', value: 'igor@stroydom.example' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-07',
    name: 'ФинКонсалт',
    industries: ['Финансы'],
    status: 'hot',
    contacts: [
      {
        id: 'tpl-07-c1',
        name: 'Светлана Новикова',
        nickname: 'fin_sveta',
        phone: '+7 900 707-07-07',
        channels: [
          { type: 'email', value: 'svetlana@finkonsalt.example' },
          { type: 'tg', value: '@fin_sveta' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'tpl-08',
    name: 'ЭкоПак',
    industries: ['Производство'],
    status: 'warm',
    contacts: [
      {
        id: 'tpl-08-c1',
        name: 'Никита Егоров',
        nickname: 'ecopak',
        phone: '+7 900 808-08-08',
        channels: [
          { type: 'web', value: 'https://ecopak.example' },
          { type: 'phone', value: '+7 900 808-08-08' },
        ],
      },
    ],
    occupiedBy: null,
    occupiedByName: null,
    createdBy: 'admin-default',
    updatedBy: 'admin-default',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
];

export function mergeSeedCompanies(list) {
  const companies = Array.isArray(list) ? list : [];
  const ids = new Set(companies.map((c) => c.id));
  const missing = SEED_COMPANIES.filter((c) => !ids.has(c.id));
  if (!missing.length) return companies;
  return [...missing, ...companies];
}
