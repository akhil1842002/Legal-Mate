import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import searchRouter from './routes/search.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import firRouter from './routes/firRoutes.js';
import statsRouter from './routes/statsRoutes.js';
import analysisRouter from './routes/analysisRoutes.js';
import EmbeddingService from './services/embeddingService.js';
import queryRouter from './routes/queryRoutes.js';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { protect } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize model on startup
EmbeddingService.getInstance().catch(err => console.error("Failed to load model:", err));

// Search routes (supporting both for compatibility)
app.use('/search', protect, (req, res, next) => {
    console.log('Search request received on /search');
    next();
}, searchRouter);

app.use('/api/search', protect, (req, res, next) => {
    console.log('Search request received on /api/search');
    next();
}, searchRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/fir', firRouter);
app.use('/api/stats', statsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/queries', queryRouter);

// Error Handling Middleware
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('Legal Search API (Node.js) is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
