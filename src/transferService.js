// src/transferService.js
// Core ACID-compliant transfer logic using MongoDB transactions

const mongoose = require('mongoose');
const Account = require('./models/Account');
const TransactionLog = require('./models/TransactionLog');

/**
 * Transfer funds between two accounts using a MongoDB session.
 * Demonstrates ACID properties:
 *   - Atomicity: both debit and credit succeed or both are rolled back
 *   - Consistency: total balance remains constant
 *   - Isolation: other sessions see only committed data
 *   - Durability: committed changes persist
 *
 * @param {string} fromAccountNumber - Sender account number
 * @param {string} toAccountNumber   - Receiver account number
 * @param {number} amount            - Amount to transfer
 * @returns {object} { ok, from, to } on success or { ok, error } on failure
 */
async function transferFunds({ fromAccountNumber, toAccountNumber, amount }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session, new: true };

    // Lock and fetch both accounts within the transaction session
    const from = await Account.findOne({ accountNumber: fromAccountNumber }).session(session);
    const to   = await Account.findOne({ accountNumber: toAccountNumber }).session(session);

    if (!from || !to) {
      throw new Error(`Account not found: ${!from ? fromAccountNumber : toAccountNumber}`);
    }

    if (from.balance < amount) {
      throw new Error(
        `Insufficient balance. Available: ${from.balance}, Requested: ${amount}`
      );
    }

    // Perform the debit and credit
    from.balance -= amount;
    to.balance   += amount;

    await from.save(opts);
    await to.save(opts);

    // Log successful transaction
    await TransactionLog.create(
      [{ fromAccount: fromAccountNumber, toAccount: toAccountNumber, amount, status: 'SUCCESS' }],
      { session }
    );

    // Commit — makes all changes durable
    await session.commitTransaction();
    console.log(`Transfer SUCCESS: ${fromAccountNumber} -> ${toAccountNumber}, amount: ${amount}`);
    return { ok: true, from, to };

  } catch (err) {
    // Rollback — reverts all partial writes (Atomicity)
    await session.abortTransaction();
    console.error(`Transfer FAILED and rolled back: ${err.message}`);

    // Log failed transaction outside the aborted session
    await TransactionLog.create({
      fromAccount: fromAccountNumber,
      toAccount: toAccountNumber,
      amount,
      status: 'FAILED',
      errorMessage: err.message,
    });

    return { ok: false, error: err.message };
  } finally {
    session.endSession();
  }
}

module.exports = { transferFunds };
