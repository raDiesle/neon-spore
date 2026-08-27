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

## THE GAUGE — THE FIRST ROUND THAT IS NOT THE FIELD
_claude/burn-gauge-b6 · packages/sim/src/interlude.ts packages/sim/src/gauge.ts packages/render/src/gauge.ts docs/spec/interludes.md_

The smallest of the twelve interludes, and the one that has to go first
because it drags the shell in with it: a mode that is not the field, with its
own rules, its own controls and its own picture. One needle, two marks, one
player reading and the other turning.

**This lane runs alone**, between batches — it restructures the loop in
`apps/game/src/main.ts` and the world's idea of what a round is. Finished when
a gauge round can be entered, failed, passed and left, and the field comes
back afterwards with the wave intact.

## THE TWO SILENCES
_claude/burn-audio-b9 · packages/audio/src/bind.ts packages/audio/src/sounds packages/sim/src/events.ts_

Two moments report nothing to the ear, and both are blocked on the same file.
The fork opening is the one moment in a run that belongs to the pair rather
than to the clock, and it is silent. Shooting the Runt — the creature you must
not shoot — spends the ordinary `destroy` cue, so the only tell that the pair
got it wrong is the score moving the wrong way, which is the one place neither
of them is looking.

Taken off `docs/parked.md`, where two lanes filed them separately before
noticing they were the same lane. **Look at what the catalogue already has
before writing a sound** — `bun run dev`, ♪ SOUND lists the ones kept unbound,
and they were kept for this. Finished when both events exist, both are bound,
and `packages/audio/test/bind.test.ts` is green without being relaxed.

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

## THE ONLY TEST THAT COVERS RENDER CANNOT SEE TWO THINGS IT DRAWS
_claude/burn-frame-cover-b11 · packages/render/test/frame.test.ts_

`frame.test.ts` builds its worlds from `DEFAULT_CONFIG`, where `briefings` and
`forkBetweenWaves` are both off — so the briefing card and `drawFork`, two of
the newest things this renderer draws, are drawn by nothing in CI. Both were
checked by throwaway harnesses that were then deleted, which is worth exactly
what it sounds like.

Taken off `docs/parked.md`. Finished when both are drawn by the test that
refuses what a real canvas refuses. Start by asking whether `config-pair.ts`
should carry a `PAIR_ON` constant, so the next switch of that kind is covered
by being added rather than by somebody remembering.
