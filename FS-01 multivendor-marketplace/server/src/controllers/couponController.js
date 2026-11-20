import { Coupon } from '../models/Coupon.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (Number(orderAmount) < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Coupon requires minimum order amount of $${coupon.minOrderAmount}`
      });
    }

    const calculatedDiscount = Math.min((Number(orderAmount) * coupon.discountPercent) / 100, coupon.maxDiscount);

    return res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        maxDiscount: coupon.maxDiscount,
        discountAmount: Math.round(calculatedDiscount * 100) / 100
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, maxDiscount, minOrderAmount, expiryDate } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      maxDiscount: maxDiscount ? Number(maxDiscount) : 100,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    });

    return res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
