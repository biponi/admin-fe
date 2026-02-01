import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image as PDFImage,
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
    paddingBottom: 50,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 12,
    borderBottom: "2pt solid #000000",
  },
  logoSection: {
    flexDirection: "column",
  },
  logo: {
    width: 70,
    height: 40,
    objectFit: "contain",
    marginBottom: 4,
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
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 5,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceMetaRow: {
    flexDirection: "row",
    marginBottom: 2,
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
    padding: 20,
    paddingTop: 12,
    flex: 1,
  },
  // Addresses Section
  addressSection: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 15,
  },
  addressBox: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
    borderBottom: "1pt solid #000000",
    paddingBottom: 3,
    marginBottom: 5,
  },
  addressText: {
    fontSize: 8,
    lineHeight: 1.3,
    marginBottom: 1,
  },
  addressTextBold: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bengaliText: {
    fontFamily: "BengaliFont",
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 1,
  },
  // Order Info Bar
  orderInfoBar: {
    flexDirection: "row",
    backgroundColor: "#dcdde1",
    padding: 6,
    marginBottom: 10,
  },
  orderInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  orderInfoLabel: {
    fontSize: 7,
    color: "#1e272e",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orderInfoValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e272e",
  },
  orderInfoDivider: {
    width: 1,
    backgroundColor: "#444444",
    marginHorizontal: 8,
  },
  // Notes
  notesBox: {
    border: "1pt solid #000000",
    padding: 6,
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 3,
  },
  notesText: {
    fontSize: 7,
    lineHeight: 1.3,
    fontStyle: "italic",
  },
  // Table - OPTIMIZED FOR SPACE
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#dcdde1",
    padding: 5,
  },
  tableHeaderCell: {
    color: "#1e272e",
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #CCCCCC",
    padding: 2,
    paddingVertical: 2,
    minHeight: 10,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#F5F5F5",
  },
  tableCell: {
    fontSize: 7,
    textAlign: "center",
  },
  quantityText: {
    textAlign: "center",
    padding: "4px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    fontWeight: "bold",
    border: "1px solid #cccccc",
  },
  tableCellProduct: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "left",
  },
  tableCellRight: {
    textAlign: "right",
  },
  productImage: {
    width: 24,
    height: 24,
    objectFit: "contain",
    marginLeft: 0,
  },
  // Summary
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryBox: {
    width: 200,
    border: "1pt solid #000000",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottom: "0.5pt solid #CCCCCC",
  },
  summaryRowLast: {
    borderBottom: "none",
  },
  summaryRowTotal: {
    backgroundColor: "#dcdde1",
    borderBottom: "none",
    color: "#1e272e",
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 8,
  },
  summaryLabelTotal: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e272e",
  },
  summaryValueTotal: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e272e",
  },
  // Payment Info
  paymentSection: {
    marginTop: 12,
    flexDirection: "row",
    gap: 15,
  },
  paymentBox: {
    flex: 1,
    border: "1pt solid #000000",
    padding: 8,
  },
  paymentTitle: {
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 5,
    borderBottom: "0.5pt solid #000000",
    paddingBottom: 3,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  paymentLabel: {
    fontSize: 7,
  },
  paymentValue: {
    fontSize: 7,
    fontWeight: "bold",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: "1pt solid #000000",
    padding: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
  },
  footerText: {
    fontSize: 6,
    color: "#666666",
    marginBottom: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: "center",
  },
  thankYou: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  pageNumber: {
    fontSize: 7,
    fontWeight: "bold",
  },
});

// Helper function to fetch and convert image to base64 for PDF
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    // Fetch the image with proper CORS
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      return url;
    }

    const blob = await response.blob();

    // Convert blob to base64 using FileReader
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

        // If it's WebP, we need to convert it to PNG via canvas
        if (blob.type === "image/webp") {
          const img = new Image();

          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");

              if (!ctx) {
                resolve(result);
                return;
              }

              ctx.drawImage(img, 0, 0);
              const pngDataUrl = canvas.toDataURL("image/png");
              resolve(pngDataUrl);
            } catch {
              resolve(result);
            }
          };

          img.onerror = () => {
            resolve(result);
          };

          img.src = result;
        } else {
          // Not WebP, return as-is
          resolve(result);
        }
      };

      reader.onerror = () => {
        resolve(url);
      };

      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
};

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
  logoImage?: string;
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  order,
  logoImage,
}) => {
  const orderDate = new Date(order.timestamps.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
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
            <PDFImage
              style={styles.logo}
              src={
                logoImage ||
                "https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png"
              }
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
                  { width: "15%", textAlign: "left" },
                ]}>
                IMAGE
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "20%", textAlign: "left" },
                ]}>
                PRODUCT TITLE
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>
                VARIANT
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>QTY</Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "12%", textAlign: "right" },
                ]}>
                PRICE
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "10%", textAlign: "right" },
                ]}>
                DISC
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: "12%", textAlign: "right" },
                ]}>
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
                <View
                  style={{
                    width: "15%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingLeft: 2,
                  }}>
                  <PDFImage
                    style={styles.productImage}
                    src={product?.thumbnail}
                  />
                </View>
                <SmartText
                  style={[
                    styles.tableCellProduct,
                    { width: "20%", textAlign: "left" },
                  ]}>
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
                <Text
                  style={[
                    styles.tableCell,
                    styles.quantityText,
                    { width: "8%" },
                  ]}>
                  {"x " + product.quantity}
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
                  Tk{" "}
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
                <Text style={[styles.summaryLabelTotal, { fontSize: 9 }]}>
                  BALANCE DUE
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { fontSize: 9, fontWeight: "bold", color: "#1e272e" },
                  ]}>
                  Tk {due.toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
          {/* Payment Terms */}
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
                  {due > 0 ? (paid > 0 ? "Partial" : "Unpaid") : "Paid"}
                </Text>
              </View>
            </View>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>TERMS & CONDITIONS</Text>
              <Text style={[styles.paymentLabel, { lineHeight: 1.3 }]}>
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

// Helper function to preload images from order
const preloadOrderImages = async (order: IOrder) => {
  const logoUrl =
    "https://res.cloudinary.com/emerging-it/image/upload/v1755976159/2193d5ff-ffb3-4fb7-ae67-c7a79e89c3f6__1_-removebg-preview_sobjwy.png";

  // Preload logo
  const logoBase64 = await fetchImageAsBase64(logoUrl);

  // Preload product thumbnails
  const productImagesMap: Record<string, string> = {};
  const imagePromises = order.products
    .filter((p) => p.thumbnail)
    .map(async (product) => {
      if (product.thumbnail) {
        const base64 = await fetchImageAsBase64(product.thumbnail);
        productImagesMap[product.id] = base64;
      }
    });

  await Promise.all(imagePromises);

  return { logoBase64, productImagesMap };
};

// Export functions
export const generateReactPdfInvoice = async (order: IOrder) => {
  // Preload images before generating PDF
  const { logoBase64, productImagesMap } = await preloadOrderImages(order);

  // Create modified order with base64 images
  const orderWithBase64Images = {
    ...order,
    products: order.products.map((product) => ({
      ...product,
      thumbnail: productImagesMap[product.id] || product.thumbnail,
    })),
  };

  const blob = await pdf(
    <InvoiceDocument order={orderWithBase64Images} logoImage={logoBase64} />,
  ).toBlob();

  // Cleanup object URLs after PDF is generated
  const objectUrlsToClean = [
    logoBase64,
    ...Object.values(productImagesMap),
  ].filter((url) => url.startsWith("blob:"));

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${order.orderNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(url);

  // Clean up image object URLs
  objectUrlsToClean.forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
};

export const generateReactPdfInvoiceBlob = async (
  order: IOrder,
): Promise<Blob> => {
  // Preload images before generating PDF
  const { logoBase64, productImagesMap } = await preloadOrderImages(order);

  // Create modified order with base64 images
  const orderWithBase64Images = {
    ...order,
    products: order.products.map((product) => ({
      ...product,
      thumbnail: productImagesMap[product.id] || product.thumbnail,
    })),
  };

  const blob = await pdf(
    <InvoiceDocument order={orderWithBase64Images} logoImage={logoBase64} />,
  ).toBlob();

  // Note: We can't clean up object URLs here immediately since the caller might
  // still be using the blob. The caller is responsible for cleanup.
  // However, since react-pdf processes images immediately, we could clean up after a delay.
  setTimeout(() => {
    const objectUrlsToClean = [
      logoBase64,
      ...Object.values(productImagesMap),
    ].filter((url) => url.startsWith("blob:"));

    objectUrlsToClean.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
  }, 5000);

  return blob;
};

export default InvoiceDocument;
