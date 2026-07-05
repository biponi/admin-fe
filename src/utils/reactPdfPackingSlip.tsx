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
import { getOrderDetails } from "../api/order";
import { getPackageBarcode } from "../api/package";
import { BRAND_CONFIG } from "../config/brand";
import QRCode from "qrcode";

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

// Page size: 100mm x 150mm (larger thermal / A6-ish for better readability)
const PAGE_WIDTH = 283;
const PAGE_HEIGHT = 425;

const COLORS = {
  black: "#000000",
  darkGray: "#1a1a1a",
  mediumGray: "#555555",
  lightGray: "#e8e8e8",
  white: "#FFFFFF",
  accent: "#2563eb",
  accentLight: "#eff6ff",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: COLORS.white,
    fontFamily: "BengaliFont",
    fontSize: 8,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    padding: 10,
    color: COLORS.darkGray,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.black,
    borderBottomStyle: "solid",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  brandName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 1,
    color: COLORS.black,
  },
  brandTagline: {
    fontSize: 7,
    color: COLORS.mediumGray,
    letterSpacing: 0.5,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 7,
    color: COLORS.mediumGray,
    marginTop: 4,
    border: "1px solid #e8e8e8",
    padding: 2,
    borderRadius: 2,
  },

  // ── Info Strip ──
  infoStrip: {
    flexDirection: "row",
    backgroundColor: COLORS.accentLight,
    padding: 5,
    marginBottom: 6,
    borderRadius: 2,
    gap: 4,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 6,
    color: COLORS.mediumGray,
    letterSpacing: 0.5,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.darkGray,
  },
  infoDivider: {
    width: 0.5,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 2,
  },

  // ── Customer ──
  customerSection: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 6,
    letterSpacing: 1,
    color: COLORS.mediumGray,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: COLORS.black,
  },
  customerPhone: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 1,
    color: COLORS.darkGray,
  },
  customerAddress: {
    fontSize: 8,
    lineHeight: 1.3,
    color: COLORS.mediumGray,
  },

  // ── Products ──
  productsSection: {
    marginBottom: 6,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    borderBottomStyle: "solid",
  },
  productRowEven: {
    backgroundColor: "#fafafa",
  },
  productInfo: {
    flex: 1,
    marginRight: 6,
  },
  productName: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 1,
    color: COLORS.darkGray,
  },
  productVariant: {
    fontSize: 7,
    color: COLORS.mediumGray,
  },
  qtyBadge: {
    backgroundColor: COLORS.black,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: "center",
  },
  qtyText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.white,
  },

  // Single column for 1-2 products (larger)
  singleProductRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 3,
    marginBottom: 4,
  },
  singleProductName: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 6,
    color: COLORS.darkGray,
  },
  singleProductQty: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: COLORS.black,
    color: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },

  // ── COD Amount ──
  codSection: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.black,
    padding: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#fafafa",
  },
  codLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginRight: 6,
    color: COLORS.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  codAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },

  // ── Bottom: Barcode + QR ──
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: "auto",
  },
  barcodeSection: {
    marginRight: 6,
    alignItems: "flex-start",
    position: "relative",
    height: "120%",
  },
  barcodeImage: {
    width: 120,
    height: 50,
    objectFit: "contain",
    marginTop: "auto",
    position: "absolute",
    bottom: 0,
  },
  barcodeLabel: {
    fontSize: 6,
    color: COLORS.mediumGray,
    letterSpacing: 0.5,
  },
  qrSection: {
    alignItems: "center",
  },
  qrImage: {
    width: 60,
    height: 60,
  },
  qrLabel: {
    fontSize: 6,
    color: COLORS.mediumGray,
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // ── Notes ──
  notesBox: {
    borderWidth: 0.5,
    borderStyle: "dotted",
    borderColor: COLORS.darkGray,
    padding: 4,
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 2,
    color: COLORS.mediumGray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 7,
    lineHeight: 1.3,
    color: COLORS.darkGray,
  },

  // ── Footer ──
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
    borderTopStyle: "solid",
    paddingTop: 4,
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 6,
    color: COLORS.mediumGray,
  },
});

interface PackingSlipDocumentProps {
  order: IOrder;
  qrCodeImage?: string;
  barcodeImage?: string;
}

const PackingSlipDocument: React.FC<PackingSlipDocumentProps> = ({
  order,
  qrCodeImage,
  barcodeImage,
}) => {
  const orderDate = new Date(order.timestamps.createdAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );
  const due = order.remaining;

  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 2) + "..";
  };

  const formatVariant = (product: any): string => {
    if (!product.variation) return "";
    const parts: string[] = [];
    if (product.variation.color) parts.push(product.variation.color);
    if (product.variation.size) parts.push(product.variation.size);
    return parts.length > 0 ? `(${parts.join(" / ")})` : "";
  };

  return (
    <Document>
      <Page
        size={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
        style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandName}>{BRAND_CONFIG.companyName}</Text>
            <Text style={styles.brandTagline}>{BRAND_CONFIG.address}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{orderDate}</Text>
          </View>
        </View>

        {/* Info Strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Invoice</Text>
            <Text style={styles.infoValue}>INV-{order.orderNumber}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>
              {order.products.reduce((sum, p) => sum + (p.quantity || 0), 0)}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order.payment?.[0]?.paymentType || "COD"}
            </Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionLabel}>Ship To</Text>
          <Text style={styles.customerName}>{order.customer?.name}</Text>
          <Text style={styles.customerPhone}>
            {order.customer?.phoneNumber}
          </Text>
          <Text style={styles.customerAddress}>
            {order.shipping?.address}
            {order.shipping?.district ? `, ${order.shipping.district}` : ""}
            {order.shipping?.division ? `, ${order.shipping.division}` : ""}
          </Text>
        </View>

        {/* Products */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionLabel}>Items</Text>
          {order.products.length <= 2
            ? order.products.map((product, index) => (
                <View key={index} style={styles.singleProductRow}>
                  <View style={{ marginRight: 6 }}>
                    <Text style={styles.singleProductName}>
                      {`${truncate(product.name.toUpperCase(), 25)} ${formatVariant(product) ? ` ${formatVariant(product)}` : ""}`}
                    </Text>
                  </View>
                  <Text style={styles.singleProductQty}>
                    x{product.quantity}
                  </Text>
                </View>
              ))
            : order.products.map((product, index) => (
                <View
                  key={index}
                  style={[
                    styles.productRow,
                    index % 2 === 0 ? styles.productRowEven : {},
                  ]}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {`${truncate(product.name.toUpperCase(), 20)} ${formatVariant(product) ? ` ${formatVariant(product)}` : ""}`}
                    </Text>
                  </View>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>x{product.quantity}</Text>
                  </View>
                </View>
              ))}
        </View>

        {/* COD Amount */}
        <View style={styles.codSection}>
          <Text style={styles.codLabel}>Amount to Pay</Text>
          <Text style={styles.codAmount}>
            {due > 0 ? due.toFixed(0) : "0"} {BRAND_CONFIG.currency}
          </Text>
        </View>

        {/* Notes */}
        {order.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Special Instructions</Text>
            <Text style={styles.notesText}>{order.notes.trim()}</Text>
          </View>
        ) : null}

        {/* Bottom: Barcode + QR */}
        <View style={styles.bottomSection}>
          {barcodeImage ? (
            <View style={styles.barcodeSection}>
              <PDFImage style={styles.barcodeImage} src={barcodeImage} />
            </View>
          ) : (
            <View style={styles.barcodeSection} />
          )}
          {qrCodeImage ? (
            <View style={styles.qrSection}>
              <PDFImage style={styles.qrImage} src={qrCodeImage} />
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {BRAND_CONFIG.email} | {BRAND_CONFIG.phone}
          </Text>
          <Text style={styles.footerText}>{BRAND_CONFIG.website}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Preload QR code + barcode
const preloadPackingSlipAssets = async (order: IOrder) => {
  // QR code
  const qrData = JSON.stringify({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: order.customer?.name,
    phone: order.customer?.phoneNumber,
    address: order.shipping?.address,
    district: order.shipping?.district,
    division: order.shipping?.division,
    due: order.remaining,
    trackingUrl: `${BRAND_CONFIG.website}/order/${order.orderNumber}`,
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  // Barcode from server (best-effort — don't fail the slip if barcode is unavailable)
  let barcodeBase64 = "";
  try {
    const barcodeResult = await getPackageBarcode(order.orderNumber);
    if (barcodeResult.success && barcodeResult.data?.barcode) {
      const raw = barcodeResult.data.barcode;
      barcodeBase64 = raw.startsWith("data:")
        ? raw
        : `data:image/png;base64,${raw}`;
    }
  } catch {
    // Barcode generation failed — continue without it
  }

  return { qrCodeBase64, barcodeBase64 };
};

// ── Exported generators ──

export const generateReactPdfPackingSlip = async (order: IOrder) => {
  const { qrCodeBase64, barcodeBase64 } = await preloadPackingSlipAssets(order);

  const blob = await pdf(
    <PackingSlipDocument
      order={order}
      qrCodeImage={qrCodeBase64}
      barcodeImage={barcodeBase64}
    />,
  ).toBlob();

  setTimeout(() => {
    if (qrCodeBase64.startsWith("blob:")) URL.revokeObjectURL(qrCodeBase64);
    if (barcodeBase64.startsWith("blob:")) URL.revokeObjectURL(barcodeBase64);
  }, 5000);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `packing-slip-${order.orderNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

export const generateReactPdfPackingSlipBlob = async (
  order: IOrder,
): Promise<Blob> => {
  const { qrCodeBase64, barcodeBase64 } = await preloadPackingSlipAssets(order);

  const blob = await pdf(
    <PackingSlipDocument
      order={order}
      qrCodeImage={qrCodeBase64}
      barcodeImage={barcodeBase64}
    />,
  ).toBlob();

  setTimeout(() => {
    if (qrCodeBase64.startsWith("blob:")) URL.revokeObjectURL(qrCodeBase64);
    if (barcodeBase64.startsWith("blob:")) URL.revokeObjectURL(barcodeBase64);
  }, 5000);

  return blob;
};

export const generatePackingSlipPdfByOrderIdentifier = async (
  orderIdentifier: string,
) => {
  const response = await getOrderDetails(orderIdentifier);
  if (!response.success || !response.data) {
    throw new Error("Failed to fetch order details");
  }
  const order: IOrder = response.data;
  await generateReactPdfPackingSlip(order);
};

export default PackingSlipDocument;
