package com.company.core.modules.tickets.repository;

import com.company.core.modules.tickets.entity.Ticket;
import com.company.core.modules.tickets.entity.TicketStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Page<Ticket> findByDeletedFalse(Pageable pageable);
    Page<Ticket> findByDeletedTrue(Pageable pageable);
    Page<Ticket> findAllByRequesterIdAndDeletedFalse(UUID requesterId, Pageable pageable);
    Page<Ticket> findAllByRequesterIdAndDeletedTrue(UUID requesterId, Pageable pageable);
    Page<Ticket> findByStatusAndDeletedFalse(TicketStatus status, Pageable pageable);
    Page<Ticket> findByStatusAndDeletedTrue(TicketStatus status, Pageable pageable);
    Page<Ticket> findByRequesterIdAndStatusAndDeletedFalse(UUID requesterId, TicketStatus status, Pageable pageable);
    Page<Ticket> findByRequesterIdAndStatusAndDeletedTrue(UUID requesterId, TicketStatus status, Pageable pageable);
}
