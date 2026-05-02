import Venue from '../models/Venue.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listVenues = asyncHandler(async (req, res) => {
  const { chain } = req.query;
  const filter = {};
  if (chain) filter.chain = chain;
  const venues = await Venue.find(filter).sort({ chain: 1, name: 1 });
  res.json(venues);
});
