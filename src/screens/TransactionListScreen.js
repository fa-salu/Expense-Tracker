import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import {
  Card,
  Text,
  FAB,
  Searchbar,
  Chip,
  IconButton,
  Surface,
  Menu,
  Button,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  getTransactions,
  deleteTransaction,
  calculateSummary,
} from "../utils/database";
import { TRANSACTION_TYPES } from "../types";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../theme/colors";

export default function TransactionListScreen({ navigation }) {
  const { user: currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const loadData = async () => {
    if (!currentUser?.id) {
      console.log("No user found:", currentUser);
      return;
    }

    try {
      const data = await getTransactions(currentUser.id);
      setTransactions(data);
      filterAndSortTransactions(
        data,
        searchQuery,
        filterType,
        sortBy,
        sortOrder
      );
      const summaryData = calculateSummary(data);
      setSummary(summaryData);
    } catch (error) {
      console.log("Error loading transactions:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [currentUser])
  );

  const filterAndSortTransactions = (data, query, type, sort, order) => {
    let filtered = [...data];

    if (query.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.category.toLowerCase().includes(query.toLowerCase()) ||
          transaction.amount.toString().includes(query) ||
          (transaction.description &&
            transaction.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (type !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === type);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case "amount":
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "date":
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }

      return order === "desc" ? -comparison : comparison;
    });

    setFilteredTransactions(filtered);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterAndSortTransactions(
      transactions,
      query,
      filterType,
      sortBy,
      sortOrder
    );
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    filterAndSortTransactions(
      transactions,
      searchQuery,
      type,
      sortBy,
      sortOrder
    );
  };

  const handleSortChange = (sort) => {
    const newOrder = sortBy === sort && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(sort);
    setSortOrder(newOrder);
    setMenuVisible(false);
    filterAndSortTransactions(
      transactions,
      searchQuery,
      filterType,
      sort,
      newOrder
    );
  };

  const handleDelete = (transactionId) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteTransaction(
                transactionId,
                currentUser.id
              );
              if (success) {
                await loadData();
              } else {
                Alert.alert("Error", "Failed to delete transaction");
              }
            } catch (error) {
              console.log("Delete error:", error);
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `$${Math.abs(parseFloat(amount)).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getSortIcon = (type) => {
    if (sortBy === type) {
      return sortOrder === "desc" ? "arrow-down" : "arrow-up";
    }
    return "unfold-more-horizontal";
  };

  const renderTransaction = ({ item, index }) => (
    <Card style={styles.transactionCard}>
      <Card.Content style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <View
            style={[
              styles.transactionIcon,
              {
                backgroundColor:
                  item.type === TRANSACTION_TYPES.INCOME
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
                    item.type === TRANSACTION_TYPES.INCOME
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {item.type === TRANSACTION_TYPES.INCOME ? "↗" : "↙"}
            </Text>
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.createdAt)}
            </Text>
            {item.description && (
              <Text style={styles.transactionDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color:
                    item.type === TRANSACTION_TYPES.INCOME
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {item.type === TRANSACTION_TYPES.INCOME ? "+" : "-"}
              {formatCurrency(item.amount)}
            </Text>
            <IconButton
              icon="delete-outline"
              size={18}
              onPress={() => handleDelete(item.id)}
              iconColor={colors.error}
              style={styles.deleteButton}
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
                backgroundColor:
                  item.type === TRANSACTION_TYPES.INCOME
                    ? colors.success + "10"
                    : colors.error + "10",
              },
            ]}
            textStyle={{
              color:
                item.type === TRANSACTION_TYPES.INCOME
                  ? colors.success
                  : colors.error,
              fontSize: typography.sizes.xs,
            }}
          >
            {item.type === TRANSACTION_TYPES.INCOME ? "Income" : "Expense"}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <>
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Balance</Text>
              <Text
                style={[
                  styles.summaryMainAmount,
                  {
                    color: summary.balance >= 0 ? colors.success : colors.error,
                  },
                ]}
              >
                {summary.balance >= 0 ? "+" : ""}$
                {Math.abs(summary.balance).toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summarySubItem}>
              <Text style={styles.summarySubLabel}>Income</Text>
              <Text
                style={[styles.summarySubAmount, { color: colors.success }]}
              >
                +{formatCurrency(summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.summarySubItem}>
              <Text style={styles.summarySubLabel}>Expenses</Text>
              <Text style={[styles.summarySubAmount, { color: colors.error }]}>
                -{formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search transactions..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ fontSize: typography.sizes.sm }}
          iconColor={colors.text.secondary}
        />

        <View style={styles.filterRow}>
          <View style={styles.filterChips}>
            {["all", TRANSACTION_TYPES.INCOME, TRANSACTION_TYPES.EXPENSE].map(
              (type) => (
                <Chip
                  key={type}
                  mode={filterType === type ? "flat" : "outlined"}
                  selected={filterType === type}
                  onPress={() => handleFilterChange(type)}
                  style={styles.filterChip}
                  textStyle={[
                    styles.filterChipText,
                    filterType === type && {
                      fontWeight: typography.weights.medium,
                    },
                  ]}
                >
                  {type === "all"
                    ? "All"
                    : type === TRANSACTION_TYPES.INCOME
                    ? "Income"
                    : "Expenses"}
                </Chip>
              )
            )}
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="sort"
                size={20}
                onPress={() => setMenuVisible(true)}
                iconColor={colors.text.secondary}
                style={styles.sortButton}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => handleSortChange("date")}
              title="Date"
              leadingIcon={getSortIcon("date")}
              titleStyle={styles.menuItemText}
            />
            <Menu.Item
              onPress={() => handleSortChange("amount")}
              title="Amount"
              leadingIcon={getSortIcon("amount")}
              titleStyle={styles.menuItemText}
            />
            <Menu.Item
              onPress={() => handleSortChange("category")}
              title="Category"
              leadingIcon={getSortIcon("category")}
              titleStyle={styles.menuItemText}
            />
          </Menu>
        </View>
      </View>

      {filteredTransactions.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
          </Text>
        </View>
      )}
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>
          {searchQuery || filterType !== "all" ? "🔍" : "📊"}
        </Text>
        <Text style={styles.emptyTitle}>
          {searchQuery || filterType !== "all"
            ? "No Results Found"
            : "No Transactions Yet"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery || filterType !== "all"
            ? "Try adjusting your search or filter"
            : "Add your first transaction to start tracking your finances"}
        </Text>
        {!searchQuery && filterType === "all" && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate("AddTransaction")}
            style={styles.emptyButton}
            labelStyle={styles.emptyButtonLabel}
            icon="plus"
          >
            Add Transaction
          </Button>
        )}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.container}>
        <Surface style={styles.headerSurface} elevation={2}>
          <Text style={styles.headerTitle}>Transactions</Text>
        </Surface>

        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate("AddTransaction")}
          label="Add"
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
  headerSurface: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  summaryCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  summaryContent: {
    paddingVertical: spacing.lg,
  },
  summaryGrid: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryMainAmount: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  summarySubItem: {
    alignItems: "center",
  },
  summarySubLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summarySubAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  controlsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchbar: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterChips: {
    flexDirection: "row",
    flex: 1,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  filterChipText: {
    fontSize: typography.sizes.xs,
  },
  sortButton: {
    backgroundColor: colors.surface,
  },
  menuContent: {
    backgroundColor: colors.surface,
  },
  menuItemText: {
    fontSize: typography.sizes.sm,
  },
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  resultsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  separator: {
    height: spacing.sm,
  },
  transactionCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  transactionContent: {
    paddingVertical: spacing.md,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  transactionDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    margin: 0,
  },
  transactionFooter: {
    marginTop: spacing.sm,
  },
  typeChip: {
    alignSelf: "flex-start",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  emptyButtonLabel: {
    fontSize: typography.sizes.sm,
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
