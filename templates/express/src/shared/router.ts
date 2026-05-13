import { Router } from 'express';
import { authRoutes } from '@modules/auth/routes/auth.routes';
import { userRoutes } from '@modules/users/routes/user.routes';
import { roleRoutes } from '@modules/roles/routes/role.routes';
import { statusRoutes } from '@modules/statuses/routes/status.routes';
import { ticketRoutes } from '@modules/tickets/routes/ticket.routes';
import { imageRoutes } from '@modules/images/routes/image.routes';

export const router = Router();

router.use('/public/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/roles', roleRoutes);
router.use('/api/statuses', statusRoutes);
router.use('/api/tickets', ticketRoutes);
router.use('/api/images', imageRoutes);
