import bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import ms from 'ms';
import { AppError } from '@errors/app-error';
import { EmailService } from '@modules/email/service/email.service';
import { AuditService } from '@modules/audit/service/audit.service';
import { env } from '@config/env';
import { AuthRepository } from '../repository/auth.repository';
import { TokenService } from './token.service';
import { toAuthUserOutput } from '../mapper/auth.mapper';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export class AuthService {
  constructor(
    private readonly repository = new AuthRepository(),
    private readonly tokenService = new TokenService(),
    private readonly emailService = new EmailService(),
    private readonly audit = new AuditService()
  ) {}

  private async getOrCreateStatus(code: string) {
    const existing = await this.repository.getStatusByCode(code);
    if (existing) return existing;
    return this.repository.upsertStatus(code);
  }

  private ensureActiveAndVerified(user: { emailVerified: boolean; status: { code: string } | null }) {
    if (!user.emailVerified) {
      throw new AppError('Email not verified. Please verify your account before login.', 400);
    }
    if (!user.status || user.status.code.toUpperCase() !== 'ACTIVE') {
      throw new AppError('Account is not active. Please contact support.', 400);
    }
  }

  private generateOpaqueToken() {
    return randomBytes(48).toString('base64url');
  }

  private async issueTokens(user: { id: string; email: string; roles: { role: { name: string } }[] }) {
    await this.repository.revokeAllRefreshTokens(user.id);

    const payload = { sub: user.id, email: user.email, roles: user.roles.map((x) => x.role.name) };
    const accessToken = this.tokenService.signAccess(payload);
    const refreshToken = `${randomUUID()}.${randomUUID()}`;

    await this.repository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + ms(env.JWT_REFRESH_EXPIRATION))
    });

    return { accessToken, refreshToken };
  }

  async register(input: RegisterDto) {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) throw new AppError('Email already in use', 400);

    const userRole = await this.repository.getRoleByName('USER');
    if (!userRole) throw new AppError('Default role not configured', 500);

    const pendingStatus = await this.getOrCreateStatus('PENDING');
    const hashed = await bcrypt.hash(input.password, 12);
    const emailVerificationToken = this.generateOpaqueToken();

    const user = await this.repository.createUser({
      ...input,
      password: hashed,
      roleId: userRole.id,
      statusId: pendingStatus.id,
      emailVerificationToken,
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS)
    });

    const sent = await this.sendVerificationEmail(user.email, emailVerificationToken);
    await this.audit.log({ userId: user.id, action: 'REGISTER', resource: 'AUTH', resourceId: user.id });

    return {
      user: toAuthUserOutput(user),
      message: sent
        ? 'User registered successfully. Verification email sent.'
        : 'User registered successfully, but verification email could not be sent now. Use resend verification endpoint.'
    };
  }

  async login(input: LoginDto) {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user) throw new AppError('Invalid credentials', 400);

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 400);

    this.ensureActiveAndVerified(user);
    const tokens = await this.issueTokens(user);
    await this.audit.log({ userId: user.id, action: 'LOGIN', resource: 'AUTH', resourceId: user.id });
    return tokens;
  }

  async logout(refreshToken: string) {
    const token = await this.repository.findRefreshToken(refreshToken);
    if (!token) throw new AppError('Invalid refresh token', 400);
    await this.repository.revokeRefreshToken(token.id, true);
  }

  async refresh(refreshToken: string) {
    const token = await this.repository.findRefreshToken(refreshToken);
    if (!token || token.revoked) throw new AppError('Invalid refresh token', 400);
    if (!token.expiresAt || token.expiresAt.getTime() <= Date.now()) {
      await this.repository.revokeRefreshToken(token.id);
      throw new AppError('Refresh token expired. Please login again.', 400);
    }

    this.ensureActiveAndVerified(token.user);
    await this.repository.revokeRefreshToken(token.id);
    return this.issueTokens(token.user);
  }

  async forgotPassword(email: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      return { sent: false };
    }

    const token = this.generateOpaqueToken();
    await this.repository.updateUser(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    });

    const sent = await this.sendResetPasswordEmail(user.email, token);
    return { sent };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.repository.findUserByResetToken(token);
    if (!user) throw new AppError('Invalid reset token', 400);

    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() <= Date.now()) {
      await this.repository.updateUser(user.id, { passwordResetToken: null, passwordResetExpiresAt: null });
      throw new AppError('Reset token expired. Please request a new password reset.', 400);
    }

    const hashed = await bcrypt.hash(password, 12);
    await this.repository.updateUser(user.id, {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    });
  }

  async verifyEmail(token: string) {
    const user = await this.repository.findUserByVerificationToken(token);
    if (!user) throw new AppError('Invalid verification token', 400);

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() <= Date.now()) {
      await this.repository.updateUser(user.id, { emailVerificationToken: null, emailVerificationExpiresAt: null });
      throw new AppError('Verification token expired. Please request a new verification email.', 400);
    }

    const activeStatus = await this.getOrCreateStatus('ACTIVE');
    await this.repository.updateUser(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
      statusId: activeStatus.id
    });
  }

  async resendVerificationEmail(email: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user) throw new AppError('User not found', 400);
    if (user.emailVerified) throw new AppError('Email is already verified', 400);

    const token = this.generateOpaqueToken();
    await this.repository.updateUser(user.id, {
      emailVerificationToken: token,
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS)
    });

    const sent = await this.sendVerificationEmail(user.email, token);
    return { sent };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const link = `${env.APP_PUBLIC_BASE_URL}/public/auth/verify-email?token=${token}`;
    try {
      await this.emailService.send({
        to: email,
        subject: 'Verificacao de conta',
        html: `Use este link para verificar a sua conta: ${link}`
      });
      return true;
    } catch {
      return false;
    }
  }

  private async sendResetPasswordEmail(email: string, token: string) {
    const link = `${env.APP_PUBLIC_BASE_URL}/public/auth/reset-password?token=${token}`;
    try {
      await this.emailService.send({
        to: email,
        subject: 'Recuperacao de senha',
        html: `Use este link para redefinir a sua senha: ${link}`
      });
      return true;
    } catch {
      return false;
    }
  }
}
