import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { IOrder } from "../pages/order/interface";

// Register Bengali font - Using Noto Sans Bengali from Google Fonts
Font.register({
  family: "NotoSansBengali",
  fonts: [
    {
      src: `${process.env.REACT_APP_API_BASE_URL}/fonts/notosan-light.ttf`,
      fontWeight: "normal",
    },
    {
      src: `${process.env.REACT_APP_API_BASE_URL}/fonts/notosan-bold.ttf`,
      fontWeight: "bold",
    },
  ],
});

// Create styles - Optimized for compactness
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 9,
    padding: 0,
  },
  // Header Styles - Compact
  header: {
    backgroundColor: "#F5F5F5", // Light gray background
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottom: "1px solid #DDDDDD",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 60,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  invoiceDetails: {
    color: "#666666",
    fontSize: 9,
    marginBottom: 1,
  },
  // Content Styles - Compact
  content: {
    padding: 15,
    flex: 1,
  },
  // Information Sections - Compact
  infoSection: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 10,
  },
  infoBox: {
    flex: 1,
    border: "1px solid #E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  infoHeader: {
    backgroundColor: "#F5F5F5",
    padding: 6,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333333",
  },
  infoContent: {
    padding: 8,
    backgroundColor: "#FAFAFA",
  },
  infoText: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.2,
    color: "#333333",
  },
  bengaliText: {
    fontFamily: "NotoSansBengali",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
    lineHeight: 1.2,
    color: "#333333",
  },
  boldText: {
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  extraMargin: {
    marginTop: 5,
  },
  // Special Notes Section - Compact
  notesSection: {
    backgroundColor: "#F5F5F5",
    border: "1px solid #F0C14B",
    borderRadius: 3,
    padding: 8,
    marginVertical: 8,
  },
  notesTitle: {
    color: "#B7791F",
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 3,
  },
  notesText: {
    color: "#B7791F",
    fontSize: 8,
    lineHeight: 1.2,
  },
  // Order Details Section - Compact
  orderDetailsSection: {
    backgroundColor: "#F5F5F5",
    borderRadius: 3,
    padding: 8,
    marginVertical: 8,
  },
  orderDetailsTitle: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 5,
  },
  orderDetailsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 2,
    padding: 5,
  },
  orderDetailsText: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "bold",
  },
  // Table Styles - Highly Compact
  table: {
    marginTop: 12,
    border: "1px solid #E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 6,
  },
  tableHeaderCell: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #F0F0F0",
    padding: 5,
    minHeight: 20,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#F9F9F9",
  },
  tableCell: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 2,
    color: "#333333",
    fontWeight: "bold",
  },
  tableCellLeft: {
    textAlign: "left",
  },
  tableCellRight: {
    textAlign: "right",
  },
  // Summary Rows - Compact
  summaryRow: {
    flexDirection: "row",
    padding: 5,
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 18,
  },
  summaryRowRegular: {
    backgroundColor: "#F9F9F9",
    borderBottom: "1px solid #E9ECEF",
  },
  summaryRowSubtotal: {
    backgroundColor: "#F0F0F0",
  },
  summaryRowDue: {
    backgroundColor: "#F9F9F9",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "bold",
    width: 70,
    textAlign: "right",
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
    width: 60,
    textAlign: "right",
  },
  summaryLabelWhite: {
    color: "#333333",
  },
  summaryValueWhite: {
    color: "#333333",
  },
  // Footer Styles - Compact
  footer: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    marginTop: "auto",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerTitle: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 4,
  },
  footerText: {
    color: "#333333",
    fontSize: 7,
    marginBottom: 1,
    lineHeight: 1.2,
  },
  thankYouText: {
    color: "#F39C12",
    fontStyle: "italic",
    fontSize: 8,
    marginBottom: 8,
    textAlign: "right",
  },
  pageNumber: {
    backgroundColor: "#2980B9",
    color: "#333333",
    padding: 4,
    borderRadius: 2,
    fontSize: 7,
    textAlign: "center",
    minWidth: 30,
    fontWeight: "bold",
  },
});

// Helper function to detect Bengali text
const isBengaliText = (text: string): boolean => {
  const bengaliRegex = /[\u0980-\u09FF]/;
  return bengaliRegex.test(text);
};

// Text component that automatically handles Bengali font
const SmartText = ({ children, style, ...props }: any) => {
  const textStyle = isBengaliText(children)
    ? [styles.bengaliText, style]
    : [styles.infoText, style];
  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

interface InvoiceDocumentProps {
  order: IOrder;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ order }) => {
  const orderDate = new Date(order.timestamps.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  const invoiceNumber = `#${order.id.toString().slice(-4)}`;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header - Compact */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              src='https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png'
            />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetails}>{invoiceNumber}</Text>
            <Text style={styles.invoiceDetails}>Date: {orderDate}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Customer and Shipping Information - Compact */}
          <View style={styles.infoSection}>
            {/* Billing Information */}
            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>BILLING INFORMATION</Text>
              </View>
              <View style={styles.infoContent}>
                <SmartText style={styles.boldText}>
                  {order.customer?.name}
                </SmartText>
                <SmartText style={styles.boldText}>
                  {order.customer?.phoneNumber}
                </SmartText>
                <SmartText>
                  {`${order.shipping?.address}, ${order.shipping?.district}, ${order.shipping?.division}`}
                </SmartText>
                <Text
                  style={[
                    styles.infoText,
                    styles.boldText,
                    styles.extraMargin,
                  ]}>
                  Payment Method:{" "}
                  {order.payment && order.payment.length > 0
                    ? order.payment[0].paymentType
                    : "Cash On Delivery"}
                </Text>
              </View>
            </View>

            {/* Shipping Information */}
            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>SHIPPING INFORMATION</Text>
              </View>
              <View style={styles.infoContent}>
                <SmartText style={styles.boldText}>
                  {order.customer?.name}
                </SmartText>
                <SmartText>{order.customer?.phoneNumber}</SmartText>
                <SmartText>
                  {`${order.shipping?.address}, ${order.shipping?.district}, ${order.shipping?.division}`}
                </SmartText>
              </View>
            </View>
          </View>

          {/* Special Notes - Compact */}
          {order.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>SPECIAL NOTES</Text>
              <SmartText style={styles.notesText}>{order.notes}</SmartText>
            </View>
          )}

          {/* Order Details - Compact */}
          <View style={styles.orderDetailsSection}>
            <Text style={styles.orderDetailsTitle}>ORDER DETAILS</Text>
            <View style={styles.orderDetailsContent}>
              <Text style={styles.orderDetailsText}>
                Order ID: {order.orderNumber}
              </Text>
              <Text style={styles.orderDetailsText}>
                Tracking ID: {order.id}
              </Text>
            </View>
          </View>

          {/* Products Table - Highly Compact */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "6%" }]}>SL</Text>
              <Text style={[styles.tableHeaderCell, { width: "40%" }]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "16%" }]}>
                Variant
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "6%" }]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, { width: "10%" }]}>
                Price
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>
                Disc.
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
                Total
              </Text>
            </View>

            {/* Table Body */}
            {order.products.map((product, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowEven : {},
                ]}>
                <Text style={[styles.tableCell, { width: "6%" }]}>
                  {index + 1}
                </Text>
                <SmartText
                  style={[
                    styles.tableCell,
                    styles.tableCellLeft,
                    { width: "40%" },
                  ]}>
                  {product.name}
                </SmartText>
                <Text style={[styles.tableCell, { width: "16%" }]}>
                  {!product?.variation
                    ? "N/A"
                    : `${product.variation?.color}${
                        product.variation?.size
                          ? ` - ${product.variation.size}`
                          : ""
                      }`}
                </Text>
                <Text style={[styles.tableCell, { width: "6%" }]}>
                  {product.quantity}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellRight,
                    { width: "10%" },
                  ]}>
                  {product.unitPrice.toFixed(0)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellRight,
                    { width: "8%" },
                  ]}>
                  {(product.discount || 0).toFixed(0)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellRight,
                    { width: "14%" },
                  ]}>
                  {(
                    product.quantity * product.unitPrice -
                    (product.discount || 0)
                  ).toFixed(0)}
                </Text>
              </View>
            ))}

            {/* Summary Rows - Compact */}
            <View style={[styles.summaryRow, styles.summaryRowRegular]}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {order.totalPrice.toFixed(0)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowRegular]}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>
                {(order.discount || 0).toFixed(0)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowRegular]}>
              <Text style={styles.summaryLabel}>Paid:</Text>
              <Text style={styles.summaryValue}>{order.paid}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowRegular]}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>{order.deliveryCharge}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowSubtotal]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelWhite]}>
                Total (BDT):
              </Text>
              <Text style={[styles.summaryValue, styles.summaryValueWhite]}>
                {(
                  order.totalPrice +
                  order.deliveryCharge -
                  (order.discount || 0)
                ).toFixed(0)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowDue]}>
              <Text style={[styles.summaryLabel, styles.summaryLabelWhite]}>
                Due (BDT):
              </Text>
              <Text style={[styles.summaryValue, styles.summaryValueWhite]}>
                {order.remaining.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer - Compact */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerTitle}>PRIOR</Text>
              <Text style={styles.footerText}>
                Shop 134, Genetic Plaza, Dhanmondi-27, Dhaka
              </Text>
              <Text style={styles.footerText}>Phone: +8801700534317</Text>
              <Text style={styles.footerText}>
                Email: prior.retailshop.info.bd@gmail.com
              </Text>
              <Text style={styles.footerText}>www.priorbd.com</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.thankYouText}>
                Thank you for your shopping!
              </Text>
              <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) =>
                  `${pageNumber}/${totalPages}`
                }
              />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Export functions to generate and download PDF
export const generateReactPdfInvoice = async (order: IOrder) => {
  const blob = await pdf(<InvoiceDocument order={order} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${order.orderNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

export const generateReactPdfInvoiceBlob = async (
  order: IOrder
): Promise<Blob> => {
  return await pdf(<InvoiceDocument order={order} />).toBlob();
};

export default InvoiceDocument;
