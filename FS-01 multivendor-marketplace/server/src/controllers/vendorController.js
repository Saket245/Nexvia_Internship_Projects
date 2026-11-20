import { Vendor } from '../models/Vendor.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const onboardVendor = async (req, res) => {
  try {
    const { storeName, description, logo, banner, commissionRate, bankDetails, stripeAccountId, razorpayAccountId } = req.body;

    let vendor = await Vendor.findOne({ user: req.user._id });

    if (vendor) {
      if (storeName) vendor.storeName = storeName;
      if (description) vendor.description = description;
      if (logo) vendor.logo = logo;
      if (banner) vendor.banner = banner;
      if (bankDetails) vendor.bankDetails = bankDetails;
      if (stripeAccountId) vendor.stripeAccountId = stripeAccountId;
      if (razorpayAccountId) vendor.razorpayAccountId = razorpayAccountId;
      if (req.user.role === 'admin' && commissionRate !== undefined) {
        vendor.commissionRate = commissionRate;
      }
      await vendor.save();
    } else {
      vendor = await Vendor.create({
        user: req.user._id,
        storeName: storeName || `${req.user.name}'s Store`,
        description,
        logo,
        banner,
        commissionRate: commissionRate || 10,
        bankDetails,
        stripeAccountId,
        razorpayAccountId,
        status: 'approved'
      });

      req.user.role = 'vendor';
      req.user.vendorProfile = vendor._id;
      await req.user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor profile onboarded successfully',
      vendor
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate('user', 'name email avatar');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }
    return res.json({ success: true, vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email avatar');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    const products = await Product.find({ vendor: vendor._id, isPublished: true });
    return res.json({ success: true, vendor, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ status: 'approved' }).populate('user', 'name email avatar');
    return res.json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorStats = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const productsCount = await Product.countDocuments({ vendor: vendor._id });

    const orders = await Order.find({ 'items.vendor': vendor._id }).sort({ createdAt: -1 });

    let totalGrossSales = 0;
    let totalCommissionPaid = 0;
    let totalNetEarnings = 0;
    let totalItemsSold = 0;

    const vendorOrders = [];

    orders.forEach((order) => {
      const vendorItems = order.items.filter(
        (it) => it.vendor.toString() === vendor._id.toString()
      );
      
      const orderSubtotal = vendorItems.reduce((acc, it) => acc + it.itemTotal, 0);
      const orderCommission = vendorItems.reduce((acc, it) => acc + it.platformCommission, 0);
      const orderNet = vendorItems.reduce((acc, it) => acc + it.vendorEarnings, 0);
      const itemsCount = vendorItems.reduce((acc, it) => acc + it.quantity, 0);

      totalGrossSales += orderSubtotal;
      totalCommissionPaid += orderCommission;
      totalNetEarnings += orderNet;
      totalItemsSold += itemsCount;

      vendorOrders.push({
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        customerName: order.shippingAddress.fullName,
        items: vendorItems,
        vendorSubtotal: orderSubtotal,
        platformCommission: orderCommission,
        vendorNet: orderNet
      });
    });

    return res.json({
      success: true,
      stats: {
        productsCount,
        ordersCount: vendorOrders.length,
        totalGrossSales: Math.round(totalGrossSales * 100) / 100,
        totalCommissionPaid: Math.round(totalCommissionPaid * 100) / 100,
        totalNetEarnings: Math.round(totalNetEarnings * 100) / 100,
        totalItemsSold,
        commissionRate: vendor.commissionRate,
        stripeAccountId: vendor.stripeAccountId,
        razorpayAccountId: vendor.razorpayAccountId
      },
      recentOrders: vendorOrders.slice(0, 10)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorStatus = async (req, res) => {
  try {
    const { status, commissionRate } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (status) vendor.status = status;
    if (commissionRate !== undefined) vendor.commissionRate = commissionRate;

    await vendor.save();
    return res.json({ success: true, message: 'Vendor status updated', vendor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
