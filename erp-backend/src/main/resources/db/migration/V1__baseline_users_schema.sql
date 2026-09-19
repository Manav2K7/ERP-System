-- Baseline: users table as designed by the current entity (User.java).
-- On existing databases this file is NOT executed: Flyway records a baseline at V1
-- via baseline-on-migrate/baseline-version (see application.yml). It only runs on
-- fresh/empty databases.
CREATE TABLE IF NOT EXISTS users
(
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    full_name  VARCHAR(255) NOT NULL,
    role       VARCHAR(255) NOT NULL,
    enabled    BOOLEAN      NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP
);

-- Only create the unique index if it does not already exist (safe re-runs / renamed indexes).
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_key
    ON users (email);
