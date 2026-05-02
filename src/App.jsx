import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from 'qrcode.react';

/*──────────────────────────────────────────────
  FALLBACK DATA — real movies & venues used
  when API is unavailable (local dev)
──────────────────────────────────────────────*/
const FALLBACK_MOVIES = [
  { id: 1, title: "Project Hail Mary", genre: "Sci-Fi", rating: "PG-15", lang: "EN", poster: "🚀", chains: ["muvi", "AMC", "VOX"] },
  { id: 2, title: "Scream 7", genre: "Horror", rating: "R18", lang: "EN", poster: "😱", chains: ["muvi", "AMC", "VOX"] },
  { id: 3, title: "Hoppers", genre: "Animation", rating: "PG", lang: "EN", poster: "🐰", chains: ["muvi", "VOX"] },
  { id: 4, title: "The Raiders", genre: "Action", rating: "PG-13", lang: "EN", poster: "⚔️", chains: ["AMC", "VOX"] },
  { id: 5, title: "Marty Supreme", genre: "Drama", rating: "R18", lang: "EN", poster: "🏓", chains: ["muvi", "VOX"] },
  { id: 6, title: "Super Mario Galaxy Movie", genre: "Animation", rating: "PG", lang: "EN", poster: "⭐", chains: ["muvi", "AMC", "VOX"] },
  { id: 7, title: "Ready or Not 2", genre: "Horror", rating: "R18", lang: "EN", poster: "🎭", chains: ["AMC", "VOX"] },
  { id: 8, title: "Protector", genre: "Action", rating: "R15", lang: "EN", poster: "🛡️", chains: ["muvi", "AMC"] },
  { id: 9, title: "شباب البومب 3", genre: "Comedy", rating: "PG-12", lang: "AR", poster: "💣", chains: ["muvi", "AMC", "VOX"] },
  { id: 10, title: "Family Business", genre: "Drama", rating: "R15", lang: "AR", poster: "👨‍👩‍👦", chains: ["muvi", "VOX"] },
  { id: 11, title: "You, Me & Tuscany", genre: "Romance", rating: "PG-15", lang: "EN", poster: "🇮🇹", chains: ["AMC", "VOX"] },
  { id: 12, title: "The Strangers: Chapter 3", genre: "Horror", rating: "R18", lang: "EN", poster: "🔪", chains: ["muvi", "AMC"] },
];

const ALL_VENUES = {
  muvi: [
    { name: "Nakheel Mall", city: "Riyadh", area: "Exit 9" },
    { name: "Mall of Arabia", city: "Jeddah", area: "King Abdulaziz Rd" },
    { name: "Hayat Mall", city: "Riyadh", area: "Exit 8" },
    { name: "Al Hamra Mall", city: "Riyadh", area: "Olaya" },
    { name: "The View", city: "Riyadh", area: "King Fahd Rd" },
    { name: "U-Walk", city: "Riyadh", area: "Anas Ibn Malik Rd" },
  ],
  AMC: [
    { name: "KAFD", city: "Riyadh", area: "King Abdullah Financial District" },
    { name: "Panorama Mall", city: "Riyadh", area: "Tahlia St" },
    { name: "Riyadh Gallery", city: "Riyadh", area: "King Fahd Rd" },
    { name: "Stars Avenue", city: "Jeddah", area: "Madinah Rd" },
    { name: "Ajdan Walk", city: "Al Khobar", area: "Prince Turkey St" },
  ],
  VOX: [
    { name: "Riyadh Park", city: "Riyadh", area: "Northern Ring Rd" },
    { name: "Kingdom Centre", city: "Riyadh", area: "Olaya" },
    { name: "Red Sea Mall", city: "Jeddah", area: "King Abdulaziz Rd" },
    { name: "West Avenue Mall", city: "Dammam", area: "King Fahd Rd" },
    { name: "Town Square", city: "Jeddah", area: "Al Andalus" },
    { name: "The Esplanade", city: "Riyadh", area: "Thumamah Rd" },
  ],
};

const CHAIN_COLORS = { muvi: "#6c2dc7", AMC: "#c41230", VOX: "#e6007e" };

const NEXT_STATUS = { confirmed: 'preparing', preparing: 'onway', onway: 'delivered' };
const STATUS_BG = {
  confirmed: 'rgba(245,158,11,0.18)',
  preparing: 'rgba(168,85,247,0.18)',
  onway:     'rgba(59,130,246,0.18)',
  delivered: 'rgba(34,197,94,0.18)',
};
const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d.length === 2 ? `${d}/` : d;
};

function getVenuesForMovie(movie, venuesByChain = ALL_VENUES) {
  const chains = movie.chains || ["muvi", "AMC", "VOX"];
  const results = [];
  chains.forEach((ch) => {
    const list = venuesByChain[ch] || [];
    // pick 2-3 random venues per chain
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    shuffled.slice(0, 2 + Math.floor(Math.random() * 2)).forEach((v, i) => {
      results.push({
        ...v,
        id: v.id ?? `${ch}-${i}`,
        chain: `${ch} Cinemas`,
        chainShort: ch,
        color: CHAIN_COLORS[ch] || "#e85d04",
      });
    });
  });
  return results;
}

/*──────────────────────────────────────────────
  STATIC DATA
──────────────────────────────────────────────*/
const MENU = [
  { id: 1, name: "فشار كلاسيك", nameEn: "Classic Popcorn", price: 20, emoji: "🍿", cat: "snacks" },
  { id: 2, name: "فشار كراميل", nameEn: "Caramel Popcorn", price: 25, emoji: "🍿", cat: "snacks" },
  { id: 3, name: "بيبسي", nameEn: "Pepsi", price: 12, emoji: "🥤", cat: "drinks" },
  { id: 4, name: "سلاش توت", nameEn: "Berry Slushie", price: 15, emoji: "🧊", cat: "drinks" },
  { id: 5, name: "سلاش مانجو", nameEn: "Mango Slushie", price: 15, emoji: "🥭", cat: "drinks" },
  { id: 6, name: "ناتشوز", nameEn: "Nachos Grande", price: 28, emoji: "🧀", cat: "snacks" },
  { id: 7, name: "هوت دوق", nameEn: "Hot Dog", price: 22, emoji: "🌭", cat: "meals" },
  { id: 8, name: "برجر", nameEn: "Smash Burger", price: 35, emoji: "🍔", cat: "meals" },
  { id: 9, name: "بطاطس", nameEn: "Loaded Fries", price: 18, emoji: "🍟", cat: "snacks" },
  { id: 10, name: "ناقتس دجاج", nameEn: "Chicken Nuggets", price: 25, emoji: "🍗", cat: "meals" },
  { id: 11, name: "آيس كريم", nameEn: "Ice Cream", price: 18, emoji: "🍦", cat: "snacks" },
  { id: 12, name: "قهوة مثلجة", nameEn: "Iced Coffee", price: 18, emoji: "☕", cat: "drinks" },
  { id: 13, name: "ميني بيتزا", nameEn: "Mini Pizza", price: 30, emoji: "🍕", cat: "meals" },
  { id: 14, name: "موية", nameEn: "Water", price: 5, emoji: "💧", cat: "drinks" },
];

const ORDER_STAGES = [
  { key: "confirmed", labelEn: "Order Confirmed", icon: "✓", desc: "Your order has been received" },
  { key: "preparing", labelEn: "Preparing", icon: "👨‍🍳", desc: "Our team is preparing your items" },
  { key: "onway", labelEn: "On the Way", icon: "🚶", desc: "A runner is heading to your seat" },
  { key: "delivered", labelEn: "Delivered", icon: "🎉", desc: "Enjoy! بالعافية" },
];

const SEAT_ROWS = [
  { row: "A", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "B", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "C", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "D", seats: [1,2,3,0,4,5,6,7,0,8,9,10] },
  { row: "E", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
  { row: "F", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
  { row: "G", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
  { row: "H", seats: [1,2,3,4,0,5,6,7,8,0,9,10,11,12] },
];
const TAKEN = ["A3","A7","B5","B6","C2","C8","D4","E3","E7","E8","F1","F10","G5","G6","H2","H11"];

const GENRE_EMOJI = { Action:"⚔️", Horror:"😱", "Sci-Fi":"🚀", Animation:"🐰", Comedy:"😂", Drama:"🎭", Romance:"💕", Thriller:"🔪", Fantasy:"🐉", Adventure:"🏔️", Family:"👨‍👩‍👦", default:"🎬" };

const font = `'Outfit', sans-serif`;
const fontD = `'Bebas Neue', sans-serif`;
const oc = "#e85d04";

/*──────────────────────────────────────────────
  API HELPER — SeatBite back-end
──────────────────────────────────────────────*/
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

/*──────────────────────────────────────────────
  COMPONENT
──────────────────────────────────────────────*/
export default function SeatBite() {
  const [step, setStep] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [movie, setMovie] = useState(null);
  const [venues, setVenues] = useState([]);
  const [venue, setVenue] = useState(null);
  const [seat, setSeat] = useState(null);
  const [cart, setCart] = useState({});
  const [filter, setFilter] = useState("all");
  const [langF, setLangF] = useState("all");
  const [oStage, setOStage] = useState(0);
  const [loadMsg, setLoadMsg] = useState("Loading catalog...");
  const [menu, setMenu] = useState(MENU);
  const [venuesByChain, setVenuesByChain] = useState(ALL_VENUES);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [wakeBannerDismissed, setWakeBannerDismissed] = useState(false);
  const [showtimeId, setShowtimeId] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilter, setAdminFilter] = useState('all');
  const [fromTicket, setFromTicket] = useState(false);
  const [qrShowtime, setQrShowtime] = useState('');
  const [qrSeat, setQrSeat] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  /* ── Fetch catalog (movies, venues, menu) on mount; fall back per-resource ── */
  useEffect(() => {
    let cancelled = false;
    const msgs = ["Loading catalog...", "Fetching movies...", "Fetching venues...", "Fetching menu...", "Almost ready..."];
    let i = 0;
    const iv = setInterval(() => { i = (i + 1) % msgs.length; if (!cancelled) setLoadMsg(msgs[i]); }, 2200);

    // Render free tier cold-starts in 30–60s. If the catalog hasn't resolved by 5s,
    // surface a wake-up notice so users know to wait instead of seeing CACHED prematurely.
    const wakeTimer = setTimeout(() => {
      if (!cancelled) setWakingUp(true);
    }, 5000);

    (async () => {
      let allOk = true;

      // Movies
      try {
        const data = await apiGet("/movies");
        if (!cancelled) setMovies(data.map((m) => ({ ...m, poster: m.poster || GENRE_EMOJI[m.genre] || GENRE_EMOJI.default })));
      } catch {
        allOk = false;
        if (!cancelled) setMovies(FALLBACK_MOVIES);
      }

      // Venues — normalize flat API array to the same chain-keyed shape as ALL_VENUES
      try {
        const data = await apiGet("/venues");
        const byChain = data.reduce((acc, v) => {
          (acc[v.chain] ||= []).push(v);
          return acc;
        }, {});
        if (!cancelled) setVenuesByChain(byChain);
      } catch {
        allOk = false;
        // venuesByChain stays at its initial ALL_VENUES value
      }

      // Menu
      try {
        const data = await apiGet("/menu");
        if (!cancelled) setMenu(data);
      } catch {
        allOk = false;
        // menu stays at its initial MENU value
      }

      if (!cancelled) {
        setIsLive(allOk);
        setLoadingMovies(false);
        setWakingUp(false);
      }
      clearInterval(iv);
      clearTimeout(wakeTimer);
    })();
    return () => { cancelled = true; clearInterval(iv); clearTimeout(wakeTimer); };
  }, []);

  /* ── On mount: handle ?showtime=&seat= URL params (QR ticket flow) ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stId = params.get('showtime');
    const stSeat = params.get('seat');
    if (!stId || !stSeat) return;
    if (!/^[A-J][1-9][0-9]?$/.test(stSeat)) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/showtimes/${stId}`);
        if (!res.ok) return; // 400/404 → fall back to normal homepage flow silently
        const data = await res.json();
        setMovie(data.movie);
        setVenue(data.venue);
        setShowtimeId(data.id);
        setSeat(stSeat);
        setFromTicket(true);
        setStep(3);
      } catch {
        // network error → fall back silently
      }
    })();
  }, []);

  /* ── Pick venues for a movie from the (pre-loaded) catalog ── */
  const fetchVenues = useCallback((selectedMovie) => {
    setVenues(getVenuesForMovie(selectedMovie, venuesByChain));
  }, [venuesByChain]);

  /* ── Step 2 → 3: pre-fetch the next available showtime for the chosen movie+venue ── */
  const goToMenu = async () => {
    setStep(3);
    if (!movie?.id || !venue?.id) return;
    try {
      const res = await fetch(`${API_BASE}/showtimes?movieId=${movie.id}&venueId=${venue.id}`);
      if (!res.ok) return;
      const showtimes = await res.json();
      if (showtimes.length > 0) setShowtimeId(showtimes[0].id);
    } catch {
      // showtimeId stays null; placeOrder will fall back to the local timeline
    }
  };

  /* ── Step 3 → 4: POST the order. Falls back to the local timeline if the API can't be reached. ── */
  const placeOrder = async () => {
    const goLocal = () => { setStep(5); setOStage(0); };
    if (!showtimeId) return goLocal();
    const items = Object.entries(cart).map(([id, qty]) => ({ menuItemId: id, qty }));
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: 'Guest', showtime: showtimeId, seat, items }),
      });
      if (res.status === 409) {
        alert('Seat just got taken — pick another');
        setSeat(null);
        setStep(2);
        return;
      }
      if (!res.ok) throw new Error(`status ${res.status}`);
      goLocal();
    } catch {
      goLocal();
    }
  };

  /* ── Step 4: Pay click — fake 1.5s processing then run placeOrder ── */
  const handlePay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    placeOrder();
  };

  /* ── Admin: fetch all orders, fired when adminMode flips on ── */
  const fetchAdminOrders = useCallback(async () => {
    setAdminLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) setAdminOrders(await res.json());
    } catch { /* ignore */ }
    finally { setAdminLoading(false); }
  }, []);

  useEffect(() => {
    if (adminMode) fetchAdminOrders();
  }, [adminMode, fetchAdminOrders]);

  /* ── Admin: optimistically update a row, refetch on failure ── */
  const advanceStatus = async (id, status) => {
    setAdminOrders((arr) => arr.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      fetchAdminOrders();
    }
  };

  /* ── Order stage auto-advance ── */
  useEffect(() => {
    if (step === 5 && oStage < 3) { const t = setTimeout(() => setOStage((x) => x + 1), 3000); return () => clearTimeout(t); }
  }, [step, oStage]);

  const tItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const tPrice = Object.entries(cart).reduce((s, [id, q]) => { const it = menu.find((m) => String(m.id) === id); return s + (it ? it.price * q : 0); }, 0);
  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const rem = (id) => setCart((c) => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });
  const fMovies = movies.filter((m) => langF === "all" || m.lang === langF);
  const fMenu = menu.filter((m) => filter === "all" || m.cat === filter);

  /* ── Payment form validation (computed each render — cheap) ── */
  const cardDigits = cardNumber.replace(/\s/g, '');
  const expMatch = cardExpiry.match(/^(\d{2})\/(\d{2})$/);
  const cy = new Date().getFullYear() % 100;
  const paymentValid =
    cardName.trim().length >= 3 &&
    cardDigits.length === 16 &&
    expMatch && +expMatch[1] >= 1 && +expMatch[1] <= 12 &&
    +expMatch[2] >= cy && +expMatch[2] <= cy + 20 &&
    /^\d{3}$/.test(cardCvv);

  /* ── Styles ── */
  const btn = (p = true) => ({ background: p ? `linear-gradient(135deg, ${oc}, #dc2f02)` : "rgba(255,255,255,0.08)", color: "#fff", border: p ? "none" : "1px solid rgba(255,255,255,0.12)", padding: "12px 24px", borderRadius: 10, fontFamily: font, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 });
  const cardSt = (sel) => ({ background: sel ? "rgba(232,93,4,0.15)" : "rgba(255,255,255,0.04)", border: sel ? `2px solid ${oc}` : "2px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer", transition: "all 0.25s" });
  const fbtn = (a) => ({ padding: "6px 14px", borderRadius: 20, border: "none", background: a ? oc : "rgba(255,255,255,0.08)", color: a ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font });
  const stSeat = (st) => {
    const b = { width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: font, transition: "all 0.15s" };
    if (st === "t") return { ...b, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.15)", cursor: "not-allowed" };
    if (st === "s") return { ...b, background: oc, color: "#fff", boxShadow: `0 0 12px rgba(232,93,4,0.5)` };
    return { ...b, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" };
  };
  const glass = { background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginBottom: 16 };
  const Back = ({ to }) => <button onClick={() => setStep(to)} style={{ ...btn(false), padding: "6px 10px", fontSize: 12 }}>←</button>;

  const Skeleton = ({ count = 4 }) => (
    <>{Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "2px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 68, borderRadius: 10, background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ width: "70%", height: 14, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 8, animation: "shimmer 1.5s infinite" }} />
          <div style={{ width: "40%", height: 10, borderRadius: 4, background: "rgba(255,255,255,0.04)", animation: "shimmer 1.5s infinite" }} />
        </div>
      </div>
    ))}</>
  );

  const StatusBadge = () => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isLive ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.08)", border: isLive ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 20, fontSize: 11, color: isLive ? "#22c55e" : "rgba(255,255,255,0.5)", fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#22c55e" : "rgba(255,255,255,0.3)", animation: isLive ? "pulse 1.5s infinite" : "none" }} />
      {isLive ? "LIVE" : "CACHED"}
    </span>
  );

  return (
<div style={{ 
  fontFamily: font, 
  minHeight: "100vh", 
  width: "100vw",
  maxWidth: "100%",      
  background: "#0a0a0f", 
  color: "#f0ece4", 
  position: "relative", 
  overflowX: "hidden"   // Prevents accidental horizontal scrolling
}}>      
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

<header style={{ 
  background: `linear-gradient(135deg, ${oc} 0%, #dc2f02 100%)`, 
  width: "100%", // Ensures the orange bar hits both edges
  position: "sticky", 
  top: 0, 
  zIndex: 100, 
  boxShadow: "0 4px 30px rgba(232,93,4,0.3)" 
}}>
  <div style={{ 
    maxWidth: 520,      // Matches your content width
    margin: "0 auto",   // Centers the inner header content
    padding: "14px 16px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className="sb-header-icon" style={{ background: "#fff", color: oc, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>🍿</div>
      <div className="sb-header-logo" style={{ fontFamily: fontD, fontSize: 28, letterSpacing: 2, lineHeight: 1 }}>SEATBITE</div>
    </div>
    <div className="sb-header-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {tItems > 0 && <span className="sb-header-cart" style={{ background: "rgba(232,93,4,0.15)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{tItems} · {tPrice} ر.س</span>}
      <button className="sb-header-btn" style={{ ...btn(false), padding: "8px 14px", fontSize: 13, background: "rgba(255,255,255,0.15)", border: "none" }} onClick={() => setAdminMode(true)}>Admin</button>
      <button className="sb-header-btn" style={{ ...btn(false), padding: "8px 14px", fontSize: 13, background: "rgba(255,255,255,0.15)", border: "none" }}>تسجيل</button>
    </div>
  </div>
</header>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {[0,1,2,3,4,5].map((i) => <div key={i} style={{ width: step === i ? 32 : 10, height: 10, borderRadius: 5, background: step >= i ? oc : "rgba(255,255,255,0.15)", transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)" }} />)}
        </div>

        {wakingUp && !wakeBannerDismissed && loadingMovies && (
          <div style={{
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
          }}>
            <span>⏳ Waking up server... first request after idle takes 30-60 seconds on the free tier. Hang tight!</span>
            <button onClick={() => setWakeBannerDismissed(true)} aria-label="Dismiss"
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
          </div>
        )}

        {!isLive && !bannerDismissed && !loadingMovies && (
          <div style={{
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
          }}>
            <span>⚠️ Live data unavailable — using local catalog.</span>
            <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss"
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* ═══ STEP 0: Movies ═══ */}
        {step === 0 && <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, color: "#fff" }}>NOW SHOWING 🇸🇦</h1>
            {!loadingMovies && <StatusBadge />}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            {loadingMovies ? loadMsg : `${movies.length} movies · muvi · AMC · VOX`}
          </p>
          {!loadingMovies && <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[["all","All"],["EN","English"],["AR","عربي"]].map(([k,l]) => <button key={k} style={fbtn(langF === k)} onClick={() => setLangF(k)}>{l}</button>)}
          </div>}
          {loadingMovies && <Skeleton count={5} />}
          {!loadingMovies && fMovies.map((m) => (
            <div key={m.id} style={cardSt(movie?.id === m.id)} onClick={() => setMovie(m)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 68, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{m.poster}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{m.genre} · {m.rating} · {m.lang}</div>
                  {m.chains && <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {m.chains.map((c) => <span key={c} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${CHAIN_COLORS[c] || "#555"}25`, color: CHAIN_COLORS[c] || "#aaa", fontWeight: 600 }}>{c}</span>)}
                  </div>}
                </div>
                {movie?.id === m.id && <div style={{ color: oc, fontSize: 20 }}>●</div>}
              </div>
            </div>
          ))}
          {!loadingMovies && <button style={{ ...btn(), width: "100%", justifyContent: "center", marginTop: 12, opacity: movie ? 1 : 0.4 }} disabled={!movie} onClick={() => { setStep(1); fetchVenues(movie); }}>Find Cinemas Showing This →</button>}
        </>}

        {/* ═══ STEP 1: Venues ═══ */}
        {step === 1 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Back to={0} /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{movie.title}</span></div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>WHERE TO WATCH</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            {`${venues.length} venues showing "${movie.title}"`}
          </p>
          {venues.map((v) => (
            <div key={v.id} style={cardSt(venue?.id === v.id)} onClick={() => setVenue(v)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{v.area} · {v.city}</div>
                </div>
                <span style={{ fontSize: 11, color: v.color, background: `${v.color}20`, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{v.chainShort}</span>
              </div>
            </div>
          ))}
          {venues.length > 0 && <button style={{ ...btn(), width: "100%", justifyContent: "center", marginTop: 12, opacity: venue ? 1 : 0.4 }} disabled={!venue} onClick={() => setStep(2)}>Choose Your Seat →</button>}
        </>}

        {/* ═══ STEP 2: Seat ═══ */}
        {step === 2 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Back to={1} /><span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{venue.chainShort} · {venue.name}</span></div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>CHOOSE YOUR SEAT</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>Select the seat you're currently sitting in</p>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ width: "70%", height: 4, margin: "0 auto 6px", background: `linear-gradient(90deg, transparent, rgba(232,93,4,0.4), transparent)`, borderRadius: 2 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 3 }}>الشاشة · SCREEN</span>
          </div>
          <div className="sb-seat-grid" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 16 }}>
            {SEAT_ROWS.map(({ row, seats }) => (
              <div key={row} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 16, fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "right", marginRight: 4 }}>{row}</span>
                {seats.map((se, i) => se === 0 ? <div key={`g${i}`} style={{ width: 20 }} /> : (
                  <button key={`${row}${se}`} style={stSeat(TAKEN.includes(`${row}${se}`) ? "t" : seat === `${row}${se}` ? "s" : "o")}
                    disabled={TAKEN.includes(`${row}${se}`)} onClick={() => setSeat(`${row}${se}`)}>{se}</button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            {[["Available","rgba(255,255,255,0.12)"],["Your Seat",oc],["Occupied","rgba(255,255,255,0.06)"]].map(([l,c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />{l}
              </div>
            ))}
          </div>
          {seat && <div style={{ textAlign: "center", marginBottom: 8, fontSize: 14 }}>You're in seat <strong style={{ color: oc }}>{seat}</strong></div>}
          <button style={{ ...btn(), width: "100%", justifyContent: "center", opacity: seat ? 1 : 0.4 }} disabled={!seat} onClick={() => goToMenu()}>Order to My Seat →</button>
        </>}

        {/* ═══ STEP 3: Menu ═══ */}
        {step === 3 && <>
          {fromTicket && (
            <div style={{ background: "rgba(232,93,4,0.15)", border: "1px solid rgba(232,93,4,0.3)", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600, display: "inline-flex", alignItems: "center", marginBottom: 12 }}>
              From your ticket: {seat} at {venue.name}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>{!fromTicket && <Back to={2} />}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Seat {seat} · {venue.name}</span></div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>SNACKS & DRINKS 🍿</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>نوصلك لمقعدك · Delivered to seat {seat}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[["all","الكل"],["snacks","سناكس"],["meals","وجبات"],["drinks","مشروبات"]].map(([k,l]) => <button key={k} style={fbtn(filter === k)} onClick={() => setFilter(k)}>{l}</button>)}
          </div>
          {fMenu.map((item) => (
            <div key={item.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.nameEn}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: oc, fontWeight: 600 }}>{item.price} ر.س</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cart[item.id] ? <>
                  <button style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }} onClick={() => rem(item.id)}>−</button>
                  <span style={{ fontWeight: 600, minWidth: 18, textAlign: "center" }}>{cart[item.id]}</span>
                  <button style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }} onClick={() => add(item.id)}>+</button>
                </> : <button style={{ ...btn(), padding: "6px 14px", fontSize: 12 }} onClick={() => add(item.id)}>Add</button>}
              </div>
            </div>
          ))}
          {tItems > 0 && (
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px", zIndex: 50 }}>
              <div style={{ maxWidth: 520, margin: "0 auto" }}>
                <button style={{ ...btn(), width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15 }} onClick={() => setStep(4)}>اطلب الآن · {tPrice} ر.س</button>
              </div>
            </div>
          )}
        </>}

        {/* ═══ STEP 4: Payment ═══ */}
        {step === 4 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Back to={3} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Seat {seat} · {tItems} items · {tPrice} ر.س</span>
          </div>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>PAYMENT · الدفع</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>ادفع لتأكيد طلبك · Pay to confirm your order</p>

          <div style={glass}>
            <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Order Summary</div>
            {Object.entries(cart).map(([id, qty]) => { const it = menu.find((m) => String(m.id) === id); return it ? (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "rgba(255,255,255,0.6)" }}>
                <span>{it.emoji} {it.nameEn} × {qty}</span><span>{it.price * qty} ر.س</span>
              </div>
            ) : null; })}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>المجموع · Total</span><span style={{ color: oc }}>{tPrice} ر.س</span>
            </div>
          </div>

          <div style={glass}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Card Details</div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Cardholder Name</label>
            <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="As shown on card"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, fontFamily: font, width: "100%", outline: "none", boxSizing: "border-box" }} />
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginTop: 12, marginBottom: 6 }}>Card Number</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} placeholder="4242 4242 4242 4242" inputMode="numeric"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, fontFamily: font, width: "100%", outline: "none", boxSizing: "border-box", letterSpacing: 1 }} />
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Expiry</label>
                <input value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, fontFamily: font, width: "100%", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>CVV</label>
                <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} placeholder="123" inputMode="numeric"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, fontFamily: font, width: "100%", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...btn(false), flex: 1, justifyContent: "center" }} onClick={() => setStep(3)}>Cancel</button>
            <button disabled={!paymentValid} onClick={handlePay}
              style={{ ...btn(), flex: 2, justifyContent: "center", padding: "14px 24px", fontSize: 15, opacity: paymentValid ? 1 : 0.4, cursor: paymentValid ? "pointer" : "not-allowed" }}>
              Pay {tPrice} ر.س
            </button>
          </div>

          {processing && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", zIndex: 200, gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: oc, animation: "spin 0.8s linear infinite" }} />
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Processing payment...</div>
            </div>
          )}
        </>}

        {/* ═══ STEP 5: Order Timeline ═══ */}
        {step === 5 && <>
          <h1 style={{ fontFamily: fontD, fontSize: 32, letterSpacing: 1.5, marginBottom: 4, color: "#fff" }}>!تم الطلب</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>Delivering to seat {seat} · {venue.name}, {venue.city}</p>
          <div style={glass}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{movie.title} · {venue.chain}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>{venue.name} · {venue.area}</div>
            {ORDER_STAGES.map((st, i) => (
              <div key={st.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: oStage > i ? oc : oStage === i ? "rgba(232,93,4,0.2)" : "rgba(255,255,255,0.06)", border: oStage === i ? `2px solid ${oc}` : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.6s", flexShrink: 0 }}>
                    {oStage >= i ? st.icon : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: oStage >= i ? "#fff" : "rgba(255,255,255,0.25)" }}>{st.labelEn}</div>
                    <div style={{ fontSize: 12, color: oStage >= i ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)" }}>{st.desc}</div>
                  </div>
                  {oStage === i && i < 3 && <div style={{ width: 8, height: 8, borderRadius: "50%", background: oc, animation: "pulse 1.5s infinite" }} />}
                </div>
                {i < ORDER_STAGES.length - 1 && <div style={{ width: 3, height: 36, background: oStage > i ? oc : "rgba(255,255,255,0.08)", marginLeft: 17, transition: "background 0.6s" }} />}
              </div>
            ))}
          </div>
          <div style={glass}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Your Items</div>
            {Object.entries(cart).map(([id, qty]) => { const it = menu.find((m) => String(m.id) === id); return it ? (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "rgba(255,255,255,0.6)" }}>
                <span>{it.emoji} {it.nameEn} × {qty}</span><span>{it.price * qty} ر.س</span>
              </div>
            ) : null; })}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>المجموع · Total</span><span style={{ color: oc }}>{tPrice} ر.س</span>
            </div>
          </div>
          <button style={{ ...btn(false), width: "100%", justifyContent: "center", marginTop: 8 }}
            onClick={() => { setStep(0); setMovie(null); setVenue(null); setSeat(null); setCart({}); setOStage(0); setShowtimeId(null); setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setFromTicket(false); if (window.location.search) window.history.replaceState({}, '', '/'); }}>
            طلب جديد · New Order
          </button>
        </>}
      </div>

      {adminMode && (
        <div style={{ position: "fixed", inset: 0, background: "#0a0a0f", zIndex: 1000, overflow: "auto", padding: 24, fontFamily: font, color: "#f0ece4" }}>
          <div className="sb-admin-inner" style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h1 style={{ fontFamily: fontD, fontSize: 36, letterSpacing: 2, color: "#fff" }}>ADMIN DASHBOARD</h1>
              <button style={{ ...btn(false), padding: "8px 16px" }} onClick={() => setAdminMode(false)}>← Back to Site</button>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <select value={adminFilter} onChange={(e) => setAdminFilter(e.target.value)}
                style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, fontFamily: font }}>
                <option value="all">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="onway">On the Way</option>
                <option value="delivered">Delivered</option>
              </select>
              <button style={{ ...btn(false), padding: "8px 14px" }} onClick={fetchAdminOrders}>↻ Refresh</button>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {adminOrders.filter((o) => adminFilter === 'all' || o.status === adminFilter).length} orders
              </span>
            </div>
            {adminLoading ? (
              <div style={{ color: "rgba(255,255,255,0.5)", padding: 20, textAlign: "center" }}>Loading...</div>
            ) : (
              <table className="sb-admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                    {["Order ID","Customer","Movie","Venue","Seat","Items","Total","Status","Action"].map((h) => (
                      <th key={h} style={{ padding: "10px 8px", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.filter((o) => adminFilter === 'all' || o.status === adminFilter).map((o) => (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 8px", fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{o.id?.slice(-6)}</td>
                      <td style={{ padding: "10px 8px" }}>{o.guestName || (o.user ? "User" : "—")}</td>
                      <td style={{ padding: "10px 8px" }}>{o.showtime?.movie?.title || "—"}</td>
                      <td style={{ padding: "10px 8px" }}>{o.showtime?.venue?.name || "—"}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>{o.seat}</td>
                      <td style={{ padding: "10px 8px", fontSize: 12 }}>
                        {o.items?.map((it) => `${it.menuItemId?.nameEn || '?'} ×${it.qty}`).join(', ')}
                      </td>
                      <td style={{ padding: "10px 8px", color: oc, fontWeight: 600 }}>{o.total} ر.س</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ background: STATUS_BG[o.status] || "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{o.status}</span>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        {NEXT_STATUS[o.status] && (
                          <button style={{ ...btn(), padding: "5px 10px", fontSize: 11 }} onClick={() => advanceStatus(o.id, NEXT_STATUS[o.status])}>
                            Mark {NEXT_STATUS[o.status]}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* QR generator — separate section below the orders table */}
            <div style={{ marginTop: 32, padding: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
              <h2 style={{ fontFamily: fontD, fontSize: 24, letterSpacing: 1.5, color: "#fff", marginTop: 0, marginBottom: 12 }}>GENERATE SEAT QR</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Generate a printable QR for a physical seat ticket. Scanning it lands on the menu with showtime and seat pre-loaded.</p>

              <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Showtime ID</label>
                  <input value={qrShowtime} onChange={(e) => setQrShowtime(e.target.value.trim())} placeholder="paste a showtime _id"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Seat</label>
                  <input value={qrSeat} onChange={(e) => setQrSeat(e.target.value.toUpperCase().slice(0, 3))} placeholder="A1"
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button onClick={() => {
                    if (!qrShowtime || !/^[A-J][1-9][0-9]?$/.test(qrSeat)) {
                      alert('Need a showtime ID and a valid seat (e.g. A1, J99).');
                      return;
                    }
                    setQrUrl(`https://seatbite.vercel.app/?showtime=${encodeURIComponent(qrShowtime)}&seat=${encodeURIComponent(qrSeat)}`);
                  }} style={{ ...btn(), padding: "8px 14px", fontSize: 12 }}>Generate QR</button>
                </div>
              </div>

              {qrUrl && (
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginTop: 12 }}>
                  <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
                    <QRCodeSVG value={qrUrl} size={160} />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>URL</div>
                    <div style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.85)", wordBreak: "break-all", marginBottom: 10, padding: 10, background: "rgba(0,0,0,0.3)", borderRadius: 6 }}>{qrUrl}</div>
                    <button onClick={() => navigator.clipboard.writeText(qrUrl)} style={{ ...btn(false), padding: "6px 12px", fontSize: 12 }}>Copy URL</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
  @keyframes shimmer { 0%{opacity:0.3} 50%{opacity:0.6} 100%{opacity:0.3} }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── Mobile responsiveness (M6 rubric) ─── */
  @media (max-width: 768px) {
    /* Header: tighten everything so logo + cart + Admin + تسجيل fit on a phone */
    .sb-header-actions { gap: 6px !important; }
    .sb-header-logo    { font-size: 22px !important; letter-spacing: 1px !important; }
    .sb-header-icon    { width: 30px !important; height: 30px !important; font-size: 16px !important; }
    .sb-header-cart    { padding: 2px 8px !important; font-size: 10px !important; }
    .sb-header-btn     { padding: 5px 9px !important; font-size: 11px !important; }

    /* Admin overlay: let the wide table scroll horizontally instead of squishing 9 columns */
    .sb-admin-inner    { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
    .sb-admin-table    { min-width: 900px !important; }
  }

  @media (max-width: 540px) {
    /* Seat picker: rows E–H are ~512px wide; scroll horizontally on phones */
    .sb-seat-grid      { overflow-x: auto !important; align-items: flex-start !important; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
  }
  
  /* The ultimate reset for React/Vite/Next apps */
  html, body, #root { 
    margin: 0; 
    padding: 0; 
    width: 100%; 
    overflow-x: hidden; 
  }
  
  * { box-sizing: border-box; }
  button:hover { filter: brightness(1.1); }`}</style>
    </div>
  );
}
