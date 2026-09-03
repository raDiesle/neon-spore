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

**Marking one ongoing without opening a lane.** A session already in a worktree
that picks an item up itself — draining several in one sitting, rather than
being handed one — says `bun run queue take <n|title>`. That makes the same
claim branch `next` would have made, and nothing else: no prompt, no worktree.
`bun run queue done` drops the claim along with the entry, so an item stops
reading as ongoing at the moment it stops being in the file.

**Is anything still being worked on.** `bun run queue status` answers in one
word — `DONE` when nothing is left at all, `IDLE` when items are waiting and
nobody is on one, `BUSY` when somebody is, naming the items and the branches
holding them. It exists to be asked of a machine that is about to be turned
off: "is the queue finished" is a question about claims, not about whether the
last command printed something.

The claim is a branch rather than a mark in this file because a mark has to be
committed to be seen, and the session that took the item has not committed
anything yet — the moment the mark would be useful is the moment it does not
exist. Worktrees of one repository share their refs, so a lane's branch is
visible to the next `bun run queue` with no commit and no push. A cloud session
works in its own clone, so its claim is invisible here until it pushes; two at
once is the ceiling anyway, and locally that ceiling is enforced.

A claim carries no commits, so it points at `main` and reads as fully merged.
`bun run land` sweeps merged branches, and for one day it swept other lanes'
claims along with its own — both sessions running on 3 September 2026 lost every
claim they held and then did the same item twice. `partitionMerged` in
`tools/land/claims.ts` now leaves a claim standing unless it is the branch being
landed, which is the one case where deleting it is the release.

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

## `bun run frames` cannot fire the cannon, so no hit effect can be photographed

- **Found:** 2026-09-03, claude/rind-hit-effect-d14725
- **Files:** `tools/frames/spec.ts`, `tools/frames/hold.ts`, `tools/frames/capture.ts`, `tools/frames/run.ts`, `tools/frames/test/hold.test.ts`

`--hold` is the only way a capture presses anything, and `parseHold` accepts
exactly four controls — `prime`, `mazeString`, `wardenTether`, `lidString`. All
four are *held* controls, and none of them is a shot. So every effect that only
exists because a bullet met a body — a shed layer, a shell piece, a clasp
opening, a torn veil, a bare core — cannot be photographed by the tool
`CLAUDE.md` names for showing the owner something. This lane needed a frame of
one and hand-rolled a throwaway playwright script against `preview` to get it,
which is the fifth throwaway `tools/frames/shot.ts`'s own header counts.

The handle already has the verb: `window.neonSpore.send` takes any `Command`,
and `advance` stamps it on the next tick, so `{kind:"cannonCol",col}` followed
by `{kind:"fire",color}` is a shot. What is missing is a way to *say* it on the
command line and a way to say *when* — a shot has to land while the target is
on the field, which the existing `holdTicks` shape already models.

Add a `--press` that takes a sequence of presses with tick offsets, e.g.
`--press 60:1:cannonCol=3,60:2:fire=red`, parsed beside `parseHold` and applied
in `captureAt`'s tick loop. Prove it with a unit test on the parser (`hold.ts`
already has one to copy) and by capturing a frame of THE RIND mid-shed.

## PINBALL draws its slabs from the shipped wave, not the one being played

- **Found:** 2026-09-03, claude/wave-restart-special-bosses-6e5af4
- **Files:** `packages/render/src/pinball-round.ts`, `packages/render/test/pinball-frame.test.ts`

`drawControls` in `pinball-round.ts` calls `slabPanel(l, controlSetForWave(view.world.wave), view.role)`
— it re-derives the panel from the wave *index* and ignores `view.controls`,
which the host hands it. Its two siblings do not: `gauge-round.ts` and
`snake-panel.ts` both read `view.controls === undefined ? controlSetForWave(...) : view.controls`,
and `band.ts` says in a comment why that fallback is the rule rather than the
re-derivation.

It matters in the director, which plays the *draft* wave: the picker writes a
wave's `controls` field, `stage-pinball.ts` hit-tests against that field, and
the renderer draws a different set — buttons drawn where nothing answers them,
which is the failure `test/stage-rounds.test.ts` exists to prevent, arriving
through the drawing side. Make the call match its two siblings and add a frame
test that draws PINBALL with a `controls` set that is not the wave's own.
## Bind a demonstration to its wave by something a rename cannot break

- **Found:** 2026-09-03, claude/snake-svg-graphic-24d2fc
- **Files:** `packages/content/src/waves-demo.ts`, `packages/content/src/waves.ts`, `packages/content/test/waves-demo.test.ts`, `tools/director/test/brush-tooltip.test.ts`

`DEMONSTRATIONS` names its wave by a string and the director can rename a wave
from its own screen, so a save the owner makes lands `main` red. It has already
happened once — `ON THE BEAT` became `THE THROB` and `HOLD IT OPEN` became
`THE LID`, and four places naming a wave by string stayed where they were.
"The names that point at waves follow the waves that were renamed" repaired the
names; the seam that produced them is untouched, and the next rename does it
again.

Give a wave a stable id the registry holds instead — a field the director never
edits — or make the director rewrite every reference as part of its save. The
proof is the same either way: rename a wave through the director's own save
path and watch `bun run check` stay green.

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
## The room starts on a shared press, not a three-second timer

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `packages/net/src/protocol.ts`, `packages/net/src/status.ts`, `packages/net/src/lockstep.ts`, `apps/server/src/room.ts`, `apps/game/src/link.ts`, `apps/game/src/link-run.ts`, `apps/game/src/join.ts`, `apps/game/src/join-words.ts`

Read the `net-change` skill first — this crosses the wire and every rule in it
applies. Today the second phone landing makes the room stamp beat zero
`COUNTDOWN_MS` (3000 ms) ahead and both devices start on that timer
(`room.ts` `greet`). Replace the timer with a shared press: both seats reach a
new `ready` state, and beat zero is stamped only once **both** have sent a
`ready` client message. This is what makes a testing session workable — nobody
is dropped onto a field before the other person has looked up.

The shape: add a `ready` client message and a `LinkState` of `"ready"` (both
here, waiting on the press) where `countdown` sat. The room holds the two ready
flags and stamps `startMs = Date.now() + shortLeadMs` (a small lead, ~800 ms,
for the two clocks to land together) when the second arrives. The menu/room
screen grows a START button, enabled once `peers === 2` and the clocks agree,
that sends `ready`; its label reports "waiting for the other phone" until the
peer's ready arrives. A seat that leaves clears its ready. Decode without
trusting (`ready` carries no payload, so it is only a tag). Prove it with
`bun run relay:check` against a running wrangler — say **unverified** in the
report if no wrangler was available, and name the check. The `solo-is-quiet`
test must stay green: a ready press only exists in a room.

## A nickname, asked once and carried into the room

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/index.html`, `apps/game/src/nickname.ts`, `apps/game/src/join.ts`, `apps/game/src/join-words.ts`, `apps/game/src/main.ts`, `apps/game/src/game.css`, `apps/game/test/nickname.test.ts`

Stands alone, and the two identity items below build on it — do this one first.
The first time a device enters the room screen with no stored name, ask for one:
a single field, kept in `localStorage` under `neon-spore.name` (wrapped in
try/catch like `view.ts`'s store), trimmed, length-capped, everything in
English. Once set it is shown, with a way to change it. Pure helpers in
`nickname.ts` — `normalizeName(raw): string` and `isName(s): boolean` — tested
the way `join-words.ts`'s functions are, so no DOM is needed to prove the rules.

The name rides the join so the other phone can show it: this is a wire change,
so read the `net-change` skill and add the field to the `welcome`/`peers` path
in `packages/net/src/protocol.ts` and `apps/server/src/room.ts` in the same
pass (a name added to the client and not the wire shows only on your own
screen). The seat pills (`seatWord`, `#joinSeats`) then read the peer's name
instead of "HERE". Decode without trusting: a name from the wire is clamped by
the same `normalizeName` before it is drawn, never inserted as markup.

## Nicknames are unique, held server-side

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/server/src/names.ts`, `apps/server/src/index.ts`, `apps/game/src/nickname.ts`, `apps/game/src/join.ts`, `wrangler.jsonc`, `apps/server/test/names.test.ts`

Depends on "A nickname, asked once" — do that first. A name has to be unique
across the server to identify a person, so it needs a store. Use one Durable
Object as a name registry (a `NAMES` binding beside `ROOMS`), reached over a
small HTTP route on the worker (`apps/server/src/index.ts`) — **not** the room
socket, which stays a dumb relay (rule 2 of `net-change`). The registry claims
a normalized name for a device token the browser generates and keeps, answers
"taken" when someone else holds it, and is idempotent for the same token so a
returning device keeps its own name. Test the DO the way `apps/server/test/
room.test.ts` tests the room — claim, re-claim by the same token, collision by
a different one. The room screen surfaces "that name is taken" and asks for
another. Kept out of the lockstep path entirely, so it needs no relay to prove:
`bun test apps/server` covers it.

## The room is named for the pair, so they never re-type a code

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/src/join.ts`, `apps/game/src/menu.ts`, `apps/game/src/pairing.ts`, `apps/game/src/menu-pages.ts`, `apps/game/test/pairing.test.ts`

Depends on the two nickname items above. The four-character code stays the way
in the **first** time — it is still read aloud, that is the game. What this adds
is the way *back* in: once two named devices have shared a room, the pairing is
remembered (both names, on each device, in `localStorage`) and offered as a
one-tap "REJOIN <other name>" on the menu, with no code typed. Derive the room
key from the two normalized names in a fixed order (a pure `roomForPair(a, b):
string` in `pairing.ts`, tested), so the same pair always resolves to the same
room wherever they are. This does not auto-resume the game state — that was
deliberately left off the queue — it only removes the code from the second
meeting onward. A device may remember more than one partner; show the most
recent. Client-only past the room key, so `bun run check` proves it.

## The room stores the pair's stats and ends the run after long silence

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/server/src/room.ts`, `apps/server/src/seat.ts`, `apps/server/src/stats.ts`, `packages/net/src/protocol.ts`, `apps/server/test/room.test.ts`

Read `net-change`. Today a seat silent for `SEAT_SILENT_MS` (10 s) is evicted
and the peer told; a run with nobody in it simply hangs. Add a terminal step:
when **both** seats have been silent past a longer window (30 s — the owner's
figure), the room writes a small stats record to `ctx.storage` (waves reached,
score, joint moments — a client sends its own tallies up periodically as a new
`stats` message the relay stores but never reads into game state) and ends the
run: it clears `startMs`, so the next arrival gets a fresh beat zero rather than
rejoining a dead game. The 30-s window must be a `vars` override like
`SEAT_SILENT_MS` so the DO test can prove eviction-then-store without waiting.
Note the trade-off in the code: a longer window also lengthens how long a dead
pair blocks a third phone from the room. `bun test apps/server` covers the
storage and the timing; the wire addition wants `relay:check` — say
**unverified** if no wrangler was run.

## A settings page on the menu: sound, motion, and the install offer

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/src/menu.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/settings.ts`, `apps/game/src/audio.ts`, `apps/game/src/install.ts`, `apps/game/src/menu.css`, `apps/game/test/settings.test.ts`

A SETTINGS entry on the root menu opening a page (built like the WAVES/DEMOS
pages in `menu-pages.ts`) with: a sound/mute toggle — the mixer exists and only
the M key reaches it today (`audio.ts`), so wire the toggle to the same mute it
already has and persist the choice in `localStorage`; a reduced-motion toggle
that sets a `body` class the menu's animations already respect via
`prefers-reduced-motion` (add a `data-motion` override so the button wins in
both directions, the way the theme guidance does); and the home-screen install
offer, which is a chip today (`install.ts`) and belongs here where a player
looks for it rather than floating over the field. Keep the persisted flags in a
small `settings.ts` with pure get/set helpers, tested without a DOM. The
install chip may stay as the just-in-time prompt; this is the durable place for
it. Client-only — `bun run check` proves it.

## A "how to play" page: the two seats, and that talking is the control

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/src/menu.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/menu.css`

A HOW TO PLAY entry on the root menu opening a short page (built like the
CONTROLS page in `menu-pages.ts`) for the pair's first thirty seconds, before a
wave's own briefing reaches them. It says, in English and in the game's fixed
vocabulary (hull, cannon, shield, guard, pod, column — do not invent synonyms):
there are two of you, on two devices, with different jobs — PILOT slides the
cannon and opens the maw, NAVIGATOR slides the shield and fires; nothing you
control travels; and the one rule that is the whole game, that talking to each
other is the control scheme. Keep it to a screen. This is copy on a static
page, so it is provable with `bun run check`; if a wording choice feels like a
design call rather than a description, leave it plain and note it in the report
rather than inventing flourish.

## The menu remembers how far this device has got

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/src/progress.ts`, `apps/game/src/waves.ts`, `apps/game/src/menu.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu.css`, `apps/game/test/progress.test.ts`

The front door knows only PLAY versus RESUME. Give it the furthest wave reached
and the last score, per device, in `localStorage` (a `progress.ts` with pure
read/update helpers, tested without a DOM). The wave progression
(`apps/game/src/waves.ts`) is where a wave is reached and a score changes, so
record it there; the menu reads it to add a line under the title ("Furthest:
wave 7 · Last score 12300") and to point PLAY at a "continue from your
furthest" option beside "start over". Solo-only and per device — this is a
convenience, not shared state, so it never touches the room or the wire. Keep
the writes wrapped in try/catch like the other `localStorage` users.
`bun run check` proves it.
## The view switch is a second seat-picker floating over a player's field

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/src/view.ts`, `apps/game/src/game.css`, `apps/game/test/view.test.ts`

The `#viewSwitch` (P1 / P2 / TEST, top-centre) sits in every mode. Now that the
menu's seat cards are the way to choose a seat, the switch is a duplicate — and
on a player's phone, tapping the seat the room did not assign silently sends
that device's touches nowhere (the mode changes what answers a touch;
`view.ts`). Hide it on player devices: it is a desk/TEST affordance. `game.css`
already hides `#pauseBtn`, `#gear` and `#waveSkip` under `body.player-view`;
extend that rule to `#viewSwitch`. The way to the TEST/desk view is still there
— the menu's third seat card ("ONE SCREEN") sets it — so nothing is stranded.
A tiny test asserting the CSS rule exists (the way `input-pc.test.ts` asserts
against source, since this repo's runner has no DOM) proves it; `bun run check`.

## LEAVE ROOM hangs up on the other player with no confirm

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/index.html`, `apps/game/src/join.ts`, `apps/game/src/menu.ts`, `apps/game/src/game.css`

Both the room screen's `#joinLeave` and the menu's LEAVE ROOM entry call
`link.leave()` at once, which drops the other player's game — one mis-tap ends
it. Put a one-tap confirm in front of it: an inline two-step on the button
("LEAVE ROOM" → "SURE? · LEAVE / CANCEL"), or a small dialog reusing the hold
card's shape. The hold card's own LEAVE ROOM is a deliberate answer to a broken
line and stays immediate — this is only the two doors a player presses while the
game is fine. Client-only, provable with `bun run check`.

## The tuning panel still reads "TEST BUILD", from before the menu was the door

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/index.html`, `apps/game/src/testing.ts`

`#panel`'s heading is "NEON SPORE — TEST BUILD" and its footer is a paragraph of
desk keys, written when opening the game landed on the field and this panel was
the whole of the chrome. TUNING is a menu entry now, reached by a player rather
than only a tester. Refresh the heading (e.g. "TUNING") and drop or rehome the
desk-keys footer — the menu's CONTROLS page already lists the keys, so the
footer is a second copy that will drift. Keep the sliders, the god-mode toggle
and the BACK button exactly as they are. Copy-only, provable with `bun run
check`.

## The PreToolUse guard never sees a command run through the PowerShell tool

- **Found:** 2026-09-03, claude/task-queue-work-5b5548
- **Files:** `.claude/settings.json`, `tools/hooks/guard.ts`, `tools/hooks/shell-words.ts`, `tools/hooks/test/guard.test.ts`

The hook's matcher in `settings.json` is `"Bash"`, and on Windows the session's
primary shell is the separate PowerShell tool. Every rule the guard holds —
staging everything, a push naming main, a hot dev server, removing the worktree
the session stands in — is unenforced the moment the same command is typed into
the other tool, which is the tool CLAUDE.md names first.

Widen the matcher to both tools. The rules read arguments, so the work is in
`shell-words.ts`: PowerShell quotes with `'` and `"` but escapes with a
backtick, has no heredoc (`@'...'@` is a here-string terminated at column 0),
and separates commands with `;` and `|`. Decide whether one splitter can carry
both dialects or the payload's tool name should choose between two, and cover
the PowerShell spellings of each refused command with tests.

## Nothing checks section 3 of `docs/spec/audio.md` against `grain.ts`

- **Found:** 2026-09-03, claude/task-queue-work-49caa4
- **Files:** `packages/audio/test/catalogue.test.ts`, `docs/spec/audio.md`, `packages/audio/src/grain.ts`

`catalogue.test.ts`'s "the document" block already holds section 4's family
table against `CATALOGUE`, row by row, because a table nobody checks is a
document that stops being true. Section 3's grain table has no such check, and
it has already gone stale once: `noise` was added to `grain.ts` and the table
stayed nine rows long, with every test green. The row was put back by hand in
the same commit as this entry, which is the part that does not scale.

Read the exported function names out of `packages/audio/src/grain.ts` and
require the table to name exactly those, minus the ones the prose already
excludes as shapers rather than grains (`burst`, `after`, `soft`). The family
table's parser two functions below is the pattern; the "Where it sits" column is
prose and must not be asserted on.

## A stale `biome-ignore` is a warning, so `bun run lint` passes over it

- **Found:** 2026-09-03, claude/task-queue-work-49caa4
- **Files:** `package.json`, `biome.json`

`noUnusedImports` and `noTemplateCurlyInString` are errors now, so a dead import
or an accidental `${}` in a plain string fails `bun run lint`. One category is
still only advisory: `suppressions/unused`, which Biome reports when a
`biome-ignore` comment no longer suppresses anything. It is not a rule under
`linter.rules` and cannot be raised there, and `apps/game/test/sw.test.ts` had
carried a dead `lint/security/noGlobalEval` suppression for long enough that
nobody noticed — the rule it named had stopped firing, and the comment claimed a
danger the file no longer had.

`biome check --error-on-warnings .` makes every warning-level diagnostic exit
non-zero, which is the same promise `linter.rules` gives per rule but for the
categories that have no rule. The tree is at zero warnings today, so the flag
costs nothing to add. Change the `lint` script, confirm `bun run check` is still
green, and confirm the flag bites by pasting a `biome-ignore` for a rule that
does not fire and watching lint go red.

## shapes-motion.test.ts is still three seconds, and none of it is the expects

- **Found:** 2026-09-03, claude/dynamic-workflows-session-strategy-3637de
- **Files:** `tools/director/test/shapes-motion.test.ts`, `tools/shape-sheet/src/contour.ts`

"Cut shapes-motion.test.ts from six seconds and eleven million expects" said the
assertion count was the cost. It was not. Removing all 11 473 102 of them took
the file from 5.9 s to 5.2 s; hoisting the transform's regex parse out of the
per-point loop took it to 3.2 s. What is left is `subject.pointsAt(t)`, called
once per `CATALOGUE` entry per sample — 101 × 200 contours built from scratch,
at roughly 0.15 ms each, and every one of them thrown away after four
comparisons.

The claim under test needs *poses*, not points: the box has to contain the
contour at each sample. Either memoise `pointsAt` per subject and time (the
director's own `shape-fit.ts` keeps a memo for exactly this reason and says
why), or reduce `LATER` from 200 samples to a set chosen to cover the same
phase space — and say in the file which, because a smaller sample is a weaker
guarantee and the next reader will want to know it was deliberate. A memo is
the honest one; the samples are the cheap one.
