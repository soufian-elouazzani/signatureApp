const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const secretKey = process.env.SECRET_KEY || 'defaultsecretkey';

// Simulated user data
const users = [
  { id: 1, username: 'user', password: bcrypt.hashSync('user', 10) },
  { id: 2, username: 'admin', password: bcrypt.hashSync('admin', 10) }
];

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// Registration route
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ id: users.length + 1, username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
});

module.exports = router;