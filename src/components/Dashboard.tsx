import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { CategoryService } from "@/services/categoryService";
import {
  TransactionService,
  type TransactionWithCategory,
} from "@/services/transactionService";
import { TransactionsPage } from "./TransactionPage";
import { CategoriesPage } from "./CategoryPage";
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
  const [activeView, setActiveView] = useState<
    "dashboard" | "transactions" | "categories"
  >("dashboard");

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

  const renderDashboard = () => (
    <ScrollView
      style={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.balanceCard]}>
            <Text style={styles.statTitle}>Total Balance</Text>
            <Text
              style={[
                styles.statAmount,
                { color: stats.totalBalance >= 0 ? "#10B981" : "#EF4444" },
              ]}
            >
              ₹{stats.totalBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.incomeCard]}>
            <Text style={styles.statTitle}>Income</Text>
            <Text style={[styles.statAmount, { color: "#10B981" }]}>
              ₹{stats.totalIncome.toFixed(2)}
            </Text>
            <Text style={styles.statSubtitle}>
              ₹{stats.monthlyIncome.toFixed(2)} this month
            </Text>
          </View>

          <View style={[styles.statCard, styles.expenseCard]}>
            <Text style={styles.statTitle}>Expenses</Text>
            <Text style={[styles.statAmount, { color: "#EF4444" }]}>
              ₹{stats.totalExpense.toFixed(2)}
            </Text>
            <Text style={styles.statSubtitle}>
              ₹{stats.monthlyExpense.toFixed(2)} this month
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setActiveView("transactions")}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
              <Text style={styles.actionEmoji}>💰</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Transactions</Text>
              <Text style={styles.actionSubtitle}>
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setActiveView("categories")}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIcon, { backgroundColor: "#F3E8FF" }]}>
              <Text style={styles.actionEmoji}>📊</Text>
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Categories</Text>
              <Text style={styles.actionSubtitle}>
                {categories.length} categor
                {categories.length !== 1 ? "ies" : "y"}
              </Text>
            </View>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => setActiveView("transactions")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 3).length > 0 ? (
          transactions.slice(0, 3).map((transaction) => (
            <View key={transaction.id} style={styles.previewItem}>
              <View style={styles.previewLeft}>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewTitle}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    {transaction.categoryName}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.previewAmount,
                  {
                    color:
                      transaction.type === "income" ? "#10B981" : "#EF4444",
                  },
                ]}
              >
                {transaction.type === "income" ? "+" : "-"}₹
                {parseFloat(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noTransactions}>
            <Text style={styles.noTransactionsText}>No transactions yet</Text>
            <Text style={styles.noTransactionsSubtext}>
              Start by adding your first transaction
            </Text>
          </View>
        )}
      </View>

      {/* Add bottom padding for navigation */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderBottomNavigation = () => (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={[
          styles.navButton,
          activeView === "dashboard" && styles.activeNavButton,
        ]}
        onPress={() => setActiveView("dashboard")}
      >
        <Text
          style={[
            styles.navIcon,
            activeView === "dashboard" && styles.activeNavIcon,
          ]}
        >
          🏠
        </Text>
        <Text
          style={[
            styles.navButtonText,
            activeView === "dashboard" && styles.activeNavButtonText,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navButton,
          activeView === "transactions" && styles.activeNavButton,
        ]}
        onPress={() => setActiveView("transactions")}
      >
        <Text
          style={[
            styles.navIcon,
            activeView === "transactions" && styles.activeNavIcon,
          ]}
        >
          💰
        </Text>
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
            styles.navIcon,
            activeView === "categories" && styles.activeNavIcon,
          ]}
        >
          📊
        </Text>
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeView === "dashboard" && renderDashboard()}
        {activeView === "transactions" && (
          <TransactionsPage
            userId={userId}
            transactions={transactions}
            categories={categories}
            onDataChange={loadData}
          />
        )}
        {activeView === "categories" && (
          <CategoriesPage
            userId={userId}
            categories={categories}
            onDataChange={loadData}
          />
        )}
      </View>

      {renderBottomNavigation()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bottomPadding: {
    height: 80,
  },

  statsSection: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  incomeCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  expenseCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  statTitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "500",
  },
  statAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },

  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  actionEmoji: {
    fontSize: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  actionArrow: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },

  recentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "600",
  },
  previewItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  previewLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  previewAmount: {
    fontSize: 13,
    fontWeight: "600",
  },
  noTransactions: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  noTransactionsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 4,
  },
  noTransactionsSubtext: {
    fontSize: 12,
    color: "#94A3B8",
  },

  // Bottom Navigation
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  activeNavButton: {
    backgroundColor: "#EFF6FF",
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  activeNavIcon: {
    transform: [{ scale: 1.1 }],
  },
  navButtonText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  activeNavButtonText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
