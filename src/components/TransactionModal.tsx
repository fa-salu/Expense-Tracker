import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TransactionService } from "@/services/transactionService";
import { CategoryService } from "@/services/categoryService";
import { AuthService } from "@/services/auth";
import type { Category } from "@/db/schema";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionId?: number;
  initialType?: "income" | "expense";
}

export const TransactionModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  transactionId,
  initialType = "expense",
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!transactionId;

  // Load categories when visible, type changes, or transactionId changes
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible, type]); // Removed transactionId from dependencies

  // Load transaction data separately when editing
  useEffect(() => {
    if (visible && isEdit) {
      loadTransaction();
    } else if (visible && !isEdit) {
      resetForm();
    }
  }, [visible, transactionId]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType(initialType);
    setCategoryId(null);
    setDate(new Date());
  };

  const loadCategories = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user) {
        const cats = await CategoryService.getByType(user.id, type);
        setCategories(cats);

        // Reset categoryId when type changes and set first category as default
        if (cats.length > 0) {
          // Only set the first category if we're not editing or if categoryId is null
          if (!isEdit || categoryId === null) {
            setCategoryId(cats[0].id);
          } else {
            // Check if current categoryId exists in new categories
            const categoryExists = cats.find((cat) => cat.id === categoryId);
            if (!categoryExists) {
              setCategoryId(cats[0].id);
            }
          }
        } else {
          setCategoryId(null);
        }
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const loadTransaction = async () => {
    try {
      const transaction = await TransactionService.getById(transactionId!);
      if (transaction) {
        setAmount(transaction.amount);
        setDescription(transaction.description);
        setType(transaction.type as "income" | "expense");
        setCategoryId(transaction.categoryId);
        setDate(new Date(transaction.date));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load transaction");
    }
  };

  // Handle type change - this ensures categories are reloaded and categoryId is reset
  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategoryId(null); // Reset categoryId when type changes
  };

  const handleSubmit = async () => {
    if (!amount.trim() || !description.trim() || !categoryId) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error("User not found");

      const data = {
        amount: numAmount.toString(),
        description: description.trim(),
        type,
        categoryId: categoryId!,
        userId: user.id,
        date: date.toISOString().split("T")[0],
      };

      if (isEdit) {
        await TransactionService.update(transactionId!, data);
      } else {
        await TransactionService.create(data);
      }

      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEdit ? "Edit Transaction" : "Add Transaction"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "expense" && styles.activeType,
                  ]}
                  onPress={() => handleTypeChange("expense")}
                >
                  <Text
                    style={[
                      styles.typeText,
                      type === "expense" && styles.activeTypeText,
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "income" && styles.activeType,
                  ]}
                  onPress={() => handleTypeChange("income")}
                >
                  <Text
                    style={[
                      styles.typeText,
                      type === "income" && styles.activeTypeText,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                maxLength={100}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>
              {categories.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryButton,
                          categoryId === cat.id && styles.selectedCategory,
                        ]}
                        onPress={() => setCategoryId(cat.id)}
                      >
                        <Text
                          style={[
                            styles.categoryIcon,
                            categoryId === cat.id &&
                              styles.selectedCategoryIcon,
                          ]}
                        >
                          {cat.icon}
                        </Text>
                        <Text
                          style={[
                            styles.categoryName,
                            categoryId === cat.id &&
                              styles.selectedCategoryName,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.noCategoriesContainer}>
                  <Text style={styles.noCategoriesText}>
                    No {type} categories available
                  </Text>
                  <Text style={styles.noCategoriesSubtext}>
                    Please create a category first
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (loading || !categoryId) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={loading || !categoryId}
            >
              <Text style={styles.saveText}>
                {loading ? "Saving..." : isEdit ? "Update" : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 20,
    color: "#666",
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeType: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 16,
    color: "#666",
  },
  activeTypeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: "#007AFF",
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  selectedCategoryIcon: {
    // Icon styles when selected (if needed)
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  selectedCategoryName: {
    color: "white",
    fontWeight: "600",
  },
  noCategoriesContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  noCategoriesText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  noCategoriesSubtext: {
    fontSize: 14,
    color: "#999",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
