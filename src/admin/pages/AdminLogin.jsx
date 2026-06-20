import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from '../../api/axios';

import {
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';


export default function AdminLogin() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');


  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        '/admin/login',
        {
          email,
          password
        }
      );

      localStorage.setItem(
        'admin',
        JSON.stringify(res.data.admin)
      );

      localStorage.setItem(
        'token',
        res.data.token
      );

      navigate('/admin/dashboard');

    } catch (err) {

      setError(
        err.response?.data?.msg ||
        'Đăng nhập thất bại'
      );

    }

  };


  return (

    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#020617,#0f172a)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        padding: '20px'
      }}
    >

      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#111827',
          borderRadius: '28px',
          padding: '40px',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.45)',
          border:
            '1px solid rgba(255,255,255,0.06)'
        }}
      >

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '24px',
            fontSize: '14px'
          }}
        >

          <ArrowLeft size={18} />

          Quay lại đăng nhập người dùng

        </button>


        {/* HEADER */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '35px'
          }}
        >

          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '22px',
              margin: '0 auto 18px',
              background:
                'linear-gradient(135deg,#2563eb,#60a5fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >

            <ShieldCheck
              size={34}
              color="#fff"
            />

          </div>

          <h1
            style={{
              color: '#fff',
              marginBottom: '8px',
              fontSize: '30px'
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '14px'
            }}
          >
            Hệ thống quản trị YN Banking
          </p>

        </div>


        {/* ERROR */}
        {
          error && (

            <div
              style={{
                background:
                  'rgba(220,38,38,0.15)',
                border:
                  '1px solid rgba(220,38,38,0.4)',
                color: '#fca5a5',
                padding: '14px',
                borderRadius: '14px',
                marginBottom: '20px',
                fontSize: '14px'
              }}
            >
              {error}
            </div>

          )
        }


        {/* FORM */}
        <form onSubmit={handleLogin}>

          <div
            style={{
              marginBottom: '18px'
            }}
          >

            <label
              style={{
                color: '#cbd5e1',
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px'
              }}
            >
              Email Admin
            </label>

            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={inputStyle}
            />

          </div>


          <div
            style={{
              marginBottom: '24px'
            }}
          >

            <label
              style={{
                color: '#cbd5e1',
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px'
              }}
            >
              Mật khẩu
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
            />

          </div>


          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '16px',
              border: 'none',
              background:
                'linear-gradient(135deg,#2563eb,#60a5fa)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Đăng nhập Admin
          </button>

        </form>

      </div>

    </div>

  );

}


// =========================
// STYLES
// =========================
const inputStyle = {

  width: '100%',

  padding: '14px',

  borderRadius: '14px',

  border:
    '1px solid rgba(255,255,255,0.08)',

  background: '#1f2937',

  color: '#fff',

  outline: 'none',

  fontSize: '15px',

  boxSizing: 'border-box'

};