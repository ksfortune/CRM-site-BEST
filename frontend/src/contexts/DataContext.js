import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid'; // добавить зависимость

const DataContext = createContext();

const STORAGE_KEYS = {
  USERS: 'warmcontacts_users',
  COMPANIES: 'warmcontacts_companies',
  COMMENTS: 'warmcontacts_comments',
  REQUESTS: 'warmcontacts_requests'
};

export function DataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [comments, setComments] = useState([]);
  const [requests, setRequests] = useState([]);

  // Загрузка из localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedCompanies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    const storedComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const storedRequests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
    if (storedComments) setComments(JSON.parse(storedComments));
    if (storedRequests) setRequests(JSON.parse(storedRequests));
  }, []);

  // Сохранение при изменении
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

  // ---- Вспомогательные функции ----
  const findUserById = (id) => users.find(u => u.id === id);

  // ---- Управление компаниями через запросы для не-админов ----
  const requestCompanyChange = (type, data, currentUser) => {
    const newRequest = {
      id: uuid(),
      type,
      companyId: data.id || null,
      targetCompany: type === 'delete' ? null : data,
      requestedBy: currentUser.id,
      requestedByName: `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setRequests(prev => [...prev, newRequest]);
    return newRequest;
  };


const createUserByAdmin = (userData) => {
  const newUser = {
    ...userData,
    id: uuid(),
    isBlocked: false,
    isApproved: true,
    role: userData.role || 'user',
    createdAt: new Date().toISOString()
  };
  setUsers(prev => [...prev, newUser]);
  return newUser;
};



  // Выполнить запрос (только админ)
  const approveRequest = (requestId, adminUser) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return false;
    if (request.type === 'create') {
      const newCompany = { ...request.targetCompany, id: uuid(), createdBy: adminUser.id, updatedBy: adminUser.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setCompanies(prev => [...prev, newCompany]);
    } else if (request.type === 'update') {
      setCompanies(prev => prev.map(c => c.id === request.companyId ? { ...request.targetCompany, updatedBy: adminUser.id, updatedAt: new Date().toISOString() } : c));
    } else if (request.type === 'delete') {
      setCompanies(prev => prev.filter(c => c.id !== request.companyId));
    }
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
    return true;
  };

  const rejectRequest = (requestId) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
  };

  // Прямое изменение админом (без запроса)
  const directCompanyUpdate = (companyData, adminUser, isDelete = false) => {
    if (isDelete) {
      setCompanies(prev => prev.filter(c => c.id !== companyData.id));
    } else {
      if (companies.find(c => c.id === companyData.id)) {
        setCompanies(prev => prev.map(c => c.id === companyData.id ? { ...companyData, updatedBy: adminUser.id, updatedAt: new Date().toISOString() } : c));
      } else {
        setCompanies(prev => [...prev, { ...companyData, id: uuid(), createdBy: adminUser.id, updatedBy: adminUser.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      }
    }
  };

  // Занять / освободить компанию
  const occupyCompany = (companyId, userId, userName) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, occupiedBy: userId, occupiedByName: userName } : c));
  };
  const releaseCompany = (companyId) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, occupiedBy: null, occupiedByName: null } : c));
  };

  // Комментарии
  const addComment = (companyId, userId, userName, text) => {
    const newComment = {
      id: uuid(),
      companyId,
      userId,
      userName,
      text,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };
  const getCommentsForCompany = (companyId) => comments.filter(c => c.companyId === companyId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Пользователи
  const addUser = (userData) => {
    setUsers(prev => [...prev, { ...userData, id: uuid(), isBlocked: false, isApproved: false, role: 'user', createdAt: new Date().toISOString() }]);
  };
  const approveUser = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
  };
  const blockUser = (userId, blocked) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: blocked } : u));
  };
  const updateUser = (userId, updates) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };
  const transferAdmin = (fromAdminId, toUserId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === fromAdminId) return { ...u, role: 'user' };
      if (u.id === toUserId) return { ...u, role: 'admin' };
      return u;
    }));
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
  createUserByAdmin,   // <-- добавьте эту строку
};

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() { return useContext(DataContext); }