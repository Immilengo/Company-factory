import { AppError } from '@errors/app-error';
import { RoleRepository } from '../repository/role.repository';

export class RoleService {
  constructor(private readonly repository = new RoleRepository()) {}

  async create(input: { name: string; description?: string }) {
    return this.repository.create({
      name: input.name.toUpperCase(),
      description: input.description
    });
  }

  async list(recordStatus: 'ACTIVE' | 'INACTIVE' | 'ALL') {
    return this.repository.list(recordStatus);
  }

  async get(id: string) {
    const role = await this.repository.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  async update(id: string, input: { name: string; description?: string }) {
    await this.get(id);
    return this.repository.update(id, {
      name: input.name.toUpperCase(),
      description: input.description
    });
  }

  async patch(id: string, input: { name?: string; description?: string | null; active?: boolean }) {
    await this.get(id);
    return this.repository.update(id, {
      ...(input.name ? { name: input.name.toUpperCase() } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.active !== undefined ? { deleted: !input.active } : {})
    });
  }

  async softDelete(id: string) {
    await this.get(id);
    await this.repository.update(id, { deleted: true });
  }
}
