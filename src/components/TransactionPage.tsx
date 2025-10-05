import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  TransactionService,
  type TransactionWithCategory,
} from "@/services/transactionService";
import { TransactionModal } from "@/components/TransactionModal";
import type { Category } from "@/db/schema";

interface TransactionsPageProps {
  userId: number;
  transactions: TransactionWithCategory[];
  categories: Category[];
  onDataChange: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  userId,
  transactions,
  categories,
  onDataChange,
}) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<number>();

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
              onDataChange();
            } catch (error) {
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: TransactionWithCategory }) => (
    <View style={styles.listItem}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.itemIcon}>{item.categoryIcon}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.description}</Text>
          <Text style={styles.itemSubtitle}>{item.categoryName}</Text>
          <Text style={styles.itemDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.itemAmount,
            { color: item.type === "income" ? "#10B981" : "#EF4444" },
          ]}
        >
          {item.type === "income" ? "+" : "-"}$
          {parseFloat(item.amount).toFixed(2)}
        </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={() => {
              setEditingTransactionId(item.id);
              setShowTransactionModal(true);
            }}
            style={styles.editAction}
          >
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTransaction(item.id)}
            style={styles.deleteAction}
          >
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Transactions</Text>
          <Text style={styles.pageSubtitle}>
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setEditingTransactionId(undefined);
            setShowTransactionModal(true);
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList<TransactionWithCategory>
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your expenses and income by adding your first
                transaction
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => {
                  setEditingTransactionId(undefined);
                  setShowTransactionModal(true);
                }}
              >
                <Text style={styles.emptyButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <TransactionModal
        visible={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransactionId(undefined);
        }}
        onSuccess={onDataChange}
        transactionId={editingTransactionId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonIcon: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  separator: {
    height: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  editAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  editText: {
    fontSize: 16,
  },
  deleteAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  deleteText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
