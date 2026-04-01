import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import { IRecordProduct } from "../pages/reserve/interface";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "2pt solid #000000",
  },
  headerLeft: {
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  storeName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 9,
    color: "#333333",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: "25px",
  },
  summaryItem: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#000000",
    marginRight: 6,
  },
  summaryValue: {
    fontSize: 9,
    color: "#000000",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderTop: "1pt solid #000000",
    borderBottom: "1pt solid #000000",
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "0.5pt solid #cccccc",
    minHeight: 25,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 10,
    color: "#000000",
  },
  slNo: {
    textAlign: "center",
  },
  productName: {
    fontWeight: "bold",
  },
  variantText: {
    fontSize: 10,
    color: "#333333",
  },
  quantityText: {
    textAlign: "center",
    padding: "4px",
    borderRadius: "10px",
    backgroundColor: "#e0e0e0",
    fontWeight: "bold",
    border: "1px solid #cccccc",
  },
  priceText: {
    textAlign: "right",
  },
  amountText: {
    textAlign: "right",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: "1pt solid #cccccc",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#666666",
  },
  pageNumber: {
    fontSize: 8,
    color: "#666666",
  },
});

interface InventoryDocumentProps {
  storeName: string;
  recordedBy: string;
  recordedDateAt: Date;
  products: IRecordProduct[];
}

const InventoryDocument: React.FC<InventoryDocumentProps> = ({
  recordedDateAt,
  recordedBy,
  storeName,
  products,
}) => {
  const recordedDate = dayjs(recordedDateAt).format("Do MMMM YYYY, hh:mm A");
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalAmount = products.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0,
  );

  const getProductName = (fullName: string) => {
    return fullName.split(" ")[0];
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header - Fixed on every page */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Prior Inventory Record</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Outlet:</Text>
              <Text style={styles.summaryValue}>{storeName}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Recorded By:</Text>
              <Text style={styles.summaryValue}>{recordedBy}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Recorded At:</Text>
              <Text style={styles.summaryValue}>{recordedDate}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Products:</Text>
              <Text style={styles.summaryValue}>{totalProducts}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Quantity:</Text>
              <Text style={styles.summaryValue}>{totalQuantity} units</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, { width: "6%" }]}>#</Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: "22%", textAlign: "left" },
              ]}>
              Name
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "28%" }]}>
              Variant
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: "10%", textAlign: "center" },
              ]}>
              Qty
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: "16%", textAlign: "right" },
              ]}>
              Unit Price
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: "18%", textAlign: "right" },
              ]}>
              Amount
            </Text>
          </View>

          {products.map((product, index) => {
            const name = getProductName(product.name);
            const amount = product.quantity * product.unitPrice;
            const variantName = product.variantDetails
              ? [product.variantDetails.color, product.variantDetails.size]
                  .filter(Boolean)
                  .join(" - ") || "Standard"
              : product?.name.includes(" ")
                ? product?.name.split(" ").slice(1).join(" ")
                : "Standard";

            return (
              <View
                key={product.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
                wrap={false}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.slNo,
                    { width: "6%", textAlign: "left" },
                  ]}>
                  {index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.productName,
                    { width: "22%", textAlign: "left" },
                  ]}>
                  {name.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.variantText,
                    { width: "28%" },
                  ]}>
                  {variantName}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.quantityText,
                    { width: "10%" },
                  ]}>
                  {"x " + product.quantity}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.priceText,
                    { width: "16%" },
                  ]}>
                  {product.unitPrice.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.amountText,
                    { width: "18%" },
                  ]}>
                  {amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer - Fixed on every page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated on {dayjs().format("Do MMMM YYYY")}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

// Export function to generate and download PDF
export const generateInventoryPDF = async (
  storeName: string,
  recordedBy: string,
  recordedDateAt: Date,
  products: IRecordProduct[],
) => {
  const blob = await pdf(
    <InventoryDocument
      storeName={storeName}
      recordedBy={recordedBy}
      recordedDateAt={recordedDateAt}
      products={products}
    />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-${storeName.toLowerCase().replace(/\s+/g, "-")}-${dayjs().format("YYYY-MM-DD")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export function to generate PDF blob (for preview or other uses)
export const generateInventoryPDFBlob = async (
  storeName: string,
  recordedBy: string,
  recordedDateAt: Date,
  products: IRecordProduct[],
): Promise<Blob> => {
  return await pdf(
    <InventoryDocument
      storeName={storeName}
      recordedBy={recordedBy}
      recordedDateAt={recordedDateAt}
      products={products}
    />,
  ).toBlob();
};

export default InventoryDocument;
