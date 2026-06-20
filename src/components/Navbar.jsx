import {
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {

  const {
    user,
    logout
  } = useAuth();

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const link = (to, label) => {
    const active = pathname === to;

    return (
      <Link
        to={to}
        style={{
          color: active
            ? '#C9A84C'
            : 'rgba(255,255,255,0.65)',
          textDecoration: 'none',
          fontSize: '14px',
          borderBottom: active
            ? '2px solid #C9A84C'
            : '2px solid transparent',
          paddingBottom: '4px',
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      style={{
        background:
          'linear-gradient(135deg,#0A1628 0%,#1A3A5C 100%)',
        borderBottom:
          '1px solid rgba(201,168,76,0.25)',
        padding: '0 40px',
        height: '66px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >

      {/* LOGO */}
      <Link
        to="/dashboard"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background:
              'linear-gradient(135deg,#C9A84C,#E8C97A)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            fontWeight: '700',
            color: '#0A1628',
          }}
        >
          V
        </div>

        <div>
          <div
            style={{
              color: '#fff',
              fontSize: '17px',
              fontWeight: '700',
              lineHeight: 1
            }}
          >
            YN Banking
          </div>

          <div
            style={{
              color: '#C9A84C',
              fontSize: '9px',
              letterSpacing: '0.14em'
            }}
          >
            SIMULATOR
          </div>
        </div>
      </Link>

      {/* MENU */}
      {user && (
        <div
          style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center'
          }}
        >
          {link('/dashboard', 'Tổng quan')}

          {link('/deposit', ' Nạp tiền')}

          {link('/transfer', 'Chuyển tiền')}

          {link('/history', 'Lịch sử')}

          {link('/profile', 'Tài khoản')}

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.35)',
              color: '#C9A84C',
              padding: '7px 18px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Đăng xuất
          </button>

        </div>
      )}

    </nav>
  );
}