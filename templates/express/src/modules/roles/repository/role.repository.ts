import { Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

export class RoleRepository {
  async findByNames(names: string[]) {
    return prisma.role.findMany({ where: { name: { in: names.map((n) => n.toUpperCase()) } } });
  }

  async findByName(name: string) {
    return prisma.role.findUnique({ where: { name: name.toUpperCase() } });
  }

  async create(data: Prisma.RoleCreateInput) {
    return prisma.role.create({ data });
  }

  async findById(id: string) {
    return prisma.role.findUnique({ where: { id } });
  }

  async list(recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL') {
    if (recordStatus === 'ALL') return prisma.role.findMany({ orderBy: { name: 'asc' } });
    return prisma.role.findMany({
      where: { deleted: recordStatus === 'INACTIVE' },
      orderBy: { name: 'asc' }
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput) {
    return prisma.role.update({ where: { id }, data });
  }
}
