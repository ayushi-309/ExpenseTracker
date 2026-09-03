const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    // Simple validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    // Check if user exists by email or phone
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: phone.trim() },
      ],
    });
    if (existingUser) {
      const isEmailMatch = existingUser.email === email.toLowerCase().trim();
      return res.status(400).json({
        message: isEmailMatch
          ? 'An account with this email already exists'
          : 'An account with this phone number already exists',
      });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        monthlyBudget: user.monthlyBudget || 50000,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ message: 'Please provide either email or phone number' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Please provide password' });
    }

    const queryConditions = [];
    if (email && email.trim()) {
      queryConditions.push({ email: email.trim().toLowerCase() });
    }
    if (phone && phone.trim()) {
      queryConditions.push({ phone: phone.trim() });
    }

    const user = await User.findOne(
      queryConditions.length > 1 ? { $or: queryConditions } : queryConditions[0]
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        monthlyBudget: user.monthlyBudget || 50000,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & budget
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, monthlyBudget } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (monthlyBudget != null) updateData.monthlyBudget = Number(monthlyBudget);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      monthlyBudget: updatedUser.monthlyBudget,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getCurrentUser, updateProfile };