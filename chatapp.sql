\echo 'Delete and recreate chatapp db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE chatapp;
CREATE DATABASE chatapp;
\connect chatapp;

\i chatapp-schema.sql;