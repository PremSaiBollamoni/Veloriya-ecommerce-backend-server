const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Test user created');

    // Create some test products
    const products = await Product.create([
      {
        name: 'Test Product 1',
        price: 99.99,
        description: 'This is a test product',
        image: 'https://via.placeholder.com/150',
        category: 'Electronics',
        features: ['Feature 1', 'Feature 2']
      },
      {
        name: 'Test Product 2',
        price: 149.99,
        description: 'Another test product',
        image: 'https://via.placeholder.com/150',
        category: 'Electronics',
        features: ['Feature 3', 'Feature 4']
      }
    ]);
    console.log('Test products created');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 