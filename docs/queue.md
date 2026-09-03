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
- **Taken:** 2026-09-03, claude/queue-the-menu-remembers-how-far-this-device-has-got
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
