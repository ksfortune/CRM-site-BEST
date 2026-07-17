import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function CommentSection({ companyId, comments, occupiedBy }) {
  const { currentUser } = useAuth();
  const { addComment } = useData();
  const [text, setText] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const canComment = isAdmin || occupiedBy === currentUser?.id;

  const handleSubmit = () => {
    if (!canComment) {
      alert('Вы можете комментировать только занятые вами компании');
      return;
    }
    if (text.trim()) {
      addComment(
        companyId,
        currentUser.id,
        `${currentUser.firstName} ${currentUser.lastName}`,
        text
      );
      setText('');
    }
  };

  return (
    <div className="comments">
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <b>{c.userName}</b> ({new Date(c.createdAt).toLocaleString()}):
            <br />
            {c.text}
          </li>
        ))}
      </ul>
      {canComment ? (
        <>
          <textarea
            rows="2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать комментарий..."
          />
          <button type="button" onClick={handleSubmit}>
            Добавить
          </button>
        </>
      ) : (
        <div className="comments-hint">
          {occupiedBy
            ? 'Компания занята другим пользователем'
            : 'Компания свободна — займите, чтобы комментировать'}
        </div>
      )}
    </div>
  );
}
