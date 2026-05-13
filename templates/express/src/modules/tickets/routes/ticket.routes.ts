import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import { TicketController } from '../controller/ticket.controller';
import { createTicketSchema, patchTicketSchema, patchTicketStatusSchema } from '../validator/ticket.validator';

const controller = new TicketController();
export const ticketRoutes = Router();

ticketRoutes.use(authMiddleware);
ticketRoutes.post('/', validationMiddleware(createTicketSchema), asyncHandler(controller.create.bind(controller)));
ticketRoutes.get('/', asyncHandler(controller.list.bind(controller)));
ticketRoutes.get('/:id', asyncHandler(controller.get.bind(controller)));
ticketRoutes.patch('/:id', validationMiddleware(patchTicketSchema), asyncHandler(controller.patch.bind(controller)));
ticketRoutes.patch('/:id/status', validationMiddleware(patchTicketStatusSchema), asyncHandler(controller.patchStatus.bind(controller)));
ticketRoutes.delete('/:id', asyncHandler(controller.remove.bind(controller)));
