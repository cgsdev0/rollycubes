ALTER TABLE player_stats
  ADD COLUMN winning_scores bigint[6] DEFAULT '{0,0,0,0,0,0}' NOT NULL;
