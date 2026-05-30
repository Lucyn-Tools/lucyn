-- Add UNIQUE constraint to PullRequest.githubId
-- Skip if already present (DB may have been set up with db:push after the schema change).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PullRequest_githubId_key'
      AND conrelid = '"PullRequest"'::regclass
  ) THEN
    ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_githubId_key" UNIQUE ("githubId");
  END IF;
END $$;

-- Add orgId to Commit (three-step: nullable → backfill → NOT NULL + FK + index)
ALTER TABLE "Commit" ADD COLUMN "orgId" TEXT;
UPDATE "Commit" c SET "orgId" = r."orgId" FROM "Repository" r WHERE c."repoId" = r.id;
ALTER TABLE "Commit" ALTER COLUMN "orgId" SET NOT NULL;
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Commit_orgId_idx" ON "Commit"("orgId");

-- Add orgId to PullRequest (three-step: nullable → backfill → NOT NULL + FK + index)
ALTER TABLE "PullRequest" ADD COLUMN "orgId" TEXT;
UPDATE "PullRequest" pr SET "orgId" = r."orgId" FROM "Repository" r WHERE pr."repoId" = r.id;
ALTER TABLE "PullRequest" ALTER COLUMN "orgId" SET NOT NULL;
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "PullRequest_orgId_idx" ON "PullRequest"("orgId");

-- Add orgId to ChatMessage (three-step: nullable → backfill → NOT NULL + FK + index)
ALTER TABLE "ChatMessage" ADD COLUMN "orgId" TEXT;
UPDATE "ChatMessage" m SET "orgId" = s."orgId" FROM "ChatSession" s WHERE m."sessionId" = s.id;
ALTER TABLE "ChatMessage" ALTER COLUMN "orgId" SET NOT NULL;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "ChatMessage_orgId_idx" ON "ChatMessage"("orgId");
