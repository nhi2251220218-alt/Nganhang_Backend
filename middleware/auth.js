const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  try {

    // Lấy token từ header
    const token = req.header('Authorization');

    // Không có token
    if (!token) {
      return res.status(401).json({
        msg: 'Không có token'
      });
    }

    // Xóa "Bearer "
    const cleanToken = token.replace('Bearer ', '');

    // Giải mã token
    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET
    );

    // Chỉ lưu id user
    req.user = {
      id: decoded.id
    };

    next();

  } catch (err) {

    return res.status(401).json({
      msg: 'Token không hợp lệ'
    });

  }

};