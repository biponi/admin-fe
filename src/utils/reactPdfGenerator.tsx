import {
  Document,
  Page,
  Text,
  StyleSheet,
  Font,
  Image,
  View,
  pdf,
} from "@react-pdf/renderer";
import { IOrder } from "../pages/order/interface";

// Register the custom font for Bangla support
Font.register({
  family: "Noto Sans Bengali",
  src: "https://app.priorbd.com/fonts/notosan.ttf", // Ensure URL is correct
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 12,
    padding: 30,
  },
  logo: {
    width: 150,
    marginBottom: 10,
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionColumn: {
    width: "48%",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableCell: {
    padding: 5,
  },
});

const generateReactPdfBlob = (order: IOrder) => {
  const purchaseOrder = {
    orderNumber: order?.orderNumber,
    trackingId: order?.id,
    customerInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address}`,
      mobile: order?.customer?.phoneNumber,
    },
    companyInfo: {
      name: "Prior",
      address: "Dhaka, Dhanmondi 27, Genetic Plaza, Shop no : 134",
      mobile: "+8801700534317",
      email: "prior.retailshop.info.bd@gmail.com",
    },
    products: [...order?.products],
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, marginBottom: "20px" }}>
          <View style={styles.sectionColumn}>
            <Image
              style={styles.logo}
              src="https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png"
            />
          </View>
          <View style={styles.sectionColumn}>
            <Text style={{ ...styles.header, fontWeight: "bold" }}>
              Invoice #
              {purchaseOrder.trackingId
                .toString()
                .slice(
                  purchaseOrder.trackingId.toString()?.length - 4,
                  purchaseOrder.trackingId.toString().length
                )}
            </Text>
            <Text>
              Order Date:{" "}
              {new Date(order.timestamps.createdAt).toLocaleDateString()}
            </Text>
            <Text>Order ID: {purchaseOrder.orderNumber}</Text>
            <Text>Tracking ID: {purchaseOrder.trackingId}</Text>
          </View>
        </View>

        <View style={{ ...styles.section, marginBottom: "20px" }}>
          <View style={styles.sectionColumn}>
            <Text style={styles.header}>Billing Information:</Text>
            <Text style={{ marginBottom: "5px" }}>
              Name: {purchaseOrder.customerInfo.name}
            </Text>
            <Text style={{ marginBottom: "5px" }}>
              Mobile: {purchaseOrder.customerInfo.mobile}
            </Text>
            <Text style={{ marginBottom: "5px" }}>
              Address: {purchaseOrder.customerInfo.address}
            </Text>
          </View>
          <View style={styles.sectionColumn}>
            <Text style={styles.header}>Shipping Information:</Text>
            <Text style={{ marginBottom: "5px" }}>
              Name: {purchaseOrder.customerInfo.name}
            </Text>
            <Text style={{ marginBottom: "5px" }}>
              Mobile: {purchaseOrder.customerInfo.mobile}
            </Text>
            <Text style={{ marginBottom: "5px" }}>
              Address: {purchaseOrder.customerInfo.address}
            </Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {[
              "SL NO.",
              "Description",
              "Variant",
              "Qty",
              "Price",
              "Discount",
              "Total",
            ].map((header) => (
              <View
                style={{
                  ...styles.tableCol,
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
              >
                <Text style={styles.tableCell}>{header}</Text>
              </View>
            ))}
          </View>
          {purchaseOrder.products.map((product, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product.name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {product.variation?.color}
                  {product.variation?.size
                    ? ` - ${product.variation.size}`
                    : ""}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {product.unitPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {(product.discount || 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {(
                    product.quantity * product.unitPrice -
                    (product.discount || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// To generate the PDF Blob from react-pdf
const generateInvoiceBlobByReact = async (order: IOrder) => {
  const pdfBlob = await pdf(generateReactPdfBlob(order)); // Correct method to generate the blob
  return pdfBlob;
};

export default generateInvoiceBlobByReact;
