import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { rolesMiddleware } from '@middlewares/roles.middleware';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { addUserRoleSchema, createUserSchema, profileImageSchema, updateUserSchema } from '../validator/user.validator';
import { asyncHandler } from '@utils/async-handler';

const controller = new UserController();
export const userRoutes = Router();

userRoutes.use(authMiddleware);

userRoutes.post('/', rolesMiddleware(['ADMIN']), validationMiddleware(createUserSchema), asyncHandler(controller.create.bind(controller)));
userRoutes.get('/', rolesMiddleware(['ADMIN', 'MANAGER']), asyncHandler(controller.list.bind(controller)));
userRoutes.get('/me', asyncHandler(controller.me.bind(controller)));
userRoutes.get('/:id', asyncHandler(controller.getById.bind(controller)));
userRoutes.patch('/:id', validationMiddleware(updateUserSchema), asyncHandler(controller.patch.bind(controller)));
userRoutes.patch('/:id/roles', rolesMiddleware(['ADMIN']), validationMiddleware(addUserRoleSchema), asyncHandler(controller.addRole.bind(controller)));
userRoutes.delete('/:id', rolesMiddleware(['ADMIN']), asyncHandler(controller.remove.bind(controller)));
userRoutes.post('/:id/profile-image', validationMiddleware(profileImageSchema), asyncHandler(controller.uploadProfileImage.bind(controller)));
userRoutes.get('/:id/profile-image', asyncHandler(controller.getProfileImage.bind(controller)));
