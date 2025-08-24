import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IOrder } from "../pages/order/interface";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axiosInstance from "../api/axios";
import config from "./config";
import { generateReactPdfInvoice, generateReactPdfInvoiceBlob } from "./reactPdfInvoice";

const removeBanglaAndBrackets = (input: string): string => {
  // Define the Unicode range for Bangla characters (U+0980 to U+09FF)
  const banglaAndBracketsRegex = /[\u0980-\u09FF()]/g;

  // Replace all Bangla characters and brackets with an empty string
  return input.replace(banglaAndBracketsRegex, "");
};

export const generatePurchageOrder = (order: IOrder) => {
  const doc = new jsPDF();
  doc.setTextColor(0, 0, 0); // Set text color to black for better printing

  // Sample data
  const purchaseOrder = {
    orderNumber: order?.orderNumber,
    trackingId: order?.id,
    customerInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address},${removeBanglaAndBrackets(
        order?.shipping?.district
      )},${removeBanglaAndBrackets(order?.shipping?.division)}`,
      mobile: order?.customer?.phoneNumber,
    },
    orderStatus: "Drop_to_transport",
    shippingInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address},${removeBanglaAndBrackets(
        order?.shipping?.district
      )},${removeBanglaAndBrackets(order?.shipping?.division)}`,
      mobile: order?.customer?.phoneNumber,
    },
    companyInfo: {
      name: "Prior",
      address:
        "Dhaka, Dhanmondi 27, Genetic Plaza, \nShop no : 134 \nMobile: +8801700534317 \nEmail: prior.retailshop.info.bd@gmail.com",
    },
    products: [...order?.products],
  };

  // Set the maximum width for the text before it wraps
  const maxTextWidth = doc.internal.pageSize.width / 2; // Half of the A4 page width
  const wrappedAddress = (text: string) =>
    doc.splitTextToSize(text, maxTextWidth);

  // Add an image
  const imageURL =
    "https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png";
  doc.addImage(imageURL, "JPEG", 10, 5, 100, 32);

  // Split the text into multiple lines if it exceeds the maximum width

  // Add the text to the PDF at the specified coordinates, with wrapping applied

  // Customer Information
  doc.setFontSize(16); // Increased font size for title
  doc.setFont("roboto", "bold");
  doc.text(`Customer Information:`, 15, 40);
  doc.setFontSize(12); // Slightly larger font for better printing
  doc.setFont("roboto", "bold");
  doc.text(`Name: ${purchaseOrder.customerInfo.name}`, 15, 45);
  doc.text(
    wrappedAddress(`Address: ${purchaseOrder.companyInfo.address}`),
    15,
    50
  );
  doc.text(`Mobile Number: ${purchaseOrder.customerInfo.mobile}`, 15, 55);

  // Shipping Information
  doc.setFontSize(16);
  doc.setFont("roboto", "bold");
  doc.text(`Delivery Information:`, 15, 65);
  doc.setFontSize(12);
  doc.setFont("roboto", "bold");
  doc.text(`Name: ${purchaseOrder.shippingInfo.name}`, 15, 70);
  doc.text(
    wrappedAddress(`Address: ${purchaseOrder.shippingInfo.address}`),
    15,
    75
  );
  doc.text(`Mobile: ${purchaseOrder.shippingInfo.mobile}`, 15, 80);

  // Company Information
  doc.setFontSize(16);
  doc.setFont("roboto", "bold");
  doc.text(`Company Information:`, 120, 40);
  doc.setFontSize(12);
  doc.setFont("roboto", "bold");
  doc.text(`Name: ${purchaseOrder.companyInfo.name}`, 120, 45);
  doc.text(
    wrappedAddress(`Address: ${purchaseOrder.companyInfo.address}`),
    120,
    50
  );

  // Order Details
  doc.setFontSize(17); // Title font size
  doc.text("Purchase Order", 15, 90);
  doc.setFontSize(14); // Slightly larger font for order information
  doc.text(`Order Number: ${purchaseOrder.orderNumber}`, 15, 100);
  doc.text(`Tracking ID: ${purchaseOrder.trackingId}`, 15, 110);

  // Product Table
  const columns = [
    "SL NO.",
    "Product Name",
    "Variant",
    "Quantity",
    "Price",
    "Discount",
    "Total(৳)",
  ];
  const data = purchaseOrder.products.map((product, index) => [
    index + 1,
    product.name,
    `${product.variation?.color}${
      !!product.variation?.color && !!product.variation?.size ? " - " : ""
    }${product.variation?.size}`,
    product.quantity,
    `${product.unitPrice.toFixed(2)}`,
    `${!!product.discount ? product.discount.toFixed(2) : "0.00"}`,
    `${(
      product.quantity * product.unitPrice -
      (!!product.discount ? product.discount : 0)
    ).toFixed(2)}`,
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

const generateInvoiceBlob = (order: IOrder) => {
  const doc = new jsPDF();

  // Add support for Bengali text rendering
  const detectBengaliText = (text: string): boolean => {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text);
  };

  // For jsPDF Bengali support, we need to ensure proper font handling
  // Let's try a different approach using a more compatible method
  const renderBengaliText = (text: string, x: number, y: number, options?: any) => {
    if (detectBengaliText(text)) {
      // For Bengali text, we'll need to use a different rendering approach
      // Split mixed text into Bengali and English parts
      const parts = text.split(/(\s+)/); // Split by whitespace but keep separators
      let currentX = x;
      
      parts.forEach((part) => {
        if (part.trim()) {
          if (detectBengaliText(part)) {
            // Use a font that supports Bengali characters better
            doc.setFont("times", "normal");
            doc.text(part, currentX, y, options);
          } else {
            // Use regular font for English text
            doc.setFont("helvetica", "normal");
            doc.text(part, currentX, y, options);
          }
          currentX += doc.getTextWidth(part);
        } else {
          currentX += doc.getTextWidth(part);
        }
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(text, x, y, options);
    }
  };

  const setFont = (text?: string) => {
    if (text && detectBengaliText(text)) {
      // Use Times font which has better Unicode support
      try {
        doc.setFont("times", "normal");
      } catch (e) {
        doc.setFont("helvetica", "normal");
      }
    } else {
      doc.setFont("helvetica", "normal");
    }
  };

  const setBoldFont = (text?: string) => {
    if (text && detectBengaliText(text)) {
      try {
        doc.setFont("times", "bold");
      } catch (e) {
        doc.setFont("helvetica", "bold");
      }
    } else {
      doc.setFont("helvetica", "bold");
    }
  };

  // Modern color palette
  const colors = {
    primary: [41, 128, 185] as [number, number, number], // Professional blue
    secondary: [52, 73, 94] as [number, number, number], // Dark slate
    accent: [231, 76, 60] as [number, number, number], // Modern red
    success: [46, 204, 113] as [number, number, number], // Green
    text: [0, 0, 0] as [number, number, number], // Dark gray
    lightGray: [236, 240, 241] as [number, number, number], // Light background
    white: [255, 255, 255] as [number, number, number],
  };

  // Sample data setup - Keep Bengali text intact
  const purchaseOrder = {
    orderNumber: order?.orderNumber,
    trackingId: order?.id,
    customerInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address}, ${order?.shipping?.district}, ${order?.shipping?.division}`,
      mobile: order?.customer?.phoneNumber,
    },
    orderStatus: "Drop_to_transport",
    shippingInfo: {
      name: `${order?.customer?.name}`,
      address: `${order?.shipping?.address}, ${order?.shipping?.district}, ${order?.shipping?.division}`,
      mobile: order?.customer?.phoneNumber,
    },
    companyInfo: {
      name: "Prior",
      address:
        "Dhaka, Dhanmondi 27, Genetic Plaza, \nShop no : 134 \nMobile: +8801700534317 \nEmail: prior.retailshop.info.bd@gmail.com",
    },
    products: [...order?.products],
  };

  // Header background with modern styling
  doc.setFillColor(...colors.lightGray);
  doc.rect(0, 0, 210, 45, "F");

  // Add company logo with better positioning
  const imageURL =
    "https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png";
  doc.addImage(imageURL, "PNG", -10, 8, 100, 30);

  // // Company name and branding
  // doc.setTextColor(...colors.white);
  // doc.setFontSize(20);
  // doc.setFont("helvetica", "bold");
  // doc.text("PRIOR", 50, 20);
  // doc.setFontSize(10);
  // doc.setFont("helvetica", "bold");
  // doc.text("Retail Solutions", 50, 28);

  // Invoice title and details - right aligned
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 210 - 15, 20, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const invoiceNumber = `#${purchaseOrder.trackingId
    .toString()
    .slice(
      purchaseOrder.trackingId.toString()?.length - 4,
      purchaseOrder.trackingId.toString().length
    )}`;
  doc.text(invoiceNumber, 210 - 15, 30, { align: "right" });

  const orderDate = new Date(order.timestamps.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
  doc.text(`Date: ${orderDate}`, 210 - 15, 37, { align: "right" });

  // Add separator line
  doc.setDrawColor(...colors.lightGray);
  doc.setLineWidth(0.5);
  doc.line(15, 50, 195, 50);

  // Customer Information Section
  doc.setFillColor(...colors.lightGray);
  doc.rect(15, 55, 85, 8, "F");
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILLING INFORMATION", 17, 60);

  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  
  // Use renderBengaliText for customer name and mobile
  setBoldFont(purchaseOrder.customerInfo.name);
  renderBengaliText(purchaseOrder.customerInfo.name, 17, 70);
  
  setBoldFont(purchaseOrder.customerInfo.mobile);
  renderBengaliText(purchaseOrder.customerInfo.mobile, 17, 76);

  let yPosition = 82;
  const cbaddressLines = doc.splitTextToSize(
    purchaseOrder.customerInfo.address,
    80
  );
  cbaddressLines.forEach((line: string) => {
    setFont(line);
    renderBengaliText(line, 17, yPosition);
    yPosition += 4;
  });

  // Payment method
  const paymentMethod =
    order?.payment && order.payment.length > 0
      ? order.payment[0].paymentType
      : "Cash On Delivery";
  doc.setFont("helvetica", "bold");
  doc.text(`Payment: `, 17, yPosition + 6);
  doc.setFont("helvetica", "normal");
  doc.text(paymentMethod, 40, yPosition + 6);

  // Notes section if present
  let notesYPosition = yPosition + 15;
  if (order?.notes) {
    doc.setFillColor(...colors.accent);
    doc.rect(15, notesYPosition - 3, 180, 5, "F");
    doc.setTextColor(...colors.white);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("SPECIAL NOTES", 17, notesYPosition);

    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    const csNoteLines = doc.splitTextToSize(order.notes, 175);
    csNoteLines.forEach((line: string) => {
      notesYPosition += 5;
      doc.text(line, 17, notesYPosition);
    });
    notesYPosition += 10;
  }

  // Shipping Information Section
  doc.setFillColor(...colors.lightGray);
  doc.rect(110, 55, 85, 8, "F");
  doc.setTextColor(...colors.secondary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SHIPPING INFORMATION", 112, 60);

  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${purchaseOrder.shippingInfo.name}`, 112, 70);
  doc.text(`${purchaseOrder.shippingInfo.mobile}`, 112, 76);

  let y2Position = 82;
  const csaddressLines = doc.splitTextToSize(
    purchaseOrder.shippingInfo.address,
    80
  );
  csaddressLines.forEach((line: string) => {
    doc.text(line, 112, y2Position);
    y2Position += 4;
  });

  // Order details section
  const orderDetailsY = Math.max(notesYPosition, y2Position + 10);
  doc.setFillColor(...colors.primary);
  doc.rect(15, orderDetailsY, 180, 6, "F");
  doc.setTextColor(...colors.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER DETAILS", 17, orderDetailsY + 4);

  doc.setTextColor(...colors.text);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Order ID: ${purchaseOrder.orderNumber}`, 17, orderDetailsY + 12);
  doc.text(`Tracking ID: ${purchaseOrder.trackingId}`, 17, orderDetailsY + 18);

  yPosition = orderDetailsY + 25;

  // Table header and product list table
  const columns = [
    "SL NO.",
    "Description",
    "Variant",
    "Qty",
    "Price",
    "Discount",
    "Total",
  ];
  const data = purchaseOrder.products.map((product, index) => {
    const increasedUnitPrice = product.unitPrice;
    const totalPerProduct =
      product.quantity * increasedUnitPrice - (product.discount || 0);
    return [
      index + 1,
      product.name,
      !product?.variation
        ? "N/A"
        : `${product.variation?.color}${
            product.variation?.size ? ` - ${product.variation.size}` : ""
          }`,
      product.quantity,
      increasedUnitPrice.toFixed(2),
      (product.discount || 0).toFixed(2),
      totalPerProduct.toFixed(2),
    ];
  });

  // Summary rows
  const summaryRows = [
    [
      { colSpan: 5, content: "" },
      { content: "Total" },
      { content: `${order.totalPrice.toFixed(2)}` },
    ],
    [
      { colSpan: 5, content: "" },
      { content: "Discount (-)" },
      { content: `${(order.discount || 0).toFixed(2)}` },
    ],
    [
      { colSpan: 5, content: "" },
      { content: "Paid (-)" },
      { content: `${order.paid}` },
    ],
    [
      { colSpan: 5, content: "" },
      { content: "Shipping Cost (+)" },
      { content: `${order.deliveryCharge}` },
    ],
    [
      { colSpan: 5, content: "" },
      { content: "Subtotal (BDT)" },
      {
        content: `${(
          order.totalPrice +
          order.deliveryCharge -
          (order.discount || 0)
        ).toFixed(2)}`,
      },
    ],
    [
      { colSpan: 5, content: "" },
      { content: "Due (BDT)" },
      { content: `${order.remaining.toFixed(2)}` },
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [columns],
    body: [...data, ...summaryRows],
    theme: "striped",
    styles: {
      halign: "center",
      overflow: "linebreak",
      textColor: colors.text,
      fontSize: 9,
      cellPadding: 3,
      lineColor: colors.lightGray,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: colors.secondary,
      textColor: colors.white,
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },
    bodyStyles: {
      textColor: colors.text,
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249] as [number, number, number],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 }, // SL NO
      1: { halign: "left", cellWidth: 40 }, // Description
      2: { halign: "center", cellWidth: 25 }, // Variant
      3: { halign: "center", cellWidth: 15 }, // Qty
      4: { halign: "right", cellWidth: 20 }, // Price
      5: { halign: "right", cellWidth: 35 }, // Discount
      6: { halign: "right", cellWidth: 25 }, // Total
    },
    margin: { left: 15, right: 15 },
  });

  // Modern footer design
  const totalPages = doc.internal.pages.length - 1;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = doc.internal.pageSize.height - 25;

    // Footer background
    doc.setFillColor(...colors.secondary);
    doc.rect(0, footerY - 5, 210, 25, "F");

    // Company contact section
    doc.setTextColor(...colors.white);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRIOR RETAIL SOLUTIONS", 15, footerY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Shop 134, Genetic Plaza, Dhanmondi-27, Dhaka", 15, footerY + 5);
    doc.text("Phone: +8801700534317", 15, footerY + 10);
    doc.text("Email: prior.retailshop.info.bd@gmail.com", 15, footerY + 15);

    // Website and social
    doc.text("www.priorbd.com", 150, footerY + 5);

    // Thank you message
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your shopping!", 150, footerY + 10);

    // Page numbers with modern styling
    // doc.setFillColor(...colors.primary);
    // doc.rect(185, footerY + 12, 20, 6, "F");
    doc.setTextColor(...colors.white);
    doc.setFont("helvetica", "bold");
    doc.text(`${i}/${totalPages}`, 195, footerY + 16, { align: "center" });
  }
  return doc;
};

export const generateInvoice = (order: IOrder) => {
  const doc = generateInvoiceBlob(order);
  // Save the PDF
  doc.save(`invoice-${order.orderNumber}.pdf`);
};

// New React PDF invoice with Bengali support
export const generateModernInvoice = async (order: IOrder) => {
  await generateReactPdfInvoice(order);
};

const generateInvoiceBlobPromise = (order: IOrder): Promise<Blob> => {
  return new Promise((resolve) => {
    const doc = generateInvoiceBlob(order);
    const pdfBlob = doc.output("blob");
    resolve(pdfBlob);
  });
};

const getOrdersById = async (ids: number[]) => {
  try {
    const response = await axiosInstance.get(
      config.order.getMultiOrderByIds(),
      {
        params: {
          ids: ids.join(","),
        },
      }
    );

    if (response?.status < 300) {
      return [...response?.data?.data];
    }
  } catch (exception) {
    console.error("orders fetching error:", exception);
    return [];
  }
};

export const generateMultipleInvoicesAndDownloadZip = async (
  orderIds: number[]
) => {
  const zip = new JSZip();
  const orders = (await getOrdersById(orderIds)) ?? [];
  for (const order of orders) {
    const pdfBlob = await generateInvoiceBlobPromise(order);
    zip.file(`invoice-${order.orderNumber}.pdf`, pdfBlob); // Add each PDF to the ZIP
  }

  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Trigger download
  saveAs(zipBlob, "invoices.zip");
};

// New function for multiple modern invoices with Bengali support
export const generateMultipleModernInvoicesAndDownloadZip = async (
  orderIds: number[]
) => {
  const zip = new JSZip();
  const orders = (await getOrdersById(orderIds)) ?? [];
  for (const order of orders) {
    const pdfBlob = await generateReactPdfInvoiceBlob(order);
    zip.file(`modern-invoice-${order.orderNumber}.pdf`, pdfBlob);
  }

  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Trigger download
  saveAs(zipBlob, "modern-invoices.zip");
};
