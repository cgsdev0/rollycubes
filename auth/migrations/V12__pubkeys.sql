CREATE TABLE IF NOT EXISTS pubkey_to_user (
    pubkey character varying NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL
);

ALTER TABLE ONLY pubkey_to_user DROP CONSTRAINT IF EXISTS "FK_pubkey_to_userid";
ALTER TABLE ONLY pubkey_to_user
    ADD CONSTRAINT "FK_pubkey_to_userid" FOREIGN KEY (user_id) REFERENCES users(id);
