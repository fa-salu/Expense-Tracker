import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  RadioButton,
  Text,
  SegmentedButtons
} from 'react-native-paper';
import { saveTransaction } from '../utils/database';
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from '../types';

export default function AddTransactionScreen({ navigation, currentUser }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!amount.trim() || !category.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      const transaction = {
        amount: parseFloat(amount),
        type,
        category: category.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString()
      };

      await saveTransaction(currentUser.id, transaction);
      Alert.alert('Success', 'Transaction added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Save transaction error:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableCategories = () => {
    return type === TRANSACTION_TYPES.INCOME 
      ? TRANSACTION_CATEGORIES.INCOME 
      : TRANSACTION_CATEGORIES.EXPENSE;
  };

  const formatCurrency = (value) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Add New Transaction</Title>

              {/* Transaction Type */}
              <View style={styles.section}>
                <Text style={styles.label}>Transaction Type</Text>
                <SegmentedButtons
                  value={type}
                  onValueChange={setType}
                  buttons={[
                    {
                      value: TRANSACTION_TYPES.EXPENSE,
                      label: 'Expense',
                      icon: 'minus'
                    },
                    {
                      value: TRANSACTION_TYPES.INCOME,
                      label: 'Income',
                      icon: 'plus'
                    }
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              {/* Amount */}
              <TextInput
                label="Amount *"
                value={amount}
                onChangeText={(text) => setAmount(formatCurrency(text))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="currency-usd" />}
                placeholder="0.00"
              />

              {/* Category */}
              <View style={styles.section}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryContainer}>
                  {getAvailableCategories().map((cat) => (
                    <Button
                      key={cat}
                      mode={category === cat ? 'contained' : 'outlined'}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryButton,
                        category === cat && { backgroundColor: '#6200ea' }
                      ]}
                      compact
                    >
                      {cat}
                    </Button>
                  ))}
                </View>
                <TextInput
                  label="Or enter custom category"
                  value={category}
                  onChangeText={setCategory}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Enter category name"
                />
              </View>

              {/* Description */}
              <TextInput
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
                placeholder="Add a note about this transaction"
              />

              {/* Date */}
              <TextInput
                label="Date"
                value={date}
                onChangeText={setDate}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
                placeholder="YYYY-MM-DD"
              />

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.saveButton}
                >
                  Save Transaction
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryButton: {
    margin: 4,
    borderColor: '#6200ea',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 0.45,
    borderColor: '#6200ea',
  },
  saveButton: {
    flex: 0.45,
    backgroundColor: '#6200ea',
  },
});
