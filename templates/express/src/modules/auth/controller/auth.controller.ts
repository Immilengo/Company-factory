import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { successResponse } from '@utils/response';

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const data = await service.register(req.body);
    res.status(200).json(successResponse(data.message, undefined));
  }

  async login(req: Request, res: Response) {
    const data = await service.login(req.body);
    res.json(successResponse('Login successful', data));
  }

  async logout(req: Request, res: Response) {
    await service.logout(req.body.refreshToken);
    res.json(successResponse('Logout successful'));
  }

  async refresh(req: Request, res: Response) {
    const data = await service.refresh(req.body.refreshToken);
    res.json(successResponse('Token refreshed', data));
  }

  async forgotPassword(req: Request, res: Response) {
    const result = await service.forgotPassword(req.body.email);
    const message = result.sent
      ? 'If the email exists, reset instructions were sent'
      : 'If the email exists, reset token was generated but email could not be sent now';
    res.json(successResponse(message));
  }

  async resetPassword(req: Request, res: Response) {
    await service.resetPassword(req.body.token, req.body.newPassword);
    res.json(successResponse('Password reset successfully'));
  }

  async verifyEmail(req: Request, res: Response) {
    await service.verifyEmail(req.query.token as string);
    res.json(successResponse('Email verified successfully'));
  }

  async resendVerificationEmail(req: Request, res: Response) {
    const result = await service.resendVerificationEmail(req.body.email);
    const message = result.sent
      ? 'Verification email resent'
      : 'Verification token regenerated, but email could not be sent now. Try again shortly.';
    res.json(successResponse(message));
  }
}
