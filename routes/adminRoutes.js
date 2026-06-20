const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const auditLog = require('../utils/auditLogger');
const adminAuth = require('../middleware/adminAuth');
const { decryptAccount, maskAccount } = require('../utils/encryptionHelper');


// ===============================
// LOGIN ADMIN
// ===============================
router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: 'admin' });

    if (!admin) {
      return res.status(404).json({ msg: 'Admin không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      await auditLog({
        req,
        action: 'ADMIN_LOGIN_FAILED',
        description: `Admin đăng nhập thất bại: sai mật khẩu (${email})`,
        actorId: admin._id,
        actorName: admin.fullName,
        actorRole: 'admin',
        status: 'FAILED',
        metadata: { email }
      });
      return res.status(400).json({ msg: 'Sai mật khẩu' });
    }

    if (admin.isBlocked) {
      return res.status(403).json({ msg: 'Tài khoản admin đã bị khóa' });
    }

    const token = jwt.sign(
      { user: { id: admin._id } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    await auditLog({
      req,
      action: 'ADMIN_LOGIN_SUCCESS',
      description: `Admin đăng nhập thành công: ${email}`,
      actorId: admin._id,
      actorName: admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS',
      metadata: { email }
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// LẤY DANH SÁCH USER (không bao gồm admin)
// ===============================
router.get('/users', adminAuth, async (req, res) => {
  try {

    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password -transferPassword -accountNumberHash')
      .sort({ createdAt: -1 });

    // Mask STK — admin chỉ thấy 4 số cuối
    const safeUsers = users.map(u => {
      const obj = u.toObject();
      try {
        obj.accountNumber = maskAccount(decryptAccount(u.accountNumber));
      } catch {
        obj.accountNumber = '******';
      }
      return obj;
    });

    await auditLog({
      req,
      action: 'ADMIN_VIEW_USERS',
      description: `Admin xem danh sách người dùng`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS'
    });

    res.json(safeUsers);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// LẤY DANH SÁCH GIAO DỊCH
// ===============================
router.get('/transactions', adminAuth, async (req, res) => {
  try {

    const transactions = await Transaction.find().sort({ createdAt: -1 });

    const result = transactions.map((t) => ({
      _id: t._id,
      fromName: t.fromName || '-',
      fromAccount: t.fromAccount || '-',
      toName: t.toName || '-',
      toAccount: t.toAccount || '-',
      amount: t.amount,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt
    }));

    await auditLog({
      req,
      action: 'ADMIN_VIEW_TRANSACTIONS',
      description: `Admin xem danh sách giao dịch`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS'
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// KHÓA USER
// ===============================
router.put('/block/:id', adminAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'Không thể khóa admin' });
    }

    user.isBlocked = true;
    await user.save();

    await auditLog({
      req,
      action: 'ADMIN_BLOCK_USER',
      description: `Admin khóa tài khoản: ${user.fullName} (${user.email})`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS',
      metadata: { targetUserId: user._id, targetEmail: user.email }
    });

    res.json({ msg: 'Đã khóa tài khoản' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// MỞ KHÓA USER
// ===============================
router.put('/unblock/:id', adminAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    user.isBlocked = false;
    await user.save();

    await auditLog({
      req,
      action: 'ADMIN_UNBLOCK_USER',
      description: `Admin mở khóa tài khoản: ${user.fullName} (${user.email})`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS',
      metadata: { targetUserId: user._id, targetEmail: user.email }
    });

    res.json({ msg: 'Đã mở khóa tài khoản' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// XÓA USER
// ===============================
router.delete('/delete/:id', adminAuth, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'Không thể xóa admin' });
    }

    await User.findByIdAndDelete(req.params.id);

    await auditLog({
      req,
      action: 'ADMIN_DELETE_USER',
      description: `Admin xóa tài khoản: ${user.fullName} (${user.email})`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS',
      metadata: { targetUserId: user._id, targetEmail: user.email }
    });

    res.json({ msg: 'Xóa user thành công' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// NẠP TIỀN USER
// ===============================
router.put('/add-money/:id', adminAuth, async (req, res) => {
  try {

    const { amount } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    const addAmount = Number(amount);
    user.balance += addAmount;
    await user.save();

    await auditLog({
      req,
      action: 'ADMIN_ADD_MONEY',
      description: `Admin nạp ${addAmount.toLocaleString('vi-VN')} ₫ vào tài khoản: ${user.fullName}`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS',
      metadata: { targetUserId: user._id, amount: addAmount, newBalance: user.balance }
    });

    res.json({ msg: 'Nạp tiền thành công', balance: user.balance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// TRỪ TIỀN USER
// ===============================
router.put('/subtract-money/:id', adminAuth, async (req, res) => {
  try {

    const { amount } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'Không tìm thấy user' });

    if (user.balance < Number(amount)) {
      return res.status(400).json({ msg: 'Số dư không đủ' });
    }

    const subAmount = Number(amount);
    user.balance -= subAmount;
    await user.save();

    await auditLog({
      req,
      action: 'ADMIN_SUBTRACT_MONEY',
      description: `Admin trừ ${subAmount.toLocaleString('vi-VN')} ₫ khỏi tài khoản: ${user.fullName}`,
      actorId: req.admin.id,
      actorName: req.admin.fullName,
      actorRole: 'admin',
      status: 'SUCCESS',
      metadata: { targetUserId: user._id, amount: subAmount, newBalance: user.balance }
    });

    res.json({ msg: 'Trừ tiền thành công', balance: user.balance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});


// ===============================
// AUDIT LOG
// ===============================
router.get('/audit-logs', adminAuth, async (req, res) => {
  try {

    const { action, status, limit = 100, page = 1 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(filter);

    res.json({ logs, total, page: Number(page), limit: Number(limit) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
});

module.exports = router;