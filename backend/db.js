const mongoose = require('mongoose');
const foodData = require('./Food/foodData2.json');
const foodCategoryData = require('./Food/foodCategory.json');

const mongoURI = 'mongodb+srv://foodhub:vamshi04@cluster1.3islf4s.mongodb.net/foodhub?retryWrites=true&w=majority&appName=Cluster1';

// connect to MongoDB and load 'food_items' and 'food_category' into globals
const mongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    const db = mongoose.connection.db;
    const items = await db.collection('food_items').find({}).toArray().catch(() => []);
    const categories = await db.collection('food_category').find({}).toArray().catch(() => []);

    global.food_items = Array.isArray(items) ? items : [];
    global.food_category = Array.isArray(categories) ? categories : [];

    console.log('Loaded counts - food_items:', global.food_items.length, 'food_category:', global.food_category.length);
  } catch (err) {
    console.error('MongoDB connection/read error:', err);
    // leave globals undefined so fallback will be used
    global.food_items = global.food_items || [];
    global.food_category = global.food_category || [];
  }
};

// simple getter: return items from global if available, otherwise fallback to local JSON
const getFoodItems = async (limit = 12, skip = 0) => {
  limit = Number(limit) || 12;
  skip = Number(skip) || 0;
  if (Array.isArray(global.food_items) && global.food_items.length > 0) {
    return global.food_items.slice(skip, skip + limit);
  }
  return Array.isArray(foodData) ? foodData.slice(skip, skip + limit) : [];
};

// getter for categories with fallback to local JSON
const getFoodCategories = async () => {
  if (Array.isArray(global.food_category) && global.food_category.length > 0) {
    return global.food_category;
  }
  return Array.isArray(foodCategoryData) ? foodCategoryData : [];
};

module.exports = { mongoDB, getFoodItems, getFoodCategories };