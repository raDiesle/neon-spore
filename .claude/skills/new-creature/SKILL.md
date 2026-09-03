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

## 2. The rows, and there are six

A creature is a name in six tables before it is anything else. **Every one of
them is enforced** — five by the compiler, one by a test — so this list is
complete and working through it in order costs nothing but typing. Take them in
this order, because each later one wants the name to already exist.

| # | File | What you add | What catches you |
|---|---|---|---|
| 1 | `packages/sim/src/creature-kinds.ts` | the name, in the union **and** appended to `CREATURE_KINDS` | `KindsAreExhaustive` |
| 2 | `packages/content/src/creatures-table.ts` | the `CREATURES` row: `controls`, `color`, `blurb` | `Record<CreatureKind, …>` |
| 3 | `packages/content/src/mechanics-table.ts` | the `MECHANICS` row — what the thing *is*, one sentence | `satisfies Record<MechanicId, …>` |
| 4 | `packages/content/src/living-look.ts` | its contour and own-motion, or `null` | `satisfies Record<CreatureKind, …>` |
| 5 | `packages/render/src/comms.ts` | its `TALKER` seat, or `null` | `satisfies Record<CreatureKind, …>` |
| 6 | `docs/spec/bestiary.md` | its name in the Categories table | `content/test/categories.test.ts` |

**`CREATURE_KINDS` is append-only.** The index *is* the wire value: reordering
it changes what every existing replay hashes to, and two devices on different
builds would then disagree about a world they are playing identically.

**Rows 4 and 5 take `null` as a real answer, and `null` is a decision.** A kind
gets `null` in `living-look.ts` when it is drawn as something else — a crystal,
a boss with its own draw path, or a body it *wears* (resolve that with
`wornKind`, never with a second silhouette; for a lure a shape of its own is a
tell, not a drift). It gets `null` in `TALKER` when both screens see the same
thing and neither player has to speak. Both used to be lookups ending in a
default, so a forgotten kind was drawn as a slick that swayed like one, or
never lit its siren, and nothing anywhere said a word. They are total now,
which is why they are on this list at all.

`controls` names the groups a wave containing this creature must be able to
answer — `ControlGroup` is aim and guard, *the two things a wave may be
missing*, and a handle drawn on the field is neither. Never edit a wave to make
a creature work: a wave names one whole panel and the union is checked against
it. `packages/content/test/waves.test.ts` is where that check lives, so putting
a guard creature on a shield-less panel is a red `bun run check` rather than
something the pair is shown and cannot answer.

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
