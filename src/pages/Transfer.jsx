import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  SendHorizonal, CreditCard, CircleDollarSign,
  BadgeCheck, ArrowRight, User, ArrowLeft,
  ShieldCheck, Lock, AlertCircle, CheckCircle2,
} from 'lucide-react';

const QUICK_AMOUNTS = [500000, 1000000, 2000000, 5000000];

export default function Transfer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    toAccount: '', amount: '', description: '', transferPassword: '',
  });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await axios.post('/transaction/transfer', {
        ...form, amount: Number(form.amount),
      });
      setMsg(`Số dư còn lại: ${res.data.balance.toLocaleString('vi-VN')} VND`);
      setIsError(false);
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Giao dịch thất bại');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ toAccount: '', amount: '', description: '', transferPassword: '' });
    setRecipientName('');
    setRecipientError('');
    setMsg('');
    setStep(1);
  };

  useEffect(() => {
    if (!form.toAccount.trim()) {
      setRecipientName(''); setRecipientError(''); return;
    }
    const timer = setTimeout(async () => {
      try {
        setRecipientLoading(true);
        const res = await axios.get('/transaction/recipient-name', {
          params: { accountNumber: form.toAccount.trim() },
        });
        setRecipientName(res.data.name);
        setRecipientError('');
      } catch (err) {
        setRecipientName('');
        setRecipientError(err.response?.data?.msg || 'Không tìm thấy tài khoản');
      } finally {
        setRecipientLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.toAccount]);

  const progress = [
    !!form.toAccount && !!recipientName,
    !!form.amount,
    !!form.description,
    !!form.transferPassword,
  ].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .tf-root {
          min-height: 100vh;
          background: #050d1a;
          color: #e2e8f0;
          font-family: 'Be Vietnam Pro', sans-serif;
          display: flex;
          align-items: stretch;
        }

        /* ── LEFT PANEL ── */
        .tf-left {
          width: 380px;
          min-height: 100vh;
          background: #070f1d;
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tf-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 10% 20%, rgba(37,99,235,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 90% 80%, rgba(16,185,129,0.07) 0%, transparent 55%);
          pointer-events: none;
        }
        .tf-grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .tf-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #64748b;
          font-size: 12.5px;
          font-weight: 500;
          padding: 8px 14px;
          cursor: pointer;
          transition: all .2s;
          font-family: 'Be Vietnam Pro', sans-serif;
          width: fit-content;
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
        }
        .tf-back-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); }

        .tf-brand {
          position: relative;
          z-index: 1;
          margin-bottom: 48px;
        }
        .tf-brand-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 12px;
        }
        .tf-brand-title {
          font-size: 32px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #f1f5f9;
          margin-bottom: 10px;
        }
        .tf-brand-title span {
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tf-brand-sub {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }

        /* Progress steps */
        .tf-steps {
          position: relative;
          z-index: 1;
          margin-bottom: 40px;
        }
        .tf-steps-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #475569;
          margin-bottom: 16px;
        }
        .tf-progress-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        .tf-progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, #1d4ed8, #60a5fa);
          transition: width 0.4s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 0 12px rgba(59,130,246,0.5);
        }
        .tf-progress-text {
          font-size: 11.5px;
          color: #64748b;
          font-family: 'JetBrains Mono', monospace;
        }
        .tf-progress-text span { color: #60a5fa; font-weight: 600; }

        /* Info cards on left */
        .tf-info-cards { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 10px; }
        .tf-info-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: border-color 0.2s;
        }
        .tf-info-card:hover { border-color: rgba(59,130,246,0.2); }
        .tf-info-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tf-info-icon.blue { background: rgba(37,99,235,0.15); color: #60a5fa; }
        .tf-info-icon.green { background: rgba(16,185,129,0.15); color: #34d399; }
        .tf-info-icon.amber { background: rgba(245,158,11,0.12); color: #fbbf24; }
        .tf-info-title { font-size: 12.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px; }
        .tf-info-desc { font-size: 11.5px; color: #475569; line-height: 1.5; }

        .tf-left-footer {
          position: relative;
          z-index: 1;
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 11px;
          color: #334155;
          line-height: 1.6;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── RIGHT PANEL ── */
        .tf-right {
          flex: 1;
          padding: 40px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow-y: auto;
        }
        .tf-form-wrap {
          width: 100%;
          max-width: 520px;
          padding-top: 16px;
        }

        /* Form card */
        .tf-card {
          background: #0a1628;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .tf-card-head {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.02);
        }
        .tf-card-head-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .tf-card-head-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tf-card-step-num {
          margin-left: auto;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          color: #334155;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 6px;
          padding: 3px 8px;
        }
        .tf-card-body { padding: 22px 24px; }

        /* Field */
        .tf-field { margin-bottom: 0; }
        .tf-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .tf-input-wrap { position: relative; }
        .tf-input {
          width: 100%;
          padding: 14px 44px 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 14.5px;
          outline: none;
          font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.2s;
        }
        .tf-input::placeholder { color: #334155; }
        .tf-input:focus {
          border-color: rgba(59,130,246,0.45);
          background: rgba(37,99,235,0.06);
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }
        .tf-input.has-value { border-color: rgba(255,255,255,0.1); }
        .tf-input.error { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); }
        .tf-input-icon {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #334155;
          transition: color 0.2s;
        }
        .tf-input:focus ~ .tf-input-icon { color: #60a5fa; }

        /* Amount input special */
        .tf-amount-input {
          width: 100%;
          padding: 18px 16px 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 28px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: all 0.2s;
          letter-spacing: -0.5px;
        }
        .tf-amount-input::placeholder { color: #1e3a5f; font-size: 28px; }
        .tf-amount-input:focus {
          border-color: rgba(59,130,246,0.4);
          background: rgba(37,99,235,0.06);
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }
        .tf-amount-currency {
          position: absolute;
          right: 16px; bottom: 12px;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
        }
        .tf-amount-display {
          margin-top: 8px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: #fbbf24;
          font-weight: 600;
          min-height: 18px;
        }

        /* Quick amounts */
        .tf-quick-amounts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        .tf-quick-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          color: #64748b;
          font-size: 11.5px;
          font-weight: 600;
          padding: 8px 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.18s;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .tf-quick-btn:hover {
          background: rgba(37,99,235,0.15);
          border-color: rgba(59,130,246,0.3);
          color: #93c5fd;
        }
        .tf-quick-btn.selected {
          background: rgba(37,99,235,0.2);
          border-color: rgba(59,130,246,0.4);
          color: #93c5fd;
        }

        /* Recipient card */
        .tf-recipient-box {
          margin-top: 12px;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.25s;
          min-height: 52px;
        }
        .tf-recipient-box.found {
          background: rgba(16,185,129,0.07);
          border: 1px solid rgba(16,185,129,0.18);
        }
        .tf-recipient-box.error {
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.18);
        }
        .tf-recipient-box.loading {
          background: rgba(59,130,246,0.07);
          border: 1px solid rgba(59,130,246,0.15);
        }
        .tf-recipient-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #059669, #34d399);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
        }
        .tf-recipient-sublabel { font-size: 10.5px; color: #34d399; font-weight: 500; margin-bottom: 2px; }
        .tf-recipient-name { font-size: 14px; font-weight: 700; color: #f1f5f9; }

        /* Submit */
        .tf-submit-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.07em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          font-family: 'Be Vietnam Pro', sans-serif;
          box-shadow: 0 8px 32px rgba(37,99,235,0.35);
          position: relative;
          overflow: hidden;
        }
        .tf-submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
          pointer-events: none;
        }
        .tf-submit-btn:hover:not(:disabled) {
          box-shadow: 0 12px 40px rgba(37,99,235,0.5);
          transform: translateY(-1px);
        }
        .tf-submit-btn:disabled {
          background: #1e2d3d;
          box-shadow: none;
          cursor: not-allowed;
          color: #475569;
        }
        .tf-submit-shimmer {
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer { to { left: 200%; } }

        /* Error msg */
        .tf-error-msg {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
          font-size: 13.5px;
          color: #fca5a5;
          font-weight: 500;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }

        /* ── SUCCESS ── */
        .tf-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 60px 24px 40px;
          animation: fadeIn 0.4s ease;
        }
        .tf-success-ring {
          width: 88px; height: 88px;
          border-radius: 50%;
          background: rgba(16,185,129,0.12);
          border: 2px solid rgba(16,185,129,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          animation: scaleIn 0.4s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 0 40px rgba(16,185,129,0.2);
        }
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .tf-success-title {
          font-size: 26px; font-weight: 800;
          color: #f1f5f9; margin-bottom: 8px;
        }
        .tf-success-sub { font-size: 13.5px; color: #64748b; margin-bottom: 32px; }
        .tf-success-balance {
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.15);
          border-radius: 16px;
          padding: 20px 32px;
          margin-bottom: 32px;
          width: 100%;
        }
        .tf-success-balance-label { font-size: 11px; color: #34d399; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
        .tf-success-balance-value {
          font-size: 28px; font-weight: 800;
          color: #34d399;
          font-family: 'JetBrains Mono', monospace;
        }
        .tf-success-actions { display: flex; gap: 10px; width: 100%; }
        .tf-success-btn-primary {
          flex: 1; padding: 13px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: #fff; font-size: 13.5px; font-weight: 700;
          cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .tf-success-btn-primary:hover { box-shadow: 0 8px 24px rgba(37,99,235,0.45); transform: translateY(-1px); }
        .tf-success-btn-ghost {
          flex: 1; padding: 13px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          background: rgba(255,255,255,0.05);
          color: #94a3b8; font-size: 13.5px; font-weight: 600;
          cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;
          transition: all 0.2s;
        }
        .tf-success-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #e2e8f0; }

        .tf-security-note {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 11.5px;
          color: #475569;
          margin-top: 12px;
        }

        @media (max-width: 900px) {
          .tf-left { display: none; }
          .tf-right { padding: 24px 20px; }
        }
      `}</style>

      <div className="tf-root">

        {/* LEFT PANEL */}
        <div className="tf-left">
          <div className="tf-left-bg" />
          <div className="tf-grid-lines" />

          <button className="tf-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={14} /> Quay lại
          </button>

          <div className="tf-brand">
            <div className="tf-brand-tag">YN Bank · Chuyển khoản</div>
            <h1 className="tf-brand-title">
              Gửi tiền<br /><span>nhanh & an toàn</span>
            </h1>
            <p className="tf-brand-sub">
              Chuyển khoản 24/7 trong vòng vài giây.<br />
              Bảo mật đa lớp, xác thực mật khẩu riêng.
            </p>
          </div>

          {/* Progress */}
          <div className="tf-steps">
            <div className="tf-steps-label">Tiến trình điền form</div>
            <div className="tf-progress-bar-bg">
              <div className="tf-progress-bar-fill" style={{ width: `${(progress / 4) * 100}%` }} />
            </div>
            <div className="tf-progress-text">
              <span>{progress}</span>/4 thông tin đã điền
            </div>
          </div>

          <div className="tf-info-cards">
            <div className="tf-info-card">
              <div className="tf-info-icon blue"><ShieldCheck size={16} /></div>
              <div>
                <div className="tf-info-title">Bảo mật tuyệt đối</div>
                <div className="tf-info-desc">Mã hóa TLS 1.3 · Xác thực 2 lớp</div>
              </div>
            </div>
            <div className="tf-info-card">
              <div className="tf-info-icon green"><BadgeCheck size={16} /></div>
              <div>
                <div className="tf-info-title">Xác nhận tên người nhận</div>
                <div className="tf-info-desc">Hệ thống tự tra cứu tên trước khi gửi</div>
              </div>
            </div>
            <div className="tf-info-card">
              <div className="tf-info-icon amber"><CircleDollarSign size={16} /></div>
              <div>
                <div className="tf-info-title">Hạn mức 500 triệu/ngày</div>
                <div className="tf-info-desc">Tối thiểu 1.000 ₫ · Không phí nội bộ</div>
              </div>
            </div>
          </div>

          <div className="tf-left-footer">
            © 2025 YN Banking Corp.<br />
            Giấy phép NHNN · BIC: YNBKVNVX
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="tf-right">
          <div className="tf-form-wrap">

            {step === 2 ? (
              /* SUCCESS STATE */
              <div className="tf-card">
                <div className="tf-success">
                  <div className="tf-success-ring">
                    <CheckCircle2 size={40} color="#34d399" />
                  </div>
                  <div className="tf-success-title">Giao dịch thành công!</div>
                  <div className="tf-success-sub">
                    Tiền đã được chuyển tới tài khoản người nhận
                  </div>
                  <div className="tf-success-balance">
                    <div className="tf-success-balance-label">Số dư còn lại</div>
                    <div className="tf-success-balance-value">{msg}</div>
                  </div>
                  <div className="tf-success-actions">
                    <button className="tf-success-btn-primary" onClick={handleReset}>
                      Chuyển tiền tiếp
                    </button>
                    <button className="tf-success-btn-ghost" onClick={() => navigate('/dashboard')}>
                      Về tổng quan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ERROR */}
                {isError && msg && (
                  <div className="tf-error-msg">
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    {msg}
                  </div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">

                  {/* CARD 1 - TÀI KHOẢN NHẬN */}
                  <div className="tf-card" style={{ marginBottom: '14px' }}>
                    <div className="tf-card-head">
                      <div className="tf-card-head-icon" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                        <CreditCard size={15} />
                      </div>
                      <span className="tf-card-head-title">Tài khoản người nhận</span>
                      <span className="tf-card-step-num">01</span>
                    </div>
                    <div className="tf-card-body">
                      <div className="tf-field">
                        <label className="tf-label">Số tài khoản</label>
                        <div className="tf-input-wrap">
                          <input
                            className={`tf-input${form.toAccount ? ' has-value' : ''}${recipientError ? ' error' : ''}`}
                            name="tf_account"
                            autoComplete="off"
                            placeholder="Nhập số tài khoản..."
                            value={form.toAccount}
                            onChange={(e) => setForm({ ...form, toAccount: e.target.value })}
                            required
                          />
                          <span className="tf-input-icon"><CreditCard size={16} /></span>
                        </div>

                        {/* Recipient result */}
                        {recipientLoading && (
                          <div className="tf-recipient-box loading">
                            <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 500 }}>
                              ⏳ Đang tra cứu thông tin...
                            </div>
                          </div>
                        )}
                        {recipientName && !recipientLoading && (
                          <div className="tf-recipient-box found">
                            <div className="tf-recipient-avatar">
                              {recipientName[0]?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="tf-recipient-sublabel">Người nhận xác nhận</div>
                              <div className="tf-recipient-name">{recipientName}</div>
                            </div>
                            <BadgeCheck size={20} color="#34d399" />
                          </div>
                        )}
                        {recipientError && !recipientLoading && (
                          <div className="tf-recipient-box error">
                            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', color: '#fca5a5', fontWeight: 500 }}>{recipientError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CARD 2 - SỐ TIỀN */}
                  <div className="tf-card" style={{ marginBottom: '14px' }}>
                    <div className="tf-card-head">
                      <div className="tf-card-head-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                        <CircleDollarSign size={15} />
                      </div>
                      <span className="tf-card-head-title">Số tiền giao dịch</span>
                      <span className="tf-card-step-num">02</span>
                    </div>
                    <div className="tf-card-body">
                      <label className="tf-label">Nhập số tiền</label>
                      <div className="tf-input-wrap">
                        <input
                          type="number"
                          className="tf-amount-input"
                          name="tf_amount"
                          autoComplete="off"
                          min="1000"
                          placeholder="0"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          required
                        />
                        <span className="tf-amount-currency">VND</span>
                      </div>
                      <div className="tf-amount-display">
                        {form.amount
                          ? `≈ ${Number(form.amount).toLocaleString('vi-VN')} đồng`
                          : ''}
                      </div>
                      <div className="tf-quick-amounts">
                        {QUICK_AMOUNTS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            className={`tf-quick-btn${Number(form.amount) === q ? ' selected' : ''}`}
                            onClick={() => setForm({ ...form, amount: String(q) })}
                          >
                            {q >= 1e6 ? `${q / 1e6}M` : `${q / 1e3}K`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CARD 3 - NỘI DUNG & MẬT KHẨU */}
                  <div className="tf-card" style={{ marginBottom: '16px' }}>
                    <div className="tf-card-head">
                      <div className="tf-card-head-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
                        <Lock size={15} />
                      </div>
                      <span className="tf-card-head-title">Nội dung & Xác thực</span>
                      <span className="tf-card-step-num">03</span>
                    </div>
                    <div className="tf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="tf-field">
                        <label className="tf-label">Nội dung chuyển khoản</label>
                        <div className="tf-input-wrap">
                          <input
                            className={`tf-input${form.description ? ' has-value' : ''}`}
                            name="tf_desc"
                            autoComplete="off"
                            placeholder="Ví dụ: Thanh toán hóa đơn tháng 6..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="tf-field">
                        <label className="tf-label">Mật khẩu chuyển tiền</label>
                        <div className="tf-input-wrap">
                          <input
                            type="password"
                            className={`tf-input${form.transferPassword ? ' has-value' : ''}`}
                            name="tf_pass"
                            autoComplete="new-password"
                            placeholder="Nhập mật khẩu xác thực"
                            value={form.transferPassword}
                            onChange={(e) => setForm({ ...form, transferPassword: e.target.value })}
                            required
                          />
                          <span className="tf-input-icon"><Lock size={16} /></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    className="tf-submit-btn"
                    disabled={loading || !!recipientError || (form.toAccount && !recipientName)}
                  >
                    {!loading && <div className="tf-submit-shimmer" />}
                    {loading ? (
                      <>Đang xử lý giao dịch...</>
                    ) : (
                      <>
                        <SendHorizonal size={16} />
                        XÁC NHẬN CHUYỂN TIỀN
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <div className="tf-security-note">
                    <ShieldCheck size={14} color="#334155" />
                    Giao dịch được mã hóa SSL · Không chia sẻ mật khẩu với bất kỳ ai
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}