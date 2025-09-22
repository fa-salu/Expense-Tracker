import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Button,
  Text,
  Surface
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, calculateSummary } from '../utils/database';
import { TRANSACTION_TYPES } from '../types';

export default function DashboardScreen({ navigation, onLogout, currentUser }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return '#4caf50';
    if (balance < 0) return '#f44336';
    return '#666';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Title style={styles.headerTitle}>Dashboard</Title>
            <Text style={styles.userInfo}>
              Welcome, {currentUser?.phone_number}
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={onLogout}
            style={styles.logoutButton}
            compact
          >
            Logout
          </Button>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, styles.balanceCard]}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardLabel}>Balance</Text>
              <Text style={[styles.cardAmount, { color: getBalanceColor(summary.balance) }]}>
                {formatCurrency(summary.balance)}
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.incomeExpenseRow}>
            <Card style={[styles.summaryCard, styles.incomeCard]}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardLabel}>Income</Text>
                <Text style={[styles.cardAmount, { color: '#4caf50' }]}>
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.summaryCard, styles.expenseCard]}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardLabel}>Expenses</Text>
                <Text style={[styles.cardAmount, { color: '#f44336' }]}>
                  {formatCurrency(summary.totalExpenses)}
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.actionsTitle}>Quick Actions</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddTransaction')}
                style={[styles.actionButton, { backgroundColor: '#4caf50' }]}
                icon="plus"
              >
                Add Transaction
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('TransactionList')}
                style={styles.actionButton}
                icon="list"
              >
                View All
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Transactions Preview */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <Title style={styles.recentTitle}>Recent Transactions</Title>
            {transactions.length === 0 ? (
              <Paragraph style={styles.noTransactions}>
                No transactions yet. Add your first transaction!
              </Paragraph>
            ) : (
              transactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>
                      {transaction.category}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === TRANSACTION_TYPES.INCOME ? '#4caf50' : '#f44336'
                      }
                    ]}
                  >
                    {transaction.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))
            )}
            {transactions.length > 3 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('TransactionList')}
                style={styles.viewAllButton}
              >
                View All Transactions
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    borderColor: '#6200ea',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  balanceCard: {
    backgroundColor: '#fff',
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeCard: {
    flex: 0.48,
    backgroundColor: '#e8f5e8',
  },
  expenseCard: {
    flex: 0.48,
    backgroundColor: '#ffebee',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 0.45,
  },
  recentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  noTransactions: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});
