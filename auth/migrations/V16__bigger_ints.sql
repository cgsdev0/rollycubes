ALTER TABLE player_stats
  ALTER COLUMN dice_values TYPE bigint[6],
  ALTER COLUMN dice_values SET DEFAULT '{0,0,0,0,0,0}',
  ALTER COLUMN rolls TYPE bigint,
  ALTER COLUMN doubles TYPE bigint,
  ALTER COLUMN wins TYPE bigint,
  ALTER COLUMN games TYPE bigint,
  ALTER COLUMN roll_totals TYPE bigint[12],
  ALTER COLUMN roll_totals SET DEFAULT '{0,0,0,0,0,0,0,0,0,0,0,0}';
