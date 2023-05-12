ALTER TABLE user_settings
ADD COLUMN color_hue double precision DEFAULT 0 NOT NULL,
ADD COLUMN color_sat double precision DEFAULT 80 NOT NULL;
