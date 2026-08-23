---
name: new-creature
description: Add a creature to Neon Spore — control-visibility entry, state machine, parameters, preview and replay test. Use when adding, changing or removing a creature type, enemy or bestiary entry.
---

# Adding a creature

Work through this in order. Stop at step 1 if the test fails — a creature that
does not change what the two players have to say to each other does not belong
in the game, however good it looks.

## 1. The communication test

The creature must do at least one of these:

- create new information
- make existing information incomplete
- demand new timing
- allow a shorthand between the players
- reinterpret information already on screen
- shift attention
- force a decision only both together can make

More hit points or more speed is not one of them. Write the answer into the
`blurb` field — one sentence, in the creature's own terms.

## 2. Control group

Add the entry in `packages/content/src/creatures.ts`:

```ts
newkind: { kind: "newkind", controls: ["aim"], color: "red", blurb: "…" },
```

`controls` decides which controls a wave containing it shows. Never edit a wave
to make a creature work — the union is computed.

`color` is **one** colour, and it comes with **one** silhouette: the pair say
these things out loud across a voice delay, so a shape must mean the same word
every time. Two colours of the same shape is not two creatures. A free
silhouette is spent on a creature that *behaves* differently — and then it has
to look clearly different, not merely differently tinted.

## 3. Rules in sim, appearance in render

Behaviour goes in `packages/sim`. It may only use integers, the tick counter and
the seeded rng. Appearance goes in `packages/render` and may not decide anything.

If the creature needs a per-creature field, add it to `Creature` in
`packages/sim/src/types.ts` and to `hashWorld` in `hash.ts` — a field missing
from the hash is a field that can silently desync two devices.

## 4. Timing

If beating the creature needs a spoken exchange, it needs **at least 4 seconds**
from becoming visible to impact, better 5–6. At the default config a creature
takes `rows` beats, roughly 9 s. Anything faster must work without an
announcement.

## 5. Replay test

Add a replay in `packages/sim/test/` that spawns the creature, plays the inputs
that beat it, and pins the fingerprint. Then run:

```
bun run check
```
