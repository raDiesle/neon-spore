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

## THE REPRISE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Taken:** 2026-10-14, claude/queue-the-reprise-a-part-that-turns-so-it-is-seen-from
- **Files:** `packages/render/src/reprise-body.ts`, `packages/render/src/reprise-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.15, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE STARE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/stare-draw.ts`, `packages/render/src/stare-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.16, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE BATON: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/baton-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.18, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE THROAT: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/throat-draw.ts`, `packages/render/src/throat-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.19, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE UNDERTOW: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/undertow-draw.ts`, `packages/render/src/undertow-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.20, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE GORGE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/gorge-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.23, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE CURTAIN: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/curtain-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.24, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE TASTER: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/taster-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.25, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SINEW: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/sinew-draw.ts`, `packages/render/src/sinew-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.26, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE LEDGER: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/ledger-draw.ts`, `packages/render/src/ledger-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.27, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SURGE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/surge-draw.ts`, `packages/render/src/surge-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.28, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE LEAD: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/lead-draw.ts`, `packages/render/src/lead-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.29, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SCUTTLE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/scuttle-draw.ts`, `packages/render/src/scuttle-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.30, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE ANTIPHON: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/antiphon-draw.ts`, `packages/render/src/antiphon-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.31, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE FILAMENT: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/filament-draw.ts`, `packages/render/src/filament-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.33, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE GIMBAL: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/gimbal-draw.ts`, `packages/render/src/gimbal-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.34, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SPOOL: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/spool-draw.ts`, `packages/render/src/spool-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.36, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE HASP: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/hasp-draw.ts`, `packages/render/src/hasp-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.37, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE RATCHET: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/ratchet-draw.ts`, `packages/render/src/ratchet-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.38, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE NETTLE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/nettle-draw.ts`, `packages/render/src/nettle-body.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.39, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE MANTLE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/mantle-draw.ts`, `packages/render/src/mantle-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.40, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE KEEL: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/keel-draw.ts`, `packages/render/src/keel-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.41, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE VALVE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/valve-draw.ts`, `packages/render/src/valve-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.42, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SEAM: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/seam-draw.ts`, `packages/render/src/seam-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.43, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE OCULUS: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/oculus-draw.ts`, `packages/render/src/oculus-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.44, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE VISE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/vise-draw.ts`, `packages/render/src/vise-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.45, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE PLUMB: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/plumb-draw.ts`, `packages/render/src/plumb-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.48, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SLING: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/sling-draw.ts`, `packages/render/src/sling-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.49, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE CAPSTAN: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/capstan-draw.ts`, `packages/render/src/capstan-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.54, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE GALL: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/gall-draw.ts`, `packages/render/src/gall-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.55, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE TRAPEZE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/trapeze-draw.ts`, `packages/render/src/trapeze-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.56, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE FLUE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/flue-draw.ts`, `packages/render/src/flue-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.57, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE GOVERNOR: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/governor-draw.ts`, `packages/render/src/governor-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.58, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE LAMPREY: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/lamprey-draw.ts`, `packages/render/src/lamprey-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.59, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE MIMIC: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/mimic-draw.ts`, `packages/render/src/mimic-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.60, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE LATCH: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/latch-draw.ts`, `packages/render/src/latch-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.61, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE BASTION: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/bastion-draw.ts`, `packages/render/src/bastion-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.62, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## One generic PULL in the simulation, and the straight-down pulls onto it

- **Found:** 2026-10-10, claude/pull-control-visuals-35c04f
- **Files:** `packages/sim/src/handle-pull.ts`, `packages/sim/src/hive-hand.ts`, `packages/sim/src/vane-hand.ts`, `packages/sim/src/fleet-hand.ts`, `packages/sim/src/ledger-hand.ts`, `tools/director/src/pull-lab-rule.ts`, `tools/director/src/field-actions-drag.ts`
- **Asks:** When a pull is let go short of its distance, is it refused (the knob springs back red, a fault the pair hears) or ignored (it springs back quietly and nothing is said)? Today both happen. Both can be felt in the PULL LAB: CONTROLS › ON THE FIELD › PULL PAST A DISTANCE › TRY THE GENERIC PULL, and the SHORT · RED / SHORT · IGNORED switch on its bar.
- **Answered:** a pull let go short of its distance is **refused** — the knob springs back red, a fault the pair hears. The owner, 10 October 2026, in the PULL LAB: *for the tolerance variants i prefer "short * red" so remove the others*. The lab's bar no longer offers IGNORED.

The owner took PULL PAST A DISTANCE's SUGGESTED line on 10 October 2026: one generic PULL with the direction a named field (down · up · either · signed) and one drawn arrow. Twenty-six rows each keep their own rule today, in a hand file per boss. Write the rule once in the simulation, beside `handle-pull.ts` — a direction field, a reach in thousandths, counted once the moment the reach is met, a short lift refused — taking the PULL LAB's toy rule (`pull-lab-rule.ts`) as its specification, then move the four straight-down pulls onto it: THE HIVE's haul, THE VANE's housing, THE FLEET's wreck and THE LEDGER's pull, each a replay test unchanged or a sentence on why its behaviour moved. Two entries below move the rest, one lane each.

## One generic PULL: the up, either-way and sideways pulls onto it

- **Found:** 2026-10-10, claude/pull-control-visuals-35c04f
- **Files:** `packages/sim/src/curtain-hand.ts`, `packages/sim/src/stare-hand.ts`, `packages/sim/src/scout-hand.ts`, `packages/sim/src/trapeze-hand.ts`, `packages/sim/src/taster-hand.ts`, `packages/sim/src/blister-swipe.ts`

After the entry above lands: THE CURTAIN's hem and THE STARE's lashes (up), THE SCOUT's prime (either), THE TRAPEZE's zones, THE TASTER's wipe and THE BLISTER's swipe (signed) onto the one rule, their direction a value of its field rather than code. Replay tests unchanged, or a sentence each on why not.

## One generic PULL: the curved and rope pulls onto it

- **Found:** 2026-10-10, claude/pull-control-visuals-35c04f
- **Files:** `packages/sim/src/lamprey-hand.ts`, `packages/sim/src/antiphon-rail.ts`, `packages/sim/src/warden-rope.ts`, `packages/sim/src/bastion-hand.ts`, `packages/sim/src/gauge-tooth.ts`, `packages/sim/src/pinball-hand.ts`

After the first entry lands: THE LAMPREY's head (a curve), THE ANTIPHON's rail (down a vein), THE WARDEN's tether and THE BASTION's slabs (a rope, any way), THE GAUGE's tooth and PINBALL's plunger onto the one rule. A curve is a path the rule measures along, as the PULL LAB's CURVE and S-CURVE do. THE GUM is a pull by a body rather than a knob — say in the entry's commit whether it joins or why not (SNAKE's jaws were the other, until the owner took them out on 10 October 2026).

## A lane's trunk step misses a local main that is ahead of origin

- **Found:** 2026-10-10, claude/visual-helpers-docs-2773b1
- **Files:** `.claude/skills/lane/SKILL.md`, `tools/dev/here.ts`

`git fetch origin main && git merge --ff-only origin/main` says *already up to date* in a fresh worktree while the local `main` holds landings that are not pushed yet, so the lane starts behind its own trunk. This lane built a sub tab against a `session.ts` without `subBars` and only found out when `sub=helpers` restored to PANELS; the lane before it (STEP BY STEP, `docs/time-log.md`) hit the same thing. The queue's preamble already says `git merge --ff-only main` in the lane; the lane skill's start step should say it too, or `bun run here` — which every lane that previews runs — should warn when `HEAD` is behind the local `main`. `bun test tools/dev` for a warning test, if the second.
## THE LID's cord still goes any direction, the last handle that does

- **Found:** 2026-10-10, claude/remove-rope-pull-mechanic-a1d0e2
- **Files:** `packages/sim/src/lid.ts`, `packages/sim/src/handle-pull.ts`, `packages/render/src/lid-track.ts`, `packages/hands/src/autopilot-lid.ts`, `packages/sim/test/lid.test.ts`
- **Asks:** Should THE LID's cord run one fixed path too — down, else across toward the middle when a low lid has no room below — or keep any direction?
- **Answered:** 2026-10-13 — a fixed path, the owner (*yes*), the choice between (a) and (b) left to the lane: (b), the sim picks the way by room at the grab and only travel along it counts, over (a), which would leave a low lid that can never open.

The owner took any-direction pulling off THE WARDEN's rope on 10 October 2026 ("remove support and usage of PULL IN ANY DIRECTION WITH A ROPE … better consistency"); the rope now runs straight down (`pullDownMilli`). THE LID's cord is the last user of the vector pull (`clampPull`, `isqrt`, the `lidPullYMilli` field, `pullOpenMilli`/`pullIsTaut` on a vector). Its channel is chosen by room in render (`fittingWay`: down, across toward the middle, the other way, up), so a fixed path needs that choice moved into the sim. The options: (a) down only, cut short where the field ends — a low lid could then never open; (b) the sim picks the way by room at the grab, as `lidCordTrack` does now, and only travel along it counts; (c) keep any direction for the cord. With (a) or (b) the vector half of `handle-pull.ts` and `lidPullYMilli` go, and the menu's A HANDLE text loses its last clause.

## BULB QUEEN's film fires a shot into a held wave

- **Found:** 2026-10-10, claude/bulb-queen-timing-107642
- **Files:** `packages/content/src/scenes/bulb-queen.ts`

The film's three acts — the cannon to col 3 at tick 630, col 2 at 670, `fireRed` at 770 — never land a shot. The torch reaches the hull (beat 9 on the old 8-beat clock, beat 11 on the 10-beat one) and the wave holds (`heldTick` 600, now 720), so the world is still for the rest of the 1020 ticks. On the old clock none of the three acts ran; on the new one the cannon slides to col 3 just before the hold and the shot is dropped. The comment over them still describes a petal fired on her second open beat. Either retime the film so the shot lands in her second bloom (beats 14–16) before the torch hits — which means the torch has to be shielded or the film ends later — or take the three acts and their comment out, so the film is the two marks and the torch paying the hull. A probe over `SceneRun(sceneScript("bulbQueen", …))` printing `petals`, `cannonCol` and `heldTick` per beat proves it.

## THE LAMPREY lets a bolt through its head while it is not reared

- **Found:** 2026-10-10, claude/lamprey-cannon-hit-feedback-323ebe
- **Files:** `packages/sim/src/lamprey-shot.ts`, `packages/sim/src/core-along.ts`, `packages/render/src/lamprey-stop.ts`
- **Asks:** Should a bolt that meets THE LAMPREY while its gullet is shut — recoiling from a hit, bitten into a tile, crawling — burst on the head as armour (grey grit, no effect, and not a wasted shot on HARD), or keep flying through it?
- **Answered:** 2026-10-13 — the owner left it to the lane: (a), armour while the head stands in the bolt's column in any phase but `leap`, `entering` and `spent`, over (b) recoil only and (c) leaving it — one rule for every phase a head is drawn in.

Since this lane the lit gullet stops a bolt and takes the hit where it is drawn. A second bolt fired up the same column a moment later meets the eel recoiling, gets `null` from `lampreyVerdict`, and is drawn flying straight through the head to the top — the owner's complaint, 10 October 2026, in the one case the fix leaves. On HARD that bolt is also a wasted shot and loses the wave. The options: (a) armour while the head stands in the bolt's column in any phase but `leap`, `entering` and `spent` — `lampreyVerdict` answers `"armour"`, `lampreyAside` gives the head's tile in every such phase, and the stopper's foot is the sucker's lower rim (`p.y + p.r * p.tilt`); the recoil's jerk is drawn 1.2 tiles up, so the row met would need the pose's lift in thousandths, or the recoil left out; (b) armour only during `recoil`, the case a double tap hits; (c) leave it. `render/test/core-met.test.ts` covers whichever is chosen.

## A director restarted by a tree move dies with the Bun panic its restart hit

- **Found:** 2026-10-10, claude/pull-lab-animation-feedback-efdf98
- **Files:** `tools/dev/supervise.ts`

A `git rm` of two files under `tools/director/src/pull-goo/` while `director-here` ran: the hot reload failed to resolve the removed imports, the supervisor's tree-move restart fired ("the tree moved — restarting"), and the fresh `bun --hot tools/director/server.ts` child panicked at start (*index out of bounds: the len is 0 but the index is 0*, exit 134, Bun 1.4.2). The loop at the bottom of `supervise.ts` treats a child that exits while `restarting` is false as the human's own stop and exits with its code, so the whole server went down and `bun run shot --port 3000` then failed with ERR_CONNECTION_REFUSED; it was worked around with `--serve`. A child that dies with 134 (a Bun crash, not an idle exit or Ctrl-C) within a few seconds of a restart should be spawned once more after a short wait, and said so in one line; a second crash in a row exits as today. A test that runs the loop against a stub child exiting 134 once proves it.

## A fresh worktree can start a day behind the local `main`

- **Found:** 2026-10-12, claude/pull-lab-visual-redesign-05e743
- **Files:** `tools/hooks/session-start.ts`, `tools/land/lane-start.ts`, `CLAUDE.md`

This lane's worktree was cut at 11 October 11:06 while the local `main` was twenty-odd landings ahead, none of them pushed. The rule's own step, `git fetch origin main && git merge --ff-only origin/main`, said *Already up to date*, so the lane built against files `main` had already moved (`pull-goo/` into `packages/render/src/goo-*.ts`) and only learned it when `bun run land` refused to replay. A check that compares `HEAD` with the local `main` too — `git merge-base --is-ancestor main HEAD`, and `git merge --ff-only main` when it is not — at the start of a lane, by a hook or by the rule's own command, would have caught it in the first minute. `bun run check` proves nothing here; a test of the hook against a branch behind a local `main` does.

## THE PULL LAB has no way to photograph a moment of a pull up close

- **Found:** 2026-10-10, claude/pull-lab-animation-refinements-075bc8
- **Files:** `tools/frames/shot.ts`, `tools/frames/shot-flags.ts`, `tools/director/src/pull-lab-sheet.ts`

Judging a GOO look means seeing one drop at a precise moment of AUTO's loop — the frame a count's fizz starts, the frame a SQUISH grab lands — at many times its size. The EVERY LOOK sheet's cells are 150 px for a whole track, `bun run shot` photographs an element at whatever moment the page is in, and the in-app browser pane, hidden, pauses `requestAnimationFrame`, so the lab's clock does not move at all. Two lanes in a row wrote a throwaway for it; this one was a scratch Playwright script that replaces `performance.now` and `requestAnimationFrame` before the page loads, opens the lab, presses bar buttons by their words, steps the clock in 20 ms frames, enlarges the canvas buffer and crops a square round the drop into a grid. Make it a flag set on `shot`: `--pull-lab "<shape>"`, `--bar "FIZZ,FLAT"` (bar buttons by their words), `--at 0.82,0.9,1.5` (seconds of AUTO's loop) and `--crop x,y,size` in lab pixels, writing one PNG grid. A test that runs it against `--serve` and checks the PNG's size proves it.

A third lane wrote it again on 11 October 2026 (claude/pull-lab-dotted-path-15b934): the waiting path with AUTO off, the ghost lighting the dots and then the place — a strip of eight canvas crops 0.8 s apart. So `--bar` must also turn AUTO off (`○ AUTO`), and `--at` then counts seconds since the drop came in rather than of AUTO's loop.

A fourth, the same day (claude/pull-lab-placeholder-crater-fe6e88), went round the page instead: a scratch entry that calls `gooKnob(GOO)` straight onto a canvas for every DROP at chosen held moments (a fake `PullAfter` with `grabbed`), bundled by `bun build` and inlined into the HTML — `file://` refuses a module script beside it (CORS), and the director's dev server bundles, so `/src/...` cannot be imported from the page either. That is the cheaper half for a drop alone: `--drop-sheet` drawing `SOFT_DROPS` × moments without the lab at all.

A fifth (claude/pull-lab-button-refinements-87bed1, 11 October 2026) found the cheapest way yet: no browser at all. `@napi-rs/canvas` is already a dependency of `packages/render` for `test/pixel-harness.ts`, so a scratch file under `packages/render/` that sets `globalThis.Path2D` to Skia's, imports the GOO knob (`packages/render/src/goo-knob.ts` since) by relative path, sets `GOO_DROP.look` and calls `gooKnob(GOO)` into a grid wrote a PNG in under a second. It cannot live under `tools/director/`, which does not depend on the canvas package. So `--drop-sheet` is best a `bun run drop-sheet "<DROP>" out.png` in `packages/render` or `tools/frames`, with `--r` and `--moments`, and needs neither a server nor `shot`.

A sixth (claude/pull-lab-visual-refinements-253cc3, 11 October 2026) wrote the Skia scratch again, this time driving `paintLab` itself — `freshPull`, `autoThumb`, `press`/`move`/`lift`/`tick` at 1/60 s, as `pullAt` in `pull-lab-sheet.ts` does (that file imports `gestures-page.ts`, so the scratch copies the loop rather than importing it) — and cropping round the knob or round the start of the path. With one drop left (`GOO_DROP`), `--drop-sheet` is now best a `--crop knob|start|wide` and `--at` on that loop.

A seventh (claude/pull-lab-visual-redesign-05e743, 12 October 2026) wrote that `paintLab` loop again, with no thumb at all (only `tick`) to see a waiting drop through the dots' run, one column per entry of `labLooks()` and one row per moment, at the flash (`RUN` in `goo-beat.ts`, 1.35 s) and the place's. So `--at` wants a `--wait` beside it, and a row per LOOK.
## The wave list's footnote still asks for a sentence no wave has

- **Found:** 2026-10-11, claude/wave-grouping-organization-14abd6
- **Files:** `tools/director/index.html`, `tools/director/src/rail-filter.ts`

Under `#waveList` the director says *a wave without a sentence is padding and does not save*, and the filter's `title` still offers *sentence* as a term — but the owner took `sentence` off every wave on 25 September 2026 (`Wave` in `packages/content/src/wave-types.ts`), and the save no longer refuses on it. Drop the paragraph (or say what the save does refuse: a wave with no name), and take *sentence* out of the filter's tooltip and the `waveHaystack` comment. `bun test tools/director` stays green.

## The brush palette draws every brush's picture at startup, on any page

- **Found:** 2026-10-11, claude/pull-lab-perf-routing-b551b5
- **Files:** `tools/director/src/palette.ts`, `tools/director/src/brush-art.ts`, `tools/director/src/when-seen.ts`

A profile of the director loaded at phone size with the CPU slowed four times spends about 1.5 s of a 3.5 s load in `bindPalette` → `render` → `brushArtImage` → `brushSpecimen`: every brush's picture is a world posed and drawn to a data URL before the first paint, even when the URL opens DOCUMENTATION or THE PULL LAB over it and the WAVE column is not on a phone's screen at all. Hold each brush button's picture behind `whenSeen` (`when-seen.ts`, as CONTROLS' cards are) so a palette that is not on screen draws nothing. A scratch Playwright profile (`Profiler.start` around `page.goto`, `Emulation.setCPUThrottlingRate` 4) shows `brushArtImage` gone from a load of `?sheet=states&inner=controlsets`; `bun test tools/director` stays green.

## Longer pulls: every straight one is held to its length by something else

- **Found:** 2026-10-11, claude/pull-longer
- **Files:** `packages/sim/src/config-lamprey.ts`, `packages/sim/src/config-bastion.ts`, `packages/sim/src/config-curtain.ts`, `packages/sim/src/config-fleet.ts`
- **Asks:** Make THE LAMPREY's lifts longer at the cost of rows it may land on, push THE CURTAIN's rail higher, or leave every pull its length?
- **Answered:** 2026-10-13 — both, the owner: (a) THE LAMPREY at 2.2 and 1.8 tiles, landing a row further from top and bottom, and (b) THE CURTAIN's rail a tile higher with the hem's reach 3.5.

The owner asked for longer pulls where reasonable (11 October 2026). Each short
one was tried at half again and each is held by something that is not its
number: THE LAMPREY's head (1.5 tiles) and tail (1.2) must lie whole on the
field wherever it lands, and twelve tests went red on the landings it lost;
THE BASTION's side plates (1.8) pull outward to the screen's edge; THE
CURTAIN's hem (2.5) is drawn from the hem to the rail (`curtainHemReach`), so
a longer number only makes the thumb go further than the knob; THE FLEET's
wreck (1.5) is dragged on a chart whose bottom rows have no room under them.
THE WARDEN's and THE LID's cords (7 tiles), THE SINEW (3) and THE LATCH (2.5)
are already long. Options: (a) THE LAMPREY at 2.2 and 1.8 tiles, landing a
row further from top and bottom; (b) THE CURTAIN's rail a tile higher, the
hem's reach 3.5; (c) leave them.

## Curved pulls: the sim knows only straight ones

- **Found:** 2026-10-11, claude/pull-longer
- **Files:** `tools/director/src/pull-lab-shapes.ts`, `tools/director/src/pull-lab-rule.ts`, `packages/render/src/pull-track.ts`
- **Asks:** Which pulls bend — THE WARDEN's and THE LID's long cords only, every straight pull with room (those two, THE SINEW, THE LATCH), or only bosses still to be built?
- **Answered:** 2026-10-13 — every straight pull with room, the owner: THE WARDEN's and THE LID's cords, THE SINEW and THE LATCH; the sim lane first, then each boss's path.

The owner, 11 October 2026: *curves (custom paths) increase difficulty and are
more exciting than straight lines*. The PULL LAB plays a curve and an S
(`pull-lab-shapes.ts`) and FIZZ draws any polyline (`PullTrack.pts`), but
every pull in `packages/sim` is a distance along one direction. A bend is a
sim lane first: a path in thousandths of a tile the hand's progress is
measured along, and the lab's rule that a thumb half a tile off the path fails
the pull (`pull-lab-rule.ts`, `TOUCH_SLACK` for a finger) — then each chosen
boss's path, drawn from the same numbers.

## THE SLING's cords: a hold, then a pull in its place, in the game too?

- **Found:** 2026-10-12, claude/combo-lab-interactions-d44a22
- **Files:** `packages/sim/src/sling.ts`, `packages/sim/src/sling-hand.ts`, `packages/sim/src/drag-targets-e.ts`, `packages/render/src/sling-grip.ts`, `tools/director/src/field-actions-combo.ts`
- **Asks:** Should THE SLING's cords in the game become THE COMBO LAB's HOLD, THEN PULL — the hold counted on its own, then a pull knob in its place — or keep the swipe on the lift (`DrawRelease`)?
- **Answered:** 2026-10-13 — into the game, the owner: `DrawRelease` becomes a hold stage then a pull stage on the cord's own track, the autopilot and THE SLING's tests with it.

The owner, 12 October 2026, of the lab's HOLD, THEN SWIPE: *should be a separate "hold", then another "pull" appears after it on same place.* The lab now plays it that way (`combo-hold-then-pull.ts`); the game's two cords still loose on a swipe. The options: carry it into the game — `DrawRelease` becomes a hold stage then a pull stage on the cord's own track, the autopilot and THE SLING's tests with it; or leave the game and the lab apart until the generic pull is in the game. `bun test packages/sim/test/sling*` proves the first.

## Five pulls with no knob read as taps now their box is gone

- **Found:** 2026-10-13, claude/director-pull-control-visuals-2a801c
- **Files:** `packages/render/src/gauge-tooth-grip.ts`, `packages/render/src/gauge-grip.ts`, `packages/render/src/taster-grip.ts`, `packages/render/src/vane-grip.ts`
- **Asks:** Should THE GAUGE's tooth and tongue, THE TASTER's wipe and pry, THE VANE's housing and THE GALL's pull be drawn with the PULL LAB's knob, arrow and channel — or keep the plain rings they have?
- **Answered:** 2026-10-13 — (a), the owner: each one's rings become `drawPullKnob` on a `drawPullTrack` the length of its pull, the arrow its sim's direction, over (b) rings with an arrow only and (c) leaving them.

Since 13 October 2026 no grab on the field wears a scan box or a word
(`asksGrab`, `boss-cue-shape.ts`). For the pulls that already draw the PULL
LAB's knob — THE CURTAIN's hem, THE FLEET's wreck — that changes nothing a
player needs; for these five the box and its word were the only things that
said *pull* or *twist*, and what is left is a ring per tooth or part, which
reads as a press. The owner, on THE GAUGE's card on CONTROLS › ON THE
FIELD: it *shows "tap" … but this is category of PULL PAST A DISTANCE*. The
options: (a) each one's rings become `drawPullKnob` on a `drawPullTrack` the
length of its `…PullMilli`, the arrow its sim's direction; (b) keep the rings
and add only the knob's arrow; (c) keep them as they are.

THE GALL is done (2026-10-13, claude/field-controls-standardization-44b3b7,
`render/gall-knob.ts`): the four files above are what is left.

## `bun run shot` cannot press and hold a point on a canvas

- **Found:** 2026-10-13, claude/queue-tasks-968943
- **Files:** `tools/frames/shot.ts`, `tools/frames/shot-flags.ts`

Proving that ▶ TRY IT keeps a take (`field-takes.ts`) meant pressing THE LEAD's ring for a second, waiting three beats, closing the window and opening ▤ STILLS. `--click` presses a selector and nothing else, so it took a throwaway Playwright script — and the browser pane could not stand in, because a hidden pane runs no animation frame and TRY IT steps nothing. Give `shot` a press-and-hold on a point of an element (fractions of its box, a duration, a wait after) and a second `--click` after it, with a test of the flags, so a lane photographs a take in one command.

## The PULL LAB's FIZZ knob costs 400 rings a call

- **Found:** 2026-10-13, claude/field-controls-standardization-44b3b7
- **Files:** `packages/render/src/goo-knob.ts`, `packages/render/src/goo-soft.ts`, `packages/render/src/goo-parts.ts`, `tools/director/test/marks-window.test.ts`

`drawPullKnob` paints FIZZ (`goo-knob.ts`), and one knob costs 0.41 ms on the
stub canvas, against 0.001 ms for the `drawGripRing` it replaced — measured
3000 calls each in a scratch test, 13 October 2026, load average twenty. THE
ANTIPHON's rail now draws one on every candidate, and its row of
`marks-window.test.ts` went from 0.8 s to 4.5 s and timed out twice under
`check:fast`, so that file was given `fileCosts(5000)` rather than a fix.
Find what each call rebuilds — a drop's outline, a noise field, a path per
frame — and cache what does not change between frames (`.claude/skills/render-perf`),
proving it with the op-count budgets and a figure; then take
`marks-window.test.ts` back to bun's default if the row falls under a second.

## `bun run crop` smears a rectangle that runs past the picture's edge

- **Found:** 2026-10-13, claude/queue-tasks-159048
- **Files:** `tools/frames/picture.ts`, `tools/frames/crop-png.ts`

`magnify` clamps every source pixel into the picture, so an `--at` window that
runs past the right or bottom edge comes back the full size asked for, its
overhang filled by the edge column repeated. On THE VANE's VERSUS shot that
read as the bearing's far end stretched into a long bar, and the lane spent
two shots and a re-crop finding out it was the tool. Refuse a window that
leaves the picture, naming the picture's size, or clip it and say so in the
line `crop` prints; a test in `tools/frames/test/` with a window one pixel
over each edge.

## THE INSTAR's turned head may show the glance's hairline

- **Found:** 2026-10-13, claude/queue-tasks-159048
- **Files:** `packages/render/src/instar-turn.ts`, `packages/render/src/glance-layer.ts`

Every boss's VERSUS glance now lays its part down as one offscreen layer
(`drawGlancedLayer`), which took away the hairline two clipped halves left
down a part drawn in layers. THE INSTAR's head ships turning, through
`drawTurnedHead`, and still draws it twice through `drawGlanced` — left
alone because moving it changes a frame of the running game. Shoot the
instar's head mid-turn, magnify the middle (`bun run crop … --zoom 4`), and
if the line is there, it is a fix to something wrong: move it onto
`drawGlancedLayer` with its draw taking the context `g`, as `queen.ts` does.

## A glanced part's translucent rim shows a pale tick at the middle

- **Found:** 2026-10-13, claude/queue-tasks-159048
- **Files:** `packages/render/src/glance-layer.ts`

`drawGlancedLayer` lays the one picture down twice, the first half's clip a
pixel past the middle, so where the picture is itself translucent — THE
SPLICE head's pale rim — that pixel is the rim over itself and reads as a
short pale tick top and bottom (`versus:shot splice:glance sway --freeze
1.5`, crop `--at 1298,200,240,200 --zoom 3`). The line through the body is
gone; this is what is left. Try clearing the second half's clip
(`destination-out`) before laying it down, or snapping the middle to a whole
pixel so the clips need no overlap; prove it on the same crop, and THE
MAZE's additive heart still adding light.

## Holds as the HOLD LAB's drop: THE BATON, THE MIRROR, THE OCULUS

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
- **Files:** `packages/render/src/baton-grip.ts`, `packages/render/src/baton-marks.ts`, `packages/render/src/mirror-grip.ts`, `packages/render/src/oculus-grip.ts`, `packages/render/src/cue-helper.ts`

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

## Holds as the HOLD LAB's drop: THE PULSE, THE WARDEN, THE FLEET

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
- **Files:** `packages/render/src/pulse-grip.ts`, `packages/render/src/warden-grip.ts`, `packages/render/src/fleet-grip-draw.ts`, `packages/render/src/cue-helper.ts`

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

## Holds as the HOLD LAB's drop: THE SURGE, THE ANTIPHON, THE LEAD

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
- **Files:** `packages/render/src/surge-grip.ts`, `packages/render/src/antiphon-grip.ts`, `packages/render/src/lead-grip.ts`, `packages/render/src/cue-helper.ts`

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

## Holds as the HOLD LAB's drop: THE LEDGER, THE SCOUT, THE VANE, THE WELL

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
- **Files:** `packages/render/src/ledger-grip.ts`, `packages/render/src/scout-grip.ts`, `packages/render/src/vane-grip.ts`, `packages/render/src/well-draw.ts`, `packages/render/src/cue-helper.ts`

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

## Holds as the HOLD LAB's drop: THE GAUGE's band, THE QUEEN, THE HIVE

- **Found:** 2026-10-13, claude/docs-control-visuals-consistency-d98efe
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
