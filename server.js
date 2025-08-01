// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const trailerRoutes = require('./routes/trailerRoutes');
const componentRoutes = require('./routes/componentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trailers', trailerRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        const uriPart = process.env.MONGO_URI.includes('@') ? process.env.MONGO_URI.split('@')[1] : process.env.MONGO_URI;
        const dbName = uriPart.includes('?') ? uriPart.split('?')[0] : uriPart;
        console.log('Connecting to MongoDB Database');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
