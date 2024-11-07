import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IOrder } from "../pages/order/interface";



const removeBanglaAndBrackets=(input: string): string=> {
  // Define the Unicode range for Bangla characters (U+0980 to U+09FF)
  const banglaAndBracketsRegex = /[\u0980-\u09FF()]/g;
  
  // Replace all Bangla characters and brackets with an empty string
  return input.replace(banglaAndBracketsRegex, '');
}

export const generatePurchageOrder = (order: IOrder) => {
  const doc = new jsPDF();
  doc.setTextColor(0, 0, 0); // Set text color to black for better printing

  // Sample data
  const purchaseOrder = {
    orderNumber: order?.orderNumber,
    trackingId: order?.id,
    customerInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address},${removeBanglaAndBrackets(order?.shipping?.district)},${removeBanglaAndBrackets(order?.shipping?.division)}`,
      mobile: order?.customer?.phoneNumber,
    },
    orderStatus: "Drop_to_transport",
    shippingInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address},${removeBanglaAndBrackets(order?.shipping?.district)},${removeBanglaAndBrackets(order?.shipping?.division)}`,
      mobile: order?.customer?.phoneNumber,
    },
    companyInfo: {
      name: "Prior",
      address: "Dhaka, Dhanmondi 27, Genetic Plaza, \nShop no : 134 \nMobile: +8801700534317 \nEmail: prior.retailshop.info.bd@gmail.com",
    },
    products: [...order?.products],
  };


  // Set the maximum width for the text before it wraps
const maxTextWidth = doc.internal.pageSize.width / 2; // Half of the A4 page width
const wrappedAddress =(text:string)=> doc.splitTextToSize(
  text,
  maxTextWidth
);

  // Add an image
  const imageURL =
    "https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png";
  doc.addImage(imageURL, "JPEG", 10, 5, 32, 32);


  // Split the text into multiple lines if it exceeds the maximum width


// Add the text to the PDF at the specified coordinates, with wrapping applied

  // Customer Information
  doc.setFontSize(16); // Increased font size for title
  doc.setFont("roboto", "bold");
  doc.text(`Customer Information:`, 15, 40);
  doc.setFontSize(12); // Slightly larger font for better printing
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.customerInfo.name}`, 15, 45);
  doc.text(wrappedAddress(`Address: ${purchaseOrder.companyInfo.address}`), 15, 50);
  doc.text(`Mobile Number: ${purchaseOrder.customerInfo.mobile}`, 15, 55);

  // Shipping Information
  doc.setFontSize(16);
  doc.setFont("roboto", "bold");
  doc.text(`Delivery Information:`, 15, 65);
  doc.setFontSize(12);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.shippingInfo.name}`, 15, 70);
  doc.text(wrappedAddress(`Address: ${purchaseOrder.shippingInfo.address}`), 15, 75);
  doc.text(`Mobile: ${purchaseOrder.shippingInfo.mobile}`, 15, 80);

  // Company Information
  doc.setFontSize(16);
  doc.setFont("roboto", "bold");
  doc.text(`Company Information:`, 120, 40);
  doc.setFontSize(12);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.companyInfo.name}`, 120, 45);
  doc.text(wrappedAddress(`Address: ${purchaseOrder.companyInfo.address}`), 120, 50);

  // Order Details
  doc.setFontSize(17); // Title font size
  doc.text("Purchase Order", 15, 90);
  doc.setFontSize(14); // Slightly larger font for order information
  doc.text(`Order Number: ${purchaseOrder.orderNumber}`, 15, 100);
  doc.text(`Tracking ID: ${purchaseOrder.trackingId}`, 15, 110);

  // Product Table
  const columns = ["SL NO.", "Product Name", "Variant", "Quantity", "Price", "Discount", "Total(৳)"];
  const data = purchaseOrder.products.map((product, index) => [
    index + 1,
    product.name,
    `${product.variation?.color}${!!product.variation?.color && !!product.variation?.size ? ' - ' : ''}${product.variation?.size}`,
    product.quantity,
    `${product.unitPrice.toFixed(2)}`,
    `${!!product.discount ? product.discount.toFixed(2) : "0.00"}`,
    `${(product.quantity * product.unitPrice - (!!product.discount ? product.discount : 0)).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 140,
    head: [columns],
    body: data,
    theme: "striped",
    styles: { halign: "left", fontSize: 10 }, // Slightly larger font size
  });

  // Footer Text
  const copyrightText = 
    "© +8801700534317 prior.retailshop.info.bd@gmail.com http://www.priorbd.com Shop 134, Genetic Plaza, Dhanmondi-27, Dhaka";
  const totalPages = doc.internal.pages?.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Set footer text color to black
    doc.text(copyrightText, 35, doc.internal.pageSize.height - 20);
    doc.text(`${i}/${totalPages}`, 190, doc.internal.pageSize.height - 10);
  }

  // Save the PDF
  doc.save(`PurchaseOrder-${order?.orderNumber}.pdf`);
};

export const generateInvoice = (order: IOrder) => {
  const doc = new jsPDF();


  // Sample data setup
  const purchaseOrder = {
    orderNumber: order?.orderNumber,
    trackingId: order?.id,
    customerInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address}, ${removeBanglaAndBrackets(order?.shipping?.district)}, ${removeBanglaAndBrackets(order?.shipping?.division)}`,
      mobile: order?.customer?.phoneNumber,
    },
    orderStatus: "Drop_to_transport",
    shippingInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address},${removeBanglaAndBrackets(order?.shipping?.district)},${removeBanglaAndBrackets(order?.shipping?.division)}`,
      mobile: order?.customer?.phoneNumber,
    },
    companyInfo: {
      name: "Prior",
      address: "Dhaka, Dhanmondi 27, Genetic Plaza, \nShop no : 134 \nMobile: +8801700534317 \nEmail: prior.retailshop.info.bd@gmail.com",
    },
    products: [...order?.products],
  };

  // Add company logo
  const imageURL = "https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png";
  doc.addImage(imageURL, "PNG", -10, 5, 100, 32);

  // Set text color for headers
  doc.setTextColor(0, 0, 128); // Dark blue for headers
  doc.setFontSize(17);
  doc.setFont("roboto", "bold");
  doc.text(`Invoice #${purchaseOrder.trackingId.toString().slice(purchaseOrder.trackingId.toString()?.length-4,purchaseOrder.trackingId.toString().length)}`, 120, 20);
  doc.setFontSize(10);
  doc.text(`Order Date: ${new Date(order.timestamps.createdAt).toLocaleDateString()}`, 120, 30);
  doc.text(`Order ID: ${purchaseOrder.orderNumber}`, 120, 36);
  doc.text(`Tracking ID: ${purchaseOrder.trackingId}`, 120, 42);

  // Customer Information
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 0); // Dark green for titles
  doc.text(`Billing Information:`, 15, 60);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Gray for details
  doc.text(`Name: ${purchaseOrder.customerInfo.name}`, 15, 65);
  doc.text(`Mobile Number: ${purchaseOrder.customerInfo.mobile}`, 15, 70);

  let yPosition = 75;
  const cbaddressLines = doc.splitTextToSize(purchaseOrder.customerInfo.address, 50);
  cbaddressLines.forEach((line: string, index: number) => {
    doc.text(`${index === 0 ? 'Address: ' : ''}${line}`, 15, yPosition);
    yPosition += 5;
  });

  doc.text(`Payment Method: ${order?.payment && order.payment.length > 0 ? order.payment[0].paymentType : 'Cash On Delivery'}`, 15, yPosition+10);

  // Shipping Information
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 0); // Dark green for titles
  doc.text(`Shipping Information:`, 120, 60);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Gray for details
  doc.text(`Name: ${purchaseOrder.shippingInfo.name}`, 120, 65);
  doc.text(`Mobile: ${purchaseOrder.shippingInfo.mobile}`, 120, 70);

  let y2Position = 75;
  const csaddressLines = doc.splitTextToSize(purchaseOrder.shippingInfo.address, 50);
  csaddressLines.forEach((line: string, index: number) => {
    doc.text(`${index === 0 ? 'Address: ' : ''}${line}`, 120, y2Position);
    y2Position += 5;
  });

  // Table header and product list table
  const columns = ["SL NO.", "Description", "Variant", "Qty", "Price", "Discount", "Total"];
  const data = purchaseOrder.products.map((product, index) => {
    const increasedUnitPrice = product.unitPrice;
    const totalPerProduct = product.quantity * increasedUnitPrice - (product.discount || 0);
    return [
      index + 1,
      product.name,
      `${product.variation?.color}${product.variation?.size ? ` - ${product.variation.size}` : ''}`,
      product.quantity,
      increasedUnitPrice.toFixed(2),
      (product.discount || 0).toFixed(2),
      totalPerProduct.toFixed(2),
    ];
  });

  // Summary rows
  const summaryRows = [
    [{ colSpan: 5, content: "" }, { content: "Total" }, { content: `${order.totalPrice.toFixed(2)}` }],
    [{ colSpan: 5, content: "" }, { content: "Discount (-)" }, { content: `${(order.discount || 0).toFixed(2)}` }],
    [{ colSpan: 5, content: "" }, { content: "Paid (-)" }, { content: `${order.paid}` }],
    [{ colSpan: 5, content: "" }, { content: "Shipping Cost (+)" }, { content: `${order.deliveryCharge}` }],
    [{ colSpan: 5, content: "" }, { content: "Subtotal (BDT)" }, { content: `${((order.totalPrice + order.deliveryCharge) - (order.discount || 0)).toFixed(2)}` }],
    [{ colSpan: 5, content: "" }, { content: "Due (BDT)" }, { content: `${order.remaining.toFixed(2)}` }],
  ];

  autoTable(doc, {
    startY: yPosition+15,
    head: [columns],
    body: [...data, ...summaryRows],
    theme: "grid",
    styles: { halign: "left", overflow: "linebreak", textColor: [0, 0, 0] }, // Text color for table
     headStyles: {
    fillColor: [0, 0, 0], // Black background color for the header
    textColor: [255, 255, 255], // White text color for the header
    fontStyle: "bold",
  },
  });

  // Footer with copyright
  const copyrightText = "© +8801700534317 prior.retailshop.info.bd@gmail.com http://www.priorbd.com\nShop 134, Genetic Plaza, Dhanmondi-27, Dhaka";
const totalPages = doc.internal.pages.length - 1;

for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFontSize(10);
  
  // Set line color and width for the footer separator line
  doc.setDrawColor(0); // Black line
  doc.setLineWidth(0.2);
  doc.line(10, doc.internal.pageSize.height - 17, 200, doc.internal.pageSize.height - 17);
  
  // Set footer text color
  doc.setTextColor(0, 0, 0); // Light gray for footer text
  
  // Split the text for line breaks and wrap it for width, then calculate centered positions
  const maxTextWidth = 180; // Adjust width as needed
  const lines = doc.splitTextToSize(copyrightText, maxTextWidth);
  const startY = doc.internal.pageSize.height - 12; // Adjust starting Y position

  // Center each line of text
  lines.forEach((line:string, index:number) => {
    const textWidth = doc.getTextWidth(line);
    const centerX = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(line, centerX, startY + index * 5); // Adjust line height with `index * 5`
  });

  // Add page numbers aligned to the right
  doc.text(`${i}/${totalPages}`, 190, doc.internal.pageSize.height - 10);
}

  // Save the PDF
  doc.save(`invoice-${order.orderNumber}.pdf`);
};
