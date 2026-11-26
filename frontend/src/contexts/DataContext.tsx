import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { applyDemoOccupancy, mergeSeedCompanies } from '../data/seedCompanies';
import { logHandledError } from '../utils/errors';
import { diffCompanies } from '../utils/companyDiff';
import type {
  ActivityAction,
  ActivityChange,
  ActivityLogEntry,
  Comment,
  Company,
  CompanyDraft,
  Contact,
  CreateUserInput,
  SocialChannel,
  User,
  UserSocial,
} from '../types';

interface DataContextValue {
  users: User[];
  companies: Company[];
  logs: ActivityLogEntry[];
  findUserById: (id: string) => User | undefined;
  /** Создаёт или обновляет компанию и пишет изменения в журнал. */
  saveCompany: (companyData: CompanyDraft, actor: User) => void;
  deleteCompany: (company: CompanyDraft, actor: User) => void;
  occupyCompany: (companyId: string, userId: string, userName: string) => void;
  releaseCompany: (companyId: string) => void;
  addComment: (companyId: string, userId: string, userName: string, text: string) => void;
  getCommentsForCompany: (companyId: string) => Comment[];
  addUser: (userData: Partial<User>) => void;
  approveUser: (userId: string) => void;
  blockUser: (userId: string, blocked: boolean) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  transferAdmin: (fromAdminId: string, toUserId: string) => void;
  createUserByAdmin: (userData: CreateUserInput) => User;
}

/** Пользователь из localStorage, возможно со старыми полями firstName/lastName. */
type StoredUser = Partial<User> & {
  id?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
};

const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEYS = {
  USERS: 'warmcontacts_users',
  COMPANIES: 'warmcontacts_companies',
  COMMENTS: 'warmcontacts_comments',
  LOGS: 'warmcontacts_logs',
  REMOVED_SEED_USERS: 'warmcontacts_removed_seed_users',
};

const MAX_LOG_ENTRIES = 500;

const DEFAULT_ADMIN: User = {
  id: 'admin-default',
  email: 'admin@admin.com',
  password: 'admin',
  fullName: 'Admin System',
  bestEmail: 'admin@admin.com',
  phone: '',
  role: 'admin',
  isApproved: true,
  isBlocked: false,
  socials: [],
  createdAt: new Date().toISOString()
};

const DEFAULT_USER: User = {
  id: 'user-default',
  email: 'user@user.com',
  password: 'user',
  fullName: 'Иван Иванов',
  bestEmail: 'user@user.com',
  phone: '+7 900 000-00-01',
  role: 'user',
  isApproved: true,
  isBlocked: false,
  socials: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const NASTYA_USER: User = {
  id: 'user-nastya',
  email: 'nastya@shedrina.com',
  password: 'nastya',
  fullName: 'Настя Шедрина',
  bestEmail: 'nastya@shedrina.com',
  phone: '',
  role: 'user',
  isApproved: true,
  isBlocked: false,
  socials: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

/** Удалённые админом демо-пользователи не должны возвращаться при перезагрузке. */
function readRemovedSeedUsers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMOVED_SEED_USERS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function rememberRemovedSeedUser(userId: string) {
  if (userId !== DEFAULT_USER.id && userId !== NASTYA_USER.id) return;
  const removed = readRemovedSeedUsers();
  if (removed.includes(userId)) return;
  localStorage.setItem(STORAGE_KEYS.REMOVED_SEED_USERS, JSON.stringify([...removed, userId]));
}

/** Старые firstName + lastName превращаем в одно поле fullName. */
function migrateUser(u: StoredUser): StoredUser {
  const { firstName, lastName, ...rest } = u;
  const fullName = (rest.fullName || [firstName, lastName].filter(Boolean).join(' ')).trim();
  return { ...rest, fullName };
}

function toStoredUsers(value: unknown): StoredUser[] {
  if (!Array.isArray(value)) return [];
  return (value as StoredUser[]).map(migrateUser);
}

function ensureAdminUser(list: unknown): User[] {
  const users = toStoredUsers(list);
  const isAdminRecord = (u: StoredUser) =>
    u.email === 'admin@admin.com' || u.id === DEFAULT_ADMIN.id || u.email === 'admin';
  const hasAdmin = users.some(isAdminRecord);
  if (hasAdmin) {
    return users.map((u) =>
      isAdminRecord(u)
        ? {
            ...DEFAULT_ADMIN,
            ...u,
            fullName: u.fullName || DEFAULT_ADMIN.fullName,
            email: !u.email || u.email === 'admin' ? 'admin@admin.com' : u.email,
            password: u.password === 'admin' || !u.password ? 'admin' : u.password,
            role: 'admin' as const,
            isApproved: true,
            isBlocked: false,
            phone: u.phone || '',
          }
        : { ...u, phone: u.phone || '', socials: u.socials || [] }
    ) as User[];
  }
  return [DEFAULT_ADMIN, ...users.map((u) => ({ ...u, phone: u.phone || '', socials: u.socials || [] } as User))];
}

function ensureTemplateUser(list: unknown): User[] {
  const users = toStoredUsers(list);
  const isTemplate = (u: StoredUser) => u.email === 'user@user.com' || u.id === DEFAULT_USER.id;
  if (users.some(isTemplate)) {
    return users.map((u) =>
      isTemplate(u)
        ? {
            ...DEFAULT_USER,
            ...u,
            fullName: u.fullName || DEFAULT_USER.fullName,
            email: u.email || DEFAULT_USER.email,
            password: u.password || 'user',
            role: u.role === 'admin' ? 'admin' as const : 'user' as const,
            isApproved: true,
            isBlocked: false,
            phone: u.phone || DEFAULT_USER.phone,
            socials: u.socials || [],
          }
        : u
    ) as User[];
  }
  if (readRemovedSeedUsers().includes(DEFAULT_USER.id)) return users as User[];
  return [...users, DEFAULT_USER] as User[];
}

function ensureNastyaUser(list: unknown): User[] {
  const users = toStoredUsers(list);
  const isNastya = (u: StoredUser) =>
    (u.email || '').toLowerCase() === NASTYA_USER.email || u.id === NASTYA_USER.id;
  if (users.some(isNastya)) {
    return users.map((u) =>
      isNastya(u)
        ? {
            ...NASTYA_USER,
            ...u,
            email: u.email || NASTYA_USER.email,
            password: u.password || NASTYA_USER.password,
            fullName: u.fullName || NASTYA_USER.fullName,
            isApproved: true,
            isBlocked: false,
            role: u.role === 'admin' ? 'admin' as const : 'user' as const,
            phone: u.phone || '',
            socials: u.socials || [],
          }
        : u
    ) as User[];
  }
  if (readRemovedSeedUsers().includes(NASTYA_USER.id)) return users as User[];
  return [...users, NASTYA_USER] as User[];
}

/** Представитель в актуальном виде: ФИО одним полем, без устаревшего никнейма. */
function normalizeContact(c: Contact & { nickname?: string }): Contact {
  return {
    id: c.id || uuid(),
    name: c.name || '',
    phone: c.phone || '',
    channels: c.channels || [],
  };
}

function migrateCompany(c: null | undefined): null;
function migrateCompany(c: CompanyDraft): Company;
function migrateCompany(c: CompanyDraft | null | undefined): Company | null {
  if (!c) return null;
  const industries = c.industries || (c.industry ? [c.industry] : []);
  let contacts = c.contacts as Contact[] | undefined;
  if (!contacts) {
    contacts = [];
    if (c.repName || c.phone || c.messenger || c.email || c.website) {
      const channels: SocialChannel[] = [];
      if (c.phone) channels.push({ type: 'phone', value: c.phone });
      if (c.messenger) channels.push({ type: 'tg', value: c.messenger });
      if (c.email) channels.push({ type: 'email', value: c.email });
      if (c.website) channels.push({ type: 'web', value: c.website });
      contacts.push({
        id: uuid(),
        name: c.repName || 'Контакт',
        phone: c.phone || '',
        channels,
      });
    }
  }
  return { ...c, industries, contacts: contacts.map(normalizeContact) } as Company;
}

function loadCompanies(): Company[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (stored) {
      return applyDemoOccupancy(
        mergeSeedCompanies(JSON.parse(stored) as unknown).map((company) => migrateCompany(company))
      );
    }
  } catch (e) {
    logHandledError(e, 'Failed to read companies');
  }
  return applyDemoOccupancy(mergeSeedCompanies([]).map((company) => migrateCompany(company)));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return ensureNastyaUser(ensureTemplateUser(ensureAdminUser(JSON.parse(stored) as unknown)));
    } catch (e) {
      logHandledError(e, 'Failed to read users');
    }
    return ensureNastyaUser(ensureTemplateUser(ensureAdminUser([])));
  });
  const [companies, setCompanies] = useState<Company[]>(loadCompanies);
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (stored) return JSON.parse(stored) as Comment[];
    } catch (e) {
      logHandledError(e, 'Failed to read comments');
    }
    return [];
  });
  const [logs, setLogs] = useState<ActivityLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) return JSON.parse(stored) as ActivityLogEntry[];
    } catch (e) {
      logHandledError(e, 'Failed to read activity log');
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  const findUserById = (id: string) => users.find((u) => u.id === id);

  const pushLog = (
    action: ActivityAction,
    company: { id: string; name: string },
    actor: User,
    changes: ActivityChange[]
  ) => {
    const entry: ActivityLogEntry = {
      id: uuid(),
      action,
      companyId: company.id,
      companyName: company.name,
      userId: actor.id,
      userName: actor.fullName || actor.email,
      changes,
      createdAt: new Date().toISOString(),
    };
    setLogs((prev) => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
  };

  const createUserByAdmin = (userData: CreateUserInput): User => {
    const email = (userData.email || '').trim().toLowerCase();
    const fullName = (userData.fullName || '').trim();
    if (!fullName) throw new Error('ФИО обязательно');
    if (!email) throw new Error('Email обязателен');
    if (users.some((u) => (u.email || '').toLowerCase() === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const newUser = {
      socials: [] as UserSocial[],
      phone: '',
      bestEmail: email,
      ...userData,
      fullName,
      email,
      id: uuid(),
      isBlocked: false,
      isApproved: true,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    } as User;
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const saveCompany = (companyData: CompanyDraft, actor: User) => {
    const now = new Date().toISOString();
    const normalized = migrateCompany(companyData);
    const existing = companyData.id ? companies.find((c) => c.id === companyData.id) : undefined;
    if (existing) {
      const updated: Company = { ...normalized, updatedBy: actor.id, updatedAt: now };
      const changes = diffCompanies(existing, updated);
      setCompanies((prev) => prev.map((c) => (c.id === existing.id ? updated : c)));
      if (changes.length > 0) pushLog('update', updated, actor, changes);
    } else {
      const created: Company = {
        ...normalized,
        id: uuid(),
        occupiedBy: normalized.occupiedBy ?? null,
        occupiedByName: normalized.occupiedByName ?? null,
        createdBy: actor.id,
        updatedBy: actor.id,
        createdAt: now,
        updatedAt: now,
      };
      setCompanies((prev) => [...prev, created]);
      pushLog('create', created, actor, diffCompanies(null, created));
    }
  };

  const deleteCompany = (company: CompanyDraft, actor: User) => {
    const existing = companies.find((c) => c.id === company.id);
    setCompanies((prev) => prev.filter((c) => c.id !== company.id));
    if (company.id) {
      pushLog('delete', { id: company.id, name: existing?.name || company.name || '' }, actor, []);
    }
  };

  const occupyCompany = (companyId: string, userId: string, userName: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, occupiedBy: userId, occupiedByName: userName } : c
      )
    );
  };
  const releaseCompany = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, occupiedBy: null, occupiedByName: null } : c
      )
    );
  };

  const addComment = (companyId: string, userId: string, userName: string, text: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: uuid(),
        companyId,
        userId,
        userName,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
  };
  const getCommentsForCompany = (companyId: string) =>
    comments
      .filter((c) => c.companyId === companyId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const addUser = (userData: Partial<User>) => {
    setUsers((prev) => [
      ...prev,
      {
        ...userData,
        id: uuid(),
        isBlocked: false,
        isApproved: false,
        role: 'user',
        phone: userData.phone || '',
        socials: userData.socials || [],
        createdAt: new Date().toISOString(),
      } as User,
    ]);
  };
  const approveUser = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isApproved: true } : u)));
  };
  const blockUser = (userId: string, blocked: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBlocked: blocked } : u)));
  };
  const deleteUser = (userId: string) => {
    rememberRemovedSeedUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    // Компании удалённого пользователя снова становятся свободными
    setCompanies((prev) =>
      prev.map((c) => (c.occupiedBy === userId ? { ...c, occupiedBy: null, occupiedByName: null } : c))
    );
  };
  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  };
  const transferAdmin = (fromAdminId: string, toUserId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === fromAdminId) return { ...u, role: 'user' };
        if (u.id === toUserId) return { ...u, role: 'admin' };
        return u;
      })
    );
  };

  const value: DataContextValue = {
    users,
    companies,
    logs,
    findUserById,
    saveCompany,
    deleteCompany,
    occupyCompany,
    releaseCompany,
    addComment,
    getCommentsForCompany,
    addUser,
    approveUser,
    blockUser,
    deleteUser,
    updateUser,
    transferAdmin,
    createUserByAdmin,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData должен вызываться внутри DataProvider');
  }
  return context;
}
