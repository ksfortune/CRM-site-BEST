import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { applyDemoOccupancy, mergeSeedCompanies } from '../data/seedCompanies';
import type {
  ChangeRequest,
  ChangeRequestType,
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
  requests: ChangeRequest[];
  findUserById: (id: string) => User | undefined;
  requestCompanyChange: (type: ChangeRequestType, data: CompanyDraft, currentUser: User) => ChangeRequest;
  approveRequest: (requestId: string, adminUser: User) => boolean;
  rejectRequest: (requestId: string) => void;
  directCompanyUpdate: (companyData: CompanyDraft, adminUser: User, isDelete?: boolean) => void;
  occupyCompany: (companyId: string, userId: string, userName: string) => void;
  releaseCompany: (companyId: string) => void;
  addComment: (companyId: string, userId: string, userName: string, text: string) => void;
  getCommentsForCompany: (companyId: string) => Comment[];
  addUser: (userData: Partial<User>) => void;
  approveUser: (userId: string) => void;
  blockUser: (userId: string, blocked: boolean) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  transferAdmin: (fromAdminId: string, toUserId: string) => void;
  createUserByAdmin: (userData: CreateUserInput) => User;
}

type StoredUser = Partial<User> & {
  id?: string;
  email?: string;
  role?: string;
};

const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEYS = {
  USERS: 'warmcontacts_users',
  COMPANIES: 'warmcontacts_companies',
  COMMENTS: 'warmcontacts_comments',
  REQUESTS: 'warmcontacts_requests'
};

const DEFAULT_ADMIN: User = {
  id: 'admin-default',
  email: 'admin@admin.com',
  password: 'admin',
  firstName: 'Admin',
  lastName: 'System',
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
  firstName: 'Иван',
  lastName: 'Иванов',
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
  firstName: 'Настя',
  lastName: 'Шедрина',
  bestEmail: 'nastya@shedrina.com',
  phone: '',
  role: 'user',
  isApproved: true,
  isBlocked: false,
  socials: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

function toStoredUsers(value: unknown): StoredUser[] {
  if (!Array.isArray(value)) return [];
  return value as StoredUser[];
}

function ensureAdminUser(list: unknown): User[] {
  const users = toStoredUsers(list);
  const hasAdmin = users.some(
    (u) => u.email === 'admin@admin.com' || u.id === DEFAULT_ADMIN.id || u.email === 'admin'
  );
  if (hasAdmin) {
    return users.map((u) =>
      u.email === 'admin@admin.com' || u.id === DEFAULT_ADMIN.id || u.email === 'admin'
        ? {
            ...DEFAULT_ADMIN,
            ...u,
            email: 'admin@admin.com',
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
            email: 'user@user.com',
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
            email: NASTYA_USER.email,
            password: u.password || NASTYA_USER.password,
            firstName: u.firstName || NASTYA_USER.firstName,
            lastName: u.lastName || NASTYA_USER.lastName,
            isApproved: true,
            isBlocked: false,
            role: u.role === 'admin' ? 'admin' as const : 'user' as const,
            phone: u.phone || '',
            socials: u.socials || [],
          }
        : u
    ) as User[];
  }
  return [...users, NASTYA_USER] as User[];
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
        nickname: '',
        phone: c.phone || '',
        channels,
      });
    }
  }
  return { ...c, industries, contacts } as Company;
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
    console.error('Failed to read companies', e);
  }
  return applyDemoOccupancy(mergeSeedCompanies([]).map((company) => migrateCompany(company)));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return ensureNastyaUser(ensureTemplateUser(ensureAdminUser(JSON.parse(stored) as unknown)));
    } catch (e) {
      console.error('Failed to read users', e);
    }
    return ensureNastyaUser(ensureTemplateUser(ensureAdminUser([])));
  });
  const [companies, setCompanies] = useState<Company[]>(loadCompanies);
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (stored) return JSON.parse(stored) as Comment[];
    } catch (e) {
      console.error('Failed to read comments', e);
    }
    return [];
  });
  const [requests, setRequests] = useState<ChangeRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (stored) return JSON.parse(stored) as ChangeRequest[];
    } catch (e) {
      console.error('Failed to read requests', e);
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
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  const findUserById = (id: string) => users.find((u) => u.id === id);

  const requestCompanyChange = (type: ChangeRequestType, data: CompanyDraft, currentUser: User) => {
    const newRequest: ChangeRequest = {
      id: uuid(),
      type,
      companyId: data.id || null,
      targetCompany: type === 'delete' ? null : migrateCompany(data),
      requestedBy: currentUser.id,
      requestedByName: `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [...prev, newRequest]);
    return newRequest;
  };

  const createUserByAdmin = (userData: CreateUserInput): User => {
    const email = (userData.email || '').trim().toLowerCase();
    if (!email) throw new Error('Email обязателен');
    if (users.some((u) => (u.email || '').toLowerCase() === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const newUser = {
      socials: [] as UserSocial[],
      phone: '',
      bestEmail: email,
      ...userData,
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

  const approveRequest = (requestId: string, adminUser: User) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request || request.status !== 'pending') return false;
    if (request.type === 'create') {
      const target = request.targetCompany ? migrateCompany(request.targetCompany) : null;
      const newCompany = {
        ...(target ?? {}),
        id: uuid(),
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Company;
      setCompanies((prev) => [...prev, newCompany]);
    } else if (request.type === 'update') {
      const target = request.targetCompany ? migrateCompany(request.targetCompany) : null;
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === request.companyId
            ? {
                ...(target ?? {}),
                updatedBy: adminUser.id,
                updatedAt: new Date().toISOString(),
              } as Company
            : c
        )
      );
    } else if (request.type === 'delete') {
      setCompanies((prev) => prev.filter((c) => c.id !== request.companyId));
    }
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );
    return true;
  };

  const rejectRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  const directCompanyUpdate = (companyData: CompanyDraft, adminUser: User, isDelete = false) => {
    if (isDelete) {
      setCompanies((prev) => prev.filter((c) => c.id !== companyData.id));
    } else {
      const normalized = migrateCompany(companyData);
      if (companies.find((c) => c.id === companyData.id)) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === companyData.id
              ? {
                  ...normalized,
                  updatedBy: adminUser.id,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      } else {
        setCompanies((prev) => [
          ...prev,
          {
            ...normalized,
            id: uuid(),
            createdBy: adminUser.id,
            updatedBy: adminUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
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
    requests,
    findUserById,
    requestCompanyChange,
    approveRequest,
    rejectRequest,
    directCompanyUpdate,
    occupyCompany,
    releaseCompany,
    addComment,
    getCommentsForCompany,
    addUser,
    approveUser,
    blockUser,
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
