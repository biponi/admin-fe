/**
 * Commission PDF Document Component
 * Generates PDF document for commission reports with conditional rendering based on export mode
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image as PDFImage,
} from "@react-pdf/renderer";
import { CommissionPdfProps, UserWiseBreakdown } from "./commissionPdfTypes";
import { OrderCommissionDetails } from "../api/commission";
import { BRAND_CONFIG } from "../config/brand";

// Register Bengali fonts (local, not CDN - critical for reliability)
Font.register({
  family: "BengaliFont",
  src: "/fonts/NotoSansBengali-Regular.ttf",
  fontStyle: "normal",
  fontWeight: 400,
});

Font.register({
  family: "BengaliFont",
  src: "/fonts/NotoSansBengali-Bold.ttf",
  fontStyle: "normal",
  fontWeight: 700,
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "BengaliFont",
    fontSize: 10,
    padding: 20,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "2pt solid #E5E7EB",
  },
  logo: {
    width: 60,
    height: 35,
    marginBottom: 5,
  },
  titleSection: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 9,
    color: "#6B7280",
  },
  dateSection: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 2,
  },
  // Section
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
    borderBottom: "1pt solid #D1D5DB",
    paddingBottom: 4,
  },
  // Card
  card: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 9,
    color: "#6B7280",
    flex: 1,
  },
  cardValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
    textAlign: "right",
  },
  // Table
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderBottom: "1pt solid #D1D5DB",
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1pt solid #E5E7EB",
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    color: "#4B5563",
  },
  tableCellRight: {
    flex: 1,
    fontSize: 8,
    color: "#4B5563",
    textAlign: "right",
  },
  // Status badge
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  // Summary stats
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
  },
  // User section
  userSection: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: "1pt solid #E5E7EB",
  },
  userName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#9CA3AF",
    borderTop: "1pt solid #E5E7EB",
    paddingTop: 8,
  },
});

// Status colors
const statusColors: Record<string, { bg: string; text: string }> = {
  paid: { bg: "#D1FAE5", text: "#065F46" },
  unpaid: { bg: "#FEE2E2", text: "#991B1B" },
  pending: { bg: "#FEF3C7", text: "#92400E" },
  hold: { bg: "#E0E7FF", text: "#3730A3" },
  cancelled: { bg: "#F3F4F6", text: "#374151" },
  removed: { bg: "#F3F4F6", text: "#6B7280" },
};

// Format currency
const formatCurrency = (amount: number) => {
  return `৳${amount.toFixed(2)}`;
};

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Cover Page Component
const CoverPage = ({ logoImage, reportDateRange, reportGeneratedAt }: any) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <PDFImage
        style={styles.logo}
        src={logoImage || BRAND_CONFIG.invoiceLogoUrl}
      />
      <View style={styles.titleSection}>
        <Text style={styles.title}>Commission Report</Text>
        <Text style={styles.subtitle}>Combined Commission Analysis</Text>
      </View>
      <View style={styles.dateSection}>
        <Text style={styles.dateText}>Generated: {formatDate(reportGeneratedAt)}</Text>
        <Text style={styles.dateText}>Period: {reportDateRange || "All time"}</Text>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Report Overview</Text>
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Report Type:</Text>
          <Text style={styles.cardValue}>Combined (Order + User-wise)</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Date Range:</Text>
          <Text style={styles.cardValue}>{reportDateRange || "All time"}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Generated At:</Text>
          <Text style={styles.cardValue}>{formatDate(reportGeneratedAt)}</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Report Contents</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Order-wise Analysis</Text>
          <Text style={styles.summaryValue}>Included</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>User-wise Breakdown</Text>
          <Text style={styles.summaryValue}>Included</Text>
        </View>
      </View>
    </View>

    <View style={{ marginTop: 30, padding: 20, textAlign: "center" }}>
      <Text style={{ fontSize: 9, color: "#6B7280" }}>
        This report contains detailed commission information organized by order
        and a comprehensive breakdown by user with payment status.
      </Text>
    </View>
  </Page>
);

// Order Page Component
const OrderPage = ({ order }: { order: OrderCommissionDetails }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Order #{order.orderNumber}</Text>
        <Text style={styles.subtitle}>
          Created: {formatDate(order.orderDates.createdAt)}
        </Text>
      </View>
      <View style={styles.dateSection}>
        <Text style={styles.dateText}>
          Products: {order.summary.totalProducts}
        </Text>
        <Text style={styles.dateText}>
          Total: {formatCurrency(order.summary.totalCommissionAmount)}
        </Text>
      </View>
    </View>

    {/* Order Summary */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Products</Text>
          <Text style={styles.summaryValue}>{order.summary.totalProducts}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Quantity</Text>
          <Text style={styles.summaryValue}>{order.summary.totalQuantity}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Commission</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(order.summary.totalCommissionAmount)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Recipients</Text>
          <Text style={styles.summaryValue}>{order.recipients.length}</Text>
        </View>
      </View>
    </View>

    {/* Status Breakdown */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Status Breakdown</Text>
      <View style={styles.summaryGrid}>
        {Object.entries(order.statusBreakdown).map(([status, data]) => (
          <View key={status} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{status.toUpperCase()}</Text>
            <Text style={styles.summaryValue}>{data.count} items</Text>
            <Text style={{ fontSize: 8, color: "#6B7280" }}>
              {formatCurrency(data.amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>

    {/* Products Table */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Products & Commissions</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
          <Text style={styles.tableHeaderCell}>Qty</Text>
          <Text style={styles.tableHeaderCell}>Price</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>
            Commission
          </Text>
          <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>
            Status
          </Text>
        </View>
        {order.products.map((product, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {product.productName}
            </Text>
            <Text style={styles.tableCell}>{product.quantity}</Text>
            <Text style={styles.tableCell}>
              {formatCurrency(product.productPrice)}
            </Text>
            <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
              {formatCurrency(product.commission.amount)}
            </Text>
            <View style={[styles.tableCellRight, { justifyContent: "flex-end" }]}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      statusColors[product.commission.status]?.bg ||
                      "#F3F4F6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        statusColors[product.commission.status]?.text ||
                        "#374151",
                    },
                  ]}
                >
                  {product.commission.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Recipients */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Commission Recipients</Text>
      <View style={styles.table}>
        {order.recipients.map((recipient, index) => (
          <View key={index} style={styles.cardRow}>
            <Text style={styles.cardLabel}>
              {recipient.userName} ({recipient.productCount} products)
            </Text>
            <Text style={styles.cardValue}>
              {formatCurrency(recipient.commissionAmount)}
            </Text>
          </View>
        ))}
      </View>
    </View>

    <Text
      style={styles.footer}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  </Page>
);

// User-wise Breakdown Page Component
const UserWiseBreakdownPage = ({
  userWiseData,
}: {
  userWiseData: UserWiseBreakdown[];
}) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>User-wise Commission Summary</Text>
        <Text style={styles.subtitle}>
          Breakdown by user with payment status
        </Text>
      </View>
    </View>

    {userWiseData.map((user, userIndex) => (
      <View key={userIndex} style={styles.userSection} wrap={false}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          {user.userAvatar && (
            <PDFImage
              src={user.userAvatar}
              style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
            />
          )}
          <Text style={styles.userName}>{user.userName}</Text>
        </View>

        {/* User Summary */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total to Receive</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(user.totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: "#059669" }]}>
              {formatCurrency(user.paidAmount)}
            </Text>
            <Text style={{ fontSize: 7, color: "#6B7280" }}>
              {user.totalAmount > 0
                ? `${((user.paidAmount / user.totalAmount) * 100).toFixed(1)}%`
                : "0%"}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: "#D97706" }]}>
              {formatCurrency(user.pendingAmount)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Unpaid</Text>
            <Text style={[styles.summaryValue, { color: "#DC2626" }]}>
              {formatCurrency(user.unpaidAmount)}
            </Text>
          </View>
        </View>

        {/* Products by Order */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
          Products by Order
        </Text>
        {user.ordersAndProducts.map((orderGroup, orderIndex) => (
          <View key={orderIndex} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 5, color: "#374151" }}>
              Order #{orderGroup.orderNumber} - {formatDate(orderGroup.orderDate)}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
                <Text style={styles.tableHeaderCell}>Qty</Text>
                <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>
                  Amount
                </Text>
                <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>
                  Status
                </Text>
              </View>
              {orderGroup.products.map((product, prodIndex) => (
                <View key={prodIndex} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {product.productName}
                  </Text>
                  <Text style={styles.tableCell}>{product.quantity}</Text>
                  <Text style={[styles.tableCellRight, { fontWeight: "bold" }]}>
                    {formatCurrency(product.commissionAmount)}
                  </Text>
                  <View style={[styles.tableCellRight, { justifyContent: "flex-end" }]}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusColors[product.commissionStatus]?.bg ||
                            "#F3F4F6",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusColors[product.commissionStatus]?.text ||
                              "#374151",
                          },
                        ]}
                      >
                        {product.commissionStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    ))}

    <Text
      style={styles.footer}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  </Page>
);

// Main Document Component
export const CommissionPdfDocument: React.FC<CommissionPdfProps> = ({
  mode,
  orders = [],
  userWiseData = [],
  logoImage,
  reportDateRange,
  reportGeneratedAt,
}) => {
  const generatedAt = reportGeneratedAt || new Date().toISOString();

  return (
    <Document>
      {/* Cover Page - Only for Combined mode */}
      {mode === "combined" && (
        <CoverPage
          logoImage={logoImage}
          reportDateRange={reportDateRange}
          reportGeneratedAt={generatedAt}
        />
      )}

      {/* Order-wise Pages - Only for order-wise and combined */}
      {(mode === "order-wise" || mode === "combined") &&
        orders.map((order) => <OrderPage key={order.orderId} order={order} />)}

      {/* User-wise Breakdown Page - Only for user-wise and combined */}
      {(mode === "user-wise" || mode === "combined") && (
        <UserWiseBreakdownPage userWiseData={userWiseData} />
      )}
    </Document>
  );
};
