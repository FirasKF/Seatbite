import { Router } from 'express';
import { listVenues } from '../controllers/venues.controller.js';

const router = Router();

router.get('/', listVenues);

export default router;
