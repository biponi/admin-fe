/**
 * InvoiceView Component
 * Classic invoice layout for printing and downloading
 */

import React from "react";
import { formatCurrency, formatDate, formatOrderNumber } from "../lib/utils";
import type { IOrder } from "../types";
import InvoiceDocument from "../../../utils/reactPdfInvoice";

interface InvoiceViewProps {
  order: IOrder;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order }) => {
  const subtotal = order.totalPrice - (order.deliveryCharge || 0);

  return (
    <div
      className='invoice-container bg-white p-8 max-w-4xl mx-auto'
      style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className='border-b-2 border-gray-800 pb-6 mb-6'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>INVOICE</h1>
            <p className='text-gray-600'>
              Order #{formatOrderNumber(order.orderNumber)}
            </p>
          </div>
          <div className='text-right'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Your Company Name
            </h2>
            <p className='text-sm text-gray-600'>123 Business Street</p>
            <p className='text-sm text-gray-600'>City, State 12345</p>
            <p className='text-sm text-gray-600'>Phone: (123) 456-7890</p>
            <p className='text-sm text-gray-600'>Email: info@company.com</p>
          </div>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div className='grid grid-cols-2 gap-6 mb-8'>
        <div>
          <h3 className='text-sm font-bold text-gray-800 mb-2 uppercase'>
            Bill To:
          </h3>
          <p className='text-gray-700 font-semibold'>{order.customer.name}</p>
          <p className='text-sm text-gray-600'>{order.customer.phoneNumber}</p>
          {order.customer.email && (
            <p className='text-sm text-gray-600'>{order.customer.email}</p>
          )}
        </div>
        <div>
          <h3 className='text-sm font-bold text-gray-800 mb-2 uppercase'>
            Ship To:
          </h3>
          <p className='text-sm text-gray-700'>{order.shipping.address}</p>
          <p className='text-sm text-gray-600'>
            {order.shipping.district}, {order.shipping.division}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className='grid grid-cols-2 gap-6 mb-8'>
        <div>
          <p className='text-sm text-gray-600'>
            <span className='font-semibold'>Invoice Date:</span>{" "}
            {formatDate(order.timestamps.createdAt)}
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-semibold'>Status:</span>{" "}
            <span className='capitalize'>{order.status}</span>
          </p>
        </div>
        <div>
          {order.payment && order.payment.length > 0 && (
            <p className='text-sm text-gray-600'>
              <span className='font-semibold'>Payment Method:</span>{" "}
              {order.payment[0].paymentType}
            </p>
          )}
          {order.courier?.trackingCode && (
            <p className='text-sm text-gray-600'>
              <span className='font-semibold'>Tracking Code:</span>{" "}
              {order.courier.trackingCode}
            </p>
          )}
        </div>
      </div>

      {/* Products Table */}
      <table className='w-full mb-8 border-collapse'>
        <thead>
          <tr className='border-b-2 border-gray-800'>
            <th className='text-left py-3 text-sm font-bold text-gray-800 uppercase'>
              Item
            </th>
            <th className='text-center py-3 text-sm font-bold text-gray-800 uppercase'>
              Quantity
            </th>
            <th className='text-right py-3 text-sm font-bold text-gray-800 uppercase'>
              Unit Price
            </th>
            <th className='text-right py-3 text-sm font-bold text-gray-800 uppercase'>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((product, index) => (
            <tr key={index} className='border-b border-gray-300'>
              <td className='py-3 text-sm text-gray-700'>{product.name}</td>
              <td className='py-3 text-sm text-gray-700 text-center'>
                {product.quantity}
              </td>
              <td className='py-3 text-sm text-gray-700 text-right'>
                {formatCurrency(product.unitPrice)}
              </td>
              <td className='py-3 text-sm text-gray-700 text-right font-semibold'>
                {formatCurrency(product.totalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className='flex justify-end mb-8'>
        <div className='w-80'>
          <div className='flex justify-between py-2 border-b border-gray-300'>
            <span className='text-sm text-gray-600'>Subtotal:</span>
            <span className='text-sm text-gray-700 font-semibold'>
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className='flex justify-between py-2 border-b border-gray-300'>
            <span className='text-sm text-gray-600'>Delivery Charge:</span>
            <span className='text-sm text-gray-700 font-semibold'>
              {formatCurrency(order.deliveryCharge || 0)}
            </span>
          </div>
          {order.discount > 0 && (
            <div className='flex justify-between py-2 border-b border-gray-300'>
              <span className='text-sm text-green-600'>Discount:</span>
              <span className='text-sm text-green-600 font-semibold'>
                - {formatCurrency(order.discount)}
              </span>
            </div>
          )}
          <div className='flex justify-between py-3 border-t-2 border-gray-800 mt-2'>
            <span className='text-base font-bold text-gray-800'>Total:</span>
            <span className='text-base font-bold text-gray-800'>
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
          <div className='flex justify-between py-2 border-b border-gray-300'>
            <span className='text-sm text-green-600 font-semibold'>Paid:</span>
            <span className='text-sm text-green-600 font-semibold'>
              {formatCurrency(order.paid)}
            </span>
          </div>
          {order.remaining > 0 && (
            <div className='flex justify-between py-2 border-b border-gray-300'>
              <span className='text-sm text-red-600 font-semibold'>
                Balance Due:
              </span>
              <span className='text-sm text-red-600 font-semibold'>
                {formatCurrency(order.remaining)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className='mb-8'>
          <h3 className='text-sm font-bold text-gray-800 mb-2 uppercase'>
            Notes:
          </h3>
          <p className='text-sm text-gray-600 italic'>{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className='border-t border-gray-300 pt-6 text-center'>
        <p className='text-xs text-gray-500'>Thank you for your business!</p>
        <p className='text-xs text-gray-500 mt-1'>
          For questions about this invoice, please contact us at
          info@company.com
        </p>
      </div>
    </div>
  );
};

/**
 * Renders invoice to HTML string for PDF generation
 */
export const renderInvoiceHTML = (order: IOrder): any => {
  return <InvoiceDocument order={order} />;
};

export const renderSampleInvoiceHTML = (order: IOrder): string => {
  const subtotal = order.totalPrice - (order.deliveryCharge || 0);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${formatOrderNumber(order.orderNumber)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .header {
      border-bottom: 2px solid #1f2937;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
    }
    .header h1 {
      font-size: 32px;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .company-info {
      text-align: right;
    }
    .company-info h2 {
      font-size: 24px;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .company-info p {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.5;
    }
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .info-block h3 {
      font-size: 12px;
      font-weight: bold;
      color: #1f2937;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .info-block p {
      font-size: 14px;
      color: #374151;
      line-height: 1.5;
    }
    .info-block .small {
      font-size: 12px;
      color: #6b7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      border-bottom: 2px solid #1f2937;
    }
    th {
      padding: 12px 0;
      font-size: 12px;
      font-weight: bold;
      color: #1f2937;
      text-transform: uppercase;
    }
    th.left { text-align: left; }
    th.center { text-align: center; }
    th.right { text-align: right; }
    tbody tr {
      border-bottom: 1px solid #d1d5db;
    }
    td {
      padding: 12px 0;
      font-size: 14px;
      color: #374151;
    }
    td.center { text-align: center; }
    td.right { text-align: right; }
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }
    .totals-table {
      width: 320px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #d1d5db;
    }
    .totals-row.total {
      border-top: 2px solid #1f2937;
      border-bottom: 2px solid #1f2937;
      margin-top: 8px;
      padding: 12px 0;
    }
    .totals-row span {
      font-size: 14px;
    }
    .totals-row.total span {
      font-size: 16px;
      font-weight: bold;
      color: #1f2937;
    }
    .totals-row.paid span {
      color: #059669;
      font-weight: 600;
    }
    .totals-row.due span {
      color: #dc2626;
      font-weight: 600;
    }
    .notes {
      margin-bottom: 30px;
    }
    .notes h3 {
      font-size: 12px;
      font-weight: bold;
      color: #1f2937;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .notes p {
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
    }
    .footer {
      border-top: 1px solid #d1d5db;
      padding-top: 20px;
      text-align: center;
    }
    .footer p {
      font-size: 11px;
      color: #9ca3af;
      line-height: 1.6;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-container {
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1>INVOICE</h1>
        <p>Order #${formatOrderNumber(order.orderNumber)}</p>
      </div>
      <div class="company-info">
        <h2>Your Company Name</h2>
        <p>123 Business Street</p>
        <p>City, State 12345</p>
        <p>Phone: (123) 456-7890</p>
        <p>Email: info@company.com</p>
      </div>
    </div>

    <!-- Customer & Order Info -->
    <div class="info-section">
      <div class="info-block">
        <h3>Bill To:</h3>
        <p style="font-weight: 600;">${order.customer.name}</p>
        <p class="small">${order.customer.phoneNumber}</p>
        ${
          order.customer.email
            ? `<p class="small">${order.customer.email}</p>`
            : ""
        }
      </div>
      <div class="info-block">
        <h3>Ship To:</h3>
        <p class="small">${order.shipping.address}</p>
        <p class="small">${order.shipping.district}, ${
    order.shipping.division
  }</p>
      </div>
    </div>

    <!-- Order Details -->
    <div class="info-section">
      <div class="info-block">
        <p class="small"><strong>Invoice Date:</strong> ${formatDate(
          order.timestamps.createdAt
        )}</p>
        <p class="small"><strong>Status:</strong> <span style="text-transform: capitalize;">${
          order.status
        }</span></p>
      </div>
      <div class="info-block">
        ${
          order.payment && order.payment.length > 0
            ? `<p class="small"><strong>Payment Method:</strong> ${order.payment[0].paymentType}</p>`
            : ""
        }
        ${
          order.courier?.trackingCode
            ? `<p class="small"><strong>Tracking Code:</strong> ${order.courier.trackingCode}</p>`
            : ""
        }
      </div>
    </div>

    <!-- Products Table -->
    <table>
      <thead>
        <tr>
          <th class="left">Item</th>
          <th class="center">Quantity</th>
          <th class="right">Unit Price</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.products
          .map(
            (product) => `
          <tr>
            <td>${product.name}</td>
            <td class="center">${product.quantity}</td>
            <td class="right">${formatCurrency(product.unitPrice)}</td>
            <td class="right" style="font-weight: 600;">${formatCurrency(
              product.totalPrice
            )}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-table">
        <div class="totals-row">
          <span style="color: #6b7280;">Subtotal:</span>
          <span style="font-weight: 600;">${formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
          <span style="color: #6b7280;">Delivery Charge:</span>
          <span style="font-weight: 600;">${formatCurrency(
            order.deliveryCharge || 0
          )}</span>
        </div>
        ${
          order.discount > 0
            ? `
          <div class="totals-row">
            <span style="color: #059669;">Discount:</span>
            <span style="color: #059669; font-weight: 600;">- ${formatCurrency(
              order.discount
            )}</span>
          </div>
        `
            : ""
        }
        <div class="totals-row total">
          <span>Total:</span>
          <span>${formatCurrency(order.totalPrice)}</span>
        </div>
        <div class="totals-row paid">
          <span>Paid:</span>
          <span>${formatCurrency(order.paid)}</span>
        </div>
        ${
          order.remaining > 0
            ? `
          <div class="totals-row due">
            <span>Balance Due:</span>
            <span>${formatCurrency(order.remaining)}</span>
          </div>
        `
            : ""
        }
      </div>
    </div>

    <!-- Notes -->
    ${
      order.notes
        ? `
      <div class="notes">
        <h3>Notes:</h3>
        <p>${order.notes}</p>
      </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>For questions about this invoice, please contact us at info@company.com</p>
    </div>
  </div>
</body>
</html>
  `;
};
