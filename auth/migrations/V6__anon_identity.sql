CREATE TABLE IF NOT EXISTS anon_identity (
    anon_id character varying NOT NULL PRIMARY KEY,
    user_id uuid UNIQUE
);

ALTER TABLE ONLY anon_identity
    ADD CONSTRAINT "FK_anon_identity_to_users" FOREIGN KEY (user_id) REFERENCES users(id);
