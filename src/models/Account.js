// src/models/Account.js
// Mongoose schema for a bank account

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      unique: true,
      required: [true, 'Account number is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    balance: {
      type: Number,
      required: [true, 'Balance is required'],
      min: [0, 'Balance cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
