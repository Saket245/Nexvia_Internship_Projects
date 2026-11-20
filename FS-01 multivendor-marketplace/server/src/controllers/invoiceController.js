import { jsPDF } from 'jspdf';
import { Order } from '../models/Order.js';

export const getInvoiceData = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'name email phone')
      .populate('items.vendor', 'storeName stripeAccountId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer && order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const userVendorId = req.user.vendorProfile?._id ? req.user.vendorProfile._id.toString() : req.user.vendorProfile?.toString();
    const isVendor = Boolean(userVendorId && order.items.some((it) => {
      const itVendorId = it.vendor?._id ? it.vendor._id.toString() : it.vendor?.toString();
      return itVendorId === userVendorId;
    }));

    if (!isCustomer && !isAdmin && !isVendor) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    return res.json({
      success: true,
      invoice: {
        invoiceNumber: order.invoiceNumber || `INV-${order.orderNumber}`,
        orderDate: order.createdAt,
        customer: {
          name: order.shippingAddress.fullName,
          email: order.customer?.email,
          address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`
        },
        items: order.items.map((it) => ({
          name: it.name,
          vendor: it.vendor?.storeName || 'Marketplace Vendor',
          price: it.price,
          quantity: it.quantity,
          total: it.itemTotal
        })),
        pricing: {
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          shipping: order.shippingFee,
          totalAmount: order.totalAmount
        },
        payment: {
          gateway: order.payment.gateway,
          status: order.payment.status,
          transactionId: order.payment.transactionId
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadInvoicePdf = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'name email')
      .populate('items.vendor', 'storeName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer && order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const userVendorId = req.user.vendorProfile?._id ? req.user.vendorProfile._id.toString() : req.user.vendorProfile?.toString();
    const isVendor = Boolean(userVendorId && order.items.some((it) => {
      const itVendorId = it.vendor?._id ? it.vendor._id.toString() : it.vendor?.toString();
      return itVendorId === userVendorId;
    }));

    if (!isCustomer && !isAdmin && !isVendor) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('NEXVIAMART INVOICE', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Multi-Vendor Marketplace Platform Inc.', 14, 28);
    doc.text(`Invoice: ${order.invoiceNumber || `INV-${order.orderNumber}`}`, 14, 34);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 40);
    doc.text(`Transaction ID: ${order.payment.transactionId || 'N/A'}`, 14, 46);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Billed & Shipped To:', 14, 58);
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`${order.shippingAddress.fullName}`, 14, 65);
    doc.text(`${order.shippingAddress.street}`, 14, 71);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 14, 77);
    doc.text(`Phone: ${order.shippingAddress.phone || 'N/A'}`, 14, 83);

    let y = 98;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Item Description', 16, y + 6);
    doc.text('Vendor', 95, y + 6);
    doc.text('Qty', 135, y + 6);
    doc.text('Price', 155, y + 6);
    doc.text('Total', 178, y + 6);

    y += 14;

    order.items.forEach((item) => {
      doc.setTextColor(51, 65, 85);
      const title = item.name.length > 36 ? item.name.substring(0, 33) + '...' : item.name;
      const vendorName = item.vendor?.storeName || 'Vendor';
      const truncatedVendor = vendorName.length > 18 ? vendorName.substring(0, 15) + '...' : vendorName;

      doc.text(title, 16, y);
      doc.text(truncatedVendor, 95, y);
      doc.text(String(item.quantity), 137, y);
      doc.text(`$${item.price.toFixed(2)}`, 155, y);
      doc.text(`$${item.itemTotal.toFixed(2)}`, 178, y);
      y += 8;
    });

    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 10;

    doc.text(`Subtotal:`, 145, y);
    doc.text(`$${order.subtotal.toFixed(2)}`, 178, y);
    y += 6;

    if (order.discount > 0) {
      doc.text(`Coupon Discount:`, 145, y);
      doc.text(`-$${order.discount.toFixed(2)}`, 178, y);
      y += 6;
    }

    doc.text(`Estimated Tax:`, 145, y);
    doc.text(`$${order.tax.toFixed(2)}`, 178, y);
    y += 6;

    doc.text(`Shipping:`, 145, y);
    doc.text(`$${order.shippingFee.toFixed(2)}`, 178, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Amount:`, 145, y);
    doc.text(`$${order.totalAmount.toFixed(2)}`, 178, y);

    y += 20;
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for shopping on NexviaMart. Automated multi-vendor split settlement receipt.', 14, y);

    const pdfOutput = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    return res.send(Buffer.from(pdfOutput));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
