# Queue

Technical work a session found and did not do. Every entry here is waiting for
a session of its own, and every entry here drains without the owner deciding
anything.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped. The
test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**What does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — is a decision, and a decision drains only
through the owner. It goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* is not queued either: it is offered in `tools/versus/`, because the
only way to choose one is to see it. Mixing decisions into this file is exactly
what buried the last one under sixty-two entries nobody could face.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on.
`bun run queue next` *hands out* the first free one: it creates that item's
branch and prints a prompt naming it. The branch is the claim — two sessions
cannot be given the same item, because the second `git branch` fails and the
item is skipped. The session checks that branch out in its own worktree, does
the item, removes the entry with `bun run queue done <n|title>`, and lands;
landing deletes the branch, which releases the item at the moment the work
reaches `main`. If a handed-out item is never started, `bun run queue release
<n|title>` gives it back.

The claim is a branch rather than a mark in this file because a mark has to be
committed to be seen, and the session that took the item has not committed
anything yet — the moment the mark would be useful is the moment it does not
exist. Worktrees of one repository share their refs, so a lane's branch is
visible to the next `bun run queue` with no commit and no push. A cloud session
works in its own clone, so its claim is invisible here until it pushes; two at
once is the ceiling anyway, and locally that ceiling is enforced.

**The format**, one `##` per item, and both fields are required because the
session that picks it up has read nothing else:

```
## One line saying what to change

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What is wrong, what to do about it, and anything the code does not already
say. Written for somebody who was not there.
```

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on.

## Ignore `docs/frames/`, which every `bun run frames` blocks a landing with

- **Found:** 2026-09-03, claude/gyre-animation-wheel-visuals-ab2e28
- **Files:** `.gitignore`, `tools/frames/run.ts`

`bun run frames` writes its PNGs into `docs/frames/<sha>/` — inside a tracked
directory, with no ignore rule — so the pictures land in the tree as untracked
files. `.claude/hooks/auto-land.sh` and `bun run land` both decide a worktree is
clean with `git status --porcelain`, which counts untracked files, so a lane that
took a picture to show the owner cannot land until somebody deletes it by hand.
The tool exists to be used at the end of a piece of work, which is exactly the
moment landing happens, so this fires every time.

Add `docs/frames/` to `.gitignore` beside `tools/shape-sheet/skin-sheet.svg`,
whose entry already makes the same argument in the same words — output that is a
question somebody asked rather than a state of the tree. Check `tools/frames`'s
own docs and `docs/working-with-claude.md` for a sentence that says the frames
are committed; if one exists it is the thing to fix instead.

## Give apps/game/src/link.ts room by moving the clock out of it

- **Found:** 2026-09-03, claude/bun-queue-list-command-5a8695
- **Files:** `apps/game/src/link.ts`, `apps/game/src/link-clock.ts`, `apps/game/src/link-refusal.ts`, `apps/game/test/`

`link.ts` is at exactly 250 lines, which is the limit
`packages/sim/test/limits.test.ts` enforces, so the next sentence anyone adds to
it fails the check. Working the eight net items already cost it two extractions
(`link-refusal.ts`) and four trimmed comments to get back under, and that is not
a thing to do twice.

The seam its own header names is the clock: "a seat, **a clock**, a countdown,
and the state a player reads". Move `PING_EVERY_MS`, the `ClockSync`, the ping
timer, the `now` it measures against and the `pong` case into `link-clock.ts`,
exposing `add(pong, started)`, `settle(dtMs)`, `framePingDue(dtMs)`,
`countdownMs(startMs)`, `reached(startMs)`, `ready`, `rttMs` and `sampleCount`.
That is about fifteen lines out of `link.ts` and puts the wall clock in one
file, which is what the header claims for it already. `bun run relay:check`
against a running wrangler is what proves it, not `bun test` alone.

## relay:check --rejoin compares tick counts at one instant, and flakes

- **Found:** 2026-09-03, claude/bun-queue-list-command-5a8695
- **Files:** `tools/relay-check/check.ts`

One run in five of `bun run relay:check ws://127.0.0.1:<port> 14 --rejoin`
reports "the two worlds did not come back in step" with A on tick 392 and B on
tick 390 — a two-tick spread at the moment the harness happens to read them, not
a parting. The other four runs pass with identical ticks and identical hashes,
and `--split`, `--full` and the plain run pass every time.

`agreed` is `a.world.tick === b.world.tick && hashA === hashB`, and delayed
lockstep does not promise the two devices are on the same tick at the same wall
moment: it promises they simulate the same ticks with the same commands. A
device may be up to `delayTicks` ahead of its peer's horizon. Compare instead at
a tick they have both reached — step the trailing world to the leading one's
tick before hashing, or record each world's hash at an agreed checkpoint tick
and compare those. A flaky check is worse than none, because the next session
reads a red one as its own doing.

## Move apps/server off the miniflare alpha when a stable 5 ships

- **Found:** 2026-09-03, claude/bun-queue-list-command-5a8695
- **Files:** `apps/server/package.json`, `apps/server/test/room.test.ts`, `bun.lock`

`apps/server/test/room.test.ts` pins `miniflare` at `5.20260831.0-alpha`, exactly
and on purpose. The last stable 4.x is `4.20260730.0`, whose workerd binary
refuses the `compatibility_date` in `wrangler.jsonc` ("newest date supported by
this server binary is 2026-08-06"), and the test reads that date from the
deploy's own config rather than carrying a second copy of it — so a stable 4
would mean testing on a date the deploy does not use.

When a non-alpha 5 is published, move to it and check the config shape the test
builds by hand (`workers[0].config` with `manifest.modules` and
`exports.Room.storage`) still holds — miniflare 5 changed it from 4's flat
`{ modules, script, durableObjects }`, and `convertV4MiniflareOptions` is the
shim that shows what the new shape wants if it changed again.

## Point apps/server's deploy script at deploy:game and fix its README

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `apps/server/package.json`, `apps/server/README.md`, `package.json`

Root `deploy` builds the director and pushes `wrangler.director.jsonc`; the relay
(which is `apps/server/src/index.ts`, `wrangler.jsonc`) ships with `deploy:game`.
`apps/server/package.json` `deploy` runs root `deploy`, so the server package's own
deploy script deploys the director and never the relay. Its README (lines 23 to
36 and 71) says the same wrong thing and also fixes the relay on port 8787, while
`dev.ts` derives the port from the tree path.

Point the alias at `deploy:game` or delete it, rewrite the README commands and
the port note ("prints its port"). `bun run deploy:game:dry` proves the script.

## Bring docs/architecture.md back in line with the code

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `docs/architecture.md`, `docs/INDEX.md`

Four claims no longer hold. Line 8 has `net (phase 2)` in the diagram while line
71 says the network is built. Lines 20 to 21 say wall-clock time exists in exactly
one file, `apps/game/src/loop.ts`; it is read in `main.ts` (lines 188, 201, 241),
`link.ts` line 64 and `testing.ts` line 135. Line 28 says creatures move exactly
one tile per beat; `kinds.ts` `fallTilesPerBeat` gives rocks several, the dart
steps diagonally, the wisp hops, the echo skips beats. Lines 49 to 50 say the rng
is seeded by the wave index so the same wave always plays the same way; `main.ts`
seeds with 0 and `startWave` never reseeds (`run.ts` reseeds at beat zero only), so
wave N depends on how many draws the earlier waves made. `docs/INDEX.md` line 91
says `world.ts` holds the single `step` function; `step` lives in `step.ts`.

Rewrite the sentences to what the code does: the rule is that sim and content
never read a clock, enforced by `purity.test.ts`; per-kind speed; rng seeded once
per run at beat zero; net built. Fix the `world.ts` row. Doc only.

## Write the apps/game tests worth having: link.ts and loop.ts

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `apps/game/src/link.ts`, `apps/game/src/loop.ts`, `apps/game/test/`

Of 3 460 source lines in `apps/game`, the 299 test lines cover a URL parser,
keyboard gating, the menu and the raster flag. `link.ts` (a welcome restamp ends
the run, `peers < 2` after start is `lost`, `error full` surrenders) and `loop.ts`
(the 250 ms catch-up cap, and that `stop()` ends the rAF chain) are the two most
valuable untested units; `link-socket.ts` is covered by the reconnect entry.

`createLink` already takes `now`; drive it with a fake `RoomSocket` and assert the
state after each message. Give `startLoop` injectable `now` and `raf` (one
parameter each) and test the cap and the stop. Keep each file under 250 lines.

## Retire or enforce the control-group union rule; controlsForKinds is dead code

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/content/src/creatures.ts`, `packages/content/src/creatures-table.ts`, `packages/content/src/index.ts`, `packages/render/src/band.ts`, `packages/content/test/waves.test.ts`, `CLAUDE.md`, `.claude/skills/new-creature/SKILL.md`

`controlsForKinds` (`creatures.ts` lines 84 to 88) has no caller anywhere;
`ControlGroup` is imported by nothing outside content. The panel a wave shows is
decided by `controlSetForWave(world.wave)` in `render/src/band.ts`, a named
`ControlSet` on the wave, not a union of creature groups. Yet CLAUDE.md
("a wave shows the union of its creatures' control groups"), `creatures-table.ts`
lines 7 to 8 and the new-creature skill all state the union rule as live.
`CreatureDef.controls` today feeds only `categoryOf`.

Decide which is true and make the code say it. Either add a content test that
every wave's control set covers `controlsForKinds` of the kinds in
`mechanicsInWave(wave)` so a `guard` creature on a `lance`-less panel fails, or
delete `controlsForKinds` and `ControlGroup` from the public surface and rewrite
the three documents to say `controls` classifies a creature and `Wave.controls`
names the panel. The first is the smaller change and keeps the documents true.

`controlsForKinds` has already left `content`'s barrel (2026-09-03, the
barrel-trimming item), so what is left of the second option is deleting the
function itself and the three documents. Nothing else about this entry changed.

## Test the content invariants nothing checks: wave names, beats, creature keys

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/content/test/waves.test.ts`, `packages/content/test/creatures.test.ts`, `packages/content/src/waves-demo.ts`, `packages/content/src/control-sets.ts`, `packages/content/src/creatures-table.ts`

`Demonstration.wave` names a wave by string, `wavesUsingSet` returns names, and
tests resolve via `WAVES.findIndex((w) => w.name === name)`, but nothing checks
wave names are unique, that a non-boss wave has entries, or that every entry's
`beat >= 0`. A second "THE WALL" landed by the director would silently point every
lookup at the first. `CREATURES` is `Record<CreatureKind, CreatureDef>` and every
row repeats its key in `kind`; nothing reads `.kind` off a def and
`slick: { kind: "bulb" }` type-checks.

Add to `waves.test.ts`: `new Set(WAVES.map((w) => w.name)).size === WAVES.length`,
a `beat >= 0` check per entry, non-empty entries for a non-boss wave. Add one line
to the creature test: `for (const [k, d] of Object.entries(CREATURES))
expect(d.kind).toBe(k)`, or drop the `kind` field since the key is the kind.

## Test the three audio units carrying real logic: Mixer, MusicPlayer, creatureCue

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/audio/src/mixer.ts`, `packages/audio/src/memory.ts`, `packages/audio/src/music/player.ts`, `packages/audio/src/bind-creatures.ts`, `packages/audio/test/mixer.test.ts`, `packages/audio/test/player.test.ts`, `packages/audio/test/bind.test.ts`

No test references `Mixer` or `MusicPlayer`. `mixer.ts` lines 113 to 226 are the
stateful half its own header calls the one dangerous thing: restart detection,
guard and intake lapse edges, the hull alarm on every fourth beat, the torch count,
and the per-frame duplicate cap in `play`. `Engine.play` returns early without a
context, so a test can stub `mixer.engine.play` and feed hand-built worlds
headlessly. `MusicPlayer` takes its engine by constructor, so a fake recording
`playPlan(plan, when)` proves the loop arithmetic (`base += loopSeconds`, cursor
reset, stop-on-end). `bind.test.ts` only asserts each creature event names some
existing sound, not which one, so a swapped id passes.

While there: `soundBoss` runs `world.creatures.find` for the queen, a `filter`
to count torches (allocating an array to read its length) and a second `find` for
the first torch, every frame; one loop gives all three. `sounddifferences` is the
only identifier in the package that breaks camelCase. Write `mixer.test.ts`
(build a `World` via sim's `createWorld`, mutate `guardTick`, `hullMilli`, `tick`,
call `frame` twice, assert the recorded ids, include a tick-goes-backwards case),
`player.test.ts` (fake engine with settable `now`; first pump schedules only
voices inside `LOOKAHEAD`), and extend `bind.test.ts` with one expected id per
creature event.

## Bring docs/spec/audio.md and the in-code sound counts back to the catalogue

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `docs/spec/audio.md`, `packages/audio/src/types.ts`, `packages/audio/src/music/themes.ts`, `docs/INDEX.md`, `packages/audio/test/catalogue.test.ts`

Actual: 201 sounds, 125 spare and 76 bound, 16 music cells, 9 themes. `audio.md`
line 66 says 190 sounds, line 110 says 137 spare, the family table (lines 87 to
101) is wrong in every row, line 131 says the status test reads two files (it
reads three), and line 179, `themes.ts` line 2 and `INDEX.md` line 396 say six
pieces. `types.ts` line 8 says about 130 sounds.

Delete the hand-typed numbers where they carry no argument, and for the ones that
do (the status line, the family table) add a test in the pattern of
`content/test/categories.test.ts` that reads the doc and compares to `CATALOGUE`,
so the next drift fails `bun test packages/audio`.

## Move the live-voice cap ahead of the loop and register modulators in live

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/audio/src/engine.ts`, `packages/audio/src/plan.ts`, `packages/audio/test/`

`engine.ts` line 103 checks `this.live.size >= MAX_LIVE_VOICES` inside the
per-voice loop and returns, so a multi-layer sound arriving at the cap plays its
first layers and drops the rest, a click without its body. The ring modulator and
vibrato oscillators (lines 139 to 161) are started and stopped but never added to
`live`, so `silence()` stops the sources and leaves the modulators running to their
scheduled end; `live` no longer means what its comment says.

Test `this.live.size + plan.voices.length > MAX_LIVE_VOICES` once before the loop
and drop the whole plan; add the modulators to `live` or stop them from the
source's `onended`. Pull the admission decision into a pure `admits(liveCount,
plan)` in `plan.ts` and unit-test it, since the engine cannot run under `bun test`.

## Add a noise grain; 29 sound definitions hand-build the same filtered-noise layer

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/audio/src/grain.ts`, `packages/audio/src/sounds/`

`grain.ts` says every sound should be composed from grains, but the sound files
contain 121 inline `{ source: ... }` literals; 29 of them are `source: "noise"`
with a filter (11 lowpass, 17 bandpass, 1 highpass), for example `ship.ts` lines
66 to 73 and `hull.ts` lines 37 to 63. `hull.ts` lines 76 to 94 also repeat an
identical triangle-plus-repeat layer twice differing only in `freq` and `at`.
`impact.ts` (235 lines) and `motion.ts` (220) are nearest the 250 cap.

Add `noise(colour, filter, release, gain, at?)` to `grain.ts` and replace the 29
literals. Prove nothing audible moved with a one-off script that serialises
`planSound(def)` for all 201 entries before and after and diffs the two JSON
files; do not pin that as a test (`docs/decisions.md` #19).

## Fix the stale file headers docs/INDEX.md is generated from

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/content/src/waves.ts`, `packages/content/src/waves/act-4.ts`, `packages/content/src/waves/act-5.ts`, `packages/content/src/creatures.ts`, `tools/director/src/backlog-api.ts`, `tools/director/src/docs-api.ts`, `tools/director/src/serialize.ts`, `docs/INDEX.md`

`waves.ts` line 16 says `act-4.ts` is where new waves land; `act-5.ts` lines 9 to
10 say act-4 filled and act-5 is where they land, and INDEX carries both claims.
INDEX describes `creatures.ts` as the bestiary and control-visibility table, but
the table moved to `creatures-table.ts`; it describes `waves.ts` as authored waves
when it is a 32-line barrel. The INDEX row for `serialize.ts` says waves are
written back into `waves.ts`, but `waves-api.ts` says `waves.ts` is never written,
only the act files. `backlog-api.ts` lines 7 to 8 and its row say ten files read
when the code reads nine. `docs-api.ts` line 5 cites a `checks-api.ts` that no
longer exists.

Edit the headers, run `bun run index`, and confirm the diff to `INDEX.md` is only
those rows.

## Extend bun run index to tools/ and the root-level app scripts

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/index/index.ts`, `tools/index/run.ts`, `tools/index/test/`, `docs/INDEX.md`

`GROUPS` lists `tools` but `isInScope` accepts only `packages/*/src` and
`apps/*/src`, and `run.ts` walks only those two. Every existing row's path exists,
but 176 of the director's 207 source files, all of `tools/dev/`,
`tools/land/{run,sweep,git}.ts`, `tools/build-stamp.ts`, `apps/game/build.ts`,
`apps/game/preview.ts` and `apps/server/dev.ts` have no row and the index test
cannot fail on them. There is no `--check` flag; `run.ts` always writes.

Extend `isInScope` to `tools/<name>/src/**`, `tools/<name>/*.ts` and
`apps/*/*.ts`, walk `tools` in `run.ts`, let the generator append rows from each
file's header sentence, and add a `--check` mode that exits non-zero on drift so
the test "generating changes nothing" guards the whole tree.

## Cut shapes-motion.test.ts from six seconds and eleven million expects

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/test/shapes-motion.test.ts`

This one file takes 5.7 s of the director suite's 6.6 s and makes 11 473 102
`expect()` calls. Lines 52 to 61 loop 200 time samples times every contour point
times four expects, for every `CATALOGUE` entry. The claim under test is only that
the box contains every point.

Compute min and max x and y over the points in plain arithmetic and make four
expects per entry and time sample, or one `expect(outside).toEqual([])` per entry
naming the offending point on failure. Same guarantee; the file should drop to
well under a second.

## Stop leaking a module instance per GET /api/waves in the director

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/src/waves-api.ts`, `tools/director/src/serialize.ts`, `tools/director/test/`

`readWaves()` does a dynamic `import()` of the waves barrel with a `?t=Date.now()`
cache-buster on every request, and `writeWaves()` does the same once per act file
on every save. Each distinct URL is a new ES module record Bun keeps for the life
of the process, in a server that stays up as long as a tab beats every 25 s. Two
GETs in one millisecond also share a module and can return a stale list after a
save.

Memoise on the token `wavesToken()` already computes: if the token is unchanged,
return the last result, so a fresh import happens only when a file actually
changed. In `writeWaves` the per-act length only needs the array length, which
`serialize.ts` can count in the source it already reads. A test that calls
`wavesState()` twice with unchanged files and asserts one import proves it.

## Call runStageLoop instead of carrying three copies of the fixed-timestep loop

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/src/stage-loop.ts`, `tools/director/src/raster-field.ts`, `tools/director/src/versus-pair.ts`

`stage-loop.ts` was split out so the loop exists once; `raster-field.ts` line 155
says "the same fixed-timestep loop stage.ts runs" and then re-types the twelve
lines (`carry`, `Math.min(0.25, ...)`, `Math.min(Math.floor(carry), tickHz)`).
`versus-pair.ts` lines 175 to 192 hold a third copy with `rate` and `frozen`
folded in. A change to the catch-up cap in one file will not reach the other two.

Give `runStageLoop` a stop hook (raster-field stops when `!canvas.isConnected`,
versus-pair on `cancelAnimationFrame`) and a `dt` scaler, then have both files call
it. A small director test that greps for `carry +=` outside `stage-loop.ts` keeps
it at one.

## Move the director's 1 100 lines of CSS out of index.html; lint .css and .js

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/index.html`, `tools/director/src/director.css`, `biome.json`, `apps/game/public/sw.js`, `.claude/hooks/format-edited.sh`

`tools/director/index.html` is 1 736 lines and its `<style>` spans lines 11 to
1116. `biome.json` `files.includes` is `**/*.ts` only, so that stylesheet is
neither formatted nor linted, and so is `apps/game/public/sw.js`, which
`format-edited.sh` hands to Biome only to have it skipped silently with
`--no-errors-on-unmatched`. `apps/game/index.html` already links `game.css`, and
Bun's HTML bundler handles that in both `server.ts` and `build.ts`.

Cut the style block into `director.css`, link it, add `**/*.css` and `**/*.js` to
Biome's includes, and fix whatever Biome then reports. A `bun run dev:once` look
at `/` proves the page is unchanged.

## Extract the shared queen shell draw and SVG fade from the director drafts

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/src/holders/hairline.ts`, `tools/director/src/holders/withdrawal.ts`, `tools/director/src/holders/underglow.ts`, `tools/director/src/holders/queen-shared.ts`, `tools/director/src/tails/ribbon.ts`, `tools/director/src/tails/wedge.ts`, `tools/director/src/tails/smoke.ts`, `tools/director/src/tails/types.ts`

A shingle scan over the director puts hairline/withdrawal (32% shared),
hairline/underglow (26%) and ribbon/wedge/smoke at the top. In the holders a
25-line block (`cx/cy/rx/ry/markY/markR`, `drawQueenMarks`, the ellipse and the
same three-stop gradient, the `PALETTE.rock` stroke, two `drawQueenSocket` calls,
`drawPetalRow`) is byte-identical in three files, each differing in one modifier
(cracks, squeeze, ember). In the tails the `linearGradient` plus three `<stop>`
construction is copied per tail with only the stop table differing.

Add `drawQueenShell(ctx, geom, cycle)` to `queen-shared.ts` (taking the pre-shell
hook for the halo and the rx/ry override for withdrawal) and `verticalFade(ctx,
id, stops)` beside `tails/types.ts`. This is a refactor of a tool, not a look;
`tails.test.ts` and a `bun run shapes:still` frame prove the pixels did not move.

## Split stage.test.ts into its three subjects and stop leaking global stubs

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/test/stage.test.ts`, `packages/sim/test/briefing.test.ts`

The file (378 lines) is three unrelated describes: lines 101 to 140 test
`stage-afterrun.ts`, lines 155 to 182 test only `@neon-spore/sim`
(`createWorld`, `startWave`, `briefingHolds`, no director import), and lines 209
to 378 test `stage-touch.ts`. It installs `globalThis.document` at module scope
(line 62) and `globalThis.window` inside a helper (line 229) without removing
either, so later files in the same `bun test` process inherit them. Its header
promises a `Check:` trailer, which CLAUDE.md now forbids.

Move the first block to `stage-afterrun.test.ts`, the third to
`stage-touch.test.ts` with the stubs installed in `beforeAll` and restored in
`afterAll`, and the second to `packages/sim/test` or delete it if
`briefing.test.ts` already covers a fresh `Briefings` per `createWorld`.

## Add a unit test for shape-fit.ts, the largest pure director module without one

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/src/shape-fit.ts`, `tools/director/test/shape-fit.test.ts`

Of the director modules no test imports, most are DOM-bound; `shape-fit.ts` (216
lines) is not. It is `stillOf`, `fitOf`, `isWide`, `figureLayout`, a scan over a
contour plus a memo table, and its header says it was split out because none of
it touches the document. `long-axis.test.ts` covers `shapes-motion.ts` next door,
not this.

Write `shape-fit.test.ts` over `CATALOGUE`: `isWide` is true for the hull and
false for a round body, `fitOf` contains `stillOf` for every entry and every
`FIT_TIMES` moment, and `figureLayout` returns the same object on a second call.

## Table the director's three document routes and bring server.ts under 250 lines

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/server.ts`, `tools/director/src/docs-api.ts`, `tools/director/build.ts`, `tools/director/test/build-imports.test.ts`

`server.ts` is 260 lines. The doc comment at lines 203 to 211 describes
`/api/spec`, but the route beneath it (line 217) is `/api/borrowed`; the actual
`/api/spec` route at line 237 has no comment. Lines 217 to 235 are three routes
that differ only in the reader they call.

Declare `DOC_ROUTES = { "/api/borrowed": readBorrowedText, "/api/tower-defence":
readTowerDefenceText, "/api/claude-vs-chatgpt": readAssistantsText }` in
`docs-api.ts` so `build.ts` bakes from the same table, spread it into `routes`,
and move the spec comment onto the spec route. `curl /api/borrowed` on a running
director confirms the answer is unchanged.

## Break the runtime import cycle in the SHAPES page and add a cycle check

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/director/src/shapes-pair.ts`, `tools/director/src/shapes-controls.ts`, `tools/director/src/shapes-axes.ts`, `tools/director/src/shapes-effect-axes.ts`, `tools/director/src/shapes-build-state.ts`, `tools/director/test/`

Four import cycles exist in the director. Two are type-only (`backlog.ts` with
`backlog-ideas.ts`, `skins/types.ts` with `hits/types.ts`) and harmless. Two are
runtime: `shapes-pair.ts` imports `shapes-controls.ts`, which imports
`shapes-axes.ts` (line 36), which imports state setters back from
`shapes-pair.ts`; `shapes-effect-axes.ts` line 13 does the same. `shapes-axes.ts`
line 15 says the state is all in `shapes-pair.ts`, and the cycle is the axes
reaching into the pair for it. It works today only because everything is called
after module evaluation.

Move the SHAPES page state the axes read and write into a leaf `shapes-state.ts`
(as `shapes-build-state.ts` already does for the build tab), import it from all
three, and add a 30-line DFS test over `from "./..."` imports that fails on any
runtime cycle.

## Move the two PreToolUse guards from bash to a bun script

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `.claude/hooks/bash-guard.sh`, `.claude/hooks/worker-model-guard.sh`, `.claude/settings.json`, `tools/hooks/guard.ts`, `tools/hooks/test/bash-guard.test.ts`

`bash-guard.sh` lines 18 to 27 already spawn `bun -e` to parse the payload because
bash regexes cannot read a JSON-escaped Windows path, then go back to `grep`,
`sed` and `awk` for the matching. `worker-model-guard.sh` line 15 still uses the
broken regex extraction the other file's comment warns about. `settings.json`
invokes every hook as `bash .claude/hooks/x.sh` and the test does
`spawnSync("bash", ...)`, so `bun test` goes red in any shell without `bash` on
PATH, which is the PowerShell failure already in the owner's notes.

Write `tools/hooks/guard.ts` (payload in, exit 2 plus message out) holding both
guards' rules, point `settings.json` at `bun tools/hooks/guard.ts`, and make the
test call the `.ts` entry with `bun`. Add one case with a backslash path for the
worker-model guard.

## Make noUnusedImports an error; 19 dead imports hide behind warnings

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `biome.json`, `packages/sim/src/echo.ts`, `packages/sim/src/events.ts`, `packages/sim/src/hash-boss.ts`, `packages/sim/src/vane-cycle.ts`, `tools/director/src/`

`biome check .` reports 22 warnings (19 `noUnusedImports`, 3
`noTemplateCurlyInString`) and exits 0, so `bun run lint`, the stop hook and
`bun run land` all pass over them. Four of the dead imports are in `packages/sim`
(`echo.ts` line 4, `events.ts` line 4, `hash-boss.ts` line 6, `vane-cycle.ts`
line 2); the other fifteen are under `tools/director/`. Every one is auto-fixable.

Set both rules to `"error"` under `linter.rules`, run `biome check --write .`
once, and confirm `bun run lint` is clean and stays red on the next one.

## Typecheck apps/game/preview.ts, and make apps/server's tsconfig extend the root

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tsconfig.json`, `apps/server/tsconfig.json`, `apps/game/preview.ts`

The root `include` names `apps/game/build.ts` and `apps/server/dev.ts` by hand but
not `apps/game/preview.ts`, and `apps/*/src/**/*.ts` does not reach it, so the
server every agent verifies against is the one root-level script outside the type
check (`tsc --listFilesOnly` confirms). `apps/server/tsconfig.json` repeats all
fourteen `compilerOptions` of the root file because the root excludes
`apps/server/src`; the two agree only by copy.

Replace the two hand-listed entries with `apps/*/*.ts`, and make the server
config `extends` the root and override only `lib`, `types` and `include`.
`bun run typecheck` proves both; confirm with `tsc --listFilesOnly | grep preview`.

## Delete the dead tsc -b scripts, duplicate tool scripts and unused workspace deps

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `packages/sim/package.json`, `packages/net/package.json`, `tools/frames/package.json`, `tools/raster/package.json`, `tools/icons/run.ts`, `tools/icons/package.json`, `tools/queue/package.json`, `tools/index/package.json`, `tools/orphans/package.json`, `tools/hooks/package.json`, `bun.lock`

`packages/sim` and `packages/net` declare `"build": "tsc -b"` and neither has a
`tsconfig.json`, so the script errors immediately; nothing calls it. `tools/frames`
declares `@neon-spore/content` and imports it nowhere. `tools/raster` declares
`@neon-spore/render` but only its test uses it. `tools/icons/run.ts` line 20
reaches `../frames/capture.js` relatively while `tools/raster` imports
`@neon-spore/frames/capture.js` and declares the dependency; with Bun's isolated
linker that inconsistency is what left `playwright-core` unresolved for
`tools/icons` in the main tree. The `queue`, `index`, `orphans` and `scope`
scripts inside the tool packages duplicate root scripts that already call the
files by path.

Remove the dead and duplicate scripts, drop the unused deps, import
`@neon-spore/frames/capture.js` in `icons` and declare it, and re-lock in the same
commit. `bun install --frozen-lockfile && bun run check` proves nothing else
depended on them.

## Split tools/versus/prompt.ts into text, patch rendering and step builders

- **Found:** 2026-09-03, claude/code-review-improvements-ec1b31
- **Files:** `tools/versus/prompt.ts`, `tools/versus/prompt-text.ts`, `tools/versus/prompt-changes.ts`, `tools/versus/prompt-steps.ts`, `tools/versus/test/prompt.test.ts`

`prompt.ts` is 509 lines holding three responsibilities: lines 59 to 128 are
generic text layout (`WIDTH`, `HARD`, `wrap`, `row`, `named`, `count`, `list`,
`quoted`, `show`, `block`); lines 130 to 193 render one patch's old-to-new table
(`changes`, `packagesOf`); lines 195 to 509 are `votePrompt`, one 315-line
function whose banner comments already mark steps 0 to 7. The test imports only
`readCurrent`, `Vote` and `votePrompt`.

Move the three parts to `prompt-text.ts`, `prompt-changes.ts` and
`prompt-steps.ts` (one exported function per step taking a small context of
`slot`, `subject`, `candidates`, `won`, `pkgs`, `dirs`, `files`, `isContent`,
`nameWidth`); `prompt.ts` keeps `Vote`, `readCurrent`, validation and the join.
The public API is unchanged, so the existing 322-line test proves it untouched.
