import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/AuthRoutes.js';
import scanRoutes from './routes/ScanningRoutes.js';
import secretRoutes from './routes/secretRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    status: 429,
    error: 'Too many requests',
    message: 'You have exceeded the 50 requests in 1 minute limit. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});


app.use('/api', apiLimiter);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/mrstm', secretRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
