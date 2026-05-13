import { Request, Response } from 'express';
import { UserService } from '../service/user.service';
import { successResponse } from '@utils/response';
import { AppError } from '@errors/app-error';
import { ImageService } from '@modules/images/service/image.service';

const service = new UserService();
const imageService = new ImageService();

const hasRole = (req: Request, role: string) => (req.user?.roles ?? []).includes(role);
const ensureSelfOrAdmin = (req: Request, targetUserId: string) => {
  if (req.user?.sub === targetUserId || hasRole(req, 'ADMIN')) return;
  throw new AppError('Forbidden', 403);
};

export class UserController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.body, req.user?.sub);
    res.json(successResponse('User created successfully', data));
  }

  async list(req: Request, res: Response) {
    const data = await service.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      direction: req.query.direction as string | undefined,
      statusId: req.query.statusId as string | undefined,
      recordStatus: req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined
    });
    res.json(successResponse('Users retrieved successfully', data));
  }

  async getById(req: Request, res: Response) {
    ensureSelfOrAdmin(req, req.params.id);
    const data = await service.getById(req.params.id);
    res.json(successResponse('User retrieved successfully', data));
  }

  async me(req: Request, res: Response) {
    const data = await service.me(req.user!.sub);
    res.json(successResponse('Current user profile retrieved successfully', data));
  }

  async patch(req: Request, res: Response) {
    ensureSelfOrAdmin(req, req.params.id);
    const data = await service.patch(req.params.id, req.body, req.user?.sub);
    res.json(successResponse('User updated successfully', data));
  }

  async addRole(req: Request, res: Response) {
    const data = await service.addRole(req.params.id, req.body.roleName, req.user?.sub);
    res.json(successResponse('Role added successfully', data));
  }

  async remove(req: Request, res: Response) {
    await service.softDelete(req.params.id, req.user?.sub);
    res.json(successResponse('User deleted successfully'));
  }

  async uploadProfileImage(req: Request, res: Response) {
    ensureSelfOrAdmin(req, req.params.id);

    const url = req.body.url as string | undefined;
    const fileName = (req.body.fileName as string | undefined) ?? 'remote-file';
    const contentType = (req.body.contentType as string | undefined) ?? 'application/octet-stream';
    const sizeBytes = req.body.sizeBytes ? Number(req.body.sizeBytes) : 1;
    const sortOrder = req.body.sortOrder ? Number(req.body.sortOrder) : undefined;

    if (!url) throw new AppError('Provide url', 400);

    const data = await imageService.create('USER', req.params.id, {
      url,
      fileName,
      contentType,
      sizeBytes,
      primaryImage: true,
      sortOrder
    });

    res.json(successResponse('Profile image updated successfully', data));
  }

  async getProfileImage(req: Request, res: Response) {
    ensureSelfOrAdmin(req, req.params.id);
    const data = await imageService.getPrimary('USER', req.params.id);
    res.json(successResponse('Profile image retrieved successfully', data));
  }
}
