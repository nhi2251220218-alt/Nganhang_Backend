const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({

  fromAccount: {
    type: String,
    required: true
  },

  fromName: {
    type: String
  },

  toAccount: {
    type: String,
    required: true
  },

  toName: {
    type: String
  },

  amount: {
    type: Number,
    required: true
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});
TransactionSchema.index({
  fromAccount: 1,
  createdAt: -1
});

TransactionSchema.index({
  toAccount: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  'Transaction',
  TransactionSchema
);
