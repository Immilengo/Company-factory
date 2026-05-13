import { AppError } from '@errors/app-error';
import { StatusRepository } from '../repository/status.repository';

type RecordStatus = 'ACTIVE' | 'INACTIVE' | 'ALL';

export class StatusService {
  constructor(private readonly repository = new StatusRepository()) {}

  async create(input: { code: string; name: string; description?: string }) {
    return this.repository.create({
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description
    });
  }

  async list(recordStatus: RecordStatus) {
    return this.repository.findMany(recordStatus);
  }

  async get(id: string) {
    const status = await this.repository.findById(id);
    if (!status) throw new AppError('Status not found', 404);
    return status;
  }

  async getByCode(code: string) {
    const found = await this.repository.findByCode(code);
    if (found && !found.deleted) return found;
    return this.repository.create({
      code: code.toUpperCase(),
      name: code.toUpperCase(),
      description: `Auto-created status ${code.toUpperCase()}`
    });
  }

  async update(id: string, input: { code: string; name: string; description?: string }) {
    await this.get(id);
    return this.repository.update(id, {
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description
    });
  }

  async patch(id: string, input: { code?: string; name?: string; description?: string | null; active?: boolean }) {
    await this.get(id);
    return this.repository.update(id, {
      ...(input.code ? { code: input.code.toUpperCase() } : {}),
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.active !== undefined ? { deleted: !input.active } : {})
    });
  }

  async softDelete(id: string) {
    await this.get(id);
    await this.repository.update(id, { deleted: true });
  }
}
