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

## 5. A wave of its own, and a guide inside it

**A creature nobody is introduced to is a creature nobody learns.** Every kind
on the field today arrives this way and the pattern is not written down
anywhere else, so it is written here: a new creature gets **one wave that is
about it** and **a guide written inside that wave**. Shipping a creature means
both. A creature nobody can play is not shipped, and a wave that introduces
something with nothing said about it is a wave the pair reads by guessing.

**The wave.** One entry in one of `packages/content/src/waves/act-*.ts`,
passing the one-sentence test the way any wave must — THE RUNT is *"The one where a shot
that lands is the mistake"*, ON THE BEAT is *"The one where firing on sight is
the miss."* Both name the **mistake the creature exists to punish**, not the
creature. That is the test: if the sentence describes the body rather than what
the pair now has to do differently, the wave is a display case and not a
lesson.

A wave about one creature is usually one entry, and not always. THE RUNT
carries a second, ordinary target beside it, because a body defined by *not*
shooting it teaches nothing with nothing else on the field to shoot. Ask what
the creature is defined **against**, and put that in the wave if the answer is
not "the empty field".

**The guide.** A `guide` on that same wave, written directly under
`sentence`, and it is **three texts, not one**: `both` for what the thing is,
then `p1` and `p2` for what each seat now does about it — the split is the
point, and a guide whose `p1` and `p2` say the same thing is a guide that has
not understood the game. ON THE BEAT's are worth copying as a shape: *"Call
the beat it swells on, out loud, the way you call a column"* against *"Fire on
the count, not on sight."*

Say what the *wave* is about, not what the creature is in the abstract. The
abstract sentence has its own home — the `what` row in
`packages/content/src/mechanics-table.ts`, which the bestiary reads — and a
guide that repeats it has spent the pair's attention saying something the
field is about to say by itself.

**This one is enforced.** `packages/content/test/waves.test.ts` walks the wave
list in order and fails when the first wave to carry a new kind has no guide.
It fails the other way too, so do not add a guide to a wave that introduces
nothing — that is padding, and it is the same failure as padding a wave with
entries. `mechanics-table.ts` is the other half: a kind added to the
simulation and not to that table is a type error there.

## 6. Replay test

Add a replay in `packages/sim/test/` that spawns the creature and plays the
inputs that beat it. Assert what the creature *does* — it died on the beat it
should have, the score moved the way it should, the hull took what it should —
and then that the run fingerprints the same twice.

**Do not pin the fingerprint as a constant.** Nothing in this repository does,
and `docs/decisions.md` #19 says why: every legitimate change to `hashWorld`
moves every pinned number at once, so the maintenance move is "re-pin them,
the change was intended", which is the exact motion that blesses a real
regression. Two runs compared in one process prove the property that matters
for lockstep — the two phones are on the same build.

Then run:

```
bun run check
```
