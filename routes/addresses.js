const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const auth = require('../middleware/auth');

// Get all addresses for a user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.json(addresses); // Will return empty array if no addresses found
  } catch (error) {
    console.error('Error in GET /addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
});

// Add new address
router.post('/', auth, async (req, res) => {
  try {
    const { firstName, lastName, addressLine, city, state, zipCode, country, phone, isDefault } = req.body;

    // If this is the first address or isDefault is true, update other addresses
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    // If this is the first address, make it default
    const addressCount = await Address.countDocuments({ user: req.user.id });
    const shouldBeDefault = isDefault || addressCount === 0;

    const address = new Address({
      user: req.user.id,
      firstName,
      lastName,
      addressLine,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: shouldBeDefault
    });

    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Error in POST /addresses:', error);
    res.status(500).json({ message: 'Error creating address', error: error.message });
  }
});

// Update address
router.put('/:id', auth, async (req, res) => {
  try {
    const { firstName, lastName, addressLine, city, state, zipCode, country, phone, isDefault } = req.body;

    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, update other addresses
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } }
      );
    }

    address.firstName = firstName;
    address.lastName = lastName;
    address.addressLine = addressLine;
    address.city = city;
    address.state = state;
    address.zipCode = zipCode;
    address.country = country;
    address.phone = phone;
    address.isDefault = isDefault;

    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    console.error('Error in PUT /addresses/:id:', error);
    res.status(500).json({ message: 'Error updating address', error: error.message });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.deleteOne();

    // If the deleted address was default, make another address default if exists
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({ user: req.user.id });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    res.json({ message: 'Address removed' });
  } catch (error) {
    console.error('Error in DELETE /addresses/:id:', error);
    res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
});

module.exports = router; 