import { prisma } from '@infra/database/prisma';

export class AuditRepository {
  async create(input: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return prisma.auditLog.create({ data: input });
  }
}
