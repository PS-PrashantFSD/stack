const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

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
  origin:'https://manwith.netlify.app',
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logger
app.use(morgan('tiny'));

// Routes
app.use('/auth', authController);
app.use('/details', userDetailsController);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.stack);
    res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
    connect();
    console.log(`Server started on port ${port}`);
});
