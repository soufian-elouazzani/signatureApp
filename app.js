const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const authMiddleware = require("./middlewares/auth");
const axios = require('axios');
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// fetch secrets from vault and set them as environment variables

// async function fetchSecrets() {
//   const response = await axios.get('http://vault:8200/v1/secret/data/app', {
//     headers: { 'X-Vault-Token': 'root' }
//   });
//   console.log("connected to vault")
//   return response.data.data.data;
// }

// fetchSecrets().then(secrets => {
//   process.env.MONGO_URI = secrets.MONGO_URI;
// });


// MongoDB Connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// Authentication routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});