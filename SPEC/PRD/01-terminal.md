# Terminal

## Purpose

The primary surface. A visitor types a command or a question; the transcript accumulates. It
replaces the "scroll through sections" navigation that every other portfolio uses, and it makes
free-text questions feel like the native interaction rather than a bolted-on widget.

## Behaviour rules

1. A recognised command renders immediately from local content and makes **no network call**.
2. Anything unrecognised is treated as a question and sent to the chat endpoint.
3. Command matching is case-insensitive and trims surrounding whitespace.
4. `clear` empties the transcript and **also discards the chat history**, so the next question
   starts a fresh conversation. This is the only way to reset context.
5. Output renders with a typewriter effect, one character at a time, with a caret on the line
   being written.
6. **A click anywhere in the terminal, or any keypress, immediately reveals everything currently
   typing.** See [ADR-0007](../decisions/0007-skip-the-typewriter-rather-than-remove-it.md).
7. **A skip applies only to what exists at that moment.** A command run afterwards animates
   normally, including the command whose own submission triggered the skip.
8. Bare modifier keys (Shift, Control, Alt, Meta) do not trigger a skip, so holding Shift to
   capitalise does not dump the screen.
9. A command that is still typing out **cannot be re-run** by clicking its button again; the
   repeat is ignored until it finishes. This prevents the same output interleaving with itself.
10. The input is disabled while a question is in flight, and the placeholder says so.
11. The transcript auto-scrolls to the bottom as output arrives.
12. Clicking anywhere in the terminal focuses the input.
13. The last ten exchanges are sent as chat history, so follow-up questions like "what about the
    second one" resolve.

## Commands

| Command | Shows |
|---|---|
| `help` | The command list |
| `about` | The summary |
| `projects` | Every project, with tech, highlights and links |
| `skills` | Skills by category |
| `experience` | Roles, with tools and bullets |
| `contact` | Email, GitHub, LinkedIn, resume, location |
| `education` | Degree, GPA, coursework |
| `certifications` | Certification list |
| `leadership` | Leadership and community roles |
| `sudo` | A joke. Deliberately not in `help` |
| `clear` | Empties the transcript and the chat history |

## Edge cases

| State | Behaviour |
|---|---|
| Empty input submitted | Ignored, no transcript entry |
| Chat endpoint returns an error | The error text renders in the transcript in the error colour |
| Network failure | A fallback message suggests using a listed command |
| Question sent while one is in flight | Prevented; the input is disabled |
| Very long output | Scrolls; the caret stays visible because output auto-scrolls |

## Out of scope

- Command history with the up arrow. Deliberate for now, recorded in the roadmap.
- Tab completion.
- Piping, arguments, or anything that implies a real shell. `sudo` is the only nod, and it is a
  joke rather than a feature.

## Acceptance criteria

- [ ] Every command in `help` renders without a network call, verified with the network tab open.
- [ ] With the chat endpoint returning 500, every command still works.
- [ ] Clicking mid-animation completes the output instantly and the caret disappears.
- [ ] A command run after a skip still animates.
- [ ] `clear` followed by a follow-up question shows the model has no prior context.
