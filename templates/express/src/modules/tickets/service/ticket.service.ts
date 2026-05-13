import { TicketStatus } from '@prisma/client';
import { prisma } from '@infra/database/prisma';
import { AppError } from '@errors/app-error';
import { parsePageQuery, toPageResponse } from '@modules/common/service/pagination.service';

export class TicketService {
  async create(userId: string, input: { subject: string; description: string }) {
    return prisma.ticket.create({
      data: {
        subject: input.subject,
        description: input.description,
        status: TicketStatus.PENDENTE,
        requester: { connect: { id: userId } }
      },
      include: { requester: true }
    });
  }

  async list(
    actor: { id: string; roles: string[] },
    query: {
      page?: number;
      size?: number;
      sortBy?: string;
      direction?: string;
      status?: string;
      recordStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    }
  ) {
    const { page, size, skip, take } = parsePageQuery(query);
    const sortBy = (['subject', 'status', 'createdAt', 'updatedAt'].includes(query.sortBy ?? '')
      ? query.sortBy
      : 'createdAt') as 'subject' | 'status' | 'createdAt' | 'updatedAt';
    const direction = (query.direction === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const recordStatus = query.recordStatus ?? 'ACTIVE';
    const isAdmin = actor.roles.includes('ADMIN');

    const where = {
      ...(query.status ? { status: query.status as TicketStatus } : {}),
      ...(recordStatus === 'ALL' ? {} : { deleted: recordStatus === 'INACTIVE' }),
      ...(isAdmin ? {} : { requesterId: actor.id })
    };

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: direction },
        include: { requester: true }
      }),
      prisma.ticket.count({ where })
    ]);

    return toPageResponse(
      items.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        requesterId: ticket.requesterId,
        requesterEmail: ticket.requester.email,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      })),
      total,
      page,
      size
    );
  }

  async get(actor: { id: string; roles: string[] }, id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { requester: true } });
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (!actor.roles.includes('ADMIN') && ticket.requesterId !== actor.id) {
      throw new AppError('You cannot access this ticket', 400);
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      requesterId: ticket.requesterId,
      requesterEmail: ticket.requester.email,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    };
  }

  async patch(actor: { id: string; roles: string[] }, id: string, input: { subject?: string; description?: string }) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new AppError('Ticket not found', 404);

    if (!actor.roles.includes('ADMIN')) {
      if (ticket.requesterId !== actor.id) throw new AppError('You cannot change this ticket', 400);
      if ([TicketStatus.RESOLVIDO, TicketStatus.FECHADO].includes(ticket.status)) {
        throw new AppError('Ticket is finalized and cannot be changed by requester', 400);
      }
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        ...(input.subject ? { subject: input.subject } : {}),
        ...(input.description ? { description: input.description } : {})
      },
      include: { requester: true }
    });

    return {
      id: updated.id,
      subject: updated.subject,
      description: updated.description,
      status: updated.status,
      requesterId: updated.requesterId,
      requesterEmail: updated.requester.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  async patchStatus(actor: { roles: string[] }, id: string, status: TicketStatus) {
    if (!actor.roles.includes('ADMIN')) throw new AppError('Only admin can update ticket status', 400);

    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { requester: true } });
    if (!ticket || ticket.deleted) throw new AppError('Ticket not found', 404);

    const updated = await prisma.ticket.update({ where: { id }, data: { status }, include: { requester: true } });

    return {
      id: updated.id,
      subject: updated.subject,
      description: updated.description,
      status: updated.status,
      requesterId: updated.requesterId,
      requesterEmail: updated.requester.email,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  async softDelete(actor: { id: string; roles: string[] }, id: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket || ticket.deleted) throw new AppError('Ticket not found', 404);

    if (!actor.roles.includes('ADMIN')) {
      if (ticket.requesterId !== actor.id) throw new AppError('You cannot change this ticket', 400);
      if ([TicketStatus.RESOLVIDO, TicketStatus.FECHADO].includes(ticket.status)) {
        throw new AppError('Ticket is finalized and cannot be changed by requester', 400);
      }
    }

    await prisma.ticket.update({ where: { id }, data: { deleted: true } });
  }
}
