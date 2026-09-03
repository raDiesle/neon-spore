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
branch, writes a `Taken:` line into the entry on `main` and pushes it, then
prints a prompt naming the branch. The session checks that branch out in its own
worktree, does the item, removes the entry with `bun run queue done <n|title>`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

**Marking one ongoing without opening a lane.** A session already in a worktree
that picks an item up itself — draining several in one sitting, rather than
being handed one — says `bun run queue take <n|title>`. That makes the same
claim `next` would have made, branch and `Taken:` line both, and stops there: no
prompt, no worktree. `bun run queue done` drops the claim along with the entry,
so an item stops reading as ongoing at the moment it stops being in the file.

**Is anything still being worked on.** `bun run queue status` answers in one
word — `DONE` when nothing is left at all, `IDLE` when items are waiting and
nobody is on one, `BUSY` when somebody is, naming the items and the branches
holding them. It exists to be asked of a machine that is about to be turned
off: "is the queue finished" is a question about claims, not about whether the
last command printed something.

**A claim is written twice, because neither half reaches everybody.** The branch
is the gate: worktrees of one repository share their refs, so `claude/queue-…`
is visible to the next `bun run queue` with no commit and no push, and two
sessions cannot be handed the same item because the second `git branch` fails.
The `Taken:` line is the half a local ref cannot do — a session working in its
own clone sees only what `origin` carries, and on 3 September 2026 two sessions
did the same six items in parallel for exactly that reason. So the line is
committed straight to `main` and pushed, where it is the first thing anybody
reads. `next` then moves the branch onto that commit, so a lane starts from a
trunk that already carries its own mark and its `queue done` removes the whole
entry without a conflict.

The two things a claim cannot always do are said out loud rather than guessed
at: if no worktree has `main` checked out, or the trunk's copy of this file has
uncommitted changes in it, the branch is still made and a `⚑` line says the
entry went unmarked.

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

A third line, `- **Taken:** 2026-09-04, claude/queue-one-line-saying-what`, sits
between the two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.

## SNAKE's mouth can be tapped open forever: the rest is shorter than the window

- **Found:** 2026-09-03, claude/snake-boss-visuals-c5f82f
- **Files:** `packages/sim/src/config-snake.ts`, `packages/sim/src/snake-controls.ts`, `packages/sim/test/snake.test.ts`

`snakeMawRestTicks` is 30 and `snakeMawTicks` is 84, so a thumb pressing MAW
every 30 ticks holds the mouth open for the whole round. `snake-controls.ts`
says in as many words that the rest "is what stops a thumb tapping it every tick
from being the same as leaving it open", and at these two numbers it does not:
it stops tapping it *every* tick and nothing else. The gap predates this lane —
the window was 60 against the same rest of 30 — and widening the window to 84
made it worse rather than making it.

The mouth is meant to be a moment player 1 times against a step, which is the
whole of what the round asks of that seat, so the fix is to make the rest at
least as long as the window: a press that opens the mouth should be a press
that cannot be repeated until the mouth has shut on its own. One number in
`SNAKE_DEFAULTS`, and a test in `snake.test.ts` that presses MAW twice inside
one window and proves the second press moved nothing — `mawTick` unchanged, and
a point driven over after the window is a repeat.

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
try/catch like `view.ts`'s store) and everything in English.

**The rules, decided by the owner on 3 September 2026.** A name is *required* —
the room screen does not continue without one. `normalizeName` trims the ends,
collapses any run of inner whitespace to one space, and drops anything that is
not a letter, a digit or one of those spaces; `isName` then holds the result to
3 to 12 characters. Twelve because a seat pill on a narrow phone is what has to
hold it. Drawn uppercase like the rest of the UI, by CSS rather than by storing
it that way — what is stored is what was typed. Once set it is shown; *changing*
it lives on the settings page (see "A settings page on the menu"), not here, so
this screen only ever asks the first time.

Pure helpers in `nickname.ts` — `normalizeName(raw): string` and
`isName(s): boolean` — tested the way `join-words.ts`'s functions are, so no DOM
is needed to prove the rules.

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
returning device keeps its own name.

**Decided by the owner on 3 September 2026: the global registry as written, and
a recovery code.** A token dies with the browser's storage — a new phone,
cleared site data, a private window — and without a way back the name is gone
for good. So a successful claim also mints a short recovery code and shows it
*once*, in the same breath as the name: "DAVID is yours. Write down 7K2Q."
Entering a name and its code from another device moves the claim to that
device's token, which is the whole of the recovery flow: no accounts, no email,
and nothing new kept on the device but the token it already has. The code is
generated inside the Durable Object, never on the client, stored beside the
claim and compared there; a wrong code answers exactly as a taken name does, so
the route cannot be used to find out which names exist. The room screen grows
the two fields — the name, and a code that is only needed to take a name
somebody's old device still holds — and the settings page reuses them for a
change of name.

Test the DO the way `apps/server/test/room.test.ts` tests the room — claim,
re-claim by the same token, collision by a different one, recovery with the
right code, refusal with the wrong one, and that the refusal is
indistinguishable from a collision. The room screen surfaces "that name is
taken" and asks for another. Kept out of the lockstep path entirely, so it needs
no relay to prove: `bun test apps/server` covers it.

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
figure), the room writes a small record to `ctx.storage` and ends the run: it
clears `startMs`, so the next arrival gets a fresh beat zero rather than
rejoining a dead game.

**Decided by the owner on 3 September 2026: the record is the pair's furthest
wave and last score, and the room screen reads it back.** Two fields rather than
"waves reached, score and joint moments" — a record nothing reads is dead
weight, and this one has a reader from the day it is written. A client sends its
own tallies up periodically as a new `stats` message the relay stores and never
reads into game state; the room hands them back in `welcome`, and the room
screen shows one line when the pair returns — "you two reached wave 9 · 12 300".
It is keyed by the room, and the room is keyed by the pair once "The room is
named for the pair" lands, so the line follows the two people rather than the
device. Where the two seats disagree the higher tally wins: a seat that dropped
early holds the lower one, and neither is authoritative. The 30-s window must be a `vars` override like
`SEAT_SILENT_MS` so the DO test can prove eviction-then-store without waiting.
Note the trade-off in the code: a longer window also lengthens how long a dead
pair blocks a third phone from the room. `bun test apps/server` covers the
storage and the timing; the wire addition wants `relay:check` — say
**unverified** if no wrangler was run.

## A settings page on the menu: sound, motion, your name and the way out

- **Found:** 2026-09-03, claude/multiplayer-game-nav-ux-ab89dd
- **Files:** `apps/game/src/menu.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/settings.ts`, `apps/game/src/audio.ts`, `apps/game/src/install.ts`, `apps/game/src/nickname.ts`, `apps/game/src/progress.ts`, `apps/game/src/pairing.ts`, `apps/game/src/menu.css`, `apps/game/test/settings.test.ts`

A SETTINGS entry on the root menu opening a page (built like the WAVES/DEMOS
pages in `menu-pages.ts`) with: a sound/mute toggle — the mixer exists and only
the M key reaches it today (`audio.ts`), so wire the toggle to the same mute it
already has and persist the choice in `localStorage`; a reduced-motion toggle
that sets a `body` class the menu's animations already respect via
`prefers-reduced-motion` (add a `data-motion` override so the button wins in
both directions, the way the theme guidance does); and the home-screen install
offer, which is a chip today (`install.ts`) and belongs here where a player
looks for it rather than floating over the field. The chip may stay as the
just-in-time prompt; this is the durable place for it.

**Three more, decided by the owner on 3 September 2026.**

- **Your name.** The nickname is asked once on the room screen and *changed*
  here — this is the one durable place for "things about me", and it keeps the
  room screen down to asking a first-timer. It reuses the name-and-code fields
  from "Nicknames are unique, held server-side", including the taken-name
  answer, so this part depends on that item and is the only part of this page
  that touches the server.
- **Clear this device's data.** One button that forgets the stored name, the
  remembered partners and the progress line — for handing the phone to someone
  else, or starting clean. It is also the only way back out of a stored name
  today. It clears the `neon-spore.*` keys and nothing else; the server-side
  claim is left standing, which is what the recovery code is for, and the button
  says so in one line.
- **The build.** A line at the bottom naming the build, so a bug report from a
  phone can say which one it was. `apps/game/build.ts` already defines
  `__BUILD_DATE__`, so this is reading a constant, not new machinery.

A haptics toggle was asked for in the same breath and is a queue item of its own
("A buzz for the two things a player must not miss") — the toggle is a flag like
the others, but nothing vibrates yet, and a switch that turns nothing on is
worse than no switch.

Keep the persisted flags in a small `settings.ts` with pure get/set helpers,
tested without a DOM. Client-only apart from the name — `bun run check` proves
the rest.

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
it. Put a one-tap confirm in front of it. **The owner chose the inline two-step
on 3 September 2026**, over a dialog: the button becomes
"SURE? · LEAVE / CANCEL" in place and reverts on its own after a few seconds if
neither is pressed. No new overlay, nothing to dismiss, and nothing a thumb
already travelling can tap through. Both doors get the same two-step.

The hold card's own LEAVE ROOM is a deliberate answer to a broken
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

## A buzz for the two things a player must not miss

- **Found:** 2026-09-03, claude/queue-parked-hooks-and-three
- **Files:** `apps/game/src/haptics.ts`, `apps/game/src/settings.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/loop.ts`, `apps/game/test/haptics.test.ts`

Asked for by the owner on 3 September 2026, alongside the settings page, and
split out of it: the toggle is a flag like the other two, but nothing vibrates
yet, and a switch that turns nothing on is worse than no switch.

A phone buzz is a channel that survives a noisy room, which is the room this
game is played in. `navigator.vibrate` is the whole of the platform side, and it
is absent on desktop and on iOS — so the toggle only appears where
`"vibrate" in navigator`, and the call is wrapped, because a browser that has it
may still refuse it outside a gesture.

Two events, and deliberately only two: **the hull taking a hit**, and **a shot
in the wrong colour**. Both are already named in the audio catalogue, both are
things the pair has to notice mid-sentence, and a phone that buzzes at
everything is a phone somebody turns off. Short pulses — 40 ms for the wrong
colour, 120 ms for the hull, so the two are told apart by length the way the
sounds are told apart by shape. Read the events off the same `SimEvent` stream
the mixer does rather than from a second place, and default the setting **off**.

`haptics.ts` holds `pulseFor(event): number | null` — pure, and the whole of the
decision — plus a thin caller that checks the setting and the capability.
`bun run check` proves the mapping; whether the phone actually buzzes is a phone
question and the report says **unverified**.

## `bun run land` refuses a file whose only change is git's stat cache

- **Found:** 2026-09-03, claude/queue-batch-pretooluse-detached-a83553
- **Taken:** 2026-09-03, claude/queue-bun-run-land-refuses-a-file-whose-only-change-is
- **Files:** `tools/land/run.ts`, `tools/land/land.ts`, `tools/land/test/land.test.ts`

A landing was refused with `1 uncommitted file here — a lane lands what it
committed: .claude/launch.json`, and the file had no changes at all: `git diff`
was empty, and `git hash-object` on the working copy gave the same blob the
index and `HEAD` both held. What differed was the stat cache. Something had
rewritten the file with identical bytes, so git marked the entry as needing a
re-read, and `git status --porcelain` — which is what `dirtyOf` in `run.ts`
reads — reports such an entry as ` M` until git refreshes it. `git update-index
--refresh` did not clear it either; `git add` on that one path did, by writing
the entry back.

The cost is a landing that stops on a file the lane never touched, with a
message that says the lane has uncommitted work when it has none. On this
machine `.claude/launch.json` is rewritten by the harness, so it is the file
this will keep happening to.

Refresh before asking. `git status --porcelain` after a `git update-index -q
--refresh` (or `git status` with the refresh it does implicitly), or read
`git diff --name-only HEAD` instead, which compares content and never reports a
stat-only difference. Whichever, keep the refusal for real uncommitted work —
`land.test.ts` already covers that — and add a case for the shape that caused
this: an entry git reports as modified whose content matches `HEAD`.

## CLAUDE.md says a worktree's server never takes the base port, and it does

- **Found:** 2026-09-03, claude/queue-batch-pretooluse-detached-a83553
- **Files:** `CLAUDE.md`, `docs/working-with-claude.md`, `tools/ports.ts`

CLAUDE.md's "Verifying in a browser" section says **"In a worktree the port is
not 4173"**, and the director's paragraph says the same of 4174. That is not
what `claimPort` does. It tries the base port *first*, always — the comment
above it says why, and the reason is good: "a single server in a single tree
still answers where every document, launch config and `curl` line says it
does". The tree's derived port is the *fallback*, taken only when something
else is already holding the base and answering for another tree.

So a director started in a worktree with nothing else running announces
`http://localhost:4174`, which the rule says cannot happen. A session that
believes the rule probes the derived port, gets nothing, and concludes its
server failed to start — which is what happened here, twice, before the log was
read.

The advice one line later is the part that is right and should survive: read
the port out of the server's own startup line rather than assuming it. Rewrite
the claim around that — the base port when it is free, the tree's own when it
is not — in both CLAUDE.md and `docs/working-with-claude.md`, and check
`tools/ports.ts`'s own comments say the same. Documentation only; provable with
`bun run check`.
