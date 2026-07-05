/**
 * Daily Report PDF Document Component
 * Generates professional PDF reports for daily business metrics
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
import { DailyReportData } from "../api/dailyReport";
import { format } from "date-fns";

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

interface DailyReportPdfProps {
  reports: DailyReportData[];
  logoImage?: string;
}

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
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F2937",
  },
  // Summary Cards Grid
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 4,
    marginRight: "2%",
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 8,
    color: "#6B7280",
    marginBottom: 2,
  },
  summaryCardValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
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
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1pt solid #E5E7EB",
  },
  tableCell: {
    fontSize: 9,
    color: "#4B5563",
    flex: 1,
  },
  // Status Badge
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  statusBadgeCompleted: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  statusBadgePending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #E5E7EB",
    paddingTop: 8,
    fontSize: 7,
    color: "#9CA3AF",
  },
  // Chart Placeholder
  chartPlaceholder: {
    height: 120,
    backgroundColor: "#F9FAFB",
    border: "1pt solid #E5E7EB",
    borderRadius: 4,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    fontSize: 8,
    color: "#9CA3AF",
  },
});

/**
 * Format currency for PDF
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Header Component
 */
const PdfHeader = ({ title, subtitle, dateRange, logoImage }: any) => (
  <View style={styles.header}>
    {logoImage && <PDFImage style={styles.logo} src={logoImage} />}
    <View style={styles.titleSection}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <View style={styles.dateSection}>
      <Text style={styles.dateText}>Generated: {format(new Date(), "PPP p")}</Text>
      {dateRange && (
        <Text style={styles.dateText}>
          {dateRange}
        </Text>
      )}
    </View>
  </View>
);

/**
 * Summary Cards Component
 */
const SummaryCards = ({ data }: { data: DailyReportData }) => (
  <View style={styles.summaryGrid}>
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardLabel}>Total Revenue</Text>
      <Text style={styles.summaryCardValue}>{formatCurrency(data.sales.totalRevenue)}</Text>
    </View>
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardLabel}>Total Orders</Text>
      <Text style={styles.summaryCardValue}>{data.orders.totalCount}</Text>
    </View>
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardLabel}>Total Customers</Text>
      <Text style={styles.summaryCardValue}>{data.customers.totalCustomers}</Text>
    </View>
    <View style={styles.summaryCard}>
      <Text style={styles.summaryCardLabel}>Products Processed</Text>
      <Text style={styles.summaryCardValue}>{data.products.totalProcessed}</Text>
    </View>
  </View>
);

/**
 * Sales Details Card
 */
const SalesCard = ({ data }: { data: DailyReportData }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Sales Breakdown</Text>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Total Revenue</Text>
      <Text style={styles.cardValue}>{formatCurrency(data.sales.totalRevenue)}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Total Paid</Text>
      <Text style={styles.cardValue}>{formatCurrency(data.sales.totalPaid)}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Total Discount</Text>
      <Text style={styles.cardValue}>{formatCurrency(data.sales.totalDiscount)}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Delivery Charges</Text>
      <Text style={styles.cardValue}>{formatCurrency(data.sales.totalDeliveryCharge)}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Average Order Value</Text>
      <Text style={styles.cardValue}>{formatCurrency(data.sales.averageOrderValue)}</Text>
    </View>
  </View>
);

/**
 * Orders Table
 */
const OrdersTable = ({ data }: { data: DailyReportData }) => (
  <View>
    <Text style={styles.sectionTitle}>Order Status Breakdown</Text>
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Status</Text>
        <Text style={styles.tableHeaderCell}>Count</Text>
        <Text style={styles.tableHeaderCell}>Percentage</Text>
      </View>
      {Object.entries(data.orders.byStatus).map(([status, count]) => {
        if (count === 0) return null;
        const percentage = data.orders.totalCount > 0
          ? ((count / data.orders.totalCount) * 100).toFixed(1)
          : "0";
        return (
          <View key={status} style={styles.tableRow}>
            <Text style={styles.tableCell}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
            <Text style={styles.tableCell}>{count}</Text>
            <Text style={styles.tableCell}>{percentage}%</Text>
          </View>
        );
      })}
    </View>
  </View>
);

/**
 * Payments Table
 */
const PaymentsTable = ({ data }: { data: DailyReportData }) => (
  <View>
    <Text style={styles.sectionTitle}>Payment Methods Distribution</Text>
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Method</Text>
        <Text style={styles.tableHeaderCell}>Amount</Text>
        <Text style={styles.tableHeaderCell}>Percentage</Text>
      </View>
      {Object.entries(data.payments.byMethod).map(([method, amount]) => {
        if (amount === 0) return null;
        const totalAmount = Object.values(data.payments.byMethod).reduce((sum, val) => sum + val, 0);
        const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : "0";
        const methodName = method.charAt(0).toUpperCase() + method.slice(1);
        return (
          <View key={method} style={styles.tableRow}>
            <Text style={styles.tableCell}>{methodName}</Text>
            <Text style={styles.tableCell}>{formatCurrency(amount)}</Text>
            <Text style={styles.tableCell}>{percentage}%</Text>
          </View>
        );
      })}
    </View>
  </View>
);

/**
 * Customer Insights Card
 */
const CustomerCard = ({ data }: { data: DailyReportData }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Customer Insights</Text>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Total Customers</Text>
      <Text style={styles.cardValue}>{data.customers.totalCustomers}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>New Customers</Text>
      <Text style={styles.cardValue}>{data.customers.newCustomers}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Returning Customers</Text>
      <Text style={styles.cardValue}>{data.customers.returningCustomers}</Text>
    </View>
  </View>
);

/**
 * Products Card
 */
const ProductsCard = ({ data }: { data: DailyReportData }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>Product Metrics</Text>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Total Processed</Text>
      <Text style={styles.cardValue}>{data.products.totalProcessed}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Items Updated</Text>
      <Text style={styles.cardValue}>{data.products.itemsUpdated}</Text>
    </View>
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>Processing Time</Text>
      <Text style={styles.cardValue}>{data.products.processingTime}</Text>
    </View>
  </View>
);

/**
 * Footer Component
 */
const PdfFooter = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
  <View style={styles.footer}>
    <Text>Daily Report System - Automated Report Generation</Text>
    <Text>Page {pageNumber} of {totalPages}</Text>
  </View>
);

/**
 * Main Daily Report PDF Document
 */
export const DailyReportPdfDocument: React.FC<DailyReportPdfProps> = ({ reports, logoImage }) => {
  const totalPages = reports.length + 1; // +1 for summary page

  return (
    <Document>
      {/* Summary Page */}
      <Page size="A4" style={styles.page}>
        <PdfHeader
          title="Daily Business Report"
          subtitle={reports.length > 1
            ? `Report Period: ${reports[0].date} to ${reports[reports.length - 1].date}`
            : `Report Date: ${reports[0].date}`}
          dateRange={reports.length > 1 ? `${reports[0].date} - ${reports[reports.length - 1].date}` : undefined}
          logoImage={logoImage}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <SummaryCards data={reports[0]} />
        </View>

        <View style={styles.section}>
          <SalesCard data={reports[0]} />
        </View>

        <View style={styles.section}>
          <CustomerCard data={reports[0]} />
        </View>

        <View style={styles.section}>
          <ProductsCard data={reports[0]} />
        </View>

        <PdfFooter pageNumber={1} totalPages={totalPages} />
      </Page>

      {/* Detailed Pages for Each Report */}
      {reports.map((report, index) => (
        <Page key={report.date} size="A4" style={styles.page}>
          <PdfHeader
            title={`Daily Report Details - ${report.date}`}
            subtitle={`Generated on ${format(new Date(report.timestamp), "PPP p")}`}
            logoImage={logoImage}
          />

          <View style={styles.section}>
            <OrdersTable data={report} />
          </View>

          <View style={styles.section}>
            <PaymentsTable data={report} />
          </View>

          <PdfFooter pageNumber={index + 2} totalPages={totalPages} />
        </Page>
      ))}
    </Document>
  );
};

export default DailyReportPdfDocument;
