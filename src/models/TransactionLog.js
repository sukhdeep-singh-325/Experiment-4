// src/models/TransactionLog.js
// Mongoose schema for transaction audit logs

const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema(
  {
    fromAccount: { type: String, required: true },
    toAccount: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true,
    },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TransactionLog', transactionLogSchema);
