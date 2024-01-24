BEGIN;
ALTER TABLE user_settings ADD COLUMN dice_type_new VARCHAR(20) DEFAULT 'Default';
UPDATE user_settings SET dice_type_new = CASE WHEN dice_type = 0 THEN 'Default' WHEN dice_type = 1 THEN 'D20' WHEN dice_type = 2 THEN 'Golden' END;
ALTER TABLE user_settings DROP COLUMN dice_type;
ALTER TABLE user_settings RENAME COLUMN dice_type_new TO dice_type;
COMMIT;
