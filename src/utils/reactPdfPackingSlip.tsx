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
import { BRAND_CONFIG } from "../config/brand";

// Register Bengali font
Font.register({
  family: "BengaliFont",
  src: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf",
  fontStyle: "normal",
  fontWeight: 400,
});

// Page size: 75mm x 100mm thermal printer
// In points: 213pt x 283pt (1 inch = 72 points, 1mm = 2.83 points)
const PAGE_WIDTH = 213;
const PAGE_HEIGHT = 283;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "BengaliFont",
    fontSize: 8,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    padding: 6,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1pt solid #000000",
    paddingBottom: 3,
    marginBottom: 3,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    textAlign: "right",
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 8,
    fontWeight: "bold",
  },
  // Order Info
  orderInfo: {
    fontSize: 8,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderInfoLabel: {
    fontWeight: "bold",
    marginRight: 2,
  },
  // Address
  addressSection: {
    marginBottom: 3,
  },
  addressText: {
    fontSize: 9,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  addressName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 10,
    fontWeight: "bold",
  },
  // Product Badge Grid
  productsSection: {
    marginBottom: 3,
    width: "100%",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "flex-start",
  },
  productBadge: {
    width: 60,
    border: "1pt solid #000000",
    borderRadius: 2,
    padding: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  productName: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
    lineHeight: 1.1,
  },
  badgeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  variant: {
    fontSize: 7,
    flex: 1,
  },
  qtyBadge: {
    backgroundColor: "#000000",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  qtyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // Single column layout for 1-2 products
  singleProductBadge: {
    width: "100%",
    border: "1pt solid #000000",
    borderRadius: 2,
    padding: 4,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  singleProductName: {
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
    marginRight: 4,
  },
  singleProductQty: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  // COD Amount
  codSection: {
    padding: 3,
    border: "2pt dashed #000000",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 3,
  },
  codLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginRight: 4,
  },
  codAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // Bottom Section (QR + Notes)
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: "auto",
  },
  qrCodePlaceholder: {
    width: 55,
    height: 55,
  },
  // Notes
  notesBox: {
    flex: 1,
    marginRight: 4,
    border: "1pt dotted #000000",
    padding: 4,
    maxHeight: 50,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
    borderBottom: "0.5pt solid #000000",
    paddingBottom: 1,
  },
  notesText: {
    fontSize: 7,
    lineHeight: 1.2,
  },
});

// // Helper function to detect Bengali text
// const isBengaliText = (text: string): boolean => {
//   const bengaliRegex = /[\u0980-\u09FF]/;
//   return bengaliRegex.test(text);
// };

// // Helper function to fetch and convert image to base64
// const fetchImageAsBase64 = async (url: string): Promise<string> => {
//   try {
//     const response = await fetch(url, {
//       mode: "cors",
//       credentials: "omit",
//     });

//     if (!response.ok) {
//       return url;
//     }

//     const blob = await response.blob();

//     return new Promise((resolve) => {
//       const reader = new FileReader();

//       reader.onload = () => {
//         const result = reader.result as string;

//         if (blob.type === "image/webp") {
//           const img = new Image();

//           img.onload = () => {
//             try {
//               const canvas = document.createElement("canvas");
//               canvas.width = img.width;
//               canvas.height = img.height;
//               const ctx = canvas.getContext("2d");

//               if (!ctx) {
//                 resolve(result);
//                 return;
//               }

//               ctx.drawImage(img, 0, 0);
//               const pngDataUrl = canvas.toDataURL("image/png");
//               resolve(pngDataUrl);
//             } catch {
//               resolve(result);
//             }
//           };

//           img.onerror = () => {
//             resolve(result);
//           };

//           img.src = result;
//         } else {
//           resolve(result);
//         }
//       };

//       reader.onerror = () => {
//         resolve(url);
//       };

//       reader.readAsDataURL(blob);
//     });
//   } catch {
//     return url;
//   }
// };

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

  const due = order.remaining;

  // Helper function to truncate text
  const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 2) + "..";
  };

  // Format variant info
  const formatVariant = (product: any): string => {
    if (!product.variation) return "";
    const parts = [];
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
            <Text style={styles.title}>Order #{order.orderNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>PriorBD</Text>
          </View>
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
            <Text style={styles.orderInfoLabel}>Invoice:</Text>
            <Text>INV-{order.orderNumber}</Text>
          </View>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 2,
            }}>
            <Text style={styles.orderInfoLabel}>Date:</Text>
            <Text>{orderDate}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressName}>{order.customer?.name}</Text>
          <Text style={styles.addressText}>
            {order.shipping?.address}, {order.shipping?.district},{" "}
            {order.shipping?.division}
          </Text>
          <Text style={styles.addressPhone}>{order.customer?.phoneNumber}</Text>
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          {order.products.length <= 2 ? (
            // Single column layout for 1-2 products
            order.products.map((product, index) => (
              <View key={index} style={styles.singleProductBadge}>
                <Text style={styles.singleProductName}>
                  {product.name.toUpperCase()}
                  {formatVariant(product) && (
                    <Text style={{ fontSize: 8, fontWeight: "normal" }}>
                      {" "}
                      {formatVariant(product)}
                    </Text>
                  )}
                </Text>
                <Text style={styles.singleProductQty}>x{product.quantity}</Text>
              </View>
            ))
          ) : (
            // Badge grid layout for 3+ products
            <View style={styles.productsGrid}>
              {order.products.map((product, index) => (
                <View key={index} style={styles.productBadge}>
                  <Text style={styles.productName}>
                    {truncate(product.name.toUpperCase(), 18)}
                  </Text>
                  <View style={styles.badgeFooter}>
                    <Text style={styles.variant}>{formatVariant(product)}</Text>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyText}>x{product.quantity}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* COD Amount */}
        <View style={styles.codSection}>
          <Text style={styles.codLabel}>AMOUNT TO PAY:</Text>
          <Text style={styles.codAmount}>
            {due > 0 ? due.toFixed(0) : "0"} ৳
          </Text>
        </View>

        {/* Bottom Section (QR + Notes) */}
        <View style={styles.bottomSection}>
          {/* Special Notes */}
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>SPECIAL INSTRUCTIONS</Text>
              <Text style={styles.notesText}>{order.notes.trim()}</Text>
            </View>
          )}
          {/* QR Code */}
          {qrCodeImage && (
            <PDFImage style={styles.qrCodePlaceholder} src={qrCodeImage} />
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
    trackingUrl: `${BRAND_CONFIG.website}/order/${order.orderNumber}`,
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

export const generatePackingSlipPdfByOrderIdentifier = async (
  orderIdentifier: string,
) => {
  // Fetch order details from API
  const response = await getOrderDetails(orderIdentifier);

  if (!response.success || !response.data) {
    throw new Error("Failed to fetch order details");
  }
  const order: IOrder = response.data;
  await generateReactPdfPackingSlip(order);
};

export default PackingSlipDocument;
