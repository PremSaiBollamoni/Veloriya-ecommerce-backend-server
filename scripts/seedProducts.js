require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Import product data
const electronicsData = require('../data/products/electronics.json');
const computersData = require('../data/products/computers.json');
const accessoriesData = require('../data/products/accessories.json');
const photographyData = require('../data/products/photography.json');
const wearablesData = require('../data/products/wearables.json');
const fashionData = require('../data/products/fashion.json');
const homeData = require('../data/products/home.json');
const beautyData = require('../data/products/beauty.json');

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing products
    await Product.deleteMany({});
    console.log('Deleted existing products');

    // Combine all products
    const allProducts = [
      ...electronicsData.products,
      ...computersData.products,
      ...accessoriesData.products,
      ...photographyData.products,
      ...wearablesData.products,
      ...fashionData.products,
      ...homeData.products,
      ...beautyData.products
    ];

    // Insert new products
    await Product.insertMany(allProducts);
    console.log(`Seeded ${allProducts.length} products`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts(); 