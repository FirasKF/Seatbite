import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('[server] JWT_SECRET not set — /api/auth endpoints will fail until set in server/.env');
}

connectDB();

app.listen(PORT, () => {
  console.log(`[server] SeatBite API listening on http://localhost:${PORT}`);
});
