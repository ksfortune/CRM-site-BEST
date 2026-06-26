import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function NavBar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;

  const getInitials = () => {
    return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
  };

  const isProfilePage = location.pathname === '/profile';
  const profileLink = isProfilePage ? '/companies' : '/profile';

  return (
    <nav className="compact-nav">
      <div className="nav-user">
        <Link to={profileLink} className="user-plate">
          <span className="user-avatar-small">{getInitials() || '👤'}</span>
          <span className="user-name-small">{currentUser.firstName}</span>
        </Link>
       
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
        <Route path="/register" element={<Register />} />
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