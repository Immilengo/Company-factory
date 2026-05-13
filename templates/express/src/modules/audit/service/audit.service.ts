import { AuditRepository } from '../repository/audit.repository';

const repository = new AuditRepository();

export class AuditService {
  async log(input: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await repository.create(input);
  }
}
