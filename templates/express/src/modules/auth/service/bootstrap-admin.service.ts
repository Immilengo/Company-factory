import bcrypt from 'bcrypt';
import { env } from '@config/env';
import { prisma } from '@infra/database/prisma';
import { logger } from '@utils/logger';

export const bootstrapAdmin = async () => {
  const roles = ['ADMIN', 'USER', 'MANAGER'];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: { deleted: false },
      create: { name: role, description: `${role} system role`, deleted: false }
    });
  }

  const statuses = ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING', 'DELETED'];
  for (const code of statuses) {
    await prisma.status.upsert({
      where: { code },
      update: { deleted: false },
      create: { code, name: code, description: `Default status ${code}` }
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const activeStatus = await prisma.status.findUnique({ where: { code: 'ACTIVE' } });
  if (!adminRole || !activeStatus) return;

  const hashed = await bcrypt.hash(env.DEFAULT_ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: env.DEFAULT_ADMIN_EMAIL.toLowerCase() },
    update: {
      password: hashed,
      emailVerified: true,
      statusId: activeStatus.id,
      deleted: false,
      deletedAt: null
    },
    create: {
      fullName: 'System Administrator',
      email: env.DEFAULT_ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      emailVerified: true,
      statusId: activeStatus.id,
      deleted: false
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id }
  });

  logger.info({ message: 'Default admin checked/created successfully' });
};
