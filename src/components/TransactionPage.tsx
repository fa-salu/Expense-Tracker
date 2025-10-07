import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import {
  TransactionService,
  type TransactionWithCategory,
} from "@/services/transactionService";
import { TransactionModal } from "@/components/TransactionModal";
import type { Category } from "@/db/schema";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setEditingTransactionId(item.id);
        setShowTransactionModal(true);
      }}
    >
      <View style={styles.itemLeft}>
        <Text
          style={[
            styles.itemAmount,
            { color: item.type === "income" ? "#10B981" : "#EF4444" },
          ]}
        >
          {item.type === "income" ? "+" : "-"}₹
          {parseFloat(item.amount).toFixed(2)}
        </Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemSubtitle}>{item.categoryName}</Text>
            <Text style={styles.itemDate}>•</Text>
            <Text style={styles.itemDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteTransaction(item.id)}
        style={styles.deleteAction}
      >
        <Text style={styles.actionText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
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
                Start tracking your expenses and income
              </Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingTransactionId(undefined);
          setShowTransactionModal(true);
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listItem: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  separator: {
    height: 6,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 70,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemSubtitle: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "400",
  },
  itemDate: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "400",
  },
  deleteAction: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#FEF2F2",
    marginLeft: 8,
  },
  actionText: {
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});
