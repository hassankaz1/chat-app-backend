CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
    CHECK (position('@' IN email) > 1),
  avatar TEXT
);