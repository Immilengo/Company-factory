CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    status VARCHAR(30) NOT NULL,
    requester_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_tickets_requester FOREIGN KEY (requester_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_requester ON tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_deleted ON tickets(deleted);
