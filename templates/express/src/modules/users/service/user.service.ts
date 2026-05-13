import bcrypt from 'bcrypt';
import { AppError } from '@errors/app-error';
import { toPageResponse, parsePageQuery } from '@modules/common/service/pagination.service';
import { RoleRepository } from '@modules/roles/repository/role.repository';
import { StatusService } from '@modules/statuses/service/status.service';
import { prisma } from '@infra/database/prisma';
import { AuditService } from '@modules/audit/service/audit.service';
import { ImageOwnerType } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { toUserOutput } from '../mapper/user.mapper';
import { UserRepository } from '../repository/user.repository';

export class UserService {
  constructor(
    private readonly repository = new UserRepository(),
    private readonly roleRepository = new RoleRepository(),
    private readonly statusService = new StatusService(),
    private readonly audit = new AuditService()
  ) {}

  private async toResponse(user: Awaited<ReturnType<UserRepository['findById']>>) {
    if (!user) throw new AppError('User not found', 404);
    const profileImage = await prisma.imageAsset.findFirst({
      where: { ownerType: ImageOwnerType.USER, ownerId: user.id, primaryImage: true, deleted: false },
      orderBy: { createdAt: 'asc' }
    });
    return toUserOutput(user, profileImage);
  }

  async create(input: CreateUserDto, actorId?: string) {
    const existing = await this.repository.findByEmail(input.email);
    if (existing && !existing.deleted) throw new AppError('Email already registered', 409);

    const userRole = await this.roleRepository.findByName('USER');
    if (!userRole) throw new AppError('Default role not configured', 500);

    const status = input.statusId ? await this.statusService.get(input.statusId) : await this.statusService.getByCode('PENDING');
    const hashed = await bcrypt.hash(input.password, 12);

    const user = await this.repository.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      password: hashed,
      phone: input.phone,
      status: { connect: { id: status.id } },
      roles: {
        create: [{ role: { connect: { id: userRole.id } } }]
      }
    });

    await this.audit.log({ userId: actorId, action: 'CREATE', resource: 'USER', resourceId: user.id });
    return this.toResponse(user);
  }

  async getById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return this.toResponse(user);
  }

  async me(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return this.toResponse(user);
  }

  async list(query: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
    statusId?: string;
    recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  }) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = (['fullName', 'email', 'createdAt', 'updatedAt'].includes(query.sortBy ?? '')
      ? query.sortBy
      : 'createdAt') as 'fullName' | 'email' | 'createdAt' | 'updatedAt';
    const direction = (query.direction === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const recordStatus = query.recordStatus ?? 'ACTIVE';

    const { items, total } = await this.repository.findMany({
      skip,
      take,
      statusId: query.statusId,
      recordStatus,
      sortBy,
      direction
    });

    const mapped = await Promise.all(items.map((item) => this.toResponse(item)));
    return toPageResponse(mapped, total, page, size);
  }

  async patch(id: string, input: UpdateUserDto, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('User not found', 404);

    const user = await this.repository.update(id, {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.email ? { email: input.email.toLowerCase() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.statusId ? { status: { connect: { id: input.statusId } } } : {}),
      ...(input.active !== undefined ? { deleted: !input.active } : {})
    });

    await this.audit.log({ userId: actorId, action: 'PATCH', resource: 'USER', resourceId: id });
    return this.toResponse(user);
  }

  async addRole(userId: string, roleName: string, actorId?: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const role = await this.roleRepository.findByName(roleName);
    if (!role) throw new AppError('Role not found', 400);

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id }
    });

    await this.audit.log({ userId: actorId, action: 'ADD_ROLE', resource: 'USER', resourceId: userId });
    const updated = await this.repository.findById(userId);
    return this.toResponse(updated);
  }

  async softDelete(id: string, actorId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('User not found', 404);
    const deletedStatus = await this.statusService.getByCode('DELETED');

    await this.repository.update(id, {
      deleted: true,
      deletedAt: new Date(),
      status: { connect: { id: deletedStatus.id } }
    });

    await this.audit.log({ userId: actorId, action: 'SOFT_DELETE', resource: 'USER', resourceId: id });
  }
}
