import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = process.env.DB_PORT ?? '5432';
const dbName = process.env.DB_NAME ?? 'mayongi_db';
const dbUser = process.env.DB_USER ?? 'postgres';
const dbPassword = process.env.DB_PASSWORD ?? 'postgres';
const databaseUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')
    ? process.env.DATABASE_URL
    : `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

process.env.DATABASE_URL = databaseUrl;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultRoles = ['ADMIN', 'USER', 'MANAGER'];
  for (const roleName of defaultRoles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: { deleted: false },
      create: { name: roleName, description: `${roleName} system role` }
    });
  }

  const defaultStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING', 'DELETED'];
  for (const code of defaultStatuses) {
    await prisma.status.upsert({
      where: { code },
      update: { deleted: false },
      create: { code, name: code, description: `Default status ${code}` }
    });
  }

  const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@company.com').toLowerCase();
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin123@';
  const hashed = await bcrypt.hash(adminPassword, 12);

  const activeStatus = await prisma.status.findUnique({ where: { code: 'ACTIVE' } });
  if (!activeStatus) throw new Error('ACTIVE status not found');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: 'System Administrator',
      password: hashed,
      statusId: activeStatus.id,
      emailVerified: true,
      deleted: false,
      deletedAt: null
    },
    create: {
      fullName: 'System Administrator',
      email: adminEmail,
      password: hashed,
      statusId: activeStatus.id,
      emailVerified: true,
      deleted: false
    }
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
