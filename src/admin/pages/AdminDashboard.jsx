import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import {
  Users, Wallet, History, ShieldBan,
  Lock, Unlock, Search, LogOut,
  LayoutDashboard, TrendingUp, ChevronRight,
  FileSpreadsheet, X, Phone, Mail,
  CreditCard, Shield, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin'));

  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Security: chỉ hiện 4 số cuối STK — admin không xem được full
  const maskAccount = (acct) => {
    if (!acct || acct.length < 4) return '******';
    const last4 = acct.slice(-4);
    return `******${last4}`;
  };

  const exportUsersToExcel = () => {
    const data = users.map((u) => ({
      "Họ tên": u.fullName,
      "Email": u.email,
      "Số dư": u.balance,
      "Số tài khoản": u.accountNumber,
      "SĐT": u.phone,
      "Role": u.role,
      "Trạng thái": u.isBlocked ? "Đã khóa" : "Hoạt động"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "DanhSachNguoiDung.xlsx");
  };

  const exportTransactionsToExcel = () => {
    const data = transactions.map((t) => ({
      "Người gửi": t.fromName || '-',
      "STK gửi": t.fromAccount,
      "Người nhận": t.toName || '-',
      "STK nhận": t.toAccount,
      "Số tiền": Number(t.amount).toLocaleString('vi-VN'),
      "Nội dung": t.description || '-',
      "Thời gian": new Date(t.createdAt).toLocaleString('vi-VN')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "SaoKeGiaoDich.xlsx");
  };

  const exportUserTransactions = (user) => {
    const userTrans = transactions.filter(
      (t) => t.fromAccount === user.accountNumber || t.toAccount === user.accountNumber
    );
    const data = userTrans.map((t) => ({
      "Người gửi": t.fromName || '-',
      "STK gửi": t.fromAccount,
      "Người nhận": t.toName || '-',
      "STK nhận": t.toAccount,
      "Số tiền": Number(t.amount).toLocaleString('vi-VN'),
      "Nội dung": t.description || '-',
      "Thời gian": new Date(t.createdAt).toLocaleString('vi-VN')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UserTransactions");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `SaoKe_${user.fullName}.xlsx`);
  };

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
      let total = 0;
      res.data.forEach((u) => { total += u.balance || 0; });
      setTotalMoney(total);
    } catch (err) { console.log(err); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/admin/transactions');
      setTransactions(res.data);
    } catch (err) { console.log(err); }
  };

  const blockUser = async (id) => {
    try {
      await axios.put(`/admin/block/${id}`);
      fetchUsers();
    } catch (err) { console.log(err); }
  };

  const unblockUser = async (id) => {
    try {
      await axios.put(`/admin/unblock/${id}`);
      fetchUsers();
    } catch (err) { console.log(err); }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const blockedCount = users.filter(u => u.isBlocked).length;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-root {
          min-height: 100vh;
          background: #050d1a;
          color: #e2e8f0;
          display: flex;
          font-family: 'Be Vietnam Pro', sans-serif;
          overflow: hidden;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 72px;
          background: #070f1d;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0;
          gap: 8px;
          transition: width 0.3s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
          position: relative;
          z-index: 10;
        }
        .sidebar:hover {
          width: 240px;
        }
        .sidebar-logo {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 1px;
          color: #fff;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
          flex-shrink: 0;
        }
        .logo-text {
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          opacity: 0;
          transition: all 0.25s;
          font-size: 14px;
          font-weight: 700;
          color: #93c5fd;
          letter-spacing: 2px;
        }
        .sidebar:hover .logo-text {
          width: 120px;
          opacity: 1;
          margin-left: 10px;
        }

        .nav-item {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0 12px;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .sidebar:hover .nav-item {
          width: 208px;
          padding: 0 14px;
        }
        .nav-item:hover {
          background: rgba(59,130,246,0.12);
        }
        .nav-item.active {
          background: rgba(59,130,246,0.18);
          box-shadow: inset 3px 0 0 #3b82f6;
        }
        .nav-item.active svg { color: #60a5fa; }
        .nav-item svg { flex-shrink: 0; color: #64748b; transition: color 0.2s; }
        .nav-item:hover svg { color: #94a3b8; }
        .nav-label {
          font-size: 13.5px;
          font-weight: 500;
          color: #94a3b8;
          width: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.25s;
        }
        .nav-item.active .nav-label { color: #93c5fd; }
        .sidebar:hover .nav-label {
          width: auto;
          opacity: 1;
          margin-left: 12px;
        }

        .sidebar-bottom {
          margin-top: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 14px;
          gap: 8px;
        }
        .logout-item {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 0 12px;
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
          border: none;
          background: transparent;
          color: #ef4444;
          flex-shrink: 0;
        }
        .logout-item:hover { background: rgba(239,68,68,0.12); }
        .sidebar:hover .logout-item {
          width: 208px;
          padding: 0 14px;
        }
        .logout-label {
          font-size: 13.5px;
          font-weight: 500;
          color: #ef4444;
          width: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.25s;
          margin-left: 12px;
        }
        .sidebar:hover .logout-label {
          width: auto;
          opacity: 1;
        }

        /* ── MAIN ── */
        .main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ── TOP BAR ── */
        .topbar {
          height: 64px;
          min-height: 64px;
          background: #070f1d;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 5;
        }
        .topbar-left h1 {
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.02em;
        }
        .topbar-left p {
          font-size: 11.5px;
          color: #475569;
          margin-top: 1px;
          font-family: 'JetBrains Mono', monospace;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .live-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          color: #22c55e;
          font-weight: 600;
          letter-spacing: 0.05em;
          font-family: 'JetBrains Mono', monospace;
        }
        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .admin-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 6px 12px 6px 8px;
        }
        .admin-avatar {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .admin-info-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .admin-info-role {
          font-size: 10.5px;
          color: #3b82f6;
          font-weight: 500;
        }

        /* ── PAGE BODY ── */
        .page-body {
          padding: 28px 32px;
          flex: 1;
        }

        /* ── STAT CARDS ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .stat-card {
          background: #0a1628;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 22px 24px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          cursor: default;
        }
        .stat-card:hover {
          border-color: rgba(59,130,246,0.3);
          transform: translateY(-2px);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
        }
        .stat-card.blue::before { background: linear-gradient(90deg, #1d4ed8, #60a5fa); }
        .stat-card.green::before { background: linear-gradient(90deg, #065f46, #34d399); }
        .stat-card.amber::before { background: linear-gradient(90deg, #92400e, #fbbf24); }
        .stat-card.red::before { background: linear-gradient(90deg, #7f1d1d, #f87171); }

        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .stat-icon-wrap.blue { background: rgba(37,99,235,0.15); color: #60a5fa; }
        .stat-icon-wrap.green { background: rgba(16,185,129,0.15); color: #34d399; }
        .stat-icon-wrap.amber { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .stat-icon-wrap.red { background: rgba(239,68,68,0.15); color: #f87171; }

        .stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1;
          margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .stat-sub {
          font-size: 11px;
          color: #22c55e;
          margin-top: 6px;
          font-weight: 500;
        }

        /* ── SECTION HEADER ── */
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title-bar {
          width: 3px;
          height: 16px;
          background: #3b82f6;
          border-radius: 2px;
        }
        .section-count {
          font-size: 11px;
          background: rgba(59,130,246,0.15);
          color: #60a5fa;
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 20px;
          padding: 2px 8px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── SEARCH BAR ── */
        .search-wrap {
          background: #0a1628;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          height: 42px;
          min-width: 260px;
          transition: border-color 0.2s;
        }
        .search-wrap:focus-within {
          border-color: rgba(59,130,246,0.4);
        }
        .search-wrap input {
          background: transparent;
          border: none;
          outline: none;
          color: #e2e8f0;
          font-size: 13.5px;
          font-family: 'Be Vietnam Pro', sans-serif;
          width: 200px;
        }
        .search-wrap input::placeholder { color: #475569; }
        .search-wrap svg { color: #475569; flex-shrink: 0; }

        /* ── TABLE BOX ── */
        .table-card {
          background: #0a1628;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .table-card-header {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .table-scroll {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: rgba(255,255,255,0.025);
        }
        th {
          text-align: left;
          padding: 12px 20px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        td {
          padding: 14px 20px;
          font-size: 13.5px;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.035);
          white-space: nowrap;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr {
          transition: background 0.15s;
          cursor: default;
        }
        tbody tr:hover { background: rgba(59,130,246,0.05); }
        .mono { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }

        /* ── BADGES ── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
        }
        .badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }
        .badge-active {
          background: rgba(16,185,129,0.12);
          color: #34d399;
          border: 1px solid rgba(16,185,129,0.2);
        }
        .badge-active .badge-dot { background: #34d399; }
        .badge-blocked {
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .badge-blocked .badge-dot { background: #f87171; }
        .badge-admin {
          background: rgba(96,165,250,0.12);
          color: #93c5fd;
          border: 1px solid rgba(96,165,250,0.2);
          font-size: 10.5px;
          letter-spacing: 0.06em;
        }

        /* ── ACTION BUTTONS ── */
        .btn {
          border: none;
          cursor: pointer;
          font-family: 'Be Vietnam Pro', sans-serif;
          font-weight: 600;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        .btn-md {
          padding: 8px 16px;
          font-size: 13px;
        }
        .btn-blue {
          background: rgba(37,99,235,0.2);
          color: #93c5fd;
          border: 1px solid rgba(59,130,246,0.3);
        }
        .btn-blue:hover {
          background: rgba(37,99,235,0.35);
          border-color: rgba(59,130,246,0.5);
        }
        .btn-green {
          background: rgba(16,185,129,0.15);
          color: #34d399;
          border: 1px solid rgba(16,185,129,0.25);
        }
        .btn-green:hover {
          background: rgba(16,185,129,0.28);
        }
        .btn-red {
          background: rgba(239,68,68,0.15);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
        }
        .btn-red:hover {
          background: rgba(239,68,68,0.28);
        }
        .btn-ghost {
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          color: #e2e8f0;
        }
        .btn-export {
          background: linear-gradient(135deg, #059669, #065f46);
          color: #fff;
          border: none;
          box-shadow: 0 2px 10px rgba(5,150,105,0.3);
        }
        .btn-export:hover {
          box-shadow: 0 4px 16px rgba(5,150,105,0.45);
          transform: translateY(-1px);
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── AMOUNT ── */
        .amount-positive {
          color: #34d399;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
        }

        /* ── MODAL ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-box {
          background: #0d1b2e;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          width: 480px;
          max-width: 95vw;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0,0,0,0.6);
          animation: slideUp 0.25s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header {
          background: linear-gradient(135deg, #0f2044, #1a3a6e);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .modal-title {
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
        }
        .modal-subtitle {
          font-size: 11.5px;
          color: #3b82f6;
          margin-top: 2px;
        }
        .modal-close {
          background: rgba(255,255,255,0.08);
          border: none;
          color: #94a3b8;
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .modal-close:hover { background: rgba(239,68,68,0.2); color: #f87171; }
        .modal-body { padding: 24px 28px; }
        .modal-avatar {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 20px;
          box-shadow: 0 6px 20px rgba(59,130,246,0.3);
        }
        .modal-user-name {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        .modal-user-role { font-size: 12px; color: #3b82f6; font-weight: 600; margin-bottom: 20px; }
        .modal-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 16px 0;
        }
        .modal-field {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .modal-field-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(59,130,246,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #60a5fa;
        }
        .modal-field-label {
          font-size: 11px;
          color: #475569;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 2px;
        }
        .modal-field-value {
          font-size: 14px;
          color: #cbd5e1;
          font-weight: 500;
        }
        .modal-field-value.mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.03em;
        }
        .modal-balance {
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.15);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
        }
        .modal-balance-label { font-size: 11.5px; color: #34d399; font-weight: 500; }
        .modal-balance-value {
          font-size: 20px;
          font-weight: 800;
          color: #34d399;
          font-family: 'JetBrains Mono', monospace;
        }
        .modal-footer {
          padding: 16px 28px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        /* ── RECENT TRANSACTIONS quick view ── */
        .tx-row {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 12px;
        }
        .tx-row:last-child { border-bottom: none; }
        .tx-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(59,130,246,0.12);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa; flex-shrink: 0;
        }
        .tx-name { font-size: 13.5px; font-weight: 600; color: #e2e8f0; }
        .tx-acct { font-size: 11px; color: #475569; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
        .tx-amount { font-size: 14px; font-weight: 700; color: #34d399; font-family: 'JetBrains Mono', monospace; }
        .tx-time { font-size: 11px; color: #475569; margin-top: 2px; text-align: right; }

        /* ── OVERVIEW SECTION ── */
        .overview-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 1000px) {
          .overview-grid { grid-template-columns: 1fr; }
        }

        .divider-h { height: 1px; background: rgba(255,255,255,0.05); margin: 24px 0; }

        /* ── MASKED ACCOUNT ── */
        .acct-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .acct-mask {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: #94a3b8;
          letter-spacing: 0.06em;
        }
        .acct-mask.revealed {
          color: #e2e8f0;
        }
        .btn-reveal {
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          padding: 2px 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .btn-reveal:hover {
          color: #93c5fd;
          background: rgba(59,130,246,0.1);
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>

      <div className="admin-root">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center' }}>
            YN
            <span className="logo-text">YN BANK</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span className="nav-label">Dashboard</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span className="nav-label">Người dùng</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <History size={18} />
            <span className="nav-label">Giao dịch</span>
          </div>

          <div className="sidebar-bottom">
            <button className="logout-item" onClick={logoutAdmin}>
              <LogOut size={18} />
              <span className="logout-label">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="main-content">
          {/* TOP BAR */}
          <div className="topbar">
            <div className="topbar-left">
              <h1>
                {activeTab === 'dashboard' && 'Tổng quan hệ thống'}
                {activeTab === 'users' && 'Quản lý người dùng'}
                {activeTab === 'transactions' && 'Lịch sử giao dịch'}
              </h1>
              <p>{dateStr} · {timeStr}</p>
            </div>
            <div className="topbar-right">
              <div className="live-badge">
                <div className="live-dot" />
                LIVE
              </div>
              <div className="admin-chip">
                <div className="admin-avatar">
                  {admin?.fullName?.[0] || 'A'}
                </div>
                <div>
                  <div className="admin-info-name">{admin?.fullName || 'Admin'}</div>
                  <div className="admin-info-role">Quản trị viên</div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE BODY */}
          <div className="page-body">

            {/* ──────── DASHBOARD ──────── */}
            {activeTab === 'dashboard' && (
              <>
                {/* STAT CARDS */}
                <div className="stats-grid">
                  <div className="stat-card blue">
                    <div className="stat-icon-wrap blue"><Users size={18} /></div>
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Tổng người dùng</div>
                    <div className="stat-sub">↑ Hoạt động</div>
                  </div>
                  <div className="stat-card green">
                    <div className="stat-icon-wrap green"><TrendingUp size={18} /></div>
                    <div className="stat-value">{transactions.length}</div>
                    <div className="stat-label">Tổng giao dịch</div>
                    <div className="stat-sub">↑ Đã xử lý</div>
                  </div>
                  <div className="stat-card amber">
                    <div className="stat-icon-wrap amber"><Wallet size={18} /></div>
                    <div className="stat-value" style={{ fontSize: '18px' }}>
                      {totalMoney >= 1e9
                        ? (totalMoney / 1e9).toFixed(2) + ' tỷ'
                        : totalMoney >= 1e6
                          ? (totalMoney / 1e6).toFixed(1) + ' tr'
                          : totalMoney.toLocaleString('vi-VN')}
                    </div>
                    <div className="stat-label">Tổng tiền hệ thống</div>
                    <div className="stat-sub">₫ VND</div>
                  </div>
                  <div className="stat-card red">
                    <div className="stat-icon-wrap red"><ShieldBan size={18} /></div>
                    <div className="stat-value">{blockedCount}</div>
                    <div className="stat-label">Tài khoản bị khóa</div>
                    <div className="stat-sub" style={{ color: blockedCount > 0 ? '#f87171' : '#34d399' }}>
                      {blockedCount > 0 ? '⚠ Cần xem xét' : '✓ Bình thường'}
                    </div>
                  </div>
                </div>

                {/* OVERVIEW GRID */}
                <div className="overview-grid">
                  {/* Recent users */}
                  <div className="table-card">
                    <div className="table-card-header">
                      <div className="section-title">
                        <div className="section-title-bar" />
                        Người dùng mới nhất
                        <span className="section-count">{users.length}</span>
                      </div>
                      <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('users')}>
                        Xem tất cả <ChevronRight size={13} />
                      </button>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số dư</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 6).map((u) => (
                            <tr key={u._id}>
                              <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.fullName}</td>
                              <td style={{ color: '#64748b', fontSize: '12.5px' }}>{u.email}</td>
                              <td className="amount-positive">{u.balance?.toLocaleString('vi-VN')} ₫</td>
                              <td>
                                {u.role === 'admin'
                                  ? <span className="badge badge-admin">ADMIN</span>
                                  : u.isBlocked
                                    ? <span className="badge badge-blocked"><span className="badge-dot" />Đã khóa</span>
                                    : <span className="badge badge-active"><span className="badge-dot" />Hoạt động</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div className="table-card">
                    <div className="table-card-header">
                      <div className="section-title">
                        <div className="section-title-bar" style={{ background: '#34d399' }} />
                        Giao dịch gần đây
                      </div>
                      <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('transactions')}>
                        Xem tất cả <ChevronRight size={13} />
                      </button>
                    </div>
                    <div style={{ padding: '8px 20px' }}>
                      {transactions.slice(0, 6).map((t) => (
                        <div className="tx-row" key={t._id}>
                          <div className="tx-icon"><History size={16} /></div>
                          <div style={{ flex: 1 }}>
                            <div className="tx-name">{t.fromName || maskAccount(t.fromAccount)}</div>
                            <div className="tx-acct">→ {t.toName || maskAccount(t.toAccount)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="tx-amount">+{Number(t.amount).toLocaleString('vi-VN')} ₫</div>
                            <div className="tx-time">
                              {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ──────── USERS ──────── */}
            {activeTab === 'users' && (
              <div>
                <div className="section-header" style={{ marginBottom: '20px' }}>
                  <div className="section-title">
                    <div className="section-title-bar" />
                    Danh sách người dùng
                    <span className="section-count">{filteredUsers.length}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="search-wrap">
                      <Search size={15} />
                      <input
                        type="text"
                        placeholder="Tìm tên, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-md btn-export" onClick={exportUsersToExcel}>
                      <FileSpreadsheet size={15} />
                      Xuất Excel
                    </button>
                  </div>
                </div>

                <div className="table-card">
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Họ tên</th>
                          <th>Email</th>
                          <th>Số tài khoản</th>
                          <th>Số dư</th>
                          <th>Vai trò</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, idx) => (
                          <tr key={u._id}>
                            <td className="mono" style={{ color: '#475569' }}>{String(idx + 1).padStart(2, '0')}</td>
                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{u.fullName}</td>
                            <td style={{ color: '#64748b' }}>{u.email}</td>
                            <td>
                              <span className="acct-mask mono">
                                {maskAccount(u.accountNumber)}
                              </span>
                            </td>
                            <td className="amount-positive">{u.balance?.toLocaleString('vi-VN')} ₫</td>
                            <td>
                              {u.role === 'admin'
                                ? <span className="badge badge-admin">ADMIN</span>
                                : <span style={{ color: '#64748b', fontSize: '13px' }}>Khách hàng</span>
                              }
                            </td>
                            <td>
                              {u.isBlocked
                                ? <span className="badge badge-blocked"><span className="badge-dot" />Đã khóa</span>
                                : <span className="badge badge-active"><span className="badge-dot" />Hoạt động</span>
                              }
                            </td>
                            <td>
                              <div className="action-group">
                                <button className="btn btn-sm btn-blue" onClick={() => { setSelectedUser(u); setShowModal(true); }}>
                                  Chi tiết
                                </button>
                                <button className="btn btn-sm btn-ghost" onClick={() => exportUserTransactions(u)}>
                                  <FileSpreadsheet size={13} />
                                  Sao kê
                                </button>
                                {u.role !== 'admin' && (
                                  u.isBlocked
                                    ? <button className="btn btn-sm btn-green" onClick={() => unblockUser(u._id)}>
                                        <Unlock size={13} /> Mở khóa
                                      </button>
                                    : <button className="btn btn-sm btn-red" onClick={() => blockUser(u._id)}>
                                        <Lock size={13} /> Khóa
                                      </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TRANSACTIONS ──────── */}
            {activeTab === 'transactions' && (
              <div>
                <div className="section-header" style={{ marginBottom: '20px' }}>
                  <div className="section-title">
                    <div className="section-title-bar" style={{ background: '#34d399' }} />
                    Lịch sử giao dịch
                    <span className="section-count">{transactions.length}</span>
                  </div>
                  <button className="btn btn-md btn-export" onClick={exportTransactionsToExcel}>
                    <FileSpreadsheet size={15} />
                    Xuất sao kê
                  </button>
                </div>

                <div className="table-card">
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Người gửi</th>
                          <th>STK gửi</th>
                          <th>Người nhận</th>
                          <th>STK nhận</th>
                          <th>Số tiền</th>
                          <th>Nội dung</th>
                          <th>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t, idx) => (
                          <tr key={t._id}>
                            <td className="mono" style={{ color: '#475569' }}>{String(idx + 1).padStart(3, '0')}</td>
                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t.fromName || '—'}</td>
                            <td className="mono">{maskAccount(t.fromAccount)}</td>
                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t.toName || '—'}</td>
                            <td className="mono">{maskAccount(t.toAccount)}</td>
                            <td className="amount-positive">{Number(t.amount).toLocaleString('vi-VN')} ₫</td>
                            <td style={{ color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.description || '—'}
                            </td>
                            <td className="mono" style={{ color: '#64748b', fontSize: '12px' }}>
                              {new Date(t.createdAt).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowModal(false); }}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <div className="modal-title">Thông tin tài khoản</div>
                <div className="modal-subtitle">Hồ sơ khách hàng · YN Bank</div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-avatar">
                {selectedUser.fullName?.[0] || '?'}
              </div>
              <div className="modal-user-name">{selectedUser.fullName}</div>
              <div className="modal-user-role">
                {selectedUser.role === 'admin' ? '🛡 Quản trị viên' : '👤 Khách hàng'}
              </div>

              <div className="modal-field">
                <div className="modal-field-icon"><Mail size={14} /></div>
                <div>
                  <div className="modal-field-label">Email</div>
                  <div className="modal-field-value">{selectedUser.email}</div>
                </div>
              </div>

              <div className="modal-field">
                <div className="modal-field-icon"><Phone size={14} /></div>
                <div>
                  <div className="modal-field-label">Số điện thoại</div>
                  <div className="modal-field-value mono">{selectedUser.phone || '—'}</div>
                </div>
              </div>

              <div className="modal-field">
                <div className="modal-field-icon"><CreditCard size={14} /></div>
                <div style={{ flex: 1 }}>
                  <div className="modal-field-label">Số tài khoản</div>
                  <div className="modal-field-value mono" style={{ letterSpacing: '0.12em', fontSize: '15px', color: '#94a3b8', marginTop: '2px' }}>
                    {maskAccount(selectedUser.accountNumber)}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#334155', marginTop: '4px' }}>
                    Số tài khoản được mã hóa · Chỉ hiển thị 4 số cuối
                  </div>
                </div>
              </div>

              <div className="modal-field">
                <div className="modal-field-icon"><AlertCircle size={14} /></div>
                <div>
                  <div className="modal-field-label">Trạng thái</div>
                  <div style={{ marginTop: '2px' }}>
                    {selectedUser.isBlocked
                      ? <span className="badge badge-blocked"><span className="badge-dot" />Tài khoản bị khóa</span>
                      : <span className="badge badge-active"><span className="badge-dot" />Đang hoạt động</span>
                    }
                  </div>
                </div>
              </div>

              <div className="modal-balance">
                <div>
                  <div className="modal-balance-label">Số dư khả dụng</div>
                  <div style={{ fontSize: '11px', color: '#065f46', marginTop: '2px' }}>Cập nhật theo thời gian thực</div>
                </div>
                <div className="modal-balance-value">
                  {selectedUser.balance?.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-md btn-ghost" onClick={() => exportUserTransactions(selectedUser)}>
                <FileSpreadsheet size={14} /> Xuất sao kê
              </button>
              {selectedUser.role !== 'admin' && (
                selectedUser.isBlocked
                  ? <button className="btn btn-md btn-green" onClick={() => { unblockUser(selectedUser._id); setShowModal(false); }}>
                      <Unlock size={14} /> Mở khóa tài khoản
                    </button>
                  : <button className="btn btn-md btn-red" onClick={() => { blockUser(selectedUser._id); setShowModal(false); }}>
                      <Lock size={14} /> Khóa tài khoản
                    </button>
              )}
              <button className="btn btn-md btn-blue" onClick={() => setShowModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}