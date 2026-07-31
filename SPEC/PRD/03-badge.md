# Badge

## Purpose

The visual signature of the site. A physics-simulated ID card hanging from a lanyard that a
visitor can grab and throw around. It exists to be memorable and to demonstrate comfort with
something outside the usual web stack; it carries no information the terminal does not also give.

## Behaviour rules

1. The badge is draggable with a pointer and swings under gravity when released.
2. **The card is legible from both faces.** Its content is mirrored, so it reads correctly no
   matter how it is spun.
3. **The photo is a full-frame cut-out, not a framed headshot.** The figure stands on the card
   with no background of its own, so the card reads as a person rather than a picture of one.
4. **Nothing decorative may capture a pointer event.** Effects and particles are excluded from
   hit testing, or the badge stops being draggable.
5. **The scene must never take the page down with it.** Physics instability is guarded rather
   than allowed to reach the GL buffer; a lost WebGL context would take the whole tab, including
   the terminal, which is the part that matters.
6. It renders client-side only, with a loading placeholder, because it cannot server-render.
7. On a narrow viewport it takes a fixed height above the terminal rather than half the screen.

## Out of scope

- Any information that exists only on the badge. It is decoration, and a visitor who never sees
  it loses nothing.
- Mobile drag polish. Accepted as weaker.

## Acceptance criteria

- [ ] The badge can be dragged, thrown hard, and released without the scene dying.
- [ ] Text is right-reading from both sides.
- [ ] With the badge removed from the page entirely, the terminal is unaffected.
