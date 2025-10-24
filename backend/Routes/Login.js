const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/login
// body: { name: string, password?: string }
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const user = await User.findOne({ name: name });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // optional: simple password check if you store passwords (replace with hashed check in production)
    if (user.password && password) {
      if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    }

    // return minimal info (client will store unique id)
    return res.json({ id: user._id, name: user.name, email: user.email || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;