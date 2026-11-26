import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ErrorToastProvider } from './contexts/ErrorToastContext';
import PrivateRoute from './components/PrivateRoute';
import AppVersion from './components/AppVersion';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import { getInitials } from './utils/names';

function NavBar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = (path: string) =>
    `nav-link${location.pathname.startsWith(path) ? ' active' : ''}`;
  const navCurrent = (path: string) => (location.pathname.startsWith(path) ? 'page' : undefined);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/companies" className="brand">Теплые контакты</Link>
        <nav className="topbar-nav" aria-label="Основная навигация">
          <Link to="/companies" className={navClass('/companies')} aria-current={navCurrent('/companies')}>
            Компании
          </Link>
          {currentUser.role === 'admin' && (
            <Link to="/admin" className={navClass('/admin')} aria-current={navCurrent('/admin')}>
              Отдел
            </Link>
          )}
        </nav>
        <div className="topbar-side">
          <Link
            to="/profile"
            className={`user-chip${location.pathname.startsWith('/profile') ? ' active' : ''}`}
            aria-current={navCurrent('/profile')}
            aria-label="Открыть профиль"
            title="Открыть профиль"
          >
            <span className="chip-avatar" aria-hidden="true">{getInitials(currentUser.fullName) || 'К'}</span>
            <span className="user-chip-name">{currentUser.fullName}</span>
          </Link>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const { loading } = useAuth();
  if (loading) return <div className="loading-screen">Загрузка...</div>;
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/companies" />} />
      </Routes>
      <AppVersion />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorToastProvider>
        <ErrorBoundary>
          <DataProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </DataProvider>
        </ErrorBoundary>
      </ErrorToastProvider>
    </BrowserRouter>
  );
}

export default App;
