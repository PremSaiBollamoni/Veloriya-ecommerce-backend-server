const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token has admin flag
    if (!decoded.isAdmin) {
      throw new Error('Not authorized as admin');
    }

    const user = await User.findOne({ _id: decoded.id, isAdmin: true });

    if (!user) {
      throw new Error('Not authorized as admin');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message || 'Please authenticate as admin.' });
  }
};

module.exports = adminAuth; 