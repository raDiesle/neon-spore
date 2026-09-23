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

**The `Taken:` line outlives every branch, and that is a shape of stuck.** The
line is the half that reaches a clone, so `claimOn` falls back to it when no ref
matches — and a fallback with nothing behind it never expires. On 21 September
2026 three entries read BUSY with nobody on them: marked from the main checkout,
so the mark named `main` as the branch doing the work, and `main` is a ref that
never goes away. `tools/queue/lapsed.ts` says so out loud. An old mark with no
live branch behind it — not the trunk, not a day old yet — prints as **lapsed**
under the entry, and `status` counts them in a line of its own. It is still
taken: a missing ref is exactly what a live cloud claim looks like from here, so
nothing is ever released for one. The line ends in the sentence that does it,
`bun run queue release "<title>"`, and a session reads it and decides.

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

`- **Where:** phone` is the same fact one notch narrower, and it is the third
value: work that needs **hardware**, not just a screen. A real phone browser's
own chrome eating the foot of the field is the entry that earned it — the
address bar and the bottom toolbar are drawn by the shell *around* the page,
so no frame this repo can render will ever show them, headless or not. An
agent cannot finish that one wherever it is running. `next` with no argument
passes such an entry over **on every machine**, the listing marks it
`PHONE ONLY`, and — this is the whole of the difference from `local` — **a
caller who names it still gets it**: `queue take "<title>"` and `next <n>` hand
it over to a local session as usual, because the owner has the hardware and
asks for these by name. A sandbox naming one is refused, with the hardware as
the reason.

The value exists because of what happened without it. On 22 September 2026
`next` picked the phone-chrome entry five times in one sitting and was given it
back five times, each give-back a commit on the trunk saying nothing, and a
session told *continue to work on the queue* could not get past it without
knowing `queue take` exists. That is `asking.ts`'s story repeated with
different hardware, and it has the same shape of fix: **only the automatic pick
skips.**

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
past a free entry. The others say what it is not: a `Where: local` line refuses
— this machine cannot do that work at all — a `Where: phone` line says no
machine can, and an unanswered `Asks:` waits on a sentence from the owner. None
of them can say **this one is fine, but not yet**.
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
`tools/queue/test/needs.test.ts` holds the wait, and
`tools/queue/test/skipped.test.ts` holds the listing's count of the entries
`next` stepped past and why.

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

## Unverified at 424e7fc4: a real phone browser's own chrome eating the foot of th…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `tools/director/src/director-columns.css`, `tools/director/src/director-phone.css`, `tools/director/src/rail-open.ts`, `tools/director/test/phone-game.test.ts`, `tools/director/test/rail-open.test.ts`
- **Where:** phone

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
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-orrery.ts`, `packages/content/test/scene-orrery.test.ts`
- **Where:** phone

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

## THE CAIRN's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-23, claude/task-queue-work-e21054 (claim: claude/queue-the-cairns-picture-looks-like-something-real)
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
- **Files:** `tools/test/repo-time.ts`, `tools/test/doc-drift-names.test.ts`, `tools/test/doc-drift.test.ts`, `tools/test/tree-walk.test.ts`, `tools/index/test/index.test.ts`, `packages/sim/test/copies.test.ts`
- **Seen again:** 2026-09-21, claude/queue-twenty-handles-are-heard-by-the-simulation-and-d — `bun run land` went red on `packages/sim/test/copies.test.ts` (*every other file calls clearHolds instead of re-deriving it*, timed out, 2 shards of 73), and the same file ran 121 pass in **797 ms** alone a minute later. It declares `loadedTimeout(205)` and walks every source file in the tree, so it is the same drift as the one below in a second package. The lane re-ran `land` and it went green, which is exactly the habit this entry exists to end.

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

What is left is **47 lines** on 23 September 2026 (66 when this was filed; the
acts 1 to 3 guides and the DEMOS rewrites took the rest), all of them in acts 4 and up and in the
mechanics blurbs. **Not every plate is the shield**: THE WARDEN's plates are
the boss's own rim, and that rewrite said *piece* there — read what the word
points at before putting *shield* in its place. `bun run words "<SUBJECT>"` names every one and
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
- **Asks:** May a boss's list field be written at a length the simulation did not stand it up with?
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

THE LEDGER's `beads` is the same field again and a harder case, because it is
empty until the pair *shoots*: a return only exists once a bolt has gone up
the seam's column in the colour it is showing. So no frame of the pilot's ring
on a return could be posed at all, and the handles lane took it by firing —
`--boss seam=2 --press 300:1:cannonCol=6 --press 306:2:fire=cyan`, with the
seam's column worked out in a probe first (22 September 2026).

THE SCOUT's `carrying` is the third, and the one that shows what the rule
costs. It starts empty and grows a mote at a time as the ship is flown, and
both of that round's handles are gated on how many are aboard — laden past
`scoutLadenMotes`, heavy past `scoutHeavyMotes`. So the only length the flag
will write is the one where neither ring exists. The lane that wanted those
two pictures took the other road instead (*`--press` knows no scout verb*, 22
September 2026): `--press` learned the pilot's three, and a flight recorded
off a headless autopilot now puts four motes aboard and photographs the laden
ring. It works, and it costs minutes of a lane per picture, and it only
reaches states a flight can reach — the heavy ring needs five motes, which
only the second arena has, and that arena is what *THE SCOUT's second arena
leaves the scout nowhere to stop* is about. So it is unphotographed today.

THE UNDERTOW's `breaches` is the fourth. It is empty until a plate parts, so
no lobe — the one vulnerable thing in that fight — can be posed; the lane that
gave the lobes their material (23 September 2026) found standing ones by
probing a no-press run for the ticks they come up at (750–825, 1575), and a
**tall** lobe or the body's last pass never comes up at all without play, so
both were proved by the frame tests alone and never seen by an eye.

What to decide: whether the length check is right for every list or only for
the fixed-width ones. A field whose length the simulation varies is not a
shape the flag can check against, and the honest options are a per-field
allowance, a check against the field's *element* type instead of its length,
or leaving it and saying so in the refusal — which today reads as a bug in
the caller rather than as a rule.

## THE HIVE's rehearsal says FIVE SCARS with four on the mass

- **Found:** 2026-09-21, claude/queue-the-hives-rehearsal-film-clenches-twice-and-teac
- **Files:** `packages/content/src/scenes/the-hive.ts`, `packages/content/test/scene-pages.test.ts`
- **Where:** local

The page at tick 1980 reads `FIVE SCARS · FOUR TO GO`. Tick 1980 is beat 33,
and the fifth seal is `seal 2 left 4 @36` — beat 36, tick 2159
(`test/scene-hive.test.ts` holds the whole sequence). So for the first 179
ticks the page is up it is standing in front of **four** scars, and the number
it names arrives a second and a half later. It is true for the rest of its run
and nothing catches it: a page is checked for spacing and for the seat that
reads it, never against the world the frame behind it is in.

Two things to do, and the second is the one worth the lane. Move the page to
2160 or later, or write the count it is actually in front of. Then give
`scene-pages.test.ts` the check that would have caught it: a page that names a
number can be made to say which field of the world it is naming, and the run
the test already does can read that field at the page's own tick. The other
films name counts too, and nothing has ever read one back.

## No film holds THE HIVE's lobe from the navigator's seat

- **Found:** 2026-09-21, claude/queue-the-hives-rehearsal-film-clenches-twice-and-teac
- **Files:** `packages/content/src/scenes/the-hive.ts`, `packages/render/src/guide-hand.ts`, `packages/render/test/hive-frame.test.ts`
- **Where:** local

The boss has two gestures and the rehearsal now shows one of them. The pilot's
haul is authored (`{ tick: 2766, drag: "hiveLobe", ... }`) and the ghost thumb
rides the mass down. The **wring** — the navigator's pinch on a swelling site,
the same `hiveLobe` target read the other way (`sim/hive-hand.ts`) — is in no
film at all, so `handleThumb` returns null for seat 2 and there is nothing to
draw. `render/test/hive-frame.test.ts` already proves the *handle* is drawn on
her screen and nowhere else; what is missing is a film that puts a hand on it.

There is no room inside THE HIVE's thirteen pages — the twins' two are 180
ticks apart already — so this is a page cut somewhere earlier in the film, or
a second short scene. Either way it ends with `handleThumb` answering for seat
2 and a test beside the haul's that says so.

## SNAKE's MAW lobe lights as live in the two grips that refuse it

- **Found:** 2026-09-21, claude/queue-the-snakes-two-handles-are-heard-and-drawn-nowhere
- **Files:** `packages/render/src/snake-button.ts`, `packages/render/test/snake-frame.test.ts`
- **Where:** local

`snakeHeard` refuses the `snakeMaw` press outright once the body is past
`snakeGorgeTiles` — "the jaws stick and the press is a dead button" — and from
there the mouth is opened by the drag on the neck instead (`snakeJaws`,
`sim/snake-controls.ts`). The lobe does not know: `drawSnakeLobe` calls the
face live on `round.phase === "play"` alone, so through the whole of `gorge`
and `shed` player 1 has a button drawn exactly as it is drawn when it works,
and pressing it does nothing at all. It is the same class of defect the
handles lane exists to fix, the other way round — a control drawn where it is
not answered, rather than answered where it is not drawn.

The rule is one call away: `snakeGrip(world.cfg, round) === "crawl"` is the
whole of what `live` should also ask for the maw face (not for FIRE, which is
refused by its own rest and already shows it). It is one expression in
`drawSnakeLobe` plus a case in `snake-frame.test.ts` saying the face is dead
under `gorge`. The head on the face should still show the gape, since the mouth can
still be open — what changes is the halo and the fill that say *press me*.

## No frame of THE SCOUT can be taken with a mote aboard

- **Found:** 2026-09-22, claude/queue-the-scouts-two-handles-are-heard-and-drawn-nowhere
- **Files:** `tools/frames/press.ts`, `tools/frames/press-command.ts`, `tools/frames/boss-install.ts`
- **Where:** local

THE SCOUT's whole round is a flight, and `bun run frames` cannot fly it. The
two holds that do the flying — `scoutTurn` and `scoutBurn`, the pilot's crank
and his reach button — are not in `PRESS_KINDS`, so `--press 300:1:scoutBurn`
comes back *unknown control* with the twenty names it does take. And the load
cannot be posed round the flight either: `carrying` is a list, and
`boss-install.ts` refuses a list of a different length by design, so
`--boss-json '{"carrying":[0,1,2,3,4]}'` answers *that field holds 0, and 5
came*.

Between them that is **every state this round has past the first beat**. The
lane that drew the two handles could not photograph either ring — both are
gated on the load — and the director's STATES sheet has had `laden` and
`heavy` on `OWED` since 18 September 2026 for the same reason, written there
as *no hand flies the little ship to a mote*. A round the tools cannot reach
is one every future lane argues in words.

Two pieces, and the first is the small one. **`scoutTurn` and `scoutBurn` in
`PRESS_KINDS`**, with a value that says which way and whether it is down —
`scoutTurn=left`, `scoutTurn=off`, `scoutBurn=on` — beside `pulseStep`, which
is the nearest thing already there; `seatsOnPanel` finds both on the pilot's
panel without a table. **Then a flight worth typing**: the autopilot in
`packages/content/test/scout-flight.test.ts` banks all four of the first
arena in twelve beats, and what it emits is a press line of dozens — so the
useful shape is one flag that says *fly to the nth mote and stop*, not a
person spelling the line out. Prove it with one frame of a laden ship with
her ring on it.

## A lane that retitles its own entry cannot claim it again

- **Found:** 2026-09-22, claude/queue-the-ledgers-four-handles
- **Files:** `tools/queue/claim.ts`, `tools/queue/mark.ts`, `tools/queue/test/queue.test.ts`
- **Where:** local

`bun run queue take` derives the claim branch from the entry's **title**, and
an entry that has been narrowed as its lanes land — *Nine handles…* to
*Two handles…* — no longer derives the branch the earlier lanes made. The
stale branch is still in the tree, so `heldElsewhere` finds a branch nobody is
on, decides the item is taken and refuses the lane that is standing in it.
Worked around with `release` and then `take`, which is two commands and a
moment of thinking the queue has lost track of itself.

What to decide: whether the branch should be derived from the title at all. A
claim that survives a retitle has to be written down rather than computed —
the `Taken:` line already carries the branch name, so the cheap fix is to read
it there and derive only when it is absent, which is also what makes a claim
survive the next narrowing.

## `ledgerPullable` refuses a case it can never be given

- **Found:** 2026-09-22, claude/queue-the-ledgers-four-handles
- **Files:** `packages/sim/src/ledger-gates.ts`, `packages/render/test/ledger-pull.test.ts`
- **Where:** local

The last of the four refusals — *never onto a beat another return already
lands on* — cannot fire. The bead it is asked about is `ledgerNext`, which is
the **minimum**-beat return on the cord; the beat it would be hauled onto is a
beat earlier still, so no other bead can be standing there. The handles lane
wrote a test for it, found the case unreachable, and left the guard alone
because a gate is not a place to be clever.

What to decide: whether the guard is dead or the rule is wrong. If two returns
were ever meant to be able to share a beat, something else is missing; if they
were not, the line goes and its paragraph with it. Either way the argument in
`ledgerPullable`'s own comment — *the root slides between two landings* — is
today describing a thing that cannot happen.

## Two bosses say their picture is not built, under a paragraph saying it is

- **Found:** 2026-09-22, claude/queue-seven-bosses-draw-a-dim-ring-that-nobody-has-loo
- **Files:** `docs/spec/bosses.md`, `docs/spec/interludes.md`
- **Where:** local

THE VANE's section (bosses.md §11.5) and SNAKE's (interludes.md) still
carry a **What is not built** (sim lane, 18 September 2026) paragraph saying *the picture* is missing — no ring answers `vaneArm` or
`vaneHousing`, nothing marks SNAKE's tail as a thing a thumb may take hold of,
the events are on the silent lists — and in both the paragraph directly under
it is a dated one saying both rings ship and naming the file that draws them.
A reader gets the contradiction in two paragraphs. THE THROAT's copy of the
same staleness was corrected in the lane that found this (its claim that
`bun run frames` cannot set a boss's own fields was wrong: `--boss` does), and
the other two were left because checking each clause is its own reading —
whether the events are still silent, whether the arm is still drawn off the
cycle, whether the director's `OWED` cards are still owed.

The work is: read each clause of the two paragraphs against the tree, cut what
now ships, and leave what is genuinely still missing under a heading that says
what remains rather than *the picture*. The *Never watched at tempo* sentences
stay — nobody has watched either at tempo.

## A second candidate in a slot writes the first one's geometry again

- **Found:** 2026-09-22, claude/slow-window-visual-candidates-c2e19d
- **Files:** `tools/versus/take-function-fs.ts`, `tools/versus/decide.ts`

`adopt` moves the files in the winning candidate's own directory and nothing
else — `take-function-fs.ts` reads that directory's `index.ts` and its
siblings, and a file one level up is not in the plan. So a candidate that
imported a shared helper out of its directory would land broken, and the only
safe thing to do is copy the helper in. The `slow:window` slot carried three
candidates answering the same two questions — where the thing being slowed is
on the layout, and how far up the look has faded — in a byte-identical file
written out three times; the slot was settled before anything shared it.

The work is one of two: let the plan follow a relative import out of the
candidate's directory when the file it reaches is still under the slot, and
move it in too; or give a slot a directory of its own for shared helpers that
`adopt` knows to copy from. Either ends the rule that a second candidate in a
slot pays for the first one's geometry again. Until then every slot with more
than one candidate carries the same duplication, and a fix to one copy is a fix
to one copy.

## `--press` with `--frames` refuses a press the filmstrip would have caught

- **Found:** 2026-09-22, claude/queue-press-knows-no-scout-verb-so-the-scouts-two-ring
- **Files:** `tools/frames/flags.ts`, `tools/frames/spec.ts`, `tools/frames/test/flags.test.ts`

The guard in `flags.ts` that refuses a press landing after the picture compares
each press's tick against `spec.ticks` alone. With `--frames` and `--stride`
the run does not stop at `ticks`: it takes `frames` pictures `strideTicks`
apart, so the last one is at `ticks + (frames - 1) * strideTicks`. A press
inside that span is refused with a message naming a number the run never
stopped at:

    --ticks 400 --frames 8 --stride 120 --press 300:1:scoutTurnLeft=6,900:1:scoutBurn=10
    --press: a press at tick 900 is after --ticks 400, so the picture is taken
    before it lands. Raise --ticks, or move the press earlier

The last frame there is tick 1240 and the press at 900 is four frames inside
it. The lane that hit this wanted a filmstrip of THE SCOUT's flight — the one
capture a press line most wants, because a flight is a thing you watch go
wrong somewhere — and photographed six separate single frames with the press
line hand-truncated for each instead.

The fix is the last frame's tick rather than `spec.ticks`, in both branches of
the message, and the same arithmetic `capture.ts` already does to know when to
stop. `--until` is the other half: there the cap is already the right number.

## `bun run index` adds a row for a new file but never refreshes one that changed

- **Found:** 2026-09-22, claude/wave-lost-screen-redesign
- **Files:** `tools/index/`, `docs/INDEX.md`, `tools/index/test/index.test.ts`

The lost screen's redesign rewrote the headers of `lost-shut.ts`,
`lost-look.ts` and `lost-answer.ts`. `bun run index` picked up the three new
files and wrote correct rows for them, and left all three changed files
describing what they used to draw — `lost-shut.ts` still said its cut was a
vertical slot after the slot had gone. The rows had to be edited by hand and
the generator run again over the top.

So the generator only ever *adds*. That is the wrong default for a map whose
whole job is to be trusted before a file is opened: a row that was right once
and is wrong now is worse than a missing row, because nothing about it looks
stale. A lane has no reason to suspect a row it did not touch, and the file is
loaded by name in `CLAUDE.md`'s own instruction to read it first.

The work is to make a regenerate actually regenerate: recompute every row from
the file it names, not just the rows with no file yet. The one thing to be
careful of is a row somebody wrote better than the generator would — if there
are any, find them first and decide whether the summary is derived or
hand-held, because a blind rewrite would flatten them. A test that changes a
header and asserts the row moves is the proof.

## The replay settles four generated files and not the fifth, `registry.ts`

- **Found:** 2026-09-22, claude/wave-lost-screen-redesign
- **Files:** `tools/land/replay.ts`, `tools/versus/candidates/registry.ts`, `tools/land/test/`

`replay.ts` names three conflicts it settles for itself — `docs/queue.md`,
`docs/INDEX.md`, `docs/time-log.md` — plus `docs/release-notes.md` for the
trunk's own rebase. `tools/versus/candidates/registry.ts` is the same kind of
file and is not in the list: it is generated by `bun run versus index` from the
directories under `candidates/`, nobody writes it by hand, and any two lanes
that add or drop a candidate in the same hours conflict on the one array it
holds. That is what stopped this landing. One side had dropped the four
`lost-screen` candidates, the other had added three `slow-window` ones, and the
merge git produced imported four directories that no longer exist — which
typechecks as a missing module and nothing subtler.

The work is a fifth resolver, and it is the `INDEX.md` shape exactly: write the
trunk's copy out, run the generator over the directories the rebase has already
put on disk, and return what it wrote. No hand-merging of the array, because
the array is not the state — the directories are, and after the rebase they are
already correct.

Worth checking in the same sitting whether anything else generated is missing
from the list: `docs/INDEX.md` and this are the two a lane touches without
meaning to, but `tools/director/src/versus-pose.ts` is written by the same
`versus` command and survived only because both sides happened to agree.

## `packages/sim/src/step.ts` is at 234 lines with a boss still to add

- **Found:** 2026-09-22, claude/queue-the-gimbal-is-written-and-nobody-has-built-its-s
- **Files:** `packages/sim/src/step.ts`, `packages/sim/src/boss-hands.ts`

The 250-line ceiling is sixteen lines away and the file grows by two or three
every time the field gains a handle. `boss-hands.ts` was already cut off it
along the seam the file's own comments had drawn seven times — a boss's thumb
heard on the tick — and what is left is the field's own handles in the order
they run, plus the tick loop around them.

The next cut is the same seam read once more: the **field's** handles (the
string, the rope, the cord, the grip, the crank, the ring, the arrows, the
balloons, the sinew) into a `field-hands.ts` called where the block stands, so
what remains in `step.ts` is the loop and the order. Do it now rather than
under a lane that needs the two lines, which is how `boss-others.ts` came to
be split mid-boss this week.

## The chain THE INSTAR hangs from is measured in two places

- **Found:** 2026-09-22, claude/slow-window-visual-candidates-c2e19d
- **Files:** `packages/render/src/instar-draw.ts`,
  `packages/render/src/slow-intake-aim.ts`

`drawSegments` stands the four plates on a line from `instarAt(l, 500, 0).x`,
`l.gridTop - l.tile * 1.3` down to the head, and it is private to
`instar-draw.ts`. `slow-intake-aim.ts` needs the same two numbers — the light
round the boss is kept off the *whole* body, chain included, by a capsule along
that axis — so it writes them again. Re-hang the chain and the light starts
crossing the top plate, with nothing red to say so.

Export the anchor from `instar-shape.ts`, where the rest of the body's geometry
already lives — `instarChainTop(l): Point` — call it from both, and add a row to
`packages/sim/test/purity.test.ts`'s table of rules that must be called rather
than re-derived.

## Two render frame files fail under `bun test` and pass on their own

- **Found:** 2026-09-22, claude/slow-window-visual-candidates-c2e19d
- **Files:** `packages/render/test/queen-frame.test.ts`,
  `packages/render/test/ship-hand-frame.test.ts`,
  `packages/render/test/frame-harness.ts`

`bun test` in one process reported both red, at 227 s and 74 s against
`FRAME_TIMEOUT_MS`; each runs green in 0.4 s alone and green under `bun run
test`'s shards. So it is contention, not a picture — but `bun test` is the
command CLAUDE.md offers for one file or one package, and a session that runs
it whole is handed two failures that mean nothing. `check:fast` showed the same
shape once: `tools/test/doc-drift-names.test.ts` timed out in a shard and passed
in 2 s on its own.

Find what the single process is holding on to — the canvas stub's globals are
installed per file and the harness is evaluated once — and either free it or
give the frame files a cap that survives a loaded machine. Whichever it is,
`bun test` whole has to be a command whose red means something.

## The touch layer guesses the ship's skin, because a `Field` cannot see the hull

- **Found:** 2026-09-22, claude/damage-flash-sync-and-wound-together
- **Files:** `packages/render/src/creature-under.ts`, `packages/render/src/touch-field.ts`, `packages/render/src/landing.ts`, `packages/render/test/touch.test.ts`

A body's landing beat now ends resting in the plating rather than under the
membrane at the hull row's centre (`landing.ts`), and the picture asks the
*lobed* membrane for that rest: `skinSampler` over the frame `canvas2d.ts`
builds, so a body lands on whatever swelling stands over its column. The hit
test has no such frame — `Field` is a shape, deliberately without a world or a
hull — so `creatureAt` passes `() => l.hullY`, the flat baseline, and answers a
landing body a lobe's height away from where it is drawn. Under the cannon's
crown that is the largest the disagreement gets, and the crown is exactly the
column a pair is most often aiming at.

The work is a `skinY` on `Field`, required and stated the way every field on
that interface is, written at the one place the field is built (`input.ts`) from
the sampler `canvas2d.ts` already makes, and threaded to `creatureAt` in place
of the guess. It is not two lines: every `Field` literal in the render tests
takes a new member, which is what makes it a sitting of its own rather than a
paragraph in the lane that found it. The proof is a test that puts a slick on
the hull row under a raised lobe and asserts the thumb finds it at the pixel the
field pass draws it at.

## `strokeGlow`'s `intensity` does not fade the line, only the glow around it

- **Found:** 2026-09-22, claude/lost-wound-with-the-plates
- **Files:** `packages/render/src/glow.ts`

`strokeGlow(ctx, path, colour, width, intensity)` scales the alpha of its glow
passes and then lays the core stroke down at `globalAlpha = 1` whatever it was
told (`glow.ts`, the line after the loop). That is right for a lit thing being
dimmed and wrong for anything fading *in or out*: at `intensity` 0 the shape is
still fully drawn. The lost screen's focus ring was found that way — it came up
at full strength over the open field on the first frame of an arrival it was
supposed to be fading through — and the fix there was to put the alpha on the
colour instead (`lost-wound.ts`), which is the working spelling and is spelled
nowhere in `glow.ts`.

The work is to sweep every `strokeGlow` call that passes an `intensity` off a
clock — a `t`, an `age`, a `shut`, a `fade` — and decide per call whether it
meant the glow or the whole stroke; the ones that meant the whole stroke take
the colour spelling. Then say so in `strokeGlow`'s own doc comment, which
currently says nothing about the core pass, and prove the distinction with a
test on a stub canvas that reads the alpha the last `stroke` was made at.

## `--until` can step back from an event and not forward to a rest after one

- **Found:** 2026-09-22, claude/lost-wound-with-the-plates
- **Files:** `tools/frames/until.ts`, `tools/frames/flags.ts`, `tools/frames/spec.ts`

`--until-back N` exists because half of what a capture wants *stands between*
two events, and it only covers the half that stands before one. The other half
is a screen that comes up a fixed rest **after** an event and is over in a
handful of ticks: the lost wave's own screen arrives about 150 ticks after
`waveFailed` and its whole arrival is 31 ticks long, so photographing it meant
four runs of `--ticks` bisecting for the window — which is the same half hour
`until.ts`'s own header was written to end.

`--frames` and `--stride` do count forward from the event, so the workaround is
a wide sweep and forty pictures to throw away; what is missing is the one
number. The work is the mirror of `back` — a forward offset on `UntilSpec`
taken in the same drive rather than in a second one, refused the same way when
it runs past the cap, and named so the pair read as a pair.

## The doubled window reached THE INSTAR alone

- **Found:** 2026-09-22, claude/instar-body-travels
- **Files:** `packages/content/src/instar-script.ts`, `packages/sim/src/config-hive.ts`,
  `packages/sim/src/config-claw.ts`, `packages/sim/src/config-scuttle.ts`,
  `.claude/skills/new-boss/SKILL.md`, `docs/spec/bosses-choreographed.md`

The owner asked on 22 September 2026 for the time a pair has to act to be
doubled and the need raised with it, and said in the same message that it is a
**generic specification for choreographed**. The lane that landed it could only
apply it where there is one figure to move: THE INSTAR is the only wave on
`BossSequenceStep`, so its five `windowBeats` and seven needs were doubled and
the rule was written into the skill and the spec sheet for the next boss
authored.

Every other boss with an authored window carries its own differently-named
figure — `hiveOpenBeats`, `tasterWindowBeats`, `scuttleThrowBeats` and the
rest, one per boss across the `config-*.ts` files — so there is no single
number and no sed. The work is to decide which of them are choreographed in
the owner's sense (a window the pair is asked to act inside, not a body that
merely takes a while), double each one's window, raise the count beside it, and
move the tests that assert the old figures. A boss whose window is not a window
the pair acts in is named in the commit as left alone and why.

**The same lane carries the second half of that rule**, filed 22 September
2026 from `claude/slow-spans-the-window`: a step's window *is* THE SLOW, opened
when the action is asked for and shut the tick it succeeds or fails
(`docs/decisions.md` #33). THE INSTAR does this now; every boss above whose
window turns out to be one the pair acts inside wants `openSlow` moved to the
ask and `closeSlow(world)` on both exits, and the plain `openSlow` it has today
kept only where the moment asks for nothing — a death, a fall, an arrival. The
two halves are one decision per boss, which is why they are one item.

## `bun run sheet` sheets frames an earlier capture left behind

- **Found:** 2026-09-22, claude/touch-is-the-damage
- **Files:** `tools/frames/sheet.ts`, `tools/frames/run.ts`

A capture that wrote eight frames to `docs/frames/working/` was sheeted
immediately afterwards and the sheet said `10 frames`: the two extra were
`frame-08` and `frame-09` from a longer run earlier in the session, still in
the directory because `run.ts` writes over the frames it needs and removes
none. The sheet came back with two pictures of a screen from a different tick
range glued under the strip, which is the kind of thing a session reads as a
result rather than as leftovers.

Either end is a fix and only one is needed. `run.ts` can clear the frames in
its output directory before it writes, which is what a session does by hand
anyway; or `sheet.ts` can take the count from the run it is sheeting rather
than from whatever matches the prefix — the run already prints how many it
wrote. The first is smaller and closes it for every reader of the directory,
including a human looking at it in Finder.

## `drawOnShip`'s `held` is a structural type that grows with every hit look

- **Found:** 2026-09-22, claude/burst-on-contact
- **Files:** `packages/render/src/frame-on-ship.ts`, `packages/render/src/render-state.ts`

The pass takes its kept state as an inline object type — `fenceStrike`,
`gumSplash`, `bodyBurst`, `breachStrike`, `effects` — and its own doc already
saw this coming: *it was two of its fields and became three when the harpoon's
line arrived, which is the point at which a list of fields is worse than the
object holding them.* It is five now, and the fifth was added by this lane in
two places for one call.

Every one of those fields is a `RenderState` field and `RenderState` is what
the caller passes. The work is to take `RenderState` itself — `readonly` on
the parameter, so the pass still cannot write to it — and delete the literal.
What has to be checked first is whether any test or tool builds a `held`
by hand rather than handing over a whole renderer; if one does, it gets a
`RenderState` and the fields it cares about, which is shorter than the object
it builds today.

## `queue next` run a second time claims a second item

- **Found:** 2026-09-23, claude/queue-task-work-dd734e
- **Files:** `tools/queue/run.ts`, `tools/queue/prompt.ts`

`next` prints a prompt too long for a tool call's output, and the obvious way
to read the rest is to run it again and page it — which claims the next
free item, writes its `Taken:` line on `main` and pushes it, before the
session has read a word of either. This lane did exactly that and had to
`release` the second one, which is two commits on `origin/main` for nothing.

There is no command that prints an item's prompt without claiming it. The
work is a `bun run queue show <title>` that calls `promptFor` on a named
item and changes nothing — the prompt already has everything it needs from
the item and the refs — and a line in `next`'s own output naming it, so a
session that lost the prompt reprints it rather than claiming again. A test
in `tools/queue/test/` that `show` leaves the refs and `docs/queue.md`
untouched proves it.

## THE SPOOL's guide has no film

- **Found:** 2026-09-23, claude/queue-the-spools-brake-answers-no-thumb
- **Files:** `packages/content/src/scenes/`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`, `docs/spec/bosses.md`
- **Where:** local

THE SPOOL is drawn and its brake answers a thumb (`render/spool-grip.ts`,
§11.36's *The hands*), so there is a screen to rehearse and the reason the
wave sits on `STILL_PROSE` is gone. Write the rehearsal as
`.claude/skills/new-tutorial` says: the pilot takes the brake, the line runs
too fast, the navigator's gauge says *slower*, he carries the knob deeper and
a rib eases. Take `THE SPOOL` off `STILL_PROSE`, move the two counts in
`briefings.md` §3.2, and drop §11.36's *What is not built*.
`bun test packages/content` proves the counts.

## `queue next` prints a relative worktree path that nests inside a session's tree

- **Found:** 2026-09-23, claude/queue-the-spools-brake-answers-no-thumb
- **Files:** `tools/queue/prompt.ts`, `tools/queue/test/`

The prompt says `git worktree add .claude/worktrees/<name> <branch>`. Run from
a session that is itself in `.claude/worktrees/<session>/`, as the desktop app
starts them, that makes `.claude/worktrees/<session>/.claude/worktrees/<name>`
— a tree inside a tree. This lane removed it and checked the branch out in its
own tree instead. The prompt should print the path off the main checkout
(`git rev-parse --path-format=absolute --git-common-dir`, one level up), or
say to check the branch out in place when the session is already in a spent
worktree of its own. A test in `tools/queue/test/` on the printed path proves it.
## A shard outlives the runner that started it

- **Found:** 2026-09-23, claude/queue-the-other-choreographed-bosses-never-say-when-th
- **Files:** `tools/check/shard.ts`, `tools/check/fast.ts`

A `check:fast` sent SIGTERM left its `bun test` shard running, reparented to
launchd (PPID 1), still growing and still holding its slot's memory; nothing
reaped it but its own end. That shard was the 13 GB one — a canvas-stub log
left set by `surface-clear.test.ts` taking every path `briefing.test.ts`
drew, fixed in `canvas-stub.ts` by 73ce3ad0 — so an interrupted check can
leave the worst process of the run behind it. The work: `shard.ts` and
`fast.ts` forward SIGINT and SIGTERM to every child they spawned before they
exit, and a test in `tools/check/test/` spawns the runner on a sleeping shard,
signals it, and asserts the child is gone.

## `new-boss/SKILL.md` is one line under the ceiling

- **Found:** 2026-09-23, claude/queue-the-other-choreographed-bosses-never-say-when-th
- **Files:** `.claude/skills/new-boss/SKILL.md`, `.claude/skills/new-boss-more/SKILL.md`

It is 249 lines after §5 gained the `pair-call.ts` line, and the next boss
lane that adds a rule to it turns `bun run check` red
(`packages/sim/test/limits.test.ts`). §5's registrations list is the seam:
it is already mirrored by `new-boss-state`, so it can move there, or to a
new-boss/registrations.md, which the skill names in one line.

## A DEMOS row draws its mechanic id over the wave's name

- **Found:** 2026-09-23, claude/queue-the-demos-menu-puts-a-261-word-paragraph-on-a-bu
- **Files:** `apps/game/src/menu.css`, `apps/game/src/menu-pages.ts`

`#menu .wave` is `grid-template-columns: 26px 1fr`, a column sized for a
wave's number. The DEMOS page (`menu-pages.ts`, the `demos` loop) puts the
mechanic id in that span instead, and any id longer than four letters runs
into the label: `slick` over `firstStep`, `throb` over `theThrob`, `shell`
over `theThirdShot` in `bun run menu-shot out.png --page "TESTING > JUMP TO
ENEMY TYPE WAVE"`. The work: give the DEMOS rows a column that fits the
longest id (or `auto`), without moving the WAVES rows, and photograph both
pages. While there, check whether the label should read the wave's `name`
(`THE LEAD`) rather than its camelCase key (`theLead`), which is what it draws.

## A guide half's 220-character cap is held where `check:fast` never looks

- **Found:** 2026-09-23, claude/queue-twenty-six-wave-guides-in-acts-7a-to-7g-fail-the
- **Files:** `packages/render/test/briefing.test.ts`, `packages/content/test/waves.test.ts`

The two tests under "the guides the waves carry" in `briefing.test.ts` —
p1 is not p2, and each half at most 220 characters — read only
`WAVES[i].guide` and nothing render draws. A lane that edits guide text
changes `packages/content`, so `check:fast` runs content's own tests and
never reaches them; the 7a–7g words lane went green there and red inside
`bun run land`, two characters over on THE DIASTOLE. Move the two tests into
`packages/content/test/waves.test.ts` (or a `guides.test.ts` beside it),
leave `briefing.test.ts` with what it draws, and `bun run check` proves it.

## `act-8.ts` is four lines under the size ceiling

- **Found:** 2026-09-23, claude/queue-fourteen-wave-guides-in-acts-8-to-10-fail-the-wo
- **Files:** `packages/content/src/waves/act-8.ts`, `packages/content/src/waves.ts`

246 lines: a 128-line doc comment and six waves. The seam is the one act 7
already uses — THE WELL and THE HANDOVER, with the paragraphs of the comment
that are about them, move to `act-8b.ts`, and the wave index concatenates both.
`act-9.ts` (233) is next and splits the same way.

## The screen chooser's two card names say PILOT and NAVIGATOR

- **Found:** 2026-09-23, claude/queue-six-strings-a-player-reads-are-outside-the-words
- **Files:** `packages/content/src/screen-words.ts`, `tools/words/text.ts`, `.claude/skills/game-words/SKILL.md`
- **Asks:** Should the two cards read PLAYER 1 and PLAYER 2, or do PILOT and NAVIGATOR stay as the names of the jobs?

`.claude/skills/game-words` says no screen shows a player the word *pilot* or
*navigator*, and `SCREEN_WORDS.p1.name` and `.p2.name` are exactly those, in
capitals, on the menu. The words check does not see them because only the
`what` under each card is in its inventory. Either answer is small: **PLAYER 1
/ PLAYER 2** changes the two names and adds them to `text.ts` as `name`
entries, which the vocabulary rows then hold; **keep them** changes the two
table rows in the skill to say the menu's job names are the one exception.
The card's tag already reads P1 or P2, which is the argument for keeping a
job name beside it.

## The slab panel form has no user and goes

- **Found:** 2026-09-23, claude/queue-the-gauges-words-and-buttons-are-the-rounds-own
- **Files:** `packages/render/src/slabs.ts`, `packages/content/src/controls.ts`, `packages/content/src/control-sets.ts`, `packages/content/src/index.ts`, `packages/render/src/index.ts`, `packages/render/src/guide-thumb.ts`, `packages/render/src/caption-anchor.ts`, `apps/game/src/menu-controls.ts`, `packages/content/src/control-sender.ts`, `packages/render/src/band-lobes.ts`, `packages/content/test/control-sets.test.ts`

THE GAUGE's three were the last controls with `form: "slab"`; they are lobes
since 23 September 2026. What is left is machinery for a panel nothing
draws: `PanelForm`/`panelForm` and the `"slab"` member of `ControlDef.form`,
`slabs.ts` and its exports, the slab branches in `guide-thumb.ts` and
`caption-anchor.ts`, the `A SLAB` line of the controls page
(`menu-controls.ts` near line 177, and `apps/game/test/controls-page.test.ts`
line 79), and the comments in `control-sender.ts` and `band-lobes.ts` that
name it. `control-sets.test.ts` holds, for now, that every set is a band;
that describe goes with `panelForm`. *Slab* as a word for a drawn shape
(`nav-slab.ts`, the shell plates) is not this and stays.

## THE GAUGE stands on the ship's real hull

- **Found:** 2026-09-23, claude/queue-the-gauges-words-and-buttons-are-the-rounds-own
- **Files:** `packages/render/src/gauge-claw.ts`, `packages/render/src/gauge-round.ts`

The round's buttons are the band's lobes now, but the crest the claw hangs
from (`drawGaugeShip`, at `playHeight * 0.62`) floats above the band with
empty dark between them, so the claw and the buttons read as two things.
SNAKE draws the ship's own `drawHull` under its round; THE GAUGE doing the
same, with the claw standing on its crown and `gaugeDial` placed from the
hull's top, makes them one ship. A look, and the owner asked for it by name
(*fit the regular ship hull*, 20 September 2026) — the exemption carries over.

## `strokeGlow` under a scale draws its glow scale-times too wide

- **Found:** 2026-09-23, claude/queue-the-pulses-picture-looks-like-something-real
- **Files:** `packages/render/src/glow.ts`, `packages/render/src/living-skin.ts`, `packages/render/src/pods.ts`, `packages/render/src/ghost.ts`

`strokeGlow` divides nothing: its glow passes add `STROKE.glowSpread` (5)
straight onto the width, so a caller that has scaled the context and passes
`width / scale` gets a core stroke of the right size and three glow passes
`scale` times wider than meant. THE PULSE's sockets drew clouds twenty times
too wide for exactly this and were fixed by stroking in unit space
(`pulse-body.ts`). Still calling it under a scale: `living-skin.ts:148`,
`pods.ts:111` and `:150`, `ghost.ts:136`. Measure each caller's `scale`
first; where it is far from 1, give `strokeGlow` a `unit` argument that
divides the spread too, with a test that the widest pass is
`width + glowSpread` in pixels. It changes a frame on the field, so it lands
under "a fix to something wrong", with one before/after PNG.

## Six films are pinned to the zero shot grid and show no lay

- **Found:** 2026-09-23, claude/task-queue-work-e21054
- **Files:** `packages/content/src/scenes/the-third-shot.ts`, `packages/content/src/scenes/the-jam.ts`, `packages/content/src/scenes/the-candle.ts`, `packages/content/src/scenes/the-taster.ts`, `packages/content/src/scenes/the-antiphon.ts`, `packages/content/src/scenes/the-orrery.ts`

Each fell apart on the game's half-beat grid (`scene-grid.test.ts`) and now
carries `chargeBeats: 0`, the grid it was proved on. So in the game these six
rehearsals fire the instant a thumb lands, while every other film, and the
round itself, waits for the half-beat point. That is right, but it is not what
the round teaches. Retime each one for 0.5 the way THE HIVE was: each act
fifteen ticks before the departure it is for, pairs 60 apart. Then set
`chargeBeats: 0.5` and make its own `scene-*.test.ts` green on it. One
film is one lane; THE ORRERY and THE ANTIPHON are the long ones.
