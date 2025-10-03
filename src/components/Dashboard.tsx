import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { CategoryService } from "@/services/categoryService";
import {
  TransactionService,
  type TransactionWithCategory,
} from "@/services/transactionService";
import { CategoryModal } from "@/components/CategoryModal";
import { TransactionModal } from "@/components/TransactionModal";
import type { Category } from "@/db/schema";

interface DashboardProps {
  userId: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
  });
  const [activeView, setActiveView] = useState<"transactions" | "categories">(
    "transactions"
  );

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number>();
  const [editingTransactionId, setEditingTransactionId] = useState<number>();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        TransactionService.getByUserId(userId),
        CategoryService.getByUserId(userId),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      calculateStats(transactionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const calculateStats = (transactionsData: TransactionWithCategory[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactionsData.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);
      const transactionDate = new Date(transaction.date);
      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;

      if (transaction.type === "income") {
        totalBalance += amount;
        totalIncome += amount;
        if (isCurrentMonth) {
          monthlyIncome += amount;
        }
      } else {
        totalBalance -= amount;
        totalExpense += amount;
        if (isCurrentMonth) {
          monthlyExpense += amount;
        }
      }
    });

    setStats({
      totalBalance,
      totalIncome,
      totalExpense,
      monthlyIncome,
      monthlyExpense,
    });
  };

  const handleDeleteTransaction = (id: number) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await TransactionService.delete(id);
              loadData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  const handleDeleteCategory = (id: number) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await CategoryService.delete(id);
              loadData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete category");
            }
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: TransactionWithCategory }) => (
    <View style={styles.listItem}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{item.categoryIcon}</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.description}</Text>
          <Text style={styles.itemSubtitle}>{item.categoryName}</Text>
          <Text style={styles.itemDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.itemAmount,
            { color: item.type === "income" ? "#4CAF50" : "#F44336" },
          ]}
        >
          {item.type === "income" ? "+" : "-"}${item.amount}
        </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={() => {
              setEditingTransactionId(item.id);
              setShowTransactionModal(true);
            }}
            style={styles.editAction}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTransaction(item.id)}
            style={styles.deleteAction}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.listItem}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{item.icon}</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.type}</Text>
        </View>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => {
            setEditingCategoryId(item.id);
            setShowCategoryModal(true);
          }}
          style={styles.editAction}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item.id)}
          style={styles.deleteAction}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransactionsList = () => (
    <FlatList<TransactionWithCategory>
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No transactions found</Text>
      }
    />
  );

  const renderCategoriesList = () => (
    <FlatList<Category>
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No categories found</Text>
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Balance</Text>
            <Text
              style={[
                styles.statAmount,
                { color: stats.totalBalance >= 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              ${stats.totalBalance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Income</Text>
            <Text style={[styles.statAmount, { color: "#4CAF50" }]}>
              ${stats.totalIncome.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Expense</Text>
            <Text style={[styles.statAmount, { color: "#F44336" }]}>
              ${stats.totalExpense.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>This Month</Text>
            <Text
              style={[
                styles.statAmount,
                {
                  color:
                    stats.monthlyIncome - stats.monthlyExpense >= 0
                      ? "#4CAF50"
                      : "#F44336",
                },
              ]}
            >
              ${(stats.monthlyIncome - stats.monthlyExpense).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeView === "transactions" && styles.activeNavButton,
          ]}
          onPress={() => setActiveView("transactions")}
        >
          <Text
            style={[
              styles.navButtonText,
              activeView === "transactions" && styles.activeNavButtonText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeView === "categories" && styles.activeNavButton,
          ]}
          onPress={() => setActiveView("categories")}
        >
          <Text
            style={[
              styles.navButtonText,
              activeView === "categories" && styles.activeNavButtonText,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeView === "transactions"
              ? "Recent Transactions"
              : "All Categories"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (activeView === "transactions") {
                setEditingTransactionId(undefined);
                setShowTransactionModal(true);
              } else {
                setEditingCategoryId(undefined);
                setShowCategoryModal(true);
              }
            }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Conditional FlatList Rendering */}
        {activeView === "transactions"
          ? renderTransactionsList()
          : renderCategoriesList()}
      </View>

      {/* Modals */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategoryId(undefined);
        }}
        onSuccess={loadData}
        categoryId={editingCategoryId}
      />

      <TransactionModal
        visible={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransactionId(undefined);
        }}
        onSuccess={loadData}
        transactionId={editingTransactionId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  statsSection: {
    padding: 16,
    backgroundColor: "white",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  statAmount: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeNavButton: {
    backgroundColor: "#007AFF",
  },
  navButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeNavButtonText: {
    color: "white",
    fontWeight: "600",
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  listItem: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  itemDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  editAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: {
    color: "#007AFF",
    fontSize: 12,
  },
  deleteAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 40,
  },
});
