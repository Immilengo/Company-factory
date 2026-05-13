import { Request, Response } from 'express';
import { RoleService } from '../service/role.service';
import { successResponse } from '@utils/response';

const service = new RoleService();

export class RoleController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.body);
    res.json(successResponse('Role created successfully', data));
  }

  async list(req: Request, res: Response) {
    const recordStatus = (req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined) ?? 'ACTIVE';
    const data = await service.list(recordStatus);
    res.json(successResponse('Roles retrieved successfully', data));
  }

  async get(req: Request, res: Response) {
    const data = await service.get(req.params.id);
    res.json(successResponse('Role retrieved successfully', data));
  }

  async update(req: Request, res: Response) {
    const data = await service.update(req.params.id, req.body);
    res.json(successResponse('Role updated successfully', data));
  }

  async patch(req: Request, res: Response) {
    const data = await service.patch(req.params.id, req.body);
    res.json(successResponse('Role patched successfully', data));
  }

  async delete(req: Request, res: Response) {
    await service.softDelete(req.params.id);
    res.json(successResponse('Role deleted successfully'));
  }
}
