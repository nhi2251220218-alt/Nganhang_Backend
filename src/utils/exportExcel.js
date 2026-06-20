import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ======================
// EXPORT USERS
// ======================
export const exportUsersToExcel = (users) => {
  const data = users.map((u, index) => ({
    STT: index + 1,
    HoTen: u.fullName,
    Email: u.email,
    SoDienThoai: u.phone,
    SoDu: u.balance,
    TrangThai: u.isBlocked ? 'Bị khóa' : 'Hoạt động',
    NgayTao: u.createdAt
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Users');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(file, 'danh-sach-nguoi-dung.xlsx');
};

// ======================
// EXPORT TRANSACTIONS
// ======================
export const exportTransactionsToExcel = (transactions) => {
  const data = transactions.map((t, index) => ({
    STT: index + 1,
    NguoiGui: t.senderEmail,
    NguoiNhan: t.receiverEmail,
    SoTien: t.amount,
    NoiDung: t.message,
    ThoiGian: t.createdAt
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(file, 'danh-sach-giao-dich.xlsx');
};