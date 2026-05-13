import { Request, Response } from 'express';
import { TicketStatus } from '@prisma/client';
import { successResponse } from '@utils/response';
import { TicketService } from '../service/ticket.service';

const service = new TicketService();

export class TicketController {
  async create(req: Request, res: Response) {
    const data = await service.create(req.user!.sub, req.body);
    res.json(successResponse('Ticket created successfully', data));
  }

  async list(req: Request, res: Response) {
    const data = await service.list(
      { id: req.user!.sub, roles: req.user!.roles },
      {
        page: req.query.page ? Number(req.query.page) : undefined,
        size: req.query.size ? Number(req.query.size) : undefined,
        sortBy: req.query.sortBy as string | undefined,
        direction: req.query.direction as string | undefined,
        status: req.query.status as string | undefined,
        recordStatus: req.query.recordStatus as 'ACTIVE' | 'INACTIVE' | 'ALL' | undefined
      }
    );
    res.json(successResponse('Tickets retrieved successfully', data));
  }

  async get(req: Request, res: Response) {
    const data = await service.get({ id: req.user!.sub, roles: req.user!.roles }, req.params.id);
    res.json(successResponse('Ticket retrieved successfully', data));
  }

  async patch(req: Request, res: Response) {
    const data = await service.patch({ id: req.user!.sub, roles: req.user!.roles }, req.params.id, req.body);
    res.json(successResponse('Ticket updated successfully', data));
  }

  async patchStatus(req: Request, res: Response) {
    const data = await service.patchStatus({ roles: req.user!.roles }, req.params.id, req.body.status as TicketStatus);
    res.json(successResponse('Ticket status updated successfully', data));
  }

  async remove(req: Request, res: Response) {
    await service.softDelete({ id: req.user!.sub, roles: req.user!.roles }, req.params.id);
    res.json(successResponse('Ticket deleted successfully'));
  }
}
