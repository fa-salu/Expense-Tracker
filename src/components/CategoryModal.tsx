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
} from "react-native";
import { CategoryService } from "@/services/categoryService";
import { AuthService } from "@/services/auth";

const ICONS = ["🍽️", "🚗", "🛍️", "🎬", "💡", "🏥", "💰", "💼", "📈", "🎁"];
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId?: number;
  initialType?: "income" | "expense";
}

export const CategoryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  categoryId,
  initialType = "expense",
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">(initialType);
  const [icon, setIcon] = useState("🍽️");
  const [color, setColor] = useState("#FF6B6B");
  const [loading, setLoading] = useState(false);

  const isEdit = !!categoryId;

  useEffect(() => {
    if (visible) {
      if (isEdit) {
        loadCategory();
      } else {
        resetForm();
      }
    }
  }, [visible, categoryId]);

  const resetForm = () => {
    setName("");
    setType(initialType);
    setIcon("🍽️");
    setColor("#FF6B6B");
  };

  const loadCategory = async () => {
    try {
      const category = await CategoryService.getById(categoryId!);
      if (category) {
        setName(category.name);
        setType(category.type as "income" | "expense");
        setIcon(category.icon);
        setColor(category.color);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load category");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter category name");
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error("User not found");

      const data = { name: name.trim(), type, icon, color, userId: user.id };

      if (isEdit) {
        await CategoryService.update(categoryId!, data);
      } else {
        await CategoryService.create(data);
      }

      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEdit ? "Edit Category" : "Add Category"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter category name"
                maxLength={50}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "expense" && styles.activeType,
                  ]}
                  onPress={() => setType("expense")}
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
                  onPress={() => setType("income")}
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
              <Text style={styles.label}>Icon</Text>
              <View style={styles.grid}>
                {ICONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.iconButton,
                      icon === item && styles.selectedIcon,
                    ]}
                    onPress={() => setIcon(item)}
                  >
                    <Text style={styles.iconText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.grid}>
                {COLORS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.colorButton,
                      { backgroundColor: item },
                      color === item && styles.selectedColor,
                    ]}
                    onPress={() => setColor(item)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.preview}>
              <Text style={styles.label}>Preview</Text>
              <View style={styles.previewItem}>
                <Text style={styles.previewIcon}>{icon}</Text>
                <Text style={styles.previewName}>
                  {name || "Category Name"}
                </Text>
                <View
                  style={[styles.previewColor, { backgroundColor: color }]}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIcon: {
    backgroundColor: "#007AFF",
  },
  iconText: {
    fontSize: 24,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#333",
  },
  preview: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  previewName: {
    flex: 1,
    fontSize: 16,
  },
  previewColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
