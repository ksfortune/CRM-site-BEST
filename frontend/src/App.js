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

  return (
    <nav className="compact-nav">
      <div className="nav-user">
        {currentUser.role === 'admin' && (
          <Link to="/admin" className="nav-admin-link">
            Админ
          </Link>
        )}
        <Link to={profileLink} className="user-plate">
          <span className="user-avatar-small">{getInitials() || '👤'}</span>
          <span className="user-name-small">{currentUser.firstName}</span>
        </Link>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </nav>
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
