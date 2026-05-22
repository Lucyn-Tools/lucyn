-- Enable pgvector extension first so vector type exists
CREATE EXTENSION IF NOT EXISTS "vector";

-- This baseline represents the initial schema state.
-- Generated after db push was used for the initial setup.
-- Future changes should use: npx prisma migrate dev --name <name>
