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

export const about = `Software Engineer with 2 years building backend systems, AI-powered platforms, and production observability infrastructure.

At Acarin, I lead evals and observability for an AI agent HR worker using Langfuse to track LLM traces, prompt performance, and drift across production agent runs, while owning the broader reliability stack for the enterprise AI HR platform. That includes real-time telemetry pipelines (Docker, InfluxDB, Grafana) stress-tested to 20,000 concurrent users, and a Playwright/Cucumber BDD automation suite that eliminated manual regression testing.

At SUNY Research Foundation, I built backend services (Python, FastAPI) and managed data across Amazon RDS (PostgreSQL) and DynamoDB as part of a 5-person Agile team, shipping a nationally distributed digital exhibit platform now serving museum partners across the U.S.

I also built Interstellar, a developer intelligence platform that detects drift between engineering intent and implementation, powered by FastAPI, LLM-based code analysis, and AI evals triggered on every commit.`;

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
};

export const projects: Project[] = [
  {
    name: "vLLM Open Source Contributions",
    tagline: "5 merged PRs across vLLM and vLLM-Playground",
    tech: ["Python", "Regex", "Jinja2", "PyTest", "Docker"],
    highlights: [
      "Implemented official FunctionGemma tool parser in vLLM (#31218)",
      "Fixed Docker vs Podman container status detection",
      "Resolved Start Server button race condition",
      "Built chat export functionality (JSON/Markdown)",
      "Added pre-commit hooks and formatted entire codebase",
    ],
  },
  {
    name: "Interstellar",
    tagline: "Developer intelligence platform that detects drift between engineering intent and implementation",
    tech: ["FastAPI", "Pydantic", "Python", "AI Evals", "GitHub Actions", "REST APIs"],
    highlights: [
      "Co-engineered intent-vs-implementation drift detection with CLEAN architecture service boundaries",
      "Built schema-validated REST APIs for structured LLM-based code analysis",
      "Designed AI eval pipelines to benchmark model output accuracy on every commit",
      "Instrumented pipeline runs and eval results for full traceability and reproducibility",
    ],
  },
  {
    name: "AI-Powered Candidate-to-Job Matching Platform",
    tagline: "Full-stack resume parsing and candidate ranking system",
    tech: ["FastAPI", "PostgreSQL + pgvector", "OpenAI", "Docker", "AWS (EC2, RDS)", "GitHub Actions"],
    highlights: [
      "Parsed PDF resumes into structured JSON via LLM extraction",
      "Ranked 100+ candidate profiles using cosine similarity over 1,536-dim embeddings",
      "Achieved sub-500ms match latency with pgvector indexing and Redis caching",
      "Containerized with Docker, deployed to AWS with CI/CD via GitHub Actions",
    ],
  },
];

export type ExperienceEntry = {
  company: string;
  role: string;
  location: string;
  dates: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    company: "Acarin Inc",
    role: "Software Engineer",
    location: "Baltimore, MD",
    dates: "Mar 2026 – Present",
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
];
