const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ================================================
// ADMIN AUTH MIDDLEWARE
// Chỉ cho phép request có token hợp lệ + role admin
// ================================================

module.exports = async (req, res, next) => {
  try {

    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({
        msg: 'Không có token'
      });
    }

    const cleanToken = token.replace('Bearer ', '');

    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET
    );

    // Hỗ trợ cả 2 cấu trúc token (user.id hoặc id)
    const userId = decoded.user?.id || decoded.id;

    if (!userId) {
      return res.status(401).json({
        msg: 'Token không hợp lệ'
      });
    }

    // Verify trong DB — đảm bảo user vẫn tồn tại và là admin
    const admin = await User.findById(userId).select('role isBlocked fullName email');

    if (!admin) {
      return res.status(401).json({
        msg: 'Tài khoản không tồn tại'
      });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({
        msg: 'Không có quyền truy cập'
      });
    }

    if (admin.isBlocked) {
      return res.status(403).json({
        msg: 'Tài khoản admin đã bị khóa'
      });
    }

    req.admin = {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role
    };

    next();

  } catch (err) {
    return res.status(401).json({
      msg: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};