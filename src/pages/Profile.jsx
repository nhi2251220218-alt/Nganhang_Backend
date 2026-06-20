import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    accountNumber: '',
    balance: 0,
  });

  const [pwForm, setPwForm] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const [showOld, setShowOld] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  useEffect(() => {
    axios
      .get('/user/profile')
      .then((r) => setProfile(r.data));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put('/user/profile', {
        fullName: profile.fullName,
        phone: profile.phone,
      });

      setMsg('Cập nhật thành công');
    } catch {
      setMsg('Cập nhật thất bại');
    }
  };

  const handleChangePassword = async (
    e
  ) => {
    e.preventDefault();

    try {
      await axios.put(
        '/user/change-password',
        pwForm
      );

      setPwMsg(
        'Đổi mật khẩu thành công'
      );

      setPwForm({
        oldPassword: '',
        newPassword: '',
      });
    } catch (err) {
      setPwMsg(
        err.response?.data?.msg ||
          'Đổi mật khẩu thất bại'
      );
    }
  };

  const INPUT = {
    width: '100%',
    padding: '16px 18px',
    background:
      'rgba(255,255,255,0.06)',
    border:
      '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'DM Sans,sans-serif',
    backdropFilter: 'blur(10px)',
  };

  const LABEL = {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '10px',
    display: 'block',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#06111F 0%,#091B32 45%,#040B16 100%)',
        padding: '26px',
        color: '#fff',
        fontFamily:
          'DM Sans,sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
        }}
      >
        {/* HEADER */}
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '26px',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}
  >
    <button
      onClick={() => navigate('/dashboard')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: 'none',
        padding: '12px 18px',
        borderRadius: '16px',
        cursor: 'pointer',
        color: '#fff',
        fontWeight: '700',
        background:
          'linear-gradient(135deg,#2563EB,#60A5FA)',
        boxShadow:
          '0 12px 30px rgba(37,99,235,.35)',
      }}
    >
      <ArrowLeft size={18} />
      Trang chủ
    </button>

    <div>
      <p
        style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '12px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        YN Banking Premium
      </p>

      <h1
        style={{
          margin: 0,
          fontSize: '36px',
          fontWeight: '800',
          letterSpacing: '-0.03em',
        }}
      >
        Hồ sơ tài khoản
      </h1>

      <p
        style={{
          color: 'rgba(255,255,255,0.45)',
          marginTop: '8px',
          fontSize: '14px',
        }}
      >
        Quản lý thông tin và bảo mật tài khoản
      </p>
    </div>
  </div>

  <div
    style={{
      width: '78px',
      height: '78px',
      borderRadius: '26px',
      background:
        'linear-gradient(135deg,#2563EB,#60A5FA)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow:
        '0 18px 40px rgba(37,99,235,0.35)',
    }}
  >
    <User size={34} />
  </div>
</div>

        {/* PREMIUM CARD */}
        <div
          style={{
            background:
              'linear-gradient(135deg,#1E293B,#0F172A)',
            borderRadius: '34px',
            padding: '28px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '24px',
            border:
              '1px solid rgba(255,255,255,0.08)',
            boxShadow:
              '0 25px 60px rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '-70px',
              top: '-70px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background:
                'rgba(96,165,250,0.12)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '10px',
                  marginBottom: '18px',
                }}
              >
                <Sparkles
                  size={20}
                  color="#FACC15"
                />

                <span
                  style={{
                    color: '#FACC15',
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing:
                      '0.08em',
                  }}
                >
                  PREMIUM MEMBER
                </span>
              </div>

              <h2
                style={{
                  margin:
                    '0 0 10px',
                  fontSize: '28px',
                  fontWeight: '800',
                }}
              >
                {profile.fullName ||
                  'Khách hàng'}
              </h2>

              <p
                style={{
                  margin:
                    '0 0 18px',
                  color:
                    'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                }}
              >
                {profile.email}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.06)',
                    border:
                      '1px solid rgba(255,255,255,0.08)',
                    borderRadius:
                      '16px',
                    padding:
                      '10px 16px',
                  }}
                >
                  <p
                    style={{
                      margin:
                        '0 0 5px',
                      color:
                        'rgba(255,255,255,0.45)',
                      fontSize:
                        '11px',
                    }}
                  >
                    Số tài khoản
                  </p>

                  <strong
                    style={{
                      fontSize:
                        '15px',
                    }}
                  >
                    {
                      profile.accountNumber
                    }
                  </strong>
                </div>

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.06)',
                    border:
                      '1px solid rgba(255,255,255,0.08)',
                    borderRadius:
                      '16px',
                    padding:
                      '10px 16px',
                  }}
                >
                  <p
                    style={{
                      margin:
                        '0 0 5px',
                      color:
                        'rgba(255,255,255,0.45)',
                      fontSize:
                        '11px',
                    }}
                  >
                    Số dư
                  </p>

                  <strong
                    style={{
                      fontSize:
                        '15px',
                      color:
                        '#34D399',
                    }}
                  >
                    {Number(
                      profile.balance || 0
                    ).toLocaleString(
                      'vi-VN'
                    )}{' '}
                    ₫
                  </strong>
                </div>
              </div>
            </div>

            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '34px',
                background:
                  'linear-gradient(135deg,#2563EB,#60A5FA)',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                boxShadow:
                  '0 18px 40px rgba(37,99,235,0.35)',
              }}
            >
              <Shield size={52} />
            </div>
          </div>
        </div>

        {/* GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
            gap: '24px',
          }}
        >
          {/* PROFILE */}
          <div
            style={{
              background:
                'rgba(255,255,255,0.05)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              borderRadius: '32px',
              padding: '28px',
              backdropFilter:
                'blur(16px)',
              boxShadow:
                '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '18px',
                  background:
                    'linear-gradient(135deg,#2563EB,#60A5FA)',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                }}
              >
                <User size={24} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: '700',
                  }}
                >
                  Thông tin cá nhân
                </h2>

                <p
                  style={{
                    marginTop: '5px',
                    color:
                      'rgba(255,255,255,0.45)',
                    fontSize: '13px',
                  }}
                >
                  Cập nhật hồ sơ
                </p>
              </div>
            </div>

            <form
              onSubmit={handleUpdate}
            >
              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label style={LABEL}>
                  Họ và tên
                </label>

                <div
                  style={{
                    position:
                      'relative',
                  }}
                >
                  <User
                    size={18}
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '16px',
                      color:
                        'rgba(255,255,255,0.4)',
                    }}
                  />

                  <input
                    style={{
                      ...INPUT,
                      paddingLeft:
                        '48px',
                    }}
                    value={
                      profile.fullName
                    }
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        fullName:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label style={LABEL}>
                  Email
                </label>

                <div
                  style={{
                    position:
                      'relative',
                  }}
                >
                  <Mail
                    size={18}
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '16px',
                      color:
                        'rgba(255,255,255,0.4)',
                    }}
                  />

                  <input
                    disabled
                    style={{
                      ...INPUT,
                      paddingLeft:
                        '48px',
                      opacity: 0.7,
                    }}
                    value={
                      profile.email
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom: '24px',
                }}
              >
                <label style={LABEL}>
                  Số điện thoại
                </label>

                <div
                  style={{
                    position:
                      'relative',
                  }}
                >
                  <Phone
                    size={18}
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '16px',
                      color:
                        'rgba(255,255,255,0.4)',
                    }}
                  />

                  <input
                    style={{
                      ...INPUT,
                      paddingLeft:
                        '48px',
                    }}
                    value={
                      profile.phone ||
                      ''
                    }
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '56px',
                  border: 'none',
                  borderRadius:
                    '18px',
                  background:
                    'linear-gradient(135deg,#2563EB,#60A5FA)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow:
                    '0 14px 35px rgba(37,99,235,0.35)',
                }}
              >
                Lưu thay đổi
              </button>

              {msg && (
                <div
                  style={{
                    marginTop: '18px',
                    padding:
                      '14px 16px',
                    borderRadius:
                      '16px',
                    background:
                      'rgba(52,211,153,0.12)',
                    border:
                      '1px solid rgba(52,211,153,0.2)',
                    color:
                      '#34D399',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '10px',
                  }}
                >
                  <CheckCircle2
                    size={18}
                  />
                  {msg}
                </div>
              )}
            </form>
          </div>

          {/* PASSWORD */}
          <div
            style={{
              background:
                'rgba(255,255,255,0.05)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              borderRadius: '32px',
              padding: '28px',
              backdropFilter:
                'blur(16px)',
              boxShadow:
                '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '18px',
                  background:
                    'linear-gradient(135deg,#EF4444,#F87171)',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                }}
              >
                <Lock size={24} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: '700',
                  }}
                >
                  Bảo mật tài khoản
                </h2>

                <p
                  style={{
                    marginTop: '5px',
                    color:
                      'rgba(255,255,255,0.45)',
                    fontSize: '13px',
                  }}
                >
                  Đổi mật khẩu bảo vệ
                  tài khoản
                </p>
              </div>
            </div>

            <form
              onSubmit={
                handleChangePassword
              }
            >
              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label style={LABEL}>
                  Mật khẩu cũ
                </label>

                <div
                  style={{
                    position:
                      'relative',
                  }}
                >
                  <Lock
                    size={18}
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '16px',
                      color:
                        'rgba(255,255,255,0.4)',
                    }}
                  />

                  <input
                    type={
                      showOld
                        ? 'text'
                        : 'password'
                    }
                    style={{
                      ...INPUT,
                      paddingLeft:
                        '48px',
                      paddingRight:
                        '50px',
                    }}
                    value={
                      pwForm.oldPassword
                    }
                    onChange={(e) =>
                      setPwForm({
                        ...pwForm,
                        oldPassword:
                          e.target.value,
                      })
                    }
                  />

                  <div
                    onClick={() =>
                      setShowOld(
                        !showOld
                      )
                    }
                    style={{
                      position:
                        'absolute',
                      top: '17px',
                      right: '16px',
                      cursor:
                        'pointer',
                      color:
                        'rgba(255,255,255,0.5)',
                    }}
                  >
                    {showOld ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye size={18} />
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: '24px',
                }}
              >
                <label style={LABEL}>
                  Mật khẩu mới
                </label>

                <div
                  style={{
                    position:
                      'relative',
                  }}
                >
                  <Lock
                    size={18}
                    style={{
                      position:
                        'absolute',
                      top: '18px',
                      left: '16px',
                      color:
                        'rgba(255,255,255,0.4)',
                    }}
                  />

                  <input
                    type={
                      showNew
                        ? 'text'
                        : 'password'
                    }
                    style={{
                      ...INPUT,
                      paddingLeft:
                        '48px',
                      paddingRight:
                        '50px',
                    }}
                    value={
                      pwForm.newPassword
                    }
                    onChange={(e) =>
                      setPwForm({
                        ...pwForm,
                        newPassword:
                          e.target.value,
                      })
                    }
                  />

                  <div
                    onClick={() =>
                      setShowNew(
                        !showNew
                      )
                    }
                    style={{
                      position:
                        'absolute',
                      top: '17px',
                      right: '16px',
                      cursor:
                        'pointer',
                      color:
                        'rgba(255,255,255,0.5)',
                    }}
                  >
                    {showNew ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye size={18} />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '56px',
                  border: 'none',
                  borderRadius:
                    '18px',
                  background:
                    'linear-gradient(135deg,#EF4444,#F87171)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow:
                    '0 14px 35px rgba(239,68,68,0.35)',
                }}
              >
                Đổi mật khẩu
              </button>

              {pwMsg && (
                <div
                  style={{
                    marginTop: '18px',
                    padding:
                      '14px 16px',
                    borderRadius:
                      '16px',
                    background:
                      'rgba(239,68,68,0.12)',
                    border:
                      '1px solid rgba(239,68,68,0.2)',
                    color:
                      '#F87171',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {pwMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}