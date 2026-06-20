import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';

export default function History() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] =
    useState([]);

  const [startDate, setStartDate] =
    useState('');

  const [endDate, setEndDate] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [accountNumber, setAccountNumber] =
    useState(
      user?.accountNumber || ''
    );

  // =========================
  // LOAD ACCOUNT NUMBER
  // =========================
  useEffect(() => {

    if (!accountNumber) {

      axios
        .get('/user/profile')
        .then((r) => {

          setAccountNumber(
            r.data.accountNumber
          );

        })
        .catch(() => {});

    }

  }, [accountNumber]);

  // =========================
  // FETCH HISTORY
  // =========================
  const fetchHistory = async (
    sd = startDate,
    ed = endDate
  ) => {

    setLoading(true);

    try {

      const params = {};

      if (sd)
        params.startDate = sd;

      if (ed)
        params.endDate = ed;

      const res = await axios.get(
        '/transaction/history',
        {
          params,
        }
      );

      setTransactions(
        res.data || []
      );

    } catch {

      setTransactions([]);

    } finally {

      setLoading(false);

    }

  };

  // =========================
  // LOAD FIRST TIME
  // =========================
  useEffect(() => {

    fetchHistory();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acct =
    accountNumber ||
    user?.accountNumber ||
    '';

  const totalSent = transactions
    .filter(
      (t) =>
        t.fromAccount === acct
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0
    );

  const totalReceived =
    transactions
      .filter(
        (t) =>
          t.toAccount === acct
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount),
        0
      );

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
    fontFamily:
      'DM Sans,sans-serif',
    backdropFilter: 'blur(10px)',
  };

  return (

    <div
      style={{
        minHeight: '100vh',

        background:
          'linear-gradient(180deg,#06111F 0%,#091B32 50%,#040B16 100%)',

        padding: '24px',

        color: '#fff',

        fontFamily:
          'DM Sans,sans-serif',
      }}
    >

      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
        }}
      >

        {/* HEADER */}
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
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
          fontSize: '34px',
          fontWeight: '800',
        }}
      >
        Lịch sử giao dịch
      </h1>

      <p
        style={{
          color: 'rgba(255,255,255,0.45)',
          marginTop: '8px',
          fontSize: '14px',
        }}
      >
        Theo dõi giao dịch tài khoản
      </p>
    </div>
  </div>

  <div
    style={{
      width: '72px',
      height: '72px',
      borderRadius: '24px',
      background:
        'linear-gradient(135deg,#2563EB,#60A5FA)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Wallet size={34} />
  </div>
</div>

        {/* STATS */}
        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(3,1fr)',

            gap: '16px',

            marginBottom: '24px',
          }}
        >

          {[
            {
              label:
                'Tổng giao dịch',

              value:
                transactions.length,

              icon:
                <CreditCard size={24} />,

              color:
                'linear-gradient(135deg,#2563EB,#60A5FA)',
            },

            {
              label:
                'Đã chuyển',

              value:
                totalSent.toLocaleString(
                  'vi-VN'
                ) + ' ₫',

              icon:
                <TrendingDown size={24} />,

              color:
                'linear-gradient(135deg,#EF4444,#F87171)',
            },

            {
              label:
                'Đã nhận',

              value:
                totalReceived.toLocaleString(
                  'vi-VN'
                ) + ' ₫',

              icon:
                <TrendingUp size={24} />,

              color:
                'linear-gradient(135deg,#10B981,#34D399)',
            },
          ].map((s, i) => (

            <div
              key={i}
              style={{
                background:
                  'rgba(255,255,255,0.05)',

                border:
                  '1px solid rgba(255,255,255,0.08)',

                borderRadius:
                  '28px',

                padding: '22px',
              }}
            >

              <div
                style={{
                  width: '52px',

                  height: '52px',

                  borderRadius:
                    '18px',

                  background:
                    s.color,

                  display: 'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  marginBottom:
                    '16px',
                }}
              >
                {s.icon}
              </div>

              <p
                style={{
                  margin:
                    '0 0 8px',

                  color:
                    'rgba(255,255,255,0.5)',

                  fontSize: '13px',
                }}
              >
                {s.label}
              </p>

              <h2
                style={{
                  margin: 0,

                  fontSize: '24px',

                  fontWeight: '800',
                }}
              >
                {s.value}
              </h2>

            </div>

          ))}

        </div>

        {/* FILTER */}
        <div
          style={{
            background:
              'rgba(255,255,255,0.05)',

            border:
              '1px solid rgba(255,255,255,0.08)',

            borderRadius: '30px',

            padding: '24px',

            marginBottom: '24px',
          }}
        >

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                '1fr 1fr auto auto',

              gap: '14px',
            }}
          >

            <input
              type="date"

              style={INPUT}

              value={startDate}

              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
            />

            <input
              type="date"

              style={INPUT}

              value={endDate}

              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
            />

            <button
              onClick={() =>
                fetchHistory()
              }
              style={{
                border: 'none',

                borderRadius:
                  '18px',

                padding:
                  '0 22px',

                background:
                  'linear-gradient(135deg,#2563EB,#60A5FA)',

                color: '#fff',

                cursor: 'pointer',

                fontWeight: '700',
              }}
            >

              <Search size={18} />

            </button>

            <button
              onClick={() => {

                setStartDate('');

                setEndDate('');

                fetchHistory(
                  '',
                  ''
                );

              }}
              style={{
                border:
                  '1px solid rgba(255,255,255,0.08)',

                borderRadius:
                  '18px',

                padding:
                  '0 18px',

                background:
                  'rgba(255,255,255,0.04)',

                color:
                  'rgba(255,255,255,0.7)',

                cursor: 'pointer',
              }}
            >
              Xóa
            </button>

          </div>

        </div>

        {/* LIST */}
        <div
          style={{
            background:
              'rgba(255,255,255,0.05)',

            border:
              '1px solid rgba(255,255,255,0.08)',

            borderRadius: '34px',

            overflow: 'hidden',
          }}
        >

          {loading ? (

            <div
              style={{
                textAlign:
                  'center',

                padding: '60px',
              }}
            >
              Đang tải...
            </div>

          ) : transactions.length ===
            0 ? (

            <div
              style={{
                textAlign:
                  'center',

                padding: '70px',
              }}
            >
              Không có giao dịch
            </div>

          ) : (

            transactions.map(
              (tx, i) => {

                const isSender =
                  tx.fromAccount ===
                  acct;

                return (

                  <div
                    key={
                      tx._id ?? i
                    }
                    style={{
                      display: 'flex',

                      justifyContent:
                        'space-between',

                      alignItems:
                        'center',

                      padding:
                        '20px 26px',

                      borderBottom:
                        i <
                        transactions.length -
                          1
                          ? '1px solid rgba(255,255,255,0.05)'
                          : 'none',
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',

                        alignItems:
                          'center',

                        gap: '16px',
                      }}
                    >

                      <div
                        style={{
                          width: '54px',

                          height: '54px',

                          borderRadius:
                            '18px',

                          background:
                            isSender
                              ? 'linear-gradient(135deg,#EF4444,#F87171)'
                              : 'linear-gradient(135deg,#10B981,#34D399)',

                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'center',
                        }}
                      >

                        {isSender
                          ? (
                            <ArrowUpRight size={24} />
                          )
                          : (
                            <ArrowDownLeft size={24} />
                          )}

                      </div>

                      <div>

                        <div>

  <h3
    style={{
      margin: '0 0 8px',
      fontSize: '15px',
      fontWeight: '700',
    }}
  >
    {isSender
      ? 'Giao dịch chuyển tiền'
      : 'Giao dịch nhận tiền'}
  </h3>

  <p
    style={{
      margin: '3px 0',
      color: '#CBD5E1',
      fontSize: '13px',
    }}
  >
    Người gửi:
    <strong>
      {' '}
      {tx.fromName}
    </strong>
  </p>

  <p
    style={{
      margin: '3px 0',
      color: '#CBD5E1',
      fontSize: '13px',
    }}
  >
    STK gửi:
    <strong>
      {' '}
      {tx.fromAccount}
    </strong>
  </p>

  <p
    style={{
      margin: '3px 0',
      color: '#CBD5E1',
      fontSize: '13px',
    }}
  >
    Người nhận:
    <strong>
      {' '}
      {tx.toName}
    </strong>
  </p>

  <p
    style={{
      margin: '3px 0',
      color: '#CBD5E1',
      fontSize: '13px',
    }}
  >
    STK nhận:
    <strong>
      {' '}
      {tx.toAccount}
    </strong>
  </p>

  <p
    style={{
      margin: '3px 0',
      color: '#CBD5E1',
      fontSize: '13px',
    }}
  >
    Nội dung:
    <strong>
      {' '}
      {tx.description ||
        'Không có nội dung'}
    </strong>
  </p>

  <p
    style={{
      margin: '3px 0',
      color: '#94A3B8',
      fontSize: '12px',
    }}
  >
    Thời gian:
    {' '}
    {new Date(
      tx.createdAt
    ).toLocaleString('vi-VN')}
  </p>

</div>

                        <p
                          style={{
                            margin: 0,

                            color:
                              'rgba(255,255,255,0.45)',

                            fontSize:
                              '13px',
                          }}
                        >

                          {
                            tx.description ||
                            'Không có nội dung'
                          }

                        </p>

                      </div>

                    </div>

                    <div
                      style={{
                        textAlign:
                          'right',
                      }}
                    >

                      <h2
                        style={{
                          color:
                            isSender
                              ? '#F87171'
                              : '#34D399',
                        }}
                      >

                        {isSender
                          ? '-'
                          : '+'}

                        {
                          Number(
                            tx.amount
                          ).toLocaleString(
                            'vi-VN'
                          )
                        } ₫

                      </h2>

                    </div>

                  </div>

                );

              }
            )

          )}

        </div>

      </div>

    </div>

  );

}