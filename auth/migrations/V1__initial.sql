CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS achievement (
    id character varying NOT NULL PRIMARY KEY,
    name character varying NOT NULL,
    description character varying NOT NULL,
    max_progress integer DEFAULT 0 NOT NULL,
    image_url character varying
);

CREATE TABLE IF NOT EXISTS player_stats (
    rolls integer DEFAULT 0 NOT NULL,
    doubles integer DEFAULT 0 NOT NULL,
    games integer DEFAULT 0 NOT NULL,
    wins integer DEFAULT 0 NOT NULL,
    "userId" uuid NOT NULL PRIMARY KEY UNIQUE
);

CREATE TABLE IF NOT EXISTS refresh_token (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    issued_at timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid
);

CREATE TABLE IF NOT EXISTS twitch_identity (
    twitch_id character varying NOT NULL PRIMARY KEY,
    twitch_login character varying NOT NULL,
    "userId" uuid UNIQUE
);

CREATE TABLE IF NOT EXISTS "user" (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    username character varying NOT NULL,
    hashed_password character varying NOT NULL,
    image_url character varying,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_to_achievement (
    progress integer DEFAULT 0 NOT NULL,
    unlocked timestamp without time zone,
    "userId" uuid NOT NULL,
    "achievementId" character varying NOT NULL,
    PRIMARY KEY ("userId", "achievementId")
);

CREATE INDEX IF NOT EXISTS "IDX_78a916df40e02a9deb1c4b75ed" ON "user" USING btree (username);

ALTER TABLE ONLY user_to_achievement DROP CONSTRAINT IF EXISTS "FK_02102504ee06fb44948906ec7d6";
ALTER TABLE ONLY user_to_achievement
    ADD CONSTRAINT "FK_02102504ee06fb44948906ec7d6" FOREIGN KEY ("achievementId") REFERENCES achievement(id);

ALTER TABLE ONLY twitch_identity DROP CONSTRAINT IF EXISTS "FK_096ac80126c38d3866baf1ba7a8";
ALTER TABLE ONLY twitch_identity
    ADD CONSTRAINT "FK_096ac80126c38d3866baf1ba7a8" FOREIGN KEY ("userId") REFERENCES "user"(id);

ALTER TABLE ONLY user_to_achievement DROP CONSTRAINT IF EXISTS "FK_5d9a7b213a82555acbeb6d62bbe";
ALTER TABLE ONLY user_to_achievement
    ADD CONSTRAINT "FK_5d9a7b213a82555acbeb6d62bbe" FOREIGN KEY ("userId") REFERENCES "user"(id);

ALTER TABLE ONLY refresh_token DROP CONSTRAINT IF EXISTS "FK_8e913e288156c133999341156ad";
ALTER TABLE ONLY refresh_token
    ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"(id);

ALTER TABLE ONLY player_stats DROP CONSTRAINT IF EXISTS "FK_a14e90bda5a40cf0b150c6dc87f";
ALTER TABLE ONLY player_stats
    ADD CONSTRAINT "FK_a14e90bda5a40cf0b150c6dc87f" FOREIGN KEY ("userId") REFERENCES "user"(id);
