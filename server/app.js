import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import moviesRoutes from './routes/movies.routes.js';
import venuesRoutes from './routes/venues.routes.js';
import menuRoutes from './routes/menu.routes.js';
import authRoutes from './routes/auth.routes.js';
import showtimesRoutes from './routes/showtimes.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import { errorHandler } from './middleware/error.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/health', healthRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/showtimes', showtimesRoutes);
app.use('/api/orders', ordersRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
