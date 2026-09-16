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
say `ASKS THE OWNER`. Write the question so it can be answered in a sentence,
and let the body carry the options it picks between:

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
   - **Asks:** Does CONTINUE leave the PLAY page, the room screen taking the parted run and the chip taking the way back, or stay for those two?
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

## The Husk, his way: a fake pod player 2 sees through, deflating when refused

- **Found:** 2026-09-15, claude/bosses-splice-wave-088f34
- **Files:** `packages/sim/src/pods.ts`, `packages/sim/src/pod-types.ts`, `packages/sim/src/wave-fail.ts`, `packages/sim/src/bullet-hit-lure.ts`, `packages/content/src/wave-types.ts`, `packages/render/src/pods.ts`, `packages/render/test/frame.test.ts`, `packages/audio/src/catalogue.ts`, `tools/director/src/brush-cards.ts`, `docs/spec/ideas.md`

The owner redesigned the *Husk* (`ideas.md`, Creatures) on 15 September
2026: it is a lure among pods. A third `PodKind` in `pod-types.ts` that
**hangs at a column and row like a pod and looks like one** — purge or ward
on player 1's screen, taut, its core beating. **Player 2 (the navigator)
sees that it is a fake** — the lie is drawn on that seat only, the way
`bullet-hit-lure.ts` gives the lure's truth to one seat — and has to stop
it being taken: say so before it is shot loose, or have the maw kept shut
when it arrives.

- **Freed like a pod** — a shot knocks it loose and it sinks to the maw.
- **Sucked in, the wave is lost**, as it is for a lure that is hit.
- **Refused — the maw shut when it reaches the ship — it goes the way of a
  balloon let go**: it does not break on the skin, it shrinks and shrinks,
  flying about the hull as the air leaves it, with a funny sound in the
  catalogue (`packages/audio/src/catalogue.ts`), and is gone. No damage.
- Never shot loose, it hangs; it never holds the wave open (`beat.ts`
  counts real pods only) and never blocks its end.

The deflation is the destruction skill's business (`.claude/skills/destruction`)
and the balloon's own fall is the nearest shipped motion — reuse it. Authored
on the wave's `pods` list (`wave-types.ts` `PodEntry`) with the kind it
pretends to be, and a brush in the director. Drawn again in `frame.test.ts`
on both seats and mid-deflation.

Prove it with `bun run check`, a replay test, and the wave watched at tempo
through a husk sucked and a husk refused.

## A rehearsal cannot show a finger on a bare tile, so THE MINE has no film

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `packages/content/src/scene-script.ts`, `packages/content/src/scene-types.ts`, `packages/content/src/scenes/`, `packages/render/src/guide-hand.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

Every act a film can carry is a thumb on something the panel draws: a control
press (`controlPress`), a hold, a drag, a turn, a shake, or `tap` — which is
THE BEATBOX's and is fixed to the navigator and named by column alone. There
is no act that says **a finger on a square of the field**, which is the whole
of THE MINE's answer (`packages/sim/src/mine.ts`, the `tapTile` command), so
that wave shipped with the three strings and the two circles and no rehearsal
at all. It is the only guided wave in the game that cannot have one rather
than merely not having one yet, and `scenes-prose.test.ts` and §3.2 of
`briefings.md` both say so in those words today.

What it needs is one more act shape: a **tile** act carrying `col`, `row` and
the **seat** — unlike `tap`, whose seat is fixed, because which seat is blind
is the wave's on this creature (`SpawnEntry.sees`) — producing a `tapTile`
command; and the ghost hand drawn at the tile's centre rather than at a
control's, which is the part `guide-hand.ts` has no case for. The film itself
is then the ordinary five acts: the body standing on one screen, the other
screen empty, the count coming down, the hand landing on the square, the
contour closing.

Worth doing only if the creature survives being played. Do it with the wave
in front of you, not before. When it lands, take THE MINE out of
`STILL_PROSE`, off §3.2's list and out of the paragraph under it — all three
are named in the test's own failure message.

## ship-notes.ts is one line under its limit, and it grows with every creature

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `tools/director/src/ship-notes.ts`, `tools/director/src/ship-groups.ts`, `tools/director/src/ship-fields.ts`

THE MOULT's note took this file to **249 lines of its 250**, so the next
creature that wants a paragraph in the director's ship panel fails
`packages/sim/test/limits.test.ts` before it has said anything. It is legal
today and it has no headroom at all, which is the one state worth writing down:
whoever adds the next note will otherwise spend the first half of their lane
doing this refactor with an unrelated diff already open.

The seam the file already has is its own `GROUP_NOTE` spread: `HIDDEN_NOTES`
and `MOULT_NOTE` are each a const built somewhere and folded in at the bottom,
so the cut is to take a group of notes out whole rather than to split the file
down the middle. Nothing here is decided by the shape of the code — every note
is a paragraph about one group of fields — so the only question is which
grouping reads best next door, and any of them is an improvement on none.

Do it with the next creature that needs a note, not before: a refactor of prose
with no new prose to place is a diff nobody can review against anything.

## Unverified at ce8a2324: THE SCOUT's arenas were never watched at tempo — the fl…

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `apps/game/src/rounds.ts`, `apps/game/src/scout.ts`, `docs/INDEX.md`, `docs/spec/briefings.md`, `docs/spec/interludes.md`, `docs/time-log.md`, `packages/content/src/control-aim.ts`, `packages/content/src/control-command.ts`

*THE SCOUT: the ship puts a little one out, and only one of you can see where it is going* landed from a session that could not look at it. The commit touched 49 more files. What went unchecked:

- THE SCOUT's arenas were never watched at tempo — the flight's feel, its beat counts and the hazard timings are arithmetic and tests only

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## A filmed wave's prose is drawn to nobody

- **Found:** 2026-09-16, claude/task-queue-work-5f529c
- **Files:** `packages/content/src/wave-types.ts`, `packages/render/src/briefing.ts`, `packages/render/src/guide-prose.ts`, `packages/render/test/briefing.test.ts`, `tools/director/src/guide-fields.ts`
- **Asks:** A wave with a rehearsal never shows its `both`/`p1`/`p2` — should those three come off the 59 waves that have one, be drawn as a page in front of the film, or stay as the director's own reference and say so?

`briefing.ts` draws the film whenever `scene.active`, and a stepped guide's
pages are the film's steps and then the gate (`guide-steps.ts` `guidePages`), so
`drawProsePage` is reached only by a guide with no film. Six waves have none;
**59 have a film and prose both**, and on those the prose is written, held to
its 220-character cap by `briefing.test.ts`, shown in the director's panel and
seen by no player.

It was found by the lane that rewrote THE BALLOON's three stale sentences: the
queue entry called that screen *the one screen in the game whose whole job is
telling two people what a body does*, and on that wave it is not a screen at
all. The words were wrong and are right now, which is worth having either way —
what is undecided is whether 59 waves should go on carrying them.

The three answers cost different things. Taking them off is the smallest tree
and loses the plainest statement of what each wave is, which the director reads
and a film cannot be searched for. Drawing them in front of the film adds a page
to every rehearsal, which is the owner's *I don't want to show old cards* said
again unless it is his own idea. Keeping them as reference costs nothing and
wants one sentence in `wave-types.ts` saying who the audience is, so the next
lane does not spend a morning on prose that reaches nobody.

## The balloon's pop now falls harder than a struck body's break

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/src/balloon-burst.ts`,
  `packages/render/src/break-look.ts`,
  `packages/render/test/balloon-burst.test.ts`
- **Asks:** Should a popped balloon's shreds drift like a struck body's pieces now do, or keep falling onto the hull?

Taking `creature:debris` / `drift` dropped `BREAK_LOOK.gravityTiles` from 14 to
1, so a struck body's pieces hang in the lane and fade there. `BALLOON_SKIN`
was not part of that slot and still pulls at 11 with `skid: 0.5`, so the skin
of a balloon lands on the plating and slides along it. The two have swapped
places: the light thing falls and the heavy thing floats, and the test that
held the old order — a pop is "bigger, faster and lighter" than a break — lost
its third clause rather than gaining a reversed one, because nobody chose the
new order.

The answer picks between two, and both are one field:

- **Follow the break.** `BALLOON_SKIN.gravityTiles` down to about 1 and `skid`
  to 0, so a pop opens and fades in the air like everything else, and nothing
  in the game settles on the hull any more. Restores the old "and lighter"
  clause as a real claim, since the pop keeps the higher speed and the larger
  count.
- **Keep the fall, and say why.** A skin is a thing with weight and a body
  coming apart is not, so the pop is deliberately the heavier picture. Then the
  clause stays gone and `balloon-burst.ts` grows a paragraph saying the
  inversion is on purpose.

Whichever it is, it is a look and goes to the owner rather than onto the field
unattended.

## The lost screen's plates open, and their own sentence says they close

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/src/lost-shutters.ts`
- **Asks:** Should the lost screen's plates close over the field as their description says, or keep drawing back off it the way the picture you picked actually does?

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

## The intro's two people do not read as people

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Where:** local
- **Files:** `packages/render/src/intro-player.ts`, `packages/render/src/intro-pair.ts`, `packages/render/src/intro-share.ts`, `packages/render/src/intro-scene.ts`, `packages/render/src/intro-parts.ts`, `packages/render/src/intro-shout.ts`, `packages/content/src/intro.ts`, `packages/render/test/intro.test.ts`

The owner, 16 September 2026, in his own words: *the intro video is still bad.
The human heads should be recognizable as it. Maybe only show the mouth and
ear, but they must look like real identifiable as those. The text must be very
visible and readable. To show what is on the screen does not matter, but it
should show in small the two mobile phones what the mouth and ears, the two
players refer to and then act accordingly. They first look, then they call,
then the other ones listen and performs what he was told to do so.*

**It is a look he asked for by name** — the first exemption under *A look is
offered, never replaced* — so it lands on the field rather than going to
VERSUS, and the commit says which exemption it used.

**Four things are asked for, and the first one reverses an argument the code
makes out loud.** `intro-player.ts` draws each person as *a lobed blob with an
eye and a mouth*, and its header argues for exactly that: the game is made of
blobs, a stick figure or a photograph would be the one thing on the first
screen that came from somewhere else, and the intro has no business deciding
what these two people look like. That argument is now overruled by the person
it was written for, and a session that re-derives it will ship the thing he has
called bad twice. **What he is asking for is not a face**: a mouth and an ear,
drawn so that a stranger glancing at a phone in a shop says *that is a mouth,
that is an ear* — recognisable as those two things and nothing else. The seat
colours stay; they are how the pair is named (`seat-skin.ts`).

**The phones come back, small, and the argument for taking them out is not
contradicted.** They were removed on 15 September on his instruction — *how the
game looks or what is shown on the mobile is not relevant* — and
`intro-pair.ts` records it. He is narrowing that rather than reversing it: the
phone returns as *the thing a mouth and an ear are pointed at*, small, with
whatever is on its screen still beside the point. So: two small phones, one per
person, and the mouth and the ear placed against them so a viewer can see which
one is being talked to and which one is being read.

**The text must be very visible and readable.** That is the whole note, and it
is worth measuring rather than judging: the headline, the tag and the sentences
(`INTRO_TITLE`, `INTRO_TAG`, `INTRO_LINES` in `content/src/intro.ts`) against a
360 px phone, which is the width the tagline rule already uses
(`briefing.test.ts`). If a line does not hold at that width it is the line that
is wrong, not the reader.

**And the choreography is four moments, in this order**, which the scene half
has today and does not read as: *they first look, then they call, then the
other one listens and performs what he was told*. `INTRO_BEATS` already carries
a shout, a crossing and an answer (`INTRO_CROSS`, `INTRO_ANSWER`); what is
missing is the **look** in front of it — a beat where the caller is plainly
reading their own screen before they say anything. Without it the shout has no
cause, and the pair the scene is selling looks like two people reciting rather
than one telling the other something they alone can see.

**Why `Where: local`.** This is a film, and the only way to know whether a
mouth reads as a mouth or a line reads at all is to watch it at tempo on a
screen. A cloud session can change the drawing and cannot tell whether it
worked, which is how it came to be bad twice.

## The director cannot see or choose a wave's rehearsal scene

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Taken:** 2026-09-16, claude/queue-the-director-cannot-see-or-choose-a-waves-rehear
- **Files:** `tools/director/src/guide-fields.ts`, `packages/content/src/waves/act-1.ts`, `packages/content/src/scenes/first-step.ts`

`bindGuideFields` builds three textareas — both, p1, p2 — and carries `scene`
through untouched: *there is no control for it yet, and the page that would let
somebody do that is not built*. So for the sixty-odd waves that carry a scene,
the panel shows prose the pair never reads and says nothing at all about the
four pages they do.

Wave 1 is the clearest case. FIRST STEP authors three paragraphs **and**
`scene: "firstStep"`, so what opens is a four-page film — ENEMY, PLAYER 1 MOVES
CANNON, PLAYER 2 FIRES RED, A MISS LOSES THE WAVE — and the three paragraphs
are dead text.

The cheapest honest fix is a read-only line: when a wave names a scene, say
which one and list its step captions under the textareas, and grey the
textareas out. A picker over the scene catalogue is the larger version and
wants the owner's word on whether a scene should be choosable at all.

## The director's palette table is at its ceiling, and the next brush cannot go in

- **Found:** 2026-09-16, claude/task-queue-work-5f529c
- **Files:** `tools/director/src/brushes.ts`, `tools/director/src/brush-groups.ts`

THE FLIP's brush went in at 251 lines and had to be paid for by cutting three
lines of its own argument back to two. The file is two things: the *lists* —
`BRUSHES`, `FAULT_BRUSHES`, `ROCK_BRUSHES`, the kinds and the types that read
off them — and the *table*, one row per brush with a label, a stroke, its
subjects and its note, which is what grows every time the game gets a creature
or a fault. Nothing about the next brush is unusual; there is simply no room
for one, and the argument a row carries is the first thing a lane will shorten.

The cut is the same one `fault-beam-ends.ts` took out of `fault-emitter.ts`:
the rows into `brush-rows.ts`, re-exported from here so no caller moves. Prove
it with `bun test tools/director` and `bun run check`.

## The guide's band covers a round's readouts on eleven rehearsals

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/src/fleet-chart.ts`, `packages/render/src/splice-draw.ts`, `packages/render/src/coord-grid.ts`, `packages/render/src/magnet-look.ts`, `packages/render/src/torch.ts`, `packages/render/src/lost-shutters.ts`, `packages/render/src/round-header.ts`

`round-header.ts` exists because a rehearsal's plate sat on a round's name and
neither was legible. `headerTop` fixed the **name**, and nothing else ever
called it. Every other readout a round writes in the top strip has been under
the band since the band went full-width on 14 September 2026, and TIDE's band
is 104 deep where the old one stopped at 77, so two more joined them.

Measured on 16 September 2026 by drawing every page of every rehearsal that
carries a film, at 390 × 844, both seats, and taking every word whose box
crosses `GUIDE_LOOK.bandFoot`:

- THE FLEET's chart axis — the row number at 381,86 and the square name at
  347,83. `drawFleetChart`'s `leftCovered` moves the numbers to *the other
  edge*, which was an answer while the plate was a corner and is not one now.
- THE WISP's coordinate grid (`coord-grid.ts`) — the row number at 3,83 and
  the whole letter row A..K at y 98, on three of its four pages.
- THE SPLICE's clock — `1 OF 2 · 26` at 159,94, placed off `spliceTopY`.
- THE MAGNET's target line at 206,72, and TORCH's at 170,58.
- THE BEATBOX's count at 192,87 and THE VEER's at 191,20.
- THE JAM's `LURE` at 293,25.
- BULB QUEEN, THE COIL, THE LURE and TORCH each have a page whose picture is
  the **lost screen**, which stamps WAVE LOST at 16% of the play height — 114,73.

The shape of the fix is `headerTop` at each site, which needs `ViewState`
carried to a few functions that take a `Layout` and a state today. The lost
screen is the odd one: it is a whole screen drawn as a page's subject, so
either it takes a clearance like the rest or the page draws it shrunk.

`packages/render/test/guide-plate-room.test.ts` was narrowed to the round's
name and the run's line on the day this was found, and its header carries the
same list — widen it back as each site is fixed.

## `canvas-stub` records a text box before the transform, and one test read it

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `packages/render/test/canvas-stub.ts`

Fixed in the same commit, and here because the fix is one that wants looking
at rather than one that wants doing. `StubContext.texts` promised that two
boxes overlapping in the log overlap on the phone, and recorded the
coordinates `fillText` was handed — so every word drawn inside a `translate`
carried a box hundreds of pixels from where the eye sees it. A guide draws its
page inside one; so does THE MIRROR's count-in.

The stub now carries the matrix and puts each box through it. What it does not
do is rotate the box: a rotated word keeps an axis-aligned box at the scaled
size, because nothing in `render/` writes rotated type and a box that lied
about its angle would be a second wrong answer. If something ever does, this
is where it breaks.

The four other files reading `texts` — `cairn-frame`, `guide-frame`,
`guide-handover`, `harpoon-frame` — all still pass, which is worth knowing:
their subjects are drawn untransformed.

## The input delay is counted in ticks, and a slow window makes a tick longer

- **Found:** 2026-09-16, claude/neon-spore-boss-design-26ee5e
- **Where:** local
- **Files:** `packages/net/src/delay.ts`, `packages/net/src/lockstep.ts`, `packages/net/src/lockstep-options.ts`, `apps/game/src/input-buffer.ts`, `apps/game/src/frame.ts`, `apps/game/src/loop.ts`, `packages/sim/src/slow.ts`, `docs/decisions.md`

THE SLOW landed on 16 September 2026 and `docs/decisions.md` #33 names this as
its one unpaid cost. A command is scheduled a fixed number of **ticks** ahead,
which was a fixed number of milliseconds for as long as a tick was worth
`1000 / tickHz` of them. Inside a slow window a tick is worth three times that
(`slowRateMilli: 333`), so the same delay in ticks is three times as long in
the hand: a thumb pressed during the burst is answered a third of a second
later than it would be outside it.

Nothing shipped can feel it yet, and that is why it is here rather than fixed
in that lane: THE DIASTOLE opens windows of two and four beats, and neither is
a moment anyone is meant to be pressing anything during — the burst is the
payoff and the coincidence is already past by the time the window opens. The
first concept on `docs/spec/bosses-choreographed.md` whose window is a *moment*
inside a slow span breaks, and the page says so under [who is building
what](spec/bosses-choreographed.md).

**What to do, and the choice the two options are between.** Either the
scheduler's delay becomes a number of *milliseconds* converted to ticks at
schedule time using the rate in force — which keeps the hand honest and makes
the tick count differ between a slowed span and an ordinary one, so both
devices must agree about the rate before they agree about the tick (they do:
`slowFromBeat`/`slowToBeat` are hashed) — or the delay stays in ticks and the
slow rate is applied to the *presentation* only, with the simulation's clock
left at wall speed, which means a slow window no longer slows the beat and is
therefore not what the owner asked for. The first is the real answer; the
second is written down so the next reader does not rediscover it as an option.

## Three director comments name a `guide-page.ts` the tree does not have

- **Found:** 2026-09-16, claude/creature-bite-collision-f96307
- **Files:** `tools/director/src/versus-tab.ts`, `tools/director/src/backlog-tabs.ts`, `tools/director/src/backlog-page.ts`

The GUIDES room came off the sheets on 14 September 2026 and `guide-page.ts`
went with it, but three comments still describe the tool as if it were there.
`versus-tab.ts` tells a reader that VERSUS is *mounted the way GUIDES is
(`guide-page.ts`)* — a pattern to copy, pointing at a file that cannot be
opened. `backlog-tabs.ts` says GUIDES moved to DOCUMENTATION *where the list
of the guides it draws already was*, which is two rooms neither of which
exists. And `backlog-page.ts` lists the lazily drawn tabs as *SHAPES, GUIDES
and OTHER GRAPHICS*, which disagrees with the file next to it as well as with
the sheet.

This is the same drift as the entry it was found beside — two documents
describing a GUIDES sheet, fixed 16 September — and it is separate because
those were documents a reader reads and these are comments a *writer* copies
from. The mounting pattern `versus-tab.ts` points at is the one the next tab
will be built the same way as.

Rewrite all three to say what the sheets hold today: DOCUMENTATION's four
rooms (`documentation-rooms.ts`), NOT BUILT YET's own tabs, and whichever of
them are drawn lazily. `bun run check` proves nothing here; the proof is that
every file and room a comment names can be opened.
