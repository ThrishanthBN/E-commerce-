// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// connect to MongoDB (make sure mongod is running)
mongoose
  .connect('mongodb://127.0.0.1:27017/ecommerce_demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

/* ========== AUTH APIs ========== */

// register normal user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password, // NOTE: for project only; in real life hash passwords
      phone,
      role: 'user'
    });

    await user.save();
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// login (user or admin)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    return res.json(user); // front-end stores user in localStorage
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* ========== PRODUCT APIs ========== */

// get all products
app.get('/api/products', async (req, res) => {
  try {
    const list = await Product.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// add product (admin)
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price required' });
    }

    const p = new Product({
      name,
      price,
      description,
      imageUrl
    });
    await p.save();
    return res.status(201).json(p);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// delete product (admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid id' });
  }
});

/* ========== ORDER APIs ========== */

// place order (COD)
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ error: 'userId and items required' });
    }

    const total = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    const order = new Order({
      user: userId,
      items,
      address,
      total,
      paymentMethod: 'COD',
      status: 'Placed'
    });

    await order.save();
    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// user: my orders
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// admin: all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
