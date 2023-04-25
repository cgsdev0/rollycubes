ALTER TABLE player_stats RENAME COLUMN "userId" TO user_id;
ALTER TABLE refresh_token RENAME COLUMN "userId" TO user_id;
ALTER TABLE twitch_identity RENAME COLUMN "userId" TO user_id;
ALTER TABLE user_to_achievement RENAME COLUMN "userId" TO user_id;
ALTER TABLE user_to_achievement RENAME COLUMN "achievementId" TO achievement_id;
ALTER TABLE public."user" RENAME TO users;
ALTER TABLE users RENAME COLUMN "createdDate" TO created_date;
