CREATE TABLE IF NOT EXISTS user_settings(
  user_id uuid NOT NULL,
  dice_type int DEFAULT 0,
  PRIMARY KEY(user_id),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
);

INSERT INTO user_settings(user_id)
(SELECT id AS user_id FROM users);
