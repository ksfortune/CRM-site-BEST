import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function NavBar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const getInitials = () => {
    return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
  };

  const isProfilePage = location.pathname === '/profile';
  const profileLink = isProfilePage ? '/companies' : '/profile';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const chipLabel = isProfilePage ? 'Компании' : 'Профиль';

  return (
    <header className="topbar">
      <Link to="/companies" className="brand">Теплые контакты</Link>
      <div className="topbar-side">
        {currentUser.role === 'admin' && location.pathname !== '/admin' && (
          <Link to="/admin" className="nav-admin-link">Отдел</Link>
        )}
        <Link to={profileLink} className="profile-chip">
          <span className="chip-avatar">{getInitials() || 'К'}</span>
          <span>{chipLabel}</span>
        </Link>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
