require('dotenv').config();   // only once, at top

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const passport = require('passport');
require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');


const { backgroundSync } = require('./controllers/movieController');

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["https://house-full-frontend.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(passport.initialize());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log(" Connected to MongoDB Atlas");
})
.catch((err) => {
    console.error(" Mongo connection error:", err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
    res.send(" BookMyShow Clone API is running...");
});

// ===== CRON JOB =====
// Runs every day at 2:00 AM IST
cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled TMDB sync at 2:00 AM...');
    await backgroundSync();
}, {
    timezone: "Asia/Kolkata"
});

console.log(' Scheduled TMDB sync configured (Daily 2:00 AM IST)');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});