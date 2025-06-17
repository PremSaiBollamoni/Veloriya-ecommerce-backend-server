const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments() || 0;
    
    // Get total orders and revenue
    const orders = await Order.find() || [];
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => {
      const orderTotal = order.totalAmount || 0;
      return sum + orderTotal;
    }, 0);
    
    // Get total categories
    const totalCategories = await Category.countDocuments() || 0;
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProducts,
      totalOrders,
      revenue,
      totalCategories,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
});

// Get all categories
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create new category
router.post('/categories', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name });
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Get all products (admin view)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json({ products: products || [] });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Create new product
router.post('/products', adminAuth, async (req, res) => {
  try {
    const { name, price, originalPrice, description, category, image, features, inStock, featured } = req.body;
    
    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const product = new Product({
      name,
      price,
      originalPrice: originalPrice || undefined,
      description,
      category,
      image,
      features: features || [],
      inStock: inStock ?? true,
      featured: featured ?? false
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Delete product (admin only)
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router; 
