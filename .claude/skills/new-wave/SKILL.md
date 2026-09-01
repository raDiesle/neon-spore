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

Waves are data in `packages/content/src/waves/act-*.ts` (`waves.ts` is only the
barrel that concatenates them). Columns are authored against a **7-column**
field and remapped at runtime; `beat` is the offset from the start of the wave.

```ts
{
  name: "THE WALL",
  sentence: "The one where the cannon never stops moving.",
  entries: [{ beat: 0, col: 0, color: "red" }],
}
```

`color`: a fixed colour, or `null` with `kind: "meteor"` for the rock, which
carries none.

## 2a. A guide, if and only if the wave introduces something

The wave opens on its number, its name and its sentence — plain text on the
field, on a timer, nothing pressed. After that, and only if the wave is the
**first** to carry a creature, a pod kind, a boss or a mechanic, it opens on a
`guide`, written directly under `sentence`:

```ts
{
  name: "THE ROCK",
  sentence: "The one where neither of you can do it alone.",
  guide: {
    both: "Dead rock. It cannot be shot, and it stops a shot of yours going up its column.",
    p1: "It announces itself on your strip, before it is on the field. Trigger the shield at the moment it lands — not before.",
    p2: "Slide the shield into its column and hold it there. You cannot fire it yourself.",
  },
  entries: [{ beat: 0, col: 3, kind: "meteor", color: null }],
}
```

Three texts, never one. `both` says what the thing is; `p1` and `p2` say what
each seat does about it, and a guide whose two halves say the same thing is a
guide that has not understood the game. The guide is drawn under the wave's own
name, so it needs no title.

**A wave that carries nothing new writes no guide.** Padding one with a guide
is the same failure as padding it with entries, and
`packages/content/test/waves.test.ts` fails both ways: the first wave to carry
something new must have a guide, and a wave that introduces nothing must not.

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

Neither of them watches the wave. Whether the cannon has time to get there is
a thing a person sees at tempo in the director, so a wave landed without that
having happened says so in its commit message, in a sentence — *THE WALL at 96
BPM was never watched; whether the cannon reaches column 6 before beat 9 is
untested.* One sentence, in the body, and then let it go: the commit message
becomes the release note, and there is no list to put it on and nothing to tick
afterwards.
