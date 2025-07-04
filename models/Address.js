const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  addressLine: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'United States'
  },
  phone: String,
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'addresses'
});

addressSchema.index({ user: 1 });

const Address = mongoose.model('Address', addressSchema);

Address.createCollection().then(function(collection) {
  console.log('Address Collection is created!');
});

module.exports = Address; 