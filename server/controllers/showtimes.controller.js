import mongoose from 'mongoose';
import Showtime from '../models/Showtime.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listShowtimes = asyncHandler(async (req, res) => {
  const { movieId, venueId } = req.query;

  if (!movieId || !venueId) {
    return res.status(400).json({ error: 'movieId and venueId query params are required' });
  }
  if (!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(venueId)) {
    return res.status(400).json({ error: 'movieId and venueId must be valid ObjectIds' });
  }

  const showtimes = await Showtime.find({ movie: movieId, venue: venueId }).sort({ startsAt: 1 });
  res.json(showtimes);
});

export const getTakenSeats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'showtime id must be a valid ObjectId' });
  }

  const showtime = await Showtime.findById(id);
  if (!showtime) {
    return res.status(404).json({ error: 'Showtime not found' });
  }

  const seats = await Order.distinct('seat', { showtime: id });
  res.json(seats);
});
