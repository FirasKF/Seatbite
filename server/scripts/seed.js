import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Venue from '../models/Venue.js';
import MenuItem from '../models/MenuItem.js';
import Showtime from '../models/Showtime.js';

/* ─────────────────────────────────────────────────────────────
   Source data — copied verbatim from src/App.jsx
   (FALLBACK_MOVIES, ALL_VENUES, MENU). If those change, update
   here too.
   ───────────────────────────────────────────────────────────── */

const FALLBACK_MOVIES = [
  { id: 1,  title: 'Project Hail Mary',         genre: 'Sci-Fi',    rating: 'PG-15', lang: 'EN', poster: '🚀',  chains: ['muvi', 'AMC', 'VOX'] },
  { id: 2,  title: 'Scream 7',                  genre: 'Horror',    rating: 'R18',   lang: 'EN', poster: '😱',  chains: ['muvi', 'AMC', 'VOX'] },
  { id: 3,  title: 'Hoppers',                   genre: 'Animation', rating: 'PG',    lang: 'EN', poster: '🐰',  chains: ['muvi', 'VOX'] },
  { id: 4,  title: 'The Raiders',               genre: 'Action',    rating: 'PG-13', lang: 'EN', poster: '⚔️',  chains: ['AMC', 'VOX'] },
  { id: 5,  title: 'Marty Supreme',             genre: 'Drama',     rating: 'R18',   lang: 'EN', poster: '🏓',  chains: ['muvi', 'VOX'] },
  { id: 6,  title: 'Super Mario Galaxy Movie',  genre: 'Animation', rating: 'PG',    lang: 'EN', poster: '⭐',  chains: ['muvi', 'AMC', 'VOX'] },
  { id: 7,  title: 'Ready or Not 2',            genre: 'Horror',    rating: 'R18',   lang: 'EN', poster: '🎭',  chains: ['AMC', 'VOX'] },
  { id: 8,  title: 'Protector',                 genre: 'Action',    rating: 'R15',   lang: 'EN', poster: '🛡️',  chains: ['muvi', 'AMC'] },
  { id: 9,  title: 'شباب البومب 3',              genre: 'Comedy',    rating: 'PG-12', lang: 'AR', poster: '💣',  chains: ['muvi', 'AMC', 'VOX'] },
  { id: 10, title: 'Family Business',           genre: 'Drama',     rating: 'R15',   lang: 'AR', poster: '👨‍👩‍👦', chains: ['muvi', 'VOX'] },
  { id: 11, title: 'You, Me & Tuscany',         genre: 'Romance',   rating: 'PG-15', lang: 'EN', poster: '🇮🇹',  chains: ['AMC', 'VOX'] },
  { id: 12, title: 'The Strangers: Chapter 3',  genre: 'Horror',    rating: 'R18',   lang: 'EN', poster: '🔪',  chains: ['muvi', 'AMC'] },
];

const ALL_VENUES = {
  muvi: [
    { name: 'Nakheel Mall',    city: 'Riyadh', area: 'Exit 9' },
    { name: 'Mall of Arabia',  city: 'Jeddah', area: 'King Abdulaziz Rd' },
    { name: 'Hayat Mall',      city: 'Riyadh', area: 'Exit 8' },
    { name: 'Al Hamra Mall',   city: 'Riyadh', area: 'Olaya' },
    { name: 'The View',        city: 'Riyadh', area: 'King Fahd Rd' },
    { name: 'U-Walk',          city: 'Riyadh', area: 'Anas Ibn Malik Rd' },
  ],
  AMC: [
    { name: 'KAFD',            city: 'Riyadh',   area: 'King Abdullah Financial District' },
    { name: 'Panorama Mall',   city: 'Riyadh',   area: 'Tahlia St' },
    { name: 'Riyadh Gallery',  city: 'Riyadh',   area: 'King Fahd Rd' },
    { name: 'Stars Avenue',    city: 'Jeddah',   area: 'Madinah Rd' },
    { name: 'Ajdan Walk',      city: 'Al Khobar', area: 'Prince Turkey St' },
  ],
  VOX: [
    { name: 'Riyadh Park',     city: 'Riyadh', area: 'Northern Ring Rd' },
    { name: 'Kingdom Centre',  city: 'Riyadh', area: 'Olaya' },
    { name: 'Red Sea Mall',    city: 'Jeddah', area: 'King Abdulaziz Rd' },
    { name: 'West Avenue Mall', city: 'Dammam', area: 'King Fahd Rd' },
    { name: 'Town Square',     city: 'Jeddah', area: 'Al Andalus' },
    { name: 'The Esplanade',   city: 'Riyadh', area: 'Thumamah Rd' },
  ],
};

const MENU = [
  { id: 1,  name: 'فشار كلاسيك',  nameEn: 'Classic Popcorn',  price: 20, emoji: '🍿', cat: 'snacks' },
  { id: 2,  name: 'فشار كراميل',  nameEn: 'Caramel Popcorn',  price: 25, emoji: '🍿', cat: 'snacks' },
  { id: 3,  name: 'بيبسي',        nameEn: 'Pepsi',            price: 12, emoji: '🥤', cat: 'drinks' },
  { id: 4,  name: 'سلاش توت',     nameEn: 'Berry Slushie',    price: 15, emoji: '🧊', cat: 'drinks' },
  { id: 5,  name: 'سلاش مانجو',   nameEn: 'Mango Slushie',    price: 15, emoji: '🥭', cat: 'drinks' },
  { id: 6,  name: 'ناتشوز',       nameEn: 'Nachos Grande',    price: 28, emoji: '🧀', cat: 'snacks' },
  { id: 7,  name: 'هوت دوق',      nameEn: 'Hot Dog',          price: 22, emoji: '🌭', cat: 'meals' },
  { id: 8,  name: 'برجر',         nameEn: 'Smash Burger',     price: 35, emoji: '🍔', cat: 'meals' },
  { id: 9,  name: 'بطاطس',        nameEn: 'Loaded Fries',     price: 18, emoji: '🍟', cat: 'snacks' },
  { id: 10, name: 'ناقتس دجاج',   nameEn: 'Chicken Nuggets',  price: 25, emoji: '🍗', cat: 'meals' },
  { id: 11, name: 'آيس كريم',     nameEn: 'Ice Cream',        price: 18, emoji: '🍦', cat: 'snacks' },
  { id: 12, name: 'قهوة مثلجة',   nameEn: 'Iced Coffee',      price: 18, emoji: '☕', cat: 'drinks' },
  { id: 13, name: 'ميني بيتزا',   nameEn: 'Mini Pizza',       price: 30, emoji: '🍕', cat: 'meals' },
  { id: 14, name: 'موية',         nameEn: 'Water',            price:  5, emoji: '💧', cat: 'drinks' },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[seed] MONGO_URI not set in server/.env — aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[seed] connected to MongoDB');

  // Clear ONLY these collections — leaves users/orders/anything else untouched.
  await Movie.deleteMany({});
  await Venue.deleteMany({});
  await MenuItem.deleteMany({});
  await Showtime.deleteMany({});
  console.log('[seed] cleared collections: movies, venues, menuitems, showtimes');

  // Strip the positional `id` field from movie/menu source rows — Mongoose generates _id.
  const moviesData = FALLBACK_MOVIES.map(({ id: _id, ...rest }) => rest);
  const menuData   = MENU.map(({ id: _id, ...rest }) => rest);

  // Flatten chain-keyed ALL_VENUES into individual docs that carry `chain`.
  const venuesData = [];
  for (const [chain, list] of Object.entries(ALL_VENUES)) {
    for (const v of list) venuesData.push({ ...v, chain });
  }

  const movies = await Movie.insertMany(moviesData);
  const venues = await Venue.insertMany(venuesData);
  const menu   = await MenuItem.insertMany(menuData);

  console.log(`[seed] inserted ${movies.length} movies`);
  console.log(`[seed] inserted ${venues.length} venues`);
  console.log(`[seed] inserted ${menu.length} menu items`);

  // Showtimes — one per (movie, venue) where movie.chains includes venue.chain,
  // at 13:00 / 17:00 / 21:00 Saudi time (UTC+3, no DST) across the next 3 days.
  const SAUDI_OFFSET_HOURS = 3;
  const TIMES_LOCAL = [13, 17, 21];
  const DAYS = 3;
  const saudiMidnightUtc = (daysOffset) => {
    const now = new Date();
    const saudiNow = new Date(now.getTime() + SAUDI_OFFSET_HOURS * 3600 * 1000);
    const saudiMidnightMs = Date.UTC(
      saudiNow.getUTCFullYear(),
      saudiNow.getUTCMonth(),
      saudiNow.getUTCDate() + daysOffset
    );
    return new Date(saudiMidnightMs - SAUDI_OFFSET_HOURS * 3600 * 1000);
  };
  const dayBases = Array.from({ length: DAYS }, (_, d) => saudiMidnightUtc(d));

  const showtimesData = [];
  for (const movie of movies) {
    for (const venue of venues) {
      if (!movie.chains.includes(venue.chain)) continue;
      for (const base of dayBases) {
        for (const hour of TIMES_LOCAL) {
          showtimesData.push({
            movie: movie._id,
            venue: venue._id,
            startsAt: new Date(base.getTime() + hour * 3600 * 1000),
          });
        }
      }
    }
  }
  const showtimes = await Showtime.insertMany(showtimesData);
  console.log(`[seed] inserted ${showtimes.length} showtimes`);

  await mongoose.disconnect();
  console.log('[seed] done');
}

seed().catch(async (err) => {
  console.error('[seed] failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
