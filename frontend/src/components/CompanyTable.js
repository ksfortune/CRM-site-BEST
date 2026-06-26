import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import CommentSection from './CommentSection';

export default function CompanyTable({ companies, onRefresh }) {
  const { currentUser } = useAuth();
  const { occupyCompany, releaseCompany, requestCompanyChange, directCompanyUpdate, getCommentsForCompany } = useData();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleOccupy = (company) => {
    if (company.occupiedBy && company.occupiedBy !== currentUser.id) return alert(`Занято пользователем ${company.occupiedByName}`);
    if (company.occupiedBy === currentUser.id) releaseCompany(company.id);
    else occupyCompany(company.id, currentUser.id, `${currentUser.firstName} ${currentUser.lastName}`);
    onRefresh();
  };

  const handleEdit = (company) => {
    if (currentUser.role === 'admin') {
      setEditingId(company.id);
      setEditForm(company);
    } else {
      requestCompanyChange('update', company, currentUser);
      alert('Запрос на изменение отправлен администратору');
    }
  };

  const handleDelete = (company) => {
    if (window.confirm('Удалить компанию?')) {
      if (currentUser.role === 'admin') directCompanyUpdate(company, currentUser, true);
      else requestCompanyChange('delete', company, currentUser);
      onRefresh();
    }
  };

  const saveEdit = () => {
    directCompanyUpdate(editForm, currentUser);
    setEditingId(null);
    onRefresh();
  };

  return (
    <div className="table-container">
      <table>
        <thead><tr><th>Название</th><th>Сфера</th><th>Представитель</th><th>Статус</th><th>Занятость</th><th>Действия</th><th>Комментарии</th></tr></thead>
        <tbody>
          {companies.map(c => (
            <React.Fragment key={c.id}>
              <tr className={c.occupiedBy ? 'occupied-row' : ''}>
                {editingId === c.id ? (
                  <>
                    <td><input value={editForm.name} onChange={e => setEditForm({...editForm, name:e.target.value})} /></td>
                    <td><input value={editForm.industry} onChange={e => setEditForm({...editForm, industry:e.target.value})} /></td>
                    <td><input value={editForm.repName} onChange={e => setEditForm({...editForm, repName:e.target.value})} /></td>
                    <td><select value={editForm.status} onChange={e => setEditForm({...editForm, status:e.target.value})}><option value="hot">Горячий</option><option value="warm">Тёплый</option></select></td>
                    <td>{c.occupiedByName || 'Свободна'}</td>
                    <td><button onClick={saveEdit}>💾</button><button onClick={() => setEditingId(null)}>❌</button></td>
                  </>
                ) : (
                  <>
                    <td>{c.name}</td><td>{c.industry}</td><td>{c.repName}</td>
                    <td><span className={`status-badge ${c.status}`}>{c.status === 'hot' ? 'Горячий' : 'Тёплый'}</span></td>
                    <td>{c.occupiedByName ? <strong>{c.occupiedByName}</strong> : 'Свободна'}</td>
                    <td>
                      <button onClick={() => handleEdit(c)}>✏️</button>
                      <button onClick={() => handleDelete(c)}>🗑️</button>
                      <button onClick={() => handleOccupy(c)}>{c.occupiedBy === currentUser.id ? 'Освободить' : 'Занять'}</button>
                    </td>
                  </>
                )}
                <td><CommentSection 
  companyId={c.id} 
  comments={getCommentsForCompany(c.id)} 
  occupiedBy={c.occupiedBy}
/></td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}