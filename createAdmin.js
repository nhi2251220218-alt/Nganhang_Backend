const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    // Xóa admin cũ nếu có để tạo lại sạch
    await User.deleteOne({ email: 'admin@ynbanking.com' });

    const hashedPassword = await bcrypt.hash('Admin@123456', 10);

    const admin = new User({
      fullName: 'Administrator',
      email: 'admin@ynbanking.com',
      password: hashedPassword,
      transferPassword: hashedPassword,
      phone: '0000000000',
      accountNumber: 'ADMIN',          // không mã hóa, không dùng
      accountNumberHash: 'ADMIN',      // không dùng để lookup
      balance: 0,
      role: 'admin',
      isBlocked: false,
    });

    await admin.save();

    console.log('====================================');
    console.log('✅ Tạo tài khoản admin thành công!');
    console.log('====================================');
    console.log('📧 Email   : admin@ynbanking.com');
    console.log('🔑 Password: Admin@123456');
    console.log('====================================');

    process.exit();

  })
  .catch((err) => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  });