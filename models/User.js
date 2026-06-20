const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

  // Họ tên
  fullName: {
    type: String,
    required: true
  },

  // Email
  email: {
    type: String,
    required: true,
    unique: true
  },

  // Password đăng nhập
  password: {
    type: String,
    required: true
  },

  // Password chuyển tiền
  transferPassword: {
    type: String,
    required: true
  },

  // Số điện thoại
  phone: {
    type: String
  },

  // Số tài khoản — lưu dạng mã hóa AES-256
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },

  // HMAC hash của STK — dùng để lookup/query nhanh mà không cần giải mã
  accountNumberHash: {
    type: String,
    unique: true,
    sparse: true
  },

  // Số dư
  balance: {
    type: Number,
    default: 0
  },

  // Khóa tài khoản
  isBlocked: {
    type: Boolean,
    default: false
  },

  // Vai trò
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Ngày tạo
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  'User',
  UserSchema
);