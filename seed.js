const mongoose = require('mongoose');

require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    const result = await User.updateMany(
      {},
      {
        $set: {
          balance: 50000000
        }
      }
    );

    console.log(
      'Đã cập nhật',
      result.modifiedCount,
      'tài khoản'
    );

    process.exit();

  })
  .catch((err) => {

    console.log(err);

    process.exit(1);

  });