const mongoose = require('mongoose');

// ================================================
// AUDIT LOG MODEL
// Ghi lại mọi action nhạy cảm trong hệ thống
// ================================================

const AuditLogSchema = new mongoose.Schema({

  // Ai thực hiện (null = anonymous)
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  actorName: {
    type: String,
    default: 'Anonymous'
  },

  actorRole: {
    type: String,
    enum: ['user', 'admin', 'system', 'anonymous'],
    default: 'anonymous'
  },

  // Hành động
  action: {
    type: String,
    required: true,
    enum: [
      // ── Auth ──────────────────────────────────
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'ADMIN_LOGIN_SUCCESS',
      'ADMIN_LOGIN_FAILED',
      'REGISTER',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET_REQUEST',

      // ── Transaction ───────────────────────────
      'TRANSFER_SUCCESS',
      'TRANSFER_FAILED',
      'TRANSACTION_DELETE',       // xóa giao dịch (soft delete)
      'TRANSACTION_RESTORE',      // khôi phục giao dịch đã xóa

      // ── Profile ───────────────────────────────
      'PROFILE_UPDATE',           // user tự cập nhật thông tin
      'PROFILE_VIEW',             // xem thông tin tài khoản

      // ── Admin actions ─────────────────────────
      'ADMIN_BLOCK_USER',
      'ADMIN_UNBLOCK_USER',
      'ADMIN_DELETE_USER',
      'ADMIN_ADD_MONEY',
      'ADMIN_SUBTRACT_MONEY',
      'ADMIN_VIEW_USERS',
      'ADMIN_VIEW_TRANSACTIONS',
      'ADMIN_VIEW_AUDIT_LOGS',    // admin xem chính audit log này
    ]
  },

  // Mô tả chi tiết
  description: {
    type: String,
    required: true
  },

  // Dữ liệu thêm (không lưu thông tin nhạy cảm như password, token)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Kết quả
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'WARNING'],
    default: 'SUCCESS'
  },

  // IP address
  ipAddress: {
    type: String,
    default: 'unknown'
  },

  // User agent
  userAgent: {
    type: String,
    default: 'unknown'
  },

  // Thời gian (không cho phép sửa sau khi tạo)
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,  // không thể sửa sau khi insert
    index: true
  }

});

// ── Indexes để query nhanh ────────────────────────
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1 });
AuditLogSchema.index({ ipAddress: 1, createdAt: -1 }); // phát hiện 1 IP tấn công

// ── Không cho phép sửa hoặc xóa log ──────────────
AuditLogSchema.pre(['updateOne', 'findOneAndUpdate', 'deleteOne', 'findOneAndDelete'], function (next) {
  const err = new Error('Audit log không được phép sửa hoặc xóa');
  next(err);
});

// ── Helper tạo log nhanh ──────────────────────────
// Dùng: await AuditLog.log(req, 'LOGIN_SUCCESS', 'Đăng nhập thành công', { ... })
AuditLogSchema.statics.log = async function (req, action, description, metadata = {}, status = 'SUCCESS') {
  try {
    await this.create({
      actorId:     req.user?._id    || null,
      actorName:   req.user?.username || 'Anonymous',
      actorRole:   req.user?.role   || 'anonymous',
      action,
      description,
      metadata,
      status,
      ipAddress:   req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent:   req.headers['user-agent'] || 'unknown',
    });
  } catch (err) {
    // Không để lỗi log làm crash request chính
    console.error('[AuditLog] Lỗi ghi log:', err.message);
  }
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);


// ================================================
// CÁCH SỬ DỤNG TRONG CONTROLLER
// ================================================
//
// Cách 1 — Dùng static helper (ngắn gọn, khuyên dùng):
//
//   const AuditLog = require('../models/AuditLog');
//
//   // Trong controller đăng nhập:
//   await AuditLog.log(req, 'LOGIN_SUCCESS', `User ${user.username} đăng nhập thành công`);
//
//   // Trong controller xóa giao dịch:
//   await AuditLog.log(
//     req,
//     'TRANSACTION_DELETE',
//     `Xóa giao dịch ${transaction._id} — Lý do: ${reason}`,
//     { transactionId: transaction._id, amount: transaction.amount, reason },
//     'SUCCESS'
//   );
//
//   // Khi có lỗi:
//   await AuditLog.log(req, 'LOGIN_FAILED', `Sai mật khẩu cho tài khoản ${username}`, {}, 'FAILED');
//
//
// Cách 2 — Tạo thủ công (khi không có req, ví dụ cron job):
//
//   await AuditLog.create({
//     actorId:     null,
//     actorName:   'system',
//     actorRole:   'system',
//     action:      'TRANSFER_SUCCESS',
//     description: 'Hệ thống tự động xử lý giao dịch định kỳ',
//     metadata:    { jobId: '...', amount: 500000 },
//     status:      'SUCCESS',
//     ipAddress:   'system',
//     userAgent:   'cron-job',
//   });