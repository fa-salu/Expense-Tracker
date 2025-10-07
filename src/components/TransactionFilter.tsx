import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Category } from "@/db/schema";
import type { TransactionFilters } from "@/services/transactionService";

interface TransactionFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: TransactionFilters) => void;
  categories: Category[];
  currentFilters: TransactionFilters;
}

export const TransactionFilterBottomSheet: React.FC<
  TransactionFilterBottomSheetProps
> = ({ visible, onClose, onApplyFilters, categories, currentFilters }) => {
  const [filters, setFilters] = useState<TransactionFilters>(currentFilters);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, visible]);

  const handleDateFromChange = (event: any, selectedDate?: Date) => {
    setShowDateFromPicker(false);
    if (selectedDate) {
      setFilters({
        ...filters,
        dateFrom: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const handleDateToChange = (event: any, selectedDate?: Date) => {
    setShowDateToPicker(false);
    if (selectedDate) {
      setFilters({
        ...filters,
        dateTo: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const toggleCategory = (categoryId: number) => {
    const currentIds = filters.categoryIds || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id) => id !== categoryId)
      : [...currentIds, categoryId];

    setFilters({
      ...filters,
      categoryIds: newIds.length > 0 ? newIds : undefined,
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: TransactionFilters = {
      type: "all",
    };
    setFilters(resetFilters);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Select Date";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.title}>Filter Transactions</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.resetButton}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                style={styles.applyButton}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Date Range</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>From</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDateFromPicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(filters.dateFrom)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateField}>
                  <Text style={styles.fieldLabel}>To</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDateToPicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(filters.dateTo)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Transaction Type</Text>
              <View style={styles.typeRow}>
                {[
                  { key: "all", label: "All", color: "#64748B", icon: "📊" },
                  {
                    key: "income",
                    label: "Income",
                    color: "#10B981",
                    icon: "⬆️",
                  },
                  {
                    key: "expense",
                    label: "Expense",
                    color: "#EF4444",
                    icon: "⬇️",
                  },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton,
                      filters.type === type.key && {
                        backgroundColor: type.color,
                      },
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, type: type.key as any })
                    }
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.typeButtonText,
                        filters.type === type.key && { color: "white" },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ Categories</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => {
                  const isSelected =
                    filters.categoryIds?.includes(category.id) || false;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        isSelected && {
                          backgroundColor: category.color,
                          borderColor: category.color,
                        },
                      ]}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor: isSelected
                              ? "white"
                              : category.color,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && { color: "white" },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {showDateFromPicker && (
            <DateTimePicker
              value={filters.dateFrom ? new Date(filters.dateFrom) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateFromChange}
            />
          )}

          {showDateToPicker && (
            <DateTimePicker
              value={filters.dateTo ? new Date(filters.dateTo) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateToChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
  },
  applyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  typeIcon: {
    fontSize: 16,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
});
