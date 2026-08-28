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

    bun run versus     which slots are open, and every reader of every record they patch

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

**Vote** — two phones, one world, one frame, drawn twice at 380 × 820 uncapped,
`Math.random` seeded the same on both sides so the only thing that can differ
is the patch. It writes nothing: it builds a prompt and puts it on the
clipboard, and a session adopts the winner and `git rm -r`s the whole slot.

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

Then one import and one array entry in `candidates/index.ts`, the way
`tools/shape-sheet/src/drafts/index.ts` assembles DRAFTS.

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

## Deciding one

At the pair, never here. `bun run versus` answers the half a browser cannot: a
candidate patches a record, and every *other* reader of that record draws
something the two phones never put on screen. It derives that list by grep and
prints the command beside its output, with no predicted answer — a survey that
asserted "nothing else reads this" turned out to be wrong about five files.

An adopted slot is removed whole, the winner's directory included: its numbers
live in `packages/content` or `packages/render` now, and a second copy of them
in a tool is the drift this arrangement exists to prevent. A slot left undecided
by the end of the session that opened it goes to `docs/parked.md` and its
directories go the same way.

`variant.ts`, `seed.ts`, `run.ts` and `candidates/index.ts` stay whether or not
a slot is open. They are the seam, the way `Effects` stays whether or not
anything is exploding.
