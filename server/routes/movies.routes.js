import { Router } from 'express';
import { listMovies } from '../controllers/movies.controller.js';

const router = Router();

router.get('/', listMovies);

export default router;
