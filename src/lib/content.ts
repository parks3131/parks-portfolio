export const profile = {
  name: "Parksunnath RPK",
  shortName: "Parks",
  location: "Binghamton, NY",
  phone: "+1 (607) 343-8233",
  email: "rpkparks@gmail.com",
  github: "https://github.com/parks3131",
  linkedin: "https://www.linkedin.com/in/parks-rpk-8479a3350/",
  resume: "/Parks_RPK_Resume.pdf",
};

export const about = `Software Engineer with 2 years building backend systems, AI-powered platforms, and production observability infrastructure. The throughline across all of it: making complex systems — especially AI ones — observable and trustworthy instead of black boxes.

At Acarin, I lead evals and observability for an AI agent HR platform, using Langfuse to catch LLM drift in production while owning the broader reliability stack: real-time telemetry (Docker, InfluxDB, Grafana) stress-tested to 20,000 concurrent users, and a Playwright/Cucumber BDD suite that replaced manual regression testing.

Before that, at SUNY Research Foundation, I built backend services in Python/FastAPI across PostgreSQL and DynamoDB as part of a 5-person Agile team, shipping a digital exhibit platform now serving museum partners across the U.S.

Outside of work I ship things end to end — ClubChat, a coordination app my university running club actually uses, now rebuilt from a written postmortem of its own v1; Interstellar, an intent-vs-implementation drift detector; this site's own RAG chatbot; and an AI news platform that curates 70+ sources with no manual input. Type 'projects' to see the full list.

I'm most drawn to the seam between AI and the infrastructure that keeps it honest — evals, tracing, guardrails — the unglamorous plumbing that turns "the demo worked" into "it works in production."`;

export const skills = {
  Languages: ["Python", "Java", "C++", "C", "JavaScript", "TypeScript", "SQL", "Bash"],
  "AI & Data": [
    "Scikit-learn",
    "NumPy",
    "Pandas",
    "OpenCV",
    "Hugging Face",
    "LangChain",
    "RAG",
    "MCP",
    "pgvector",
    "OpenAI APIs",
    "AI Evals",
  ],
  "Web & Backend": [
    "React",
    "React Native / Expo",
    "Node.js",
    "Fastify",
    "Express",
    "FastAPI",
    "Flask",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "WebSockets",
    "Drizzle",
    "REST APIs",
  ],
  Architecture: ["CLEAN Architecture", "Microservices", "RESTful Design", "Event-Driven", "Agile", "Scrum"],
  "Testing & Observability": [
    "Playwright",
    "Cucumber BDD",
    "k6",
    "Testcontainers",
    "Grafana",
    "InfluxDB",
    "Integration & Unit Testing",
    "CI/CD",
    "Evals",
  ],
  "Cloud & DevOps": [
    "Docker",
    "AWS (EC2, RDS, DynamoDB, Aurora)",
    "GitHub Actions",
    "Fly.io",
    "Linux",
    "Infrastructure as Code",
  ],
  Tools: ["Git", "Jira", "Confluence", "Jupyter", "VS Code", "Cursor", "Claude Code", "Navicat"],
} as const;

export type Project = {
  name: string;
  tagline: string;
  tech: string[];
  highlights: string[];
  github?: string;
  links?: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    name: "ClubChat",
    tagline: "Coordination app for university sports clubs — shipped and in daily use, now rebuilt from a written postmortem of its own v1",
    tech: [
      "TypeScript",
      "Node 24",
      "Fastify",
      "Postgres 17",
      "Drizzle",
      "Redis",
      "WebSockets",
      "React Native / Expo",
      "S3",
      "APNs / FCM",
    ],
    highlights: [
      "Built for my university running club — ~100 people coordinating workouts, race logistics, and rosters through a group chat and a lot of screenshots. The product bet: give clubs the structure they're already faking by hand",
      "The organizing idea that kept it small: a Race is a Club nested one level down — same shape, same membership, same permissions. Three scopes, one implementation, DMs later joined as a fourth",
      "v1 shipped on managed Postgres with row-level security and the client talking straight to the database. I wrote the defects down and found they weren't independent: the database was the application server. The remaster puts a real server in the middle and gives the message log a monotonic sequence number",
      "Durable channel log with gapless per-channel sequence numbers, so 'what did I miss' is one integer comparison; domain writes and their effects commit together through a transactional outbox drained with FOR UPDATE SKIP LOCKED",
      "Push is suppressed by the read cursor, never by connection liveness — a live socket proves nothing, and gating on it silently swallows notifications. Liveness may only accelerate delivery, never suppress it",
      "Solo, from written spec to running app: 116 routes, 39 tables, 631 tests against real Postgres and Redis via Testcontainers, a SQL harness that tries to violate every invariant, and a 73-check gate against a running server",
    ],
    github: "https://github.com/parks3131/ClubChat-Remastered",
    links: [{ label: "v1 (shipped)", url: "https://github.com/parks3131/ClubChat" }],
  },
  {
    name: "AI Portfolio Chat (RAG + Guardrails)",
    tagline: "This site's own AI chat — retrieval-augmented answers grounded in an embedded corpus, with guardrails and rate limiting",
    tech: ["Next.js", "TypeScript", "OpenAI Embeddings", "Neon (pgvector)", "Upstash Redis", "OpenRouter"],
    highlights: [
      "Replaced a static system prompt with a RAG pipeline — chunked my resume and project write-ups into an embedded corpus in Neon, retrieved by HNSW cosine search per question instead of stuffing everything into every request",
      "Added input/output guardrails (jailbreak and prompt-leak detection, length limits) and Upstash sliding-window rate limiting to protect a public endpoint spending real API credits",
      "Proudest moment: catching my own guardrail bug in review — an output-leak check still matched the old prompt's section headers after I'd already switched the prompt to a retrieval-based format, a reminder to test what a change actually produces, not what used to be true",
    ],
    github: "https://github.com/parks3131/parks-portfolio",
  },
  {
    name: "Interstellar",
    tagline: "Developer intelligence platform that catches drift between engineering intent and implementation",
    tech: ["FastAPI", "Pydantic", "Python", "PostgreSQL", "Neo4j", "AI Evals", "OpenRouter"],
    highlights: [
      "LLM reasoning engine compares Jira ticket intent against live GitHub PR diffs, classifies scope drift by severity, and generates a structured remediation spec — validated end-to-end against real webhooks, not mocks",
      "Dual-store persistence: Postgres for drift history, Neo4j for engineer/PR/service graphs, with real-time Slack alerting",
      "Each layer degrades gracefully, so a downstream outage never drops a result",
    ],
    github: "https://github.com/parks3131/Interstellar",
  },
  {
    name: "Parks's News",
    tagline: "AI news platform — a real-time web app plus an autonomous daily newsletter, aggregating 70+ sources with zero manual curation",
    tech: ["Next.js", "TypeScript", "Python", "OpenRouter", "GitHub Actions", "LangChain", "Server-Sent Events"],
    highlights: [
      "Aggregates 70+ sources (RSS, Reddit, Hacker News, arXiv, NewsAPI) and uses LLM agents to read, rank, and summarize by significance, novelty, and recency",
      "Runs as a serverless, self-healing pipeline on a GitHub Actions cron with graceful fallbacks at every failure point — no server to maintain",
      "Batched LLM calls and 15-minute caching cut multi-source fetch time from ~15s to ~3s; the web app streams intermediate agent state (fetching → ranking → done) over SSE instead of a blocking spinner",
      "Proud moment: built the 'proper' agentic tool-calling loop first, then noticed the task was always the same five steps and deliberately simplified to a deterministic pipeline — judgment over cleverness",
    ],
    github: "https://github.com/parks3131/parks-s-news",
    links: [{ label: "Newsletter repo", url: "https://github.com/parks3131/parks-news-letter" }],
  },
  {
    name: "MICASA UX Hackathon — Runner-Up",
    tagline: "Redesigned guest onboarding for MICASA, a platform reimagining \"third spaces\" for artists and creatives",
    tech: ["Figma"],
    highlights: [
      "Designed lo-fi and hi-fi prototypes introducing invite-code entry, deferred signup, and dashboard-first navigation",
      "Improved event discoverability and first-time guest engagement, validated through judge feedback",
    ],
  },
  {
    name: "Quantum Computing Research",
    tagline: "Research under Prof. Yiming Zheng on quantum algorithms and error correction",
    tech: ["Qiskit"],
    highlights: [
      "Implementing quantum circuits to explore applications in secure computing and cryptography",
      "Preparing findings for conference submission and assisting with lab publications",
    ],
  },
];

export type ExperienceEntry = {
  company: string;
  role: string;
  location: string;
  dates: string;
  tools: string[];
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    company: "Acarin Inc",
    role: "Software Engineer",
    location: "Baltimore, MD",
    dates: "Mar 2026 – Present",
    tools: ["Docker", "InfluxDB", "Grafana", "Keycloak", "k6"],
    bullets: [
      "Built a real-time observability pipeline (Docker, InfluxDB, Grafana) surfacing p95/p99 latency, error rates, and throughput for an AI HR platform under 20,000 concurrent virtual users",
      "Designed per-user telemetry tracking end-to-end latency across Keycloak SSO auth, LLM response, and UI render stages",
      "Instrumented MissionMind AI's HR Worker using k6 to model multi-step user journeys, exposing LLM timeouts and permission gaps before production",
      "Delivered structured failure telemetry reports correlating auth, LLM, and rendering bottlenecks to backend fixes, informing sprint planning for an 8-person Agile team",
    ],
  },
  {
    company: "Acarin Inc",
    role: "Software Automation Engineer Intern",
    location: "Baltimore, MD",
    dates: "Jan 2026 – Mar 2026",
    tools: ["Playwright", "Cucumber", "TypeScript", "GitHub Actions", "Claude Code MCP"],
    bullets: [
      "Built an end-to-end BDD automation suite (Playwright + Cucumber, TypeScript) via GitHub Actions CI/CD, replacing manual regression testing",
      "Designed a three-layer Page Object Model following CLEAN architecture, enabling non-technical QA to write test scenarios in plain English",
      "Integrated Playwright MCP with Claude Code to automate broken UI selector discovery and patching live, cutting workflow creation from days to hours",
    ],
  },
  {
    company: "SUNY Research Foundation",
    role: "Back End Developer",
    location: "Binghamton, NY",
    dates: "Feb 2025 – Dec 2025",
    tools: ["Python", "FastAPI", "Pydantic", "PostgreSQL", "DynamoDB", "GitHub Actions"],
    bullets: [
      "Developed backend services with Python/FastAPI and Pydantic-validated RESTful endpoints for research data ingestion",
      "Managed relational data in Amazon RDS (PostgreSQL) with normalized schemas and optimized queries",
      "Stored and queried flexible document data in Amazon DynamoDB for high-throughput, low-latency reads",
      "Set up and maintained a GitHub Actions CI/CD pipeline, automating build/test/deploy stages",
      "Shipped a nationally distributed digital exhibit platform now serving museum partners across the U.S.",
    ],
  },
];

export const education = {
  school: "Binghamton University, State University of New York",
  degree: "Bachelor of Science in Computer Science",
  gpa: "3.80",
  honors: "Dean's List",
  date: "May 2026",
  coursework: [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Machine Learning",
    "Operating Systems",
    "Computer Architecture",
    "Database Systems",
    "Computer Networks",
    "Theory of Computation",
    "Cloud Computing",
    "AI",
  ],
};

export const certifications = [
  "Claude Advanced MCP & AI API Building — Anthropic",
  "Python, C, C++ — IIT Bombay",
  "OpenCV — University at Buffalo",
  "Google Data Analytics",
];

export const leadership = [
  {
    role: "Course Assistant, Data Structures & Algorithms",
    org: "Binghamton University",
    dates: "Jan 2025 – May 2026",
    detail: "Designed coding problems and test cases; supported students with debugging during weekly labs and office hours.",
  },
  {
    role: "Member, Association for Computing Machinery (ACM)",
    org: "Binghamton University",
    dates: "Oct 2024 – May 2026",
    detail: "Ran weekly data-structures workshops and presented on emerging technologies.",
  },
  {
    role: "Core Member, Google Developer Student Club",
    org: "VIT Chennai",
    dates: "Aug 2022 – Jul 2024",
    detail: "Led operations for a 72-hour zonal hackathon with 1,500+ participants.",
  },
  {
    role: "VP of Public Relations, Toastmasters Club",
    org: "VIT Chennai",
    dates: "Nov 2023 – Aug 2024",
    detail: "Tracked and guided 30+ members through educational speech pathways.",
  },
  {
    role: "Residential Computer Consultant (ResCon)",
    org: "Binghamton University ITS",
    dates: "Feb 2025 – Jan 2026",
    detail: "Provided tier-1 technical support to on-campus residents, troubleshooting Wi-Fi, network, OS, and account issues within a 24–48 hour SLA.",
  },
];
