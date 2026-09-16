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

## A hit cannot take a bite out of a body: no seam carries damage into a contour

- **Found:** 2026-09-16, claude/queue-destruction-and-damage-the-three-unbuilt-pieces
- **Files:** `packages/render/src/meteor.ts`, `packages/render/src/meteor-look.ts`, `packages/render/src/meteor-looks.ts`, `packages/render/src/meteor-blaze.ts`, `packages/render/src/meteor-comet.ts`, `packages/render/src/meteor-smoulder.ts`, `packages/content/src/body-path.ts`, `packages/render/src/craters.ts`, `tools/versus/candidates/`, `docs/spec/systems.md`

The third of *Destruction and damage*'s unbuilt pieces — **a hit cuts a real
piece out of the creature; the body keeps falling with the notch missing and
the broken edge glowing briefly** — could not be offered as a VERSUS candidate
with the other two, because there is nothing to patch. A candidate is a field
on a record the drawing code already reads (`docs/versus.md`), and no record
anywhere lets damage reach the **outline** a body is drawn with:

- `livingPath`/`livingPoints` build a creature's contour from its silhouette
  and the beat, and take no argument about what has hit it.
- The one body that takes damage and lives is the rock, and its craters are
  painted **on its face**: `drawRockBody` calls `look.pit(ctx, hx, hy, pr, dx,
  dy)` with the pit already positioned and sized, so a `MeteorLook.pit` is
  handed neither the rock's radius `r` nor `time`. It cannot put a bite at the
  rim rather than in the middle, and it cannot make an edge glow *briefly*.
- `BLAZE_LOOK`, `COMET_LOOK` and `SMOULDER_LOOK` are not exported at all, so a
  candidate today can only reach the blaze, through `METEOR_LOOK`.

So the work is a seam first and a candidate second: thread `r` and `time`
through `MeteorLook.pit` from `drawRockBody` into `STONE_LOOK.pit`, `hotPit`,
`struck`, `redPit` and `packages/render/src/volley-pitted.ts` with not one
pixel moved, export the three looks, and then `creature:bite` can argue for
a notch taken out of the silhouette instead of a crater drawn on it. Whether
the notch should reach `livingPath` too — so that a *creature* can also be
bitten, not only a rock — is the size question to settle first; the rock alone
is much the smaller lane and is the only body that currently survives a hit.

`shatter.ts`'s `reachAt` is the contour ray this would cut against, and
`splinter.ts` is the worked example of using it from outside.

## The Mine is an enemy, with its seeing seat set on the brush

- **Found:** 2026-09-15, claude/bosses-splice-wave-088f34
- **Files:** `packages/sim/src/wisp.ts`, `packages/sim/src/beatbox.ts`, `packages/sim/src/command-types.ts`, `packages/sim/src/config.ts`, `packages/content/src/creatures.ts`, `packages/render/src/coord-grid.ts`, `packages/render/test/frame.test.ts`, `tools/director/src/brush-cards.ts`, `tools/shape-sheet/src/drafts/mine.ts`, `docs/spec/ideas.md`, `docs/spec/bestiary.md`

The Mine — `ideas.md`, Creatures, designed 12 September 2026 — becomes a
creature, asked for by the owner on 15 September. `.claude/skills/new-creature`
is the procedure. The design there stands: a body that appears on a tile
and never moves; one seat sees it and the other, looking at an empty tile,
taps it with the field thumb (`command-types.ts` `tap`, the one THE BEATBOX
uses); a tap on one of the four neighbouring tiles is a hull hit in its
colour; a tap farther away takes a beat off the fuse; the fuse is six beats
(a `SimConfig` field), shown on both screens, and going off is a hull hit
and the body gone. Rows two to twelve, never the hull row, never beside
another mine.

Decided on 15 September through the question tool:

- **The exact tap kills it outright**, with a kill look of its own.
- **No marks around it** — the seeing seat infers the four tiles from the
  body; the shape (CALTROP's four points, `drafts/mine.ts`) says it. CALTROP
  was lent to THE LEECH (`silhouettes-cling.ts`) and that creature is only a
  pencil now, so the shape is free; check before taking it.
- **Each mine runs its own fuse** from the beat it appeared.
- **Which seat sees it is a brush setting**, not a rule: a field on the
  entry the director's brush card edits (`brush-cards.ts`), so a wave can
  give the sight to player 1 and the blind tap to player 2 or the other way
  round. Today's wisp fixes that in code (`wisp.ts`); the mine must not.
- **The lettered grid comes on for both seats** while a mine is on the field,
  exactly as `coord-grid.ts` does for a wisp.

Never on a wave with THE BEATBOX — a director guard, since both read the
same tap. Drawn again in `frame.test.ts` on both seats. Its row goes into
`bestiary.md` and its entry leaves `ideas.md` when it lands.

Prove it with `bun run check`, a replay test in the creature's own file, and
the wave watched at tempo through a right tap, a neighbour tap and a fuse
running out.

## Moulting, his way: meteor and pod by turns, and player 2 sees what is next

- **Found:** 2026-09-15, claude/bosses-splice-wave-088f34
- **Files:** `packages/sim/src/pods.ts`, `packages/sim/src/pod-types.ts`, `packages/sim/src/wave-fail.ts`, `packages/sim/src/bullet-hit.ts`, `packages/sim/src/config.ts`, `packages/content/src/creatures.ts`, `packages/render/src/pods.ts`, `packages/render/src/craters.ts`, `packages/render/test/frame.test.ts`, `tools/director/src/brush-cards.ts`, `docs/spec/ideas.md`, `docs/spec/bestiary.md`

The owner redesigned *Moulting* (`ideas.md`, Creatures) on 15 September 2026
and asked for it built this way, which replaces the shell-and-soft-body
design there. A falling body that **changes form every five beats** (a
`SimConfig` field), alternating between **the meteor** and **a pod** — purge
or ward, **authored per wave** like every pod, never drawn at random.
**Both seats see its current form; player 2 (the navigator) also sees the
next one**, drawn as a small ghost of the coming form beside the body. The
call is the timing: "pod in two beats — open".

**Nothing kills it.** In meteor form a shot craters it as `bullet-hit.ts`
craters the meteor (`holes`, `maxHoles`); in pod form a shot is wasted. What
it *is* on the beat it reaches the ship decides: as a meteor it is shielded
or it is a hull hit, as the meteor is; as a pod it must be sucked into the
maw, and one that is not is a hit **and the wave is lost** — the shipped pod
rule in `wave-fail.ts`, nothing new. It sinks the last stretch toward the
cannon's column the way a freed pod does, so the catch is the same catch.

Build it through `.claude/skills/new-creature` on the shipped movement and
resolution paths — the meteor's fall and craters, the pod's catch — with no
physics of its own. The two looks are the two the game already draws, and
the moult between them is a morph of the two contours, blended vertex by
vertex, as the Bulb Queen's mark does. A brush in the director with the pod
kind on it. Drawn again in `frame.test.ts` on both seats, mid-moult.

Prove it with `bun run check`, a replay test, and the wave watched at tempo
through a shielded meteor, a caught pod and a missed one.

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

## A contents menu on the long director pages, each heading a jump

- **Found:** 2026-09-15, claude/bosses-splice-wave-088f34
- **Files:** `tools/director/index.html`, `tools/director/src/tabs.ts`, `tools/director/src/backlog-page.ts`, `tools/director/src/whole-doc.ts`, `tools/director/src/documentation-rooms.ts`

The owner, 15 September 2026: on the bigger pages — NOT BUILT YET and
DOCUMENTATION are the two he named — a **contents menu** that lists what
the page contains, and a click on an item jumps to it on the page. Built
from the headings the page already draws (each `BacklogGroup`'s title, each
`##` of a document under DOCUMENTATION) rather than a second list kept by
hand, so it cannot go stale; one component, mounted on any sheet page past a
screen or two tall, in the shipped panel look, wired the way `tabs.ts` wires
a tab. Plain words on it, and it says where on the page the item is.

Prove it with `bun run check` and one PNG of the menu open on MECHANICS.

## THE ECHO, his way: the wave sent again unseen, and a count on the boss

- **Found:** 2026-09-16, claude/bulb-queen-crane
- **Files:** `packages/sim/src/boss-entries.ts`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-state.ts`, `packages/sim/src/boss.ts`, `packages/sim/src/hash-boss.ts`, `packages/sim/src/config-boss.ts`, `packages/sim/src/spawn.ts`, `packages/sim/src/creature-types.ts`, `packages/sim/src/boss-surface.ts`, `packages/content/src/queue-boss.ts`, `packages/content/src/mechanics-bosses.ts`, `packages/render/src/boss-draw.ts`, `packages/render/src/creature-body.ts`, `packages/render/src/body-hit.ts`, `packages/render/src/radar-blip.ts`, `packages/render/test/frame.test.ts`, `tools/director/src/boss.ts`, `tools/shape-sheet/src/drafts/creatures.ts`, `docs/spec/bosses.md`, `docs/spec/ideas.md`, `docs/asset-catalogue.md`

The owner took the *Reverse wave* idea (`ideas.md`, Mechanics) on 16 September
2026 and asked for it built **his way**, which replaces the from-below design
written there. It is a **boss wave**, and the boss is a memory test.

**The wave falls as usual**, the arrivals its author wrote, both seats seeing
everything. Then, at a **defined point in wave time** (a beat authored on the
entry, like the queen's cycle), **the arrivals since the wave's start — or
since the last echo ended — are sent again**: the same kinds, the same order,
the same columns and colours, at the same spacing, offset to now. **Every one
of them is invisible, on both screens.** The pair has to remember what came,
and defend the columns from memory. The wave's own arrivals pause while the
echo plays and take up again after it, so a wave alternates seen stretch,
unseen echo, seen stretch, unseen echo, until the queue is spent; the last
echo repeats the last stretch. An echoed body that reaches the hull unshielded
is a hit like any other (`hull-damage.ts`, `wave-fail.ts`), nothing new.

**A body is seen at the moment it is beaten, and only then.** A correct shot,
a deflection, a destruction — whichever the kind's own rule is — plays the
kind's own hit look (`body-hit.ts`, `hitFor`) and the shield's flash exactly
where the invisible body was, so the pair learns it was right by seeing the
kill and never by seeing the body. THE GHOST's `ghostRelease` is the shipped
precedent for a body shown to a seat only as it dies.

**The boss is at the top middle**, where the queen stands, and it does two
things: it **shows the number of bodies still to come** in the running echo,
and it **moves each time a new echoed body enters the field** — a pulse, a
twitch, a swallow — so the pair knows *something* has arrived and *how many*
are left, and nothing about where. The radar strip stays blank for an echoed
body (`radar-blip.ts`): a blip would give the column away and there would be
nothing to remember. The count is read as a shape on the body, not as a digit
(`beatbox-count.ts` is the precedent).

Build it as a boss that does not fill the wave, like THE VANE and THE WELL
(`bossFillsWave` false): a `EchoEntry` beside `WellEntry` with the beat the
first echo starts on, `"echo"` **appended** to `BOSS_KINDS`, an `EchoState`
counting the stretch's start, the echo's cursor and the bodies left, hashed
in `hash-boss.ts`. **The echo is derived, never appended to `world.queue`**:
the queue is the wave's script and is outside the hash on purpose
(`hash.ts`), so `spawnArrivals` reads the echoed entry back off the queue by
index — the entry the stretch sent *n* beats after its start — and stamps the
body `unseen: true` (`creature-types.ts`); `creature-body.ts` draws nothing
for an unseen body and `body-hit.ts` plays its hit whole. No physics of its
own — the echoed body is the same kind on the same movement and resolution
paths. The body at the top is **the draft `creatures.ts` already offers for
*Reverse wave*** (`suggests: "Reverse wave"`) or one combined with it,
never a shape the game draws. A boss panel in the director with the echo
beat on it; the sentence in `mechanics-bosses.ts`; `bosses.md` §11.13; the
BOSSES page then shows it built.

**Then the idea goes**: the *Reverse wave* entry in `ideas.md` comes out as
built, the draft's `suggests` is retired the way a shipped one is, and the
sentence in `asset-catalogue.md` that counts it among the three still waiting
is corrected. The name is a working one — THE ECHO — and the owner may
rename it in `bosses.md` when he sees it.

Prove it with `bun run check`, a replay test that fingerprints two echoes,
`frame.test.ts` with an unseen body mid-fall and one at its kill on both
seats, and the wave watched at tempo through one full stretch and its echo.

## THE BALLOON's wave tells the pair three things the game stopped doing

- **Found:** 2026-09-15, claude/queued-tasks-51d8f9
- **Files:** `packages/content/src/waves/act-7b.ts`, `packages/content/src/scenes/`, `packages/render/test/briefing.test.ts`

The owner ruled on 14 September 2026 that a balloon **never goes downwards**
and that the top of the field is a body the pair has to answer rather than a
bill on the hull (`sim/balloon.ts` `topOut`, `sim/balloon-rub.ts`). The wave's
own guide was written before that and still says all three of the things that
went:

- *"Reach the top and one goes off and the hull pays for it"* — it turns into a
  torch there now and the hull pays nothing.
- *"one climbs on, one sinks"* — both halves climb, and the lane between them
  and the carom each takes at its own wall is what makes them two problems.
- *"a half that reaches the ship goes off like the top"* — nothing sinks, so
  nothing reaches the ship.

Player 2's half then names the sinking half again — *"or down into you"* — so
the seat with no reason to watch the bottom of the field is told to. This is
the one screen in the game whose whole job is telling two people what a body
does, and it is describing a creature that has not existed for a day.

Rewriting it is three sentences in `guide.both` and one clause in `guide.p2`,
and the scene beside it is worth reading for the same drift. **`both` and each
half are capped at 220 characters** (`briefing.test.ts`), and the present
`both` is already at the cap, so this is a rewrite rather than an edit. Prove
it with `bun run check` and one frame of the opening.

## Two fake DOMs, neither of them the other's

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `tools/director/test/fake-dom.ts`, `apps/game/test/fake-dom.ts`, `tools/director/test/*.test.ts`, `apps/game/test/first-meeting.test.ts`

`bun test` carries no DOM and this repository has now answered that twice. The
director's (224 lines, 6 September 2026) is built round a tab bar,
`querySelector`, `getElementById` and a canvas; the game's (135 lines,
16 September 2026) round a field's value, a button's text, `hidden`,
`disabled`, `remove` and a `body` with a dataset. Between them they write
`FakeEl`, `createElement`, `append`, `addEventListener`, a click that iterates
a copy of its listeners, and a `descendants()` that flattens the tree — the
same six things, twice, with different names for two of them.

The third screen that wants one is the point at which this is decided badly by
default, and there are three waiting: SETTINGS, the room screen's own name
field, and the menu's pages.

**One `tools/test/fake-dom.ts` with the union of the two surfaces**, each
caller keeping its own installer — the director's `installDom(spec)` with its
bars and ids, the game's with its body — over one `FakeEl` and one
`createElement`. Both files' doc comments carry the same argument for why this
is not a devDependency, and that argument is worth writing once.

Prove it with `bun run check`: every test that reads either file today passes
unchanged, and neither installer's surface grows while it is moved.

## `--press` decides a seat from the command, and a seat is the panel's

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `tools/frames/press.ts`, `packages/content/src/control-sets-table.ts`, `packages/content/src/controls.ts`

`SEAT_OF` in `press.ts` maps a command kind to the seat that sends it, and
`intake` is down as player 1's. That was true while the maw was only ever the
cannon lobe. It is not true now: THE CLAW's panel and THE SPLICE's both carry
`mawTake`, which is **player 2's** and sends the same `{ kind: "intake" }`. So
`bun run frames . --wave "THE SPLICE" --press <t>:2:intake` is refused with a
message saying the round would ignore it, and the picture of this lane's own
boss had to be taken with the press attributed to the wrong seat. The
simulation does not gate `intake` by player, so the frame was honest about the
world and wrong about the panel — which is exactly the kind of quiet wrongness
the check was added to prevent.

The fact is already written down once: `CONTROLS` gives every control a
`player`, and `controlSetForWave(index)` says which controls a wave's panel
carries. So the check belongs on the **wave being captured** — resolve the
command kind to the control the wave's own set holds, and refuse only a seat
that set really does not give it. `--wave` is already required and already
resolved to an index before the presses are parsed (`run.ts`), so nothing new
has to be threaded. Prove it with `bun run check` and one frame of THE SPLICE
taken with `<t>:2:intake`.
