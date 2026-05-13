-- Legacy column from V1. New model uses users.status_id.
-- Keep backward compatibility while removing NOT NULL failures on inserts.
ALTER TABLE users ALTER COLUMN status DROP NOT NULL;
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
