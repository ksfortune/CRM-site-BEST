import { useState, type FormEvent } from 'react';
import { useData } from '../contexts/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import { logHandledError } from '../utils/errors';

interface RegisterForm {
  fullName: string;
  email: string;
  bestEmail: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const { addUser } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    bestEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Введите ФИО';
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        fullName: form.fullName.trim(),
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
      logHandledError(err, 'Registration rejected');
      setErrors({ submit: err instanceof Error ? err.message : 'Ошибка регистрации' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h2>Регистрация</h2>
          <p>Создайте аккаунт для работы с контактами</p>
        </div>
        
        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>ФИО *</label>
            <input
              type="text"
              placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
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
