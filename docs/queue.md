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

**A boss's look belongs here like anything else.** It was moved out on 20
September 2026 — twenty-four entries went to a menu the director drew at the
top of the BOSSES page, and nothing started until the owner named a boss — and
he changed his mind the same day: *"what you moved to the bosses page from
queue, add it back to queue but at the very end. no need for opt-in."* They are
back, at the end of this file, and a lane claims one the ordinary way. **Do not
move them out again** without him asking for it in those words; the whole
arrangement — the spec page, the director's group, the rule in three files —
was written and taken out again inside one evening.

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

**The answer is written back into the entry**, on an `- **Answered:** <date> —
<what was chosen, and over what>` line under the `Asks:`. That line is not
bookkeeping: `next` passes over an entry whose ask has no answer under it, and
hands it out like any other once one does. Before that, a lane following
*continue to work on the queue* hit *THE THROAT's three hand sounds*, whose own
body says what is left is three presses by an ear, released it, and was handed
the same entry again — three sessions in a row picked it up. The listing reads
`ANSWERED` instead of `ASKS THE OWNER` once the line is there, and prints it.
**A re-ask appends rather than overwrites**, and the last line is the live one:
THE SCOUT's entry keeps an answer given against an option its geometry did not
allow, under the one that replaced it, because what was decided first and why
it did not hold is half of what the next session needs. `tools/queue/asking.ts`.

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
worktree, does the item, removes the entry with `bun run queue done "<title>"`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

**Say in one sentence what an item is about, at the moment it is claimed.**
The owner, 19 September 2026: *whenever you take something new from queue, can
you write one sentence what it is about.* A title is a label and most of them
are written to be found rather than read — *THE SURGE changes state more than
once*, *boss-cue-read-c.ts at 245 lines* — so a session draining five in a row
reports five titles and he cannot tell from any of them what is about to change
in his game. The sentence goes in the report the moment `take` or `next`
returns, before the work starts, and it says what the item is in plain words:
not the entry restated, and not a plan. One line, one item.

**The trunk comes up before each item, not once at the top of the sitting.**
The owner, 18 September 2026, on a session that drained five in a row: *before
starting a new task from queue, make sure to be up to date from main.*
`git fetch origin main && git merge --ff-only origin/main`, then
`git merge --ff-only main` in the lane, between one `queue done` and the next
`take`. It is not the same rule as `CLAUDE.md`'s *bring the trunk up before you
start*, which is about a lane: a sitting that drains several items lasts hours,
and in that time other lanes land. Three entries in one morning were read
against a tree that had moved — one was a third stale before it was claimed,
one had its files rewritten under a landing that was already checking, and both
cost more than the fetch would have.

**A number is for reading, not for removing.** `take` and `release` accept the
position a listing printed, because both can be given straight back. `done`
does not: a removal off a stale position is the one mistake nothing in the tree
records, and on 19 September 2026 it deleted a free entry nobody had worked and
exited zero. What made the number stale was this file's own first rule — the
lane had written its finding in above the item it was closing, as it is
required to. So the two rules are settled in the tool: `done` takes the title,
prints what the number *would* have been on, and removes nothing until somebody
has said the words (`tools/queue/claim.ts`, `refuseNumbered`).

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

`- **Where:** local` keeps an entry for a session with a screen, and it is the
owner's line rather than the finder's. He asked for the field on 13 September
2026, the day a local session re-watched four waves a cloud session had built:
some work cannot be proved without eyes and a real frame budget — a wave
watched at tempo, a shape seen to move, a `bun run perf`. The listing marks
such an entry `LOCAL ONLY`, `bun run queue next` passes over one on a cloud
session, and `next <n>` or `take <n>` naming it there is refused with the
reason. A session knows which kind it is by `CLAUDE_CODE_REMOTE`, the signal
the web image sets (`tools/queue/where.ts`). Without the line an entry is
anybody's.

**There is no `cloud` half of it any more.** The field had two values for eight
days: the list was dealt on 18 September 2026, the day he left for two days of
working it from a phone, and forty-odd entries were marked `cloud` so the
session on his own machine would stay free for the rest. The owner took that
half out again on 21 September 2026 — *"please remove cloud only. all cloud
only also local can and should take"* — and the reason the two halves are not
symmetrical is the reason he could: **`local` is a fact about the work and
`cloud` was a preference about the day.** A wave nobody can watch is not
provable in a sandbox whatever anybody would rather; an entry a phone could
have taken is one a machine with a screen can take too, and a local session
that stops at one is a local session idle in front of work it can do. So ten
lines came off, `where.ts` knows one kind of reservation instead of two, and a
stray `- **Where:** cloud` is now a reported problem rather than a reservation
nobody meant. What is left unmarked is what anybody can take, and the handful
that `ASKS THE OWNER`: nobody's machine is the thing they are waiting on.

`- **Needs:** <the title of another entry>` says this one cannot start until
that one lands, and it is the third and last reason `bun run queue next` steps
past a free entry. The other two say what it is not: a `Where:` line refuses —
this machine cannot do that work at all — and an unanswered `Asks:` waits on a
sentence from the owner. Neither can say **this one is fine, but not yet**.
`next` without an argument passes a blocked entry over; `next <n>` or `take`
naming it hands it out as before, with the blocker printed above the entry, so
a session that means to start the unblocked half can. The listing marks it
`WAITS ON "<the other title>"`.

**The line names a title, so the dependency dissolves itself.** `queue done`
takes the prerequisite out of the file when it lands, nothing matches the line
any more, and the blocked entry is ordinary again with nobody having to come
back and delete anything. Which is also why a misspelt title **fails open**
rather than being reported: a name matching nothing and a prerequisite that has
just landed are the same thing from inside the tool. It was written on 21
September 2026, after `next` handed *THE GIMBAL's picture has never been drawn*
to a local session — an entry opening with the words *lane two of §18, once
lane one lands*, under one closing with *do not start it here*. Two sentences
addressed to a reader, which `next` is not. Five pairs in this file carry the
line now.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim;
`tools/queue/test/where.test.ts` holds the reservation.
`tools/queue/test/needs.test.ts` holds the wait.

## `queue take` refuses the lane the entry itself names as its claim

- **Found:** 2026-09-21, claude/queue-four-other-films-still-put-pages-about-their-bos
- **Files:** `tools/queue/claim.ts`, `tools/queue/run.ts`, `tools/queue/test/taken.test.ts`

An entry whose title a lane has rewritten cannot be re-marked by the lane that
rewrote it. It happened twice on the sixteen-films entry in two days: a lane
finishes four of the films, retitles the entry from *Six* to *Four*, and lands
with `Taken:` carrying the old branch and a `(claim: ...)` naming the new one.
The next lane runs `bun run queue take "Four other films ..."` and is told the
item *is already taken* by a branch that is its own predecessor — `claimOn`
answers `workedBranch(item.taken)` the moment the derived ref is live, and it
never reads the `(claim: ...)` the entry is carrying. The lane is the claimant
the entry names and still cannot say so, so it works uncommitted against an
entry the listing shows under somebody else's name — which is exactly what
`taken.test.ts` exists to prevent.

Two ways, and either will do. Have `take` treat a `(claim: <branch>)` that
matches the current branch as the lane's own and re-stamp `Taken:` from it;
or have `claimOn` ignore a `taken` branch whose ref is an ancestor of the
current branch, which is what *my predecessor* means in a linear history. The
second is the smaller change and the one the claim test can state. Either way
a case in `taken.test.ts`: an entry taken by a landed branch, on a branch
descended from it, is takeable.

## THE SCOUT's second arena leaves the scout nowhere to stop

- **Found:** 2026-09-17, claude/queue-unverified-at-ce8a2324-the-scouts-arenas-were-ne
- **Taken:** 2026-09-18, claude/queue-the-scouts-second-arena-leaves-the-scout-nowhere
- **Files:** `packages/content/src/scout-arenas.ts`, `packages/sim/src/config-scout.ts`
- **Asks:** Widen the column's pitch, cut the hazard's touch, or say a mote here is passed and never waited on?
- **Answered:** 17 September 2026 — move the two hazards. **The answer was given against a wrong option and does not fix this**, so the `Asks:` above replaces it with the three the geometry actually allows.
- **Answered:** 19 September 2026 — widen the column's pitch to 2.5 tiles (0.37 of a tile of room). Chosen over cutting `scoutHazardRadiusMilli`, which is a shared tunable and would touch every hazard in the game rather than only this arena's own layout, and over leaving the geometry: the rehearsal film already searched every wait and every burn against the fourth mote and found no leg that did not end in the hazard, which is stronger than "no safe park" — it says this mote may not be clearable at all today, not merely that idling on it is unsafe by design.

Five of the second arena's six motes sit exactly one tile from a hazard's row
— motes on rows 8.5, 6.5, 4.5 and 2.5 against hazards on 7.5 and 3.5 — and a
touch reaches `scoutRadiusMilli + scoutHazardRadiusMilli`, which is 0.88 of a
tile. So a scout parked on any of the five has 0.12 of a tile of room when the
hazard sweeps underneath it, and a scout coasting on to one has none: rows are
not remapped, so those figures are the shipped ones on any field.

The first arena has 2.12 tiles of room on every mote, which is what the
difference looks like. An autopilot that points, burns and coasts cleared the
first arena eight times out of eight when it waited hazards out, and the second
none out of eight — it is caught on the approach every time, at every one of
the eight beats it was started on. That is not proof a pair cannot fly it,
because a pair crosses between sweeps rather than stopping on the mote; it is
proof that *stopping on a mote is never safe here*, which is the one thing the
arena's own comment assumes when it says the column of motes is the line a
ship takes on its own.

The options as first written were: move the five motes half a tile off the
hazards' rows; move the two hazards to rows nothing is on — 9.5 and 5.5 are
free; or cut `scoutHazardRadiusMilli` from 460. The owner picked the second on
17 September 2026, and **the second is a no-op**. The motes sit two tiles
apart, so every row between two of them is 1.0 from one of them: 9.5 is 1.0
from the motes on 10.5 and 8.5, and 5.5 is 1.0 from those on 6.5 and 4.5 —
exactly what 7.5 and 3.5 already are. The rows the hazards are on now were
already rows nothing is on. Nothing moves.

**What the geometry actually allows.** With the column on a two-tile pitch,
1.0 of separation is the most any hazard row can have, so 0.12 of a tile is the
ceiling and not the accident. Room comes from one of three places and no other:
widen the column's pitch (2.5 tiles puts a hazard 1.25 away, which is 0.37 of
room); cut `scoutHazardRadiusMilli` (300 gives 0.28, 200 gives 0.38); or leave
the geometry and change the *comment*, which is the option nobody listed — the
arena's own text already says the column is the line a ship takes and that the
timing is the whole of it, so "a mote here is passed through and never waited
on" may be the arena as designed rather than a defect in it. Arena one's 2.12
tiles are what a mote you may park on looks like; arena two may simply not have
those, on purpose. Measured by flying the shipped
arenas in `tools/probe/`; nothing here was watched, because nothing of the
round is drawn yet (`docs/spec/interludes.md`).

**This entry now also owns the second arena's clock.** Arena one's was brought
from 40 to 18 on 17 September 2026 against a measured twelve-beat flight
(`packages/content/test/scout-flight.test.ts`), and the owner's 24 for arena
two was set aside because the autopilot has never cleared arena two to measure
it — which is the geometry above. Whoever answers the `Asks:` fixes the
geometry, points the same rig at arena one's sibling, and takes the clock from
what it measures; 56 stands until then.

The rehearsal (`content/src/scenes/the-scout.ts`, 18 September 2026) is the
same finding a third way: its legs were searched for — every wait up to
seven beats and every burn from eight to forty-eight ticks — and the search
banked three of the column (rows 10.5, 9.5, 8.5) and found no leg at all to
the fourth, on the hazard's own row 7.5, that did not end in the hazard
within seventy ticks. The film ends with the three banked and the fourth
left hanging.

## THE UNDERTOW changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-18, claude/queue-the-undertow-changes-state-more-than-once-and-as
- **Files:** `packages/sim/src/config-undertow.ts`, `packages/sim/src/events-undertow.ts`, `packages/sim/src/undertow-hash.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE HIVE changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/config-hive.ts`, `packages/sim/src/events-hive.ts`, `packages/sim/src/hive-hash.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## Unverified at 424e7fc4: a real phone browser's own chrome eating the foot of th…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-20, main (claim: claude/queue-unverified-at-424e7fc4-a-real-phone-browsers-own)
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `tools/director/src/director-columns.css`, `tools/director/src/director-phone.css`, `tools/director/src/rail-open.ts`, `tools/director/test/phone-game.test.ts`, `tools/director/test/rail-open.test.ts`
- **Where:** local

*A wave row opens the field, and on a phone the field is the screen* landed from a session that could not look at it. What went unchecked:

- a real phone browser's own chrome eating the foot of the director's GAME view at 375x812 — headless has no chrome to test it with

**This one stays local, and for a different reason than the several "a cloud
session has no screen" entries this session closed today by rendering real
frames instead** (`bun run frames` reads a headless canvas fine). A browser's
own chrome —
the address bar, the bottom toolbar, the home-indicator strip — is drawn by
the OS/browser shell *around* the page, never inside the rendered viewport a
screenshot can reach; headless Chromium has none of it to begin with, so no
frame this repo can render, real event or fabricated state alike, would ever
show it eating anything. This needs an actual phone.

One data point for whoever opens it there: the layout doesn't use `100vh` (the
old trap `dvh` exists to fix — a fixed value that used to lock in the *full*
screen height including whatever the chrome would cover). `director-shell.css`
chains `height: 100%` from `body` down, the same pattern `apps/game/src/
game.css` uses for the shipped field the owner already plays on his own phone.
A percentage chain resolves against the layout viewport a browser actively
reflows as its own chrome shows or hides, which is the correct half of this
problem without reaching for `dvh` at all — so if the foot is still eaten, the
more likely cause is the `director-phone.css` comment's own already-measured
67px aspect-ratio reserve (`min(100cqh, 100cqw / 0.56)`, real and expected)
compounding with a real toolbar's height on top of it, not the sizing method
itself. Worth checking that distinction before touching any CSS here.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## A phone in TEST mode has nowhere to put two bands and the rig

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-21, claude/queue-the-gauges-two-new-states-have-no-pose-in-the-di (claim: claude/queue-a-phone-in-test-mode-has-nowhere-to-put-two-band)
- **Files:** `apps/game/src/at-a-desk.ts`, `apps/game/src/testing.ts`, `apps/game/src/game.css`, `apps/game/src/viewport.ts`, `tools/director/src/stage-transport.ts`, `tools/build-stamp.ts`
- **Where:** local

The second half of "Choosing P1 in the game's view switch hides the switch
itself", split off where that entry said to split it. The first half landed on
19 September 2026: the switch is taken away by the room now rather than by the
view, so a seat can be left again.

The owner, 18 September 2026: *"Also make sure in director and for game, when I
am in solo test mode, I can also test for both players on mobile device."*

The owner, 20 September 2026: *"Maybe it is already resolved, but in game in
'both seats' the bottom of control set is often cutted, so I can't see buttons
and use them also horizontal the hull skin is vertical cutted inside of the
screen. I suggest to remove build information time version below game screen.
It may push content up and be reason."* Not resolved — this is the same cut he
is describing. His own guess at the cause is worth trying first and is cheap to
try: the `#buildStamp` line (`tools/build-stamp.ts`, styled in `game.css`) sits
under the field and could be the thing pushing the rig's bottom off the bottom
of a real phone's viewport; if pulling it (or moving it somewhere that doesn't
compete for height) does not clear the cut on its own, the layout question
below still needs answering on top of that.

The seat card's own words are *"Both bands and the test rig, for one person at a
desk"*, and the rig is laid out for one. `at-a-desk.ts` is the question the app
already asks about the device, asked in one place on purpose, and nothing in
TEST consults it. What a phone in TEST needs is both bands readable at portrait
width and the rig reachable without covering the field — which is a layout
decision and wants an eye on a phone, not a flag. The director's side of the
same ask is smaller: `stage-transport.ts` binds TEST, P1 and P2 and TEST works;
what a phone cannot do is *reach* that strip.

## Unverified at ce22d819: THE ORRERY's rehearsal film watched at tempo — the thre…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-20, main (claim: claude/queue-unverified-at-ce22d819-the-orrerys-rehearsal-fil)
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-orrery.ts`, `packages/content/test/scene-films.test.ts`

*THE ORRERY: a shot cracks a ring and the pilot's thumb takes it off* landed from a session that could not look at it. The commit touched 19 more files. What went unchecked:

Three of the four are settled now, on real frames. The `OPEN` mark stands on
the cracked ring's own grip exactly as `boss-cue-read-l.ts` says (`--boss-json
'{"phase":"seized"}'`). The winds are real, continuous motion and not a
snap: `--opening guide --guide-page 4 --frames 4 --stride 20` catches the
outer ring's organs turning a little further round in each of four real
frames, mid-wind — and all three rings turn through the one shared
`drawOrreryGrip` (`orrery-grab.ts`), so this is the mechanism, not a fact
about the outer ring alone. The split around the rock is the same picture,
banked correctly across the interruption — `orrery-hand.test.ts` already
proves the state survives the release and the re-grip — so what is left of
it is only whether it *reads* right on a real playthrough, folded into the
one question below rather than counted separately.

- Whether a turn and a half of a thumb per organ (`orreryHandMilliPerOrgan`)
  feels like a decision or like friction, on a real phone, mid-fight. No
  frame answers this: it is a pacing question about a real thumb, not a
  fact about the picture.

Open it on a device that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Nothing says how long a thumb waits for the field to answer it

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/input-buffer.ts`, `apps/game/src/loop.ts`, `apps/game/src/perf-page.ts`, `apps/game/src/coalesced.ts`
- **Where:** local

The owner, 19 September 2026, asking whether a native app would take input
better: *it sometimes does not react.*

Nothing in the tree can answer that, because nothing measures it. A press
crosses four gaps before the field moves — the browser's own touch-to-event
delay, the wait for the next `requestAnimationFrame`, the lockstep's scheduled
delay in `input-buffer.ts`, and the beat the simulation applies it on — and
three of the four are ours. Which one the pair is feeling decides whether a
native shell would fix anything at all, and the honest answer today is that
nobody knows.

The work is a counter, not a rewrite: stamp each press with the event's own
`timeStamp` as it enters the buffer, stamp the frame that draws its effect, and
put the spread on the perf page beside the frame cost — worst of the last
hundred, not the mean, because the complaint is about the bad ones. Then the
three entries above can be judged rather than argued about, and so can the
question that prompted this one.

## The queue's own resurrection guard missed a stale entry coming back

- **Found:** 2026-09-20, claude/queue-a-landing-that-forgot-unverified-has-no-way-to-w
- **Taken:** 2026-09-20, main (claim: claude/queue-the-queues-own-resurrection-guard-missed-a-stale)
- **Files:** `tools/land/queue-guard.ts`, `tools/land/queue-merge.ts`, `tools/land/test/queue-merge.test.ts`, `docs/queue.md`

`tools/land/queue-guard.ts` exists to refuse a landing that would put back a
`docs/queue.md` entry the trunk has already removed (`resurrectedAfter`, since
`61c82403`, 5 September 2026). It missed one. *A landing that forgot
`--unverified` has no way to write the entry afterwards* was filed by
`1762eafa`, claimed, fixed and removed in the same commit by `6db42a92` — and
then put straight back, word for word, `Taken:` line and all, by `5780141b`,
twelve commits later in the trunk's own linear history, with `6db42a92`
already its ancestor. The same commit correctly dropped two *other* entries
the trunk had finished meanwhile (THE SCUTTLE's own state-count entry and
`sound-link-none-b.ts`'s line-count entry), so whatever went wrong picked one
entry out of three and got only that one backwards.

This session found the stale entry still sitting in `docs/queue.md`, the fix
it named already built and shipped, and closed it with `bun run queue done`
rather than chasing the merge — that fix was this session's actual assignment.
Chasing it needs `queue-merge.ts`'s `mergeQueue` and `queue-guard.ts`'s
`resurrected` run against the real three-way inputs `5780141b`'s own landing
saw — the merge-base's copy of `docs/queue.md`, the trunk's copy at
`6db42a92`, and whatever that lane's branch carried for the file — to find
which of the two let this one through where it caught the other two.

**A later session did exactly that, as far as it can be done.** `mergeQueue`
is a pure function of three strings, and it is provably correct for the
shape this bug describes: a new test (`three entries the trunk finished in
one go all stay out, not just some`) hands it a base, a trunk and a lane
that all differ only in which of four entries the trunk removed, mirroring
`5780141b`'s own three-out-of-four, and all three come out dropped, not just
two. Every other shape the function's own branches distinguish — an entry
only the lane removed, one only the trunk removed, one both sides rewrote,
one neither side touched — was already covered before this session and
still passes. So `mergeQueue` itself is not where this went backwards.

**What's actually missing is the historical evidence, not more reasoning
about the function.** `5780141b`'s lane was a single, non-merge commit —
its pre-rebase branch and the reflog that would show git's three real
conflict stages for that one rebase both lived in whatever session did
that landing, and neither reached this repository's own `.git`; a
synthetic reproduction here can only mirror the shape the entry describes,
not the actual bytes git handed the resolver that day. Two live
possibilities this session could not rule out without that evidence: git
resolved `docs/queue.md` with no conflict at all for that commit (a
deletion far enough from anything the lane's own diff touched merges
cleanly, and `queue-guard.ts`'s check runs either way — so a clean merge
isn't itself the gap, but it would mean `mergeQueue` was never called and
so never had the chance to get it right); or `queue-guard.ts`'s own
`git merge-base TRUNK HEAD`, asked once before the replay, disagreed with
whatever ancestor git's internal rebase machinery used for that specific
commit's own conflict resolution, which the two would not do for an
honestly single-rebase lane but could if that lane's branch had itself
been rebased earlier in its life. Proving either needs a live repro that
actually rebases a *twice-rebased* single-commit lane through a git-real
conflict and inspects what stage 1/2/3 hold each time — a longer sitting
than this one, and worth starting from `tools/land/test/queue-merge.test.ts`'s
existing `replaying a lane that drained an item` integration test rather
than the string-level unit tests above it.

## THE GIMBAL is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`

`docs/spec/bosses-choreographed.md` §18 is a full design — the question, the
silhouette, both seats, a fourteen-row beat list, which of `THE SLOW` or
`THE DRAG` it wants, the colour statement — for a boss nobody has started.
Build lane one only: `gimbalOuter` and `gimbalInner` as two new `BearingDrag`
members of `DragTarget` (the crank's own gesture, `sim/crank.ts` and
`orrery-hand.ts` are the pattern to copy), the mirrored-bearing rule that
draws each ring turned the way its own face would show it
(`PerSeatTruth`, the Queen's primitive, spent on a bearing), the six
latch-teeth as `World` fields in `hashWorld`, the wave entry with its guide,
and one test per receipt. `.claude/skills/new-boss` §4's file table is the
generic list; §18's own write-up is the design to build against, named
`docs/queue.md`, *what is not built*.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE GIMBAL's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Needs:** THE GIMBAL is written and nobody has built its simulation
- **Where:** local

Lane two of §18, once lane one lands: a sealed drum inside two nested rings
at right angles, six poses (`.claude/skills/new-boss` §5's INSTAR standard —
a body, a pose per state, a morph between them, the perspective changing at
the hatch). The payoff frame is the drum splitting along its seam and
swinging open toward the ship, which is a new silhouette — check
`packages/content/src/silhouettes.ts` first, then draw it, never a filled
rectangle with a stroke round it. One PNG to the owner when it moves, never a
description.

## THE BELLOWS is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`

`docs/spec/bosses-choreographed.md` §19 is a full design: two ordinary
depth-drags (`bellowsPull`, `bellowsPush`, the pattern is `sinewLeft` and
`sinewRight`), `Alternation` (THE BATON's own primitive) spent refusing
whoever *didn't* just act rather than whoever did, and `SimultaneousAction`
(THE BALLOON's own primitive) for the one beat both seats let go together.
Four seams as hashed `World` fields, the wave entry with its guide, one test
per receipt. Nothing here asks the engine for anything new — that is the
design's own point, argued in §19's *Cost* line.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE BELLOWS's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Needs:** THE BELLOWS is written and nobody has built its simulation
- **Where:** local

Lane two of §19, once lane one lands: a double-chambered bellows-lung, five
poses (`.claude/skills/new-boss` §5's standard), the waist's four seams
narrowing and drawn rather than counted, the finale of both halves falling
apart and venting one harmless cloud. A new silhouette — check
`packages/content/src/silhouettes.ts` first. One PNG to the owner when it
moves.

## THE HASP is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`

`docs/spec/bosses-choreographed.md` §20 is a full design: `haspLatch` (a
hold, read by depth for its own unseen heat) and `haspWheel` (a bearing drag,
the way `orreryRing` is) as two new `DragTarget` members, and the gate
between them — the wheel may turn only while the latch is currently held —
read as an ordinary per-tick check of both hands in the boss's own step
function; §20's own write-up says plainly that this needs no new primitive.
Three hasps as hashed `World` fields, the wave entry with its guide, one test
per receipt.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE HASP's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Needs:** THE HASP is written and nobody has built its simulation
- **Where:** local

Lane two of §20, once lane one lands: three sealed hasps down the field's
centre line, five poses (`.claude/skills/new-boss` §5's standard), the
latch's own heat as a slow colour drift rather than a bar, the row swinging
open together at the end. A new silhouette — check
`packages/content/src/silhouettes.ts` first. One PNG to the owner when it
moves.

## THE SPOOL is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`

`docs/spec/bosses-choreographed.md` §21 is a full design: `spoolBrake` (a
depth-hold with no readout of its own) and `SplitGauge` (shipped twice
already, THE SINEW and THE SURGE) for the zone she is shown against the
depth he feels. Four ribs as hashed `World` fields, each easing on a clean
movement rather than cracking, the wave entry with its guide, one test per
receipt. §21's own *Cost* line says this asks the engine for nothing new.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE SPOOL's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Needs:** THE SPOOL is written and nobody has built its simulation
- **Where:** local

Lane two of §21, once lane one lands: a thread-spool creature slung sideways
across the top of the field, five poses (`.claude/skills/new-boss` §5's
standard) — taut and still, the brake shallow and paying fast, deep and
paying slow, a rib easing open, slack and drifting free — with no number
ever drawn on the picture, only how fast the line visibly moves. A new
silhouette — check `packages/content/src/silhouettes.ts` first. One PNG to
the owner when it moves.

## THE RATCHET is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`

`docs/spec/bosses-choreographed.md` §22 is a full design: `ratchetCatch` (a
hold) and `ratchetPawl` (a press, the way THE MAW TAP is) as two new
`DragTarget` members, `SequentialAction` (§16's own primitive) gating the
press on the hold, and a rack that only ever advances — never backward — on
a press, catch primed or not, with an unprimed press burning a tooth for
nothing. Seven teeth as a hashed `World` field, needing five clean advances
of the seven to open; the wave entry with its guide, one test per receipt.
§22's own write-up is explicit that this is a single line in the boss's own
step function, not a new primitive.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE RATCHET's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Needs:** THE RATCHET is written and nobody has built its simulation
- **Where:** local

Lane two of §22, once lane one lands: a toothed climbing rack in full view of
both seats, four poses only — fewer than any other boss on the page, on
purpose, since the picture is the rack's own remaining teeth rather than a
body changing shape (`.claude/skills/new-boss` §5's standard, read against a
boss that is mostly still). A burned tooth is drawn as a flat, unlit
non-event; a clean advance gets a visible click and jolt. A new silhouette —
check `packages/content/src/silhouettes.ts` first. One PNG to the owner when
it moves.
What to do, and the two halves are separable. The cheap half is to notice:
`Lockstep` can take the tick its run started on and count a peer message that
arrives before it, so the ledger reports *commands lost at the start* rather
than a fingerprint mismatch at tick 240. The real half is to hold what arrives:
a pre-begin buffer in `link-run.ts` fed into the new scheduler, which needs the
messages of the *previous* run kept out of it — the room stamps a fresh beat
zero for every rejoin and an old run's ticks are far ahead of a new one's, so
the buffer has to be cleared on every `end` and on every welcome that moves the
stamp. `two-devices-opening.test.ts` already drives two devices through a beat
zero over a wire it controls, so a case that begins one device late belongs
beside the ones there.

## A partner who vanishes on the room screen is still drawn as present

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Taken:** 2026-09-21, claude/queue-an-entry-that-waits-on-another-one-has-no-way-to (claim: claude/queue-a-partner-who-vanishes-on-the-room-screen-is-sti)
- **Files:** `apps/server/src/room.ts`, `apps/server/src/room-route.ts`, `apps/server/test/room.test.ts`

The room counts its seats only when something asks it to — a relayed `input`,
`confirm` or `hash`, a press, or an arrival. During a run that is every frame,
so a seat whose socket vanished is evicted within a beat of the window running
out and the survivor is told `peers: 1` at once. On the **room screen** nothing
is relayed: the only message either phone sends is a `ping`, and `ping` answers
a `pong` without ever asking who is in the room.

So a phone that vanishes while the pair are looking at each other's circles is
never noticed. Proved against the shipped worker with the window shortened
through `vars`: the survivor pinged for twice the eviction window and heard
nothing, then pressed READY and was told `peers: 1` in the same breath. Until
that press their screen draws a partner who is gone, with a circle they can
hold and a wait that will never end on its own — which is the one screen in the
game whose whole job is to say whether the other person is there.

What to do: have the `ping` case count the seats the way the other cases do,
which is one call to the room's own `seats()` and costs a tag read per socket
every 700 ms. The eviction and the `peers` that follows it are already written
— `occupiedSeats` hangs the dead socket up and `webSocketClose` announces it —
so this is only about asking. `room.test.ts` has the harness: two phones, one
falls silent, the other pings and is told without pressing anything.

## `stage.ts` is at the 250-line ceiling exactly

- **Found:** 2026-09-20, claude/queue-tasks-model-switching-e53403
- **Files:** `tools/director/src/stage.ts`, `tools/director/src/stage-touch.ts`

The desk's stage is now 250 lines, which passes `limits.test.ts` and leaves the
next lane nothing. It got there by one line: the cue key's held thumbs have to
move before the world steps, so `advance()` calls `touch.cueTick()` — and
paying for that meant folding a two-line comment about *why* down to a
trailing one, which is the argument thrown away to buy the line.

What to do: cut the loop out. `stage.ts` holds the wiring (`run`, `stop`,
`advance`, `stepOnce`, the key drain) and the URL/params reading around it, and
the wiring is the half that has grown three times this month. A `stage-loop.ts`
taking the pieces it drives — `world`, `keys`, `touch`, the painter — and
returning `{ run, stop, advance }` would leave `stage.ts` the assembly it reads
as. `tools/director/test/` already drives the stage end to end, so the split is
proved by tests that exist.

It has now cost a second lane the same coin: the rate fix of 21 September
wanted three words at the loop's own call saying that THE SLOW is spent there,
and there was no line to put them on — they are in `stage-loop.ts` instead,
which is where the argument lives but not where a reader of the call is.

## Two beats to land together is the whole difficulty of THE INSTAR

- **Found:** 2026-09-20, claude/queue-tasks-model-switching-e53403
- **Files:** `packages/sim/src/config.ts`, `packages/sim/src/instar-step.ts`, `packages/content/src/instar-script.ts`
- **Asks:** Keep `instarTogetherBeats: 2` for every pose, widen it, or let each step name its own?
- **Answered:** 20 September 2026 — keep `instarTogetherBeats: 2` for every pose. The owner: *"For the moment keep simple."* So the window is not widened and no step names its own; what is left of this entry is the guidance, which is the other half of it and where the difficulty actually is.

The owner, 20 September 2026, after watching the second pose: *p2 pulls but
it is incorrect, why… maybe this time frame for p2 to pull is too short,
which makes it too hard for p2 to hit it.* Half of that was the picture not
saying which clock was running, and that half is fixed: a mark that is done
now draws the together window closing into it and says `WAITING`
(`render/instar-together.ts`). The other half is the number itself, and it is
his.

What the number is. A pair have the step's whole `windowBeats` to work in —
8 to 12 in the shipped script — but a mark answered alone waits
`instarTogetherBeats` for its partner and then goes back to nought
(`slipLonely`). At `tickHz: 120` and `bpm: 96` that is 2 beats, 1.25 seconds.
It is not the time to *act*; it is the gap between the two finishes. Held
gestures (`pullDown`, `pullUp`, `hold`) are exempt — only the counted ones
(`tap`, `swipeDown`, `turn`) can slip — so the poses this bites are `armed`
(p1 taps 6 against p2's three swipes) and `moulted` (p2 taps 8 against p1's
turn), which are exactly the two he was on.

Three ways to answer, and what each costs:

1. **Leave it at 2.** The new reading may be the whole fix — the difficulty
   was never being seen, and 1.25s between two finishes is a fair ask once
   both screens say so. Costs nothing; risks another report.
2. **Widen `instarTogetherBeats` to 3 or 4.** One field in `config.ts`, one
   number, every existing test still passes because they all assert relative
   to the field. It makes the whole fight easier by the same amount, including
   the last pose, which is meant to be the hard one.
3. **Per-step.** `BossSequenceStep` gains an optional `togetherBeats`, the
   config value becomes its default, and `instar-step.ts` reads the step's own
   — so `gape` and `armed` can be forgiving while `turned` and `lunge` stay
   tight. About thirty lines across sim and content, plus a row in
   `hashWorld` coverage for nothing (the field is authored, not state), and it
   is the only option that can make the teaching poses easy without making the
   ending easy.

A fourth thing he said is not this entry and is not queued: *this is generic
feedback of choreographed bosses.* The other four read their asks through
`bossCues` and have no together clock at all — THE BATON's merge and THE
CAIRN's hold are timed against the beat, not against each other — so there is
nothing there to widen. If the answer here is 3, whether the same per-step
knob should exist for them is a second question for a second entry.

## The other choreographed bosses never say when the second seat may act

- **Found:** 2026-09-20, claude/queue-tasks-model-switching-e53403
- **Files:** `packages/render/src/instar-call.ts`, `packages/render/src/boss-cue.ts`, `packages/render/src/boss-cue-text.ts`, `packages/sim/src/instar-step.ts`

The owner, 20 September 2026: *for any in-game action which requires one
player to hit a specific point in time related to the other player's action,
it should show text and visual for when is the right point in time for the
other player to act… this is a generic rule for bosses with choreographed
state actions.* THE INSTAR has it now — `instar-call.ts` draws a line under
the marks naming the seat still out and the beats it has left. Nothing else
in the game does.

What to do, in order. **First find the couplings, because they may not all
exist.** A coupling is any rule where one seat's act is judged against *when
the other seat acted* rather than against the beat: THE INSTAR's
`slipLonely` is one. Read the four other choreographed bosses' simulations
for the same shape — a stored beat of one seat's act compared with another's
— and write down what each one found, including the ones that found nothing.
The reading from this lane, which is a reading and not a proof: THE BATON's
merge and THE CAIRN's hold are timed against the beat and not against each
other, so there may be no coupling outside THE INSTAR at all. If that is what
the reading says, this entry closes with a test that pins it, not with a
feature.

**Then, for each one found, one line.** `instarCall`'s three states are the
shape: what the rule is while nobody has acted, and who-and-how-long once
somebody has. The drawing is already shared — `drawInstarBanner`
(`instar-word.ts`) centres a scanner box on the glass — so a second boss's
line is a reading function and a call, not a second box. Keep #34: the line
says what the *pair* is under and never a seat's own verb, which is why it
is drawn bright on both screens.

## No picture tool can photograph a card the back gesture opens

- **Found:** 2026-09-20, claude/queue-the-phones-back-gesture-leaves-the-game-instead
- **Files:** `tools/frames/menu-shot.ts`, `tools/frames/menu-trail.ts`, `apps/game/src/back-ask.ts`

`bun run menu-shot` is the tool for markup over the field, and it can only
arrive at a screen a **press on a labelled button** opens: its trail is
`menu-trail.ts`'s press steps, and it waits for `#menu.on`. The back-ask card
is opened by the phone's back gesture and by nothing else, so photographing it
for the owner meant a throwaway Playwright script in a scratch directory that
called `launchBrowser` and `menuDevice` itself and ran `history.back()` on the
page — which is exactly the friction `menu-shot.ts`'s own header says it was
built to stop being paid again, paid again.

Two flags would cover it and neither needs a new browser: a step in the trail
that means *press back* — `--page "BACK"` is taken by the menu's own row, so
its own flag — and a `--screen` that says which `.on` to wait for instead of
`#menu.on`, with `--element` already able to name the card. With both,
`bun run menu-shot back.png --back --screen "#backAsk.on" --element "#backAsk"`
is the picture in this entry's place. `menu-shot.ts` is near its ceiling, so
the trail's new step belongs in `menu-trail.ts` beside the ones it has.

## `bun run frames` cannot stop inside a rest, only on the event that ends it

- **Found:** 2026-09-20, claude/queue-no-guide-page-says-which-wave-it-is-and-the-gap
- **Files:** `tools/frames/until.ts`, `tools/frames/flags.ts`, `tools/frames/run.ts`

`--until EVENT` stops on the tick an event fires, which is the wrong end of
everything that *stands between* two events. The screen between the waves is up
for the 450 ticks after a wave clears and `needWave` fires on the last of them,
so `--until needWave` photographs the frame after the screen has gone. Getting
one picture of it meant sweeping all ninety-seven waves in the headless
simulation for one that clears with nothing pressed — a wave left alone is
breached, and a breached wave is lost rather than cleared, so exactly one does
(THE FENCE, wave 50, clear at tick 2475) — and then passing that tick plus a
hand-counted offset to `--ticks`.

One flag covers it: `--until-back N`, which keeps the frame N ticks *before*
the event instead of on it. The run already advances tick by tick looking for
the event (`until.ts`), so it is a ring of the last N painted states or, more
cheaply, a second pass that re-runs to `foundTick - N`. The second pass is the
one to write: the tool restarts a world from a seed every run anyway, and a ring
of frames is memory for nothing.

## A wave with a guide opens on its introduction as well

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/sim/src/briefing.ts`, `apps/game/src/waves.ts`, `packages/render/src/wave-intro.ts`, `packages/render/src/ready-page.ts`
- **Where:** local

The owner, 20 September 2026: *when there is a tutorial/guide skip the wave
information on the game screen after the "ready?" page, as it is not required
and we showed it already. For waves with no guide/tutorial show it.*

The three states are `OPENING_GUIDE`, `OPENING_INTRO`, `OPENING_PLAY`, in that
order, and every wave passes through all three (`briefing.ts`). A wave that
carried a guide has already put the number, the name and the sentence in front
of the pair twice over: `wave-intro.ts` is drawn on the last page of a stepped
guide, over the ready button, which is the thing the pair says READY *to*. Then
the gate passes and the same three lines stand alone for `INTRO_SECONDS` more.

So the introduction becomes the no-guide case only. `startWave` is already told
whether this wave has a guide — it is the `guide` flag on `Briefings` — so the
change is which phase the gate hands over to, and `apps/game/src/waves.ts` must
stop arming `left = INTRO_SECONDS` for an opening that will not reach the
introduction. A retry already skips the guide and must keep its introduction:
that is the one path where the lines have not been shown.

`phase` is in `hashWorld`, so this is a rule both devices read the same way and
not a thing render may decide.

## A wave gone again opens at the same speed as the first try

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/wave-intro.ts`, `apps/game/src/waves.ts`, `packages/sim/src/wave-fail.ts`
- **Where:** local

The owner, 20 September 2026: *when players lost the same wave, try and retry,
shorten the time to show the text and start the wave rows earlier.*

`INTRO_SECONDS` is 5.5 and is one constant for every opening. A pair on its
fourth attempt at one wave has read those three lines four times and is waiting
through them for the field. `world.retries` is already counted, and
`apps/game/src/waves.ts` already knows `retry` when it opens the wave — so the
seconds can come down with the attempt, to a floor rather than to nothing, and
`wave-intro.ts`'s own `FADE` and the staggered drop shorten with them or the
words never finish arriving before they leave.

Two numbers to decide and to say in the commit: the floor, and whether the
fall is per retry or one shorter value for every attempt after the first. The
second is the smaller change and the one to try first.

## The controls answer nothing while the introduction stands

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/sim/src/step.ts`, `packages/sim/src/briefing.ts`, `apps/game/src/field-input.ts`
- **Where:** local

The owner, 20 September 2026: *on this screen, while the text is there, players
can already use their controls.*

`step.ts` returns early while `briefingHolds` is true and reads exactly two
commands out of the batch, `brief` and `guideStep`; everything else is dropped
on the floor. So a pair reading the introduction cannot slide the cannon to the
column they have just agreed on, cannot put the shield anywhere, and starts
every wave from wherever the last one ended.

The field is already frozen by that early return rather than by a check
anybody has to remember, which is what makes this a narrow change: during
`OPENING_INTRO` only, let the hull's own commands through — the cannon, the
shield, the load — while nothing spawns, falls or is resolved. Whether the
triggers fire is the one decision: a bolt in the air when the wave starts is a
bolt the first row was not spawned against, so the safer half is to let the
pair *aim* and not shoot, and to say in the commit which was taken. The guide's
own pages keep the shape they have, because a rehearsal already has its own
presses.

Hull commands during a held wave go through `hashWorld` like any other, so this
wants a replay test rather than an eye.

## A device that was once in a room never goes back to BOTH

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `apps/game/src/view.ts`, `apps/game/src/shell.ts`, `apps/game/src/menu-seats.ts`
- **Where:** local

The owner, 20 September 2026: *when in test mode in game, "both seats" should
be selected by default.*

`restore()` in `view.ts` already answers `"test"` when nothing is stored, so a
fresh browser does open on BOTH · ONE SCREEN. What takes it away is the room:
`shell.ts` calls `setSeat` with the seat the room dealt, `set` writes it to
`localStorage` under `neon-spore.view`, and nothing ever writes it back. A
person who once joined a room is P1 at their own desk from then on, with half
the band drawn and the other half's touches going nowhere.

Two options, and the answer picks between them in code rather than from the
owner: the room's seat is not persisted at all — `set` grows a flag saying
whether this is the player's own pick or the room's — or leaving a room writes
`"test"` back the way joining wrote `"p1"` (`menu-bindings.ts`'s hang-up path
already exists for it). The first is the smaller one and survives a phone that
is closed inside a room.

## The DEMOS menu puts a 261-word paragraph on a button: the 35 long ones

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `packages/content/src/mechanics-bosses.ts`, `packages/content/src/mechanics-rounds.ts`, `packages/content/src/mechanics-split.ts`, `tools/words/clean.ts`

`MECHANICS[id].what` was written as the bestiary's record and is drawn as the
subtitle of a button on the DEMOS page (`apps/game/src/demo-menu.ts` →
`apps/game/src/menu-pages.ts`), on a phone. `lead` is 261 words there, `surge`
225, `scuttle` 221. Thirty-five of them run past a hundred.

Rewrite those thirty-five to the budget in `.claude/skills/game-words`: 30
words, 18 to a sentence, no semicolon and no em dash. The long version is not
lost — every one of these mechanics has a spec sheet under `docs/spec/` that
owns the full rules, and the button only has to be recognisable.

Then add each id to `CLEAN` in `tools/words/clean.ts` and lower `CEILING` to
what `bun run words --clean` prints.

## The DEMOS menu puts a paragraph on a button: the other 46

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `packages/content/src/mechanics-table.ts`, `packages/content/src/mechanics-worn.ts`, `packages/content/src/mechanics-rocks.ts`, `packages/content/src/mechanics-handed.ts`, `tools/words/clean.ts`

The same job as the entry above, for the forty-six `what` sentences between 30
and 100 words. Lighter work per row — most of them are one good sentence and
one clause too many — and the same finish: `CLEAN`, `CEILING`, `bun test
tools/words`.

Do this one **after** the thirty-five, so the register is settled on the hard
ones first.

## Nineteen wave guides in acts 1 to 3 fail the words check

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `packages/content/src/waves/act-1.ts`, `packages/content/src/waves/act-1b.ts`, `packages/content/src/waves/act-2.ts`, `packages/content/src/waves/act-3.ts`, `packages/content/src/waves/act-3b.ts`, `tools/words/clean.ts`

Forty-nine lines across nineteen waves. These are the first guides a pair ever
reads and they are the ones written as prose: FIRST STEP's `both` is 41 words,
THE SHELL's 49, THE CLASP's 58.

`bun run words "THE SHELL"` prints every line with the rule and the word.
`.claude/skills/game-words` section 5 has three rewrites already checked,
including THE SHELL's and THE COUNT's, and section 4 is the loop. Reach for the
numbered-step shape the boss guides use — it is why twenty-nine subjects
already pass.

## Twenty wave guides in acts 4 to 7 fail the words check

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `packages/content/src/waves/act-4.ts`, `packages/content/src/waves/act-4b.ts`, `packages/content/src/waves/act-5.ts`, `packages/content/src/waves/act-6.ts`, `packages/content/src/waves/act-7.ts`, `tools/words/clean.ts`

Fifty-eight lines across twenty waves, the same job as the acts 1 to 3 entry
and under the same skill. Take that one first if both are open: the earlier
guides are read by more pairs.

## Twenty-six wave guides in acts 7a to 7g fail the words check

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `packages/content/src/waves/act-7a.ts`, `packages/content/src/waves/act-7b.ts`, `packages/content/src/waves/act-7c.ts`, `packages/content/src/waves/act-7d.ts`, `packages/content/src/waves/act-7e.ts`, `packages/content/src/waves/act-7f.ts`, `packages/content/src/waves/act-7g.ts`, `tools/words/clean.ts`

Fifty-nine lines across twenty-six waves, the same job and the same skill.
Several of these are already close — act-7f has two failing lines across two
waves — so the file order to work in is the one `bun run words` prints, worst
subject first.

## Fourteen wave guides in acts 8 to 10 fail the words check

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `packages/content/src/waves/act-8.ts`, `packages/content/src/waves/act-9.ts`, `packages/content/src/waves/act-10.ts`, `tools/words/clean.ts`

Forty-three lines across fourteen waves, the same job and the same skill. These
are late-game waves, so the pair reading them has read sixteen guides already —
which is an argument for doing this one last, not for doing it differently.

## Six strings a player reads are outside the words check

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `apps/game/src/hold.ts`, `apps/game/src/menu-seats.ts`, `tools/words/text.ts`

`tools/words/text.ts` collects player-facing text out of `@neon-spore/content`
and stops there, because importing `apps/game` pulls in the DOM. Six strings
live on the other side of that line: the three connection-trouble sentences in
`hold.ts` and the three seat descriptions in `menu-seats.ts`. All six fail the
rules by eye — *"It is being reached for again — the seat is held for a few
seconds more"* is a passive, an em dash and a word (`seat`) the player has
never been shown.

Two ways to reach them, and the second is better: lift the six strings into a
DOM-free module of their own that both `apps/game` and `tools/words` import, or
teach `text.ts` to read the two files as text. The first makes them ordinary
entries with a `kind`; the second is a parser that breaks the next time somebody
reformats a template literal.

Rewrite them in the same lane, and say in the commit that `menu-seats.ts` is
where the fourth word for the shield lives.

## `docs/style-guide.md` carries "How an asset gets made" twice

- **Found:** 2026-09-21, claude/game-skill-descriptions-cecf37
- **Files:** `docs/style-guide.md`

The section appears in full twice, back to back, with small wording drift
between the copies — the second says *"which the next session applies"* where
the first says *"and the next session applies it"*, and step 4's last sentence
is rephrased. Neither copy is wrong; there are just two of them, and a file
whose whole job is to put the language on one screen is the worst place for a
reader to meet the same six steps again.

Keep the second copy — its step 4 is the tighter of the two — and delete the
first. Nothing links to either by anchor.

## THE LURE's corner frame says DO NOT SHOOT where the owner wants IGNORE

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/lure-alarm.ts`, `packages/content/src/creatures-worn.ts`, `tools/director/src/brush-cards.ts`

The owner, 20 September 2026: *"Lure" enemy help text: say "Ignore" instead of
"do not shoot".*

`LABEL` in `lure-alarm.ts` is the frame the navigator reads. The word is
already short because the owner asked for it short once — the hole in the
middle is the creature — and IGNORE is shorter still, so the frame's geometry
only gets easier.

Three other places say the same sentence and should be read before this lands,
because a game that says two different things about one body is worse than one
that says the long thing twice: the worn creature's help line in
`creatures-worn.ts`, the director's brush card in `brush-cards.ts`, and the
wave text in `packages/content/src/waves/act-3.ts`. `husk-mark.ts` deliberately
says DO NOT TAKE and is not this; leave it.

## THE THROB wears the ammunition colours where the owner wants dots

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/throb.ts`, `packages/render/src/throb-pores.ts`, `packages/render/src/throb-look.ts`
- **Where:** local

The owner, 20 September 2026: *change the visuals so it will never have the
colour of a slick or a bulb in the middle. Also remove this line in the middle
of rotation. Instead it shows the moving black and white dots in the middle all
the time.*

A look the owner asked for by name, which is the first of `CLAUDE.md`'s three
exemptions — it goes on the field rather than to VERSUS, and the commit says
so.

Two things go. The seam: `seamAt` returns the boundary meridian and
`farRegion` clips the far hemisphere to it, and the visible edge between the
two halves is drawn in `ThrobHalf.seamHue` — that line down the middle is what
he is pointing at. And the middle's colour: the far half is filled in the other
ammunition colour, so the body's centre is always one of red or cyan.

What replaces them is the pores, promoted: `throb-pores.ts` already pins seven
marks on a hemisphere and carries them round by `throbTurnMilli` at 22.9 : 1
between the middle and the limb, which is exactly the travelling-dot picture,
and they already narrow to nothing at the limb rather than being cut. So the
work is to paint them black and white instead of in the far colour, to draw
them over the whole body rather than over a clipped hemisphere, and to take the
seam and the far fill away underneath.

**Which trigger answers the body must still be readable.** The turn is the
whole of this creature — the pilot reads which colour is round, the navigator
presses it — so whatever the middle stops saying, the rim or the far edge has
to go on saying, and the lane that does this proves it with a frame of both
halves rather than with the arithmetic.

## A shot into a shut COUNT loses the wave where it should armour the body

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/sim/src/countdown.ts`, `packages/sim/src/colour-armour.ts`, `packages/sim/src/config.ts`, `packages/render/src/countdown-look.ts`

The owner, 20 September 2026: *"Count" enemy hit with the wrong colour or at
the wrong time should not lose the wave, but have some armoured state of it,
e.g. 3 beats.*

`countdownStruck` answers a shot off zero with `breachHull(..., "heavy")`,
which is the hull and therefore the wave (`wave-fail.ts`). That was written as
the lure's price for the lure's reason, and the owner has now said the price is
too high: a reflex shot ends the run rather than costing the pair the beats it
should.

The machinery is already next door and is to be called rather than re-derived.
`colour-armour.ts` is the window a wrong colour opens on an ordinary body —
`colourStruckTick` on the creature, `colourIsArmoured` to ask, and
`colourArmourPhase` for the grey body render/ draws — and its own comments say
the window exists precisely so a mistake costs the *next* shot as well as the
one that was fired. A shot off zero stamps that window instead of breaching,
with its own length in `SimConfig` because three beats is longer than
`colourArmourMs` and the two must not share a number.

The wrong *colour* on zero already falls through to the generic tail and is
already armoured, so it needs nothing — read it before changing it.

**The random start is already built and is not part of this.** `countdownOnSpawn`
rolls `countPhase` off the world's stream on the beat the body enters, so no
two bodies share a phase and none starts at the top of its count; the owner's
second sentence describes what the file already does.

## A shell's plates are two colours where the owner wants one

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/shell-plate.ts`, `packages/render/src/shell-draw.ts`, `packages/render/src/shell-cut.ts`
- **Where:** local

The owner, 20 September 2026: *"Shell" enemy: all shell parts should have the
same colour, which is the light white one, so dark will become unused.*

`shell-plate.ts` has the two: `PLATE`, `#23222C`, the dead material a plate is
filled with, and `PLATE_RIM`, `PALETTE.rock`, its lit outer edge.
`shell-draw.ts` hazes both by distance and hands them over as `PlateInk`. The
ask is that the fill becomes the rim's colour and `PLATE` goes.

It is not a two-line change and the file says why itself. `PLATE` is darker
than `PALETTE.rockDark` *on purpose*: the splits and the crack carry the
body's own colour through the armour, and light only reads as light where what
surrounds it is darker. A white plate makes cyan coming out of a crack a
scratch on the plate. So the lane that does this has to answer what the splits
become on a light slab — a dark line rather than a lit one, or the body's
colour at a weight that still reads — and the wall, the face and the specular
in the same file each want looking at again against a light fill.

A look the owner asked for by name (`CLAUDE.md`'s first exemption), so it goes
on the field; a frame of an intact shell and a cracked one is the proof.

## THE GAUGE's dial is a claw and its band is a pod

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/gauge-round.ts`, `packages/render/src/gauge.ts`, `packages/render/src/gauge-dial-face.ts`, `packages/sim/src/gauge-band.ts`, `packages/sim/src/gauge.ts`
- **Where:** local

The owner, 20 September 2026: *"The gauge": the control idea should stay, but
the visual a lot.* The claw already in the control set, above the ship where
the cannon sits, turning through an angle rather than sliding left and right
and staying in the middle; a dotted line out of it saying where it will grab,
which is what the needle is now; and a pod in place of the open band, sized so
that the pod's width *is* the span the call is judged against.

The round's arithmetic does not move and this entry must not move it. The
needle is `gauge.ts`'s position in thousandths of `GAUGE_FULL`, the band is
`gauge-band.ts`'s centre and `gaugeSpanNow`'s half-width, and the judgement is
one comparison between them. What changes is that the dial stops being a
circle read as a circle: the same thousandths become an angle the claw points
at, and the same half-width becomes the pod's width on screen. `gaugeDial` in
`render/gauge-round.ts` is where the geometry is decided today, and
`gauge-dial-face.ts` is the face to replace.

The pod's height follows from its width, because the picture has to answer at a
glance whether the claw will pass inside it — the one thing the dial's open
sector never said. `showsGaugeMarks` still decides which of the two screens the
pod is on; the asymmetry is the round and nothing here touches it.

The verdict this picture then needs is a separate entry, and the round's words
and buttons are a third; this one is the claw, the line and the pod standing
still.

## THE GAUGE never says whether the call caught anything

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/gauge.ts`, `packages/render/src/gauge-round.ts`, `packages/sim/src/events-gauge.ts`, `packages/sim/src/gauge-hand.ts`
- **Where:** local

The owner, 20 September 2026: *there should be a very clear visual whether the
claw was successful to catch the pod or whether it was not within the open
area.*

The call is the only thing in the round that can be wrong and it costs
`gaugeCallRestBeats` either way (`sim/gauge.ts`). Today the answer is a change
of state — jammed, settling — read off `gaugeJammed` and `gaugeSettling`, which
is a fact the screen has rather than a moment the pair sees. With a claw and a
pod there are two pictures to draw and they must not be the same one with a
colour swapped: the claw closes on the pod and takes it, or it closes on
nothing and comes back empty.

`events-gauge.ts` is where the round's events are pushed, so whether a new one
is needed is the first question — the render side may already have everything
it needs off the state, in which case this is `Effects` and a frame count and
nothing in `sim` moves at all. Anything render keeps between frames for the
animation belongs in `Effects` and is cleared in `Effects.reset()`
(`packages/render/test/restart.test.ts`).

Depends on the claw and the pod being drawn first.

## THE GAUGE's words and buttons are the round's own, not the ship's

- **Found:** 2026-09-20, claude/wave-tutorial-enemy-mechanics-3fd452
- **Files:** `packages/render/src/gauge-title.ts`, `packages/render/src/gauge-grip.ts`, `packages/render/src/gauge-plate.ts`, `packages/render/src/slabs.ts`, `apps/game/src/gauge.ts`
- **Where:** local

The owner, 20 September 2026: *change the wordings, improve the buttons a lot
so they fit the regular ship hull and control set visuals.*

The words are three lines in `gauge-title.ts` — THE GAUGE, and one of YOU
CANNOT SEE THE MARKS, YOU CANNOT TURN IT, NEITHER HALF IS ENOUGH ON ITS OWN.
All three are about a dial with marks on it, and after the claw and the pod
land none of them describes what is on screen. They are also all negative,
which is the smaller half of why they read as an explanation rather than as a
control: what the pilot is told is what he cannot do.

The buttons are `gaugeLeft` and `gaugeRight` in the control set
(`apps/game/src/gauge.ts`, `slabPanel` in `render/gauge-round.ts`). The round
already takes them from the wave's control set rather than inventing geometry,
which is the right half; what it does not do is wear the hull's own plate, the
grip and the slab treatment the field's controls have. `gauge-grip.ts` and
`gauge-plate.ts` are the round's own versions of those, and the question this
lane answers is how much of each can be deleted in favour of `slabs.ts`.

Depends on the claw and the pod: naming a button before the thing it moves has
a shape is how the wordings got stale the first time.

## `bun run frames` still cannot turn SNAKE, only pose it turned

- **Found:** 2026-09-20, claude/queue-snakes-picture-looks-like-something-real
- **Files:** `tools/frames/press-command.ts`, `tools/frames/press.ts`
- **Where:** local

`--press 430:2:snakeTurn` is refused — "unknown control. One of cannonCol,
guard, intake, prime, salvo, aim, reach, mawTake, shieldCol, fire, grip, tap,
shake, pulseStep, latch, launch, crank, orreryRing" — so the one verb the
second seat has in this round cannot be sent from the command line. The whole
of `snake-controls.ts` is out of reach the same way: `snakeTurn`,
`snakeFire`, `snakeMaw` and the two drags (`snakeJaws`, `snakeTail`).

The look lane worked around it with `--boss "grow=9,turn=1"`, which *poses* a
long turned body rather than driving one, and that is enough for a still and
nothing at all for a sequence: a picture of the jaws opening, of the tail being
shed, or of an attempt ending badly cannot be taken today.

`snakeTurn` takes `left` or `right`, which `AIM_STEPS` already has words for;
`snakeFire` takes nothing; `snakeMaw` is player 1's. Five cases in the
`switch` in `commandFor`, plus their rows in `press.ts`' table of which seat
owns which control.

**Two of the five landed on 20 September 2026.** The board lane needed the
spit photographed, so `snakeFire` and `snakeMaw` are rows in `press.ts`' table
now — both take no value and fall through `commandFor`'s default branch, so
neither needed a `case`. What is still out of reach is the seat that steers:
`snakeTurn` and the two drags, `snakeJaws` and `snakeTail`. Until they are
here, a body that turns is still posed with `--boss` and the jaws are still
only ever seen shut.

## SNAKE's tail stub comes out of the ship as a teal tube

- **Found:** 2026-09-20, claude/snake-board-look
- **Files:** `packages/render/src/snake-emerge.ts`, `packages/render/src/snake-ribbon.ts`, `packages/render/src/snake-skin.ts`
- **Where:** local

On a real frame of the emerging phase (world.tick 402 of SNAKE, seat p1) the
body coming out of the hull is a flat teal-cyan tube with two straight sides.
It does not read as the same animal as the head above it, which is violet, and
it carries none of the scales, none of the lit back and none of the ground
shadow the landed body does — a stub of pipe rather than the last tiles of a
snake still inside the ship.

The head and the ribbon themselves are right; this is the *stub*, which is
drawn while the body has fewer tiles than the ribbon needs. Whatever draws it
should be the ribbon's own material at a short length, not a second drawing of
a body.

## A press the simulation refuses is silent in `bun run frames`

- **Found:** 2026-09-20, claude/snake-board-look
- **Files:** `tools/frames/reach.ts`, `tools/frames/drive.ts`, `tools/frames/report.ts`
- **Where:** local

`--press 400:1:snakeFire` on SNAKE is accepted by the tool, sent to the page,
and dropped by `snakeHeard` — SNAKE spends its first five beats in the `morph`
phase and player 1 has nothing that works while the body is folded up. The
capture comes back looking exactly like a capture with no press on it at all,
and the run prints the tick it photographed and nothing else.

Four captures went that way before a probe of a running world found that the
`play` phase starts at beat 6. The driver already reads `heard` — `reach.ts`
uses it in `missedNote` when an `--until` event never fires, and nowhere else.
A press that was sent and changed nothing about the world is the same kind of
fact and should be said in the report, at least as a count.

## PINBALL's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/pinball-aim.ts`, `packages/render/src/pinball-blast.ts`, `packages/render/src/pinball-button.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SCOUT's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/scout-button.ts`, `packages/render/src/scout-draw.ts`, `packages/render/src/scout-round.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE PULSE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/pulse-body.ts`, `packages/render/src/pulse-button.ts`, `packages/render/src/pulse-drop.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

9 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE DIASTOLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/diastole-bridge.ts`, `packages/render/src/diastole-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE BATON's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/baton-bead-draw.ts`, `packages/render/src/baton-draw.ts`, `packages/render/src/baton-socket-draw.ts`, `packages/render/src/baton-grip.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state. Two of those states arrived on 18 September 2026 with
the §6.2 lane and were drawn by a session with no eye: a swelling socket is the
husk grown half again and shaking, and the two handle rings are the shipped
ones. Both want the same look pass as the rest of the arm.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE UNDERTOW's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/undertow-draw.ts`, `packages/render/src/undertow-fx.ts`, `packages/render/src/undertow-lobe.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE THROAT's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/throat-draw.ts`, `packages/render/src/throat-evert.ts`, `packages/render/src/throat-lock.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE ORRERY's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/orrery-draw.ts`, `packages/render/src/orrery-grab.ts`, `packages/render/src/orrery-shaft.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE CANDLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/candle-dark.ts`, `packages/render/src/candle-glow.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE GORGE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/gorge-draw.ts`, `packages/render/src/gorge-fx.ts`, `packages/render/src/gorge-lobe.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE CURTAIN's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/curtain-draw.ts`, `packages/render/src/curtain-fx.ts`, `packages/render/src/curtain-sheet.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE TASTER's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/taster-blade.ts`, `packages/render/src/taster-crest.ts`, `packages/render/src/taster-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SINEW's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/sinew-band.ts`, `packages/render/src/sinew-draw.ts`, `packages/render/src/sinew-fibres.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE LEDGER's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/ledger-cord.ts`, `packages/render/src/ledger-draw.ts`, `packages/render/src/ledger-fx.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SURGE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/surge-draw.ts`, `packages/render/src/surge-fx.ts`, `packages/render/src/surge-gauge.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE LEAD's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/lead-draw.ts`, `packages/render/src/lead-fx.ts`, `packages/render/src/lead-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SCUTTLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/scuttle-draw.ts`, `packages/render/src/scuttle-fx.ts`, `packages/render/src/scuttle-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE ANTIPHON's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/antiphon-draw.ts`, `packages/render/src/antiphon-fx.ts`, `packages/render/src/antiphon-grip.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE HIVE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/hive-draw.ts`, `packages/render/src/hive-fx.ts`, `packages/render/src/hive-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE CAIRN's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/cairn-hand.ts`, `packages/render/src/cairn-look.ts`, `packages/render/src/cairn-pile.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE WELL's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/well-arrivals.ts`, `packages/render/src/well-body.ts`, `packages/render/src/well-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SPLICE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/splice-draw.ts`, `packages/render/src/splice-straws.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE REPRISE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/reprise-draw.ts`, `packages/render/src/reprise-fx.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## `--hold` names its drag targets as free strings, and nothing checks them

- **Found:** 2026-09-21, claude/queue-frames-hold-cannot-reach-the-six-newest-handles
- **Files:** `tools/frames/hold-targets.ts`, `tools/frames/package.json`, `packages/net/src/command-fields.ts`

`DRAGS` and `TARGET` in `hold-targets.ts` are twenty-seven target names written
out by hand, and the wire's own list is `DRAG_TARGETS` in
`packages/net/src/command-fields.ts`. Nothing holds the two together. A name
that drifts — a target renamed in the simulation, a row added here with a typo
— builds a command the sim drops without a sound, which is the exact failure
`hold.ts`'s own header says this flag exists to end: a frame that comes back
released while every number in the capture says the hold was sent.

The fix is one test in `tools/frames/test/` asserting every value of `TARGET`
and every non-`prime` entry of `DRAGS` is in `DRAG_TARGETS`. It needs
`@neon-spore/net` added to `tools/frames/package.json`, which is the only
reason it was not written with the rows it would have covered.

## A STATES card cannot be named, and `--click` takes plain CSS

- **Found:** 2026-09-21, claude/queue-the-gauges-two-new-states-have-no-pose-in-the-di
- **Files:** `tools/frames/shot-state.ts`, `tools/director/src/states-page.ts`

Photographing one boss's row of state cards took
`--click '#statesCards > div:nth-child(2) section:nth-of-type(6) h2'`, and the
6 was counted off `BOSS_KINDS` in the simulation by hand. Two things make that
the only way in.

The cards are lazy: a group fills when it scrolls into view or its `h2` is
clicked (`section()`), so the element the shot wants does not exist until
something presses that heading. And the heading cannot be named: a card carries
its pose name as text in `.name` and nothing else — no id, no data attribute —
while `--click` runs through `document.querySelectorAll`, which is plain CSS.
The target selector next to it goes through Playwright and *does* take
`:text-is("THE GAUGE")`, so the two flags of one command accept different
languages, and the one that looked right failed with a `SyntaxError` stack.

Two fixes, either alone enough: a `data-boss` on the group's `section` and a
`data-pose` on the card in `states-page.ts` (a name a reader already sees,
written where a tool can ask for it), or `--click` gaining the same
text-matching `--inner` already has. The first is smaller and helps the
sheet's own tests too.

## `bun run crop` and `bun run versus:shot` spell the same rectangle two ways

- **Found:** 2026-09-21, claude/queue-the-slow-is-felt-half-b
- **Files:** `tools/frames/crop-png.ts`, `tools/frames/versus-shot.ts`

`versus:shot` takes `--at x,y,w,h` and `--zoom n`. `crop` takes the same two
numbers as bare positionals, `<in> <out> x,y,w,h [zoom]`, and a call written in
the other spelling — `crop in.png out.png --at 0,700,150,450 --zoom 3` — exits
1 with the usage and no word about which half it did not understand. The two
commands do the same thing to the same pictures and `versus:shot`'s own help
names `crop` as the fallback for when it cannot, which is exactly when a
session reaches for it with the flags still in its hand.

The fix is `crop-png.ts` accepting `--at` and `--zoom` as aliases for its two
positionals, and saying in the usage that both spellings work. It is a dozen
lines and no test beyond one case per spelling.

## A film is proved against a config the game does not play

- **Found:** 2026-09-21, claude/queue-the-hive-has-no-rehearsal-film-no-the-hive-scene
- **Files:** `packages/content/test/scene-films.test.ts`, `packages/sim/src/shot-charge.ts`, `apps/game/src/main.ts`

`sceneScript` hands the host's `cfg` straight to the film and retimes nothing.
`apps/game/src/main.ts` builds that cfg with `shotChargeBeats: 0.5` — a press
waits for the next half-beat point on the grid and the bolt leaves from *there*,
strictly after the thumb. Every film test builds its own with `DEFAULT_CONFIG`,
which ships zero, so that a recorded replay keeps its timing to the tick. Those
are two different films, and the difference is not rounding: THE HIVE's, timed
against the default, breached the hull at beat 21 in the browser while its test
was green, because a bolt fifteen ticks late arrives after the body its column
has just dropped.

**The mechanism is already there and only THE HIVE uses it.** `GuideScene`
gained `chargeBeats` on the same day: a film says which grid its presses were
written on and `sceneScript` lays it over the host's value, the way it already
does with the tempo, so the film plays the same in the game, in a test and in
the director. THE HIVE's carries `0.5`; the other sixteen carry nothing and go
on taking whatever the host has.

The work is the sweep. Run each film twice — once at `shotChargeBeats: 0`, once
at `0.5` — and compare the event streams. A film that reads the same on both
does not care and gets a line saying so. A film that differs is authored for
one of the two, retimed the way THE HIVE's was (each act fifteen ticks before
the departure it is for, pairs 60 apart) and given its own `chargeBeats`. The
comparison itself is worth keeping as a test: a film with no `chargeBeats` whose
two runs disagree is one nobody has decided about yet.

That test belongs in `scene-films.test.ts`, which is 1093 lines, so the sweep
splits it on the way through.

## `packages/content/test/scene-films.test.ts` is 1093 lines

- **Found:** 2026-09-21, claude/queue-the-hive-has-no-rehearsal-film-no-the-hive-scene
- **Files:** `packages/content/test/scene-films.test.ts`

Four times the ~250-line ceiling, and it grows by a block every time a boss gets
a film — seventeen of them now, plus the shared checks that hold every scene to
its shape. The two seams are already in the file: the per-film `describe`s, one
after another, and the rules that run over `SCENES` as a whole. Split the
whole-list checks into their own file and deal the per-film blocks across files
named for the spec page their bosses sit on, the way `scenes-choreographed.ts`
is split from `scenes.ts`. THE HIVE's film took its own file on 21 September
2026 rather than a block here (`test/scene-hive.test.ts`), which is the shape
the rest should end in.

## The queue's example block swallowed five entries and nothing noticed

- **Found:** 2026-09-21, claude/queue-two-bosses-lift-a-cue-by-hand-where-the-rule-now
- **Files:** `tools/queue/queue.ts`, `tools/queue/test/queue.test.ts`, `docs/queue.md`
- **Where:** local

This file's preamble shows the `Asks:` format inside a fenced block, and five
real entries had been written into that fence — every lane that filed one put
it directly under the opening ``` because that is where the first `##` in the
file was, and the next lane copied the last. The fence stayed open over a
hundred and thirty lines, so the preamble's own closing paragraphs rendered as
code and five entries did not render as headings at all. This lane made the
same mistake, saw it in the diff, and moved all six out; the fence on the
other example had also been written glued to its first line.

The parser never minded, which is why it ran for weeks: it reads `##` at the
start of a line and knows nothing about fences. That is the fix — the reader
in `queue.ts` tracks whether it is inside a fence and refuses to see a heading
there, and `queue add`-shaped writes place a new entry after the preamble
rather than at the first heading. The test is a file whose fenced example
contains a `##` line: the listing must not show it, and an entry written into
that file must land outside the fence.

## A before/after cannot be sent as one picture

- **Found:** 2026-09-21, claude/queue-two-bosses-lift-a-cue-by-hand-where-the-rule-now
- **Files:** `tools/frames/crop-png.ts`, `tools/frames/picture.ts`, `docs/commands.md`
- **Where:** local

CLAUDE.md says one picture at a time, and a look change is proved by two
frames — the thing before and the thing after. There is no way to put them in
one PNG. `bun run crop` takes a rectangle of one file and `bun run png`
rasterises a sheet; nothing joins two pictures side by side, and this lane
sent one frame and said the other one in words, which is the thing the rule
exists to stop.

`picture.ts` already has `decodePng`, `encodePng` and `magnify`, so the whole
of it is one function that allocates a wider buffer and blits two decoded
frames into it with a gutter — stacked rather than side by side when the
frames are portrait and the pair would otherwise be unreadable on a phone. A
new script beside `crop-png.ts`, a line in `docs/commands.md`, and a test in
`tools/frames/test` that joins two known images and reads pixels back out of
either side of the seam.

## `FRAMES_CHROME` is read once, when the module is first imported

- **Found:** 2026-09-21, claude/queue-chromium-launch-crashes-here-the-pipe-transport
- **Files:** `tools/frames/chrome.ts`, `tools/frames/test/chrome.test.ts`
- **Where:** local

`CHROME_CANDIDATES` is a module-level `const` whose first element is
`process.env.FRAMES_CHROME`, so the variable is read at import and never
again. Anything that sets it afterwards — a test wanting a browser that is
certain not to open, a script arranging one for a single call — is ignored
without a word, and the default is used instead. This lane wanted exactly
that and could not have it: `launchBrowser` gained an optional executable
parameter instead, which is the right seam for a caller and does nothing for
the environment variable the documentation names.

`pickChrome` is already pure and already takes its candidates, so the fix is
small: `CHROME_CANDIDATES` becomes a function, or the `FRAMES_CHROME` element
is read inside `findChrome()` rather than beside the constant. The test is
setting the variable after import and getting the path back.

## The phone's furniture is read again on every one of a resize burst

- **Found:** 2026-09-21, claude/queue-the-band-runs-to-the-screens-edges-where-the-pho
- **Files:** `apps/game/src/safe-area.ts`, `apps/game/src/viewport.ts`
- **Where:** local

`measure()` calls `safeArea()`, and `safeArea()` calls `getComputedStyle` on
the probe and reads a `padding` off it. Reading a resolved length forces the
browser to flush style and layout there and then, synchronously, before the
call returns — and `measure()` runs on every `resize`, on every
`visualViewport` resize, and on every `ResizeObserver` callback. An address bar
sliding away fires all three, dozens of times, each one a forced flush in the
middle of a frame. It is paid whether the measurement is then used or thrown
away by the freeze, because the read happens before either question is asked.

The four numbers change on exactly two events — a rotation and the first
layout — and on nothing else. So the inset wants to be read once and kept,
refreshed on `orientationchange` and on the `ResizeObserver` the app already
binds, with `measure()` reading the kept value. The proof is a test that counts
`getComputedStyle` calls across a burst of resizes: the fake in
`apps/game/test/viewport.test.ts` already stands one up and only has to count.

## `apps/game/src/main.ts` is at the 250-line ceiling exactly

- **Found:** 2026-09-21, claude/queue-the-stage-is-sized-from-a-number-the-address-bar
- **Files:** `apps/game/src/main.ts`, `apps/game/src/main-shell.ts`
- **Where:** local

It is 250 lines against a limit of 250 (`packages/sim/test/limits.test.ts`), so
the next lane that adds a line to it gets a red check for a reason that has
nothing to do with its own work. This lane already paid that: three lines of
comment at the `bindViewport` call site had to come down to one, and the one
that survived is the shortest true sentence rather than the clearest.

Nearly all of the file is a knot of prose and one call each, which is what it
is for — so the split is by subject, not by size. `main-shell.ts` next door is
the pattern: it took the shell's wiring out whole. The two candidates left are
the same shape, and either is enough on its own:

- the frame's parts — `bindAudio`, `bindHaptics`, `beatPhase`, `startFrames`'s
  argument object;
- the world's opening — `cfg`, `createWorld`, `startTogether`, `playAt`,
  `createWaveProgression`.

## `loadedTimeout`'s figures were measured once and the tree has grown past them

- **Found:** 2026-09-21, claude/queue-nothing-keeps-the-screen-awake-and-a-long-hold-l
- **Files:** `tools/test/repo-time.ts`, `tools/test/doc-drift-names.test.ts`, `tools/test/doc-drift.test.ts`, `tools/test/tree-walk.test.ts`, `tools/index/test/index.test.ts`

`bun run land` went red on `tools/test/doc-drift-names.test.ts` — *names
something this tree still writes down*, timed out — and the same file passed
in 1.4 seconds run alone a minute later. That is the failure `repo-time.ts`
was written to end, arriving through the one number the module cannot measure
for itself.

`loadedTimeout(idleMs)` scales a timeout by how loaded the machine is, and its
docstring says to pass *what the test costs when it is the only thing
running*. That test passes **120**. Timed here three times over its own body —
`declaredNames`, then `ownSubjectClaims` over every source file — it costs
**753, 803 and 870 ms** on an idle machine, over 1578 claims. Six point seven
times the figure it declares, so every timeout computed from it is six point
seven times too short, and the run that went red was given 32 seconds for
something that wanted more.

The figures were right when they were written. Nothing re-measures them, and
each one is a count of files the tree adds to every day — `tree-walk`,
`doc-drift`, `index` and this one all walk the whole of it. Two parts:

- Re-measure every `loadedTimeout` caller and raise the figure, the way this
  entry measured this one. There are twenty of them; the grep is
  `loadedTimeout(`.
- Then keep them honest, which is the half that matters. The cheapest version
  is `loadedTimeout` itself: it already knows `LOAD`, so it can compare the
  test's real duration against the figure it was handed and fail — or say so
  — when an idle run is more than, say, double it. A figure that drifts
  silently is a red landing every session learns to re-run, which is the habit
  `repo-time.ts`' own docstring names as the thing it exists to prevent.

## The tab's own pause is bound inside the test rig

- **Found:** 2026-09-21, claude/queue-nothing-keeps-the-screen-awake-and-a-long-hold-l
- **Files:** `apps/game/src/testing.ts`, `apps/game/src/main.ts`, `docs/working-with-claude.md`
- **Where:** local

`run.hold("hidden", document.hidden)` — the whole of "a backgrounded tab does
not play" — is registered by `bindTestControls`, in among the sliders and the
god-mode switch. It is shipped behaviour and it is not a test control: the
catch-up cap it protects (`loop.ts`'s `MAX_CATCH_UP_MS`) is in the shipped
loop, and the screen lock added on the same day re-asks for itself off this
hold and nothing else (`awake.ts`). Every one of those is a line in a file
whose docstring opens *the prototype's test rig*. Lift the two lines into a
file of their own — the name the rest of the app uses for this is a *hold* —
and let `main.ts` bind it beside the run state it is about.

The second half is what it does to a lane that verifies in the Browser pane.
**The pane's document reports `hidden` while the pane is not displayed**, so a
game opened in it is paused: the world never ticks, `world.tick` stays where it
was, and only the accident of a screenshot — which fronts the page for a
moment — lets it advance at all. That is how this was found: a wake lock that
should have been taken at load was not, and the reason was that the run had
never started. Anything a lane measures over time in that pane — a wave
watched at tempo, a beat counted, an animation's arc — is measuring a held
world. `docs/working-with-claude.md` says to verify with `bun run preview` and
says nothing about this; it should say it in the same paragraph, and name the
one way to tell (`document.visibilityState` in the page).

## Sixty-six player-facing lines still say ward, plate or guard

- **Found:** 2026-09-21, claude/queue-the-game-shows-a-player-four-words-for-one-thing
- **Files:** `packages/content/src/waves/act-2.ts`, `packages/content/src/waves/act-7.ts`, `packages/content/src/mechanics-handed.ts`, `packages/content/src/mechanics-worn.ts`, `tools/words/clean.ts`

The owner answered **shield** on 21 September 2026 and the rule went in the
same day: one row in section 3 of `.claude/skills/game-words` and a sixth
pattern in `tools/words/measure.ts`. The lane that added it rewrote what it
could hold in one sitting — the two waves of act 1, BULB QUEEN, and the two
strings in `apps/game` and `controls.ts` — and split the rest off here rather
than take a rule and a sweep in one commit.

What is left is **66 lines across 38 subjects**, all of them in acts 2 and up
and in the mechanics blurbs. `bun run words "<SUBJECT>"` names every one and
the rule it broke; the five files above are the ones with the most in them and
not the whole list — twenty files carry at least one. The three sanctioned
shapes are in the skill and there is no fourth: **put the shield under it**,
**move the shield there**, **trigger the shield**.

This is the one reason `CEILING` in `tools/words/clean.ts` went **up** on the
day the rule landed, 290 to 306, rather than down. Every line fixed here comes
off that number, and the lane that finishes the sweep lowers it to whatever
`bun run words --clean` then prints — at least the 16 that the new rule newly
failed. Add each subject to `CLEAN` as it goes green.

**The wave names `THE WARD` and `THE WARDEN` stay.** A wave name is a proper
noun, not the word a player reads for the object, and renaming one reaches the
director, the perf rows, the baselines and `docs/spec/`. `warden` is already
outside the pattern's boundary; `THE WARD` is matched by it and is the one
place a lane should read the finding and leave the line alone.

## THE SURGE prints SHIELD across the rock it just spat

- **Found:** 2026-09-21, claude/queue-unverified-at-be40d473-the-picture-of-the-rock-c
- **Files:** `packages/render/src/surge-word.ts`, `packages/render/src/boss-cue-draw.ts`, `packages/render/src/boss-cue-field.ts`
- **Where:** local

Found by photographing the thing an unverified landing had left unlooked at,
and the rock's own picture is fine: it leaves the bulb's underside and by the
next beat it is a clear body with a flame trail under the boss, in the right
column. What is wrong is the word on top of it.

`surgeWord` returns `WARD` — `{ kind: "PRESS", word: "SHIELD" }` — on the
pilot's **grip mark**, which is anchored to the bulb. The rock is spat from
`surgeBulbRow(s, cfg) + 1`, the row directly under the bulb, in one of the
columns the bulb covers. So the one word the pilot has to read is printed into
the one place the body he has to answer arrives in: at the spit beat the
label's plate sits across the rock and the rock's own highlight eats two of
its glyphs, and it reads `SHIE D`.

The navigator's mark on the same bulb has the second half of it: `PRESS` is
drawn over the seam, and the seam's black rule goes straight through the word.

Both are anchoring, not art. Either the word moves off the covered columns
while `surgeWarding` is true, or the grip mark's label goes above the bulb
rather than below it — the mark itself must stay where the thumb is. A frame
at the spit beat is one command:

    bun run frames . --wave "THE SURGE" --boss-json '{"notches":2,"heldP1":true,"heldP2":true}' --until surgeRock --seat p1

**A look, so it is offered and not replaced** unless the third exemption is
taken in the commit: a word printed over the body it names is wrong rather
than unlovely, which is the same family as a highlight glued to a spinning
rock (`docs/looks.md`).

Also here, because it is one line in the same file: the constant is still
called `WARD` after the word it carries became `SHIELD`. `guard` is the
sanctioned code id for this control (`CLAUDE.md`), so `WARD` is neither the
player's word nor the code's.

## Nothing checks the words `packages/render` draws on a playing screen

- **Found:** 2026-09-21, claude/queue-unverified-at-be40d473-the-picture-of-the-rock-c
- **Files:** `packages/render/src/balance.ts`, `packages/render/src/boss-cue-read.ts`, `packages/render/src/boss-cue-read-o.ts`, `tools/words/text.ts`, `.claude/skills/game-words/SKILL.md`

The owner settled **shield** on 21 September 2026 and it became a row in
`tools/words/measure.ts`, so a wave guide that says ward now fails a test.
Three player-facing strings are outside that check and still say the old
words:

- `balance.ts:150` — `{ label: "WARDS", tally: s.wards, empty: "no rock reached you" }`, a
  column heading on the sheet a pair reads after every wave.
- `boss-cue-read.ts:224` — `markAt(1, "PRESS", "GUARD", …)`, a word drawn on the field.
- `boss-cue-read-o.ts:156` — `markAt(1, "PRESS", pull ? "PULL" : "GUARD", …)`, the same.

The check's reach is stated in section 1 of `.claude/skills/game-words`: it
covers `packages/content` and holds the six strings in `apps/game` by hand,
because `tools/words` imports `@neon-spore/content` and importing further
would pull in the DOM. That was written when the vocabulary was five rows of
words no on-field mark used. A mark is the shortest, loudest text in the game
and it is the text with the least room to be a second word for one thing.

Two halves, and the first does not need the second: change the three strings,
then decide whether `playerText()` can reach a `MARKS` table without importing
a canvas — the marks are string literals at call sites today, which is why a
grep found them and a test cannot.

## `--hold surgeBulb` puts no thumb on THE SURGE's bulb

- **Found:** 2026-09-21, claude/queue-unverified-at-be40d473-the-picture-of-the-rock-c
- **Files:** `tools/frames/hold.ts`, `tools/frames/hold-targets.ts`, `packages/sim/src/surge-hand.ts`
- **Where:** local

`tools/frames/hold.ts` documents the two by name:

    --hold surgeBulb=0              THE SURGE: the pilot's thumb on the bulb
    --hold surgeBulb2=0             and the navigator's, on the same bulb

Both together fire no `surgeGrip` and no `surgeRock` in 3000 ticks. The same
state reached with `--boss-json '{"notches":2,"heldP1":true,"heldP2":true}'`
spits a rock on the first beat, so it is the hold and not the boss.

`surgeHeard` takes `{ kind: "drag", target: "surgeBulb", on: true }` and
refuses it while the bulb is everting, while it re-seals from a burst, or if
that seat is already holding — none of which is the case at a wave's opening.
So the command the hold builds is arriving wrong, or not arriving: start by
printing it, and `tools/director/src/boss-hands-handles.ts:108` is the same
drag built somewhere that works (`fromMilli: 0`, which the hold may be
omitting).

A documented flag that silently does nothing is worse than a missing one: the
lane that hit this spent fifteen minutes proving the boss was fine before
suspecting the tool, and the recipe it ended up with is now written into two
other entries because the flag cannot be trusted.

## A hanging part is drawn over the socket of the row below it

- **Found:** 2026-09-21, claude/queue-unverified-at-5780141b-the-picture-of-a-carried
- **Files:** `packages/render/src/scuttle-shape.ts`, `packages/render/src/scuttle-draw.ts`, `packages/render/src/scuttle-grip.ts`
- **Where:** local

THE SCUTTLE's frame is three rows of sockets `ROW_PITCH = 0.42` tiles apart,
and a loose part slides `HANG_DROP = 0.55` tiles down its thread over the
cadence (`scuttle-shape.ts`). 0.55 is more than 0.42, so from the second half
of every cadence a part off row 0 or row 1 is drawn **through** the socket
directly beneath it and comes to rest 0.13 tiles past its centre.

The grip ring makes it worse rather than showing it: `handleRadiusMilli` is
300, so a circle of 0.3 tiles is drawn round the sliding part, and a socket is
`SOCKET_HALF_H = 0.16` tall — the ring swallows the socket below whole. The
pilot is the one seat shown every socket and every hanging part, and counting
what is still attached is his whole job in this fight
(`showsScuttleCount`), so the two plates he has to tell apart are the two
this draws on top of each other.

Watched at tempo on the pilot's screen:

    bun run frames . --wave "THE SCUTTLE" --seat p1 --events --ticks 390

The capture prints the socket now, so the hold can be aimed at it:

    bun run frames . --wave "THE SCUTTLE" --seat p1 --events --ticks 360 --hold scuttlePart=1000,id=5

**It is a look and it is offered, not replaced.** The drop is one constant and
the pitch is another, and either of them moving changes what a frame of the
running game draws: it goes to `tools/versus/candidates/`. The third exemption
(*a fix to something wrong rather than unlovely*) is arguable here — a shape
sitting on a shape it has nothing to do with — and the argument is the owner's
to make, not a lane's.

## `--boss-json` cannot write a list the boss does not already hold

- **Found:** 2026-09-21, claude/queue-unverified-at-5780141b-the-picture-of-a-carried
- **Files:** `tools/frames/boss-install.ts`, `tools/frames/boss.ts`, `tools/frames/test/boss-flag.test.ts`
- **Where:** local

`boss-install.ts` refuses a list whose length differs from the field's: *that
field holds 0, and 1 came*. The rule was written for THE BATON's thread and
THE TASTER's blades, which are fixed-width — but the states most worth
photographing are the ones a boss **grows**. THE SCUTTLE's `loose` is empty
between throws and holds one or two during them, so

    --boss-json '{"loose":[10],"live":10,"swung":-1,"swungCol":-1}'

is refused outright, and the one state that boss's whole handle lives in
cannot be written at all. Worked around by driving the wave to its own
`scuttleLoose` and reading the socket off `--events`, which costs two runs and
only works because the draw is seeded.

What to decide: whether the length check is right for every list or only for
the fixed-width ones. A field whose length the simulation varies is not a
shape the flag can check against, and the honest options are a per-field
allowance, a check against the field's *element* type instead of its length,
or leaving it and saying so in the refusal — which today reads as a bug in
the caller rather than as a rule.
