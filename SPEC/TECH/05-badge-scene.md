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

## Both faces

The card's content is rendered twice, the second inside a group rotated by pi about Y, so the
badge reads correctly from either side. A change to one face must be made to the shared
component, not to one copy.
