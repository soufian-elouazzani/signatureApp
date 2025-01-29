const express = require('express');
const path = require('path');
const authMiddleware = require('./middlewares/auth');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Protect the generateKeys and sign routes and js files
app.use('/generateKeys.html', authMiddleware.authenticateToken, express.static(path.join(__dirname, 'public/generateKeys.html')));
app.use('/sign.html', authMiddleware.authenticateToken, express.static(path.join(__dirname, 'public/sign.html')));
app.use('/js/generateKeys.js', authMiddleware.authenticateToken, express.static(path.join(__dirname, 'public/js/generateKeys.js')));
app.use('/js/sign.js', authMiddleware.authenticateToken, express.static(path.join(__dirname, 'public/js/sign.js')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});