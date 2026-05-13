CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO statuses (id, code, name, description, created_at, updated_at, created_by, updated_by, deleted)
SELECT x.id, x.code, x.code, 'Default status ' || x.code, NOW(), NOW(), 'system', 'system', FALSE
FROM (
    VALUES
      ('11111111-1111-1111-1111-111111111111'::UUID, 'ACTIVE'),
      ('22222222-2222-2222-2222-222222222222'::UUID, 'INACTIVE'),
      ('33333333-3333-3333-3333-333333333333'::UUID, 'BLOCKED'),
      ('44444444-4444-4444-4444-444444444444'::UUID, 'PENDING'),
      ('55555555-5555-5555-5555-555555555555'::UUID, 'DELETED')
) AS x(id, code)
WHERE NOT EXISTS (
    SELECT 1 FROM statuses s WHERE s.code = x.code AND s.deleted = FALSE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS status_id UUID;

UPDATE users u
SET status_id = s.id
FROM statuses s
WHERE u.status_id IS NULL
  AND s.code = COALESCE(u.status, 'PENDING');

UPDATE users u
SET status_id = s.id
FROM statuses s
WHERE u.status_id IS NULL
  AND s.code = 'PENDING';

ALTER TABLE users ALTER COLUMN status_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_users_status'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT fk_users_status FOREIGN KEY (status_id) REFERENCES statuses(id);
    END IF;
END $$;
