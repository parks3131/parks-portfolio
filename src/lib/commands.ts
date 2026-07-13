import {
  about,
  certifications,
  education,
  experience,
  leadership,
  profile,
  projects,
  skills,
} from "@/lib/content";

export const COMMAND_LIST = [
  "help",
  "about",
  "projects",
  "skills",
  "experience",
  "contact",
  "education",
  "certifications",
  "leadership",
  "sudo",
  "clear",
] as const;

export type Segment = { text: string; className?: string; href?: string };
export type OutputLine = { segments: Segment[]; indent?: boolean };

const seg = (text: string, className?: string, href?: string): Segment => ({ text, className, href });
const line = (...segments: Segment[]): OutputLine => ({ segments });
const indented = (...segments: Segment[]): OutputLine => ({ segments, indent: true });
const blank = (): OutputLine => ({ segments: [seg(" ")] });

const HELP_ENTRIES: [string, string][] = [
  ["about", "Learn about me"],
  ["projects", "View my projects"],
  ["skills", "See my technical skills"],
  ["experience", "My work experience"],
  ["contact", "How to reach me"],
  ["education", "My educational background"],
  ["certifications", "View my certifications"],
  ["leadership", "Leadership and community involvement"],
  ["clear", "Clear the terminal"],
];

const CMD_PAD = Math.max(...HELP_ENTRIES.map(([cmd]) => cmd.length)) + 3;

function renderHelp(): OutputLine[] {
  return [
    line(seg("Available commands:")),
    blank(),
    ...HELP_ENTRIES.map(([cmd, desc]) =>
      line(seg(cmd.padEnd(CMD_PAD), "text-cyan-400"), seg(`— ${desc}`, "text-neutral-400")),
    ),
  ];
}

function renderAbout(): OutputLine[] {
  return [
    line(seg(`About ${profile.shortName}`, "text-amber-400")),
    blank(),
    ...about
      .split("\n\n")
      .flatMap((para) => [
        ...para.split("\n").map((row) =>
          row.startsWith("- ") ? indented(seg(row)) : line(seg(row)),
        ),
        blank(),
      ])
      .slice(0, -1),
  ];
}

function renderProjects(): OutputLine[] {
  const lines: OutputLine[] = [line(seg("Projects", "text-amber-400")), blank()];
  projects.forEach((project, i) => {
    lines.push(line(seg(`${i + 1}. `, "text-neutral-400"), seg(project.name, "text-cyan-400")));
    lines.push(indented(seg(project.tagline, "text-neutral-300")));
    lines.push(indented(seg(`Technologies: ${project.tech.join(", ")}`, "text-neutral-500")));
    project.highlights.forEach((h) => lines.push(indented(seg(`- ${h}`))));
    if (project.github) {
      lines.push(indented(seg("GitHub: "), seg(project.github, "text-cyan-400 underline", project.github)));
    }
    lines.push(blank());
  });
  return lines.slice(0, -1);
}

function renderSkills(): OutputLine[] {
  return [
    line(seg("Skills", "text-amber-400")),
    blank(),
    ...Object.entries(skills).map(([category, items]) =>
      line(seg(`${category}: `, "text-cyan-400"), seg(items.join(", "), "text-neutral-300")),
    ),
  ];
}

function renderExperience(): OutputLine[] {
  const lines: OutputLine[] = [line(seg("Experience", "text-amber-400")), blank()];
  experience.forEach((job) => {
    lines.push(line(seg(job.role, "text-cyan-400"), seg(` · ${job.company}`, "text-neutral-400")));
    lines.push(indented(seg(`${job.location} · ${job.dates}`, "text-neutral-500")));
    lines.push(
      indented(
        ...job.tools.flatMap((tool, i) => [
          seg(i === 0 ? "" : " ", "text-neutral-600"),
          seg(`[${tool}]`, "text-emerald-400"),
        ]),
      ),
    );
    job.bullets.forEach((b) => lines.push(indented(seg(`- ${b}`))));
    lines.push(blank());
  });
  return lines.slice(0, -1);
}

function renderContact(): OutputLine[] {
  return [
    line(seg("Contact", "text-amber-400")),
    blank(),
    line(seg("Email: "), seg(profile.email, "text-cyan-400 underline", `mailto:${profile.email}`)),
    line(seg("GitHub: "), seg(profile.github, "text-cyan-400 underline", profile.github)),
    line(seg("LinkedIn: "), seg(profile.linkedin, "text-cyan-400 underline", profile.linkedin)),
    line(seg(profile.location, "text-neutral-500")),
  ];
}

function renderEducation(): OutputLine[] {
  return [
    line(seg("Education", "text-amber-400")),
    blank(),
    line(seg(education.school, "text-cyan-400")),
    line(seg(`${education.degree} · GPA: ${education.gpa} · ${education.honors}`)),
    line(seg(education.date, "text-neutral-500")),
    blank(),
    line(seg("Relevant coursework:", "text-neutral-400")),
    ...education.coursework.map((c) => indented(seg(`- ${c}`))),
  ];
}

function renderCertifications(): OutputLine[] {
  return [
    line(seg("Certifications", "text-amber-400")),
    blank(),
    ...certifications.map((c) => line(seg(`- ${c}`))),
  ];
}

function renderLeadership(): OutputLine[] {
  const lines: OutputLine[] = [line(seg("🤝 Leadership & Community", "text-amber-400")), blank()];
  leadership.forEach((entry) => {
    lines.push(line(seg(entry.role, "text-cyan-400"), seg(` · ${entry.org}`, "text-neutral-400")));
    lines.push(indented(seg(entry.dates, "text-neutral-500")));
    lines.push(indented(seg(entry.detail, "text-neutral-300")));
    lines.push(blank());
  });
  return lines.slice(0, -1);
}

function renderSudo(): OutputLine[] {
  return [
    line(
      seg("Nice try. Permission denied — you are not root of my career. ", "text-rose-400"),
      seg("(but feel free to check my GitHub, that part's public)", "text-neutral-400"),
    ),
  ];
}

export function renderCommand(raw: string): OutputLine[] | null {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case "help":
      return renderHelp();
    case "about":
      return renderAbout();
    case "projects":
      return renderProjects();
    case "skills":
      return renderSkills();
    case "experience":
      return renderExperience();
    case "contact":
      return renderContact();
    case "education":
      return renderEducation();
    case "certifications":
      return renderCertifications();
    case "leadership":
      return renderLeadership();
    case "sudo":
      return renderSudo();
    default:
      return null;
  }
}

export function textToLines(text: string): OutputLine[] {
  return text.split("\n").map((t) => line(seg(t || " ")));
}
