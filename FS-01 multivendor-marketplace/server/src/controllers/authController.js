import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, storeName, description } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const assignedRole = ['vendor', 'admin'].includes(role) ? role : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole
    });

    if (assignedRole === 'vendor') {
      const vendorStoreName = storeName || `${name.trim()}'s Official Store`;
      const vendor = await Vendor.create({
        user: user._id,
        storeName: vendorStoreName,
        description: description || 'Welcome to our verified marketplace store.'
      });

      await User.findByIdAndUpdate(user._id, { vendorProfile: vendor._id });
      user.vendorProfile = vendor._id;
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail }).select('+password').populate('vendorProfile');

    if (!user && normalizedEmail.includes('@nexviamart.com')) {
      const legacyEmail = normalizedEmail.replace('@nexviamart.com', '@omnimarket.com');
      user = await User.findOne({ email: legacyEmail }).select('+password').populate('vendorProfile');
    }
    if (!user && normalizedEmail.includes('@omnimarket.com')) {
      const modernEmail = normalizedEmail.replace('@omnimarket.com', '@nexviamart.com');
      user = await User.findOne({ email: modernEmail }).select('+password').populate('vendorProfile');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('vendorProfile');
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, addresses } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (addresses) user.addresses = addresses;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        vendorProfile: user.vendorProfile
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
