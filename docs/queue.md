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

## AN INTERLUDE'S GAPS ARE CONTENT AND LIVE IN THE APP
_claude/burn-gaps-move-b15 · packages/content/src/interludes.ts apps/game/src/interlude.ts_

`GAPS` — nine gaps between waves, one filled by THE GAUGE before wave 10 —
sits in `apps/game/src/interlude.ts` because the lane that wrote it could add
no file under `packages/content`. Everything else is already right:
`InterludeEntry` is data and the direction of travel is content to sim, like
every other authored thing here.

Taken off `docs/parked.md`. It is a `git mv` and an export rather than a
decision, and it is worth doing before the second interlude rather than after
— two rounds authored in the app is the point where it stops looking like an
accident and starts being where interludes live.
