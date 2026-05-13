import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { StatusService } from '../service/status.service';

const service = new StatusService();

export class StatusController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.body);
    res.json(successResponse('Status created successfully', data));
  }

  async list(req: Request, res: Response) {
    const recordStatus = (req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined) ?? 'ACTIVE';
    const data = await service.list(recordStatus);
    res.json(successResponse('Statuses retrieved successfully', data));
  }

  async get(req: Request, res: Response) {
    const data = await service.get(req.params.id);
    res.json(successResponse('Status retrieved successfully', data));
  }

  async update(req: Request, res: Response) {
    const data = await service.update(req.params.id, req.body);
    res.json(successResponse('Status updated successfully', data));
  }

  async patch(req: Request, res: Response) {
    const data = await service.patch(req.params.id, req.body);
    res.json(successResponse('Status patched successfully', data));
  }

  async delete(req: Request, res: Response) {
    await service.softDelete(req.params.id);
    res.json(successResponse('Status deleted successfully'));
  }
}
