import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Vendor } from '../models/Vendor.js';
import { Coupon } from '../models/Coupon.js';
import { calculateSplit, executeSplitPayment } from '../config/payment.js';
import { getRedisClient } from '../config/redis.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, paymentGateway = 'stripe' } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Please provide complete shipping address' });
    }

    const enrichedItems = [];
    for (const it of items) {
      const prod = await Product.findById(it.productId || it.product).populate('vendor');
      if (!prod) {
        return res.status(404).json({ success: false, message: `Product ${it.name || 'item'} not found` });
      }
      if (prod.stock < it.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${prod.name}. Available: ${prod.stock}`
        });
      }

      enrichedItems.push({
        product: prod._id,
        vendor: prod.vendor,
        name: prod.name,
        image: prod.images[0] || '',
        price: prod.price,
        quantity: Number(it.quantity)
      });
    }

    const splitCalculation = calculateSplit(enrichedItems);

    let discount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date(coupon.expiryDate) > new Date()) {
        if (splitCalculation.subtotal >= coupon.minOrderAmount) {
          discount = Math.min((splitCalculation.subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
          discount = Math.round(discount * 100) / 100;
          couponApplied = {
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            discountAmount: discount
          };
          coupon.timesUsed += 1;
          await coupon.save();
        }
      }
    }

    const shippingFee = splitCalculation.subtotal > 50 ? 0 : 5.99;
    const tax = Math.round((splitCalculation.subtotal * 0.08) * 100) / 100; 
    const totalAmount = Math.round((splitCalculation.subtotal - discount + shippingFee + tax) * 100) / 100;

    const paymentResult = await executeSplitPayment({
      gateway: paymentGateway,
      amount: totalAmount,
      currency: 'usd',
      vendorSplits: splitCalculation.vendorSplits
    });

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await Order.create({
      customer: req.user._id,
      orderNumber,
      items: splitCalculation.processedItems,
      shippingAddress,
      subtotal: splitCalculation.subtotal,
      discount,
      tax,
      shippingFee,
      totalAmount,
      platformTotalCommission: splitCalculation.totalPlatformCommission,
      vendorTotalPayout: splitCalculation.totalVendorPayout,
      couponApplied,
      payment: {
        gateway: paymentGateway,
        status: 'completed',
        transactionId: paymentResult.transactionId,
        splitDetails: paymentResult.splits
      },
      orderStatus: 'placed',
      timeline: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order successfully placed and payment split confirmed'
        }
      ],
      invoiceNumber: `INV-${orderNumber}`
    });

    for (const item of splitCalculation.processedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });

      const vendorId = item.vendor._id || item.vendor;
      await Vendor.findByIdAndUpdate(vendorId, {
        $inc: {
          totalSales: item.itemTotal,
          totalEarnings: item.vendorEarnings,
          balance: item.vendorEarnings
        }
      });
    }

    try {
      const redis = getRedisClient();
      await redis.del(`cart:user:${req.user._id}`);
    } catch (err) {
      console.warn(`[Redis] Cart clear failed: ${err.message}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully with multi-vendor payment split',
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.product', 'name images price slug')
      .populate('items.vendor', 'storeName logo commissionRate stripeAccountId razorpayAccountId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const userVendorId = req.user.vendorProfile?._id ? req.user.vendorProfile._id.toString() : req.user.vendorProfile?.toString();
    const isVendor = Boolean(userVendorId && order.items.some((it) => {
      const itVendorId = it.vendor?._id ? it.vendor._id.toString() : it.vendor?.toString();
      return itVendorId === userVendorId;
    }));

    if (!isCustomer && !isAdmin && !isVendor) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.vendor', 'storeName logo')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const orders = await Order.find({ 'items.vendor': vendor._id })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => {
      const vendorItems = order.items.filter(
        (it) => it.vendor && it.vendor.toString() === vendor._id.toString()
      );
      const vendorSubtotal = vendorItems.reduce((acc, it) => acc + it.itemTotal, 0);
      const platformCommission = vendorItems.reduce((acc, it) => acc + it.platformCommission, 0);
      const vendorNet = vendorItems.reduce((acc, it) => acc + it.vendorEarnings, 0);

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        payment: order.payment,
        items: vendorItems,
        vendorSubtotal: Math.round(vendorSubtotal * 100) / 100,
        platformCommission: Math.round(platformCommission * 100) / 100,
        vendorNet: Math.round(vendorNet * 100) / 100
      };
    });

    return res.json({ success: true, count: formattedOrders.length, orders: formattedOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order transitioned to ${status}`
    });

    order.items.forEach((item) => {
      item.itemStatus = status;
    });

    await order.save();

    return res.json({
      success: true,
      message: `Order status successfully transitioned to ${status}`,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.vendor', 'storeName')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
