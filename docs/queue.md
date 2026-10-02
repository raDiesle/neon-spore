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

## move one boss a lane onto the solid rig, from the roster

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Needs:** Living bosses — the four rig bosses get the idle drift, one per lane
- **Files:** `packages/render/src/solid-rig.ts`, `docs/style-guide.md`

Released 27 September 2026: the owner moved every deferred entry back onto the
queue. It had been held since 26 September, when new graphics stayed on THE
INSTAR alone. Its work is done through “Living bosses — the four rig bosses
get the idle drift, one per lane”, whose last lane removes this entry.

`drawRig` draws tubes and balls from any side with a fixed key, haze and
contact. Bosses whose bodies are tubes and balls already — THE GORGE, THE
ANTIPHON, THE BATON, THE LEAD — could each be rebuilt as a rig so they turn
correctly when the fight turns them. **Each one is a look**: it goes to
`tools/versus/candidates/` beside the shipped body, one boss per lane, with
`bun run solid`'s pattern for its own sheet. Take one, name it in the entry
you leave behind, and leave the rest listed.

## the rig has no frame.test coverage until a boss uses it

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Needs:** move one boss a lane onto the solid rig, from the roster
- **Files:** `packages/render/test/frame.test.ts`, `packages/render/test/solid.test.ts`

Released 27 September 2026: the owner moved every deferred entry back onto the
queue. It had been held since 26 September, when new graphics stayed on THE
INSTAR alone.

`solid.test.ts` draws the rig through the stub from every side; nothing in
`frame.test.ts` does, because no wave draws one yet. The first boss that ships
on a rig adds its wave there, at SIDE, THREE_QUARTER and FRONT if the fight
reaches them.

## THE GIMBAL, a fifth rig candidate, sharpest for the mirror rule

- **Found:** 2026-09-26, this session
- **Needs:** Living bosses — the four rig bosses get the idle drift, one per lane
- **Files:** `packages/content/src/gimbal-script.ts`, `packages/render/src/gimbal-draw.ts`, `docs/style-guide.md`, `docs/spec/bosses.md`

Released 27 September 2026: the owner moved every deferred entry back onto the
queue. It had been held since 26 September, when new graphics stayed on THE
INSTAR alone. Its work is done through “Living bosses — the four rig bosses
get the idle drift, one per lane”, whose last lane removes this entry. It also
waited on "a densified tube costs a gradient per slice, per frame" and "a
dragged tail wants a verlet chain in Effects", both above.

"move one boss a lane onto the solid rig, from the roster" names THE GORGE,
THE ANTIPHON, THE BATON and THE LEAD. THE GIMBAL is a fifth, and its shape
argues for it over any of the four: it is "a drum in two rings", the outer
facing the pilot and drawn as the wheel is, the inner facing the navigator
*from the other side* so her nought is the wheel's nought and her clockwise
is its counter-clockwise (`docs/spec/bosses.md`, "THE GIMBAL", `gimbalShownMilli`).
That is exactly the failure a flat pose cannot solve and a rig is built for —
`docs/style-guide.md`'s "A boss seen from any side" — because the two rings
are not the same picture mirrored, they are the same wheel seen from its two
faces, which only a body modelled in three dimensions and projected can get
right at once. Two balls (the hubs) and two tubes (the rings, ridged for the
latch-teeth) is the whole rig; the near ring's swept teeth would want the
"long enough to be both in front of and behind another" split the demo's tail
already has a pattern for. Whoever takes this names it in the entry they
leave behind, same as the four already listed, and it is a look:
`tools/versus/candidates/`, never straight onto the field.

## Living bosses — ship THE INSTAR's picked candidates

- **Found:** 2026-09-26, claude/living-motion-spec
- **Taken:** 2026-10-01, claude/queue-living-bosses-ship-the-instars-picked-candidates
- **Where:** local
- **Needs:** Living bosses — THE INSTAR's serpentine flight, as a VERSUS candidate
- **Files:** `packages/render/src/instar-draw.ts`, `packages/render/src/instar-side-head.ts`, `packages/render/src/instar-turn.ts`, `tools/versus/candidates/registry.ts`, `docs/spec/living-bosses.md`
- **Asks:** Of the four THE INSTAR candidates in VERSUS (one head, body with weight, turning, serpentine flight), which ship?
- **Answered:** 2026-09-28, in part — not the one head as it stands. The owner: `INSTAR:HEAD · RIG` looks weird and has no good skin, but its facing toward the player is good and stays. Before this entry ships anything, the rig head needs a skin; the other three are judged once they are on VERSUS.
- **Deferred:** 2026-10-01 — the owner: VERSUS feedback on THE INSTAR comes later, one candidate at a time. Nothing here ships until he gives it.

Put the ones the owner picks on the field and retire what they replace:
with the one head picked, `instar-side-head.ts` and the handover in
`instar-turn.ts` go. Move the section in `docs/spec/living-bosses.md` to
built. `frame.test.ts` draws THE INSTAR at side, three-quarter and front.
`bun run check` proves it.

## Living bosses — the four rig bosses get the idle drift, one per lane

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — ship THE INSTAR's picked candidates
- **Files:** `packages/render/src/gimbal-draw.ts`, `packages/render/src/antiphon-draw.ts`, `packages/render/src/baton-draw.ts`, `packages/render/src/lead-draw.ts`, `packages/render/src/solid-rig.ts`, `docs/spec/living-bosses.md`

The owner, 26 September 2026, widened the depth work from THE INSTAR alone
to every boss with a body; "move one boss a lane onto the solid rig, from
the roster" and "THE GIMBAL, a fifth rig candidate" wait on this entry.
Take the next of THE GIMBAL, THE ANTIPHON, THE BATON and THE LEAD, in that
order: rebuild it on the rig as those two entries say, with
each part it has on its own anchor, give it the idle drift with its own seed
and its hush over windows, give each part its `partDrift` (section 1, "Every
part moves on its own" — at most eight, the head first where it has one, a
mechanism's parts only where they hang or hinge), and offer it as
a VERSUS candidate with its five-yaw sheet sent to the owner. Where it has a
face, the head turns and tilts toward the players' screen and its drift never
carries the face away past side-on (the owner, 27 September 2026:
`docs/spec/living-bosses.md` section 1, "A face looks at the players"). Leave this
entry with the rest listed; the last lane removes it and those two
entries.

Done when, per boss: the candidate is in VERSUS; its hit tests find every
target at the drift's widest; op count within 10%; `baked-growth.test.ts`
flat. `bun run check` proves the tests.

## Every other boss a bolt strikes, held to the lit-open-stopped rule

- **Found:** 2026-10-01, claude/boss-cannon-targeting-feedback-15f334
- **Taken:** 2026-10-02, claude/queue-every-other-boss-a-bolt-strikes-held-to-the-lit
- **Where:** local
- **Files:** `packages/sim/src/shot-out.ts`, `packages/sim/src/core-verdict.ts`, `packages/render/src/core-stop.ts`, `packages/render/src/governor-stop.ts`, `packages/render/src/heartbeat.ts`, `packages/render/test/core-stop.test.ts`, `.claude/skills/new-boss/generic.md`

The owner, 1 October 2026, on THE SEAM *but also all other bosses*: the part
the cannon must hit is lit in its colour and beats like a heart, the bolt has a
clear path to it, and a bolt stops on whatever it meets. On the right part it
bursts; anywhere else it scuffs and does nothing. The rule is the last bullet
of `generic.md`. THE SEAM, THE FLUE and THE GOVERNOR keep it so far.

**Nine are the short case**, their shot already `coreVerdict`
(`sim/core-verdict.ts`) and their own `…Verdict` exported: THE BURGEE,
CAPSTAN, DAVIT, GALL, GRINDSTONE, HALTER, PLUMB, RIME and SLING. Each needs a
`…-stop.ts` calling `coreStopper` with the core's near rim and the body's
`Foot` (`render/core-stop.ts`, THE GOVERNOR's is nine lines), its drawer to
aim it, its lit face to swell on `heartCore` in place of its own cosine, and a
row in `render/test/core-stop.test.ts`. A handful a lane.

**Twenty-two need their verdict pulled out first**, the way THE SEAM's was —
a pure `…Verdict(world, col, color)` the `…Struck` acts on: THE ANTIPHON,
CURTAIN, CYST, GIMBAL, GORGE, HASP, HIVE, KEEL, LEAD, LEDGER, MANTLE, OCULUS,
RATCHET, INSTAR, NETTLE, SCUTTLE, STARE, TASTER, TRIVET, VALVE, VANE and VISE.
THE CYST, OCULUS, TRIVET and VISE judge the middle column and one more, and
may widen `coreVerdict` with a column rather than copy it.

A boss whose target sits behind its own body in another colour is a look. Its
fix goes to VERSUS, not onto the field, unless that is a clipping fault. THE
FLUE is one: its damper drops *down* into the middle column under the core it
bares, and a bolt reaching the core is drawn through it.

Done when every boss above calls `bolts.aim`, a test draws each one with a
bolt stopped, and `bun run check` is green.

## `mergeRecord` refuses a ledger entry whose only change is its trailing newline

- **Found:** 2026-10-02, claude/director-tap-input-boss-bug-778083
- **Taken:** 2026-10-02, claude/queue-the-sinews-crown-cut-at-the-chrome-line-or-at-th (claim: claude/queue-mergerecord-refuses-a-ledger-entry-whose-only-ch)
- **Files:** `tools/land/record-merge.ts`, `tools/land/queue-merge.ts`, `tools/land/test/`

`bun run land --keep` stopped on `docs/time-log.md` with nothing to
disagree about. The lane had appended its entry straight after the last line
of the one before it, with no blank line between, and `split` then gives that
earlier entry's block without its closing `\n`. The trunk had meanwhile
stamped the same earlier entry with its *Measured:* line, so `mergeRecord`
saw both sides rewrite one entry and returned `null`.

Reproduce with the three blobs: base `916af56a5`, trunk `b9b9f7abb`, lane
`03bafef2f`, each `docs/time-log.md`, through `mergeLedger` — it returns
`null`. Compare blocks with trailing whitespace trimmed (in `mergeRecord`'s
equality checks, or by normalising in `split`), and add a test with an entry
appended without the blank line. The release notes share the merge and
gain the same fix.

## `bun run frames` with four `--press` gauge calls draws the mouth shut

- **Found:** 2026-10-02, claude/gauge-wave-cannon-mechanics-fa4bb7
- **Files:** `tools/frames/press.ts`, `tools/frames/drive.ts`, `packages/render/src/gauge-gape.ts`

`bun run frames . --wave "THE GAUGE" --seat p2 --ticks 1250 --press
400:2:call=cyan --press 600:2:call=cyan --press 800:2:call=cyan --press
1000:2:call=cyan --events` reports `gaugeMiss` four times, and the frame
still draws the rim at its shut radius — the same picture as tick 390. The
same four calls sent through `window.neonSpore.send` and `advance` in the
preview, then `paint`, draw it four steps open, and so does the frames run
with `--boss misses=4` or `--boss calledMilli=-1` added. So the tool's world
at the capture is not the one that drew the misses, or its paint reads a
clock `gaugeGapeShown` does not expect. Find which, fix the tool or the
picture, and add a frames test that a pressed miss moves the rim. Worked
around in the lane by `--boss misses=4`.

## THE GAUGE's tooth and tongue mistakes still jam the valve

- **Found:** 2026-10-02, claude/gauge-wave-cannon-mechanics-fa4bb7
- **Files:** `packages/sim/src/gauge-tooth.ts`, `packages/sim/src/gauge-tongue.ts`, `packages/sim/src/gauge-hand.ts`
- **Asks:** Should a wrong tooth, or a tooth or the tongue left in when its rest runs out, open the mouth a step like a miss does, instead of jamming the valve?
- **Answered:** 2026-10-02 — none of the three: *a miss makes the boss wave fail and requires retry. this is generic rules for bosses* (`.claude/skills/new-boss/generic.md`).

A miss opens the mouth now (`gauge-gape.ts`, 2 October 2026), because a jam
the pair did not understand lost the wave to the clock. The rests' three
mistakes still jam it into the next level, which is the same trap. The owner's
answer is the generic rule: every mistake — a miss, a wrong tooth, a tooth or
the tongue left in when its rest runs out — fails the wave, and the game's
own retry starts it again. So the jam has no way in and is retired with its
gesture, pose and cue, and the mouth opens a step per level only (`level`,
not `level + misses`, in `sim/gauge-gape.ts`). Done when each of the four
mistakes fails the wave in a sim test and `bun run check` is green.

## Every boss held to the rule that a miss fails the wave

- **Found:** 2026-10-02, claude/queue-mergerecord-refuses-a-ledger-entry-whose-only-ch
- **Files:** `.claude/skills/new-boss/generic.md`, `packages/sim/src/`, `docs/spec/bosses.md`

The owner made it generic on 2 October 2026: *a miss makes the boss wave fail
and requires retry. this is generic rules for bosses*. THE GAUGE has its own
entry above. Walk every shipped boss's mistakes — a wrong shot, a wrong or
late press, a step left unanswered — and note which cost something other than
the wave: a jam, a step, a level, a heal, a second try. File one entry per
boss that breaks the rule, naming it and the file the mistake is answered in;
a boss already failing the wave on every mistake needs nothing. Done when
each breaking boss has its entry and `bun run check` is green.
