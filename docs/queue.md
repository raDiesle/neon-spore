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

## THE LEDGER: lit nerves along the cord, and a new back for its body?

- **Found:** 2026-10-07, claude/undone-boss-tasks-concepts-1f5f11
- **Files:** `packages/render/src/ship-nerves.ts`, `packages/render/src/ledger-cord.ts`, `packages/render/src/ledger-shape.ts`
- **Asks:** Is THE LEDGER kept? Both looks wait on it (the owner, 7 October 2026: skip what is only visual until he has decided whether to keep the boss)

The design's look for THE LEDGER has three parts the game does not draw
(bosses.md §11.27, *Not built of the design's look*). On 7 October 2026 one
turned out to be built already: THE SLOW is marked by its prism round the
body since 26 September. The other two:

1. **The ship's nerves lit along the cord's line** when a return comes down
   it. The write-up argues against it on purpose: the hull's shock is the
   plating's answer to a return, and lit nerves would be a second picture of
   one hit. Option: drop it, or offer it in VERSUS anyway.
2. **The body's lobed back off the shape sheet** rather than
   `ledgerHalfPoints`' own seven points, under the riveted plating the owner
   asked for on 23 September. No free boss draft fits: THE CONDUCTOR is an
   open arm with no inside, and every closed boss shape is taken. Option:
   combine two drafted shapes into a new one and offer it in VERSUS, or keep
   the back as it is.

## THE SURGE's slits gape with the pressure and its eversion turns the body out

- **Found:** 2026-10-07, claude/undone-boss-tasks-concepts-1f5f11
- **Files:** `packages/render/src/surge-shape.ts`, `packages/render/src/surge-flesh.ts`, `packages/render/src/surge-fx.ts`

bosses.md §11 THE SURGE, *Not built of the design's look*: the slits do not gape wider as the pressure rises; the eversion is a fold of the outline, where the design wanted a second body turned out of the first; and a burst's spray across the whole ship is three gums and a jolt. Offer each as a candidate; the write-up leaves all three to the owner's eye. The inner body stays out: §11 argues it is a second boss. A look: offered in VERSUS (`tools/versus/candidates/`, `docs/versus.md`), never straight onto the field (CLAUDE.md, *A look is offered, never replaced*). The owner asked on 7 October 2026 for the *Not built* parts of the shipped bosses to be queued; parts the write-up argues against on purpose are left out.


## THE LEAD's lean is an arrow, and its torch and rock fall out of the body

- **Found:** 2026-10-07, claude/undone-boss-tasks-concepts-1f5f11
- **Files:** `packages/render/src/lead-draw.ts`, `packages/render/src/lead-rock.ts`, `packages/render/src/lead-fx.ts`

bosses.md §11 THE LEAD, *Not built of the design's look*: the lean is a tilt of the stalk, where the design wanted an arrow with a length to it; the ridge does not show the walls the pass turns at; and the torch and the rock are the field's own creatures with a burst over the column, with no fall drawn out of the body. Offer each as a candidate; the write-up leaves all three to the owner's eye. The pass to the farther wall, and bolts doing nothing from the last segment on, are argued in §11 and stay out. A look: offered in VERSUS (`tools/versus/candidates/`, `docs/versus.md`), never straight onto the field (CLAUDE.md, *A look is offered, never replaced*). The owner asked on 7 October 2026 for the *Not built* parts of the shipped bosses to be queued; parts the write-up argues against on purpose are left out.


## THE SCUTTLE's parts are drawn as part of its body, not as a grid of sockets

- **Found:** 2026-10-07, claude/undone-boss-tasks-concepts-1f5f11
- **Files:** `packages/render/src/scuttle-shape.ts`, `packages/render/src/scuttle-draw.ts`, `packages/render/src/scuttle-plate.ts`

bosses-choreographed.md ledger row §15, *Not built*: a part sits in a socket list rather than in the frame's body. Offer a candidate where each part is a lobe of the one frame and leaves a wound in it when it goes. The pod that is not taken losing the wave is the owner's rule of 12 September 2026 (`scuttle-step.ts`) and stays as it is. A look: offered in VERSUS (`tools/versus/candidates/`, `docs/versus.md`), never straight onto the field (CLAUDE.md, *A look is offered, never replaced*). The owner asked on 7 October 2026 for the *Not built* parts of the shipped bosses to be queued; parts the write-up argues against on purpose are left out.


## THE ANTIPHON's organ turns slowly in place, so the pilot has to say which way up

- **Found:** 2026-10-07, claude/undone-boss-tasks-concepts-1f5f11
- **Files:** `packages/sim/src/antiphon.ts`, `packages/sim/src/antiphon-step.ts`, `packages/sim/src/antiphon-hash.ts`, `packages/render/src/antiphon-draw.ts`, `packages/render/src/antiphon-shape.ts`

bosses-choreographed.md §12 step 8, never built: the organ starts turning slowly in place, so the pilot's description has to include which way up it stands, and a candidate on the rail matches only at the right turn. This is a new state on a shipped boss: `.claude/skills/new-boss-state` lists the registrations outside the simulation. Two lanes, the simulation then the look, and the look goes to VERSUS. The 900 ms call windows stay out (the game never evaluates speech). The owner asked on 7 October 2026 for the *Not built* parts of the shipped bosses to be queued.

## THE SPOOL's barrel rolls on its flange (living bosses, step 11)

- **Found:** 2026-10-07, claude/living-bosses-steps-10-11-327a77
- **Files:** `packages/render/src/spool-draw.ts`, `packages/render/src/spool-pose.ts`, `packages/render/src/spool-grip.ts`

Step 11 of `docs/spec/living-bosses.md`: roll the barrel about the
brake-side flange, about 5.5 degrees, so its far end moves more than half
a tile, on the beat clock (`hasp-sway.ts` is the pattern: a local seed,
`bodyLife()`, `slowHush`). The gauge and the brake knob a thumb holds stay
fixed, and the line stays taut to the hull. Write a `spool-sway.ts`, a test
for its reach and its stillness under a hand, two frames paired, and the
spec's *as built* paragraph.

## THE GRINDSTONE's caliper rocks on its axle (living bosses, step 11)

- **Found:** 2026-10-07, claude/living-bosses-steps-10-11-327a77
- **Files:** `packages/render/src/grindstone-caliper.ts`, `packages/render/src/grindstone-grip.ts`, `packages/render/src/grindstone-verdicts.ts`

Step 11 of `docs/spec/living-bosses.md`: rock the open caliper about the
axle, about 0.3 of a radian times how far it is from shut, on the beat
clock with `slowHush`, and still once shut. The jaw pads are marks, so do
*THE GRINDSTONE's jaw pads are placed in two places* first and have the
one pad function take the rock, or the hit test leaves the drawing. Test,
two frames paired, the spec's *as built* paragraph.

## THE SLING's tines twang after a true loose (living bosses, step 11)

- **Found:** 2026-10-07, claude/living-bosses-steps-10-11-327a77
- **Files:** `packages/render/src/sling-draw.ts`, `packages/render/src/sling-pose.ts`, `packages/render/src/sling-grip.ts`

Step 11 of `docs/spec/living-bosses.md`: after a true loose, the two tines
ring out — a decaying swing about the crotch, its tips moving more than
half a tile at the start, read off the loose's beat so both screens agree,
and gone before the next draw is asked for, since a tine is a seat's draw
handle. The 27 September `sling:tine` swing was dropped as too small
(`DECIDED.md`); this one is an event, not an idle drift. Test, two frames
paired, the spec's *as built* paragraph.

## THE INSTAR's fly-in gets a body that matches its side view

- **Found:** 2026-10-07, claude/instar-boss-graphics-3d-b0ba0a
- **Files:** `packages/render/src/instar-flight.ts`, `packages/render/src/instar-front-body.ts`, `packages/render/src/instar-turn.ts`, `packages/render/src/instar-legs.ts`
- **Asks:** Should THE INSTAR fly in seen from the side (A), keep coming in face-on but with a new body (B), or should both go to VERSUS (C)?

The owner, 7 October 2026: *it looks ugly when it flies in*. The scale
strips on the growing body are fixed (`instar-front-body.ts`), and side-on the
dragon now has a turned head and four legs. Face-on, the fly-in is still a
flat mask with a lumpy, segmented tube trailing up and to the right, with no
legs, and its wings are small at that size. Options:
(A) fly in side-on: the approach is drawn in the profile, so the turned head,
legs and raised wings grow in from far away, and it turns face-on only when it
arrives;
(B) stay face-on, but the trailing tube becomes a smooth tapered body seen
a third of the way round (`instar-turn.ts`'s `TURN`), with the legs
hanging off it and the wings spread;
(C) build A and B as VERSUS candidates (`instar:flight`) beside what ships.

## THE GOVERNOR's two baked sprites join the sprite bench

- **Found:** 2026-10-07, claude/governor-graphics-enhancement-b358ca
- **Files:** `tools/raster/src/sprite-demos.ts`, `tools/raster/sprite.ts`, `.claude/skills/sprite/baked-parts.md`, `packages/render/src/governor-face-baked.ts`

`governor-alloy` and `governor-veins` (`governor-face-baked.ts`) are baked
with `sprite-bake.ts` but have no entry in `sprite-demos.ts`, no `BYTES` row
in `tools/raster/sprite.ts` and no row in `baked-parts.md`, so `bun run
sprite` neither shows them nor prints their code bytes, bake time and the
memory a 2× disc takes. Add the demo (play height the dial's diameter, one
state), the `BYTES` row and the `baked-parts.md` line; `bun run sprite
governor-alloy` should print both.

## VERSUS shows one seat for a patch that draws each seat differently

- **Found:** 2026-10-07, claude/tasks-form-queue-9a5f8c
- **Files:** `tools/director/src/versus-seat.ts`, `tools/director/src/versus-diff.ts`

`sinew:band · white` paints the zone as a white block on the pilot's screen
and the sum as a white fill on the navigator's, yet `seatPlan` gave the page
only P1'S SCREEN on THE SINEW · HELD, so the navigator's half is never seen.
Likely `signature` hashes the difference too coarsely to tell two shapes in
the same place apart. Find out why, and make a seat-split candidate show both
seats; a test with two patches drawing different shapes in one rectangle
proves it.

## THE LAMPREY's "worm on the field" sits inside THE BURGEE's write-up

- **Found:** 2026-10-07, claude/burgee-boss-wave-fd8568
- **Files:** `docs/spec/bosses.md`

The block that opens **The worm on the field** (the owner, 6 October 2026,
`sim/lamprey-roam.ts`) and its five bullets stand in §11.56 THE BURGEE,
between *Where this departs from the design* and *What is proven*, though
every word of it is THE LAMPREY's. §11.59 THE LAMPREY's clock paragraph
points to it as "*The worm on the field*, below", so a reader of either
section is sent the wrong way. Move the block, whole, into §11.59 below that
paragraph, and check that nothing else in `docs/` links to it by its old place.

## A held mark shows it is right: THE DAVIT, THE LAMPREY, THE HALTER

- **Found:** 2026-10-07, claude/capstan-boss-feedback-f5635a
- **Files:** `packages/render/src/davit-verdicts.ts`, `packages/render/src/lamprey-verdicts.ts`, `packages/render/src/halter-verdicts.ts`, `packages/render/src/mark-progress.ts`

The owner, 7 October 2026, on THE CAPSTAN and *generic for on-screen
events*: a seat holding its part has to see that the hold is right, that the
partner is still busy, and how far the partner has got, *so that he knows to
keep pulling and holding*. THE CAPSTAN is the worked example
(`capstan-verdicts.ts`): its held pull wears `drawMarkHeld`'s steady green
ring in place of the halo, the cue says `HOLD` to that seat, and the
partner's mark carries `drawMarkProgress`'s segments on both screens. Give
the same to each boss here wherever one seat holds while the other works —
THE DAVIT's boom held on the lit side while the partner swipes, THE
LAMPREY's tail held while the head is freed, THE HALTER's two grips held —
with a test beside `capstan-held.test.ts` for each. A boss whose hold has no
count the simulation keeps gets the green ring and no arc.

## A held mark shows it is right: THE KEEL, THE CYST, THE BURGEE

- **Found:** 2026-10-07, claude/capstan-boss-feedback-f5635a
- **Files:** `packages/render/src/keel-verdicts.ts`, `packages/render/src/cyst-verdicts.ts`, `packages/render/src/trapeze-verdicts.ts`, `packages/render/src/mark-progress.ts`

The same rule and recipe as the entry for THE DAVIT, THE LAMPREY and THE
HALTER above (`capstan-verdicts.ts` is the worked example): THE KEEL's two
ends held through a flip, THE CYST's flank tapped still while the partner
pinches, THE BURGEE's flag held still while the partner draws. Each held
part wears `drawMarkHeld` on both screens, the holder's cue reads `HOLD`, and
the partner's work carries `drawMarkProgress` where the simulation counts it.

## Boss shots kept in SimConfig wait longer too: THE KEEL, THE SEAM

- **Found:** 2026-10-07, claude/capstan-boss-feedback-f5635a
- **Files:** `packages/sim/src/config-keel.ts`, `packages/sim/src/config-seam.ts`, `packages/content/src/waves/act-12.ts`

The owner, 7 October 2026: *when in boss sequences player needs to shoot
cannon, we must give players more time to shoot and hit.* The scripted
bosses of acts twelve and thirteen had their shot steps doubled from three
beats to six that day (`act-13.ts`'s header). Two bosses keep their shot
window in their own config instead and were not touched: THE KEEL's
`keelSocketBeats` and `keelMarrowBeats` (three each), and THE SEAM's
`seamPointBeats`, `seamRockBeats` and `seamGlowBeats`. Read each against its
wave — a window under THE SLOW is already stretched, and a rock's is timed
against its fall — double the ones that are a plain wait for a shot, and move
the sim tests that pin them.

## doc-drift-names' beforeAll timed out under a full `bun run test`

- **Found:** 2026-10-07, claude/capstan-boss-feedback-f5635a
- **Files:** `tools/test/doc-drift-names.test.ts`, `tools/test/repo-time.ts`

A full `bun run test` on 7 October 2026 went red on one case, reported as
`a comment naming something in its own file's subject > (unnamed)` at
6651 ms: the `beforeAll` that reads `declaredNames()` and the whole tree's
text, given `loadedTimeout(150)`. Run alone it passed in seconds, so the
run was retried and nothing was fixed. Find out why the loaded timeout came
out short of the walk at that load — the figure, or how the load is read
when 135 shards start at once — and give the hook a figure that holds.

## More rubs, counted in green, each one seen: THE RIME, THE GRINDSTONE, THE VALVE

- **Found:** 2026-10-07, claude/capstan-boss-feedback-f5635a
- **Files:** `packages/sim/src/config-rime.ts`, `packages/sim/src/config-grindstone.ts`, `packages/sim/src/config-valve.ts`, `packages/render/src/rime-verdicts.ts`, `packages/render/src/grindstone-verdicts.ts`, `packages/render/src/valve-verdicts.ts`, `packages/render/src/mark-progress.ts`

The owner, 7 October 2026: *every "Rub" should require more rubs, and how
much rubs required again should be indicated by green circle around and also
visual should change on any rub of boss.* THE CAPSTAN is the worked example:
`capstanWearThreshold` went from 8 to 12, the band being rubbed carries
`drawMarkProgress`'s green segments, one a reversal, on both screens
(`capstan-verdicts.ts`), and every reversal pops the face, flares it and
thins the rust (`capstan-marks.ts`). Do the same for the other three rubs:
THE RIME's `rimeShaveMilli` (125, eight reversals a half), THE GRINDSTONE's
`grindstoneShaveMilli` (40, twenty-five) and THE VALVE's `valveWipeRubs` (3).
A rub against regrowth counts down a share, not whole reversals, so its ring
is a plain arc, not segments. Check each step's window still holds the new
count at a thumb's pace, and move the sim tests that pin the old one.
