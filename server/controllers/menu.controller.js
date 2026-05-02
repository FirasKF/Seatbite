import MenuItem from '../models/MenuItem.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listMenu = asyncHandler(async (req, res) => {
  const { cat } = req.query;
  const filter = {};
  if (cat) filter.cat = cat;
  const items = await MenuItem.find(filter).sort({ cat: 1, createdAt: 1 });
  res.json(items);
});
