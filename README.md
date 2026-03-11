# Experiment-4: Banking Transaction System with MongoDB Transactions

## Aim
To build a banking transaction system with ACID-compliant rollback using MongoDB transactions.

## Objectives
- Implement MongoDB transactions with Mongoose
- Handle concurrent transactions
- Develop rollback capabilities
- Ensure consistency and integrity of data
- Log all transactions for auditing

## Hardware / Software Requirements
- Node.js 18+
- MongoDB 4.2+ with replica set (required for multi-document transactions)
- npm (Node package manager)

## About the Experiment
This experiment demonstrates key database concepts:
- ACID properties (Atomicity, Consistency, Isolation, Durability)
- MongoDB sessions for transactions
- Isolation and rollback on failure
- Reliable data recovery
- Transaction logging for auditing

## Project Structure
```
Experiment-4/
├── src/
│   ├── models/
│   │   ├── Account.js
│   │   └── TransactionLog.js
│   ├── db.js
│   ├── transferService.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/sukhdeep-singh-325/Experiment-4.git
cd Experiment-4
npm install
```

### 2. Create a `.env` file
```env
MONGODB_URI=mongodb://localhost:27017/bankdb?replicaSet=rs0
PORT=3000
```

### 3. Start MongoDB replica set (required for transactions)
```bash
mongod --replSet rs0 --dbpath /data/db
mongosh --eval "rs.initiate()"
```

### 4. Run the project
```bash
npm start
```

## How ACID Is Demonstrated

| Property | Implementation |
|---|---|
| **Atomicity** | Debit + credit run in one session; `abortTransaction()` rolls back all changes on failure |
| **Consistency** | Total money in system stays the same before and after transfer |
| **Isolation** | Other sessions cannot see partial updates until the transaction commits |
| **Durability** | Once committed, changes persist in MongoDB even after restarts |

## How to Test Rollback
1. Attempt a transfer where the source balance is insufficient.
2. Check `accounts` collection — balances remain unchanged.
3. Check `transactionlogs` collection — failed transfer is recorded with an error message.

## Observation
When a transaction fails mid-way (e.g., insufficient balance), MongoDB's session mechanism automatically rolls back all partial writes. The account balances remain consistent and the failed attempt is captured in the `TransactionLog` with a `FAILED` status and error message.

## Result
The experiment successfully demonstrates ACID-compliant banking transactions using MongoDB sessions and Mongoose. Multi-document transactions with rollback, concurrent isolation, and audit logging were implemented and verified.

## Future Enhancements
- REST API endpoints (Express.js) for creating accounts and performing transfers
- Concurrent transaction stress testing
- Detailed audit logs with user ID, IP address, and request metadata
- JWT-based authentication for secure transfers
