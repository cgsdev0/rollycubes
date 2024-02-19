CREATE TABLE IF NOT EXISTS payment (
  user_id uuid NOT NULL,
  payment_id character varying NOT NULL
);

ALTER TABLE ONLY payment
    ADD CONSTRAINT "FK_user_to_payment" FOREIGN KEY (user_id) REFERENCES users(id);
