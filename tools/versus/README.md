# VERSUS — a second answer to a shape the game already draws

A draft shape gets two cards on the SHAPES tab, NOTCH 1 beside NOTCH 2, turning
on the same clock. A shape the game already draws got one card, forever,
because there was nowhere for a second answer to live. This is that place.

A candidate look is a set of field assignments patched onto records
`packages/render` and `packages/content` already export, held for the length of
one `draw()` and put back in a `finally`. Nothing in the game's import graph
names this directory, and no shipped file grows a flag, a branch or an optional
argument to make a candidate possible. `docs/versus.md` is the design and the
reasoning; this is how to use it.

    bun run versus                          which slots are open, and every reader
                                            of every record they patch
    bun run versus new <slot> <name>        the candidate, spelled out, with the
                                            five rules that are not guessable
    bun run versus index                    regenerate the registry from the
                                            directories
    bun run versus adopt <slot> <name> "…"  the owner's answer, written into the
                                            shipped record; the slot then goes
    bun run versus drop <slot> "…"          the slot closed with nothing taken

## The four words

**Slot** — the question. `ship:hull-skin`. One slot, one decision, and every
candidate in it patches exactly the same records and the same fields, so a vote
is a vote on one thing.

**Candidate** — an answer. `warm`. A directory under `candidates/`, registered
in `candidates/index.ts`. What the game draws today is *not* a candidate: it is
the left-hand side of the pair, read off the live records, and giving it an
entry would put a second copy of shipped values in a tool.

**Patch** — one record and the fields to overwrite on it, plus `where` (the
file and symbol, as prose the emitted prompt quotes into a staging list) and
`reached` (the route the drawing code takes to that record).

**Pair** — two phones, one world, one frame, drawn twice at 380 × 820
uncapped, `Math.random` seeded the same on both sides so the only thing that
can differ is the patch. The page shows and asks nothing: the owner looks at it
and says in chat which answer he wants, and `bun run versus adopt` writes that
one into the shipped record and takes the slot away. There was a vote button
here until 9 September 2026 — he said he does not want one.

**What this page has already decided is `DECIDED.md` beside this file** — every
slot that has been opened and how it left. Read it before opening one: two of
the questions on it were asked, answered and then asked again in a better
shape, and one look was taken and immediately changed, none of which the
candidates still standing show.

## Writing one

    tools/versus/candidates/<slot-with-dashes>.<name>/index.ts

```ts
import * as hull from "../../../../packages/render/src/hull.js";
import { patch, type Variant } from "../../variant.js";

export const HULL_WARM: Variant = {
  slot: "ship:hull-skin",
  name: "warm",
  sentence: "amber where the ship is violet — ...",
  dir: "tools/versus/candidates/ship-hull.warm",
  patches: [
    patch({
      target: hull.OWN_SKIN,
      reached: () => hull.OWN_SKIN,
      where: { file: "packages/render/src/hull.ts", symbol: "OWN_SKIN", type: "HullSkin" },
      fields: { rim: "#FFAE3D" },
    }),
  ],
};
```

`bun run versus new <slot> <name>` prints that, filled in, with the five rules
below beside it — reach for it rather than reading this file end to end.

Then `bun run versus index`. **There is no array to add a line to**:
`candidates/registry.ts` is generated from the directories, and
`candidates/index.ts` re-exports it. It was an array, and every lane that
opened a slot conflicted with every other lane on rebase in a file neither of
them was really changing. A generated file is resolved by running its command.

Five things worth knowing before the first one:

- **Imports are relative paths into the packages, not `@neon-spore/render`.**
  This is a plain directory with no `package.json`, and workspace links live in
  each package's own `node_modules`, so the bare specifier does not resolve
  here. Giving the directory a manifest would buy the short form at the price
  of a `bun install` in every fresh worktree forever.
- **`reached` must be the route the *drawing code* takes** — `() =>
  livingSilhouette("bulb")`, not `() => BULB` — because the whole monkeypatch
  rests on the draw path reading that exact object every call. Where the game
  reads the export itself, as `drawHull` does with `OWN_SKIN`, the module
  namespace is the whole route there is.
- **`fields` holds whatever the record holds.** A number, a colour, a readonly
  tuple, or a whole replacement function: `poseAt` is a method on `OwnMotion`,
  so a candidate motion is a `fields` with one function in it.
- **A record declared `as const` needs a cast at the target.** `PALETTE` is one.
  The cast belongs at the candidate or in `apply`, never as a widened type on
  the shipped record.
- **`packages/sim/test/purity.test.ts`'s COPIES sweep globs `tools/`.** A
  candidate `poseAt` that writes one of `own-motion.ts`'s own frequencies as a
  literal is a second copy of a rule, and the sweep says so. The escape is a
  named local const with the reason beside it, never a weakened pattern in the
  sweep.
- **Check the record is on the branch the shipping game takes.** Some draw
  paths choose between a baked asset and a procedural one — `drawClaspShield`
  is the example — and a candidate patching the half a phone does not run is a
  slot whose difference nobody can see, which is the one failure this whole
  arrangement exists to prevent. It cuts both ways: the clasp's *asset* branch
  turned out to be the unreachable one, so the honeycomb a session skipped as
  unreachable is in fact what the field draws every frame. Read the **call
  site** rather than the file, and count the arguments — a parameter with a
  default that nobody passes is how that branch went unrun since the day it
  was written (`packages/render/src/clasp.ts`). Where the shipping half really
  is an asset there is no honest slot at all, because a candidate cannot
  repaint a webp.

## What the tests hold a candidate to

`test/variants.test.ts` runs in `bun test` like everything else. A candidate
that can win a vote and then fail `bun run check` at adoption has failed at the
worst possible moment — the expensive half, somebody looking at two phones, is
already spent. So:

- every patch puts back every field it touched, by identity and not by equality;
- every target is the object the game's own route hands back, and is not frozen;
- every candidate in a slot patches the same records and fields, and no field is
  claimed by two open slots at once;
- every candidate draws whole frames through `packages/render/test/canvas-stub.ts`,
  which refuses an unparseable colour, a NaN coordinate or a negative radius —
  and any `poseAt` patch is held against spec 5.8's quarter-tile lane limit.

## A new slot needs a pose

The director's VERSUS tab lists every open candidate and draws none of them:
each one opens in a tab of its own, where it is the only thing the browser is
animating. What it opens onto is a **pose** — a world run into the state the
slot is about — and the map from slot to pose is
`tools/director/src/versus-pose.ts`.

**A slot with no entry in that map falls through to a red slick falling**,
which for five of the nine open slots meant a candidate was drawn twice beside
a body it does not touch: two identical pictures, and a vote offered on a
difference nobody could see. So a new slot writes its pose and names it in the
map, in the same commit as the candidate.
`tools/director/test/versus-pose.test.ts` fails on a slot that does not, which
is the only thing keeping that from happening again.

**Which file the pose goes in is the same question as which rhythm it wants.**
`poses-versus.ts` holds the states where something *happens* — a shot arriving,
a plate turning one away, a hand pushing a body — and every one of them carries
`cadenceSeconds` so the pair replays it every two seconds. `poses-surface.ts`
holds the states a *surface* is judged on, and those are held for as long as
their body is on the field instead: a body that turns needs longer than two
seconds to finish turning, and the reveal a placed surface exists for is
exactly what a two-second window cuts off. A pose that is on screen the whole
time and does not turn needs no rhythm at all and carries none.

## Deciding one

At the pair, never here. `bun run versus` answers the half a browser cannot: a
candidate patches a record, and every *other* reader of that record draws
something the two phones never put on screen. It derives that list by grep and
prints the command beside its output, with no predicted answer — a survey that
asserted "nothing else reads this" turned out to be wrong about five files.

**The owner says which one in chat, and one command carries it out.**

    bun run versus adopt creature:torch flare "the seam reads at 26 px"
    bun run versus drop  creature:torch "none of them beat what ships"

`adopt` writes the winner's field values into the shipped record, removes every
directory in the slot — the winner's included, because its numbers live in
`packages/render` now and a second copy in a tool is the drift this arrangement
exists to prevent — regenerates the registry and appends the answer to
`DECIDED.md`. `drop` is the same with nothing written into the game, for a slot
he turns down or one left undecided at the end of the session that opened it.

**It refuses far more readily than it writes**, and a refusal changes no file at
all. The value in the file has to be the value the live record holds, so a
record somebody has edited since the candidate was written stops the adoption
and names the field rather than reverting their work. A field it cannot find at
the top level of the literal stops it too. And a **function** — a candidate
`poseAt`, say — is refused outright: `toString` hands back what the transpiler
made, not how the file spells it. Take those by hand and then `drop` the slot
with a reason saying so.

Afterwards, `bun run check`. The record moved and the tests that draw it have
not been run.

`variant.ts`, `seed.ts`, `run.ts`, `registry.ts` and `candidates/` stay whether
or not a slot is open. They are the seam, the way `Effects` stays whether or not
anything is exploding.
