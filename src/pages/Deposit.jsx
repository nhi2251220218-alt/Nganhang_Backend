import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PRESETS = [
  100000,
  500000,
  1000000,
  5000000,
  10000000,
  50000000,
];

export default function Deposit() {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setMsg('');
    setError('');

    const num = parseInt(amount, 10);

    if (!num || num <= 0) {
      return setError('Vui lòng nhập số tiền hợp lệ');
    }

    if (num > 500000000) {
      return setError('Tối đa 500 triệu mỗi lần nạp');
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'http://localhost:5000/api/transactions/deposit',
        { amount: num },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(`Nạp thành công! Số dư mới: ${res.data.balance.toLocaleString('vi-VN')} ₫`);
      setAmount('');

      // Cập nhật balance trong context nếu setUser có sẵn
      if (setUser) {
        setUser(prev => ({ ...prev, balance: res.data.balance }));
      }

    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi server');
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0A1628 0%,#1A3A5C 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
      }}>

        {/* Tiêu đề */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
          }}>
            Nạp tiền giả lập
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            marginTop: '6px',
          }}>
            Dùng để test tính năng chuyển tiền
          </p>
        </div>

        {/* Số dư hiện tại */}
        {user && (
          <div style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '24px',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
              SỐ DƯ HIỆN TẠI
            </div>
            <div style={{ color: '#C9A84C', fontSize: '22px', fontWeight: '700', marginTop: '4px' }}>
              {(user.balance || 0).toLocaleString('vi-VN')} ₫
            </div>
          </div>
        )}

        {/* Chọn nhanh */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '10px' }}>
            CHỌN NHANH
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                style={{
                  background: amount === String(p)
                    ? 'rgba(201,168,76,0.25)'
                    : 'rgba(255,255,255,0.06)',
                  border: amount === String(p)
                    ? '1px solid #C9A84C'
                    : '1px solid rgba(255,255,255,0.12)',
                  color: amount === String(p) ? '#C9A84C' : 'rgba(255,255,255,0.7)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {p.toLocaleString('vi-VN')} ₫
              </button>
            ))}
          </div>
        </div>

        {/* Nhập tay */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>
            HOẶC NHẬP SỐ TIỀN
          </div>
          <input
            type="number"
            placeholder="Nhập số tiền..."
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {amount && !isNaN(parseInt(amount)) && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '6px' }}>
              = {parseInt(amount).toLocaleString('vi-VN')} ₫
            </div>
          )}
        </div>

        {/* Thông báo */}
        {msg && (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#4ade80',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            ✅ {msg}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Nút nạp */}
        <button
          onClick={handleDeposit}
          disabled={loading || !amount}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || !amount
              ? 'rgba(201,168,76,0.3)'
              : 'linear-gradient(135deg,#C9A84C,#E8C97A)',
            border: 'none',
            borderRadius: '10px',
            color: '#0A1628',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading || !amount ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Đang xử lý...' : 'Nạp tiền ngay'}
        </button>

      </div>
    </div>
  );
}