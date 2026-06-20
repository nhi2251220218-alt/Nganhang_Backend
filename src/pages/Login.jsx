import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Landmark, LockKeyhole, Mail, Eye, EyeOff, UserCog, Users, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

/* ─── Keyframe injector ─── */
const injectStyles = () => {
  if (document.getElementById('yn-login-styles')) return;
  const style = document.createElement('style');
  style.id = 'yn-login-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    * { box-sizing: border-box; }

    @keyframes floatOrb {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-30px) scale(1.04); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0px rgba(201,168,76,0.35); }
      70%  { box-shadow: 0 0 0 14px rgba(201,168,76,0); }
      100% { box-shadow: 0 0 0 0px rgba(201,168,76,0); }
    }
    @keyframes lineGrow {
      from { width: 0; }
      to   { width: 48px; }
    }
    @keyframes gridFade {
      from { opacity: 0; }
      to   { opacity: 0.04; }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes counterSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(-360deg); }
    }

    .yn-page       { animation: fadeUp 0.8s ease both; }
    .yn-left-inner { animation: fadeUp 0.9s 0.1s ease both; }
    .yn-form-box   { animation: fadeUp 0.9s 0.2s ease both; }

    .yn-btn:hover  { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(201,168,76,0.35) !important; }
    .yn-btn:active { transform: translateY(0px); }

    .yn-input-wrap input:focus {
      border-color: rgba(201,168,76,0.6) !important;
      background: rgba(255,255,255,0.06) !important;
      box-shadow: 0 0 0 4px rgba(201,168,76,0.08);
    }

    .yn-type-btn:hover { opacity: 0.85; }

    .yn-link { color: #C9A84C; text-decoration: none; font-weight: 500; }
    .yn-link:hover { text-decoration: underline; }

    .orb1 { animation: floatOrb 10s ease-in-out infinite; }
    .orb2 { animation: floatOrb 14s ease-in-out infinite reverse; }
    .orb3 { animation: floatOrb 18s ease-in-out infinite 4s; }

    .shimmer-text {
      background: linear-gradient(90deg, #C9A84C, #E8C97A, #fff, #E8C97A, #C9A84C);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 5s linear infinite;
    }

    .accent-line {
      display: block;
      height: 2px;
      background: linear-gradient(90deg, #C9A84C, transparent);
      animation: lineGrow 1s 0.6s ease both;
    }

    .logo-ring {
      animation: pulse-ring 2.5s ease-out infinite;
    }

    .grid-bg {
      animation: gridFade 1.5s ease both;
    }

    .stat-card {
      transition: transform 0.25s ease, background 0.25s ease;
    }
    .stat-card:hover {
      transform: translateY(-3px);
      background: rgba(255,255,255,0.06) !important;
    }

    .ring-outer { animation: spin-slow 20s linear infinite; }
    .ring-inner { animation: counterSpin 15s linear infinite; }

    .close-btn:hover { background: rgba(239,68,68,0.2) !important; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
  `;
  document.head.appendChild(style);
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('user');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      if (type === 'admin') {
        const res = await axios.post('http://localhost:5000/api/admin/login', { email, password });
        localStorage.setItem('admin', JSON.stringify(res.data.admin));
        localStorage.setItem('token', res.data.token);
        navigate('/admin/dashboard');
        return;
      }
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Đăng nhập thất bại';
      if (err.response?.status === 403) setShowBlockedModal(true);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="yn-page" style={styles.page}>

      {/* ── Background orbs ── */}
      <div className="orb1" style={styles.orb1} />
      <div className="orb2" style={styles.orb2} />
      <div className="orb3" style={styles.orb3} />

      {/* ── Grid overlay ── */}
      <div className="grid-bg" style={styles.grid} />

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="yn-left-inner" style={styles.left}>

        {/* Logo */}
        <div style={styles.logoRow}>
          <div className="logo-ring" style={styles.logoRing}>
            <div style={styles.logoBox}>
              <Landmark size={28} color="#071C33" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <div style={styles.logoName}>YN Banking</div>
            <div style={styles.logoSub}>DIGITAL BANKING PLATFORM</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginTop: 56 }}>
          <p style={styles.eyebrow}>Since 2024 · Ho Chi Minh City</p>
          <h1 style={styles.headline}>
            <span className="shimmer-text">Ngân hàng số</span>
            <br />
            <span style={{ color: '#fff', fontWeight: 300 }}>hiện đại &</span>
            <br />
            <em style={{ color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', fontWeight: 300 }}>bảo mật tuyệt đối</em>
          </h1>
          <span className="accent-line" style={{ marginTop: 20 }} />
        </div>

        {/* Description */}
        <p style={styles.desc}>
          Trải nghiệm hệ thống Internet Banking với giao diện cao cấp,
          chuyển tiền tức thì và quản lý tài khoản thông minh — mọi lúc,
          mọi nơi.
        </p>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { icon: <Shield size={16} />, value: '256-bit', label: 'Mã hoá SSL' },
            { icon: <Zap size={16} />, value: '<1s', label: 'Chuyển tiền' },
            { icon: <Globe size={16} />, value: '24/7', label: 'Hỗ trợ' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={styles.statCard}>
              <div style={styles.statIcon}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Decorative ring */}
        <div style={styles.ringWrap}>
          <svg className="ring-outer" width="160" height="160" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="72" stroke="rgba(201,168,76,0.12)" strokeWidth="1" strokeDasharray="6 10" />
          </svg>
          <svg className="ring-inner" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="rgba(201,168,76,0.2)" strokeWidth="1" strokeDasharray="3 8" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A84C', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Trusted</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>& Secured</div>
          </div>
        </div>

      </div>

      {/* ══════════ RIGHT FORM ══════════ */}
      <div className="yn-form-box" style={styles.formWrap}>

        {/* Form card */}
        <div style={styles.formCard}>

          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formHeaderLine} />
            <span style={styles.formHeaderText}>Đăng nhập</span>
          </div>
          <p style={styles.formSub}>Chào mừng trở lại. Vui lòng nhập thông tin của bạn.</p>

          {/* Error */}
          {error && !showBlockedModal && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 16 }}>⚠</span> {error}
            </div>
          )}

          {/* Type selector */}
          <div style={styles.typeRow}>
            {[
              { value: 'user', label: 'Khách hàng', icon: <Users size={15} /> },
              { value: 'admin', label: 'Quản trị viên', icon: <UserCog size={15} /> },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                className="yn-type-btn"
                onClick={() => setType(t.value)}
                style={type === t.value
                  ? (t.value === 'user' ? styles.typeActive : styles.typeActiveGold)
                  : styles.typeInactive
                }
              >
                {t.icon}
                <span>{t.label}</span>
                {type === t.value && <div style={styles.typeDot} />}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>thông tin đăng nhập</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Email */}
          <div className="yn-input-wrap" style={styles.fieldWrap}>
            <label style={styles.label}>Địa chỉ Email</label>
            <div style={styles.inputBox}>
              <Mail size={16} style={styles.icoLeft} />
              <input
                style={styles.input}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="yn-input-wrap" style={styles.fieldWrap}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.inputBox}>
              <LockKeyhole size={16} style={styles.icoLeft} />
              <input
                style={{ ...styles.input, paddingRight: 44 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="yn-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ opacity: 0.8 }}>Đang xử lý...</span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Footer link */}
          <p style={styles.footerText}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="yn-link">Đăng ký ngay</Link>
          </p>

        </div>

        {/* Decorative corner label */}
        <div style={styles.cornerLabel}>YN · {new Date().getFullYear()}</div>

      </div>

      {/* ══════════ BLOCKED MODAL ══════════ */}
      {showBlockedModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🚫</div>
            <h3 style={styles.modalTitle}>Tài khoản bị khoá</h3>
            <div style={styles.modalDivider} />
            <p style={styles.modalBody}>
              Tài khoản của bạn đã bị khoá bởi quản trị viên.
              Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.
            </p>
            <button className="close-btn" onClick={() => setShowBlockedModal(false)} style={styles.modalBtn}>
              Đã hiểu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────── STYLES ─────────────────────────────── */

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse 80% 80% at 50% -20%, #0D2240, #04101F 60%, #020B16)',
    fontFamily: "'DM Sans', sans-serif",
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden',
    gap: 0,
  },

  /* Orbs */
  orb1: {
    position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
    width: 600, height: 600,
    background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
    top: -200, right: -100,
  },
  orb2: {
    position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
    width: 500, height: 500,
    background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
    bottom: -200, left: -100,
  },
  orb3: {
    position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
    width: 300, height: 300,
    background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
    top: '40%', left: '35%',
  },

  /* Grid */
  grid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
  },

  /* ── Left ── */
  left: {
    flex: '0 0 auto',
    width: 460,
    paddingRight: 64,
    zIndex: 2,
    position: 'relative',
  },

  logoRow: { display: 'flex', alignItems: 'center', gap: 18 },
  logoRing: {
    borderRadius: '50%', padding: 4,
    background: 'transparent',
    display: 'flex',
  },
  logoBox: {
    width: 64, height: 64, borderRadius: 20,
    background: 'linear-gradient(135deg,#C9A84C,#F0D98A)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 12px 36px rgba(201,168,76,0.3)',
  },
  logoName: {
    fontFamily: "'Cormorant Garamond', serif",
    color: '#fff', fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1,
  },
  logoSub: {
    color: 'rgba(255,255,255,0.3)', fontSize: 9.5, letterSpacing: '0.22em',
    marginTop: 4, fontFamily: "'DM Sans', sans-serif",
  },

  eyebrow: {
    color: '#C9A84C', fontSize: 11, letterSpacing: '0.18em',
    textTransform: 'uppercase', marginBottom: 16, fontWeight: 500,
  },
  headline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 58, lineHeight: 1.08, margin: 0, fontWeight: 700,
  },

  desc: {
    color: 'rgba(255,255,255,0.45)', fontSize: 15,
    lineHeight: 1.85, maxWidth: 400, marginTop: 28,
  },

  statsRow: {
    display: 'flex', gap: 14, marginTop: 40,
  },
  statCard: {
    flex: 1,
    padding: '18px 14px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
  },
  statIcon: {
    color: '#C9A84C', display: 'flex', justifyContent: 'center',
    marginBottom: 8, opacity: 0.8,
  },

  ringWrap: {
    position: 'absolute', bottom: -40, right: -20,
    width: 160, height: 160,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0.7, pointerEvents: 'none',
  },

  /* ── Right / Form ── */
  formWrap: {
    zIndex: 2, position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
  },

  formCard: {
    width: 420,
    padding: '44px 40px',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    backdropFilter: 'blur(30px)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
  },

  formHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 },
  formHeaderLine: { width: 4, height: 28, background: 'linear-gradient(#C9A84C,#F0D98A)', borderRadius: 2 },
  formHeaderText: {
    fontFamily: "'Cormorant Garamond', serif",
    color: '#fff', fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em',
  },
  formSub: { color: 'rgba(255,255,255,0.38)', fontSize: 13.5, marginBottom: 28, lineHeight: 1.5 },

  /* Type selector */
  typeRow: { display: 'flex', gap: 10, marginBottom: 24 },
  typeInactive: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.45)', fontSize: 13.5, fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s', position: 'relative',
  },
  typeActive: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
    background: 'rgba(37,99,235,0.15)',
    border: '1px solid rgba(96,165,250,0.4)',
    color: '#93c5fd', fontSize: 13.5, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s', position: 'relative',
    boxShadow: '0 0 20px rgba(37,99,235,0.12)',
  },
  typeActiveGold: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '11px 14px', borderRadius: 14, cursor: 'pointer',
    background: 'rgba(201,168,76,0.1)',
    border: '1px solid rgba(201,168,76,0.4)',
    color: '#E8C97A', fontSize: 13.5, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s', position: 'relative',
    boxShadow: '0 0 20px rgba(201,168,76,0.1)',
  },
  typeDot: {
    position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
    width: 4, height: 4, borderRadius: '50%', background: 'currentColor',
  },

  /* Divider */
  divider: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' },
  dividerText: {
    fontSize: 10.5, color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
  },

  /* Fields */
  fieldWrap: { marginBottom: 18 },
  label: {
    display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
  },
  inputBox: { position: 'relative' },
  input: {
    width: '100%', padding: '13px 14px 13px 42px',
    borderRadius: 13, outline: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#fff', fontSize: 14.5,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
    letterSpacing: '0.01em',
  },
  icoLeft: {
    position: 'absolute', left: 13, top: '50%',
    transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.3)', padding: 4, lineHeight: 0,
    transition: 'color 0.2s',
  },

  /* Submit */
  submitBtn: {
    width: '100%', marginTop: 8, padding: '14px 20px',
    borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)',
    backgroundSize: '200% auto',
    color: '#071C33', fontWeight: 700, fontSize: 15,
    fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 28px rgba(201,168,76,0.2)',
  },

  footerText: {
    marginTop: 22, textAlign: 'center',
    color: 'rgba(255,255,255,0.35)', fontSize: 13.5,
  },

  /* Error */
  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderLeft: '3px solid #ef4444',
    padding: '11px 14px',
    borderRadius: 12,
    color: '#fca5a5', fontSize: 13.5,
    marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10,
  },

  cornerLabel: {
    marginTop: 16, marginRight: 4,
    color: 'rgba(255,255,255,0.15)', fontSize: 10.5,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    fontFamily: "'DM Sans', sans-serif",
  },

  /* Modal */
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    width: 380, background: '#071524',
    borderRadius: 24, padding: '38px 34px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
  },
  modalIcon: { fontSize: 52 },
  modalTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    color: '#fff', fontSize: 26, fontWeight: 700, margin: '14px 0 0',
  },
  modalDivider: {
    height: 1, background: 'rgba(255,255,255,0.07)',
    margin: '18px 0',
  },
  modalBody: {
    color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7,
  },
  modalBtn: {
    marginTop: 22, padding: '11px 28px',
    borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.1)',
    color: '#fca5a5', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  },
};