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
import { CategoryService } from "@/services/categoryService";
import { CategoryModal } from "@/components/CategoryModal";
import type { Category } from "@/db/schema";

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

  const incomeCategories = categories.filter((cat) => cat.type === "income");
  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.listItem}>
      <View style={styles.itemLeft}>
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
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item.id)}
          style={styles.deleteAction}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Categories</Text>
          <Text style={styles.pageSubtitle}>
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setEditingCategoryId(undefined);
            setShowCategoryModal(true);
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptySubtext}>
              Create categories to organize your transactions and better track
              your spending habits
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                setEditingCategoryId(undefined);
                setShowCategoryModal(true);
              }}
            >
              <Text style={styles.emptyButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={[
              {
                type: "section",
                title: "Income Categories",
                data: incomeCategories,
              },
              {
                type: "section",
                title: "Expense Categories",
                data: expenseCategories,
              },
            ]}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View>
                {renderSectionHeader(item.title, item.data.length)}
                {item.data.length > 0 ? (
                  item.data.map((category, index) => (
                    <View key={category.id}>
                      {renderCategory({ item: category })}
                      {index < item.data.length - 1 && (
                        <View style={styles.separator} />
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySectionContainer}>
                    <Text style={styles.emptySectionText}>
                      No {item.title.toLowerCase()} yet
                    </Text>
                  </View>
                )}
                <View style={styles.sectionSeparator} />
              </View>
            )}
          />
        )}
      </View>

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
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#8B5CF6",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  countBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
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
    height: 8,
  },
  sectionSeparator: {
    height: 24,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: "row",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
  editIcon: {
    fontSize: 16,
  },
  deleteAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  deleteIcon: {
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
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySectionContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  emptySectionText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
