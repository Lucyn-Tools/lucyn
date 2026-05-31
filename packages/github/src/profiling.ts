import { prisma } from "@lucyn/db";
import { analyzeBurnoutSignal } from "./analysis";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type KnowledgeAreas = Record<string, number>; // area name → confidence 0–1

type CommitRow = {
  message: string;
  committedAt: Date;
};

type PRRow = {
  title: string;
  body: string | null;
  state: string;
  createdAt: Date;
};

// ─── MODULE KEYWORD PATTERNS ─────────────────────────────────────────────────

const MODULE_KEYWORDS: Array<{ pattern: RegExp; area: string }> = [
  {
    pattern:
      /\b(auth|authentication|login|logout|signup|register|session|clerk|jwt|token|oauth|permission|rbac)\b/i,
    area: "Auth",
  },
  {
    pattern: /\b(api|endpoint|route|handler|rest|graphql|webhook|request|response|middleware)\b/i,
    area: "API",
  },
  {
    pattern:
      /\b(database|db|prisma|sql|query|migration|schema|postgres|model|relation|index)\b/i,
    area: "Database",
  },
  {
    pattern:
      /\b(ui|frontend|component|page|layout|style|css|react|next|tailwind|form|button|modal|design)\b/i,
    area: "Frontend",
  },
  {
    pattern:
      /\b(ai|llm|claude|embedding|rag|chat|vector|prompt|model|anthropic|completion|stream|inference)\b/i,
    area: "AI/ML",
  },
  {
    pattern: /\b(discord|bot|slash.?command|interaction|guild|channel|dm|intents)\b/i,
    area: "Discord",
  },
  {
    pattern: /\b(github|webhook|repo|commit|pull.?request|issue|octokit|branch|merge)\b/i,
    area: "GitHub Integration",
  },
  {
    pattern: /\b(test|spec|jest|vitest|mock|fixture|coverage|assert|e2e|unit)\b/i,
    area: "Testing",
  },
  {
    pattern:
      /\b(ci|cd|deploy|docker|workflow|action|pipeline|railway|vercel|build|release)\b/i,
    area: "DevOps",
  },
  {
    pattern: /\b(perf|performance|cache|optim|speed|latency|throughput|memory|benchmark)\b/i,
    area: "Performance",
  },
  {
    pattern: /\b(security|vuln|cve|xss|injection|csrf|sanitiz|encrypt|harden)\b/i,
    area: "Security",
  },
];

// ─── WORK STYLE PATTERNS ─────────────────────────────────────────────────────

const WORK_STYLE_PATTERNS: Array<{ pattern: RegExp; style: string }> = [
  { pattern: /^feat(\(.+\))?:/i, style: "Feature Builder" },
  { pattern: /^fix(\(.+\))?:/i, style: "Bug Hunter" },
  { pattern: /^refactor(\(.+\))?:/i, style: "Refactorer" },
  { pattern: /^(test|docs|style)(\(.+\))?:/i, style: "Quality Champion" },
  { pattern: /^(ci|chore|build|perf)(\(.+\))?:/i, style: "DevOps Engineer" },
];

// ─── KNOWLEDGE INFERENCE ─────────────────────────────────────────────────────

function scoreText(text: string): Map<string, number> {
  const scores = new Map<string, number>();
  for (const { pattern, area } of MODULE_KEYWORDS) {
    if (pattern.test(text)) {
      scores.set(area, (scores.get(area) ?? 0) + 1);
    }
  }
  return scores;
}

function buildKnowledgeAreas(commits: CommitRow[], prs: PRRow[]): KnowledgeAreas {
  const raw = new Map<string, number>();
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

  for (const { message, committedAt } of commits) {
    const weight = committedAt.getTime() > recentCutoff ? 2 : 1;
    for (const [area, score] of scoreText(message)) {
      raw.set(area, (raw.get(area) ?? 0) + score * weight);
    }
    // Extra signal from conventional commit scopes: feat(auth): → test "auth"
    const scope = message.match(/^\w+\(([^)]+)\):/)?.[1];
    if (scope) {
      for (const [area, score] of scoreText(scope)) {
        raw.set(area, (raw.get(area) ?? 0) + score * weight);
      }
    }
  }

  for (const { title, body } of prs) {
    // PRs weighted 1.5× — they represent more deliberate, scoped work
    for (const [area, score] of scoreText(`${title} ${body ?? ""}`)) {
      raw.set(area, (raw.get(area) ?? 0) + score * 1.5);
    }
  }

  if (raw.size === 0) return {};

  const max = Math.max(...raw.values());
  const result: KnowledgeAreas = {};
  for (const [area, score] of raw) {
    const confidence = score / max;
    if (confidence >= 0.1) {
      result[area] = Math.round(confidence * 100) / 100;
    }
  }
  return result;
}

// ─── WORK STYLE INFERENCE ────────────────────────────────────────────────────

function inferWorkStyles(commits: CommitRow[]): string[] {
  const counts = new Map<string, number>();
  for (const { message } of commits) {
    for (const { pattern, style } of WORK_STYLE_PATTERNS) {
      if (pattern.test(message)) {
        counts.set(style, (counts.get(style) ?? 0) + 1);
        break;
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([style]) => style);
}

// ─── LOAD CALCULATION ────────────────────────────────────────────────────────

async function calculateCurrentLoad(orgId: string, developerId: string): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [openPRs, recentCommits] = await Promise.all([
    prisma.pullRequest.count({ where: { orgId, authorId: developerId, state: "OPEN" } }),
    prisma.commit.count({ where: { orgId, developerId, committedAt: { gte: sevenDaysAgo } } }),
  ]);

  // Open PRs drive load heavily (20 pts each, max 60); recent commit pace adds up to 40
  return Math.min(100, Math.min(60, openPRs * 20) + Math.min(40, recentCommits * 3));
}

// ─── BURNOUT DATA GATHERING ──────────────────────────────────────────────────

async function gatherBurnoutInputs(orgId: string, developerId: string) {
  // 4-week window as specified in the acceptance criteria
  const windowStart = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

  const commits = await prisma.commit.findMany({
    where: { orgId, developerId, committedAt: { gte: windowStart } },
    select: { committedAt: true },
    orderBy: { committedAt: "asc" },
  });

  const commitsLast7Days: number[] = new Array(7).fill(0);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let lateNightCommits = 0;

  for (const { committedAt } of commits) {
    const hour = committedAt.getUTCHours();
    if (hour >= 22 || hour < 5) lateNightCommits++;

    if (committedAt.getTime() >= sevenDaysAgo) {
      const daysAgo = Math.floor((Date.now() - committedAt.getTime()) / (24 * 60 * 60 * 1000));
      commitsLast7Days[6 - Math.min(6, daysAgo)]++;
    }
  }

  return {
    commitsLast7Days,
    avgCommitsLast30Days: commits.length / 28,
    lateNightCommits,
    totalCommits: commits.length,
  };
}

// ─── DEVELOPER SUMMARY TEXT ──────────────────────────────────────────────────

function buildSummaryText(
  githubLogin: string,
  name: string | null,
  knowledgeAreas: KnowledgeAreas,
  workStyles: string[],
  focusArea: string | null,
  currentLoad: number
): string {
  const topAreas = Object.entries(knowledgeAreas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area, conf]) => `${area} (${Math.round(conf * 100)}%)`)
    .join(", ");

  return [
    `Developer: ${name ?? githubLogin} (@${githubLogin})`,
    topAreas ? `Knowledge areas: ${topAreas}` : null,
    workStyles.length > 0 ? `Work style: ${workStyles.join(", ")}` : null,
    focusArea ? `Current focus: ${focusArea}` : null,
    `Current load: ${currentLoad}/100`,
  ]
    .filter(Boolean)
    .join(". ");
}

// ─── MAIN PROFILE UPDATE ─────────────────────────────────────────────────────

export async function updateDeveloperProfile(
  orgId: string,
  developerId: string
): Promise<void> {
  const lookbackStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [developer, commits, prs] = await Promise.all([
    prisma.developer.findUnique({
      where: { id: developerId },
      select: { githubLogin: true, name: true },
    }),
    prisma.commit.findMany({
      where: { orgId, developerId, committedAt: { gte: lookbackStart } },
      select: { message: true, committedAt: true },
      orderBy: { committedAt: "desc" },
    }),
    prisma.pullRequest.findMany({
      where: { orgId, authorId: developerId },
      select: { title: true, body: true, state: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  if (!developer) return;

  const knowledgeAreas = buildKnowledgeAreas(commits, prs);
  const workStyles = inferWorkStyles(commits);
  const focusArea = Object.entries(knowledgeAreas).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // strengths = top 3 knowledge areas + up to 2 work styles (descriptive, non-punitive)
  const topAreas = Object.entries(knowledgeAreas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area);
  const strengths = [...topAreas, ...workStyles];

  const [currentLoad, burnoutInputs] = await Promise.all([
    calculateCurrentLoad(orgId, developerId),
    gatherBurnoutInputs(orgId, developerId),
  ]);

  const burnoutSignal = analyzeBurnoutSignal(
    burnoutInputs.commitsLast7Days,
    burnoutInputs.avgCommitsLast30Days,
    burnoutInputs.lateNightCommits,
    burnoutInputs.totalCommits
  );

  await prisma.developer.update({
    where: { id: developerId },
    data: {
      strengths,
      knowledgeAreas,
      focusArea,
      currentLoad,
      burnoutSignal,
      lastProfiledAt: new Date(),
    },
  });

  // Upsert DEVELOPER_SUMMARY embedding so RAG can answer "who knows about X?"
  const summaryContent = buildSummaryText(
    developer.githubLogin,
    developer.name,
    knowledgeAreas,
    workStyles,
    focusArea,
    currentLoad
  );

  const existing = await prisma.embedding.findFirst({
    where: { orgId, sourceType: "DEVELOPER_SUMMARY", sourceId: developerId },
    select: { id: true },
  });

  const embeddingData = {
    content: summaryContent,
    metadata: { knowledgeAreas, workStyles, currentLoad, focusArea } as object,
  };

  if (existing) {
    await prisma.embedding.update({ where: { id: existing.id }, data: embeddingData });
  } else {
    await prisma.embedding.create({
      data: { orgId, sourceType: "DEVELOPER_SUMMARY", sourceId: developerId, ...embeddingData },
    });
  }
}

// ─── BULK UPDATE ─────────────────────────────────────────────────────────────

export async function updateAllDeveloperProfiles(orgId: string): Promise<number> {
  const developers = await prisma.developer.findMany({
    where: { orgId },
    select: { id: true },
  });

  await Promise.all(developers.map((dev) => updateDeveloperProfile(orgId, dev.id)));
  return developers.length;
}
