import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const register = asyncHandler(async (req, res) => {
  const email = (req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password ?? '';
  const name = (req.body?.name ?? '').trim();

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const user = await User.create({ email, password, name });
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw err;
  }
});

export const login = asyncHandler(async (req, res) => {
  const email = (req.body?.email ?? '').trim().toLowerCase();
  const password = req.body?.password ?? '';

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  // Identical response for "no such user" and "wrong password" — prevents email enumeration.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user);
  return res.json({ user, token });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
