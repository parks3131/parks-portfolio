# Terminal rendering

## The one output shape

Everything in the transcript is `OutputLine[]`:

```ts
type Segment = { text: string; className?: string; href?: string }
type OutputLine = { segments: Segment[]; indent?: boolean }
```

A command builds these directly; a chat answer goes through `textToLines`, which splits on
newlines into single-segment lines. **There is no second path.** That is what lets the typewriter
work on model output and on a hand-built table identically, and why a new command must return
this shape rather than a string of HTML.

Empty lines carry a single space rather than an empty string, so they occupy a row.

## The typewriter

`TypedOutput` walks two indices: the line being written and how many characters of it are
revealed. Completed lines render whole; the active line renders a prefix plus a caret. 10ms per
character, 45ms between lines.

Segments complicate this: revealing N characters of a line means walking the segments and
slicing, so a link that starts mid-line reveals progressively and stays a link.

## Skip

`revealAll` is **derived into render, not pushed into state.** When it is true the component
renders every line whole and the timer effect returns early. Pushing it into state would race the
pending character timer.

The trigger is a watermark, not a flag: the terminal records the highest entry id that existed
when the click or keypress landed, and an entry is revealed if its id is at or below it.
Anything created afterwards gets a higher id and animates.

Two ordering details that are easy to get wrong and were both got wrong once:

- **Command-bar buttons must stop propagation.** A click bubbles to the container after the
  button's handler has already created the new entry, so without this the command skips its own
  animation.
- **Enter is safe without special handling** because keydown fires before the form submits, so
  the watermark is taken before `runCommand` hands the new entry a higher id.

## Re-run suppression

A set of lowercased commands currently typing. A repeat is ignored until `onDone` clears it.
Without this, double-clicking `projects` interleaves two copies of the same output.

Note the interaction with skip: a skip fires `onDone` immediately, which clears the entry from
that set, so a skipped command becomes re-runnable at once. That is the intended behaviour.

## Tab completion

`completeCommand` lives beside `COMMAND_LIST` rather than in the component, because which strings
are completable is command knowledge. It is pure and returns one of three shapes: `none`,
`single`, or `ambiguous` carrying both the longest common prefix and the candidates.

`preventDefault` runs before anything else in the key handler. Tab's default is to move focus out
of the input, and it does that whether or not a completion was found, so deciding first and
preventing second loses focus on every unmatched Tab.

Candidates are pushed into the transcript as an entry with **`command: null`** (so no prompt line
renders above them) and **`instant: true`** (so `TypedOutput` reveals them whole). Both fields
exist for this one case. Typing the candidate list out character by character would make Tab
slower than typing the command it was meant to save.

Note the interaction with skip: the window keydown listener fires for Tab as well, so a Tab
during an animation both completes and skips. That is consistent with "any key skips" and is
intended.
