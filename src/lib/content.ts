export const profile = {
  name: "Parksunnath RPK",
  shortName: "Parks",
  title: "Software Engineer",
  location: "Binghamton, NY",
  phone: "+1 (607) 343-8233",
  email: "rpkparks@gmail.com",
  github: "https://github.com/parks3131",
  linkedin: "https://www.linkedin.com/in/parks-rpk-8479a3350/",
};

export const about = `Software Engineer with 2 years building backend systems, AI-powered platforms, and production observability infrastructure. The throughline across all of it: making complex systems — especially AI ones — observable and trustworthy instead of black boxes.

At Acarin, I lead evals and observability for an AI agent HR platform, using Langfuse to catch LLM drift in production while owning the broader reliability stack: real-time telemetry (Docker, InfluxDB, Grafana) stress-tested to 20,000 concurrent users, and a Playwright/Cucumber BDD suite that replaced manual regression testing.

Before that, at SUNY Research Foundation, I built backend services in Python/FastAPI across PostgreSQL and DynamoDB as part of a 5-person Agile team, shipping a digital exhibit platform now serving museum partners across the U.S.

Outside of work I build end-to-end AI systems for fun — Interstellar (an intent-vs-implementation drift detector), this site's own RAG chatbot, an automated news digest agent, and more. Type 'projects' to see the full list.

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
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "FastAPI",
    "Flask",
    "Django",
    "Pydantic",
    "REST APIs",
    "WordPress",
  ],
  "Architecture & Patterns": ["CLEAN Architecture", "Microservices", "RESTful Design", "Agile", "Scrum"],
  "Testing & Observability": [
    "k6",
    "Playwright",
    "Cucumber BDD",
    "Grafana",
    "InfluxDB",
    "Integration & Unit Testing",
    "CI/CD",
    "Evals",
  ],
  "Cloud & DevOps": ["Docker", "AWS (EC2, RDS, DynamoDB, Aurora)", "Databricks", "GitHub Actions", "Linux", "IaC"],
  Tools: ["Git", "Jira", "Confluence", "Jupyter", "VS Code", "Cursor", "Navicat", "Claude Code"],
} as const;

export type Project = {
  name: string;
  tagline: string;
  tech: string[];
  highlights: string[];
  github?: string;
};

export const projects: Project[] = [
  {
    name: "Portfolio AI Chat (RAG + Guardrails)",
    tagline: "This site's own AI chat — retrieval-augmented answers grounded in an embedded corpus, with guardrails and rate limiting",
    tech: ["Next.js", "PostgreSQL + pgvector", "Neon", "OpenAI Embeddings", "Upstash Redis", "OpenRouter"],
    highlights: [
      "Chunked my resume and project write-ups into an embedded corpus in Neon Postgres, retrieved by cosine similarity per question instead of stuffing everything into one static prompt",
      "Added regex-based jailbreak/off-topic guardrails and Upstash-backed per-IP rate limiting to protect a public endpoint spending real API credits",
      "Proudest moment: catching my own guardrail bug in review — an output-leak check still matched the old prompt's section headers after I'd already switched the prompt to a retrieval-based format, a reminder to test what a change actually produces, not what used to be true",
    ],
    github: "https://github.com/parks3131/parks-portfolio",
  },
  {
    name: "ClubChat",
    tagline: "Team communication app for running clubs — chat, calendar, and race logistics as one nested data model",
    tech: ["React Native", "Expo", "Supabase", "PostgreSQL", "Row-Level Security"],
    highlights: [
      "Proudest architectural decision: modeled clubs and races as the same nested shape via a generic messaging table with nullable foreign keys, so race sub-chat, carpools, and results reused every feature with zero duplicated code",
      "Tracked down a subtle Postgres RLS chicken-and-egg bug in INSERT ... RETURNING and fixed it with a documented policy pattern",
      "Shipped soft-delete moderation, self-service account deletion, and in-app Privacy Policy/Terms alongside full test coverage + CI",
    ],
    github: "https://github.com/parks3131/ClubChat",
  },
  {
    name: "Parks Tech USA Daily Brief",
    tagline: "Automated newsletter that scrapes, ranks, and emails a personal daily tech/immigration digest every morning",
    tech: ["Python", "GitHub Actions", "OpenRouter", "Resend", "ThreadPoolExecutor"],
    highlights: [
      "Fetches ~10 sources in parallel (Hacker News, 16+ RSS feeds, Dev.to, NewsAPI, arXiv, Reddit), dedupes, and has an LLM rank and summarize the best stories",
      "Runs server-free on a GitHub Actions cron, with DKIM/SPF/DMARC on a custom domain so mail lands in the inbox",
      "Proud moment: built the 'proper' agentic tool-calling loop first, then noticed the task was always the same five steps and deliberately simplified to a direct deterministic pipeline — judgment over cleverness",
    ],
    github: "https://github.com/parks3131/parks-news-letter",
  },
  {
    name: "Parks News",
    tagline: "LLM news-curation agent that streams live rankings across 18 sources instead of a static feed",
    tech: ["Next.js", "TypeScript", "OpenAI SDK", "Server-Sent Events"],
    highlights: [
      "Agent decides which sources to call, fetches them in parallel, and ranks stories by significance, novelty, and recency",
      "Streams intermediate agent state (fetching → ranking → done) over SSE instead of a blocking spinner",
      "15-minute in-memory cache and Vitest unit tests keep it fast and reliable",
    ],
    github: "https://github.com/parks3131/parks-s-news",
  },
  {
    name: "Interstellar",
    tagline: "Developer intelligence platform that catches drift between engineering intent and implementation",
    tech: ["FastAPI", "Pydantic", "PostgreSQL", "Neo4j", "Next.js", "OpenRouter"],
    highlights: [
      "Two-pass LLM reasoning holds Jira/PRD intent and live GitHub PR diffs in context to classify drift as NONE/HIGH/CRITICAL",
      "Generates a structured remediation spec on drift and posts real-time alerts to Slack with severity and a PR link",
      "Neo4j knowledge graph links engineers, PRs, tickets, and services for relationship queries beyond simple event logs",
    ],
    github: "https://github.com/parks3131/Interstellar",
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
