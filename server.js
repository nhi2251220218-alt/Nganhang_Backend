const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (hỗ trợ cả 2 prefix để tương thích frontend)
app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);       // frontend gọi /api/user
app.use('/api/users', userRoutes);      // giữ lại cũ

app.use('/api/transaction', transactionRoutes);   // frontend gọi /api/transaction
app.use('/api/transactions', transactionRoutes);  // giữ lại cũ

app.use('/api/admin', adminRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((err) => {
    console.log(err);
  });