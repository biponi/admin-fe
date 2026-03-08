import React, { FC } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

// Register fonts (optional, using standard fonts for now)
Font.register({
  family: "Helvetica",
  src: "https://fonts.gstatic.com/s/helvetica/v20/...",
});

interface TransactionPDFDocumentProps {
  data: Array<{
    orderId: string | null;
    customerName?: string;
    customerPhone?: string;
    intent: string;
    amount: number;
    status: string;
    source: string;
    trxId: string;
    createdAt: string;
  }>;
  summary?: {
    totalCount: number;
    successCount: number;
    failedCount: number;
    totalAmount: number;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
    fontSize: 8,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 15,
    borderBottom: "2 solid #E5E7EB",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 10,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    padding: 6,
    borderRadius: 3,
    flex: 1,
    marginRight: 5,
    border: "1 solid #E5E7EB",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#6B7280",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 6,
    borderBottom: "2 solid #D1D5DB",
  },
  tableHeaderCell: {
    fontWeight: "bold",
    fontSize: 7,
    color: "#374151",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1 solid #E5E7EB",
  },
  tableRowAlt: {
    backgroundColor: "#F9FAFB",
  },
  tableCell: {
    fontSize: 7,
    color: "#1F2937",
  },
  badgeSuccess: {
    color: "#065F46",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    fontWeight: "bold",
  },
  badgeFailed: {
    color: "#991B1B",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    fontWeight: "bold",
  },
  badgeSale: {
    color: "#1E40AF",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    fontWeight: "bold",
  },
  badgePurchase: {
    color: "#92400E",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #E5E7EB",
    paddingTop: 8,
    fontSize: 7,
    color: "#9CA3AF",
  },
});

export const TransactionPDFDocument: FC<TransactionPDFDocumentProps> = ({
  data,
  summary,
}) => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.title}>Transaction Report</Text>
          <Text style={styles.subtitle}>
            Generated on {dayjs().format("dddd, MMMM D, YYYY [at] h:mm A")}
          </Text>

          {/* Summary Cards */}
          {summary && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Transactions</Text>
                <Text style={styles.summaryValue}>{summary.totalCount}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Successful</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: "#059669" },
                  ]}>{`${summary.successCount}`}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Failed</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: "#DC2626" },
                  ]}>{`${summary.failedCount}`}</Text>
              </View>
              <View style={[styles.summaryCard, { marginRight: 0 }]}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text
                  style={
                    styles.summaryValue
                  }>{`TK ${Number(summary.totalAmount).toFixed(2)}`}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, { width: "8%" }]}>
              Order ID
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "19%" }]}>
              Payment By
            </Text>

            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>
              Intent
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>
              Amount
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>
              Status
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>
              Source
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "22%" }]}>
              Trx ID
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
              Created At
            </Text>
          </View>

          {/* Table Body */}
          {data.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
              wrap={false}>
              <Text style={[styles.tableCell, { width: "8%" }]}>
                {item.orderId}
              </Text>
              <Text style={[styles.tableCell, { width: "19%" }]}>
                {item.customerName || "N/A"}
              </Text>

              <View style={[styles.tableCell, { width: "9%" }]}>
                <Text
                  style={
                    item.intent.toLowerCase() === "purchase"
                      ? styles.badgeSale
                      : styles.badgePurchase
                  }>
                  {item.intent.toLowerCase() === "purchase"
                    ? "Purchase"
                    : "Sale"}
                </Text>
              </View>
              <Text style={[styles.tableCell, { width: "9%" }]}>
                TK {Number(item.amount).toFixed(2)}
              </Text>
              <View style={[styles.tableCell, { width: "9%" }]}>
                <Text
                  style={
                    item.status === "Success"
                      ? styles.badgeSuccess
                      : styles.badgeFailed
                  }>
                  {item.status}
                </Text>
              </View>
              <Text style={[styles.tableCell, { width: "9%" }]}>
                {item.source}
              </Text>
              <Text style={[styles.tableCell, { width: "22%" }]}>
                {item.trxId}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {item.createdAt}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Biponi Transaction Management System</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
