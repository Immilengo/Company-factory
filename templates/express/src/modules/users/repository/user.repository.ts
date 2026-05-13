import { Prisma } from '@prisma/client';
import { prisma } from '@infra/database/prisma';

export class UserRepository {
  private readonly include = { status: true, roles: { include: { role: true } } } as const;

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, include: this.include });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email: email.toLowerCase() }, include: this.include });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id }, include: this.include });
  }

  async findMany(params: {
    skip: number;
    take: number;
    statusId?: string;
    recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL';
    sortBy: 'fullName' | 'email' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
  }) {
    const where: Prisma.UserWhereInput = {
      ...(params.statusId ? { statusId: params.statusId } : {}),
      ...(params.recordStatus === 'ALL' ? {} : { deleted: params.recordStatus === 'INACTIVE' })
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortBy]: params.direction },
        include: this.include
      }),
      prisma.user.count({ where })
    ]);

    return { items, total };
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, include: this.include });
  }
}
