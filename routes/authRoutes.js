const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/User');
const auditLog = require('../utils/auditLogger');
const {
  encryptAccount,
  hashAccountForSearch
} = require('../utils/encryptionHelper');


// =========================
// ĐĂNG KÝ
// =========================
router.post('/register', async (req, res) => {

  try {

    const {
      fullName,
      email,
      password,
      transferPassword,
      phone,
      chosenAccountNumber
    } = req.body;

    // Validate thông tin cơ bản
    if (!fullName || !email || !password || !transferPassword) {
      return res.status(400).json({
        msg: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    // Validate STK: bắt buộc, đúng 10 số, bắt đầu bằng 0
    if (!chosenAccountNumber) {
      return res.status(400).json({
        msg: 'Vui lòng chọn số tài khoản'
      });
    }
    if (!/^\d{10}$/.test(chosenAccountNumber)) {
      return res.status(400).json({
        msg: 'Số tài khoản phải đúng 10 chữ số'
      });
    }
    if (!chosenAccountNumber.startsWith('0')) {
      return res.status(400).json({
        msg: 'Số tài khoản phải bắt đầu bằng số 0'
      });
    }

    // Không cho trùng password
    if (password === transferPassword) {
      return res.status(400).json({
        msg: 'Mật khẩu đăng nhập và mật khẩu chuyển tiền không được giống nhau'
      });
    }

    // Check email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: 'Email đã tồn tại'
      });
    }

    // Check STK trùng — dùng hash để tìm kiếm
    const stkHash = hashAccountForSearch(chosenAccountNumber);
    const existingAccount = await User.findOne({ accountNumberHash: stkHash });
    if (existingAccount) {
      return res.status(400).json({
        msg: 'Số tài khoản đã được sử dụng, vui lòng chọn số khác'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedTransferPassword = await bcrypt.hash(transferPassword, 10);

    // Mã hóa STK trước khi lưu DB
    const encryptedAccount = encryptAccount(chosenAccountNumber);

    // Tạo user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      transferPassword: hashedTransferPassword,
      phone,
      accountNumber: encryptedAccount,
      accountNumberHash: stkHash
    });

    await user.save();

    // Ghi audit log
    await auditLog({
      req,
      action: 'REGISTER',
      description: `Tài khoản mới được tạo: ${email}`,
      actorId: user._id,
      actorName: fullName,
      actorRole: 'user',
      status: 'SUCCESS',
      metadata: { email, maskedAccount: `******${chosenAccountNumber.slice(-4)}` }
    });

    res.status(201).json({
      msg: 'Đăng ký thành công',
      accountNumber: chosenAccountNumber
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      msg: 'Lỗi server'
    });

  }

});


// =========================
// ĐĂNG NHẬP
// =========================
router.post('/login', async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // Check user
    const user = await User.findOne({ email });

    if (!user) {
      // Audit log: login thất bại — email không tồn tại
      await auditLog({
        req,
        action: 'LOGIN_FAILED',
        description: `Đăng nhập thất bại: email không tồn tại (${email})`,
        status: 'FAILED',
        metadata: { email }
      });
      return res.status(400).json({
        msg: 'Email không tồn tại'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await auditLog({
        req,
        action: 'LOGIN_FAILED',
        description: `Đăng nhập thất bại: sai mật khẩu (${email})`,
        actorId: user._id,
        actorName: user.fullName,
        actorRole: user.role,
        status: 'FAILED',
        metadata: { email }
      });
      return res.status(400).json({
        msg: 'Mật khẩu sai'
      });
    }

    if (user.isBlocked) {
      await auditLog({
        req,
        action: 'LOGIN_FAILED',
        description: `Đăng nhập thất bại: tài khoản bị khóa (${email})`,
        actorId: user._id,
        actorName: user.fullName,
        actorRole: user.role,
        status: 'WARNING',
        metadata: { email }
      });
      return res.status(403).json({
        msg: 'Tài khoản đã bị khóa'
      });
    }

    // Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Audit log: đăng nhập thành công
    await auditLog({
      req,
      action: 'LOGIN_SUCCESS',
      description: `Đăng nhập thành công: ${email}`,
      actorId: user._id,
      actorName: user.fullName,
      actorRole: user.role,
      status: 'SUCCESS',
      metadata: { email }
    });

    // Giải mã STK chỉ để trả về cho chính user đó
    const { decryptAccount } = require('../utils/encryptionHelper');
    const plainAccount = decryptAccount(user.accountNumber);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        accountNumber: plainAccount,
        balance: user.balance
      }
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      msg: 'Lỗi server'
    });

  }

});

module.exports = router;