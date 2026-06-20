import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth
} from './context/AuthContext';

import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';

import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';

// Helper lấy admin an toàn
const getAdmin = () => {
  try {
    const raw = localStorage.getItem('admin');

    if (!raw || raw === 'undefined')
      return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// USER Protected Route
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  return user
    ? children
    : <Navigate to="/login" />;
};

// ADMIN Protected Route
const AdminProtectedRoute = ({ children }) => {
  const admin = getAdmin();

  return admin
    ? children
    : <Navigate to="/admin/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  // Chỉ ẩn navbar ở trang admin
  const isAdminPage =
    location.pathname.startsWith('/admin');

  return (
    <>
      {user && !isAdminPage && <Navbar />}

      <Routes>

        {/* USER */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route
          path="*"
          element={<Navigate to="/login" />}
        />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}