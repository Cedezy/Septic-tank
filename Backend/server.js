const express = require("express");
const cors = require("cors");
const connectDB = require('./config/db.js');
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/AuthRoutes.js');
const userRoutes = require('./routes/UserRoutes.js');
const customerRoutes = require('./routes/CustomerRoutes.js');
const bookRoutes = require('./routes/BookRoutes.js');
const serviceType = require('./routes/ServiceRoutes.js');
const aboutRoutes = require('./routes/AboutRoutes.js')  
const contactRoutes = require('./routes/ContactRoutes.js');
const faqsRoutes = require('./routes/FAQsRoutes.js');

dotenv.config(); 
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/service', serviceType);
app.use('/api/stats', serviceType);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
