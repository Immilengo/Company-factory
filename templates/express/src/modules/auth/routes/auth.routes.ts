import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import { validationMiddleware } from '@middlewares/validation.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resendVerificationEmailSchema,
  resetPasswordSchema
} from '../validator/auth.validator';
import { asyncHandler } from '@utils/async-handler';

const controller = new AuthController();
export const authRoutes = Router();

authRoutes.post('/register', validationMiddleware(registerSchema), asyncHandler(controller.register.bind(controller)));
authRoutes.post('/login', validationMiddleware(loginSchema), asyncHandler(controller.login.bind(controller)));
authRoutes.post('/logout', validationMiddleware(refreshSchema), asyncHandler(controller.logout.bind(controller)));
authRoutes.post('/refresh', validationMiddleware(refreshSchema), asyncHandler(controller.refresh.bind(controller)));
authRoutes.post(
  '/forgot-password',
  validationMiddleware(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword.bind(controller))
);
authRoutes.post(
  '/reset-password',
  validationMiddleware(resetPasswordSchema),
  asyncHandler(controller.resetPassword.bind(controller))
);
authRoutes.get('/verify-email', asyncHandler(controller.verifyEmail.bind(controller)));
authRoutes.post(
  '/resend-verification-email',
  validationMiddleware(resendVerificationEmailSchema),
  asyncHandler(controller.resendVerificationEmail.bind(controller))
);
