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

SNAKE's `body` is the fifth. The round stands it up three tiles long, and its
grip is its length: `gorge` past `snakeGorgeTiles`, `shed` past
`snakeShedTiles`. So the MAW face going dark once the jaws stick (23 September
2026) was refused as *that field holds 3, and 7 came*, and was proved by
`snake-frame.test.ts` alone.

What to decide: whether the length check is right for every list or only for
the fixed-width ones. A field whose length the simulation varies is not a
shape the flag can check against, and the honest options are a per-field
allowance, a check against the field's *element* type instead of its length,
or leaving it and saying so in the refusal — which today reads as a bug in
the caller rather than as a rule.

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

## The game's preview has no `here` route, and the director's does

- **Found:** 2026-09-23, claude/task-queue-work-e21054
- **Files:** `.claude/launch.json`, `apps/game/package.json`, `tools/dev/supervise.ts`, `docs/commands.md`
- **Where:** local

CLAUDE.md says a worktree launches the preview "by absolute path", because
`preview_start` starts an entry in the directory the session was opened in.
The director solved the same problem once: `bun run here` names a tree,
`supervise.ts --here` serves it, and the `director-here` entry is that route.
The game's `game` entry has nothing like it, so the boot check for the
`main.ts` split wrote a `game-e21054` entry with `--cwd <worktree>
preview:once`, used it, and reverted `.claude/launch.json` — every lane that
checks the built game in a browser pays the same. Give the game a
`preview:here` script through the same pointer and a `game-here` entry, and
say it in `docs/commands.md` and CLAUDE.md's "Verifying in a browser".

## Nineteen scene captions still say lane, plate, ward or guard

- **Found:** 2026-09-23, claude/task-queue-work-e21054
- **Files:** `packages/content/src/scenes/*.ts`, `packages/render/src/duty.ts`, `tools/words/test/drawn.test.ts`
- **Where:** local

The owner has answered both words: **shield** for ward, plate and guard, and
**column** for lane (`tools/words/measure.ts`, `VOCABULARY`). The captions a
rehearsal writes over the field are literals in the scene files, outside
`playerText()`, so they kept the old words; `drawn.test.ts` lists every one
in `STANDING`, with the two `LANE` marks in `duty.ts`. Rewrite each in the
register of `.claude/skills/new-tutorial`, keep it inside the caption limit
`packages/content/test/scenes.test.ts` holds, strike its `STANDING` line, and
send one rehearsal frame for the longest caption changed. A look the owner
asked for by name (shield, column).

## Player-facing marks still say PILOT'S, NAVIGATOR'S and SEAT

- **Found:** 2026-09-23, claude/task-queue-work-e21054
- **Files:** `packages/render/src/fleet-grip-draw.ts`, `packages/render/src/handle-word.ts`, `packages/render/src/instar-marks.ts`, `packages/render/src/maze-grip.ts`, `packages/render/src/maze-string.ts`, `packages/render/src/pair-call.ts`, `packages/render/src/stare-draw.ts`, `packages/render/src/ready-words.ts`, `packages/content/src/screen-words.ts`, `apps/game/src/menu-seats.ts`, `tools/words/test/drawn.test.ts`
- **Asks:** On a grip mark and a pair call, which does a player read — `P1'S` / `P2'S`, or `PLAYER 1'S` / `PLAYER 2'S`? And the menu's screen chooser, whose card names are PILOT and NAVIGATOR and whose heading is SEAT — `PLAYER 1` / `PLAYER 2` under `SCREEN`, or keep the job names there as a proper noun?
- **Where:** local

The vocabulary says a player is never shown pilot, navigator or seat, and the
guides obey it; fifteen drawn literals do not (`drawn.test.ts`, `STANDING`).
The long form is what the guides say; the short form is what the seat
switcher already shows and fits a mark a quarter of the width. The chooser is
the one place the job name could stand as a name, as `THE WARD` does. Once
answered, change the literals, strike the lines, and send one frame of THE
FLEET's grip marks.

## The films' pages name counts that no test reads back

- **Found:** 2026-09-23, claude/queue-the-hives-rehearsal-says-five-scars-with-four-on
- **Files:** `packages/content/src/scene-step-types.ts`, `packages/content/src/scenes/`, `packages/content/test/scene-pages.test.ts`
- **Where:** local

`SceneStep.counts` lets a page say which world field each of its numbers is,
and `scene-pages.test.ts` reads each one back at both ends of the page. Only
THE HIVE's `FIVE SCARS · FOUR TO GO` uses it so far. Some sixty other captions
name a number (`grep -rhoE 'text: "[^"]*(ONE|TWO|THREE|FOUR|FIVE|[0-9])' packages/content/src/scenes/`),
and most of them are rules, like `A TORCH EVERY EIGHT BEATS`, not counts of
the field. Go through them and give each one that counts something on the
field a `counts` entry:
- `FIVE HITS PUT IT OUT`
- `OUT · NONE LEFT TO COUNT`
- `TWO OPEN · TWO COLOURS`
- `ONE SEALED · ONE SPILLING`
- `THREE ON THE RAIL · WHICH`

Add a reader to `COUNT` in the test for each new field. A page that fails is
moved or reworded, the same way THE HIVE's was.

## A short phone stands the hull between two black side bars

- **Found:** 2026-09-23, claude/queue-a-phone-in-test-mode-has-nowhere-to-put-two-band
- **Files:** `packages/render/src/layout-stage.ts`, `packages/render/src/layout.ts`, `packages/render/src/hull.ts`, `packages/render/test/layout-stage.test.ts`
- **Where:** local
- **Asks:** On a phone shorter than about 16:9 of free height, which should give: the dark bars, a wider picture, or a shorter band?

The owner, 20 September 2026: *"horizontal the hull skin is vertical cutted
inside of the screen."* It is `computeStage` doing what it says: the stage is
never wider than `cols * tile`, and the tile is whatever the height leaves
after the band (`bandSoloPct`, 19%) and the radar. At 390×660 — a real phone
with its bars out — that is 366 of 390 pixels, with 12 dark at each side; at
375×548 it is 300 of 375. The three answers, each sized:

- **Keep the bars.** The columns are the frame (`layout-stage.ts`'s own
  comment); nothing changes but that comment, which then says it was asked.
- **Draw past the columns.** The stage takes the window's width, the field
  stays `cols * tile` and centred, and the hull's skin, the band and the
  background are drawn out to the edges. `computeLayout` already carries
  `gridLeft`; the hull and the band are the work, and `frame.test.ts` redraws.
- **Shorten the band on a short screen.** `bandHeightFor` takes a smaller
  share below some height so the tile grows back to the width. The lobes shrink
  with it; `layout-stage.test.ts`'s touch-ring test holds them inside.

## The director on a phone cannot reach its TEST, P1 and P2 strip

- **Found:** 2026-09-23, claude/queue-a-phone-in-test-mode-has-nowhere-to-put-two-band
- **Files:** `tools/director/src/stage-transport.ts`, `tools/director/src/director-phone.css`, `tools/director/test/phone-game.test.ts`
- **Where:** local

The director's half of "A phone in TEST mode has nowhere to put two bands and
the rig", split off when the game's half landed. The owner, 18 September 2026:
*"make sure in director and for game, when I am in solo test mode, I can also
test for both players on mobile device."* `bindStageTransport` binds the three
role buttons and TEST works; on a phone the strip under the field is off the
foot of the GAME view. Put the three buttons where the phone's GAME view shows
them, and pin it in `phone-game.test.ts` the way that file pins the rest.

## Unverified at 5db3ae3e: the svh cap on a real phone whose address bar comes bac…

- **Found:** 2026-09-23, claude/queue-a-phone-in-test-mode-has-nowhere-to-put-two-band
- **Files:** `apps/game/index.html`, `apps/game/src/game.css`, `apps/game/src/safe-area.ts`, `apps/game/src/viewport.ts`, `apps/game/test/viewport-furniture.test.ts`, `apps/game/test/viewport-screen.ts`, `docs/queue.md`, `docs/time-log.md`

*A phone's frozen height stops at the bars-out height, and the build date leaves the field* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- the svh cap on a real phone whose address bar comes back mid-wave — no emulated viewport has the bar

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 2d3f8edd: ?lag=1's worst and median press-to-frame figures on a r…

- **Found:** 2026-09-23, claude/queue-nothing-says-how-long-a-thumb-waits
- **Files:** `apps/game/src/frame.ts`, `apps/game/src/input-buffer.ts`, `apps/game/src/main.ts`, `apps/game/src/press-lag-page.ts`, `apps/game/src/press-lag.ts`, `apps/game/test/press-lag.test.ts`, `docs/INDEX.md`, `docs/queue.md`

*?lag=1 shows how long a press waits for the field to answer it* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- ?lag=1's worst and median press-to-frame figures on a real phone, solo and paired — the browser pane paints at one frame a second

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
