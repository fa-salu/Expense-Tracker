import * as SQLite from 'expo-sqlite';

const DB_NAME = 'expense_tracker.db';
let dbInstance = null;

// Initialize database with better error handling
export const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Close existing database if any
    if (dbInstance) {
      try {
        await dbInstance.closeAsync();
        console.log('Closed existing database');
      } catch (e) {
        console.log('No existing database to close');
      }
    }
    
    // Open new database instance
    console.log('Opening database...');
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('Database opened successfully');
    
    // Test database connection
    console.log('Testing database connection...');
    await dbInstance.getFirstAsync('SELECT 1 as test');
    console.log('Database connection test successful');
    
    // Create users table
    console.log('Creating users table...');
    try {
      await dbInstance.runAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      console.log('Users table created successfully');
    } catch (tableError) {
      console.error('Error creating users table:', tableError);
      throw tableError;
    }
    
    // Create transactions table
    console.log('Creating transactions table...');
    try {
      await dbInstance.runAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          description TEXT,
          category TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      console.log('Transactions table created successfully');
    } catch (tableError) {
      console.error('Error creating transactions table:', tableError);
      throw tableError;
    }
    
    console.log('Database initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('Database initialization error:', error);
    // Reset database instance on error
    dbInstance = null;
    throw new Error(`Database initialization failed: ${error.message}`);
  }
};

// Get database instance
export const getDatabase = async () => {
  try {
    if (!dbInstance) {
      console.log('Database not initialized, initializing now...');
      await initDatabase();
    }
    return dbInstance;
  } catch (error) {
    console.error('Error getting database:', error);
    throw error;
  }
};

// User operations
export const registerUser = async (phoneNumber, password) => {
  try {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      'INSERT INTO users (phone_number, password, created_at) VALUES (?, ?, ?)',
      [phoneNumber, password, new Date().toISOString()]
    );
    
    return {
      id: result.lastInsertRowId,
      phone_number: phoneNumber,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (phoneNumber, password) => {
  try {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync(
      'SELECT * FROM users WHERE phone_number = ? AND password = ?',
      [phoneNumber, password]
    );
    
    if (result) {
      return {
        id: result.id,
        phone_number: result.phone_number,
        created_at: result.created_at
      };
    } else {
      throw new Error('Invalid phone number or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (result) {
      return {
        id: result.id,
        phone_number: result.phone_number,
        created_at: result.created_at
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Transaction operations
export const saveTransaction = async (userId, transaction) => {
  try {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO transactions (user_id, type, amount, description, category, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        transaction.type,
        transaction.amount,
        transaction.description || '',
        transaction.category || '',
        transaction.createdAt || new Date().toISOString()
      ]
    );
    
    return {
      id: result.lastInsertRowId,
      user_id: userId,
      ...transaction,
      createdAt: transaction.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Save transaction error:', error);
    throw error;
  }
};

export const getTransactions = async (userId) => {
  try {
    const db = await getDatabase();
    
    const result = await db.getAllAsync(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return result.map(row => ({
      id: row.id.toString(),
      user_id: row.user_id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      category: row.category,
      createdAt: row.created_at,
      date: row.created_at // For backward compatibility
    }));
  } catch (error) {
    console.error('Get transactions error:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId, userId) => {
  try {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    
    return result.changes > 0;
  } catch (error) {
    console.error('Delete transaction error:', error);
    throw error;
  }
};

export const updateTransaction = async (transactionId, userId, transaction) => {
  try {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      `UPDATE transactions 
       SET type = ?, amount = ?, description = ?, category = ?
       WHERE id = ? AND user_id = ?`,
      [
        transaction.type,
        transaction.amount,
        transaction.description || '',
        transaction.category || '',
        transactionId,
        userId
      ]
    );
    
    return result.changes > 0;
  } catch (error) {
    console.error('Update transaction error:', error);
    throw error;
  }
};

// Summary calculations
export const calculateSummary = (transactions) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = income - expenses;
  
  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: balance
  };
};

// Get summary for a specific user
export const getUserSummary = async (userId) => {
  try {
    const transactions = await getTransactions(userId);
    return calculateSummary(transactions);
  } catch (error) {
    console.error('Get user summary error:', error);
    throw error;
  }
};
