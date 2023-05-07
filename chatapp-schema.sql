CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
    CHECK (position('@' IN email) > 1),
  avatar TEXT,
  socket_id TEXT,
  on_line BOOLEAN DEFAULT 't'
);

CREATE TABLE friendrequest (
  id SERIAL PRIMARY KEY,
  sender INT NOT NULL,
  recipient INT NOT NULL
);


CREATE TABLE friendship (
  id SERIAL PRIMARY KEY,
  friend_one INT NOT NULL,
  friend_two INT NOT NULL
);

CREATE TABLE conversation (
  id SERIAL PRIMARY KEY
);


CREATE TABLE convoparticipants (
  id SERIAL PRIMARY KEY,
  cid INT NOT NULL,
  member_one INT NOT NULL,
  member_two INT NOT NULL
);

CREATE TABLE message (
  id SERIAL PRIMARY KEY,
  cid INT NOT NULL,
  sender INT NOT NULL,
  recipient INT NOT NULL,
  msgtype TEXT NOT NULL,
  msg TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  img TEXT,
  filelink TEXT
)