# Terminal

## Purpose

The primary surface. A visitor types a command or a question; the transcript accumulates. It
replaces the "scroll through sections" navigation that every other portfolio uses, and it makes
free-text questions feel like the native interaction rather than a bolted-on widget.

## Opening state

The transcript opens on a welcome entry that names both ways in, and it names clicking first.
The commands in the bar are buttons, and a visitor who does not use a terminal should not have to
work that out from a blinking prompt: the first instruction they read is to click one.

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
14. **Tab completes the command being typed**, as a shell does. One match completes it outright;
    several complete as far as they agree and then print the candidates.
15. **Tab never moves focus.** The browser's own behaviour for Tab is to leave the input, and it
    does that whether or not there was anything to complete.
16. Tab with an empty input prints every command. Tab with no match does nothing at all, and
    adds no line to the transcript.
17. Only the first word completes. Once the input contains a space it is a question, not a
    command, so Tab is inert.
18. **Candidates print instantly rather than typing out**, and without a prompt line above them,
    because they are not a command that was run.

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
- Completing anything other than a command name. There are no arguments to complete.
- Requiring a second Tab before listing candidates, as bash does by default. Listing on the
  first Tab is a deliberate deviation: it is friendlier, and there is no screen to flood.
- Piping, arguments, or anything that implies a real shell. `sudo` is the only nod, and it is a
  joke rather than a feature.

## Acceptance criteria

- [ ] Every command in `help` renders without a network call, verified with the network tab open.
- [ ] With the chat endpoint returning 500, every command still works.
- [ ] Clicking mid-animation completes the output instantly and the caret disappears.
- [ ] A command run after a skip still animates.
- [ ] `clear` followed by a follow-up question shows the model has no prior context.
- [ ] Typing `exp` and pressing Tab yields `experience`, with the caret still in the input.
- [ ] Typing `c` and pressing Tab lists the three `c` commands and leaves the input at `c`.
- [ ] Pressing Tab on an unmatched prefix adds nothing to the transcript.
