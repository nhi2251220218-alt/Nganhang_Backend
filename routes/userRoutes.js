const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const auth = require('../middleware/auth');

const User = require('../models/User');

const { decryptAccount } = require('../utils/encryptionHelper');


// ===============================
// Xem thông tin cá nhân + số dư
// ===============================
router.get('/profile', auth, async (req, res) => {

  try {

    const user = await User.findById(
      req.user.id
    ).select('-password -transferPassword');

    if (!user) {
      return res.status(404).json({
        msg: 'Không tìm thấy người dùng'
      });
    }

    // Giải mã STK trước khi trả về
    const plainAccount = decryptAccount(user.accountNumber);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      balance: user.balance,
      role: user.role,
      isBlocked: user.isBlocked,
      accountNumber: plainAccount,   // ← trả về số thật, không phải mã hóa
      createdAt: user.createdAt,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: 'Lỗi server'
    });

  }

});


// ===============================
// Cập nhật thông tin cá nhân
// ===============================
router.put('/profile', auth, async (req, res) => {

  try {

    const {
      fullName,
      phone
    } = req.body;

    await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        phone
      }
    );

    res.json({
      msg: 'Cập nhật thành công'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: 'Lỗi server'
    });

  }

});


// ===============================
// Đổi mật khẩu
// ===============================
router.put('/change-password', auth, async (req, res) => {

  try {

    const {
      oldPassword,
      newPassword
    } = req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        msg: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: 'Mật khẩu cũ không đúng'
      });
    }

    // Mã hóa mật khẩu mới
    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.json({
      msg: 'Đổi mật khẩu thành công'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: 'Lỗi server'
    });

  }

});


module.exports = router;