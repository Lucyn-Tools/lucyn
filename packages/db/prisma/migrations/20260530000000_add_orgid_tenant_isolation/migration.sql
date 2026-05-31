-- Add UNIQUE constraint to PullRequest.githubId (safe for replay)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PullRequest_githubId_key'
      AND conrelid = to_regclass('"PullRequest"')
  ) THEN
    ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_githubId_key" UNIQUE ("githubId");
  END IF;
END $$;

-- Add orgId to Commit (three-step: nullable → backfill → NOT NULL + FK + index)
ALTER TABLE "Commit" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
UPDATE "Commit" c SET "orgId" = r."orgId" FROM "Repository" r WHERE c."repoId" = r.id AND c."orgId" IS NULL;
ALTER TABLE "Commit" ALTER COLUMN "orgId" SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Commit_orgId_fkey'
  ) THEN
    ALTER TABLE "Commit" ADD CONSTRAINT "Commit_orgId_fkey"
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "Commit_orgId_idx" ON "Commit"("orgId");

-- Add orgId to PullRequest (three-step: nullable → backfill → NOT NULL + FK + index)
ALTER TABLE "PullRequest" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
UPDATE "PullRequest" pr SET "orgId" = r."orgId" FROM "Repository" r WHERE pr."repoId" = r.id AND pr."orgId" IS NULL;
ALTER TABLE "PullRequest" ALTER COLUMN "orgId" SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PullRequest_orgId_fkey'
  ) THEN
    ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_orgId_fkey"
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "PullRequest_orgId_idx" ON "PullRequest"("orgId");

-- Add orgId to ChatMessage (three-step: nullable → backfill → NOT NULL + FK + index)
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
UPDATE "ChatMessage" m SET "orgId" = s."orgId" FROM "ChatSession" s WHERE m."sessionId" = s.id AND m."orgId" IS NULL;
ALTER TABLE "ChatMessage" ALTER COLUMN "orgId" SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ChatMessage_orgId_fkey'
  ) THEN
    ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_orgId_fkey"
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "ChatMessage_orgId_idx" ON "ChatMessage"("orgId");
