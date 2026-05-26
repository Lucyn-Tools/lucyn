<div align="center">

# Lucyn

**The institutional memory of your company.**

Lucyn turns scattered company knowledge into a living, connected map
of how your company actually works — then makes it searchable,
queryable, and actionable.

![Build](https://img.shields.io/github/actions/workflow/status/Lucyn-Tools/Lucyn/ci.yml?branch=main&label=CI&style=flat-square)
![License](https://img.shields.io/badge/license-Proprietary-red?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-D4A27F?style=flat-square)
![Vercel](https://img.shields.io/badge/Web-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Bot-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)

</div>

---

## What is Lucyn?

Most companies lose knowledge constantly — decisions disappear into meeting transcripts nobody reads, critical systems are understood by one person, and new hires spend months piecing together context that should be written down somewhere. Lucyn connects to GitHub, Discord, and Google Meet, ingests commits, pull requests, conversations, and meeting transcripts continuously, and builds a structured knowledge graph of how your company actually works. Ask it anything in plain English — who knows the payments service, what was decided in last week's planning meeting, where your knowledge gaps are — and get grounded, cited answers in seconds. Unlike a wiki or a search tool, Lucyn acts on what it knows: it surfaces decisions, maps knowledge ownership, and recommends actions that still require human approval before anything happens.

---

## The Problem

| The knowledge loss | What happens today |
|---|---|
| Decisions made in meetings | Disappear into transcripts nobody reads |
| Critical systems understood by one person | Bus factor 1, discovered when they leave |
| New hires onboarding | Weeks of piecing together context that should be written down |
| Why something was built a certain way | Nobody remembers, the Slack thread is gone |
| Who to ask about a specific part of the product | Whoever shouts loudest or has been here longest |

---

## How Lucyn Works

**1. Ingests**
Lucyn connects to GitHub, Discord, and Google Meet. It reads commits, pull requests, meeting transcripts, and conversations continuously — not as a one-time import but as a living feed.

**2. Maps**
Everything ingested is classified, embedded, and written into a structured knowledge graph stored as human-readable Markdown files in an Obsidian-compatible vault. Repositories, developers, decisions, and meetings become connected nodes you can navigate.

**3. Answers**
Ask Lucyn anything about your company in plain English. It retrieves the relevant context from the knowledge graph and answers with citations. Who knows the payments service? What was decided in last week's planning meeting? Where are our knowledge gaps? Answered in seconds, not sprint reviews.

---

## The Three Surfaces

<table>
<tr>
<td width="33%" valign="top">

### Chat
**Ask anything.**

The primary interface. Ask Lucyn anything about your company
and get a grounded, cited answer drawn from everything it has
ingested. Decisions, people, code, meetings — all connected.

</td>
<td width="33%" valign="top">

### Dashboard
**See what's happening.**

A live view of company knowledge health. What the team is
working on, where knowledge gaps exist, which systems have
bus factor 1, and what decisions are still open.

</td>
<td width="33%" valign="top">

### Knowledge Vault
**The company brain, made visible.**

Every repository, developer, decision, and sprint recorded
as structured Markdown in an Obsidian-compatible vault.
Human-readable, editable, and continuously updated.

</td>
</tr>
</table>

---

## Stack

- **Web app**: Next.js 15 + Clerk auth + Tailwind CSS, deployed on Vercel
- **Discord bot**: discord.js v14, deployed on Railway
- **Database**: PostgreSQL on Railway, accessed via Prisma + pgvector
- **AI**: Anthropic Claude (Sonnet for analysis, Haiku for summaries, Opus for complex reasoning)
- **Auth**: Clerk (multi-tenant, org-aware)
- **Monorepo**: pnpm workspaces + Turborepo

---

## Repo Structure

```
lucyn/
├── apps/
│   ├── web/           → Next.js dashboard + chat interface (Vercel)
│   └── discord-bot/   → Company knowledge signals from Discord (Railway)
├── packages/
│   ├── db/            → Prisma schema + Railway PostgreSQL + pgvector
│   ├── ai/            → Claude reasoning, RAG, embeddings, knowledge retrieval
│   ├── github/        → GitHub ingestion + webhook processing
│   └── compression/   → LucynCompress — token compression for AI calls
└── .github/
    └── workflows/     → CI (ci.yml) + database migrations (migrate.yml)
```

---

## Roadmap

**Phase 1 — Foundation (Weeks 1–4)**
- [x] Monorepo architecture (pnpm + Turborepo)
- [x] Database schema — multi-tenant, pgvector enabled (Railway)
- [x] Proprietary license
- [x] Clerk authentication
- [ ] GitHub App creation
- [x] Next.js app shell
- [ ] Discord bot service on Railway
- [ ] Vercel deployment
**Phase 2 — Knowledge Layer (Weeks 5–8)**
- [ ] GitHub webhook receiver
- [ ] Commit and PR ingestion pipeline
- [ ] Developer knowledge profile builder
- [ ] Knowledge classification engine
- [ ] Embedding pipeline
- [ ] RAG retrieval system
- [ ] Company brain vault — repository pages
- [ ] Company brain vault — developer knowledge pages
- [ ] Company brain vault — decision and sprint records
- [ ] Knowledge ownership map
**Phase 3 — Surfaces (Weeks 9–12)**
- [ ] Company knowledge dashboard
- [ ] Company knowledge directory (people)
- [ ] Service knowledge map (repositories)
- [ ] Company brain chat interface
- [ ] Knowledge retrieval API
- [ ] Discord bot + developer linking
- [ ] Task recommendation engine
- [ ] Task approval interface
- [ ] Onboarding flow
**Later**
- [ ] Slack ingestion
- [ ] Notion / Confluence document ingestion
- [ ] Google Meet agent (live meeting participation)
- [ ] Knowledge graph visualisation
- [ ] Cross-company knowledge benchmarks (opt-in)

## Privacy and Trust

Lucyn handles sensitive company data. These are non-negotiable:
- **Knowledge is org-scoped.** No data is ever shared across organisations. Every query, every retrieval, every stored embedding is scoped to the authenticated org.
- **Developer knowledge profiles are private.** They are never shown to managers as performance data. They exist to route knowledge and work correctly — not to evaluate people.
- **No surveillance.** Lucyn observes activity to build knowledge maps, not to monitor individuals. There are no individual productivity scores.
- **Human approval always.** Every suggested action — task assignment, escalation, follow-up — requires human approval before anything happens.
- **GDPR-compliant by design.** Data handling is built around privacy from the ground up, not bolted on later.

---

## Contributing
Lucyn is proprietary software in active development.
External contributions are not open at this time.

If you are interested in early access or want to be a design
partner, reach out directly.

---
Built with [Claude](https://anthropic.com) by Lucyn Tools.
