const express = require('express');
const app = express();
const port = 5000;
const { mongoDB, getFoodItems } = require('./db');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());
(async () => {
  try {
    await mongoDB();
    console.log('food_items:', JSON.stringify(global.food_items || [], null, 2));
    console.log('food_category:', JSON.stringify(global.food_category || [], null, 2));

    app.use('/api', require('./Routes/CreateUser'));
    app.use('/api', require('./Routes/DisplayData'));

    app.get('/', async (req, res) => {
      try {
        const data = await getFoodItems();
        res.json({ success: true, data });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB, server not started:', err);
  }
})();
module.exports = app;