# Queue

Work a session found and did not do. Every entry here is waiting for a session
of its own, and most of them drain without the owner deciding anything — the
ones that do not say so on their own line.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped, and
**a command that failed and was worked around** — retried, slept past, run
twice. Working around one is what keeps it, and every later session pays the
same tax in minutes and in tokens. The test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**A `Files:` line names files the tree already has.** `tools/test/doc-drift.test.ts`
holds every entry to it, and holds every document to naming no path in backticks
that does not exist — so a file an entry proposes to *create* is described in
the body, unbackticked, rather than listed as a file. An entry that names the
file it is about to write is red on `bun run check`.

**And a landing that could not check itself writes one, without being asked.**
`bun run land --unverified "<what>"` puts an `## Unverified at <sha>:` entry
here at the moment the trunk moves, and a cloud session uses it every time it
lands something it could not look at — a wave never watched at tempo, a shape
never seen to move, a frame cost the sandbox is too slow to take. It is an
ordinary entry: claimed, opened on a machine that can look, and removed with
`queue done`. `docs/cloud-session.md` has why the alternative — leaving it in a
report that ends with the session — was the half of that arrangement that never
worked.

**And a topic that asks the owner something belongs here too**, on an
`- **Asks:** <question>` line. That is a change the owner made on 6 September
2026, and it reverses the paragraph this file used to carry. What it fixes is
where such a thing was going instead: a question filed in `docs/spec/` is on a
page nobody opens on the way to work, so it was read the day it was written and
never again. Here it is in front of whoever runs `bun run queue`, the listing
marks it `ASKS THE OWNER`, and `next` hands the session a prompt that puts the
question first and says to build nothing until it is answered.

Such an entry is otherwise an ordinary one and is held to the same test — it is
claimed, worked in its own lane and removed by `queue done` — so the body still
has to say what to change and still has to **name the options the answer picks
between**. "What should this look like?" is not an entry. "Three places it
could be drawn, and here is what each costs" is.

**And nowhere else.** Not the report, which scrolls away — the next session
clones `origin` and sees only files. Not a suggested background task either:
this file *is* the mechanism, and a chip is a popup the owner has to dismiss
that says nothing `bun run queue` does not already say to whoever asks it. A
finding written here is read by every session that comes after; a finding
offered as a chip is read once, by the one person the queue exists to spare.

**What still does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* with a shipped alternative is offered in `tools/versus/`, because the
only way to choose between two is to see both.

The line between those and an `Asks:` entry is **whether there is work waiting
on the answer**. A creature nobody has built is a page in the spec: there is no
lane held up by it, and the owner picks from that sheet when he opens a session
to. A control that is drawn but says the wrong word is an entry here: the work
is decided, sized and sitting in named files, and the only thing missing is one
sentence from him. Filing the first kind here is what buried the queue last
time under sixty-two entries nobody could face, and that has not stopped being
true — the new rule widens the door by one hinge, not off them.

**Every path an entry names is a path the tree has**, on the `Files:` line and
in the body alike — `tools/test/doc-drift.test.ts` holds both, and it is the
same rule every document here obeys. So an entry that proposes a **new** file
cannot spell it out: name the directory on `Files:` and call the file *a
`sheet.ts` beside `crop.ts`* in the body. A path that goes red is a document
naming something nobody can open.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on. **It also
says when an entry has gone stale** — a file its `Files:` line names was
changed on `main` by a commit dated after the entry, or is not on `main` any
more — with the commit's sha and subject, so the session that claims it
re-reads before it works; the entry itself is left as it was.
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

A clone with nothing on `main` — every cloud session, where the one checkout
stands on the lane and the trunk is a ref beside it — gets the same line by a
different route: the commit is written onto the ref directly, without a
checkout, and the lane's own working tree is not touched. The one thing a
claim still cannot do is said out loud rather than guessed at: if the trunk's
copy of this file has uncommitted changes in it, the branch is made and a `⚑`
line says the entry went unmarked.

An entry that is not on `main` yet — the owner asked for it to be queued and
worked in the same sitting, so it is in the lane's working tree and nowhere
else — is marked where it is: the branch is made, the line goes into the
working copy, and the lane commits it with the work that queued it. And a
claim that fails between the branch and the line takes the branch back down
with it, so the next `take` starts from nothing rather than from a ghost
that says the item is already taken.

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

`- **Taken:** 2026-09-04, claude/queue-one-line-saying-what` sits between the
two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`- **Asks:** <question>` is the fourth line, and it is the only one a finder
writes on purpose. It goes under `Files:`, it has to end in a question mark —
the parser refuses one that does not, because an `Asks:` reading like a task is
a line the owner agrees with and still cannot answer — and it makes the listing
say `ASKS THE OWNER`. **The title does not say it too**, any more than a
`Where:` entry's title says `LOCAL ONLY`: the listing hangs both off the
fields, and a title that shouts one carries it twice — into the string `take`,
`release` and `done` are matched on. The parser refuses that as well. Write the
question so it can be answered in a sentence, and let the body carry the
options it picks between:

```
## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`- **Where:** cloud` or `- **Where:** local` reserves an entry for one kind of
session, and it is the owner's line rather than the finder's. He asked for it
on 13 September 2026, the day a local session re-watched four waves a cloud
session had built: some work can only be done on a machine with a screen and a
real frame budget — a wave watched at tempo, a `bun run perf` — and some he
wants handed to a cloud session on purpose, from his phone, so the session on
his own machine stays free. The listing marks such an entry `CLOUD ONLY` or
`LOCAL ONLY`, `bun run queue next` passes over one kept for the other kind,
and `next <n>` or `take <n>` naming it is refused with the reason. A session
knows which kind it is by `CLAUDE_CODE_REMOTE`, the signal the web image sets
(`tools/queue/where.ts`). Without the line an entry is anybody's, which is
still what nearly every entry is.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim;
`tools/queue/test/where.test.ts` holds the reservation.

## PLAY is a list of partners to continue with, and the room is a step-by-step

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `apps/game/src/menu-entries.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu-seats.ts`, `apps/game/src/menu-rejoin.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu.ts`, `apps/game/src/pairing.ts`, `apps/game/src/progress.ts`, `apps/game/src/join.ts`, `apps/game/src/join-steps.ts`, `apps/game/src/join-step-view.ts`, `apps/game/src/join-words.ts`, `apps/game/src/join-link.ts`, `apps/game/src/join-name.ts`, `apps/game/index.html`, `apps/game/src/link-ask.ts`, `apps/game/src/link-report.ts`, `apps/server/src/room-seat.ts`, `apps/game/test/menu.test.ts`, `apps/game/test/pairing.test.ts`, `apps/game/test/join-words.test.ts`

The owner asked for this on 14 September 2026 — the first exemption under *A
look is offered, never replaced*; say so in the commit. It is one workflow but
several green pieces; land each as it goes green rather than holding the
branch (`docs/git-and-landing.md`). Seat choice reaching the other phone
touches the wire: `.claude/skills/net-change` before that piece.

**The stepping itself — step 4's first four pages — landed on 15 September
2026.** The room screen is `join-steps.ts`'s four steps and each asks one
thing: JOIN or CREATE, the name, the code, the room. SEND LINK and WHAT THIS
IS are gone, markup and bindings both, and `shareRoom`/`roomLink` with them —
a link *into* a room still opens one, because somebody was sent one yesterday.
`bun run menu-shot out.png --page "PLAY > NEW GAME > CREATE" --element
"#joinScreen"` photographs the creator's code page; the trail walks off the
menu onto the screen a press opened now (`tools/frames/menu-press.ts`), which
it could not before. **What is left of 4 is the shared room page itself** —
the creator's seat and difficulty reaching the other phone, and the two
READY circle holds in place of START — and that is the half that wants two
browsers against a wrangler.

**Steps 1, 3 and the gear half of 2 landed on 15 September 2026.** The PLAY
page is the list, NEW GAME is under it, REJOIN is gone, a partner is a record
of a name, the wave the two of them reached and the tempo they played it at
(`apps/game/src/partners.ts`), the seat cards are off the page, and every
partner's row carries a gear that opens the three tempi *for that pair*
(`bun run menu-shot out.png --page "PLAY > ⚙" --partners "Ada:6"` photographs
it). **Step 4 is what is left**, plus step 2's other half — the difficulty offered
while a game is being *created* — which has no home until 4 builds the room
screen. It wants a session that can put two devices in one room against a
wrangler, and **a cloud session is now one**: `bun run relay:check:all` starts
the relay and stops it again, and 5 below was found and fixed that way on 15
September 2026 (`docs/cloud-session.md`).

**What the gear turned out to need, for whoever works 4.** A tempo is not a
thing a device holds. The room keeps its own level in Durable Object storage
(`room-tally.ts`) and hands it to both phones on `welcome`, and `onStart` uses
*that* and not `b.level()` — so a choice made on the PLAY page, where there is
no socket, is a wish until somebody carries it in. `link.join(room, wanted)`
is where it is carried: the tempo travels with the join and is sent once, on
the welcome, and only when it differs from what the room holds
(`apps/game/test/pair-tempo.test.ts`). The creator's pick on the room screen
is the same shape and should use the same door rather than a second one.

**Behind PLAY, today** (`playEntries`): the partners, each with a gear, then
NEW GAME and CONTINUE. **What he wants:**

1. ~~**The PLAY page is first a list of the people this device has played
   with**~~ — landed. ~~DIFFICULTY still sits under the list~~ — left on 15
   September 2026, with step 4. **CONTINUE is still there**, and only a third
   of it has a home: its START answer is the READY hold on the room screen
   now, but its other two — the way back to a field open under the menu, and
   the mend of a parted run, which `shell.ts` brings the menu up for and
   `join-words.ts`'s desync sentence sends people to — have none. Two ways:
   the room screen opens on a parting too and the circles mend it, and a
   menu opened over a running field closes on its own chip, so CONTINUE goes;
   or the row stays under NEW GAME with those two answers and a new name.
   `menu.ts` `carryOn`, `menu-link.ts` `continueLine`, `shell.ts`, and the
   CONTINUE cases in `menu-front.test.ts`.
   - **Answered:** 2026-09-17, by the owner — **It leaves.** The room screen opens on a parting too and the READY circles mend it; a menu opened over a running field closes on its own chip; CONTINUE comes off the PLAY page. `.claude/skills/net-change` before the piece that reaches the wire.
2. ~~**Difficulty is chosen when creating a new game**, on the room screen~~
   — landed on 15 September 2026: three tempi on step 4, the host's to press
   (`join-room-step.ts`), the other phone reading the pick off its welcome.
   ~~And for an existing partner behind a
   gear icon on the right end of that partner's row, opening the three-level
   list for that pair~~ — landed: the gear is a second press target beside the
   row's own button (`menu-rows.ts`'s `aside`; a button inside a button is not
   a thing), the page it opens says TEMPO WITH ADA and marks that pair's level,
   and the answer goes to their record (`menu-tempo.ts`, `pairing.ts`).
3. ~~**No seat on the PLAY page.**~~ — landed. The cards (`menu-seats.ts`) are
   drawn under the rig's rows now, which is where the one person who can press
   them is; a pair reads its seat off the room screen's own pills
   (`join-words.ts` `seatWord`), and BOTH was never offered to a pair at all.
4. **The TWO DEVICES / room screen becomes steps** (`index.html` `#joinScreen`,
   `join.ts`). ~~Remove SEND LINK (`#joinShare`, `shareRoom` in
   `join-link.ts`) and WHAT THIS IS (`#joinWhat`) — both, everywhere on this
   screen.~~ — done. Then:
   - ~~**Step 1**: two buttons only, **JOIN** or **CREATE**.~~ — done.
   - ~~**Step 2**: the nickname (`#joinName`, `join-name.ts`), asked once the
     choice is made, skipped when the device already has one.~~ — done, and it
     is asked over the top of a room rather than before one: the device that
     reaches that field walked in on a link and never passed the menu.
   - ~~**Step 3, creator**: the code, large, and one sentence: *be on a voice
     call and read this out*. **Step 3, joiner**: the code field
     (`#joinEnter`) and *type in the code you were told*.~~ — done. The two
     modes leave step 3 at different moments and that is the design: a joiner
     leaves on the join, a creator on the second seat arriving.
   - **Step 4** — *the page is there, and what is on it is not*. Waiting for
     the other phone; then, **on the same screen for
     both**, the room's state: both names, and the creator picks **the seat**
     and **the difficulty** there — the joiner sees the choice made and takes
     the other seat — and each says READY with **the circle hold the guides
     use** (`briefing.ts`, `render/ready-circles.ts`), not a START button
     (`#joinStart`, `startButton` in `join-words.ts`). ~~Who holds which seat is
     today the server's arrival order (`seat.ts`, `link.ts:202`); the
     creator's pick has to reach the other phone, which is one new message or
     a swap — the net-change skill's files move together.~~ **The wire half
     landed on 15 September 2026**: a `seat` message (`protocol.ts`), honoured
     only from the host and before beat zero (`apps/server/src/room-seat.ts`),
     turns one persisted swap bit that every seat lookup reads through
     (`seat.ts` `seatTag`); the welcome carries `host` and is re-sent to both
     on a swap and on a `level`, so the joiner sees the pick made; the client
     has `Link.pickSeat` and `LinkStatus.host` (`link-ask.ts`,
     `link-report.ts`). Proved by `apps/server/test/room-seat.test.ts` and
     `relay:check:all`. **The screen half landed the same day**: the pills are
     the host's presses (`join-room.ts` `mayShape`), the three tempi sit under
     them, and two READY circles in DOM replace `#joinStart` — the own one
     fills under a thumb over `readyHoldMs`, both are drawn on both phones,
     the one waiting on this phone breathes (`join-room-step.ts`,
     `join-room.test.ts`). `tools/frames/room-phones.ts` `holdReady` is the
     press a walk cannot do. Seen on two browsers against a wrangler: the
     swap, the joiner's press ignored, HARD on both, both holds, beat zero at
     120 bpm on both.
   - The joiner's pages mirror it: JOIN → name → code → the same shared step 4.
5. ~~**The wait for the other player gives up too soon.**~~ — landed on 15
   September 2026, and **it was neither of the two timers this entry named**.
   Reproduced against a live relay: `SEAT_SILENT_MS` never fires, because the
   room only evicts while it is computing its seats and a silent seat with
   nobody else pinging is never looked at — a device was left silent for 24
   seconds and kept its seat. `HOLD_AFTER_MS` cannot fire either: `troubleOf`
   answers only for `lost` and `stalled`, and a phone waiting for a partner is
   `waiting`. What fired is `RECONNECT_TRIES` (6) at `RECONNECT_MS` (900) in
   `link-socket.ts` — the client gives up **5.4 seconds** after its line goes,
   and abandons a seat the room holds for ten. It is patient until a welcome
   says the room is full now (`WAITING_TRIES`, 108 s).

`menu.test.ts` and `menu-front.test.ts` read the rows; `pairing.test.ts`
holds the store's shape; `join-words.test.ts` holds every sentence on the
room screen. Prove with `bun run check`, and for step 4 the two-browser run,
sending one PNG of the shared ready step.

## Unverified at ce8a2324: THE SCOUT's arenas were never watched at tempo — the fl…

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `apps/game/src/rounds.ts`, `apps/game/src/scout.ts`, `docs/INDEX.md`, `docs/spec/briefings.md`, `docs/spec/interludes.md`, `docs/time-log.md`, `packages/content/src/control-aim.ts`, `packages/content/src/control-command.ts`

*THE SCOUT: the ship puts a little one out, and only one of you can see where it is going* landed from a session that could not look at it. The commit touched 49 more files. What went unchecked:

- THE SCOUT's arenas were never watched at tempo — the flight's feel, its beat counts and the hazard timings are arithmetic and tests only

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## The lost screen's plates open, and their own sentence says they close

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/src/lost-shutters.ts`
- **Answered:** 2026-09-17, by the owner — **Turn it round, through VERSUS.** Plates that really close, settling over everything but a lit tear in the breach column, offered as a candidate against the picked screen; the words stay as they are, since they already describe the candidate.

`veil` computes `top = -(1 - k) * seam` and `foot = height - (1 - k) * (height
- seam)`. At `age` 0 both plates cover their halves and the screen is solid; as
`k` reaches 1 the upper one settles at `SEAM` and the lower one leaves the
bottom of the screen entirely. They retreat. The candidate's sentence, quoted
on the VERSUS page the pick was made from, says they "slide in over the field
from the top and the foot and close on everything but the column it hit".

Two things follow. The settled picture is one plate across the top with the
hull, the breach and the buttons in the clear below it — which is a good
picture and is the one that was chosen, seen at `freezeSeconds: 2.5`. And the
tear, `TEAR_TILES` and `TEETH` and the lit ragged edge, is only on screen
during the half second of transit: at rest the lower plate has no height for a
tear to be in.

The answer picks between two:

- **Leave it.** Rewrite nothing but the words, which is already done, and
  delete the tear — it is roughly forty lines drawing something visible for
  under half a second on a screen the pair is reading.
- **Turn it round.** Plates that really close, settling over everything but a
  lit tear in the breach column. That is a different screen from the one that
  was picked, so it would want to go back through VERSUS rather than onto the
  field.

Nothing is wrong on screen today; what is wrong is that the file and the
picture disagree, and the next reader will believe the file.

## Unverified at 805b6376: THE STARE's rhythm was never watched at tempo: whether…

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `docs/INDEX.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind.ts`, `packages/audio/src/sounds/boss.ts`, `packages/audio/test/bind.test.ts`

*THE STARE: something is watching, and the one it watches has to sit on their hands* landed from a session that could not look at it. The commit touched 42 more files. What went unchecked:

- THE STARE's rhythm was never watched at tempo: whether four beats of warning is long enough to say it is you, and whether the looks grow into something survivable, are figures an eye and a pair have to judge

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE SPLICE's clock is under the guide's band

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/src/splice-draw.ts`, `packages/render/src/boss-draw.ts`, `packages/render/src/round-header.ts`

**One third of a split, and the only third that is decided.** The round writes
`1 OF 2 · 26` at 159,94 on the seat shown the tangle, placed off
`spliceTopY(l, cfg) - l.tile * 0.7`, and the rehearsal's band reaches 104. It
is a readout at a fixed offset from the top of the screen, which is exactly
what `round-header.ts` exists for: `headerTop(view, own)` at `drawClock`.

`drawSplice` takes a `Layout` and the boss's own state today, so the clearance
has to be carried down from `boss-draw.ts:140`, where the `ViewState` is
already in hand. Nothing else in the file moves — the straws, the mouths and
the numbers are on the field, not in the strip.

Widen `packages/render/test/guide-plate-room.test.ts` to sweep the clock's
line when it is done; its header carries the list.

## A round's picture is under the guide's band on eight rehearsals

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/src/fleet-chart.ts`, `packages/render/src/coord-grid.ts`, `packages/render/src/beatbox-marks.ts`, `packages/render/src/lost-shutters.ts`, `packages/render/src/round-header.ts`

**The rest of a split, and the original entry's one-line answer — "`headerTop`
at each site" — is wrong for all of it.** The first part landed on 16
September 2026 (TORCH's call and THE MAGNET's, which hang off the siren and
drop with it); the second is the entry above. What is left is not a readout in
a header at all, and three different things were in one list:

**A label glued to a body that happens to stand high.** THE BEATBOX's count at
192,87, THE VEER's at 191,20, THE JAM's `LURE` at 293,25. `drawCount` in
`beatbox-marks.ts` takes the mark's own centre, so a header clearance would
tear each label off the thing it names.

**A grid axis.** THE FLEET's chart — the row number at 381,86 and the square
name at 347,83 — and THE WISP's coordinate grid, the row number at 3,83 and
the whole letter row A..K at y 98, on three of its four pages.
`drawFleetChart` already has a `leftCovered` that moves the numbers to the
*other* edge; that was an answer while the plate was a corner and is not one
now the band is full-width. An axis cannot drop without its grid.

**A whole screen used as a page's subject.** BULB QUEEN, THE COIL, THE LURE
and TORCH each have a page whose picture is the lost screen, which stamps WAVE
LOST at 16% of the play height — 114,73.

- **Answered:** 2026-09-17, by the owner — **A label on a body stays as it is**, glued to the thing it names; **a chart drops as a block** the way THE PULSE moves its header (`headerLift`); **the lost screen is drawn shrunk inside the page.**

`packages/render/test/guide-plate-room.test.ts` was narrowed to the round's
name and the run's line on the day this was found, and its header carries the
same list — widen it back as each site is fixed.

## THE THROAT does not haul a pod, and step 10 of its design wants it to

- **Found:** 2026-09-16, claude/neon-spore-boss-design-26ee5e
- **Where:** local
- **Files:** `packages/sim/src/throat-pull.ts`, `packages/sim/src/throat-step.ts`, `packages/sim/src/pods.ts`, `packages/sim/src/span.ts`, `packages/sim/test/throat.test.ts`, `docs/spec/bosses.md`

The pull and the swallow walk `world.creatures` only. Pods live in their own
array with their own step (`advancePods`), so a pod loose in the mouth's column
falls past a throat that should be fighting player 1's maw for it — which is
the design's step 10, the one beat in the fight that needs both seats at once
(`docs/spec/bosses-choreographed.md` §1, and `docs/spec/bosses.md` §11.18 lists
it as an omission rather than a cut).

What to do: give `throatHolds`/`throatLift`/the swallow a pod-shaped sibling
rather than a second copy of the column test — the two callers already share
one predicate and that is the property to keep. A swallowed pod re-tightens a
ring like any other body, and the maw taking it first is the answer.

The choice the work picks between: a second pair of functions over `Pod`, or a
narrow common shape (`{ col, row, span }`) both arrays are read through. The
second is smaller and is how `occupiesLane` is already written; the first is
what every other boss that touches pods has done.

## THE HUSK is built and still on the NOT BUILT YET sheet

- **Found:** 2026-09-17, claude/creature-bite-collision-f96307
- **Taken:** 2026-09-17, claude/queue-the-husk-is-built-and-still-on-the-not-built-yet
- **Where:** local
- **Files:** `docs/spec/ideas.md`, `docs/asset-catalogue.md`, `tools/shape-sheet/src/drafts/creatures.ts`, `tools/shape-sheet/src/scenes/creatures.ts`, `tools/director/src/backlog.ts`
- **Answered:** 2026-09-17, by the owner — **They move to VERSUS**, as a second look for the shipped husk mark — the sagging dead-core body offered against the flag on the pod. Then the bullet comes off NOT BUILT YET and the catalogue's count is fixed.

The husk ships: the flag, the wave, the seat-split mark, the deflation, the two
sounds. Its bullet is still under ◇ NOT BUILT YET in `docs/spec/ideas.md`, and
that entry describes something else — a fourth `PodKind` whose tell is a dead
core and a sagging body. What shipped is a flag on a pod with a white frame on
player 2's screen alone (`packages/render/src/husk-mark.ts`).

Taking the bullet out was tried in the lane that built it and put back:
`concept-places.test.ts` then reports two orphans, a shape draft and a scene
both suggesting "Husk" with nothing in the spec left to name. Those are HUSK 1
and HUSK 2 in `tools/shape-sheet/src/drafts/creatures.ts` — the same capsule
with its mass moved down, at two strengths — and deleting a look draft nobody
has voted on is the thing `docs/looks.md` is for refusing. Hence the ask.

What to do once it is answered: take the bullet out, repoint or retire the two
drafts and the scene, fix the `**Status:` draft count and the HUSK paragraphs in
`docs/asset-catalogue.md`, and check `tools/director/src/backlog.ts` no longer
shows it. `bun run check` proves all of it.

## Four drawn bosses still owe their rehearsal film

- **Found:** 2026-09-17, claude/boss-implementation-e3cfff
- **Where:** local
- **Files:** `packages/content/test/scenes-prose.test.ts`, `packages/content/src/scenes.ts`, `packages/content/src/scene-script.ts`, `packages/content/src/scenes/`, `docs/spec/briefings.md`

`STILL_PROSE` carries THE DIASTOLE, THE BATON, THE THROAT and THE UNDERTOW
with a comment each saying the film is owed by the lane that draws the boss —
and all four looks have landed (`bosses.md` §11.17–§11.20) without one. The
excuse each comment gives is gone: the chambers, the arm, the gullet and the
floor are on the field, so there is something to choreograph against.

What to do: one film per boss under `scenes/`, written the way THE HUSK's and
the other filmed bosses' were (a thumb on a named control, one seat at a time,
`controlPress`), and the four names off `STILL_PROSE` as each lands — the test
fails the other way for a film left on the list. THE UNDERTOW's is the plate
bowing on player 1's screen alone (`showsUndertowBow`), the maw opened under
the standing lobe on his, and the plate stood on a breach on hers; the seat
split means it is shot twice and read as one lesson, which is THE HUSK's
comment already. Four separate lanes, one boss each, in the order the sections
are numbered.

## THE ORRERY makes no sound

- **Found:** 2026-09-17, claude/boss-orrery
- **Files:** packages/sim/src/orrery.ts, packages/sim/src/orrery-step.ts, packages/audio/src/bind-choreographed.ts, tools/director/src/sound-link-none.ts, docs/spec/bosses.md

The simulation shipped without a single event of its own, deliberately: every
edge a mixer would want is already a field on the state — `brokeBeat` when a
ring comes off, `spatBeat` when the core fires, `phaseBeat` when it goes out —
and THE UNDERTOW's own `events-undertow.ts` says an event is for an edge that
is *not* in the world a frame later. So nothing needed adding to find them.
But nothing binds them either, and a ring of organs breaking in silence is the
one part of this fight the pair cannot hear coming.

What to do: decide whether the three moments are read off the state in
`audio/` the way `bind-choreographed.ts` reads a beat, or whether they earn an
`OrreryEvent` arm after all — and if they do, say in that file why this boss
needed one where the state was enough for the picture. Three sounds: a ring
parting at its gap, the core spitting, the core going out from the centre
outward. `sound-link-none.ts` is where a moment with no card on the sheet is
named instead.

## THE CURTAIN is on the field and drawn nowhere

- **Found:** 2026-09-17, claude/render-tests-draw-real-pixels
- **Files:** `packages/render/test/pixel-frame.test.ts`, `packages/content/src/living-look.ts`, `docs/spec/bosses.md`

The pixel test's first run against the trunk, the morning THE CURTAIN's
simulation landed: wave 74's peak frame has a `curtain` body on the field and
the picture with it is the picture without it, on both seats. `living-look.ts`
answers `null` for the kind and names a `curtain-draw.ts` that is not written —
the look is the lane the simulation's commit promised next, and this is the
one place the gap is visible without a person looking. Until it is drawn the
kind sits in `LOOK_PENDING` in the test, which goes red the moment the look
lands, so that lane deletes the line. A look with no shipped alternative, the
second exemption, so it lands on the field.

## The imports test spawns biome under bun's five-second default

- **Found:** 2026-09-17, claude/render-tests-draw-real-pixels
- **Taken:** 2026-09-17, claude/queue-the-imports-test-spawns-biome-under-buns-five-se
- **Files:** `tools/imports/test/imports.test.ts`

"a file with a move's leftovers in it" spawns `bunx biome lint` once per case
and took 5059 ms on a busy machine under `bun run land`, going red for nothing
in the code; the landing was rerun and passed. A case that runs a child
process needs its own cap — `setDefaultTimeout` at the top of the file, the
way the frame tests take `FRAME_TIMEOUT_MS` — or one spawn for the file with
the cases reading its output.
