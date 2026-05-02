import { Router } from 'express';
import { listMenu } from '../controllers/menu.controller.js';

const router = Router();

router.get('/', listMenu);

export default router;
