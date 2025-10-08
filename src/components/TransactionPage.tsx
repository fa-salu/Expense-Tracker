import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import {
  TransactionService,
  type TransactionWithCategory,
  type TransactionFilters,
} from "@/services/transactionService";
import { PDFService } from "@/services/PDFService";
import { TransactionModal } from "@/components/TransactionModal";
import { TransactionFilterBottomSheet } from "@/components/TransactionFilter";
import { FilterButton } from "@/components/FilterButton";
import type { Category } from "@/db/schema";
import { SafeAreaView } from "react-native-safe-area-context";

interface TransactionsPageProps {
  userId: number;
  categories: Category[];
  onDataChange: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  userId,
  categories,
  onDataChange,
}) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showFilterBottomSheet, setShowFilterBottomSheet] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUri, setPdfUri] = useState<string>("");
  const [editingTransactionId, setEditingTransactionId] = useState<number>();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({
    type: "all",
  });

  const loadTransactions = async (filters?: TransactionFilters) => {
    try {
      const data = await TransactionService.getByUserId(userId, filters);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  useEffect(() => {
    loadTransactions(currentFilters);
  }, [userId]);

  const handleGeneratePdf = async () => {
    try {
      const uri = await PDFService.generatePDF(transactions);
      setPdfUri(uri);
      setShowPdfPreview(true);
    } catch (error) {
      PDFService.handleError(error, "generate PDF report");
    }
  };

  const handleDownloadPdf = () => {
    PDFService.showDownloadSuccess();
  };

  const handleSharePdf = async () => {
    try {
      await PDFService.sharePDF(pdfUri);
    } catch (error) {
      PDFService.handleError(error, "share PDF");
    }
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
              await loadTransactions(currentFilters);
              onDataChange();
            } catch (error) {
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
        },
      ]
    );
  };

  const handleApplyFilters = async (filters: TransactionFilters) => {
    setCurrentFilters(filters);
    await loadTransactions(filters);
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
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: item.categoryColor },
              ]}
            />
            <Text style={styles.itemSubtitle}>{item.categoryName}</Text>
            <Text style={styles.itemDate}>•</Text>
            <Text style={styles.itemDate}>
              {new Date(item.date).toLocaleDateString("en-IN")}
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
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Transactions</Text>
          <Text style={styles.pageSubtitle}>
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={handleGeneratePdf}
          >
            <Text style={styles.pdfIcon}>📄</Text>
          </TouchableOpacity>
          <FilterButton
            onPress={() => setShowFilterBottomSheet(true)}
            filters={currentFilters}
          />
        </View>
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
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or add new transactions
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
        onSuccess={async () => {
          await loadTransactions(currentFilters);
          onDataChange();
        }}
        transactionId={editingTransactionId}
      />

      <TransactionFilterBottomSheet
        visible={showFilterBottomSheet}
        onClose={() => setShowFilterBottomSheet(false)}
        onApplyFilters={handleApplyFilters}
        categories={categories}
        currentFilters={currentFilters}
      />

      <Modal
        visible={showPdfPreview}
        animationType="slide"
        onRequestClose={() => setShowPdfPreview(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>PDF Preview</Text>
            <TouchableOpacity
              onPress={() => setShowPdfPreview(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewContainer}>
            <View style={styles.previewContent}>
              <Text style={styles.previewText}>
                PDF generated successfully! 📄
              </Text>
              <Text style={styles.previewSubtext}>
                Your transaction report is ready to download or share.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={handleDownloadPdf}
            >
              <Text style={styles.actionButtonText}>⬇️ Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleSharePdf}
            >
              <Text style={styles.actionButtonText}>📤 Share</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pdfButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  pdfIcon: {
    fontSize: 20,
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
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#64748B",
  },
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 12,
  },
  previewSubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButton: {
    backgroundColor: "#3B82F6",
  },
  shareButton: {
    backgroundColor: "#10B981",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
