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

const DEFAULT_CORS_ORIGINS = 'http://localhost:5173,https://seatbite.vercel.app,*.vercel.app';
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  // Non-browser requests (curl, server-to-server) have no Origin header — allow.
  if (!origin) return true;
  for (const rule of ALLOWED_ORIGINS) {
    if (rule.startsWith('*.')) {
      const suffix = rule.slice(1); // ".vercel.app"
      try {
        if (new URL(origin).hostname.endsWith(suffix)) return true;
      } catch { /* malformed origin URL — fall through */ }
    } else if (rule === origin) {
      return true;
    }
  }
  return false;
}

const app = express();

app.use(cors({
  origin: (origin, cb) => cb(null, isOriginAllowed(origin)),
}));
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
