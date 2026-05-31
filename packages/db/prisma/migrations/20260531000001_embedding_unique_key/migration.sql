-- Unique constraint on Embedding(orgId, sourceType, sourceId) to enable
-- atomic upserts and prevent duplicates from concurrent profile refreshes.
CREATE UNIQUE INDEX IF NOT EXISTS "Embedding_orgId_sourceType_sourceId_key"
  ON "Embedding"("orgId", "sourceType", "sourceId");
