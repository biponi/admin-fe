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
  src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf",
  fontStyle: "normal",
  fontWeight: 400,
});

// Page size: 4" x 6" (101.6mm x 152.4mm)
// In points: 288pt x 432pt (1 inch = 72 points)
const PAGE_WIDTH = 288;
const PAGE_HEIGHT = 432;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "BengaliFont",
    fontSize: 9,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    padding: 8,
  },
  // Header
  header: {
    textAlign: "left",
    borderBottom: "2pt solid #000000",
    paddingBottom: 4,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 8,
    fontWeight: "bold",
  },
  // Order Info
  orderInfo: {
    fontSize: 8,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderInfoLabel: {
    fontWeight: "bold",
    marginRight: 2,
  },
  // Address
  addressSection: {
    border: "1pt solid #000000",
    padding: 4,
    marginBottom: 4,
  },
  addressLabel: {
    fontWeight: "bold",
    fontSize: 10,
    borderBottom: "1pt solid #000000",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 1,
    lineHeight: 1.2,
  },
  // Products Table
  table: {
    width: "100%",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottom: "1pt solid #000000",
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
    padding: 3,
    borderTop: "1pt solid #000000",
    borderRight: "1pt solid #000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000000",
  },
  tableCell: {
    fontSize: 8,
    padding: 3,
    borderRight: "1pt solid #000000",
  },
  productNameCell: {
    flex: 1,
  },
  quantityCell: {
    width: 35,
    textAlign: "center",
  },
  // COD Amount
  codSection: {
    marginTop: 4,
    padding: 6,
    border: "2pt dashed #000000",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    gap: 2,
  },
  codLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  codAmount: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  // QR Code Section
  codesSection: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 0,
    gap: 2,
  },
  qrCodePlaceholder: {
    width: 80,
    height: 80,
  },
  barcodePlaceholder: {
    flex: 1,
    marginLeft: 8,
  },
  barcodeText: {
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  // Notes
  notesBox: {
    flex: 1,
    width: "100%",
    height: 80,
    marginLeft: 2,
    border: "1pt dotted #000000",
    padding: 6,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 3, // Reduced spacing
    borderBottom: "0.5pt solid #000000",
    paddingBottom: 2,
    width: "100%",
  },
  notesText: {
    fontSize: 9,
    fontWeight: "normal",
    textAlign: "left", // Ensure left alignment
  },
});

// Helper function to detect Bengali text
const isBengaliText = (text: string): boolean => {
  const bengaliRegex = /[\u0980-\u09FF]/;
  return bengaliRegex.test(text);
};

// Helper function to fetch and convert image to base64
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      return url;
    }

    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

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

// Helper function to generate QR code as data URL
const generateQRCodeDataUrl = async (data: string): Promise<string> => {
  const QRCode = require("qrcode");
  return await QRCode.toDataURL(data, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });
};

interface PackingSlipDocumentProps {
  order: IOrder;
  qrCodeImage?: string;
}

const PackingSlipDocument: React.FC<PackingSlipDocumentProps> = ({
  order,
  qrCodeImage,
}) => {
  const orderDate = new Date(order.timestamps.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const total = order.totalPrice + order.deliveryCharge - (order.discount || 0);
  const due = order.remaining;

  // Format product name with variant
  const formatProduct = (product: any) => {
    let name: string = product.name;

    if (product.variation) {
      const parts = [];
      if (product.variation.color) parts.push(product.variation.color);
      if (product.variation.size) parts.push(product.variation.size);

      if (parts.length > 0) {
        name += ` (${parts.join(" / ")})`;
      }
    }

    return name.toUpperCase();
  };

  return (
    <Document>
      <Page
        size={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
        style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Order #{order.orderNumber}</Text>
          <Text style={styles.subtitle}>PriorBD • +8801700534317</Text>
        </View>

        {/* Order Info */}
        <View style={styles.orderInfo}>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 2,
            }}>
            <Text style={styles.orderInfoLabel}>Invoice No:</Text>
            <Text>INV-{order.orderNumber}</Text>
          </View>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 2,
            }}>
            <Text style={styles.orderInfoLabel}>Order Date:</Text>
            <Text>{orderDate}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Ship To:</Text>
          <Text style={styles.addressText}>{order.customer?.name}</Text>
          <Text style={styles.addressText}>
            {order.shipping?.address}, {order.shipping?.district}
          </Text>
          <Text style={styles.addressText}>{order.shipping?.division}</Text>
          <Text style={styles.addressText}>{order.customer?.phoneNumber}</Text>
        </View>

        {/* Products Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.productNameCell,
                { borderLeft: "1pt solid #000000" },
              ]}>
              Item
            </Text>
            <Text style={[styles.tableHeaderCell, styles.quantityCell]}>
              Qty
            </Text>
          </View>
          {order.products.map((product, index) => (
            <View key={index} style={styles.tableRow}>
              <Text
                style={[
                  styles.tableCell,
                  styles.productNameCell,
                  { borderLeft: "1pt solid #000000" },
                ]}>
                {formatProduct(product)}
              </Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>
                {product.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* COD Amount */}
        <View style={styles.codSection}>
          <Text style={styles.codLabel}>AMOUNT TO PAY (COD):</Text>
          <Text style={styles.codAmount}>
            {due > 0 ? due.toFixed(0) : "0"} ৳
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.codesSection}>
          {qrCodeImage && (
            <PDFImage style={styles.qrCodePlaceholder} src={qrCodeImage} />
          )}
          {/* Special Notes */}
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>SPECIAL INSTRUCTIONS</Text>
              <Text style={styles.notesText}>{order.notes.trim()}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// Preload images and generate QR code
const preloadPackingSlipImages = async (order: IOrder) => {
  // Generate QR code
  const qrData = JSON.stringify({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: order.customer?.name,
    phone: order.customer?.phoneNumber,
    address: order.shipping?.address,
    district: order.shipping?.district,
    division: order.shipping?.division,
    due: order.remaining,
    trackingUrl: `https://priorbd.com/order/${order.orderNumber}`,
  });

  const QRCode = require("qrcode");
  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return { qrCodeBase64 };
};

// Export functions
export const generateReactPdfPackingSlip = async (order: IOrder) => {
  // Preload images and generate QR code
  const { qrCodeBase64 } = await preloadPackingSlipImages(order);

  const blob = await pdf(
    <PackingSlipDocument order={order} qrCodeImage={qrCodeBase64} />,
  ).toBlob();

  // Cleanup
  setTimeout(() => {
    if (qrCodeBase64.startsWith("blob:")) {
      URL.revokeObjectURL(qrCodeBase64);
    }
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
  // Preload images and generate QR code
  const { qrCodeBase64 } = await preloadPackingSlipImages(order);

  const blob = await pdf(
    <PackingSlipDocument order={order} qrCodeImage={qrCodeBase64} />,
  ).toBlob();

  // Cleanup after delay
  setTimeout(() => {
    if (qrCodeBase64.startsWith("blob:")) {
      URL.revokeObjectURL(qrCodeBase64);
    }
  }, 5000);

  return blob;
};

export default PackingSlipDocument;
