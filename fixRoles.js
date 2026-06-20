const mongoose = require('mongoose');

require('dotenv').config();

const User = require('./models/User');


mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    // đổi toàn bộ thành user
    await User.updateMany(
      {},
      {
        role: 'user'
      }
    );

    // chỉ admin@gmail.com là admin
    await User.updateOne(
      {
        email: 'admin@gmail.com'
      },
      {
        role: 'admin'
      }
    );

    console.log(
      'Đã sửa role thành công'
    );

    process.exit();

  })
  .catch((err) => {

    console.log(err);

    process.exit(1);

  });