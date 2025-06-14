const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['CARD', 'UPI', 'EMI', 'WALLET'],
      required: true
    },
    // Card details
    cardLast4: String,
    cardExpiry: String,
    cardNetwork: String,
    // UPI details
    upiId: String,
    upiProvider: String,
    // EMI details
    emiMonths: Number,
    emiBank: String,
    emiInterestRate: Number,
    // Wallet details
    walletProvider: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema); 