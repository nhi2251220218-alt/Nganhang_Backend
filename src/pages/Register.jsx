import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight, Eye, EyeOff, AlertCircle, CreditCard } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    transferPassword: '', phone: '',
  });
  const [accountNumber, setAccountNumber] = useState('');
  const [chosenAccountNumber, setChosenAccountNumber] = useState('');
  const [acctError, setAcctError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showTransferPass, setShowTransferPass] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // ── STK Validation
  const STK_PREFIX = '0';
  const STK_LENGTH = 10;

  const validateAccountNumber = (val) => {
    if (!val) return 'Vui lòng nhập số tài khoản';
    if (!/^\d+$/.test(val)) return 'Số tài khoản chỉ được chứa chữ số (0–9)';
    if (!val.startsWith(STK_PREFIX)) return `Số tài khoản phải bắt đầu bằng số ${STK_PREFIX}`;
    if (val.length !== STK_LENGTH) return `Số tài khoản phải đúng ${STK_LENGTH} chữ số (hiện tại: ${val.length})`;
    return '';
  };

  const handleAcctChange = (e) => {
    // Chỉ cho nhập số, tối đa 10 ký tự
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, STK_LENGTH);
    setChosenAccountNumber(raw);
    setAcctError(raw ? validateAccountNumber(raw) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate STK
    const acctErr = validateAccountNumber(chosenAccountNumber);
    if (acctErr) {
      setAcctError(acctErr);
      setLoading(false);
      return;
    }

    if (form.password === form.transferPassword) {
      setError('Mật khẩu đăng nhập và mật khẩu chuyển tiền không được giống nhau');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post('/auth/register', { ...form, chosenAccountNumber });
      // Dùng STK người dùng đã chọn — không dùng STK do server sinh ra
      setAccountNumber(chosenAccountNumber);
      let c = 5;
      const iv = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) { clearInterval(iv); navigate('/login'); }
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const strengthScore = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][strengthScore];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strengthScore];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root {
          min-height: 100vh;
          background: #040c18;
          display: flex;
          font-family: 'Be Vietnam Pro', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background */
        .rg-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .rg-bg-orb1 {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%);
          top: -200px; right: -100px;
        }
        .rg-bg-orb2 {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%);
          bottom: -150px; left: -100px;
        }
        .rg-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
          background-size: 52px 52px;
        }
        .rg-bg-line {
          position: absolute;
          top: 0; bottom: 0;
          left: 50%; width: 1px;
          background: linear-gradient(180deg, transparent, rgba(201,168,76,0.07) 30%, rgba(201,168,76,0.07) 70%, transparent);
        }

        /* Layout */
        .rg-layout {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          min-height: 100vh;
        }

        /* Left decorative panel */
        .rg-left {
          width: 420px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 48px;
          border-right: 1px solid rgba(201,168,76,0.08);
          position: relative;
        }
        .rg-logo-mark {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #b8932a, #e8c97a);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Instrument Serif', serif;
          font-size: 24px; color: #0a1628;
          box-shadow: 0 8px 32px rgba(201,168,76,0.3);
          margin-bottom: 20px;
        }
        .rg-bank-name {
          font-family: 'Instrument Serif', serif;
          font-size: 30px;
          color: #f1f5f9;
          letter-spacing: 0.01em;
          margin-bottom: 4px;
        }
        .rg-bank-name em { color: #c9a84c; font-style: italic; }
        .rg-bank-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #334155;
          margin-bottom: 48px;
        }

        .rg-benefits { display: flex; flex-direction: column; gap: 20px; margin-bottom: 48px; }
        .rg-benefit-item { display: flex; align-items: flex-start; gap: 14px; }
        .rg-benefit-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rg-benefit-icon.gold { background: rgba(201,168,76,0.12); color: #c9a84c; }
        .rg-benefit-icon.blue { background: rgba(37,99,235,0.12); color: #60a5fa; }
        .rg-benefit-icon.green { background: rgba(16,185,129,0.12); color: #34d399; }
        .rg-benefit-title { font-size: 13.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px; }
        .rg-benefit-desc { font-size: 12px; color: #475569; line-height: 1.55; }

        .rg-left-footer {
          font-size: 10.5px;
          color: #1e293b;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.7;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 20px;
        }

        /* Right form panel */
        .rg-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          overflow-y: auto;
        }
        .rg-form-container {
          width: 100%;
          max-width: 460px;
        }

        .rg-form-header { margin-bottom: 28px; }
        .rg-form-title {
          font-size: 26px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .rg-form-subtitle { font-size: 13.5px; color: #475569; }
        .rg-form-subtitle a { color: #c9a84c; text-decoration: none; font-weight: 600; }
        .rg-form-subtitle a:hover { text-decoration: underline; }

        /* Error / Success */
        .rg-alert {
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 13px;
          font-weight: 500;
          animation: fadeUp 0.25s ease;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .rg-alert.error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
        }

        /* Success card */
        .rg-success {
          background: #0a1628;
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 18px;
          padding: 36px;
          text-align: center;
          animation: fadeUp 0.3s ease;
        }
        .rg-success-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(201,168,76,0.1);
          border: 1.5px solid rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 0 32px rgba(201,168,76,0.15);
          animation: scaleIn 0.4s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .rg-success-title { font-size: 22px; font-weight: 800; color: #f1f5f9; margin-bottom: 6px; }
        .rg-success-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
        .rg-account-display {
          background: rgba(201,168,76,0.06);
          border: 1px solid rgba(201,168,76,0.15);
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .rg-account-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #c9a84c; margin-bottom: 10px; }
        .rg-account-num {
          font-size: 30px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          color: #f1f5f9;
          letter-spacing: 0.12em;
        }
        .rg-countdown {
          font-size: 12px; color: #475569;
          font-family: 'JetBrains Mono', monospace;
        }
        .rg-countdown span { color: #c9a84c; font-weight: 700; }

        /* Form sections */
        .rg-section {
          background: #0a1628;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .rg-section-head {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 9px;
          background: rgba(255,255,255,0.02);
        }
        .rg-section-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rg-section-icon.gold { background: rgba(201,168,76,0.12); color: #c9a84c; }
        .rg-section-icon.blue { background: rgba(37,99,235,0.12); color: #60a5fa; }
        .rg-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748b;
        }
        .rg-section-body {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rg-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Field */
        .rg-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 7px;
        }
        .rg-input-wrap { position: relative; }
        .rg-input {
          width: 100%;
          padding: 13px 40px 13px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px;
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.2s;
        }
        .rg-input::placeholder { color: #1e3a5f; }
        .rg-input:focus {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
          box-shadow: 0 0 0 4px rgba(201,168,76,0.08);
        }
        .rg-input-icon {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          color: #1e3a5f;
          pointer-events: none;
          transition: color 0.2s;
        }
        .rg-input:focus ~ .rg-input-icon { color: #c9a84c; }
        .rg-pass-toggle {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          color: #334155;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          transition: color 0.15s;
        }
        .rg-pass-toggle:hover { color: #c9a84c; }

        /* Strength meter */
        .rg-strength {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rg-strength-bars {
          display: flex;
          gap: 3px;
          flex: 1;
        }
        .rg-strength-bar {
          height: 3px;
          flex: 1;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          transition: background 0.3s;
        }
        .rg-strength-label {
          font-size: 10.5px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          min-width: 60px;
          text-align: right;
        }
        .rg-pass-hint {
          font-size: 11px;
          color: #334155;
          margin-top: 6px;
          line-height: 1.5;
        }

        /* Submit */
        .rg-submit {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 13px;
          background: linear-gradient(135deg, #b8932a, #e8c97a);
          color: #0a1628;
          font-size: 13.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: all 0.2s;
          font-family: 'Be Vietnam Pro', sans-serif;
          box-shadow: 0 6px 28px rgba(201,168,76,0.3);
          position: relative;
          overflow: hidden;
          margin-top: 14px;
        }
        .rg-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          pointer-events: none;
        }
        .rg-submit:hover:not(:disabled) {
          box-shadow: 0 10px 36px rgba(201,168,76,0.45);
          transform: translateY(-1px);
        }
        .rg-submit:disabled {
          background: #1a2a3d;
          color: #334155;
          box-shadow: none;
          cursor: not-allowed;
        }
        .rg-submit-shimmer {
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          animation: shimmer 2.8s infinite;
        }
        @keyframes shimmer { to { left: 200%; } }

        .rg-login-link {
          text-align: center;
          font-size: 13px;
          color: #475569;
          margin-top: 16px;
        }
        .rg-login-link a { color: #c9a84c; text-decoration: none; font-weight: 600; }
        .rg-login-link a:hover { text-decoration: underline; }

        .rg-section-icon.purple { background: rgba(139,92,246,0.12); color: #a78bfa; }

        /* STK input with prefix tag */
        .rg-stk-wrap {
          display: flex;
          align-items: stretch;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          transition: all 0.2s;
        }
        .rg-stk-wrap:focus-within {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.04);
          box-shadow: 0 0 0 4px rgba(201,168,76,0.08);
        }
        .rg-stk-wrap.error {
          border-color: rgba(239,68,68,0.45);
          background: rgba(239,68,68,0.04);
        }
        .rg-stk-prefix {
          padding: 0 14px;
          background: rgba(201,168,76,0.08);
          border-right: 1px solid rgba(201,168,76,0.15);
          display: flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          color: #c9a84c;
          flex-shrink: 0;
          letter-spacing: 0.05em;
        }
        .rg-stk-input {
          flex: 1;
          padding: 13px 14px;
          background: transparent;
          border: none;
          color: #f1f5f9;
          font-size: 15px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          letter-spacing: 0.08em;
        }
        .rg-stk-input::placeholder { color: #1e3a5f; letter-spacing: 0.04em; }
        .rg-stk-counter {
          padding: 0 12px;
          display: flex;
          align-items: center;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .rg-stk-rules {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .rg-stk-rule {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          transition: color 0.2s;
        }
        .rg-stk-rule-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .rg-stk-rule.ok { color: #22c55e; }
        .rg-stk-rule.ok .rg-stk-rule-dot { background: #22c55e; }
        .rg-stk-rule.fail { color: #475569; }
        .rg-stk-rule.fail .rg-stk-rule-dot { background: #334155; }
        .rg-stk-rule.err { color: #f87171; }
        .rg-stk-rule.err .rg-stk-rule-dot { background: #f87171; }
        .rg-field-error {
          margin-top: 7px;
          font-size: 11.5px;
          color: #f87171;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        @media (max-width: 900px) {
          .rg-left { display: none; }
          .rg-right { padding: 28px 16px; }
        }
      `}</style>

      <div className="rg-root">
        <div className="rg-bg">
          <div className="rg-bg-orb1" />
          <div className="rg-bg-orb2" />
          <div className="rg-bg-grid" />
          <div className="rg-bg-line" />
        </div>

        <div className="rg-layout">
          {/* LEFT PANEL */}
          <div className="rg-left">
            <div className="rg-logo-mark">Y</div>
            <div className="rg-bank-name">YN <em>Banking</em></div>
            <div className="rg-bank-tag">Internet Banking · Premium</div>

            <div className="rg-benefits">
              <div className="rg-benefit-item">
                <div className="rg-benefit-icon gold"><ShieldCheck size={17} /></div>
                <div>
                  <div className="rg-benefit-title">Bảo mật đa lớp</div>
                  <div className="rg-benefit-desc">Mật khẩu đăng nhập & mật khẩu giao dịch tách biệt hoàn toàn</div>
                </div>
              </div>
              <div className="rg-benefit-item">
                <div className="rg-benefit-icon blue"><CheckCircle2 size={17} /></div>
                <div>
                  <div className="rg-benefit-title">Số tài khoản tức thì</div>
                  <div className="rg-benefit-desc">Tài khoản được cấp ngay sau khi đăng ký thành công</div>
                </div>
              </div>
              <div className="rg-benefit-item">
                <div className="rg-benefit-icon green"><Lock size={17} /></div>
                <div>
                  <div className="rg-benefit-title">Giao dịch 24/7</div>
                  <div className="rg-benefit-desc">Chuyển khoản, kiểm tra số dư mọi lúc mọi nơi</div>
                </div>
              </div>
            </div>

            <div className="rg-left-footer">
              © 2025 YN Banking Corp.<br />
              Được cấp phép bởi NHNN Việt Nam<br />
              BIC: YNBKVNVX · MST: 0123456789
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rg-right">
            <div className="rg-form-container">

              {accountNumber ? (
                /* SUCCESS */
                <div className="rg-success">
                  <div className="rg-success-ring">
                    <CheckCircle2 size={34} color="#c9a84c" />
                  </div>
                  <div className="rg-success-title">Tạo tài khoản thành công!</div>
                  <div className="rg-success-sub">Chào mừng bạn đến với YN Banking</div>
                  <div className="rg-account-display">
                    <div className="rg-account-label">Số tài khoản của bạn</div>
                    <div className="rg-account-num">{accountNumber}</div>
                  </div>
                  <div className="rg-countdown">
                    Tự động chuyển đến đăng nhập sau <span>{countdown}s</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rg-form-header">
                    <div className="rg-form-title">Tạo tài khoản mới</div>
                    <div className="rg-form-subtitle">
                      Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                  </div>

                  {error && (
                    <div className="rg-alert error">
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} autoComplete="off">

                    {/* SECTION 1 */}
                    <div className="rg-section">
                      <div className="rg-section-head">
                        <div className="rg-section-icon gold"><User size={13} /></div>
                        <span className="rg-section-title">Thông tin cá nhân</span>
                      </div>
                      <div className="rg-section-body">
                        <div className="rg-row-2">
                          <div>
                            <label className="rg-label">Họ và tên</label>
                            <div className="rg-input-wrap">
                              <input
                                className="rg-input"
                                placeholder="Nguyễn Văn A"
                                value={form.fullName}
                                onChange={set('fullName')}
                                required
                                autoComplete="off"
                              />
                              <span className="rg-input-icon"><User size={15} /></span>
                            </div>
                          </div>
                          <div>
                            <label className="rg-label">Số điện thoại</label>
                            <div className="rg-input-wrap">
                              <input
                                className="rg-input"
                                placeholder="0901 234 567"
                                value={form.phone}
                                onChange={set('phone')}
                                autoComplete="off"
                              />
                              <span className="rg-input-icon"><Phone size={15} /></span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="rg-label">Email</label>
                          <div className="rg-input-wrap">
                            <input
                              type="email"
                              className="rg-input"
                              placeholder="ten@email.com"
                              value={form.email}
                              onChange={set('email')}
                              required
                              autoComplete="off"
                            />
                            <span className="rg-input-icon"><Mail size={15} /></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2 — STK */}
                    <div className="rg-section">
                      <div className="rg-section-head">
                        <div className="rg-section-icon purple"><CreditCard size={13} /></div>
                        <span className="rg-section-title">Số tài khoản</span>
                      </div>
                      <div className="rg-section-body">
                        <div>
                          <label className="rg-label">Chọn số tài khoản của bạn</label>
                          <div
                            className={`rg-stk-wrap${acctError && chosenAccountNumber ? ' error' : ''}`}
                          >
                            <div className="rg-stk-prefix">0</div>
                            <input
                              className="rg-stk-input"
                              placeholder="xxxxxxxxx"
                              value={chosenAccountNumber.slice(1)}
                              inputMode="numeric"
                              maxLength={9}
                              onChange={(e) => {
                                const raw = ('0' + e.target.value.replace(/[^0-9]/g, '')).slice(0, 10);
                                setChosenAccountNumber(raw);
                                setAcctError(raw.length > 1 ? validateAccountNumber(raw) : '');
                              }}
                            />
                            <div
                              className="rg-stk-counter"
                              style={{
                                color: chosenAccountNumber.length === 10
                                  ? '#22c55e'
                                  : chosenAccountNumber.length > 0
                                    ? '#f59e0b'
                                    : '#334155'
                              }}
                            >
                              {chosenAccountNumber.length}/10
                            </div>
                          </div>

                          {/* Rules */}
                          <div className="rg-stk-rules">
                            {[
                              {
                                label: `Bắt đầu bằng số 0`,
                                ok: chosenAccountNumber.startsWith('0'),
                                active: chosenAccountNumber.length > 0
                              },
                              {
                                label: 'Đúng 10 chữ số',
                                ok: chosenAccountNumber.length === 10,
                                active: chosenAccountNumber.length > 0
                              },
                              {
                                label: 'Chỉ chứa chữ số (không ký tự đặc biệt)',
                                ok: /^\d+$/.test(chosenAccountNumber) && chosenAccountNumber.length > 0,
                                active: chosenAccountNumber.length > 0
                              },
                            ].map((rule, i) => (
                              <div
                                key={i}
                                className={`rg-stk-rule ${!rule.active ? 'fail' : rule.ok ? 'ok' : 'err'}`}
                              >
                                <div className="rg-stk-rule-dot" />
                                {rule.label}
                                {rule.active && (rule.ok ? ' ✓' : '')}
                              </div>
                            ))}
                          </div>

                          {acctError && chosenAccountNumber.length > 1 && (
                            <div className="rg-field-error">
                              <AlertCircle size={12} />
                              {acctError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3 */}
                    <div className="rg-section">
                      <div className="rg-section-head">
                        <div className="rg-section-icon blue"><Lock size={13} /></div>
                        <span className="rg-section-title">Thiết lập mật khẩu</span>
                      </div>
                      <div className="rg-section-body">
                        <div>
                          <label className="rg-label">Mật khẩu đăng nhập</label>
                          <div className="rg-input-wrap">
                            <input
                              type={showPass ? 'text' : 'password'}
                              className="rg-input"
                              placeholder="Tối thiểu 8 ký tự"
                              value={form.password}
                              onChange={set('password')}
                              required
                              autoComplete="new-password"
                              style={{ paddingRight: '44px' }}
                            />
                            <button type="button" className="rg-pass-toggle" onClick={() => setShowPass(v => !v)}>
                              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {form.password && (
                            <div className="rg-strength">
                              <div className="rg-strength-bars">
                                {[1, 2, 3, 4].map(i => (
                                  <div
                                    key={i}
                                    className="rg-strength-bar"
                                    style={{ background: i <= strengthScore ? strengthColor : undefined }}
                                  />
                                ))}
                              </div>
                              <span className="rg-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="rg-label">Mật khẩu chuyển tiền</label>
                          <div className="rg-input-wrap">
                            <input
                              type={showTransferPass ? 'text' : 'password'}
                              className="rg-input"
                              placeholder="Khác với mật khẩu đăng nhập"
                              value={form.transferPassword}
                              onChange={set('transferPassword')}
                              required
                              autoComplete="new-password"
                              style={{ paddingRight: '44px' }}
                            />
                            <button type="button" className="rg-pass-toggle" onClick={() => setShowTransferPass(v => !v)}>
                              {showTransferPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <div className="rg-pass-hint">
                            Dùng riêng để xác nhận giao dịch · Không được trùng mật khẩu đăng nhập
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SUBMIT */}
                    <button type="submit" className="rg-submit" disabled={loading}>
                      {!loading && <div className="rg-submit-shimmer" />}
                      {loading ? 'Đang tạo tài khoản...' : (
                        <>TẠO TÀI KHOẢN <ArrowRight size={16} /></>
                      )}
                    </button>

                    <div className="rg-login-link">
                      Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}