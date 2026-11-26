import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import type { Comment } from '../types';

interface CommentSectionProps {
  companyId: string;
  comments: Comment[];
  occupiedBy: string | null;
}

export default function CommentSection({ companyId, comments, occupiedBy }: CommentSectionProps) {
  const { currentUser } = useAuth();
  const { addComment } = useData();
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const canComment = Boolean(currentUser && (isAdmin || occupiedBy === currentUser.id));

  const handleSubmit = () => {
    if (!currentUser || !canComment) return;
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
      {comments.length === 0 && <p className="empty-message">Комментариев пока нет.</p>}
      {comments.map((c) => (
        <article key={c.id} className="comment-card">
          <header className="comment-head">
            <strong>{c.userName}</strong>
            <time dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleString('ru-RU')}</time>
          </header>
          <p className="comment-text">{c.text}</p>
        </article>
      ))}
      {canComment ? (
        composing ? (
          <div className="comment-compose">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Напишите комментарий"
              aria-label="Текст комментария"
              autoFocus
            />
            <div className="compose-actions">
              <button type="button" className="btn-primary" onClick={handleSubmit} disabled={!text.trim()}>
                Сохранить
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setText('');
                  setComposing(false);
                }}
              >
                Отмена
              </button>
            </div>
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
