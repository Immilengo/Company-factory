import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { asyncHandler } from '@utils/async-handler';
import { ImageController } from '../controller/image.controller';
import { createImageSchema } from '../validator/image.validator';

const controller = new ImageController();
export const imageRoutes = Router();

imageRoutes.use(authMiddleware);
imageRoutes.post('/:ownerType/:ownerId', rolesMiddleware(['ADMIN', 'MANAGER']), validationMiddleware(createImageSchema), asyncHandler(controller.create.bind(controller)));
imageRoutes.get('/:ownerType/:ownerId', asyncHandler(controller.list.bind(controller)));
imageRoutes.patch('/:ownerType/:ownerId/:imageId/primary', rolesMiddleware(['ADMIN', 'MANAGER']), asyncHandler(controller.setPrimary.bind(controller)));
imageRoutes.patch('/:imageId/status', rolesMiddleware(['ADMIN', 'MANAGER']), asyncHandler(controller.patchStatus.bind(controller)));
imageRoutes.delete('/:imageId', rolesMiddleware(['ADMIN', 'MANAGER']), asyncHandler(controller.remove.bind(controller)));
