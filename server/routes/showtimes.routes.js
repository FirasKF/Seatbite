import { Router } from 'express';
import { listShowtimes, getShowtime, getTakenSeats } from '../controllers/showtimes.controller.js';

const router = Router();

router.get('/', listShowtimes);
router.get('/:id', getShowtime);
router.get('/:id/taken-seats', getTakenSeats);

export default router;
