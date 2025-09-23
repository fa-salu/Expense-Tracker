import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
} from "react-native";
import {
  Card,
  Title,
  FAB,
  Button,
  Text,
  Surface,
  IconButton,
  Chip,
  Appbar,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getTransactions, calculateSummary } from "../../database";
import { TRANSACTION_TYPES } from "../../types";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../theme/colors";

export default function DashboardScreen({ navigation }) {
  const { user: currentUser, signOut } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    if (!currentUser?.id) {
      console.log("No user found:", currentUser);
      return;
    }

    try {
      const data = await getTransactions(currentUser.id);
      setTransactions(data);
      const summaryData = calculateSummary(data);
      setSummary(summaryData);
    } catch (error) {
      console.log("Error loading data:", error);
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
    return `₹${Math.abs(parseFloat(amount)).toFixed(2)}`;
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return colors.success;
    if (balance < 0) return colors.error;
    return colors.text.secondary;
  };

  const renderSummaryCard = (title, amount, color, icon, isBalance = false) => (
    <Card style={[styles.summaryCard, isBalance && styles.balanceCard]}>
      <Card.Content style={styles.summaryContent}>
        <View style={styles.summaryHeader}>
          <View
            style={[styles.iconContainer, { backgroundColor: color + "15" }]}
          >
            <Text style={[styles.iconText, { color }]}>{icon}</Text>
          </View>
          <Text style={styles.summaryTitle}>{title}</Text>
        </View>
        <Text style={[styles.summaryAmount, { color }]}>
          {isBalance && balance !== 0 && (balance > 0 ? "+" : "-")}
          {formatCurrency(amount)}
        </Text>
      </Card.Content>
    </Card>
  );

  const balance = summary.totalIncome - summary.totalExpenses;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.balanceSection}>
            <Card style={[styles.balanceMainCard, shadows.large]}>
              <Card.Content style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: getBalanceColor(balance) },
                  ]}
                >
                  {balance >= 0 ? "+" : ""}₹{Math.abs(balance).toFixed(2)}
                </Text>
                <View style={styles.balanceIndicator}>
                  <Chip
                    mode="flat"
                    compact
                    style={[
                      styles.balanceChip,
                      { backgroundColor: getBalanceColor(balance) + "20" },
                    ]}
                    textStyle={{
                      color: getBalanceColor(balance),
                      fontSize: typography.sizes.xs,
                    }}
                  >
                    {balance >= 0 ? "↗ Positive" : "↘ Negative"}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.summaryRow}>
            {renderSummaryCard(
              "Income",
              summary.totalIncome,
              colors.success,
              "↗"
            )}
            {renderSummaryCard(
              "Expenses",
              summary.totalExpenses,
              colors.error,
              "↙"
            )}
          </View>

          <Card style={styles.recentCard}>
            <Card.Content style={styles.recentContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {transactions.length > 3 && (
                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate("TransactionList")}
                    labelStyle={styles.viewAllLabel}
                  >
                    View All
                  </Button>
                )}
              </View>

              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={styles.emptyTitle}>No transactions yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Add your first transaction to start tracking
                  </Text>
                  <Button
                    mode="contained"
                    compact
                    onPress={() => navigation.navigate("AddTransaction")}
                    style={styles.emptyButton}
                    labelStyle={styles.emptyButtonLabel}
                  >
                    Get Started
                  </Button>
                </View>
              ) : (
                transactions.slice(0, 3).map((transaction, index) => (
                  <View
                    key={transaction.id || index}
                    style={styles.transactionItem}
                  >
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor:
                            transaction.type === TRANSACTION_TYPES.INCOME
                              ? colors.success + "15"
                              : colors.error + "15",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionIconText,
                          {
                            color:
                              transaction.type === TRANSACTION_TYPES.INCOME
                                ? colors.success
                                : colors.error,
                          },
                        ]}
                      >
                        {transaction.type === TRANSACTION_TYPES.INCOME
                          ? "↗"
                          : "↙"}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionCategory}>
                        {transaction.category}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            transaction.type === TRANSACTION_TYPES.INCOME
                              ? colors.success
                              : colors.error,
                        },
                      ]}
                    >
                      {transaction.type === TRANSACTION_TYPES.INCOME
                        ? "+"
                        : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate("AddTransaction")}
          color={colors.text.white}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  title: {
    color: colors.text.white,
    fontWeight: "600",
  },
  logoutButton: {
    margin: 0,
  },
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  welcomeCard: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  welcomeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    margin: 0,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  balanceSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  balanceMainCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
  balanceContent: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  balanceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  balanceIndicator: {
    flexDirection: "row",
  },
  balanceChip: {
    paddingHorizontal: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  summaryContent: {
    paddingVertical: spacing.lg,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  iconText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  summaryTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  summaryAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  actionCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  actionContent: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  secondaryAction: {
    borderColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  recentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  recentContent: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  viewAllLabel: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  emptyButtonLabel: {
    fontSize: typography.sizes.sm,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  transactionIconText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  transactionDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: "absolute",
    margin: spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
  },
});
