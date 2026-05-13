import { Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

export class StatusRepository {
  async create(data: Prisma.StatusCreateInput) {
    return prisma.status.create({ data });
  }

  async findById(id: string) {
    return prisma.status.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.status.findUnique({ where: { code: code.toUpperCase() } });
  }

  async findMany(recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL') {
    if (recordStatus === 'ALL') return prisma.status.findMany({ orderBy: { createdAt: 'desc' } });
    return prisma.status.findMany({
      where: { deleted: recordStatus === 'INACTIVE' },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, data: Prisma.StatusUpdateInput) {
    return prisma.status.update({ where: { id }, data });
  }
}
