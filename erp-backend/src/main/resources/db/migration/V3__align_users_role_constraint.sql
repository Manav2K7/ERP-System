-- V3: Keep the database role constraint aligned with com.erp.model.enums.Role.
-- Older schemas used Spring role names without the ROLE_ prefix, while the
-- application persists enum names such as ROLE_ADMIN.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users
SET role = 'ROLE_' || role
WHERE role IN ('ADMIN', 'SALES_EXECUTIVE', 'PURCHASE_MANAGER',
               'INVENTORY_MANAGER', 'ACCOUNTANT');

ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('ROLE_ADMIN', 'ROLE_SALES_EXECUTIVE',
                    'ROLE_PURCHASE_MANAGER', 'ROLE_INVENTORY_MANAGER',
                    'ROLE_ACCOUNTANT'));