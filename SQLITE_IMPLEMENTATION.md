# SQLite Implementation Guide

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  category TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Database Utility Functions

### User Operations
- `registerUser(phoneNumber, password)` - Register a new user
- `loginUser(phoneNumber, password)` - Authenticate user login
- `getUserById(userId)` - Get user by ID

### Transaction Operations
- `saveTransaction(userId, transaction)` - Save a new transaction
- `getTransactions(userId)` - Get all transactions for a user
- `deleteTransaction(transactionId, userId)` - Delete a transaction
- `updateTransaction(transactionId, userId, transaction)` - Update a transaction
- `calculateSummary(transactions)` - Calculate income, expenses, and balance
- `getUserSummary(userId)` - Get summary for a specific user

## Authentication Flow

1. **Registration**: User enters phone number and password
2. **Validation**: Phone number format and password length validation
3. **Database Check**: Check if phone number already exists
4. **User Creation**: Create new user record in SQLite
5. **Login**: Validate credentials against database
6. **Session**: Store user data in app state (no persistent storage)

## Transaction Management

1. **Add Transaction**: User enters transaction details
2. **Validation**: Amount, type, and category validation
3. **Database Save**: Store transaction with user_id foreign key
4. **Real-time Updates**: All screens refresh data from database
5. **Summary Calculation**: Automatic calculation of totals from database

## Key Features

- **Phone Number Authentication**: Users register/login with phone number + password
- **SQLite Storage**: All data stored in local SQLite database using modern Expo SQLite API
- **User Isolation**: Each user's transactions are isolated by user_id
- **Real-time Calculations**: Summary data calculated from actual database records
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Data Integrity**: Foreign key constraints ensure data consistency

## Migration from AsyncStorage

- ✅ Removed all AsyncStorage dependencies
- ✅ Replaced with SQLite database operations using modern Expo SQLite API
- ✅ Updated authentication to use phone numbers
- ✅ Implemented proper user data isolation
- ✅ Added comprehensive error handling
- ✅ Maintained all existing UI functionality

## Modern Expo SQLite API Usage

The implementation uses the modern Expo SQLite API with async/await:

```javascript
// Database initialization
const db = await SQLite.openDatabaseAsync(DB_NAME);

// Execute SQL
await db.execAsync('CREATE TABLE...');

// Run queries with parameters
const result = await db.runAsync('INSERT INTO...', [param1, param2]);

// Get single row
const row = await db.getFirstAsync('SELECT * FROM...', [param]);

// Get all rows
const rows = await db.getAllAsync('SELECT * FROM...', [param]);
```

## Usage Examples

### Register a new user
```javascript
const user = await registerUser('+1234567890', 'password123');
```

### Login existing user
```javascript
const user = await loginUser('+1234567890', 'password123');
```

### Save a transaction
```javascript
const transaction = {
  type: 'expense',
  amount: 25.50,
  category: 'Food & Dining',
  description: 'Lunch at restaurant'
};
await saveTransaction(userId, transaction);
```

### Get user's transactions
```javascript
const transactions = await getTransactions(userId);
```

### Calculate summary
```javascript
const summary = calculateSummary(transactions);
// Returns: { totalIncome: 1000, totalExpenses: 750, balance: 250 }
```

## Error Handling

All database functions include proper error handling:

```javascript
try {
  const user = await registerUser(phoneNumber, password);
  // Handle success
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    // Handle duplicate phone number
  } else {
    // Handle other errors
  }
}
```
