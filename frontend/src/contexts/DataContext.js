import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

const DataContext = createContext();

const STORAGE_KEYS = {
  USERS: 'warmcontacts_users',
  COMPANIES: 'warmcontacts_companies',
  COMMENTS: 'warmcontacts_comments',
  REQUESTS: 'warmcontacts_requests'
};

const DEFAULT_ADMIN = {
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

function ensureAdminUser(list) {
  const users = Array.isArray(list) ? list : [];
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
            role: 'admin',
            isApproved: true,
            isBlocked: false,
            phone: u.phone || '',
          }
        : { ...u, phone: u.phone || '', socials: u.socials || [] }
    );
  }
  return [DEFAULT_ADMIN, ...users.map((u) => ({ ...u, phone: u.phone || '', socials: u.socials || [] }))];
}

function migrateCompany(c) {
  if (!c) return c;
  const industries = c.industries || (c.industry ? [c.industry] : []);
  let contacts = c.contacts;
  if (!contacts) {
    contacts = [];
    if (c.repName || c.phone || c.messenger || c.email || c.website) {
      const channels = [];
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
  return { ...c, industries, contacts };
}

export function DataProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return ensureAdminUser(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to read users', e);
    }
    return ensureAdminUser([]);
  });
  const [companies, setCompanies] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      if (stored) return JSON.parse(stored).map(migrateCompany);
    } catch (e) {
      console.error('Failed to read companies', e);
    }
    return [];
  });
  const [comments, setComments] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to read comments', e);
    }
    return [];
  });
  const [requests, setRequests] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (stored) return JSON.parse(stored);
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

  const findUserById = (id) => users.find((u) => u.id === id);

  const requestCompanyChange = (type, data, currentUser) => {
    const newRequest = {
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

  const createUserByAdmin = (userData) => {
    const email = (userData.email || '').trim().toLowerCase();
    if (!email) throw new Error('Email обязателен');
    if (users.some((u) => (u.email || '').toLowerCase() === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const newUser = {
      socials: [],
      phone: '',
      bestEmail: email,
      ...userData,
      email,
      id: uuid(),
      isBlocked: false,
      isApproved: true,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const approveRequest = (requestId, adminUser) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request || request.status !== 'pending') return false;
    if (request.type === 'create') {
      const newCompany = {
        ...migrateCompany(request.targetCompany),
        id: uuid(),
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCompanies((prev) => [...prev, newCompany]);
    } else if (request.type === 'update') {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === request.companyId
            ? {
                ...migrateCompany(request.targetCompany),
                updatedBy: adminUser.id,
                updatedAt: new Date().toISOString(),
              }
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

  const rejectRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
  };

  const directCompanyUpdate = (companyData, adminUser, isDelete = false) => {
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

  const occupyCompany = (companyId, userId, userName) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, occupiedBy: userId, occupiedByName: userName } : c
      )
    );
  };
  const releaseCompany = (companyId) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, occupiedBy: null, occupiedByName: null } : c
      )
    );
  };

  const addComment = (companyId, userId, userName, text) => {
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
  const getCommentsForCompany = (companyId) =>
    comments
      .filter((c) => c.companyId === companyId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const addUser = (userData) => {
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
      },
    ]);
  };
  const approveUser = (userId) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isApproved: true } : u)));
  };
  const blockUser = (userId, blocked) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBlocked: blocked } : u)));
  };
  const updateUser = (userId, updates) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  };
  const transferAdmin = (fromAdminId, toUserId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === fromAdminId) return { ...u, role: 'user' };
        if (u.id === toUserId) return { ...u, role: 'admin' };
        return u;
      })
    );
  };

  const value = {
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

export function useData() {
  return useContext(DataContext);
}
