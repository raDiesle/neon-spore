# Queue

The ordered work an unattended run walks. First in the file is next to be done.

It is not the outstanding list — `bun run checks` derives that from the
`Check:` trailers, and every row of it is an obligation somebody incurred by
landing something. It is not `docs/parked.md` either, which is ideas nobody
has decided on. This is the middle one: **decided, not yet done**.

An entry leaves by being **deleted**, once its branch is on `main`. Nothing
here is ticked, and nothing here records progress — a lane is done when its
branch is an ancestor of the trunk, which git can be asked and a file cannot.
`bun run burn` asks. `docs/autonomous.md` has the rest.

The italic line under each heading is `branch · the paths that lane owns`. Two
lanes may not own the same path. The files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by nobody: add
to one in a single contiguous region and expect to replay over somebody else.

## TWO CREATURES THAT MOVE LIKE A THIRD
_claude/burn-own-motion-b10 · packages/content/src/own-motion.ts_

`own-motion.ts` falls back to `TILT_RIPPLE` for anything that is not a bulb,
so the Runt twitches like a slick and the Throb tilts like one. The Throb's is
nearly load-bearing: its swell is what tells the pair when to fire, and a body
that also tilts is a body saying two things at once.

Taken off `docs/parked.md`. It is the one copy of how a body sways, so this is
a small file and two entries in it. Finished when both read as themselves on
`bun run shapes` — which is also the tool the two outstanding creature checks
point at, so this lane may discharge them rather than merely serving them.

## THE GAME'S OWN ENTRY POINT HAS NO ROOM LEFT
_claude/burn-main-split-b12 · apps/game/src/main.ts apps/game/src/wiring.ts_

`apps/game/src/main.ts` sits at exactly 250 lines, which is the limit
`packages/sim/test/limits.test.ts` enforces. It has already cost two people: a
lane moved a call out of it into `beat.ts` to make room for one line, and a
one-line improvement to how it spreads its config was reverted rather than
landed, because an import and a comment put it four lines over.

A file at its limit does not merely resist growth, it silently taxes every
change that touches it — and this is the file every new mechanic has to be
wired into. Split it the way this repository splits things: `main.ts` is
wiring, and wiring divides by what is being wired. Finished when `main.ts` has
room and `bun run preview` still opens the field.

**Then make the one change that was reverted**: `const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, hullInvulnerable: true }`.
`PAIR_ON` landed with the renderer's pair coverage and exists precisely so a
third pair-switch reaches the game by being added to `PairConfig` rather than
by somebody remembering this line — and the line it is meant to fix is
currently spelling both switches out by hand.
