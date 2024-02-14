const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authController = require("./controller/authController");
const userDetailsController = require('./controller/userDetailsController');

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// MongoDB Connection
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust according to your frontend's origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static('public/images'));
app.use('/videos', express.static('public/videos')); // Changed to '/videos'

// Routes
app.use('/auth', authController);
app.use('/details', userDetailsController);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start Server
app.listen(port, () => {
    connect();
    console.log(`Server started on port ${port}`);
});
