import { Router } from 'express';
import { RoleController } from '../controller/role.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { createRoleSchema, patchRoleSchema } from '../validator/role.validator';
import { asyncHandler } from '@utils/async-handler';

const controller = new RoleController();
export const roleRoutes = Router();

roleRoutes.use(authMiddleware);
roleRoutes.post('/', rolesMiddleware(['ADMIN']), validationMiddleware(createRoleSchema), asyncHandler(controller.create.bind(controller)));
roleRoutes.get('/', asyncHandler(controller.list.bind(controller)));
roleRoutes.get('/:id', asyncHandler(controller.get.bind(controller)));
roleRoutes.put('/:id', rolesMiddleware(['ADMIN']), validationMiddleware(createRoleSchema), asyncHandler(controller.update.bind(controller)));
roleRoutes.patch('/:id', rolesMiddleware(['ADMIN']), validationMiddleware(patchRoleSchema), asyncHandler(controller.patch.bind(controller)));
roleRoutes.delete('/:id', rolesMiddleware(['ADMIN']), asyncHandler(controller.delete.bind(controller)));
