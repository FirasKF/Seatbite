import Movie from '../models/Movie.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listMovies = asyncHandler(async (_req, res) => {
  const movies = await Movie.find().sort({ createdAt: 1 });
  res.json(movies);
});
