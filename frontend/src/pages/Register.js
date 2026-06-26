import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { addUser } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bestEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Введите имя';
    if (!form.lastName.trim()) newErrors.lastName = 'Введите фамилию';
    if (!form.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!form.password) {
      newErrors.password = 'Введите пароль';
    } else if (form.password.length < 4) {
      newErrors.password = 'Пароль должен быть не менее 4 символов';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    
    try {
      await addUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        bestEmail: form.bestEmail || form.email,
        password: form.password,
        socials: [],
        role: 'user',
        isApproved: false,
        isBlocked: false
      });
      setSuccessMessage('Регистрация отправлена! Администратор подтвердит её в ближайшее время.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.message || 'Ошибка регистрации' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">📝</div>
          <h2>Регистрация</h2>
          <p>Создайте аккаунт для работы с контактами</p>
        </div>
        
        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Имя *</label>
              <input
                type="text"
                placeholder="Иван"
                value={form.firstName}
                onChange={e => setForm({...form, firstName: e.target.value})}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Фамилия *</label>
              <input
                type="text"
                placeholder="Иванов"
                value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Email (логин) *</label>
            <input
              type="email"
              placeholder="ivan@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Лучшая почта (опционально)</label>
            <input
              type="email"
              placeholder="ivan@bestmail.com"
              value={form.bestEmail}
              onChange={e => setForm({...form, bestEmail: e.target.value})}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Пароль *</label>
              <input
                type="password"
                placeholder="Минимум 4 символа"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Подтвердите пароль *</label>
              <input
                type="password"
                placeholder="Повторите пароль"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          {errors.submit && <div className="auth-error">{errors.submit}</div>}
          
          <button type="submit" disabled={isSubmitting} className="auth-button">
            {isSubmitting ? 'Отправка...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}