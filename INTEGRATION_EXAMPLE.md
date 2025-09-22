# Integration Example

## How to use SQLite functions in your screens

### 1. Import the database functions
```javascript
import { 
  getTransactions, 
  saveTransaction, 
  deleteTransaction, 
  calculateSummary 
} from '../utils/database';
```

### 2. Load data on screen focus
```javascript
import { useFocusEffect } from '@react-navigation/native';

const loadData = async () => {
  if (!currentUser) return;
  
  try {
    const data = await getTransactions(currentUser.id);
    setTransactions(data);
    const summaryData = calculateSummary(data);
    setSummary(summaryData);
  } catch (error) {
    console.log('Error loading data:', error);
  }
};

useFocusEffect(
  useCallback(() => {
    loadData();
  }, [currentUser])
);
```

### 3. Save a new transaction
```javascript
const handleSave = async () => {
  if (!currentUser) {
    Alert.alert('Error', 'User not authenticated');
    return;
  }

  try {
    const transaction = {
      amount: parseFloat(amount),
      type,
      category: category.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString()
    };

    await saveTransaction(currentUser.id, transaction);
    Alert.alert('Success', 'Transaction added successfully!');
    // Refresh data
    await loadData();
  } catch (error) {
    Alert.alert('Error', 'Failed to save transaction');
  }
};
```

### 4. Delete a transaction
```javascript
const handleDelete = (transactionId) => {
  Alert.alert(
    'Delete Transaction',
    'Are you sure you want to delete this transaction?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await deleteTransaction(transactionId, currentUser.id);
            if (success) {
              await loadData(); // Refresh data
            } else {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete transaction');
          }
        }
      }
    ]
  );
};
```

### 5. Authentication in LoginScreen
```javascript
const handleSubmit = async () => {
  try {
    await initDatabase();

    if (isRegisterMode) {
      // Register new user
      const user = await registerUser(phoneNumber, password);
      Alert.alert('Success', 'Account created successfully!');
    } else {
      // Login existing user
      const user = await loginUser(phoneNumber, password);
      onLogin(user); // Pass user to parent component
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

## Key Points

1. **Always check currentUser**: Make sure user is authenticated before database operations
2. **Error handling**: Wrap database operations in try-catch blocks
3. **Refresh data**: Call loadData() after create/update/delete operations
4. **User isolation**: Always pass currentUser.id to database functions
5. **Async operations**: All database functions return Promises, use await
