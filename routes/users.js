const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const auth = require('../middleware/auth');

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [orders, wishlist, addresses] = await Promise.all([
      Order.find({ user: req.user.id }).select('_id'),
      Wishlist.findOne({ user: req.user.id }),
      Address.countDocuments({ user: req.user.id })
    ]);

    const orderCount = orders.length;
    const memberLevel = orderCount >= 5 ? 'Veloriya Plus Member' : 'Standard';

    const stats = {
      totalOrders: orderCount,
      wishlistItems: wishlist ? wishlist.products.length : 0,
      savedCards: 0, // TODO: Implement saved cards functionality
      savedAddresses: addresses,
      memberLevel
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

// Get user activity
router.get('/activity', auth, async (req, res) => {
  try {
    // Get recent orders
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .select('createdAt status');

    // Get recent wishlist changes
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products', 'name')
      .sort('-updatedAt')
      .limit(5);

    const activity = [];

    // Add order activities
    orders.forEach(order => {
      activity.push({
        id: order._id,
        type: 'order',
        message: `Order #${order._id.toString().slice(-8)} was ${order.status}`,
        date: order.createdAt
      });
    });

    // Add wishlist activities if exists
    if (wishlist && wishlist.products.length > 0) {
      wishlist.products.slice(0, 5).forEach(product => {
        activity.push({
          id: product._id,
          type: 'wishlist',
          message: `Added ${product.name} to wishlist`,
          date: wishlist.updatedAt
        });
      });
    }

    // Sort by date and limit to 5 most recent activities
    const sortedActivity = activity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json(sortedActivity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Error fetching user activity' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      memberSince: user.memberSince
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

module.exports = router; 