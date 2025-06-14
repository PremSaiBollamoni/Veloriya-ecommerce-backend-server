const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      totalAmount,
      tax,
      paymentMethod
    } = req.body;

    // Validate payment method data based on type
    if (!paymentMethod || !paymentMethod.type) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    switch (paymentMethod.type) {
      case 'CARD':
        if (!paymentMethod.cardLast4 || !paymentMethod.cardExpiry) {
          return res.status(400).json({ message: 'Invalid card details' });
        }
        break;
      case 'UPI':
        if (!paymentMethod.upiId) {
          return res.status(400).json({ message: 'UPI ID is required' });
        }
        break;
      case 'EMI':
        if (!paymentMethod.emiMonths || !paymentMethod.emiBank || !paymentMethod.emiInterestRate) {
          return res.status(400).json({ message: 'Invalid EMI details' });
        }
        break;
      case 'WALLET':
        if (!paymentMethod.walletProvider) {
          return res.status(400).json({ message: 'Wallet provider is required' });
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid payment method type' });
    }

    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      totalAmount,
      tax,
      paymentMethod
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('shippingAddress')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('shippingAddress');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Update order to paid
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate payment based on method type
    const { paymentResult } = req.body;
    if (!paymentResult || !paymentResult.status) {
      return res.status(400).json({ message: 'Invalid payment result' });
    }

    // Additional validation based on payment method
    switch (order.paymentMethod.type) {
      case 'CARD':
        if (!paymentResult.cardTransactionId) {
          return res.status(400).json({ message: 'Card transaction ID is required' });
        }
        break;
      case 'UPI':
        if (!paymentResult.upiTransactionId) {
          return res.status(400).json({ message: 'UPI transaction ID is required' });
        }
        break;
      case 'EMI':
        if (!paymentResult.emiTransactionId || !paymentResult.emiApprovalId) {
          return res.status(400).json({ message: 'EMI transaction details are required' });
        }
        break;
      case 'WALLET':
        if (!paymentResult.walletTransactionId) {
          return res.status(400).json({ message: 'Wallet transaction ID is required' });
        }
        break;
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    order.paymentStatus = 'paid';
    order.status = 'processing';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order payment:', error);
    res.status(500).json({ message: 'Error updating order payment' });
  }
});

// Update order to delivered
router.put('/:id/deliver', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order must be paid before delivery' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order delivery:', error);
    res.status(500).json({ message: 'Error updating order delivery' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    // TODO: Add admin check here
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // TODO: Add admin check here
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 