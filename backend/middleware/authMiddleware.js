const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT and attach user to request
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userFound = await User.findById(decoded.id).select('-password');
    if (!userFound) {
      return res.status(401).json({ message: 'Session expired or user not found. Please log in again.' });
    }
    req.user = userFound;
    if (!req.user._id && req.user.id) {
      req.user._id = req.user.id;
    }
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
