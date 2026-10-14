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

**A landing that could not check itself writes nothing here**, since 30
September 2026. From 9 September `bun run land --unverified "<what>"` put an
`## Unverified at <sha>:` entry on this list every time a lane landed something
it could not look at, and twenty *watched at tempo* entries piled up in front
of the work. The owner took them out: *"do not handle non checked items to be
unresolved from me. they should be gone from queue and do not block other
tasks."* What went unchecked is his regression pass — the landing prints it,
the report names it in the word *unverified*, and it is never an entry, never
a `Needs:` and never written by hand (`tools/land/unverified.ts`). A look he
picks in VERSUS is the same: his to check and decide, on the VERSUS page.

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
prints a prompt naming the branch. If origin refuses the push, the line is
marked again over origin's trunk, or the claim is given up with the holder's
name when origin's entry is already taken (`tools/queue/claim-push.ts`). The
session checks that branch out in its own
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

**Take a set when one reading pays for it.** The owner, 28 September 2026:
*not just pick a single task from queue, but if it is reasonable for claude
and efficient create a set of items — you decide.* A session draining the
queue reads the whole listing before it claims, and `take`s together the
items that share a reading: entries whose `Files:` overlap; a finding filed by
the lane about to work the item it was found in; the named steps of one
roll-out entry that follow one precedent; two or three findings in one tool.
It says the set in the report as it takes it, a sentence each, and why they
go together in one more. **The set is a claim and a reading, never a commit**:
each item is still its own commit, removed by its own `queue done`, and landed
before the next is started, so a set cut short leaves nothing half-done. Three
items is the ordinary size, and one is right when nothing else shares its
files. What stays out: an item that `WAITS ON` one not in the set, an
`Asks:` not yet answered, and on a cloud session anything `LOCAL ONLY`.

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

**A check that needs a phone in a hand is not queued at all**, since 27
September 2026. The owner cleared fifteen of them that day: *"i dont want that
things for me to test are counted towards queue items. i will test any feature
more altogether with regression testing."* Since 30 September nothing a landing
could not check is queued, phone or screen (above). A
`- **Where:** phone` line is a reported problem (`tools/queue/problems.ts`):
from 22 September 2026 it was a third value, `PHONE ONLY`, that the automatic
pick stepped over on every machine, and it went when nothing wrote it any more.

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
— this machine cannot do that work at all — and an unanswered `Asks:` waits on
a sentence from the owner. None
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

## HELPERS: THE CURTAIN to THE STARE's one-seat pictures are not listed

- **Found:** 2026-10-14, claude/docs-controls-helpers-org-c825df
- **Taken:** 2026-10-14, main (claim: claude/queue-helpers-the-curtain-to-the-stares-one-seat-pictu)
- **Files:** `tools/director/src/helpers-page.ts`, `packages/render/src/view-role-clocks.ts`, `packages/render/src/view-role-clocks-b.ts`

Every boss with a split draws a picture on one seat only — a tally, a next,
a zone, a lean arrow — and CONTROLS › HELPERS lists none of them, only the
marks every boss shares. `view-role-clocks.ts` and `-b.ts` hold THE CURTAIN,
THE GORGE, THE LEAD, THE LEDGER, THE SINEW, THE SURGE, THE TASTER, THE THROAT,
THE UNDERTOW, THE ANTIPHON, THE FILAMENT, THE HIVE, THE INSTAR, THE SCUTTLE
and THE STARE. Give them a group of their own, ONE BOSS'S OWN, in a new file
helpers-bosses.ts beside the other groups' — a row a boss
on the seat that is shown it, framed on a gallery pose where one holds the
moment; look at each.

## HELPERS: THE BASTION to THE TRAPEZE's one-seat pictures are not listed

- **Found:** 2026-10-14, claude/docs-controls-helpers-org-c825df
- **Files:** `tools/director/src/helpers-page.ts`, `packages/render/src/view-role-clocks-c.ts`, `packages/render/src/gauge.ts`

The second half of the entry above: `view-role-clocks-c.ts` — THE BASTION,
THE FLUE, THE GALL, THE GIMBAL, THE GOVERNOR, THE HASP, THE LAMPREY, THE
MIMIC, THE RATCHET, THE SPOOL, THE TRAPEZE — and THE GAUGE's marks on player
2's screen (`gauge.ts`). Same group, same rule: a row a boss, the real frame.

## `bun run frames <sha>` gave up on a build that was only slow

- **Found:** 2026-10-14, claude/bastion-gameplay-enhancement-749629
- **Files:** `tools/frames/serve.ts`

The first `bun run frames 2bd47f41e --wave "THE BASTION" …` died with
*preview:once never printed its port* after its fresh `bun install`; the same
command run again straight after wrote both pictures. `previewUrlFrom` races
the build's first line against a fixed `PORT_MS`, and a cold build of the
before and the after at once is slower than that on a loaded machine. Scale
the patience with the load average, the way `tools/test/figure.js` scales a
test's figure, or retry the start once before failing, and say which in the
error. Prove with `bun test tools/frames` and `bun run check`.

## `check:fast` passed a wave reorder that `check` failed three times

- **Found:** 2026-10-14, claude/bastion-gameplay-enhancement-749629
- **Files:** `tools/check/fast-scope.ts`, `tools/perf/test/baseline.test.ts`, `tools/words/test/drawn.test.ts`, `packages/render/test/frame.test.ts`

The director's save that moved THE INSTAR to wave 5 and THE BASTION to 16
touched only `packages/content/src/waves/act-*.ts`, and `check:fast` went
green. `land`'s full `check` then failed in three tests that read the wave
list or its files: the perf baseline's numbers, the standing-word list (it
names THE WARD's act page), and the band override in `frame.test.ts` (it
picks SALVAGE by index). `fast-scope.ts` should treat a change to the wave
files as reaching every test that imports `WAVES` or scans the act pages.
Prove it by touching one act file and checking that the scope lists all
three, then run `bun run check`.

## Two integer square roots in sim, `isqrt` written twice

- **Found:** 2026-10-14, claude/queue-one-generic-pull-the-curved-and-rope-pulls-onto
- **Files:** `packages/sim/src/handle-pull.ts`, `packages/sim/src/pinball-contact.ts`, `packages/sim/test/copies-table.ts`

Both export `isqrt`: `handle-pull.ts` by bisection up to 46340, `pinball-contact.ts` by Newton's step with no ceiling. Keep the one without a ceiling in a small `isqrt.ts`, import it in both places (and in `gauge-tooth.ts`, which takes `handle-pull.ts`'s now), and add a `COPIES` row so a third is not written.

## `land` misses a queue title wrapped across two lines of a commit message

- **Found:** 2026-10-14, claude/queue-the-lids-cord-still-goes-any-direction-the-last
- **Files:** `tools/land/queue-dropped.ts`, `tools/land/test/`

`queueDropped` closes an entry a lane names in its commit messages with `laneLog.includes(entry.title)`, against `git log --format=%B` as it stands. A message wrapped at 72 columns breaks a long title over a line, so the lane that closed "A tap on a lid's cord under the chrome reads as a pull" was refused until the title was put on one line by hand. Collapse runs of whitespace in both the log and the title before comparing, and add the wrapped case to the test beside it.

## `docs/spec/briefings.md` §1 is renumbered by hand after every wave inserted

- **Found:** 2026-10-14, claude/blocks-lure-to-veil
- **Files:** `docs/spec/briefings.md`, `tools/probe/measure-waves.ts`, `packages/content/test/waves.test.ts`

Every lane that writes composed waves (`bun run waves:compose --write`) moves
the wave numbers in §1's table and its "of the hundred and … waves today"
figure, and `waves.test.ts` and `scenes-prose.test.ts` fail until both are
rewritten by hand — a script did it this lane. Make `bun run waves:measure`
(or a command of its own, in `docs/commands.md`) rewrite each `N · NAME` in
§1 from today's order and the count in words, with a test, so a block lane
runs one command instead.

## AUTO loses THE COUNT and THE CLAW

- **Found:** 2026-10-14, claude/wave-plan
- **Files:** `packages/hands/src/autopilot-field-hand.ts`, `tools/probe/world.ts`, `docs/spec/wave-curriculum-today.md`

Playing every wave with AUTO on both seats (`playedBeat` in a loop until the
field is clear) to measure the curriculum's table, two waves with no boss are
lost: THE COUNT and THE CLAW. The field hand does not answer a countdown body
or THE CLAW's panel, so their length is missing from the table and AUTO in the
director cannot show either played right. Teach the field hand both, add a
test in `packages/hands` that plays each wave to a clear, and refill their rows
in the today table. Prove with `bun test packages/hands` and `bun run check`.
The composer stops on it too: AUTO loses every R8 of THE COUNT's block it
draws, so `bun run waves:compose theCount` writes nothing until this lands.

## AUTO loses THE COIL and THE CROSSING in composed waves

- **Found:** 2026-10-14, claude/queue-the-composer-stalls-eight-later-blocks-at-r7-r8
- **Files:** `packages/hands/src/autopilot-field-hand.ts`, `tools/director/src/compose-check.ts`

`bun run waves:compose` keeps only waves AUTO clears, and AUTO loses nearly
every composed wave with a coil or a crossing rock in it — THE COIL's block
at R7, THE CROSSING's at R2, with one draw in twelve or none clearing at most
steps. Their own hand-made waves clear. Find what the field hand misses when a
coil or a crossing comes among other bodies, teach it, and add a test in
`packages/hands` that plays a composed wave of each to a clear. Prove with
`bun run waves:compose theCoil` and `theCrossing` filling all their steps.

## AUTO loses BULB QUEEN and THE VANE

- **Found:** 2026-10-14, claude/wave-plan
- **Files:** `packages/hands/src/boss-hands-queen.ts`, `packages/sim/src/vane-hand.ts`, `docs/spec/wave-curriculum-today.md`

The same measurement: AUTO playing both seats loses both bosses, so the boss
table in `wave-curriculum-today.md` has no time for them. Find which press the
hand misses (the probe's `playedBeat` and `field` print it beat by beat), fix
it, add a play-to-the-end test per boss, and fill in the two rows. Prove with
`bun test packages/hands` and `bun run check`.

## AUTO loses THE CURTAIN and THE TASTER

- **Found:** 2026-10-14, claude/wave-plan
- **Files:** `packages/sim/src/curtain-hand.ts`, `packages/sim/src/taster-hand.ts`, `docs/spec/wave-curriculum-today.md`

As above, for these two bosses: AUTO loses both, so the boss table cannot say
how long either takes. Fix the hands, add a play-to-the-end test for each, fill
in the rows. Prove with `bun test packages/hands` and `bun run check`.

## AUTO loses THE LEAD and THE SCUTTLE

- **Found:** 2026-10-14, claude/wave-plan
- **Files:** `packages/sim/src/lead-hand.ts`, `packages/sim/src/scuttle-hand.ts`, `docs/spec/wave-curriculum-today.md`

As above, for these two bosses. Fix the hands, add a play-to-the-end test for
each, fill in the rows. Prove with `bun test packages/hands` and
`bun run check`.

## `keys.ts` is four lines under the line ceiling

- **Found:** 2026-10-14, claude/queue-curved-pulls-the-sim-knows-only-straight-ones
- **Files:** `apps/game/src/keys.ts`

The desk rig's key file is at 246 lines after THE WARDEN's rope learned to
follow its bow from the keys (`boss` on `KeyBindings`, 14 October 2026), and
the next key added fails `limits.test.ts`. The `KeyBindings` interface — every
getter the rig is handed, each with its paragraph — is a subject of its own:
move it to `keys-bindings.ts`, re-exported from `keys.ts` so `input.ts` and the
tests import as they do. Prove with `bun test apps/game` and `bun run check`.

## `boss-hands-handles.ts` is past 225 lines

- **Found:** 2026-10-14, claude/queue-curved-pulls-the-sim-knows-only-straight-ones
- **Files:** `packages/hands/src/boss-hands-handles.ts`

The autopilot's hands on the handled bosses are at 229 lines after THE SINEW's
hands learned to follow the bow (`tendon(w, …)`, 14 October 2026). THE SINEW's
three hands — `sinewHand`, `sinewSnapHand`, `sinewCatchHand` and `tendon` —
are a seam: move them to `boss-hands-sinew.ts`, with the index re-exporting as
it does now. Prove with `bun test packages/hands` and `bun run check`.

## No command profiles a render function by name

- **Found:** 2026-10-14, claude/queue-the-pull-labs-fizz-knob-costs-400-rings-a-call
- **Files:** `tools/perf/`, `package.json`

Finding why a FIZZ knob cost 0.4 ms took a scratch script calling it 5000
times on the stub canvas under `bun --cpu-prof` (`bun test --cpu-prof` writes
no profile), and a second scratch script folding the `.cpuprofile` into self
and total time per function. That fold named `rimAt` at 86% at once. Make it
a command — `bun run profile <file.ts>` running a script and printing the top
functions by self and total time — with a test of the fold on a small
hand-written profile, and name it in the render-perf skill.

## `mirror-grip.test.ts` is past the line ceiling

- **Found:** 2026-10-14, claude/queue-holds-as-the-hold-labs-drop-the-baton-the-mirror
- **Files:** `packages/render/test/mirror-grip.test.ts`

296 lines: the hit tests, the hand's readout, the rings and the drops, the pin
landing's fx and a run on the field, in one file. Split by what each asks —
the press (`mirrorLobeUnder`, `mirrorGripSeat`, the readout) in one, the
picture (`drawMirrorGrip`'s rings and drops, `MirrorGripFx`, the field run) in
another — each under ~250 lines, and `bun run check` green.

## The op-count budgets do not count what a glancing part draws

- **Found:** 2026-10-14, claude/glance-cock
- **Files:** `packages/render/test/canvas-stub.ts`, `packages/render/src/glance-layer.ts`, `packages/render/test/fleet-budget.test.ts`, `packages/render/test/wave-budget.test.ts`, `packages/render/test/frame-budget.test.ts`

Every boss but two now glances, and a glancing part is drawn onto a scratch
canvas and laid on the screen as one `drawImage` (`glance-layer.ts`). The
stub tallies each context on its own, so a budget sees the layer's blit, its
clip and save, and none of the part's strokes, fills and gradients: THE
FLEET's p1 `stroke` fell from 87 to 59 the day the hulls began to turn, and
seven colour tests hold the boss still to read it at all
(`glance-held.ts`). Count a scratch layer's ops against the primary
context's tally — as `new Path2D` already is — for canvases `glance-layer.ts`
makes, remeasure the rows that move with a sentence each, and see whether
`holdGlancesStill` can go. Prove it with the three budget files and
`bun run check`. **Work it before "Every living enemy glances"**: that lane
puts every blob on the field through the same layer, and without this every
creature colour test reads an empty log.

## `bun run shot` finds no ON THE FIELD card for THE SCOUT's two holds

- **Found:** 2026-10-14, claude/queue-holds-as-the-hold-labs-drop-the-scout-the-vane-t
- **Files:** `tools/director/src/field-controls-scout.ts`, `tools/director/src/field-action-cards.ts`, `tools/frames/shot.ts`

`bun run shot` with the selector `section.field-use:has(p.rows:has-text(...))`
and the path `/?sheet=states&inner=controlsets&sub=field` says no element
matches for THE SCOUT'S LINE, where the same selector finds THE VANE'S ARM
and THE WELL'S SEAM. The lane worked round it by rendering the ship on a
napi canvas. Find out whether THE SCOUT's two rows reach ON THE FIELD at all
(their pose is `THE SCOUT · LADEN`, and `tools/frames/scout-press.ts` says
the round never carries enough to offer them), and either show them or say
on the sheet why not; a test that every row of the bosses' field controls
has a card proves it.

## The nameability gate measures an enemy turned by its glance

- **Found:** 2026-10-14, claude/creature-glance
- **Files:** `tools/shape-sheet/src/nameability.ts`, `tools/shape-sheet/test/nameability.test.ts`

The owner, 14 October 2026, wants every enemy to glance as the bosses do —
*within the naming gate*, so each kind stays its own word. First of three
lanes. Give `nameabilityOf` an optional glance: at each pose sample, turn the
contour as `glance.ts` does with a `hold` of 0 — each half's x times
`1 ∓ swing` about the centre — then roll it, across a whole COCK round
(`glance-styles.ts`) crossed with the pose window. A turn about the centre
leaves width, height and size alone; the roll and the lobe profile are what
can move. Write packages/render/src/creature-glance.ts with
`CREATURE_GLANCE` still and `CREATURE_GLANCE_SIZE` as the largest reach and
cock (searched, not guessed) at which no pair the gate keeps apart today
becomes confusable, and a test that holds that line. Prove it with
`bun test tools/shape-sheet` and `bun run check`.

## Every living enemy glances

- **Found:** 2026-10-14, claude/creature-glance
- **Files:** `packages/render/src/creatures.ts`, `packages/render/src/glance-layer.ts`

Second of three, after "The nameability gate measures an enemy turned by its
glance" and "The op-count budgets do not count what a glancing part draws".
Every body the table draws with `drawLivingBody` (`creature-body.ts`) goes
through `drawGlancedLayer` (`glance-layer.ts`) with a `hold` of 0, at
`l.tile * 0.4` times its `sizeMul`, each creature on a temper of its own,
`temperOf(c.id)` (`glance-temper.ts`): its own round length, cocks and cycle,
so no two enemies turn alike (the owner, 14 October 2026: *they should be not
exactly equal*). The record is `glanceOf(cock, CREATURE_GLANCE_SIZE)`; one
`Glance` a temper, cached by id and dropped when the creature goes. The far side's dark has no contour to
fill, so add a `source-atop` ramp on the layer to `drawGlancedLayer` rather
than a disc that would smear past a blob's edge. Only the body turns:
`drawOverBody`, grips, marks and cords stay flat. Remeasure the budget rows
that move with a sentence each. Exemption: a look the owner asked for by
name. Send one PNG strip of a wave with several kinds. Prove it with
`bun test packages/render` and `bun run check`.

## The rest of the enemies glance: rocks, hazards and held bodies

- **Found:** 2026-10-14, claude/creature-glance
- **Files:** `packages/render/src/creature-body.ts`, `packages/render/src/creature-body-rock.ts`, `packages/render/src/creature-body-worn.ts`, `packages/render/src/creatures.ts`

Third of three, after "Every living enemy glances". The bodies `EXCLUSIVE`
routes away from `drawLivingBody` — the meteor, the torch (not its streak),
THE COIL, the crystal, the mine, the lid, the balloon, the blister, the
choir, the cling bodies, the magnet, the strand, the moult, the beatbox —
glance on the same record. A rock is big and not a living word, so it may
turn further than the gate allows a blob. Leave out the ghost and the wisp,
which are mostly not drawn, and say so in creature-glance.ts. Check every
body a thumb holds (`balloon-handles.ts`, `lid-string.ts`, `weight.ts`)
still meets its handle where it is drawn. Send one PNG strip. Prove it with
`bun test packages/render` and `bun run check`.

## `docs/spec/bosses.md` still says every boss's glance ships still

- **Found:** 2026-10-14, claude/creature-glance
- **Files:** `docs/spec/bosses.md`, `docs/spec/bosses-choreographed.md`

Every boss took its glance on 14 October 2026 (`tools/versus/DECIDED.md`),
but each boss's section still reads *Offered (… VERSUS `x:glance`)* and *It
ships still*. Rewrite each as *Taken (14 October 2026)* with the rhythm and
size its `packages/render/src/*-glance.ts` now ships — THE ANTIPHON's is the
pattern already written — and nothing else. Prove it with
`grep -n "glance" docs/spec/bosses.md` showing no *ships still* and
`bun run check`.

## THE QUEEN's gap drop overlaps the marks it stands between

- **Found:** 2026-10-14, claude/queue-holds-as-the-hold-labs-drop-the-queens-marks
- **Files:** `packages/render/src/boss-cue-read.ts`, `packages/render/src/cue-helper.ts`, `packages/render/src/boss-cue-shape.ts`

THE QUEEN's SCREAM `HOLD` cue draws the HOLD LAB's drop in the gap between
her two marks until a thumb lands (`queen-grip.ts`), at the cue frame's size
(`holdDropR`). On a 390-wide phone that drop reaches over the inner edge of
both marks, and the marks are what player 1 reads to say what is coming.
Give `BossCue` a way to say a smaller drop (or size it to the gap,
`queenMarkCenter` both sides less each mark's ring), and prove with a test
that the drop's rim stays clear of both mark rings.

## Three integer mixers in render, each written privately

- **Found:** 2026-10-14, claude/glance-temper
- **Files:** `packages/render/src/idle-drift.ts`, `packages/render/src/backdrop.ts`, `packages/render/src/solid-motion.ts`, `packages/render/src/hash.ts`, `packages/sim/test/copies-table.ts`

Each of the three files mixes an integer with murmur3's `0x85ebca6b` by a
private few lines of its own, slightly differently. `hash.ts` holds render's
shared hashes (`sinHash`, `stream`, and now `nameHash`, whose finaliser is the
same murmur3 step). Give `hash.ts` one exported integer mixer, call it from
the three, and add a COPIES row for the constant. Where a file's numbers
would change what is drawn, keep its own and say why in the row's `also`, as
the raster painters do. Prove it with `bun test packages/render` and
`bun run check`.

## THE BLISTER's HOLD gets bodies built round its drop, on VERSUS

- **Found:** 2026-10-14, claude/control-bodies
- **Files:** `packages/render/src/blister-bodies.ts`, `packages/render/src/soak-hold.ts`, `tools/director/src/poses-field-controls-blister.ts`, `tools/director/src/poses-versus-bodies.ts`, `tools/director/src/versus-pose.ts`

The owner, 14 October 2026: *every control has its own visual related thing
around the button visuals integrating it … one brush per on screen control
type … several "versus" variants each*. TAP's are open as `blister:tap`
(MOLE, RIDER, CRADLE in `tools/versus/candidates/blister-tap/`) — copy that
slot's shape. Open `blister:hold`, patching `BLISTER_BODY.hold`'s `draw`:
three bodies that come up out of the pore with the HOLD LAB's drop held in
them rather than laid over them, the drop and its waiting clock left exactly
as `blister-help.ts` draws them. Ideas to start from: a clam whose open
shell holds the drop as its pearl; a body with a cupped hollow on top the
drop sits in like water in a palm; a bud whose petals close round the drop
while a thumb is on it. Add a pose of a HOLD blister up with a thumb on it
to the COMPARED LOOKS group, its row in `SLOT_POSE`, and send one PNG of
the current beside the three (`bun run versus:shot … --only candidate`,
`bun run crop`, `bun run pair`). Prove it with `bun test tools/versus` and
`bun run check`.

## THE BLISTER's SWIPE gets bodies built round its pull, on VERSUS

- **Found:** 2026-10-14, claude/control-bodies
- **Files:** `packages/render/src/blister-bodies.ts`, `packages/render/src/blister-help.ts`, `tools/director/src/poses-field-controls-blister.ts`, `tools/director/src/versus-pose.ts`

The same ask as THE BLISTER's HOLD entry, for `blister:swipe`, patching
`BLISTER_BODY.swipe`'s `draw`. The knob sits on the body and its channel
runs a stroke long out its way (`drawSwipeTrack`), so a body built round it
can run along the channel: a slug whose back is the channel and whose head
is the knob; a frog-mouthed body with the channel as its tongue, the knob
its tip; a seam or zip the knob opens down the body. A body must follow the
way a SWIPE is authored to go — left, right, up or down — so build the
pose `BLISTER · A STROKE HALF CARRIED` already gives you and one with
another way. Send one PNG of the current beside the three. Prove it with
`bun test tools/versus` and `bun run check`.

## THE BLISTER's TURN gets bodies built round its knob, on VERSUS

- **Found:** 2026-10-14, claude/control-bodies
- **Files:** `packages/render/src/blister-bodies.ts`, `packages/render/src/blister-turn-help.ts`, `tools/director/src/poses-field-controls-blister.ts`, `tools/director/src/versus-pose.ts`

The same ask as THE BLISTER's HOLD entry, for `blister:turn`, patching
`BLISTER_BODY.turn`'s `draw`, judged on `BLISTER · A TURN HALF ROUND`.
THE MAZE's channel goes round the body and the knob rides it on a lever, so
the body can be what turns: a snail whose shell's spiral is the channel; a
flower or a wheel of lobes the lever sweeps past; a coiled worm whose head
is the knob. Clockwise and anticlockwise must both read. Send one PNG of
the current beside the three. Prove it with `bun test tools/versus` and
`bun run check`.

## THE BLISTER's RUB gets bodies built round its zigzag, on VERSUS

- **Found:** 2026-10-14, claude/control-bodies
- **Files:** `packages/render/src/blister-bodies.ts`, `packages/render/src/rub-drop.ts`, `tools/director/src/poses-field-controls-blister.ts`, `tools/director/src/versus-pose.ts`

The same ask as THE BLISTER's HOLD entry, for `blister:rub`, patching
`BLISTER_BODY.rub`'s `draw`, judged on `BLISTER · RUBBED ONCE`. The RUB
LAB's drop wears a zigzag stroke for every blow (`rub-drop.ts`), so the
body can be the thing scrubbed: an urchin or a hedgehog whose spines lie
along the zigzag; a ridged belly like a washboard; a furred back that
bristles where it has been rubbed. Send one PNG of the current beside the
three. Prove it with `bun test tools/versus` and `bun run check`.

## THE BLISTER takes a LEVER, and the CONTROLS group a LEVER brush

- **Found:** 2026-10-14, claude/control-bodies
- **Files:** `packages/sim/src/blister.ts`, `packages/sim/src/creature-state-blister.ts`, `tools/director/src/lever-lab-rule.ts`, `tools/director/src/entry-fields-blister.ts`, `tools/director/src/control-brushes.ts`

The owner asked for one brush per on-screen control, and the CONTROLS group
has five: the five gestures THE BLISTER knows. THE LEVER LAB's lever —
carried to a depth and held there — is a control the game has no body for.
Give THE BLISTER a `lever` gesture on the lab's rule (the knob carried down
its groove into the band and held for the beats it asks, a blow when it is
held long enough, sprung back when let go), drawn with the lab's paint, and
add it to `BLISTER_GESTURES`; `CONTROL_BRUSHES` then has a LEVER brush by
construction. A creature is its simulation, then its look: this entry is
the simulation, the help and the brush; its body is a `blister:lever` slot
after it. Prove it with `bun test packages/sim tools/director` and
`bun run check`.

## THE BLISTER takes a COMBO, and the CONTROLS group a COMBO brush

- **Found:** 2026-10-14, claude/control-bodies
- **Files:** `packages/sim/src/blister.ts`, `packages/sim/src/creature-state-blister.ts`, `tools/director/src/combo-lab-combos.ts`, `tools/director/src/entry-fields-blister.ts`, `tools/director/src/control-brushes.ts`

As THE BLISTER's LEVER entry, for THE COMBO LAB's chain: a press, then a
pull in its place (the lab's ONE, THEN ANOTHER group), one blow when both
are done inside the time it is up. A `combo` gesture, the lab's paint,
`BLISTER_GESTURES` and so a COMBO brush. Its body is a `blister:combo` slot
after it. Prove it with `bun test packages/sim tools/director` and
`bun run check`.

## `bun run shot` cannot reach a row on CONTROLS › HELPERS

- **Found:** 2026-10-14, claude/queue-the-shield-on-helpers-six-rows-owed-a-pose
- **Files:** `tools/frames/shot.ts`, `tools/frames/shot-flags.ts`, `tools/director/src/helpers-page.ts`

`bun run shot ".field-control:has(h3[data-label=\"DEFLECTED\"]) canvas" out.png
--port <director> --path "/?sheet=states&inner=controlsets&sub=helpers"`
answered *no element matches* after a 404 in the page's console, while the
same URL in the browser pane draws the row. The lane took its PNG off the
browser pane instead. Find whether the sub tab is restored from `?sub=` on a
cold load and whether the rows are built only once scrolled to; give `shot`
a way to reach one HELPERS row by its name (as `--open`/`--inner` reach a
sheet), and prove it with a test in `tools/frames/test/` and `bun run check`.
