import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as ticketCtrl from '../controllers/ticketController.js';

const router = Router();

router.post('/', authenticate, ticketCtrl.createTicket);
router.get('/', authenticate, ticketCtrl.getMyTickets);
router.get('/:id', authenticate, ticketCtrl.getTicket);
router.put('/:id', authenticate, ticketCtrl.updateTicket);
router.delete('/:id', authenticate, ticketCtrl.deleteTicket);
router.post('/:id/messages', authenticate, ticketCtrl.addTicketMessage);

export default router;
