-- V2: Repair the users table on databases created by ddl-auto before Flyway was introduced.
-- Problem: the legacy schema still contains a NOT NULL "name" column that the entity
-- (fullName -> full_name) no longer inserts, causing:
--   ERROR: null value in column "name" of relation "users" violates not-null constraint
--
-- Every step is idempotent and guarded, so this migration is safe on:
--   - legacy databases that have BOTH "name" and "full_name" (the failing case)
--   - databases that only have "name" (backfill full_name from it)
--   - fresh databases created by V1 that never had "name" (all steps no-op)

-- 1. Ensure full_name exists (ddl-auto normally added it, but be safe). Nullable for now.
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- 2. Backfill full_name from the legacy name column — only if that column still exists,
--    otherwise the UPDATE would fail on fresh databases where "name" was never created.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
          AND column_name = 'name'
    ) THEN
        UPDATE users
        SET full_name = name
        WHERE (full_name IS NULL OR full_name = '')
          AND name IS NOT NULL;
    END IF;
END $$;

-- 3. Enforce NOT NULL on full_name (no-op when the constraint already exists).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_name = 'users'
          AND c.column_name = 'full_name'
          AND c.is_nullable = 'YES'
    ) THEN
        -- Guard rows that would violate the constraint after backfill
        -- (e.g. legacy rows with a NULL name as well).
        UPDATE users SET full_name = '' WHERE full_name IS NULL;
        ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
    END IF;
END $$;

-- 4. Drop the obsolete "name" column only if it still exists.
ALTER TABLE users DROP COLUMN IF EXISTS name;
