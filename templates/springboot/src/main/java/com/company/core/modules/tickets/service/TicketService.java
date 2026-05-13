package com.company.core.modules.tickets.service;

import com.company.core.exceptions.BusinessException;
import com.company.core.exceptions.NotFoundException;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.tickets.dto.TicketCreateRequest;
import com.company.core.modules.tickets.dto.TicketPatchRequest;
import com.company.core.modules.tickets.dto.TicketStatusPatchRequest;
import com.company.core.modules.tickets.entity.Ticket;
import com.company.core.modules.tickets.entity.TicketStatus;
import com.company.core.modules.tickets.repository.TicketRepository;
import com.company.core.modules.users.entity.User;
import com.company.core.security.SecurityUtils;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final SecurityUtils securityUtils;

    public TicketService(TicketRepository ticketRepository, SecurityUtils securityUtils) {
        this.ticketRepository = ticketRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public Ticket create(TicketCreateRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID());
        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setStatus(TicketStatus.PENDENTE);
        ticket.setRequester(currentUser);
        return ticketRepository.save(ticket);
    }

    public Page<Ticket> list(int page, int size, String sortBy, String direction, TicketStatus status, RecordStatusFilter recordStatus) {
        String normalizedSort = switch (sortBy) {
            case "subject", "status", "createdAt", "updatedAt" -> sortBy;
            default -> "createdAt";
        };
        Sort sort = "asc".equalsIgnoreCase(direction)
            ? Sort.by(normalizedSort).ascending()
            : Sort.by(normalizedSort).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        User currentUser = securityUtils.getCurrentUser();
        boolean isAdmin = securityUtils.hasRole("ADMIN");

        if (isAdmin) {
            return listForAdmin(pageable, status, recordStatus);
        }
        return listForRequester(currentUser.getId(), pageable, status, recordStatus);
    }

    public Ticket get(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Ticket not found"));
        ensureCanView(ticket);
        return ticket;
    }

    @Transactional
    public Ticket patch(UUID id, TicketPatchRequest request) {
        Ticket ticket = get(id);
        ensureCanEditTicket(ticket);
        if (request.subject() != null && !request.subject().isBlank()) {
            ticket.setSubject(request.subject());
        }
        if (request.description() != null && !request.description().isBlank()) {
            ticket.setDescription(request.description());
        }
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateStatus(UUID id, TicketStatusPatchRequest request) {
        if (!securityUtils.hasRole("ADMIN")) {
            throw new BusinessException("Only admin can update ticket status");
        }
        Ticket ticket = ticketRepository.findById(id)
            .filter(found -> !found.getDeleted())
            .orElseThrow(() -> new NotFoundException("Ticket not found"));
        ticket.setStatus(request.status());
        return ticketRepository.save(ticket);
    }

    @Transactional
    public void softDelete(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
            .filter(found -> !found.getDeleted())
            .orElseThrow(() -> new NotFoundException("Ticket not found"));
        ensureCanEditTicket(ticket);
        ticket.setDeleted(true);
        ticketRepository.save(ticket);
    }

    private Page<Ticket> listForAdmin(Pageable pageable, TicketStatus status, RecordStatusFilter recordStatus) {
        return switch (recordStatus) {
            case ACTIVE -> status == null
                ? ticketRepository.findByDeletedFalse(pageable)
                : ticketRepository.findByStatusAndDeletedFalse(status, pageable);
            case INACTIVE -> status == null
                ? ticketRepository.findByDeletedTrue(pageable)
                : ticketRepository.findByStatusAndDeletedTrue(status, pageable);
            case ALL -> ticketRepository.findAll(pageable).map(ticket -> ticket);
        };
    }

    private Page<Ticket> listForRequester(UUID requesterId, Pageable pageable, TicketStatus status, RecordStatusFilter recordStatus) {
        return switch (recordStatus) {
            case ACTIVE -> status == null
                ? ticketRepository.findAllByRequesterIdAndDeletedFalse(requesterId, pageable)
                : ticketRepository.findByRequesterIdAndStatusAndDeletedFalse(requesterId, status, pageable);
            case INACTIVE -> status == null
                ? ticketRepository.findAllByRequesterIdAndDeletedTrue(requesterId, pageable)
                : ticketRepository.findByRequesterIdAndStatusAndDeletedTrue(requesterId, status, pageable);
            case ALL -> status == null
                ? ticketRepository.findAllByRequesterIdAndDeletedFalse(requesterId, pageable)
                : ticketRepository.findByRequesterIdAndStatusAndDeletedFalse(requesterId, status, pageable);
        };
    }

    private void ensureCanView(Ticket ticket) {
        if (securityUtils.hasRole("ADMIN")) {
            return;
        }
        if (!ticket.getRequester().getId().equals(securityUtils.getCurrentUserId())) {
            throw new BusinessException("You cannot access this ticket");
        }
    }

    private void ensureCanEditTicket(Ticket ticket) {
        if (securityUtils.hasRole("ADMIN")) {
            return;
        }
        if (!ticket.getRequester().getId().equals(securityUtils.getCurrentUserId())) {
            throw new BusinessException("You cannot change this ticket");
        }
        if (ticket.getStatus() == TicketStatus.RESOLVIDO || ticket.getStatus() == TicketStatus.FECHADO) {
            throw new BusinessException("Ticket is finalized and cannot be changed by requester");
        }
    }
}
