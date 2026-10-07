import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function CommentSection({ companyId, comments, occupiedBy }) {
  const { currentUser } = useAuth();
  const { addComment } = useData();
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);

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
      setComposing(false);
    }
  };

  return (
    <div className="comments">
      {comments.map((c) => (
        <article key={c.id} className="comment-card">
          <h5>Комментарий</h5>
          <p className="comment-text">{c.text}</p>
          <p className="comment-meta">
            Дата: {new Date(c.createdAt).toLocaleString('ru-RU')}
            <br />
            Создатель: {c.userName}
          </p>
        </article>
      ))}
      {canComment ? (
        composing ? (
          <div className="comment-compose">
            <textarea
              rows="3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Комментарий"
              autoFocus
            />
            <button type="button" className="text-action" onClick={handleSubmit}>
              Сохранить
            </button>
          </div>
        ) : (
          <button type="button" className="add-comment" onClick={() => setComposing(true)}>
            Добавить комментарий
          </button>
        )
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
