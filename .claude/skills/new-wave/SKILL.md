---
name: new-wave
description: Add or change a wave in Neon Spore — the one-sentence test, figures, column mapping and the timing check. Use when authoring waves, levels, acts, choreography or boss encounters.
---

# Adding a wave

## 1. The one-sentence test

Write `sentence` first, before any entries:

> "The one where you never keep the same colour twice."
> "The one where you are not allowed to dodge."

If no such sentence exists, the wave is padding. Cut it. This test is stricter
than it sounds — realistically it carries 60–80 waves, not 200.

## 2. Author it

Waves are data in `packages/content/src/waves.ts`. Columns are authored against
a **7-column** field and remapped at runtime; `beat` is the offset from the
start of the wave.

```ts
{
  name: "THE WALL",
  sentence: "The one where the cannon never stops moving.",
  hint: "A broad front — change columns fast.",
  entries: [{ beat: 0, col: 0, color: "alt" }],
}
```

`color`: a fixed colour, `"alt"` to alternate, `"any"` to draw from the seeded
rng, or `null` with `kind: "meteor"` for the rock, which carries none.

A living creature's **kind is not written down** — the colour decides it
(`kindForColor`). One kind is one colour and one silhouette, so a red one is a
slick and a cyan one is a bulb; naming both would only let them disagree.

## 3. Variation before new material

Reach for these before inventing a creature. Each one makes a known wave feel
new without anything being drawn:

- **mixture** — a meteor between slicks forces switching between the two jobs
- **controls** — a wave that *removes* a control group is the strongest lever
- **direction and density** — from below, from two sides, clustered
- **beat** — on the pulse instead of free; this changes the talking more than
  any new creature
- **modifiers** — echo, interference, camouflage, countdown, reversed orders

## 4. Where it belongs

New creatures only up to about wave 50. After that: recombination and modifiers
only. A creature belongs in the act of its pillar, not wherever there is room.

## 5. Check

```
bun test packages/content
bun run check
```

The content tests verify the one-sentence test, the column range and that the
queue builds identically every time.
