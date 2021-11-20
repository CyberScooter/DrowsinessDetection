CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "ear_values_id" int,
  "email" varchar UNIQUE,
  "username" varchar UNIQUE,
  "hash" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "lobbies" (
  "id" SERIAL PRIMARY KEY,
  "tracking_id" int,
  "user_id" int,
  "name" varchar,
  "unique_join_code" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "users_lobbies" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "lobby_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "tracking" (
  "id" SERIAL PRIMARY KEY,
  "user_tracking" int DEFAULT 0,
  "alert_drowsy" boolean,
  "longitude" varchar,
  "latitude" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "ear_values" (
  "id" SERIAL PRIMARY KEY,
  "ear_opened_eyes" float8,
  "ear_closed_eyes" float8,
  "ear_drowsy_eyes" float8,
  "created_at" timestamp,
  "updated_at" timestamp
);

ALTER TABLE "users_lobbies" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "users_lobbies" ADD FOREIGN KEY ("lobby_id") REFERENCES "lobbies" ("id") ON DELETE CASCADE;

ALTER TABLE "lobbies" ADD FOREIGN KEY ("tracking_id") REFERENCES "tracking" ("id") ON DELETE CASCADE;

ALTER TABLE "users" ADD FOREIGN KEY ("ear_values_id") REFERENCES "ear_values" ("id") ON DELETE CASCADE;
