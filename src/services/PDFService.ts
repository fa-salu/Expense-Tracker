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
   * Generate HTML content for PDF
   */
  static generatePdfHtml(
    transactions: TransactionWithCategory[],
    summary: PDFSummary
  ): string {
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const transactionRows = transactions
      .map(
        (t) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">${new Date(
          t.date
        ).toLocaleDateString("en-IN")}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${
              t.categoryColor
            }; display: inline-block;"></span>
            ${t.categoryName}
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">${
          t.description
        }</td>
        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: right; color: ${
          t.type === "income" ? "#10B981" : "#EF4444"
        }; font-weight: 600;">
          ${t.type === "income" ? "+" : "-"}₹${parseFloat(t.amount).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              background-color: #ffffff;
              color: #0F172A;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3B82F6;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              color: #0F172A;
              margin-bottom: 8px;
            }
            .header p {
              color: #64748B;
              font-size: 14px;
            }
            .summary-container {
              display: flex;
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-box {
              flex: 1;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
            }
            .summary-box.income {
              background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
              border: 2px solid #10B981;
            }
            .summary-box.expense {
              background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
              border: 2px solid #EF4444;
            }
            .summary-box.balance {
              background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
              border: 2px solid #3B82F6;
            }
            .summary-label {
              font-size: 12px;
              text-transform: uppercase;
              font-weight: 600;
              margin-bottom: 8px;
              opacity: 0.8;
            }
            .summary-amount {
              font-size: 24px;
              font-weight: 700;
            }
            .income .summary-amount {
              color: #059669;
            }
            .expense .summary-amount {
              color: #DC2626;
            }
            .balance .summary-amount {
              color: #2563EB;
            }
            .table-container {
              margin-top: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #0F172A;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            thead {
              background-color: #F1F5F9;
            }
            th {
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            th:last-child {
              text-align: right;
            }
            td {
              font-size: 14px;
              color: #334155;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #94A3B8;
              font-size: 12px;
              padding-top: 20px;
              border-top: 1px solid #E2E8F0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 Transaction Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>

          <div class="summary-container">
            <div class="summary-box income">
              <div class="summary-label">Total Income</div>
              <div class="summary-amount">₹${summary.income.toFixed(2)}</div>
            </div>
            <div class="summary-box expense">
              <div class="summary-label">Total Expense</div>
              <div class="summary-amount">₹${summary.expense.toFixed(2)}</div>
            </div>
            <div class="summary-box balance">
              <div class="summary-label">Net Balance</div>
              <div class="summary-amount">₹${summary.balance.toFixed(2)}</div>
            </div>
          </div>

          <div class="table-container">
            <div class="section-title">Transaction Details (${
              transactions.length
            } transactions)</div>
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
          </div>

          <div class="footer">
            <p>This report is generated automatically from your transaction records.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate PDF from transactions
   */
  static async generatePDF(
    transactions: TransactionWithCategory[]
  ): Promise<string> {
    if (transactions.length === 0) {
      throw new Error("No transactions to export");
    }

    const summary = this.calculateSummary(transactions);
    const html = this.generatePdfHtml(transactions, summary);
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  }

  /**
   * Share PDF file
   */
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

  /**
   * Show download success message
   */
  static showDownloadSuccess(): void {
    Alert.alert(
      "Success",
      "PDF generated successfully!\n\nYou can share it using the Share button.",
      [{ text: "OK" }]
    );
  }

  /**
   * Handle PDF generation errors
   */
  static handleError(error: unknown, context: string): void {
    console.error(`${context}:`, error);
    const message =
      error instanceof Error ? error.message : `Failed to ${context}`;
    Alert.alert("Error", message);
  }
}
