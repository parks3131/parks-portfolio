# Overview - what this is and who it is for

## The problem

A resume PDF and a GitHub profile both under-sell the same thing: how someone thinks. A PDF
flattens judgment into bullet points, and a repo list makes a reader do the archaeology. The
people who matter here - recruiters, hiring managers, engineers - arrive with about ninety
seconds of attention and a specific question in mind, and that question is rarely "list your
skills".

## The product bet

**Let a visitor ask, in their own words, and answer from real material.** The commands are the
floor: someone who wants the resume gets it in one keystroke. The chat is the ceiling: someone
who wants to know why a decision was made gets the actual reasoning, because the corpus contains
the write-ups rather than a summary of them.

The terminal framing is not decoration. It sets the expectation that this is a place where you
type, which is what makes free-text questions feel native instead of gimmicky.

## Principles

1. **Never fabricate.** A wrong claim about a real person's employment history is worse than any
   number of "I don't have that detail". The chat is grounded in a corpus and says so when the
   corpus does not cover something.
2. **The floor must not depend on the ceiling.** Every command works with the chat endpoint
   completely down. A visitor who never types a question sees a complete portfolio.
3. **Answer the question actually asked.** A recruiter asking about availability should not get
   an essay about a channel log.
4. **It costs real money.** Every question spends the owner's API credit. That is a design
   constraint, not an operational footnote.

## Goals

- A visitor can get the resume, the contact details, and the project list without reading a
  paragraph.
- A visitor can ask a specific question and get a specific, grounded answer.
- The site itself is a work sample: the chat is one of the listed projects, and its own
  architecture is in the corpus.

## Non-goals

- **Not a general-purpose assistant.** It answers about one person. Every other request is
  declined and redirected.
- **Not a CMS.** Content changes are code changes and are reviewed as such.
- **Not multi-user.** No accounts, no sessions, no persistence across visits. The chat history
  lives in memory in the tab and dies with it.
- **Not mobile-first.** It is built to be good on a laptop, acceptable on a phone. The 3D badge
  is the part that suffers, and that is accepted.

## Surfaces

| Surface | What it is |
|---|---|
| Header | Name, and links out to the resume PDF and GitHub |
| Badge | A draggable, physics-simulated ID card on a lanyard |
| Terminal | The command bar, the transcript, and the input |

## Behaviour rules

1. The site is usable with JavaScript-driven 3D unavailable; the terminal is independent of the
   badge.
2. **The chat endpoint being down degrades the site to "commands only", never to broken.** An
   error is rendered into the transcript in the error colour and the visitor can keep typing.
3. Nothing on the page requires a scroll to discover. The command list is visible on load.
