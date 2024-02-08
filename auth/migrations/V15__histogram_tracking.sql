ALTER TABLE player_stats
  ADD COLUMN dice_values integer[6] DEFAULT '{0,0,0,0,0,0}' NOT NULL,
  ADD COLUMN roll_totals integer[12] DEFAULT '{0,0,0,0,0,0,0,0,0,0,0,0}' NOT NULL;
