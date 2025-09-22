import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import {
  Card,
  Title,
  Text,
  FAB,
  Searchbar,
  Chip,
  Menu,
  IconButton
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteTransaction, calculateSummary } from '../utils/database';
import { TRANSACTION_TYPES } from '../types';

export default function TransactionListScreen({ navigation, currentUser }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      const data = await getTransactions(currentUser.id);
      setTransactions(data);
      filterTransactions(data, searchQuery, filterType);
      const summaryData = calculateSummary(data);
      setSummary(summaryData);
    } catch (error) {
      console.log('Error loading transactions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentUser])
  );

  const filterTransactions = (data, query, type) => {
    let filtered = data;

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.category.toLowerCase().includes(query.toLowerCase()) ||
        transaction.amount.toString().includes(query) ||
        (transaction.description && transaction.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === type);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredTransactions(filtered);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterTransactions(transactions, query, filterType);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    filterTransactions(transactions, searchQuery, type);
  };

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
                await loadData();
              } else {
                Alert.alert('Error', 'Failed to delete transaction');
              }
            } catch (error) {
              console.log('Delete error:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTransaction = ({ item }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
            {item.description && (
              <Text style={styles.transactionDescription}>{item.description}</Text>
            )}
          </View>
          <View style={styles.transactionActions}>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color: item.type === TRANSACTION_TYPES.INCOME ? '#4caf50' : '#f44336'
                }
              ]}
            >
              {item.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}
              {formatCurrency(item.amount)}
            </Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item.id)}
              iconColor="#f44336"
            />
          </View>
        </View>
        <View style={styles.transactionFooter}>
          <Chip
            mode="outlined"
            compact
            style={[
              styles.typeChip,
              {
                backgroundColor: item.type === TRANSACTION_TYPES.INCOME ? '#e8f5e8' : '#ffebee'
              }
            ]}
            textStyle={{
              color: item.type === TRANSACTION_TYPES.INCOME ? '#4caf50' : '#f44336'
            }}
          >
            {item.type === TRANSACTION_TYPES.INCOME ? 'Income' : 'Expense'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Transactions Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || filterType !== 'all'
          ? 'Try adjusting your search or filter'
          : 'Add your first transaction to get started'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryAmount, { color: '#4caf50' }]}>
                {formatCurrency(summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryAmount, { color: '#f44336' }]}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[
                styles.summaryAmount,
                { color: summary.balance >= 0 ? '#4caf50' : '#f44336' }
              ]}>
                {formatCurrency(summary.balance)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Search and Filter */}
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search transactions..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterChips}>
          <Chip
            mode={filterType === 'all' ? 'flat' : 'outlined'}
            selected={filterType === 'all'}
            onPress={() => handleFilterChange('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            mode={filterType === TRANSACTION_TYPES.INCOME ? 'flat' : 'outlined'}
            selected={filterType === TRANSACTION_TYPES.INCOME}
            onPress={() => handleFilterChange(TRANSACTION_TYPES.INCOME)}
            style={styles.filterChip}
          >
            Income
          </Chip>
          <Chip
            mode={filterType === TRANSACTION_TYPES.EXPENSE ? 'flat' : 'outlined'}
            selected={filterType === TRANSACTION_TYPES.EXPENSE}
            onPress={() => handleFilterChange(TRANSACTION_TYPES.EXPENSE)}
            style={styles.filterChip}
          >
            Expense
          </Chip>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddTransaction')}
        label="Add Transaction"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryContainer: {
    padding: 16,
    paddingTop: 8,
  },
  summaryCard: {
    elevation: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filterChip: {
    marginHorizontal: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  transactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  transactionFooter: {
    marginTop: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: '0',
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});
