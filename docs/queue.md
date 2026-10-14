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

## Holds as the HOLD LAB's drop: THE GAUGE's band, THE QUEEN, THE HIVE

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
- **Taken:** 2026-10-14, claude/queue-holds-as-the-hold-labs-drop-the-gauges-band-the
- **Files:** `packages/render/src/gauge-grip.ts`, `packages/render/src/queen-grip.ts`, `packages/render/src/hive-grip.ts`, `packages/render/src/cue-helper.ts`

Since 13 October 2026 every `HOLD` cue is the HOLD LAB's drop and says no
word (`soak-hold.ts`, `saysHold`) — the owner, on CONTROLS › ON THE FIELD:
*it should be our new standard button … why it still stays text "hold"*. The
cue's drop knows nothing of the hold, so it calls even under a thumb and never
fills, and these bosses still draw their own hold ring beside or under it.
For each: draw the hold as `drawSoakHold` with the sim's own `held` and
`fill` (the share of the hold done) and `theirs` on the partner's screen
(with `drawMarkTheirs` and `drawMarkWait` over it, as THE INSTAR's HOLD BOTH
does in `instar-marks.ts`), take its own ring and dial away, and stop the cue
drawing a second drop on the same place (`markIsHere`/`drawCueHelper` in
`cue-helper.ts`, or `framed: false` on the reading). Prove it with the frame
tests and send one PNG of the card from ON THE FIELD.

## Holds as the HOLD LAB's drop: THE LAMPREY's tail and THE SLING's cords

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
- **Taken:** 2026-10-14, claude/queue-holds-as-the-hold-labs-drop-the-lampreys-tail-an
- **Files:** `packages/render/src/lamprey-grip.ts`, `packages/render/src/sling-grip.ts`, `packages/render/src/cue-helper.ts`

Since 13 October 2026 every `HOLD` cue is the HOLD LAB's drop and says no
word (`soak-hold.ts`, `saysHold`) — the owner, on CONTROLS › ON THE FIELD:
*it should be our new standard button … why it still stays text "hold"*. The
cue's drop knows nothing of the hold, so it calls even under a thumb and never
fills, and these bosses still draw their own hold ring beside or under it.
For each: draw the hold as `drawSoakHold` with the sim's own `held` and
`fill` (the share of the hold done) and `theirs` on the partner's screen
(with `drawMarkTheirs` and `drawMarkWait` over it, as THE INSTAR's HOLD BOTH
does in `instar-marks.ts`), take its own ring and dial away, and stop the cue
drawing a second drop on the same place (`markIsHere`/`drawCueHelper` in
`cue-helper.ts`, or `framed: false` on the reading). Prove it with the frame
tests and send one PNG of the card from ON THE FIELD.

## `versus-pose.test.ts` is past the line ceiling

- **Found:** 2026-10-14, claude/queue-the-curtain-a-part-that-turns-so-it-is-seen-from
- **Files:** `tools/director/test/versus-pose.test.ts`

The file is 318 lines, and `NOT_ONE_BODY` with its comments grows by a few
each time a slot whose subject is not on the field opens (`curtain:glance`
on 14 October 2026). Move `NOT_ONE_BODY`, `isKind` and `subjectOf` into
their own module under `tools/director/test/`, which the test imports, so the
test file holds tests only and sits under ~250 lines. Prove with
`bun test tools/director/test/versus-pose.test.ts` and `bun run check`.

## `poses-bosses-hands-clocks.ts` sits on the line ceiling

- **Found:** 2026-10-14, claude/queue-the-ledger-a-part-that-turns-so-it-is-seen-from
- **Files:** `tools/director/src/poses-bosses-hands-clocks.ts`, `tools/director/src/poses.ts`

The file is at 250 lines after THE TASTER's and THE LEDGER's glance poses
took a `lookAt` each (14 October 2026), and the next lane to add a line to
any of its six bosses fails `limits.test.ts`. Its header already says THE
SPOOL's cards were filed here for want of room elsewhere: move THE WELL's
three or THE SPOOL's six into their own `poses-bosses-hands-*.ts`, joined in
`poses.ts` where the others are, with the header paragraph that explains them
going along. Prove with `bun test tools/director` and `bun run check`.

## `lead-draw.ts` sits on the line ceiling

- **Found:** 2026-10-14, claude/queue-the-lead-a-part-that-turns-so-it-is-seen-from-a
- **Files:** `packages/render/src/lead-draw.ts`

The file is at 250 lines after THE LEAD's glance wrapped its mound and stalk
(14 October 2026), and the next line added to it fails `limits.test.ts`.
`drawFlights` — the shots climbing over the ridge, with its two constants —
is a subject of its own and does not touch the body: move it to
`lead-flights.ts`, imported by `drawLead`. Prove with
`bun test packages/render` and `bun run check`.

## `ratchet-parts.ts` sits on the line ceiling

- **Found:** 2026-10-14, claude/queue-the-ratchet-a-part-that-turns-so-it-is-seen-from
- **Files:** `packages/render/src/ratchet-parts.ts`

The file is at 250 lines after THE RATCHET's glance carried the pawl's tip
with the rack (14 October 2026), and the next line added to it fails
`limits.test.ts`. The catch — `drawRatchetCatch` and `ratchetCatchBar`, the
navigator's half, read by `ratchet-stop.ts` and the grip — is a subject of its
own and touches neither the rack nor the pawl: move both to
`ratchet-catch.ts`. Prove with `bun test packages/render` and `bun run check`.

## `waveNamesAt`'s figure is a third of what it costs

- **Found:** 2026-10-14, claude/queue-the-sling-a-part-that-turns-so-it-is-seen-from-a
- **Files:** `tools/frames/test/wave.test.ts`

`check:fast` reported a figure drift on "reads today's WAVES from the working
tree's own HEAD commit": 18054 ms at slowdown 5.0, about 3611 ms idle, and
8894 ms at slowdown 2.3 run alone, about 3905 ms idle — against
`SCRATCH_TREE_MS` of 1200. The test passes, but the figure no longer says what
a scratch checkout costs. Time it alone a few times on an idle machine, set
`SCRATCH_TREE_MS` to what it takes at a slowdown of one, and write the runs
into its comment as the 30 September ones are. Prove with
`bun test tools/frames/test/wave.test.ts` and `bun run check`.

## THE SHIELD on HELPERS: six rows owed a pose

- **Found:** 2026-10-14, claude/shield-visualization-controls-51b28d
- **Files:** `tools/director/src/helpers-shield.ts`, `tools/director/src/helpers-poses.ts`, `tools/director/test/helpers-page.test.ts`

CONTROLS › HELPERS › THE SHIELD lists every shield helper that ships with a
gallery frame to draw it in. Four still ship without one; each needs a pose built
in `helpers-poses.ts` that ends on a tick the helper is drawn on (only the last
frame of a pose is handed `world.events`, `pose-frame.ts`). THE FENCE's skull,
doorway and sweep are on the page since claude/docs-controls-helpers-org-c825df
(`FENCE_UP`, `FENCE_SKULL`), and SHIELD STUCK ON since the faults' frames
(`helpers-poses-faults.ts`); what is left is the push's red rim and spray (`shield-push-fx.ts`) —
`PUSHED_ONCE` runs a beat past it; the SHIELD button's fading glow
(`guard-lapse.ts`); THE THROAT's shield face (`throat-hue.ts`) — `THE THROAT ·
SUCKS` stops on a red slick, and meteors come from beat 28; and DEFLECTED
(`banner.ts`) — `WARD · DEFLECTED` ends on the deflection, but its frame does
not show the word. Add each as a row of `SHIELD_GROUP`, look at the frame,
and keep `helpers-page.test.ts` green.

## `guard.test.ts` reports a figure drift

- **Found:** 2026-10-14, claude/queue-the-capstan-a-part-that-turns-so-it-is-seen-from
- **Files:** `tools/hooks/test/guard.test.ts`

`check:fast` reported `tools/hooks/test/guard.test.ts` at 1732 ms at slowdown
5.0, about 346 ms idle, against a figure of 50. The test passes; the figure may
only be stale. Time it alone on an idle machine, raise the figure to what it
costs at a slowdown of one if the drift holds, and say the runs in its comment.
Prove with `bun test tools/hooks/test/guard.test.ts` and `bun run check`.

## A wave editor save moves a wave and leaves its import behind

- **Found:** 2026-10-14, claude/task-queue-work-2770bc
- **Files:** `tools/director/src/waves-acts.ts`, `tools/director/src/waves-act-files.ts`

The owner moved THE INSTAR up the list in the wave editor (`bun run dev`) and
saved. The save splits the flat list back across the act files at each act's
current length, so every wave between the old and new place shifted into the
next file — and five of them (THE INSTAR, THE GIMBAL, the pinball, THE PULSE,
THE GORGE) took a reference to a constant imported only by the file they left:
`INSTAR_SCRIPT is not defined` at `act-1.ts:83`, and `tsc` red on five act
files. Fixed by hand in the main checkout by moving each import with its wave.
The save should write each act file's imports from the waves it now holds —
the names a wave's source references, imported from where they were before —
and drop the ones no wave there uses. Prove it with a test that moves a wave
carrying an imported constant across an act boundary and type-checks the
written files, then `bun run check`.

## HELPERS: six helpers that ship with no frame showing them

- **Found:** 2026-10-14, claude/docs-controls-helpers-org-c825df
- **Files:** `tools/director/src/helpers-marks.ts`, `tools/director/src/helpers-faults.ts`, `tools/director/src/helpers-poses-faults.ts`, `tools/director/test/helpers-page.test.ts`

The sweep of `packages/render/src` for CONTROLS › HELPERS found six generic
helpers whose rows were written and taken out again, because no frame tried
showed them: THE VERDICT (`grip-verdict.ts`) — `THE MIRROR · VERDICT` shows no
ring, and it is drawn off `world.events`, so the pose must end on the judging
tick; the thumb's ring (`thumb-aura.ts`) — it reads this device's own thumb,
which no pose holds; THE BATON's banner and labels (`baton-explain.ts`) —
`THE BATON · UNFOLDING` is an empty field; the band put out (`band-lock.ts`)
— `THE MIRROR · LISTEN` shows the band lit; THE HANDOVER's plate
(`handover-look.ts`) — `HANDOVER · THE TRADE` cut to the ship shows no plate;
and WRONG COLOUR (`fail-cause.ts`) — no pose loses a wave to a shot. Build a
frame for each that ends on a tick it is drawn, add the row (marks to
`MARK_GROUP`, the plate to `FAULT_GROUP`), look at it, and keep
`helpers-page.test.ts` green.

## HELPERS: THE CURTAIN to THE STARE's one-seat pictures are not listed

- **Found:** 2026-10-14, claude/docs-controls-helpers-org-c825df
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

## The composer stalls eight later blocks at R7–R8

- **Found:** 2026-10-14, claude/wave-composer
- **Files:** `tools/director/src/compose-place.ts`, `tools/director/src/compose-steps.ts`, `tools/director/src/compose-ramp.ts`

`bun run waves:compose` fills 31 of the game's 39 blocks dry, and eight stop
with "no pressure in reach keeps the ramp": THE COUNT, THE THIRD SHOT and THE
CLASP and THE LID at R8; THE FENCE, THE MAGNET, THE COIL and THE CROSSING at
R7. Either AUTO loses every draw that fits, or R7's twin (or a fence's / a
coil's own fields) lands R7 more than 2 over R6. Find which per block, make
the placement reach (a gentler lever for bodies that cannot twin, more draws,
or R6 aimed higher), and add a test that composes each of the eight dry.

## A rise in difficulty across blocks is not held

- **Found:** 2026-10-14, claude/wave-composer
- **Taken:** 2026-10-14, claude/wave-composer (claim: claude/queue-a-rise-in-difficulty-across-blocks-is-not-held)
- **Files:** `tools/director/src/compose-steps.ts`, `tools/director/src/compose-ramp.ts`, `docs/spec/wave-curriculum.md`
- **Asks:** Which should make block 40 harder than block 4 — tighter gaps, more arrivals, or the ramp starting higher?

Inside a block the ramp holds (decision 6), but every block's R1 lands near
3.9 and every R8 near 10, so block 40 is no harder than block 4 beyond what
its new thing weighs. Decision 5's floor was dropped because it could not be
aimed at (`docs/spec/wave-curriculum.md` §4). The options: **tighter gaps** —
each step's gaps shrink a beat every ten blocks, down to the gap rule;
**more arrivals** — each step's arrival band grows one every ten blocks,
within its span band; **the ramp starting higher** — R1 aims at the block
before's R2, so each tooth starts a little above the last.

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
`bun run check`.
