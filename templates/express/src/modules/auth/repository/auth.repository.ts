import { prisma } from '@infra/database/prisma';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase(), deleted: false },
      include: { status: true, roles: { include: { role: true } } }
    });
  }

  async findUserByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: { emailVerificationToken: token, deleted: false },
      include: { status: true, roles: { include: { role: true } } }
    });
  }

  async findUserByResetToken(token: string) {
    return prisma.user.findFirst({
      where: { passwordResetToken: token, deleted: false },
      include: { status: true, roles: { include: { role: true } } }
    });
  }

  async createUser(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    roleId: string;
    statusId: string;
    emailVerificationToken: string;
    emailVerificationExpiresAt: Date;
  }) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone,
        status: { connect: { id: data.statusId } },
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpiresAt: data.emailVerificationExpiresAt,
        roles: { create: [{ role: { connect: { id: data.roleId } } }] }
      },
      include: { status: true, roles: { include: { role: true } } }
    });
  }

  async getRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }

  async getStatusByCode(code: string) {
    return prisma.status.findFirst({ where: { code: code.toUpperCase(), deleted: false } });
  }

  async upsertStatus(code: string, name?: string, description?: string) {
    return prisma.status.upsert({
      where: { code: code.toUpperCase() },
      update: {
        deleted: false,
        name: name ?? code.toUpperCase(),
        description: description ?? `Default status ${code.toUpperCase()}`
      },
      create: {
        code: code.toUpperCase(),
        name: name ?? code.toUpperCase(),
        description: description ?? `Default status ${code.toUpperCase()}`
      }
    });
  }

  async revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false, deleted: false },
      data: { revoked: true }
    });
  }

  async createRefreshToken(params: { userId: string; token: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data: params });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: { token, deleted: false },
      include: { user: { include: { status: true, roles: { include: { role: true } } } } }
    });
  }

  async revokeRefreshToken(id: string, markDeleted = false) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true, ...(markDeleted ? { deleted: true } : {}) }
    });
  }

  async updateUser(id: string, data: {
    password?: string;
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
    emailVerificationExpiresAt?: Date | null;
    passwordResetToken?: string | null;
    passwordResetExpiresAt?: Date | null;
    statusId?: string;
  }) {
    return prisma.user.update({
      where: { id },
      data,
      include: { status: true, roles: { include: { role: true } } }
    });
  }
}
