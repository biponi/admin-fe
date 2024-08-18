import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IOrder } from "../pages/order/interface";

const calculateTotalPrice = (transaction: any) => {
  let totalPrice = 0;

  for (const product of transaction?.products) {
    // Assuming you have properties: unit_price, quantity, and discount
    const unitPrice = product?.unitPrice;
    const quantity = product?.quantity;
    const discount = 0;

    if (!isNaN(unitPrice) && !isNaN(quantity) && !isNaN(discount)) {
      // Calculate the total price for the product
      const productTotal = unitPrice * quantity - discount;

      // Add the product total to the overall total
      totalPrice += productTotal;
    }
  }

  return totalPrice;
};

const removeBanglaAndBrackets=(input: string): string=> {
  // Define the Unicode range for Bangla characters (U+0980 to U+09FF)
  const banglaAndBracketsRegex = /[\u0980-\u09FF()]/g;
  
  // Replace all Bangla characters and brackets with an empty string
  return input.replace(banglaAndBracketsRegex, '');
}

export const generatePurchageOrder = (
 order:IOrder
) => {
  const doc = new jsPDF();

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

  // Add an image (replace 'imageURL' with the actual image URL)
  const imageURL =
    "https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png";
  doc.addImage(imageURL, "JPEG", 10, 5, 32, 32);

  // Add customer and shipping information
  doc.setFontSize(14);
  doc.setFont("roboto", "bold");
  doc.text(`Customer Information:`, 15, 40);
  doc.setFontSize(10);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.customerInfo.name}`, 15, 45);
  doc.text(`Address: ${purchaseOrder.customerInfo.address}`, 15, 50);
  doc.text(`Mobile Number: ${purchaseOrder.customerInfo.mobile}`, 15, 55);

  doc.setFontSize(14);
  doc.setFont("roboto", "bold");
  doc.text(`Delivery Information:`, 15, 65);
  doc.setFontSize(10);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.shippingInfo.name}`, 15, 70);
  doc.setFontSize(10);
  doc.text(`Address: ${purchaseOrder.shippingInfo.address}`, 15, 75);
  doc.setFontSize(10);
  doc.text(`Mobile: ${purchaseOrder.shippingInfo.mobile}`, 15, 80);

  // Add company information
  doc.setFontSize(14);
  doc.setFont("roboto", "bold");
  doc.text(`Company Information:`, 120, 40);
  doc.setFontSize(10);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.companyInfo.name}`, 120, 45);
  doc.text(`Address: ${purchaseOrder.companyInfo.address}`, 120, 50);

  // Purchase Order Number and Tracking ID
  doc.setFontSize(15);
  doc.text("Purchase Order", 15, 90);
  doc.setFontSize(15);
  doc.text(`Order Number: ${purchaseOrder.orderNumber}`, 15, 100);
  doc.text(`Tracking ID: ${purchaseOrder.trackingId}`, 15, 110);

  //order type
  const col = [
    "Purchase Representative",
    "Payment Status",
    "Order Date",
  ];

  const list = [
    [
      "Seller Portal",
      "Credit 30 Days",
      `${new Date(order.timestamps.createdAt).toLocaleDateString()}`,
    ],
  ];

  // Product list table
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
     `${product.variation?.color}${!!product.variation?.color && !!product.variation?.size? ' - ':''}${product.variation?.size}`,
    product.quantity,
    `${product.unitPrice.toFixed(2)}`,
    `${!!product.discount ? product.discount.toFixed(2) : "0.00"}`,
    `${(
      product.quantity * product.unitPrice -
      (!!product.discount ? product.discount : 0)
    ).toFixed(2)}`,
  ]);

  // Add an empty row to separate the products and the subtotal
  data.push(["", "", "", "", "", "", ""]);

  // Calculate the sum of all prices
  const totalPrice = calculateTotalPrice(order?.products);

  //discount row
  const discountRow = [
    "",
    "",
    "",
    "",
    "",
    "Discount",
    `${
      !!order?.discount
        ? order.discount.toFixed(2)
        : "0.00"
    }`,
  ];
  data.push(discountRow);
  // Subtotal row
  const subtotalRow = [
    "",
    "",
    "",
    "",
    "",
    "Subtotal",
    `${(
      totalPrice -
      (!!order?.discount ? order?.discount : 0)
    ).toFixed(2)}`,
  ];
  data.push(subtotalRow);

  console.log(data);

  autoTable(doc, {
    startY: 120,
    head: [col],
    body: list,
    theme: "plain",
    styles: { halign: "left" },
  });

  autoTable(doc, {
    startY: 140,
    head: [columns],
    body: data,
    theme: "striped",
    horizontalPageBreak: true,
    styles: { halign: "left" },
  });

  // Add your copyright text to every page
   const copyrightText =
    "© +8801700534317 prior.retailshop.info.bd@gmail.com http://www.priorbd.com H-29, R-1/C, Nikunja-2, Dhaka-1229";
  // Add a footer with the copyright text on every page
  const totalPages = doc.internal.pages?.length - 1;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);

    // Add a black line
    doc.setDrawColor(0); // 0 for black
    doc.setLineWidth(0.2); // Adjust the line width as needed
    doc.line(
      10,
      doc.internal.pageSize.height - 15,
      200,
      doc.internal.pageSize.height - 15
    ); // Adjust the line's coordinates

    doc.text(copyrightText, 35, doc.internal.pageSize.height - 10);
    doc.text(`${i}/${totalPages}`, 190, doc.internal.pageSize.height - 10);
  }

  // Save the PDF or open it in a new tab
  doc.save(`PurchaseOrder-${order?.orderNumber}.pdf`);
};

export const generateInvoice = (
  order:IOrder
) => {
  const doc = new jsPDF();

  // Sample data
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

  // Add an image (replace 'imageURL' with the actual image URL)
  const imageURL =
    "https://res.cloudinary.com/emerging-it/image/upload/v1723971522/logo_guswtt.png";
  doc.addImage(imageURL, "PNG", -10, 5, 100, 32);

  // Add customer and shipping information

  // doc.setFontSize(14);
  // doc.setFont("roboto", "bold");
  // doc.text(`Customer Information:`, 10, 40);
  // doc.setFontSize(12);
  // doc.setFont("roboto", "normal");
  // doc.text(`Prior`, 15, 35);
  // doc.setFontSize(10);
  // doc.setFont("roboto", "normal");
  // doc.text(` ${purchaseOrder.customerInfo.mobile}`, 15, 42);

    const cbaddressLines = doc.splitTextToSize(purchaseOrder.customerInfo.address, 100);
        const csaddressLines = doc.splitTextToSize(purchaseOrder.customerInfo.address, 100);


  doc.setFontSize(12);
  doc.setFont("roboto", "normal");
  doc.text(`Billing Information:`, 15, 60);
  doc.setFontSize(10);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.customerInfo.name}`, 15, 65);
  doc.text(`Mobile Number: ${purchaseOrder.customerInfo.mobile}`, 15, 70);
  //  doc.text(`Address: ${purchaseOrder.customerInfo.address}`, 15, 75);
   let yPosition=75;
   cbaddressLines.forEach((line:string,index:number) => {
    doc.text(`${index===0? 'Address: ': ''}${line}`, 15, yPosition);
    yPosition += 5; // Adjust line spacing
  });

  doc.text(`Payment Method: ${!!order?.payment && order?.payment.length>0 ? order?.payment[0]?.paymentType : 'Cash On Delivery'}`, 15, 95);

  doc.setFontSize(12);
  doc.setFont("roboto", "normal");
  doc.text(`Shipping Information:`, 120, 60);
  doc.setFontSize(10);
  doc.setFont("roboto", "normal");
  doc.text(`Name: ${purchaseOrder.shippingInfo.name}`, 120, 65);
  doc.text(`Mobile: ${purchaseOrder.shippingInfo.mobile}`, 120, 70);
  // doc.text(`Address: ${purchaseOrder.shippingInfo.address}`, 120, 75);
   let y2Position=75;
   csaddressLines.forEach((line:string,index:number) => {
    doc.text(`${index===0? 'Address: ': ''}${line}`, 120, y2Position);
    y2Position += 5; // Adjust line spacing
  });

  // Add company information
  doc.setFontSize(17);
  doc.setFont("roboto", "bold");
  doc.text(`Invoice`, 120, 20);
  doc.setFontSize(10);
  doc.setFont("roboto", "normal");
  doc.text(
    `Order Date: ${new Date(order.timestamps.createdAt).toLocaleDateString()}`,
    120,
    30
  );
  doc.text(`Order ID: ${purchaseOrder.orderNumber}`, 120, 36);
  doc.text(`Tracking ID: ${purchaseOrder.trackingId}`, 120, 42);

  // Product list table
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
    const increasedUnitPrice = product.unitPrice; // Increase unit price by 5%
    const totalPerProduct =
      product.quantity * increasedUnitPrice -
      (!!product.discount ? product.discount : 0);

    return [
      index + 1,
      product.name,
      `${product.variation?.color}${!!product.variation?.color && !!product.variation?.size? ' - ':''}${product.variation?.size}`,
      product.quantity,
      `${increasedUnitPrice.toFixed(2)}`,
      `${!!product.discount ? product.discount.toFixed(2) : "0.00"}`,
      `${totalPerProduct.toFixed(2)}`,
    ];
  });

  // Calculate the total price by summing up the total of each product


  // Add an empty row to separate the products and the subtotal
  data.push(["", "", "", "", "", "", ""]);

  const dataV2 = [];

  //discount row

  const totalRow = [
    { colSpan: 5, content: "" },
    { content: "Total" },
    {
      content: `${order?.totalPrice.toFixed(2)}`,
    },
  ];

  //discount row
  const discountRow = [
    { colSpan: 5, content: "" },
    { content: "Discount (-)" },
    {
      content: `${
        !!order?.discount
          ? order?.discount.toFixed(2)
          : "0.00"
      }`,
    },
  ];

  //tax row
  const taxRow = [
    { colSpan: 5, content: "" },
    { content: "Paid(-)" },
    {
      content: `${order?.paid}`,
    },
  ];

  //shipping cost row
  const shippingCostRow = [
    { colSpan: 5, content: "" },
    { content: "Shipping Cost (+)" },
    {
      content: `${order?.deliveryCharge}`,
    },
  ];

  // Subtotal row
  const subtotalRow = [
    { colSpan: 5, content: "" },
    { content: "Due (BDT)" },
    {
      content: `${order?.remaining.toFixed(2)}`,
    },
  ];
 ///grand total
  const grandTotalRow = [
    { colSpan: 5, content: "" },
    { content: "Subtotal (BDT)" },
    {
      content: `${(
      (order?.totalPrice + order?.deliveryCharge) -
     ( !!order?.discount ? order?.discount : 0)
    ).toFixed(2)}`,
    },
  ];

  dataV2.push(totalRow);
  dataV2.push(shippingCostRow);
  dataV2.push(discountRow);
  dataV2.push(grandTotalRow);

  dataV2.push(taxRow);

  
  
  dataV2.push(subtotalRow);

  autoTable(doc, {
    startY: 100,
    head: [columns],
    body: [...data, ...dataV2],
    theme: "grid",
    horizontalPageBreak: true,
    styles: { halign: "left", overflow: "linebreak" },
  });

  // Add your copyright text to every page
  const copyrightText =
    "© +8801700534317 prior.retailshop.info.bd@gmail.com http://www.priorbd.com H-29, R-1/C, Nikunja-2, Dhaka-1229";

  // Add a footer with the copyright text on every page
  const totalPages = doc.internal.pages?.length - 1;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);

    // Add a black line
    doc.setDrawColor(0); // 0 for black
    doc.setLineWidth(0.2); // Adjust the line width as needed
    doc.line(
      10,
      doc.internal.pageSize.height - 15,
      200,
      doc.internal.pageSize.height - 15
    ); // Adjust the line's coordinates

    doc.text(copyrightText, 15, doc.internal.pageSize.height - 10);
    doc.text(`${i}/${totalPages}`, 190, doc.internal.pageSize.height - 10);
  }

  // Save the PDF or open it in a new tab
  doc.save(`invoice-${order?.orderNumber}.pdf`);
};