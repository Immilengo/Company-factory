import { Request, Response } from 'express';
import { successResponse } from '@utils/response';
import { ImageService } from '../service/image.service';

const service = new ImageService();

export class ImageController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.params.ownerType as 'USER' | 'PRODUCT' | 'GENERIC', req.params.ownerId, req.body);
    res.json(successResponse('Image created successfully', data));
  }

  async list(req: Request, res: Response) {
    const recordStatus = (req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined) ?? 'ACTIVE';
    const data = await service.list(req.params.ownerType as 'USER' | 'PRODUCT' | 'GENERIC', req.params.ownerId, recordStatus);
    res.json(successResponse('Images retrieved successfully', data));
  }

  async setPrimary(req: Request, res: Response) {
    await service.setPrimary(req.params.ownerType as 'USER' | 'PRODUCT' | 'GENERIC', req.params.ownerId, req.params.imageId);
    res.json(successResponse('Primary image updated successfully'));
  }

  async patchStatus(req: Request, res: Response) {
    const active = String(req.query.active) === 'true';
    const data = await service.patchStatus(req.params.imageId, active);
    res.json(successResponse('Image status updated successfully', data));
  }

  async remove(req: Request, res: Response) {
    await service.softDelete(req.params.imageId);
    res.json(successResponse('Image deleted successfully'));
  }
}
