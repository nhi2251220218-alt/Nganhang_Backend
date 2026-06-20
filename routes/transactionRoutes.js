const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const User = require('../models/User');
const Transaction = require('../models/Transaction');

const bcrypt = require('bcryptjs');
const auditLog = require('../utils/auditLogger');
const {
  hashAccountForSearch,
  decryptAccount,
  maskAccount
} = require('../utils/encryptionHelper');


// ==============================
// NẠP TIỀN GIẢ LẬP
// ==============================
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    const depositAmount = parseInt(amount, 10);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({
        msg: 'Số tiền không hợp lệ'
      });
    }

    if (depositAmount > 500000000) {
      return res.status(400).json({
        msg: 'Tối đa 500 triệu mỗi lần nạp'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        msg: 'Không tìm thấy tài khoản'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        msg: 'Tài khoản đã bị khóa'
      });
    }

    user.balance = Number(user.balance) + depositAmount;
    await user.save();

    // Lưu giao dịch
    const myMasked = maskAccount(decryptAccount(user.accountNumber));

    const tx = new Transaction({
      fromAccount: 'SYSTEM',
      fromName: 'Nạp tiền giả lập',
      toAccount: myMasked,
      toName: user.fullName,
      amount: depositAmount,
      description: 'Nạp tiền vào tài khoản',
      status: 'success'
    });

    await tx.save();

    // Audit log
    await auditLog({
      req,
      action: 'DEPOSIT',
      description: `Nạp tiền thành công: ${user.fullName} +${depositAmount.toLocaleString('vi-VN')} ₫`,
      actorId: user._id,
      actorName: user.fullName,
      actorRole: 'user',
      status: 'SUCCESS',
      metadata: { amount: depositAmount }
    });

    res.json({
      msg: 'Nạp tiền thành công',
      balance: Math.round(user.balance)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Lỗi server'
    });
  }
});


// ==============================
// CHUYỂN TIỀN
// ==============================
router.post('/transfer', auth, async (req, res) => {
  try {
    const {
      toAccount,
      amount,
      description,
      transferPassword
    } = req.body;

    // Kiểm tra mật khẩu chuyển tiền
    if (!transferPassword) {
      return res.status(400).json({
        msg: 'Thiếu mật khẩu chuyển tiền'
      });
    }

    // Tìm người gửi
    const sender = await User.findById(req.user.id);

    if (!sender) {
      return res.status(404).json({
        msg: 'Không tìm thấy tài khoản gửi'
      });
    }

    // Kiểm tra tài khoản bị khóa
    if (sender.isBlocked) {
      return res.status(403).json({
        msg: 'Tài khoản đã bị khóa'
      });
    }

    // So sánh mật khẩu chuyển tiền
    const isMatch = await bcrypt.compare(
      transferPassword,
      sender.transferPassword
    );

    if (!isMatch) {
      await auditLog({
        req,
        action: 'TRANSFER_FAILED',
        description: `Chuyển tiền thất bại: sai mật khẩu chuyển tiền`,
        actorId: sender._id,
        actorName: sender.fullName,
        actorRole: 'user',
        status: 'FAILED',
        metadata: { toAccount: maskAccount(toAccount), amount }
      });
      return res.status(400).json({
        msg: 'Mật khẩu chuyển tiền không đúng'
      });
    }

    // Tìm người nhận — dùng hash để lookup (STK trong DB đã mã hóa)
    const toAccountHash = hashAccountForSearch(toAccount);
    const receiver = await User.findOne({ accountNumberHash: toAccountHash });

    if (!receiver) {
      return res.status(404).json({
        msg: 'Tài khoản nhận không tồn tại'
      });
    }

    // Không cho chuyển cho chính mình
    if (sender.accountNumberHash === toAccountHash) {
      return res.status(400).json({
        msg: 'Không thể chuyển cho chính mình'
      });
    }

    // Chuyển amount về số nguyên
    const transferAmount = parseInt(amount, 10);

    // Kiểm tra số tiền
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({
        msg: 'Số tiền không hợp lệ'
      });
    }

    // Kiểm tra số dư
    if (Number(sender.balance) < transferAmount) {
      return res.status(400).json({
        msg: 'Số dư không đủ'
      });
    }

    // Trừ tiền
    sender.balance = Number(sender.balance) - transferAmount;

    // Cộng tiền
    receiver.balance = Number(receiver.balance) + transferAmount;

    await sender.save();
    await receiver.save();

    // Lưu giao dịch — STK lưu dạng masked
    const senderMasked = maskAccount(decryptAccount(sender.accountNumber));
    const receiverMasked = maskAccount(decryptAccount(receiver.accountNumber));

    const tx = new Transaction({
      fromAccount: senderMasked,
      fromName: sender.fullName,
      toAccount: receiverMasked,
      toName: receiver.fullName,
      amount: transferAmount,
      description,
      status: 'success'
    });

    await tx.save();

    // Audit log
    await auditLog({
      req,
      action: 'TRANSFER_SUCCESS',
      description: `Chuyển tiền thành công: ${sender.fullName} → ${receiver.fullName}, ${transferAmount.toLocaleString('vi-VN')} ₫`,
      actorId: sender._id,
      actorName: sender.fullName,
      actorRole: 'user',
      status: 'SUCCESS',
      metadata: {
        fromAccount: senderMasked,
        toAccount: receiverMasked,
        amount: transferAmount,
        description
      }
    });

    res.json({
      msg: 'Chuyển tiền thành công',
      balance: Math.round(sender.balance)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Giao dịch thất bại'
    });
  }
});


// ==============================
// LẤY TÊN NGƯỜI NHẬN
// ==============================
router.get('/recipient-name', auth, async (req, res) => {
  try {
    const { accountNumber } = req.query;

    if (!accountNumber) {
      return res.status(400).json({
        msg: 'Thiếu số tài khoản'
      });
    }

    const acctHash = hashAccountForSearch(accountNumber);
    const user = await User.findOne({ accountNumberHash: acctHash });

    if (!user) {
      return res.status(404).json({
        msg: 'Không tìm thấy tài khoản'
      });
    }

    res.json({
      name: user.fullName
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Lỗi server'
    });
  }
});


// ==============================
// LỊCH SỬ GIAO DỊCH
// ==============================
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        msg: 'Không tìm thấy người dùng'
      });
    }

    const { startDate, endDate } = req.query;

    const myMasked = maskAccount(decryptAccount(user.accountNumber));

    let filter = {
      $or: [
        { fromAccount: myMasked },
        { toAccount: myMasked }
      ]
    };

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Lỗi lấy lịch sử giao dịch'
    });
  }
});

module.exports = router;