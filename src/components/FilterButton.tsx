import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import type { TransactionFilters } from "@/services/transactionService";

interface FilterButtonProps {
  onPress: () => void;
  filters: TransactionFilters;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onPress,
  filters,
}) => {
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.categoryIds && filters.categoryIds.length > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <TouchableOpacity style={styles.filterButton} onPress={onPress}>
      <Text style={styles.filterIcon}>⚙️</Text>
      {activeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterIcon: {
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
});
