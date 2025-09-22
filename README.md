# Expense Tracker App

A React Native expense tracking application built with Expo, featuring phone number authentication and SQLite database storage.

## Features

- **Phone Number Authentication**: Secure registration and login with phone number + password
- **SQLite Database**: All data stored locally using SQLite with proper user isolation
- **Transaction Management**: Add, view, edit, and delete income and expense transactions
- **Real-time Summary**: Automatic calculation of total income, expenses, and balance
- **User Data Isolation**: Each user only sees their own transactions
- **Offline Support**: All data stored locally using SQLite database
- **Modern UI**: Clean and intuitive interface built with React Native Paper

## Tech Stack

- React Native with Expo
- React Navigation
- React Native Paper (Material Design)
- SQLite Database (expo-sqlite)
- Phone Number Authentication

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Database Schema

### Users Table
- `id`: Primary key
- `phone_number`: Unique phone number
- `password`: User password
- `created_at`: Registration timestamp

### Transactions Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `type`: 'income' or 'expense'
- `amount`: Transaction amount
- `description`: Optional description
- `category`: Transaction category
- `created_at`: Transaction timestamp

## Authentication

- Users register with phone number and password
- Credentials stored securely in SQLite database
- Each user's data is completely isolated
- No persistent login (starts fresh each app launch)

## Transaction Categories

### Income Categories
- Salary
- Freelance
- Investment
- Gift
- Other Income

### Expense Categories
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Other Expense

## Key Features

- **Secure Authentication**: Phone number + password validation
- **Data Persistence**: All data stored in local SQLite database
- **User Isolation**: Each user only sees their own transactions
- **Real-time Calculations**: Summary data calculated from database
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Error Handling**: Comprehensive error handling throughout

## Usage

1. **Register**: Create account with phone number and password
2. **Login**: Sign in with registered credentials
3. **Add Transactions**: Record income and expenses with categories
4. **View Dashboard**: See summary of finances at a glance
5. **Transaction List**: View all transactions with search and filter
6. **Manage Data**: Edit or delete transactions as needed

## Database Functions

The app uses modern Expo SQLite API with async/await:

```javascript
// User operations
await registerUser(phoneNumber, password);
await loginUser(phoneNumber, password);

// Transaction operations
await saveTransaction(userId, transaction);
await getTransactions(userId);
await deleteTransaction(transactionId, userId);

// Summary calculations
const summary = calculateSummary(transactions);
```

## Error Handling

All database operations include proper error handling with user-friendly messages for:
- Duplicate phone numbers
- Invalid credentials
- Database connection issues
- Transaction validation errors

## Development

The app is built with modern React Native practices:
- Functional components with hooks
- Async/await for database operations
- Proper error boundaries
- Clean separation of concerns
- Comprehensive documentation

## License

This project is for educational purposes.
