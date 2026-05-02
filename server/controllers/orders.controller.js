import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Showtime from '../models/Showtime.js';
import MenuItem from '../models/MenuItem.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const SEAT_RE = /^[A-J][1-9][0-9]?$/;

const populateOrder = (q) =>
  q
    .populate({ path: 'showtime', populate: [{ path: 'movie' }, { path: 'venue' }] })
    .populate('items.menuItemId');

export const createOrder = asyncHandler(async (req, res) => {
  const { user, guestName, showtime, seat, items } = req.body || {};

  // Required + presence
  if (!showtime) {
    return res.status(400).json({ error: 'showtime is required' });
  }
  if (!seat || typeof seat !== 'string') {
    return res.status(400).json({ error: 'seat is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }
  if (!user && !guestName) {
    return res.status(400).json({ error: 'guestName is required when user is not provided' });
  }

  // Format
  if (!mongoose.Types.ObjectId.isValid(showtime)) {
    return res.status(400).json({ error: 'showtime must be a valid ObjectId' });
  }
  if (user && !mongoose.Types.ObjectId.isValid(user)) {
    return res.status(400).json({ error: 'user must be a valid ObjectId' });
  }
  if (!SEAT_RE.test(seat)) {
    return res.status(400).json({ error: 'seat must match pattern A1..J99' });
  }
  for (const it of items) {
    if (!it || !it.menuItemId || !mongoose.Types.ObjectId.isValid(it.menuItemId)) {
      return res.status(400).json({ error: 'each item must include a valid menuItemId' });
    }
    if (!Number.isInteger(it.qty) || it.qty < 1) {
      return res.status(400).json({ error: 'each item qty must be an integer ≥ 1' });
    }
  }

  // Verify showtime exists
  const showtimeDoc = await Showtime.findById(showtime);
  if (!showtimeDoc) {
    return res.status(404).json({ error: 'Showtime not found' });
  }

  // Compute total server-side from current menu prices — never trust the client.
  const menuIds = items.map((it) => it.menuItemId);
  const menuDocs = await MenuItem.find({ _id: { $in: menuIds } });
  const priceMap = new Map(menuDocs.map((m) => [m._id.toString(), m.price]));
  for (const it of items) {
    if (!priceMap.has(String(it.menuItemId))) {
      return res.status(400).json({ error: `Menu item ${it.menuItemId} not found` });
    }
  }
  const total = items.reduce(
    (sum, it) => sum + priceMap.get(String(it.menuItemId)) * it.qty,
    0
  );

  // Persist
  let order;
  try {
    order = await Order.create({
      user: user || undefined,
      guestName: user ? undefined : guestName,
      showtime,
      seat,
      items: items.map((it) => ({ menuItemId: it.menuItemId, qty: it.qty })),
      total,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Seat already taken' });
    }
    throw err;
  }

  const populated = await populateOrder(Order.findById(order._id));
  return res.status(201).json(populated);
});

export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'order id must be a valid ObjectId' });
  }
  const order = await populateOrder(Order.findById(id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await populateOrder(
    Order.find().sort({ createdAt: -1 }).limit(50)
  );
  res.json(orders);
});

const VALID_STATUSES = ['confirmed', 'preparing', 'onway', 'delivered'];

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'order id must be a valid ObjectId' });
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const populated = await populateOrder(Order.findById(order._id));
  res.json(populated);
});
