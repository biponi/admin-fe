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

// Register Bengali font
Font.register({
  family: "BengaliFont",
  src: "https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRDf44uEfKiGvxts.ttf",
  fontStyle: "normal",
  fontWeight: 400,
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingBottom: 60,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 25,
    paddingBottom: 20,
    borderBottom: "2pt solid #000000",
  },
  logoSection: {
    flexDirection: "column",
  },
  logo: {
    width: 90,
    height: 50,
    objectFit: "contain",
    marginBottom: 5,
  },
  companyInfo: {
    marginTop: 0,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 7,
    color: "#333333",
    marginBottom: 1,
    lineHeight: 1.3,
  },
  invoiceSection: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 10,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceMetaRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  invoiceMetaLabel: {
    fontSize: 8,
    fontWeight: "bold",
    width: 70,
    textAlign: "right",
  },
  invoiceMetaValue: {
    fontSize: 8,
    width: 80,
    textAlign: "right",
  },
  // Content
  content: {
    padding: 25,
    paddingTop: 20,
    flex: 1,
  },
  // Addresses Section
  addressSection: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  addressBox: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
    borderBottom: "1pt solid #000000",
    paddingBottom: 4,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  addressTextBold: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  bengaliText: {
    fontFamily: "BengaliFont",
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  // Order Info Bar
  orderInfoBar: {
    flexDirection: "row",
    backgroundColor: "#3d3d3d",
    padding: 10,
    marginBottom: 15,
  },
  orderInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  orderInfoLabel: {
    fontSize: 7,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orderInfoValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  orderInfoDivider: {
    width: 1,
    backgroundColor: "#444444",
    marginHorizontal: 10,
  },
  // Notes
  notesBox: {
    border: "1pt solid #000000",
    padding: 10,
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8,
    lineHeight: 1.4,
    fontStyle: "italic",
  },
  // Table
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3d3d3d",
    padding: 8,
  },
  tableHeaderCell: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #CCCCCC",
    padding: 8,
    minHeight: 28,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#F5F5F5",
  },
  tableCell: {
    fontSize: 8,
    textAlign: "center",
  },
  tableCellProduct: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "left",
  },
  tableCellRight: {
    textAlign: "right",
  },
  // Summary
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryBox: {
    width: 220,
    border: "1pt solid #000000",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderBottom: "0.5pt solid #CCCCCC",
  },
  summaryRowLast: {
    borderBottom: "none",
  },
  summaryRowTotal: {
    backgroundColor: "#3d3d3d",
    borderBottom: "none",
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 8,
  },
  summaryLabelTotal: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  summaryValueTotal: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // Payment Info
  paymentSection: {
    marginTop: 20,
    flexDirection: "row",
    gap: 20,
  },
  paymentBox: {
    flex: 1,
    border: "1pt solid #000000",
    padding: 12,
  },
  paymentTitle: {
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
    borderBottom: "0.5pt solid #000000",
    paddingBottom: 4,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 8,
  },
  paymentValue: {
    fontSize: 8,
    fontWeight: "bold",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: "1pt solid #000000",
    padding: 15,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerText: {
    fontSize: 7,
    color: "#666666",
    marginBottom: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: "center",
  },
  thankYou: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  pageNumber: {
    fontSize: 8,
    fontWeight: "bold",
  },
});

// Helper function to detect Bengali text
const isBengaliText = (text: string): boolean => {
  const bengaliRegex = /[\u0980-\u09FF]/;
  return bengaliRegex.test(text);
};

// Smart Text component for Bengali support
const SmartText = ({ children, style, ...props }: any) => {
  if (!children) return null;
  const text = String(children);
  const hasBengali = isBengaliText(text);
  const cleanStyle = style ? (Array.isArray(style) ? style : [style]) : [];
  const styleWithoutWeight = cleanStyle.map((s: any) => {
    if (s && typeof s === "object") {
      const { fontWeight, ...rest } = s;
      return rest;
    }
    return s;
  });
  const textStyle = hasBengali
    ? [styles.bengaliText, ...styleWithoutWeight]
    : [styles.addressText, style];
  return (
    <Text style={textStyle} {...props}>
      {text}
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
  const invoiceNumber = `INV-${order.orderNumber}`;
  const subtotal = order.totalPrice;
  const discount = order.discount || 0;
  const shipping = order.deliveryCharge;
  const total = subtotal + shipping - discount;
  const paid = order.paid;
  const due = order.remaining;

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image
              style={styles.logo}
              src='https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png'
            />
            <View style={styles.companyInfo}>
              <Text style={styles.companyDetail}>Shop 134, Genetic Plaza</Text>
              <Text style={styles.companyDetail}>Dhanmondi-27, Dhaka</Text>
              <Text style={styles.companyDetail}>+880 1700-534317</Text>
              <Text style={styles.companyDetail}>www.priorbd.com</Text>
            </View>
          </View>
          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceMeta}>
              <View style={styles.invoiceMetaRow}>
                <Text style={styles.invoiceMetaLabel}>Invoice No:</Text>
                <Text style={styles.invoiceMetaValue}>{invoiceNumber}</Text>
              </View>
              <View style={styles.invoiceMetaRow}>
                <Text style={styles.invoiceMetaLabel}>Date:</Text>
                <Text style={styles.invoiceMetaValue}>{orderDate}</Text>
              </View>
              <View style={styles.invoiceMetaRow}>
                <Text style={styles.invoiceMetaLabel}>Payment:</Text>
                <Text style={styles.invoiceMetaValue}>
                  {order.payment?.[0]?.paymentType || "Cash On Delivery"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Address Section */}
          <View style={styles.addressSection}>
            <View style={styles.addressBox}>
              <Text style={styles.addressTitle}>BILL TO</Text>
              <SmartText style={styles.addressTextBold}>
                {order.customer?.name}
              </SmartText>
              <Text style={styles.addressText}>
                {order.customer?.phoneNumber}
              </Text>
              <SmartText>{order.shipping?.address}</SmartText>
              <SmartText>{`${order.shipping?.district}, ${order.shipping?.division}`}</SmartText>
            </View>
            <View style={styles.addressBox}>
              <Text style={styles.addressTitle}>SHIP TO</Text>
              <SmartText style={styles.addressTextBold}>
                {order.customer?.name}
              </SmartText>
              <Text style={styles.addressText}>
                {order.customer?.phoneNumber}
              </Text>
              <SmartText>{order.shipping?.address}</SmartText>
              <SmartText>{`${order.shipping?.district}, ${order.shipping?.division}`}</SmartText>
            </View>
          </View>
          {/* Order Info Bar */}
          <View style={styles.orderInfoBar}>
            <View style={styles.orderInfoItem}>
              <Text style={styles.orderInfoLabel}>ORDER NUMBER</Text>
              <Text style={styles.orderInfoValue}>{order.orderNumber}</Text>
            </View>
            <View style={styles.orderInfoDivider} />
            <View style={styles.orderInfoItem}>
              <Text style={styles.orderInfoLabel}>TRACKING ID</Text>
              <Text style={styles.orderInfoValue}>{order.id}</Text>
            </View>
            <View style={styles.orderInfoDivider} />
            <View style={styles.orderInfoItem}>
              <Text style={styles.orderInfoLabel}>ORDER DATE</Text>
              <Text style={styles.orderInfoValue}>{orderDate}</Text>
            </View>
          </View>
          {/* Special Notes */}
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>SPECIAL INSTRUCTIONS</Text>
              <SmartText style={styles.notesText}>{order.notes}</SmartText>
            </View>
          )}
          {/* Products Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "5%" }]}>#</Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "35%", textAlign: "left" },
                ]}>
                ITEM DESCRIPTION
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>
                VARIANT
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>QTY</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>
                PRICE
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "10%" }]}>
                DISC
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>
                AMOUNT
              </Text>
            </View>
            {order.products.map((product, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
                ]}>
                <Text style={[styles.tableCell, { width: "5%" }]}>
                  {index + 1}
                </Text>
                <SmartText style={[styles.tableCellProduct, { width: "35%" }]}>
                  {product.name.toUpperCase()}
                </SmartText>
                <Text style={[styles.tableCell, { width: "18%" }]}>
                  {!product?.variation
                    ? "—"
                    : `${product.variation?.color}${
                        product.variation?.size
                          ? ` / ${product.variation.size}`
                          : ""
                      }`}
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>
                  {product.quantity}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellRight,
                    { width: "12%" },
                  ]}>
                  Tk {product.unitPrice.toFixed(0)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellRight,
                    { width: "10%" },
                  ]}>
                  Tk {(product.discount || 0).toFixed(0)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellRight,
                    { width: "12%" },
                  ]}>
                  Tk
                  {(
                    product.quantity * product.unitPrice -
                    (product.discount || 0)
                  ).toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  Tk {subtotal.toFixed(0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.summaryValue}>
                  −Tk {discount.toFixed(0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  Tk {shipping.toFixed(0)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                <Text style={styles.summaryLabelTotal}>TOTAL</Text>
                <Text style={styles.summaryValueTotal}>
                  Tk {total.toFixed(0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount Paid</Text>
                <Text style={styles.summaryValue}>Tk {paid.toFixed(0)}</Text>
              </View>
              <View
                style={[
                  styles.summaryRow,
                  styles.summaryRowLast,
                  styles.summaryRowTotal,
                ]}>
                <Text style={[styles.summaryLabelTotal, { fontSize: 10 }]}>
                  BALANCE DUE
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { fontSize: 10, fontWeight: "bold", color: "#FFFFFF" },
                  ]}>
                  Tk {due.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
          ~{/* Payment Terms */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>PAYMENT INFORMATION</Text>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Method</Text>
                <Text style={styles.paymentValue}>
                  {order.payment?.[0]?.paymentType || "Cash On Delivery"}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Status</Text>
                <Text style={styles.paymentValue}>
                  {due > 0 ? "Partial" : "Paid"}
                </Text>
              </View>
            </View>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>TERMS & CONDITIONS</Text>
              <Text style={[styles.paymentLabel, { lineHeight: 1.4 }]}>
                • Please inspect items upon delivery{"\n"}• Contact us within
                24hrs for any issues
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              prior.retailshop.info.bd@gmail.com
            </Text>
            <Text style={styles.footerText}>
              Questions? Contact us at +880 1700-534317
            </Text>
          </View>
          <View style={styles.footerCenter}>
            <Text style={styles.thankYou}>THANK YOU FOR YOUR ORDER</Text>
          </View>
          <View style={styles.footerRight}>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Export functions
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
