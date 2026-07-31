# Badge scene

## The rig

A fixed anchor, three rope-jointed chain links, and the card on a spherical joint. All of it
lives in a `<Physics>` world with gravity, inside a `<Canvas>` that is `ssr: false`.

The lanyard strap is a `meshline` whose points are recomputed every frame from a Catmull-Rom
curve through the four body positions.

## Three things that will crash it

These are in the code as comments too, because each one killed the tab.

1. **A nonzero pivot on the card's spherical joint.** The card body starts almost coincident with
   the last chain link. A nonzero pivot creates a large initial position error, the solver snaps
   it shut over the first few steps, velocities blow up to NaN or Infinity, and the WebGL context
   dies. Both pivots are zero; the visual offset (the card hanging below its origin) is applied
   **inside** the rigid body, where it does not touch joint math.

2. **NaN reaching the geometry buffer.** A hard drag-throw can produce a non-finite position for
   a frame. Writing that into the meshline corrupts the buffer and can lose the context, taking
   the terminal with it. Every curve point is checked with `Number.isFinite` before the points
   are set.

3. **Solid colliders on the chain links.** The links exist only to define the rope's shape and
   swing. Nothing else is in the scene to collide with, so solid colliders produce jittery
   self-contact and the badge never settles. They are sensors.

## Dragging

On pointer down the card switches to `kinematicPosition` and follows the unprojected pointer; on
release it returns to `dynamic` and the physics takes over. The grab offset is captured at
pointer-down so the card does not snap its origin to the cursor.

Every body is woken each frame during a drag, because `canSleep` is on and a sleeping body
ignores a kinematic move.

## The hard rule for anything decorative

**Anything added to the scene must set `raycast={() => null}` unless it is meant to be
grabbable.** A decorative mesh in front of the card silently steals the pointer events the drag
depends on, and the symptom is "the badge stopped working" with nothing in the console.

## The card photo

A PNG whose background was keyed out ahead of time, drawn on a plane rather than masked into a
circle. Three things about it are deliberate.

- **The plane keeps the image's aspect ratio**, derived from the pixel dimensions in the
  component. Picking a width and a height independently stretches the figure, and on a face that
  is subtle enough to ship.
- **`alphaTest` is set.** A transparent quad still writes depth across its whole rectangle, so
  without it the invisible margin masks the flames behind the card.
- **The image fades to nothing along its bottom edge**, which is why the name is legible sitting
  over the end of it. The photo crops the body mid-torso, and a hard edge there reads as a
  sticker.
- **It is stored at full source resolution with anisotropy set**, because the card swings and a
  slanted sample through plain trilinear filtering is where the softness comes from. Anisotropy
  goes on in the `useTexture` load callback: mutating the hook's return value afterwards is what
  the React immutability lint exists to stop.

[`scripts/photo-cutout.mjs`](../../scripts/photo-cutout.mjs) produces the file, and replacing the
photo means rerunning it rather than keying by hand. Keying is a flood fill inward from the
frame, not a threshold on white: the tank top in the photo is full of white stripes and stars,
and a global threshold punches holes straight through them. Only white connected to the border is
background.

## Both faces

The card's content is rendered twice, the second inside a group rotated by pi about Y, so the
badge reads correctly from either side. A change to one face must be made to the shared
component, not to one copy.
