import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  SegmentedButtons,
  Chip,
  Surface,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { saveTransaction } from "../../database";
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from "../../types";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../../theme/colors";

export default function AddTransactionScreen({ navigation }) {
  const { user: currentUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!currentUser?.id) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }

    if (!amount.trim() || !category.trim()) {
      Alert.alert("Error", "Please fill in amount and category");
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      const transaction = {
        amount: parseFloat(amount),
        type,
        category: category.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      await saveTransaction(currentUser.id, transaction);
      Alert.alert(
        "Success! ✅",
        `${
          type === TRANSACTION_TYPES.INCOME ? "Income" : "Expense"
        } of $${amount} added successfully`,
        [
          {
            text: "Add Another",
            onPress: () => {
              setAmount("");
              setCategory("");
              setDescription("");
            },
          },
          { text: "Go Back", onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.log("Save transaction error:", error);
      Alert.alert("Error", "Failed to save transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableCategories = () => {
    return type === TRANSACTION_TYPES.INCOME
      ? TRANSACTION_CATEGORIES.INCOME
      : TRANSACTION_CATEGORIES.EXPENSE;
  };

  const formatCurrency = (value) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    return numericValue;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Card style={styles.section}>
              <Card.Content style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Transaction Type</Text>
                <SegmentedButtons
                  value={type}
                  onValueChange={setType}
                  buttons={[
                    {
                      value: TRANSACTION_TYPES.EXPENSE,
                      label: "Expense",
                      icon: "minus-circle-outline",
                      style: {
                        backgroundColor:
                          type === TRANSACTION_TYPES.EXPENSE
                            ? colors.error + "15"
                            : "transparent",
                      },
                    },
                    {
                      value: TRANSACTION_TYPES.INCOME,
                      label: "Income",
                      icon: "plus-circle-outline",
                      style: {
                        backgroundColor:
                          type === TRANSACTION_TYPES.INCOME
                            ? colors.success + "15"
                            : "transparent",
                      },
                    },
                  ]}
                  style={styles.segmentedButtons}
                />
              </Card.Content>
            </Card>

            <Card style={styles.section}>
              <Card.Content style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Amount *</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    value={amount}
                    onChangeText={(text) => setAmount(formatCurrency(text))}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.amountInput}
                    left={<TextInput.Icon icon="currency-usd" />}
                    placeholder="0.00"
                    outlineColor={colors.border.light}
                    activeOutlineColor={
                      type === TRANSACTION_TYPES.INCOME
                        ? colors.success
                        : colors.error
                    }
                    theme={{
                      colors: {
                        primary:
                          type === TRANSACTION_TYPES.INCOME
                            ? colors.success
                            : colors.error,
                      },
                    }}
                  />
                </View>
                {amount && (
                  <View style={styles.preview}>
                    <Text
                      style={[
                        styles.previewText,
                        {
                          color:
                            type === TRANSACTION_TYPES.INCOME
                              ? colors.success
                              : colors.error,
                        },
                      ]}
                    >
                      {type === TRANSACTION_TYPES.INCOME ? "+" : "-"}$
                      {formatCurrency(amount)}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.section}>
              <Card.Content style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Category *</Text>
                <View style={styles.categoryGrid}>
                  {getAvailableCategories().map((cat) => (
                    <Chip
                      key={cat}
                      mode={category === cat ? "flat" : "outlined"}
                      selected={category === cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        category === cat && {
                          backgroundColor:
                            type === TRANSACTION_TYPES.INCOME
                              ? colors.success + "15"
                              : colors.error + "15",
                        },
                      ]}
                      textStyle={[
                        styles.categoryChipText,
                        category === cat && {
                          color:
                            type === TRANSACTION_TYPES.INCOME
                              ? colors.success
                              : colors.error,
                          fontWeight: typography.weights.medium,
                        },
                      ]}
                    >
                      {cat}
                    </Chip>
                  ))}
                </View>
                <TextInput
                  label="Or enter custom category"
                  value={category}
                  onChangeText={setCategory}
                  mode="outlined"
                  style={styles.customCategoryInput}
                  placeholder="Enter category name"
                  outlineColor={colors.border.light}
                  activeOutlineColor={
                    type === TRANSACTION_TYPES.INCOME
                      ? colors.success
                      : colors.error
                  }
                />
              </Card.Content>
            </Card>

            <Card style={styles.section}>
              <Card.Content style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Description (Optional)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  style={styles.descriptionInput}
                  multiline
                  numberOfLines={3}
                  placeholder="Add a note about this transaction..."
                  outlineColor={colors.border.light}
                  activeOutlineColor={colors.primary}
                />
              </Card.Content>
            </Card>

            {amount && category && (
              <Card style={[styles.section, styles.summaryCard]}>
                <Card.Content style={styles.summaryContent}>
                  <Text style={styles.summaryTitle}>Transaction Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Type:</Text>
                    <Chip
                      compact
                      style={[
                        styles.summaryChip,
                        {
                          backgroundColor:
                            type === TRANSACTION_TYPES.INCOME
                              ? colors.success + "15"
                              : colors.error + "15",
                        },
                      ]}
                      textStyle={{
                        color:
                          type === TRANSACTION_TYPES.INCOME
                            ? colors.success
                            : colors.error,
                        fontSize: typography.sizes.xs,
                      }}
                    >
                      {type === TRANSACTION_TYPES.INCOME
                        ? "↗ Income"
                        : "↙ Expense"}
                    </Chip>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Amount:</Text>
                    <Text
                      style={[
                        styles.summaryAmount,
                        {
                          color:
                            type === TRANSACTION_TYPES.INCOME
                              ? colors.success
                              : colors.error,
                        },
                      ]}
                    >
                      ${formatCurrency(amount)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Category:</Text>
                    <Text style={styles.summaryValue}>{category}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={isLoading}
                disabled={isLoading || !amount || !category}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      type === TRANSACTION_TYPES.INCOME
                        ? colors.success
                        : colors.error,
                  },
                ]}
                labelStyle={styles.saveButtonLabel}
                icon={
                  type === TRANSACTION_TYPES.INCOME
                    ? "plus-circle"
                    : "minus-circle"
                }
              >
                {isLoading ? "Saving..." : "Save Transaction"}
              </Button>
            </View>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  sectionContent: {
    paddingVertical: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  segmentedButtons: {
    borderRadius: borderRadius.sm,
  },
  amountContainer: {
    marginBottom: spacing.md,
  },
  amountInput: {
    backgroundColor: colors.surface,
    fontSize: typography.sizes.lg,
  },
  preview: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  previewText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    marginBottom: spacing.xs,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
  },
  customCategoryInput: {
    backgroundColor: colors.surface,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
  },
  summaryCard: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryContent: {
    paddingVertical: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  summaryChip: {
    paddingHorizontal: spacing.xs,
  },
  summaryAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.sm,
  },
  cancelButtonLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  saveButton: {
    flex: 2,
    borderRadius: borderRadius.sm,
  },
  saveButtonLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});
