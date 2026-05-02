import { Router } from 'express';
import { createOrder, getOrder, listOrders } from '../controllers/orders.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);

export default router;
