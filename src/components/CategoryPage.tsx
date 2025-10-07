import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { CategoryService } from "@/services/categoryService";
import { CategoryModal } from "@/components/CategoryModal";
import type { Category } from "@/db/schema";
import { SafeAreaView } from "react-native-safe-area-context";

interface CategoriesPageProps {
  userId: number;
  categories: Category[];
  onDataChange: () => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  userId,
  categories,
  onDataChange,
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number>();
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">(
    "all"
  );

  const handleDeleteCategory = (id: number) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await CategoryService.delete(id);
              onDataChange();
            } catch (error) {
              Alert.alert(
                "Error",
                (error as Error).message || "Failed to delete category"
              );
            }
          },
        },
      ]
    );
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === "income") return cat.type === "income";
    if (activeTab === "expense") return cat.type === "expense";
    return true;
  });

  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setEditingCategoryId(item.id);
        setShowCategoryModal(true);
      }}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <View style={styles.typeContainer}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.type === "income" ? "#DCFCE7" : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: item.type === "income" ? "#166534" : "#991B1B" },
                ]}
              >
                {item.type === "income" ? "Income" : "Expense"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteCategory(item.id)}
        style={styles.deleteAction}
      >
        <Text style={styles.actionText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const TabButton = ({
    title,
    count,
    isActive,
    onPress,
  }: {
    title: string;
    count: number;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
      <View style={[styles.tabCount, isActive && styles.activeTabCount]}>
        <Text
          style={[styles.tabCountText, isActive && styles.activeTabCountText]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.tabContainer}>
        <TabButton
          title="All"
          count={categories.length}
          isActive={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />
        <TabButton
          title="Income"
          count={incomeCategories.length}
          isActive={activeTab === "income"}
          onPress={() => setActiveTab("income")}
        />
        <TabButton
          title="Expense"
          count={expenseCategories.length}
          isActive={activeTab === "expense"}
          onPress={() => setActiveTab("expense")}
        />
      </View>

      <View style={styles.content}>
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptySubtext}>
              Create categories to organize your transactions
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingCategoryId(undefined);
          setShowCategoryModal(true);
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <CategoryModal
        visible={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategoryId(undefined);
        }}
        onSuccess={onDataChange}
        categoryId={editingCategoryId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginRight: 4,
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  tabCount: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeTabCount: {
    backgroundColor: "#DBEAFE",
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabCountText: {
    color: "#3B82F6",
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
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
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
  typeContainer: {
    flexDirection: "row",
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "capitalize",
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
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
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
