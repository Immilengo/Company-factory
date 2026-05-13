import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import { StatusController } from '../controller/status.controller';
import { createStatusSchema, patchStatusSchema } from '../validator/status.validator';

const controller = new StatusController();
export const statusRoutes = Router();

statusRoutes.use(authMiddleware);
statusRoutes.post('/', rolesMiddleware(['ADMIN']), validationMiddleware(createStatusSchema), asyncHandler(controller.create.bind(controller)));
statusRoutes.get('/', asyncHandler(controller.list.bind(controller)));
statusRoutes.get('/:id', asyncHandler(controller.get.bind(controller)));
statusRoutes.put('/:id', rolesMiddleware(['ADMIN']), validationMiddleware(createStatusSchema), asyncHandler(controller.update.bind(controller)));
statusRoutes.patch('/:id', rolesMiddleware(['ADMIN']), validationMiddleware(patchStatusSchema), asyncHandler(controller.patch.bind(controller)));
statusRoutes.delete('/:id', rolesMiddleware(['ADMIN']), asyncHandler(controller.delete.bind(controller)));
