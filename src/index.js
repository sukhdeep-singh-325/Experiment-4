// src/index.js
// Entry point - seeds accounts and runs demo transactions

require('dotenv').config();
const connectDB = require('./db');
const Account = require('./models/Account');
const TransactionLog = require('./models/TransactionLog');
const { transferFunds } = require('./transferService');

async function printBalances(label) {
  const accounts = await Account.find({}).lean();
  console.log(`\n--- ${label} ---`);
  accounts.forEach(a =>
    console.log(`  ${a.ownerName} (${a.accountNumber}): Rs.${a.balance}`)
  );
}

async function printLogs() {
  const logs = await TransactionLog.find({}).sort({ createdAt: -1 }).lean();
  console.log('\n--- Transaction Logs ---');
  logs.forEach(l => {
    const emoji = l.status === 'SUCCESS' ? 'OK' : 'FAIL';
    console.log(
      `  [${emoji}] ${l.fromAccount} -> ${l.toAccount} | Rs.${l.amount} | ${l.status}${
        l.errorMessage ? ' | Error: ' + l.errorMessage : ''
      }`
    );
  });
}

async function main() {
  await connectDB();

  // Clean slate
  await Account.deleteMany({});
  await TransactionLog.deleteMany({});

  // Seed accounts
  await Account.create([
    { accountNumber: 'A001', ownerName: 'Alice', balance: 1000 },
    { accountNumber: 'A002', ownerName: 'Bob',   balance: 500  },
    { accountNumber: 'A003', ownerName: 'Carol', balance: 200  },
  ]);
  console.log('Seeded 3 accounts.');

  await printBalances('Initial Balances');

  // Test 1: Successful transfer
  console.log('\nTest 1: Alice -> Bob, Rs.200');
  const r1 = await transferFunds({ fromAccountNumber: 'A001', toAccountNumber: 'A002', amount: 200 });
  console.log('Result:', r1.ok ? 'SUCCESS' : 'FAILED', r1.error || '');

  // Test 2: Should FAIL and ROLLBACK (insufficient balance)
  console.log('\nTest 2: Carol -> Alice, Rs.500 (insufficient balance - will rollback)');
  const r2 = await transferFunds({ fromAccountNumber: 'A003', toAccountNumber: 'A001', amount: 500 });
  console.log('Result:', r2.ok ? 'SUCCESS' : 'FAILED', r2.error || '');

  // Test 3: Account not found - should ROLLBACK
  console.log('\nTest 3: A001 -> XXXX (invalid account - will rollback)');
  const r3 = await transferFunds({ fromAccountNumber: 'A001', toAccountNumber: 'XXXX', amount: 100 });
  console.log('Result:', r3.ok ? 'SUCCESS' : 'FAILED', r3.error || '');

  await printBalances('Final Balances (only Test 1 should have changed)');
  await printLogs();

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
