import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import type { TransactionWithCategory } from "@/services/transactionService";

interface PDFSummary {
  income: number;
  expense: number;
  balance: number;
}

export class PDFService {
  /**
   * Calculate summary from transactions
   */
  static calculateSummary(transactions: TransactionWithCategory[]): PDFSummary {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = income - expense;

    return { income, expense, balance };
  }

  /**
   * Generate preview HTML (PDF-like styled content for WebView)
   */
  static generatePreviewHtml(
    transactions: TransactionWithCategory[],
    summary: PDFSummary
  ): string {
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const currentTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Group transactions by month
    const groupedTransactions = transactions.reduce((groups, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(transaction);
      return groups;
    }, {} as Record<string, TransactionWithCategory[]>);

    const transactionsByMonth = Object.entries(groupedTransactions)
      .map(([month, monthTransactions]) => {
        const monthRows = monthTransactions
          .map(
            (t) => `
            <tr class="transaction-row">
              <td class="date-cell">${new Date(t.date).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                }
              )}</td>
              <td class="category-cell">
                <div class="category-info">
                  <span class="category-dot" style="background-color: ${
                    t.categoryColor
                  };"></span>
                  <span class="category-name">${t.categoryName}</span>
                </div>
              </td>
              <td class="description-cell">${t.description}</td>
              <td class="amount-cell ${t.type}">
                ${t.type === "income" ? "+" : "-"}₹${parseFloat(
              t.amount
            ).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
              </td>
            </tr>
          `
          )
          .join("");

        return `
          <div class="month-section">
            <h3 class="month-header">${month}</h3>
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th class="amount-header">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${monthRows}
              </tbody>
            </table>
          </div>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transaction Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 14px;
              line-height: 1.5;
              color: #1f2937;
              background-color: #ffffff;
              padding: 20px;
              max-width: 100%;
              overflow-x: hidden;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            
            .header h1 {
              font-size: 28px;
              color: #1e293b;
              margin-bottom: 8px;
              font-weight: 700;
            }
            
            .header-subtitle {
              color: #64748b;
              font-size: 12px;
              margin-bottom: 10px;
            }
            
            .report-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              color: #6b7280;
              margin-top: 10px;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
            }
            
            .summary-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .summary-card.income {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              border-color: #10b981;
            }
            
            .summary-card.expense {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              border-color: #ef4444;
            }
            
            .summary-card.balance {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              border-color: #3b82f6;
            }
            
            .summary-label {
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 8px;
              opacity: 0.8;
              letter-spacing: 0.5px;
            }
            
            .summary-amount {
              font-size: 22px;
              font-weight: 700;
              margin-bottom: 5px;
            }
            
            .income .summary-amount {
              color: #059669;
            }
            
            .expense .summary-amount {
              color: #dc2626;
            }
            
            .balance .summary-amount {
              color: ${summary.balance >= 0 ? "#059669" : "#dc2626"};
            }
            
            .summary-count {
              font-size: 10px;
              color: #6b7280;
              font-weight: 500;
            }
            
            .month-section {
              margin-bottom: 25px;
            }
            
            .month-header {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 12px;
              padding: 12px 16px;
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              border-left: 4px solid #3b82f6;
              border-radius: 6px;
            }
            
            .transactions-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .transactions-table thead {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            }
            
            .transactions-table th {
              padding: 12px;
              text-align: left;
              font-size: 11px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .amount-header {
              text-align: right !important;
            }
            
            .transaction-row {
              border-bottom: 1px solid #f3f4f6;
            }
            
            .transaction-row:hover {
              background-color: #f9fafb;
            }
            
            .transaction-row:last-child {
              border-bottom: none;
            }
            
            .transaction-row td {
              padding: 12px;
              font-size: 12px;
              vertical-align: middle;
            }
            
            .date-cell {
              font-weight: 500;
              color: #4b5563;
              white-space: nowrap;
            }
            
            .category-info {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .category-dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              display: inline-block;
              border: 1px solid rgba(0, 0, 0, 0.1);
              flex-shrink: 0;
            }
            
            .category-name {
              font-weight: 500;
              color: #374151;
            }
            
            .description-cell {
              color: #4b5563;
              word-wrap: break-word;
            }
            
            .amount-cell {
              text-align: right;
              font-weight: 600;
              white-space: nowrap;
            }
            
            .amount-cell.income {
              color: #059669;
            }
            
            .amount-cell.expense {
              color: #dc2626;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 10px;
              color: #9ca3af;
            }
            
            .footer-info {
              margin-bottom: 8px;
            }
            
            @media (max-width: 600px) {
              .summary-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }
              
              .transactions-table {
                font-size: 11px;
              }
              
              .transactions-table th,
              .transactions-table td {
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 Transaction Report</h1>
            <div class="header-subtitle">Comprehensive Financial Summary</div>
            <div class="report-info">
              <span>Generated on ${currentDate} at ${currentTime}</span>
              <span>${transactions.length} transaction${
      transactions.length !== 1 ? "s" : ""
    }</span>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-card income">
              <div class="summary-label">Total Income</div>
              <div class="summary-amount">₹${summary.income.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}</div>
              <div class="summary-count">${
                transactions.filter((t) => t.type === "income").length
              } transactions</div>
            </div>
            <div class="summary-card expense">
              <div class="summary-label">Total Expense</div>
              <div class="summary-amount">₹${summary.expense.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}</div>
              <div class="summary-count">${
                transactions.filter((t) => t.type === "expense").length
              } transactions</div>
            </div>
            <div class="summary-card balance">
              <div class="summary-label">Net Balance</div>
              <div class="summary-amount">₹${summary.balance.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}</div>
              <div class="summary-count">${
                summary.balance >= 0 ? "Surplus" : "Deficit"
              }</div>
            </div>
          </div>

          ${transactionsByMonth}

          <div class="footer">
            <div class="footer-info">This report was automatically generated from your transaction records.</div>
            <div>For any discrepancies, please verify with your original transaction data.</div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate PDF HTML for actual PDF generation (simpler for PDF)
   */
  static generatePdfHtml(
    transactions: TransactionWithCategory[],
    summary: PDFSummary
  ): string {
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const transactionRows = transactions
      .map(
        (t) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${new Date(
            t.date
          ).toLocaleDateString("en-IN")}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${
            t.categoryName
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">${
            t.description
          }</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right; color: ${
            t.type === "income" ? "#10B981" : "#EF4444"
          }; font-weight: 600;">
            ${t.type === "income" ? "+" : "-"}₹${parseFloat(t.amount).toFixed(
          2
        )}
          </td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
            .summary { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-box { flex: 1; padding: 20px; border-radius: 8px; text-align: center; }
            .income { background: #D1FAE5; border: 2px solid #10B981; }
            .expense { background: #FEE2E2; border: 2px solid #EF4444; }
            .balance { background: #DBEAFE; border: 2px solid #3B82F6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #F1F5F9; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 Transaction Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>
          
          <div class="summary">
            <div class="summary-box income">
              <h3>Total Income</h3>
              <h2>₹${summary.income.toFixed(2)}</h2>
            </div>
            <div class="summary-box expense">
              <h3>Total Expense</h3>
              <h2>₹${summary.expense.toFixed(2)}</h2>
            </div>
            <div class="summary-box balance">
              <h3>Net Balance</h3>
              <h2>₹${summary.balance.toFixed(2)}</h2>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  static async generatePDF(
    transactions: TransactionWithCategory[]
  ): Promise<string> {
    if (transactions.length === 0) {
      throw new Error("No transactions to export");
    }

    const summary = this.calculateSummary(transactions);
    const html = this.generatePdfHtml(transactions, summary);

    const { uri } = await Print.printToFileAsync({
      html,
      width: 612,
      height: 792,
    });

    return uri;
  }

  static async sharePDF(pdfUri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(pdfUri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Transaction Report",
    });
  }

  static handleError(error: unknown, context: string): void {
    console.error(`${context}:`, error);
    const message =
      error instanceof Error ? error.message : `Failed to ${context}`;
    Alert.alert("Error", message);
  }
}
