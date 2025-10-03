import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { CategoryService } from "@/services/categoryService";
import {
  TransactionService,
  type TransactionWithCategory,
} from "@/services/transactionService";
import { CategoryModal } from "@/components/CategoryModal";
import { TransactionModal } from "@/components/TransactionModal";
import type { Category } from "@/db/schema";

export function HomeScreen() {
  const { user, logout } = useAuth();

  // State for data
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ totalBalance: 0, monthlyTotal: 0 });
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "categories"
  >("overview");

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number>();
  const [editingTransactionId, setEditingTransactionId] = useState<number>();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [transactionsData, categoriesData] = await Promise.all([
        TransactionService.getByUserId(user.id),
        CategoryService.getByUserId(user.id),
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
    let monthlyTotal = 0;

    transactionsData.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);
      const transactionDate = new Date(transaction.date);

      if (transaction.type === "income") {
        totalBalance += amount;
        if (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        ) {
          monthlyTotal += amount;
        }
      } else {
        totalBalance -= amount;
        if (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        ) {
          monthlyTotal -= amount;
        }
      }
    });

    setStats({ totalBalance, monthlyTotal });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
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

  const renderOverview = () => (
    <>
      <Text style={styles.welcomeTitle}>Welcome to Expense Tracker!</Text>
      <Text style={styles.welcomeSubtitle}>
        Ready to track your expenses and income?
      </Text>

      <View style={styles.statsContainer}>
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
          <Text style={styles.statTitle}>This Month</Text>
          <Text
            style={[
              styles.statAmount,
              { color: stats.monthlyTotal >= 0 ? "#4CAF50" : "#F44336" },
            ]}
          >
            ${stats.monthlyTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => {
            setEditingTransactionId(undefined);
            setShowTransactionModal(true);
          }}
        >
          <Text style={styles.quickActionText}>+ Add Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: "#2196F3" }]}
          onPress={() => {
            setEditingCategoryId(undefined);
            setShowCategoryModal(true);
          }}
        >
          <Text style={styles.quickActionText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Preview */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => setActiveTab("transactions")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {transactions.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.recentItem}>
            <Text style={styles.recentIcon}>{item.categoryIcon}</Text>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>{item.description}</Text>
              <Text style={styles.recentSubtitle}>{item.categoryName}</Text>
            </View>
            <Text
              style={[
                styles.recentAmount,
                { color: item.type === "income" ? "#4CAF50" : "#F44336" },
              ]}
            >
              {item.type === "income" ? "+" : "-"}${item.amount}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "transactions" && styles.activeTab]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "transactions" && styles.activeTabText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "categories" && styles.activeTab]}
          onPress={() => setActiveTab("categories")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "categories" && styles.activeTabText,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "overview" && renderOverview()}

        {activeTab === "transactions" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Transactions</Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingTransactionId(undefined);
                  setShowTransactionModal(true);
                }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No transactions found</Text>
              }
            />
          </>
        )}

        {activeTab === "categories" && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Categories</Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingCategoryId(undefined);
                  setShowCategoryModal(true);
                }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No categories found</Text>
              }
            />
          </>
        )}
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  tabContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    flex: 0.48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quickActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  recentSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  seeAllText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
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
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  recentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  recentSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 16,
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
