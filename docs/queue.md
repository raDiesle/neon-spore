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
the reason. `bun run land --unverified` writes the line itself when an item
says *real phone*, *real device* or *on glass* (`tools/land/unverified.ts`).

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

## On HARD, whether a shot into a sky boss's armour is a wasted shot

- **Found:** 2026-09-25, claude/hard-wasted-shot
- **Files:** `packages/sim/src/shot-out.ts`, `packages/sim/src/vane.ts`, `packages/sim/src/lead-step.ts`, `packages/sim/test/wasted-shot.test.ts`
- **Asks:** under a boss that hangs above the field, should a shot that meets nothing up there lose the wave on HARD too, or keep costing nothing, as it does now?

HARD's rule (a shot out of the top that nothing took loses the wave) is off
while any of the twelve bosses in `SKY_BOSSES` is up. THE VANE lets a shot
into its shut housing cost nothing, by design, and a right-colour hit on a sky
boss pushes no event either, so the calls in `shotLeaves` cannot tell a bolt that met armour from one that met the sky. Two answers:
**keep the exemption** (nothing to do; delete this entry), or **judge each sky
boss on HARD**. That means each `*Struck` hook returns whether the bolt met
anything, the silent armour paths return true, the rest false, and
`shotLeaves` asks the hooks rather than `SKY_BOSSES`. THE LEAD's later
`leadMiss` (`lead-step.ts`) is the same question a beat late. About twelve
small hook files, and a test per boss in `wasted-shot.test.ts`.

## THE SCUTTLE's thread is drawn backwards and never leaves its socket

- **Found:** 2026-09-24, claude/scuttle-hang-versus-swap
- **Files:** `packages/render/src/scuttle-shape.ts`, `packages/render/src/scuttle-draw.ts`, `packages/render/test/scuttle-frame.test.ts`
- **Asks:** should the drop grow past 0.32 tiles, or should the part and its socket shrink to make room for the thread?

VERSUS `apart` was taken into the game on 24 September 2026 and set
`SCUTTLE_ROWS.drop` to 0.26 tiles. `drawThread` runs from the socket's floor
at `SOCKET_HALF_H` below its centre to the plate's top, another `SOCKET_HALF_H`
above the plate's centre — so the thread has a visible length only once a part
has fallen more than **0.32** tiles, and 0.26 is the most it can ever fall.
At every phase of the cadence the segment is drawn from a lower point to a
higher one; what reaches the screen is the round cap, not a thread. The part
also never clears its socket's own lip, so it reads as seated rather than hung.

The guard admits it anyway — `if (to.y - from.y <= l.tile * SOCKET_HALF_H)
return;` tests against one half height where the drawing spends two — which is
why nothing went red. `scuttle-frame.test.ts`'s thread test now arranges the
part at the end of the cadence to stay green, and that only proves the dim ink
is emitted, not that it is a line.

Two ways out, and they are a look, so they need his answer: **raise the drop**
past 0.32 tiles, which puts a part off an upper row nearer the socket below it
and is most of what `apart` was chosen to avoid at pitch 0.6; or **keep the
drop and shrink the ends** — a smaller `SOCKET_HALF_H` for the socket's floor,
or a plate half height of its own so the thread starts and ends closer in.
Whichever is picked, fix the guard to test the same 2 × `SOCKET_HALF_H` the
drawing spends, and make the test assert the thread's direction rather than
its ink.

## Every boss with a mark answers a touch the way THE INSTAR does

- **Found:** 2026-09-24, claude/bellows-gameplay-clarity
- **Files:** `packages/render/src/grip-verdict.ts`, `packages/render/src/instar-mark-feedback.ts`, `packages/render/src/instar-marks.ts`, `packages/render/src/warden-grip.ts`, `packages/render/src/spool-grip.ts`, `packages/render/src/hasp-grip.ts`, `packages/render/src/sinew-handles.ts`, `.claude/skills/new-boss/owner.md`
- **Asks:** THE INSTAR now shows all four parts of your touch rule: a halo on this seat's mark, a turning ring on the partner's, a green or red flash on the touched mark, and a progress arc that goes green while a pull goes the right way. Should it go to (a) every boss with a mark or handle, one lane per boss, (b) the choreographed bosses first (THE WARDEN, THE SPOOL, THE HASP, THE SINEW), then the rest, or (c) nowhere yet, because THE INSTAR's version needs changing first — and if so, what?

The owner's generic rule of 24 September 2026 is in `owner.md`, in four
numbered parts. He asked for one worked example before a roll-out, and THE
INSTAR is it. `GripVerdicts` and `drawVerdictRing` are already written for any
boss: a boss's fx class holds one `GripVerdicts`, marks it from the events
that mean *right* and *wrong* for that boss, clears it wherever its scene
resets, and the drawer calls `drawVerdictRing` after each mark. Halo and
partner ring are INSTAR-shaped for now. The first boss to take them moves
them out of `instar-mark-feedback.ts` into a shared file.

Per boss, the work is:
- find the events that mean *this touch was right* and *this touch was refused*;
- mark this seat's wanted mark and the partner's;
- make the in-progress signal the simulation's own word for "right direction",
  never a guess the drawer makes — a swipe fills on its way to the length that
  counts, not only on the lift (`instarSwipeAlong` in `sim/src/instar.ts` is
  the pattern, the owner's 24 September);
- add a test beside `packages/render/test/instar-verdict.test.ts`.

Each boss lands as *a look the owner asked for by name*.

## THE GAUGE's cannon colour is a picture, not a rule

- **Found:** 2026-09-25, claude/gauge-cannon-visual-clarity-82d0c7
- **Files:** `packages/sim/src/gauge.ts`, `packages/sim/src/gauge-band.ts`, `packages/content/src/controls-round.ts`, `packages/render/src/gauge-load.ts`, `packages/render/src/gauge-button.ts`
- **Asks:** Should the wound's colour stay a picture, or should P2 get a red and a cyan fire button and a hit need the colour that matches?

The owner asked for the wound to be *mixed up with colour of cannon to hit*.
What shipped is the picture half: the cannon's loaded colour turns cyan and
red with every hit (`loadedAfter(marks)`), and the wound and P2's one call
button wear it. The call is still one comparison of two angles, so nothing
can be fired in the wrong colour. The two options: (a) leave it as it is,
where the colour only ties the wound to the gun and says *new wound*; (b) a
rule, where the call becomes two commands (`call` with a colour), the wound's
colour is drawn by the sim's `Rng` on each `drawBand` and hashed, a wrong
colour is a miss that jams the valve, and P2's panel gets the two regular
fire buttons in place of CALL. (b) is a sim change with a new `GaugeState`
field, the codec, the director's `field-controls-gauge.ts`, and the guide's
three steps.

## THE MAZE's lever turns the drum 2.6 times per lap of its ring

- **Found:** 2026-09-25, claude/pull-circle-animation-9cd78e
- **Files:** `packages/sim/src/config-maze-turn.ts`, `packages/render/src/maze-string.ts`, `packages/sim/test/maze*.test.ts`
- **Asks:** should one lap of the lever round the drum be one turn of the drum?

The lever's channel is now the whole ring round the drum (owner, 25
September 2026), about 21 tiles round, and `mazeDragMilliPerTile` is 45°
a tile — so a thumb that goes once round the ring turns the drum about
2.6 times, and the knob and the gaps in the rings drift apart as it goes.
The options: **1:1** — `mazeDragMilliPerTile` ≈ 17_000 (360° over the
ring's circumference in tiles), the knob stays on the same gap all the way
round, and a way in takes about a third of a lap rather than an eighth; or
**keep 45°/tile** — short gestures, as tuned, with the knob and the drum
geared. 1:1 is a one-number change plus the maze tests that count pulls to
an alignment.

## DEFERRED — §28 THE VISE — sprite atlas experiment: the kernel crack

- **Found:** 2026-09-26, this session
- **Needs:** §28 THE VISE's look, above, landed first
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope:
  new graphics stay on THE INSTAR only, as the one example, until he says
  otherwise. Baked detail (`bun run sprite`, `.claude/skills/sprite`) is
  the cheaper first try when this is taken up again.
- **Files:** `tools/raster/src/`, `packages/render/src/sprite-burst.ts`,
  `assets/raster/`, `docs/raster.md`

`docs/raster.md` rule 3/4/5: the kernel finally breaking open (row 11 of the
beat list, the boss's one payoff frame) is a candidate for a painted
frame-by-frame burst rather than a procedural one — a shell splitting is
smears and irregular debris, not a shape that recolours. It is simulation-
triggered, so rule 5 makes the format a sprite atlas, never an APNG or
animated WebP: draw it the way `burst-art.ts` draws the existing burst,
pack it with `bun run raster` into its own `vise-crack-strip.webp` (atlas)
and `vise-crack.apng` (lossless master), and gate it behind the same
`?raster=1` flag through a new `bindRasterViseCrack` in `apps/game/src/raster.ts`.
**Budget: the atlas (the only file the field fetches) stays under 90 kB**,
the number the existing burst atlas already lands under at 96 px/16 frames —
if the painted version does not read at 12 frames or 80 px, drop frames
before raising the budget. Record the exact atlas byte count in the commit
that lands this, next to the number `bun run raster` printed before this
lane touched anything, so the before/after is in the history rather than
asserted. Offered, never replacing: the procedural crack stays the shipping
look until the owner compares them on the RASTER tab, same as the existing
burst and THE CLASP's shield. `bun run raster:verify` and `bun run check`
prove it; the visual comparison is the owner's, unverified until he has
looked.

## DEFERRED — §29 THE RIME — sprite atlas experiment: the bare-core reveal

- **Found:** 2026-09-26, this session
- **Needs:** §29 THE RIME's look, above, landed first
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope:
  new graphics stay on THE INSTAR only, as the one example, until he says
  otherwise. Baked detail (`bun run sprite`, `.claude/skills/sprite`) is
  the cheaper first try when this is taken up again.
- **Files:** `tools/raster/src/`, `packages/render/src/sprite-burst.ts`,
  `assets/raster/`, `docs/raster.md`

Same experiment, second body: the moment the last rime half wipes away and
the bare core is lit (row 6 of the beat list) is frost shattering off glass —
painterly by `docs/raster.md`'s own test (grain, an irregular edge, no single
distance function), and simulation-triggered, so rule 5 again makes it an
atlas rather than an APNG or WebP. Pack `rime-clear-strip.webp` the same way,
through the same `bun run raster` pipeline, behind `?raster=1`.
**Budget: under 90 kB for the atlas**, same ceiling and same reasoning as
THE VISE's entry above — these two share one budget line in the commit that
lands them, not two separately-justified numbers. Record the exact atlas
byte count next to what `bun run raster` printed beforehand. Offered, never
replacing, same as every other baked look in this file. `bun run
raster:verify` and `bun run check` prove it; the visual comparison is the
owner's, unverified until he has looked.

## §31 THE PLUMB — a desk key that leans

- **Found:** 2026-09-26, claude/queue-31-the-plumb-the-lean-reader
- **Files:** `apps/game/src/keys.ts`, `packages/content/src/keys-desk.ts`, `apps/game/src/lean.ts`
- **Asks:** Which slot leans a seat's phone at a desk on THE PLUMB — the pilot's I/S with the navigator's J/L (the slots the wave leaves idle, but the two seats on different kinds of key), or the arrows, left/right the pilot's and up/down the navigator's (one pair each, but both seats on the one cluster)?

The phone lean landed (`lean.ts`) and a desk still cannot play wave 110:
no key sends a `plumbLevel*` drag. The owner's rule in `keys-desk.ts` is
that no panel adds a letter, and THE PLUMB's fire steps need A/D (the
cannon to the middle column) and Q/E (the colours), so the lean has to take
a slot the wave does not use. Once the slot is picked: each key steps the
seat's lean two degrees either way from a start of ten degrees off level,
sent through `leanReader` so the wire sees the same drag a phone sends;
`drag` is already past `panelSends`'s gate. A test in the shape of
`lean.test.ts` that the two keys walk the reading into the first step's
range. `bun run check` proves it; `keys.ts` is at 244 lines, so the keys go
in a file of their own.

## DEFERRED — §30 THE TRIVET — sprite atlas experiment: the feet planting home

- **Found:** 2026-09-26, this session
- **Needs:** §30 THE TRIVET — its hands, the second half of its look, landed first
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope:
  new graphics stay on THE INSTAR only, as the one example, until he says
  otherwise. Baked detail (`bun run sprite`, `.claude/skills/sprite`) is
  the cheaper first try when this is taken up again.
- **Files:** `tools/raster/src/`, `packages/render/src/sprite-burst.ts`,
  `assets/raster/`, `docs/raster.md`

`docs/raster.md` rule 3/4/5: a foot swinging down and locking home (rows 2,
3, 4 and 5 of the beat list) is a hinge-and-slam motion, not a shape that
recolours — a candidate for a painted frame-by-frame strip rather than a
procedural one. It is simulation-triggered, so rule 5 makes the format a
sprite atlas, never an APNG or animated WebP: draw one foot's swing-and-lock
the way `burst-art.ts` draws the existing burst, pack it with `bun run
raster` into its own `trivet-plant-strip.webp` (atlas) and
`trivet-plant.apng` (lossless master), reused for all three feet by mirror
and gated behind the same `?raster=1` flag through a new
`bindRasterTrivetPlant` in `apps/game/src/raster.ts`. **Budget: the atlas
(the only file the field fetches) stays under 90 kB**, the same ceiling THE
VISE's and THE RIME's atlas experiments already use — if the painted
version does not read at 12 frames or 80 px, drop frames before raising the
budget. Record the exact atlas byte count in the commit that lands this,
next to the number `bun run raster` printed before this lane touched
anything. Offered, never replacing: the procedural plant stays the shipping
look until the owner compares them on the RASTER tab. `bun run
raster:verify` and `bun run check` prove it; the visual comparison is the
owner's, unverified until he has looked.

## DEFERRED — §31 THE PLUMB — sprite atlas experiment: the bob settling true

- **Found:** 2026-09-26, this session
- **Needs:** §31 THE PLUMB's look, above, landed first
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope:
  new graphics stay on THE INSTAR only, as the one example, until he says
  otherwise. Baked detail (`bun run sprite`, `.claude/skills/sprite`) is
  the cheaper first try when this is taken up again.
- **Files:** `tools/raster/src/`, `packages/render/src/sprite-burst.ts`,
  `assets/raster/`, `docs/raster.md`

Same experiment, third body: a counterweight easing to a stop as it settles
true (rows 2, 3, 4 and 5 of the beat list) is a damped swing with a
verdigris sheen, painterly by `docs/raster.md`'s own test, and
simulation-triggered, so rule 5 again makes it an atlas rather than an APNG
or WebP. Pack `plumb-settle-strip.webp` the same way, through the same `bun
run raster` pipeline, behind `?raster=1`. **Budget: under 90 kB for the
atlas**, same ceiling and same reasoning as THE VISE's, THE RIME's and THE
TRIVET's entries above — all four share one budget line in the commit that
lands them, not four separately-justified numbers. Record the exact atlas
byte count next to what `bun run raster` printed beforehand. Offered, never
replacing, same as every other baked look in this file. `bun run
raster:verify` and `bun run check` prove it; the visual comparison is the
owner's, unverified until he has looked.

## Unverified at b8986b62b: READY's lift taking the screen on a real Android phone

- **Found:** 2026-09-26, claude/happy-babbage-ilb1n9
- **Files:** `apps/game/src/fullscreen.ts`, `apps/game/src/join-room-step.ts`, `apps/game/test/shake-permission.test.ts`, `docs/queue.md`, `docs/time-log.md`
- **Where:** phone

*The screen is asked for as the thumb lifts off READY, not as it goes down* landed from a session that could not look at it. What went unchecked:

- READY's lift taking the screen on a real Android phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## DEFERRED — §32 THE SLING — sprite atlas experiment: the arm drawing home

- **Found:** 2026-09-26, this session
- **Needs:** §32 THE SLING's look, above, landed first
- **Deferred:** 2026-09-26, claude/sprite-detail. The owner narrowed scope:
  new graphics stay on THE INSTAR only, as the one example, until he says
  otherwise. Baked detail (`bun run sprite`, `.claude/skills/sprite`) is
  the cheaper first try when this is taken up again.
- **Files:** `tools/raster/src/`, `packages/render/src/sprite-burst.ts`,
  `assets/raster/`, `docs/raster.md`

`docs/raster.md` rule 3/4/5: an arm bending back under load and locking
drawn (rows 2, 3, 4 and 5 of the beat list) is a hinge-and-strain motion,
not a shape that recolours — a candidate for a painted frame-by-frame strip
rather than a procedural one. It is simulation-triggered, so rule 5 makes
the format a sprite atlas, never an APNG or animated WebP: draw one arm's
draw-and-lock the way `burst-art.ts` draws the existing burst, pack it with
`bun run raster` into its own `sling-draw-strip.webp` (atlas) and
`sling-draw.apng` (lossless master), reused for both arms by mirror and
gated behind the same `?raster=1` flag through a new
`bindRasterSlingDraw` in `apps/game/src/raster.ts`. **Budget: the atlas
(the only file the field fetches) stays under 90 kB**, the same ceiling THE
VISE's, THE RIME's, THE TRIVET's and THE PLUMB's atlas experiments already
use — if the painted version does not read at 12 frames or 80 px, drop
frames before raising the budget. Record the exact atlas byte count in the
commit that lands this, next to the number `bun run raster` printed before
this lane touched anything. Offered, never replacing: the procedural draw
stays the shipping look until the owner compares them on the RASTER tab.
`bun run raster:verify` and `bun run check` prove it; the visual
comparison is the owner's, unverified until he has looked.

## Unverified at 920f00b11: THE MANTLE's knobs under two real thumbs on phones: ea…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/render/src/guide-boss-hand.ts`, `packages/render/src/handle-place-boss.ts`, `packages/render/src/handles.ts`
- **Where:** phone

*THE MANTLE answers a thumb: each seat pulls its own knob, either taps the core* landed from a session that could not look at it. The commit touched 10 more files. What went unchecked:

- THE MANTLE's knobs under two real thumbs on phones: each seat's knob taken, the other's falling through

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE JAM's first runaway shot lands on its first lure

- **Found:** 2026-09-26, claude/happy-babbage-ilb1n9
- **Files:** `packages/content/src/waves/act-7.ts`, `tools/director/test/autopilot-field.test.ts`
- **Asks:** Which way should THE JAM open: the fault placed a beat late, the first lure moved off the cannon's column, or the breach kept as the lesson?

THE JAM's beat-0 lure comes on at authored column 3, which is the cannon's
starting column, on tick 75. The runaway cannon's first shot goes off on that
same tick, so the lure takes a red shot before either seat has seen it, and
three `lure` breaches land at tick 152. AUTO answers every beat after that
(`autopilot-jam.ts`), and it is why THE JAM is the one name left in the field
test's `HALF_PLAYED`. The wave's own comment says the first six beats teach
that "the cannon has to *leave*", which it cannot do in time. The options:
`faults: [{ kind: "cannon", color: "alternating", at: 1 }]`, which also moves
which beat opens on red; the first lure authored in another column; or the
breach kept on purpose. Whichever is picked, take THE JAM out of
`HALF_PLAYED` if the test then passes.

## Unverified at d55a95c8a: THE MANTLE's shear kick, core flare and hull shudder a…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/effects-boss-roster.ts`, `packages/render/src/effects-boss.ts`, `packages/render/src/effects-ingest-silent-boss-c.ts`
- **Where:** phone

*THE MANTLE's transients: a shear kicks the shell and shudders the hull* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- THE MANTLE's shear kick, core flare and hull shudder at tempo, by an eye on a phone

**Seen in frames on 27 September 2026, not at tempo:** `bun run frames .
--wave "THE MANTLE" --auto both --until mantleShear` and `--until
mantleBeat`, P1's screen. At the first shear the red wash is on the shell,
the hull ripples out from the struck column and the bursts land on the
valves; after the finishing tap the core is lit. Nothing is clipped or out of
place. What is left is the one thing a frame cannot show: whether the kick
and the shudder read at tempo, in a hand. The desktop app's browser pane
ran the page at about 1.5 frames a second while hidden, so it could not
answer that either.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## DEFERRED — CLOUD ONLY — move one boss a lane onto the solid rig, from the roster

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Deferred:** 2026-09-26, this session. The owner narrowed scope: new
  depth/graphics work stays on THE INSTAR only, as the one example, until
  he says otherwise — no other boss moves onto the rig for now.
- **Files:** `packages/render/src/solid-rig.ts`, `docs/style-guide.md`

`drawRig` draws tubes and balls from any side with a fixed key, haze and
contact. Bosses whose bodies are tubes and balls already — THE GORGE, THE
ANTIPHON, THE BATON, THE LEAD — could each be rebuilt as a rig so they turn
correctly when the fight turns them. **Each one is a look**: it goes to
`tools/versus/candidates/` beside the shipped body, one boss per lane, with
`bun run solid`'s pattern for its own sheet. Take one, name it in the entry
you leave behind, and leave the rest listed.

## DEFERRED — CLOUD ONLY — the rig has no frame.test coverage until a boss uses it

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Deferred:** 2026-09-26, this session. Follows the roster entry above:
  only matters once a non-INSTAR boss ships on the rig, which is paused
  until the owner says so.
- **Files:** `packages/render/test/frame.test.ts`, `packages/render/test/solid.test.ts`

`solid.test.ts` draws the rig through the stub from every side; nothing in
`frame.test.ts` does, because no wave draws one yet. The first boss that ships
on a rig adds its wave there, at SIDE, THREE_QUARTER and FRONT if the fight
reaches them.

## A WebGL glow pass, tried as a candidate with its battery cost measured

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Files:** `packages/render/src/glow.ts`, `tools/versus/candidates/registry.ts`, `docs/performance.md`
- **Where:** local

The owner, 26 September 2026: a GPU glow is worth trying if it is best
practice, and battery and performance matter to him. Glow today is layered
strokes plus baked additive halos (`glow.ts`), all on the 2D canvas. Build the
alternative as a VERSUS candidate, never on the field: draw the bright layer
(halos, rims, lamps) to its own canvas at half or quarter resolution, run a
two-pass blur in one WebGL context, composite it additively over the frame,
and put the whole pass behind a switch so it is off by default. Then measure
it on a real phone against the shipped glow, over the busiest boss wave:
frame time from `bun run perf --wave "<wave>"` on the owner's weekly run, and
battery drain over ten minutes of play with the pass on and off. Write both
numbers into `docs/performance.md`. It ships only if the owner picks it in
VERSUS and the phone numbers hold; otherwise the candidate stays as the
record of why.

## DEFERRED — THE GIMBAL, a fifth rig candidate, sharpest for the mirror rule

- **Found:** 2026-09-26, this session
- **Needs:** "a densified tube costs a gradient per slice, per frame" and "a dragged tail wants a verlet chain in Effects", both above
- **Deferred:** 2026-09-26, this session. Same scope narrowing as the roster
  entry above — no boss but THE INSTAR moves onto the rig for now.
- **Files:** `packages/content/src/gimbal-script.ts`, `packages/render/src/gimbal-draw.ts`, `docs/style-guide.md`, `docs/spec/bosses.md`

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

## Unverified at 81ea644c1: THE RIME wave never watched at tempo

- **Found:** 2026-09-26, claude/queue-29-the-rime-the-simulation-lane
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*Wave 108 THE RIME: rub each half of the lens clear before it frosts back, then shoot the core* landed from a session that could not look at it. The commit touched 56 more files. What went unchecked:

- THE RIME wave never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 65443d517: THE MANTLE's PULL, TAP and FIRE words read at tempo on…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-zc.ts`, `packages/render/src/boss-cue-shape.ts`, `packages/render/src/boss-cue.ts`, `packages/render/test/boss-cue-mantle.test.ts`

*THE MANTLE says what it wants: PULL on each knob, TAP on the core, FIRE over the spark* landed from a session that could not look at it. What went unchecked:

- THE MANTLE's PULL, TAP and FIRE words read at tempo on two phones

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 1711568bc: AUTO playing THE MANTLE to dark, watched at tempo

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/hands/src/autopilot-hands.ts`, `packages/hands/src/boss-hands-mantle.ts`, `packages/hands/src/index.ts`, `tools/director/src/poses-bosses-hands-mantle.ts`

*THE MANTLE has a hand: AUTO pulls both knobs, shoots the spark and taps the core dark* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- AUTO playing THE MANTLE to dark, watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at d08eb0292: THE KEEL's body watched at tempo

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/keel-draw.ts`, `packages/render/src/keel-marks.ts`

*THE KEEL has a body: six iron segments arched over the field, locking rigid one joint at a time* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- THE KEEL's body watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §39 THE BURGEE — the tap's and the draw's touch, the cue and AUTO

- **Found:** 2026-09-27, claude/queue-39-the-burgee-the-look
- **Files:** `packages/render/src/handles.ts`, `packages/render/src/handle-place-boss.ts`, `packages/render/src/boss-cue-read-*.ts`, `packages/hands/src/`, `tools/director/test/autopilot.test.ts`, `tools/director/test/on-field-controls.test.ts`

The simulation landed with none of its hands and the body is on the screen
(§11.56, *The look*). Nothing sends `burgeeFreeze` from a touch — an edge,
a tap on the freeze ring, hit-tested where `burgee-draw.ts` draws it
(`burgeeTip` at the step's offset) — nor `burgeeDraw`: a finger held on
the track and lifted with a swipe, the swipe's sign on `fromMilli`, in a
new burgee-grip.ts the way `capstan-grip.ts` reads the drum. Both then go
from `unbuilt` to `field` in `on-field-controls.test.ts`. The field says no
cue: `TAP` on the ring and `HOLD · SWIPE` on the track on the seat whose
hand each is, and `FIRE` on a lit spindle, on its own `boss-cue-read-*.ts`
page. AUTO has no hand (`NO_HAND` in `autopilot.test.ts`): a
boss-hands-burgee.ts that taps the flag still over the mark from the step's
freezer, draws and swipes from the other and shoots the spindle in its
colour, with an autopilot-burgee.test.ts playing the wave to its end.
`bun run check` proves it; how a freeze answered by a swipe feels stays
unverified until the owner holds two phones.

## §40 THE FLUE — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

No new gesture, no new primitive: `SENDING NOTHING` (THE HALTER's) paired
with `TAPS ON A MOVING TARGET` (THE RATCHET's, THE GALL's) for the first
time. `flueRestBeats` is THE HALTER's own per-seat rest counter, read
exactly the same way; while it sits under threshold the ember drifts
under the simulation's own clock and `TAPS ON A MOVING TARGET` does not
register at all. The new wiring is the coupling: a landed tap advances
`flueTapsLanded` and relocates the ember (THE RATCHET's own rule), but
the instant the resting seat sends one command mid-sequence, both
counters — not just the rest counter — snap to nought together, so a
lapse costs the whole count banked so far rather than only the tap in
flight. Eleven steps, three movements, resting and tapping swapping seat
by movement. The full beat list and primitive table entry are §40 of
`docs/spec/bosses-choreographed.md`. `SENDING NOTHING` and
`TAPS ON A MOVING TARGET` each already carry a §40 THE FLUE entry in
their `where` arrays in `tools/director/src/gesture-unbuilt.ts` — land it
with the rest. THE SLOW on every rest-and-tap window. `bun run check`
proves it.

## §40 THE FLUE — the look

- **Found:** 2026-09-26, this session
- **Needs:** §40 THE FLUE's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a new silhouette (checked
this session against `packages/content/src/silhouettes*.ts` and every
file under `tools/shape-sheet/src/drafts/` — nothing vent- or
duct-shaped exists to reuse or collide with) for a slotted exhaust flue
with an ember riding inside it, a short trailing smear while it drifts
that vanishes the instant it steadies — the tell is the smear's absence,
not a colour change — and a short bright tick on each landed tap, reused
from THE RATCHET's own. No sprite-atlas experiment queued: the drift is
the simulation's own clock running every tick, not a pose resolved once
per beat, the same reasoning THE BURGEE's sweep and THE CAPSTAN's cradle
were both ruled out on. Nothing here is drawn yet and stays unverified
at tempo until the owner has looked.

## DEFERRED — THE STARE's turn is a squash-and-shear, not a placed surface

- **Found:** 2026-09-26, this session
- **Deferred:** 2026-09-26, this session. The owner narrowed scope: new
  depth/graphics work stays on THE INSTAR only, as the one example, until
  he says otherwise — no other boss moves onto placed-surface depth for now.
- **Files:** `packages/render/src/stare-shape.ts`, `packages/render/src/stare-draw.ts`, `packages/content/src/surface.ts`, `.claude/skills/depth`

THE STARE's whole tell is a turn: the eye is seen edge-on as a sliver
while it is away, then widens to its full face over the seven-beat
warning (`stare-shape.ts`'s `face`, `0..1`). It is drawn today by
squashing the almond's width and adding a manual shear so the sliver
"reads as turned rather than squeezed" — the file's own comment says so.
That is exactly the failure `.claude/skills/depth` names: *"an `sx`
cosine with no shading is a coin being flipped... a beautifully lit ball
that does not move is a still life"* — a pose can carry a silhouette but
cannot place a feature (a pupil, a lash, a highlight) by longitude and
latitude, so nothing on the eye can ever be foreshortened or lit
differently between edge-on and face-on; the shear is a hand-built
workaround for the one thing a pose cannot do.

The candidate: replace the squash-and-shear with `surface.ts`'s
`pin`/`facet` projection on the almond socket — the iris, the lashes and
the highlight placed on the surface rather than squashed with it — so
the turn gets a real asymmetric cue and shading instead of a width
number. THE STARE's socket is big enough on screen (`stareShape`'s tile
math) to afford it, and the boss already has nothing else moving that a
placed surface would fight. This is a look and ships only through
`tools/versus/candidates/` (`docs/looks.md`) beside the shipped
squash-and-shear — none of CLAUDE.md's three exemptions apply on their
own (not asked for by name, a shipped alternative already exists, and
the current version is unlovely rather than wrong), so it waits on the
owner picking it, not on a lane landing it straight to the field.

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/keel-draw.ts`, `packages/render/src/keel-marks.ts`

*THE KEEL has a body: six iron segments arched over the field, locking rigid one joint at a time* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- THE KEEL's body watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at b48c6880a: THE KEEL's joint tapped by a real thumb on a phone

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/render/src/handle-place-boss.ts`, `packages/render/src/handles.ts`, `packages/render/src/keel-draw.ts`
- **Where:** phone

*THE KEEL answers a thumb: a tap on the lit joint's ring* landed from a session that could not look at it. The commit touched 9 more files. What went unchecked:

- THE KEEL's joint tapped by a real thumb on a phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at fc7070475: THE KEEL's lock snap, socket shut and hull shock watch…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/effects-boss-roster.ts`, `packages/render/src/effects-boss.ts`, `packages/render/src/effects-ingest-silent-boss-c.ts`

*THE KEEL snaps as it locks: a seam flares, the spine jolts, the hull shudders* landed from a session that could not look at it. The commit touched 6 more files. What went unchecked:

- THE KEEL's lock snap, socket shut and hull shock watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 3d1c57ed7: THE KEEL's TAP and FIRE words read at tempo on a phone

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-zd.ts`, `packages/render/src/boss-cue-shape.ts`, `packages/render/src/boss-cue.ts`, `packages/render/test/boss-cue-keel.test.ts`

*THE KEEL says what it wants: TAP on the lit joint, FIRE under the socket and the rock* landed from a session that could not look at it. What went unchecked:

- THE KEEL's TAP and FIRE words read at tempo on a phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at d4f21f6a4: THE KEEL's autopilot hand watched at tempo on the STAT…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/hands/src/autopilot-hands.ts`, `packages/hands/src/boss-hands-keel.ts`, `packages/hands/src/index.ts`

*THE KEEL has a hand: AUTO taps each joint from its own seat, shuts the socket and shoots the rock* landed from a session that could not look at it. The commit touched 5 more files. What went unchecked:

- THE KEEL's autopilot hand watched at tempo on the STATES sheet

## Unverified at 1f725b94e: THE SLING never watched at tempo, and undrawn

- **Found:** 2026-09-26, claude/queue-32-the-sling-the-simulation-lane
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*THE SLING: the simulation lane — a fork two draws loose, then shoot into* landed from a session that could not look at it. The commit touched 56 more files. What went unchecked:

- THE SLING never watched at tempo, and undrawn
- THE SLING has no touch sender, so no phone can answer it

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §41 THE WINCH — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `tools/director/src/gesture-unbuilt.ts`, `tools/director/src/gesture-unbuilt-b.ts`

No new gesture, no new primitive: `CHORD` (THE TRIVET's `ChordHold`) paired
with `HOLD, THEN SWIPE` (THE SLING's `DrawRelease`) for the first time —
the seam is which seat governs which. One seat holds a two-control chord
down as a brake; the other draws and releases toward a lit column exactly
as THE SLING already resolves it, but the draw only counts while the
brake's chord is still held whole. Breaking the chord — either control
lifted — at any point mid-draw springs the draw back slack, the same
"spring back rather than lose the step outright" `DrawRelease` already
uses for an early or wrong-direction release; it does not reset THE
WINCH's own banked count of prior full turns, only the draw in flight.
This is a harsher coupling than THE CAPSTAN's `TILT, AS A LEVEL` + `RUB`
(a lifted tilt there only pauses the hidden face's rub counter, never
springs anything back) and reads differently from a restraint gate: the
brake seat is not sending nothing, it is actively holding, and it is the
*other* seat's in-progress gesture that answers to it. The full beat list
and primitive table entry are §41 of `docs/spec/bosses-choreographed.md`.
`CHORD` and `HOLD, THEN SWIPE` each already carry a §41 THE WINCH entry
in their `where` arrays, split across `gesture-unbuilt.ts` and the new
`gesture-unbuilt-b.ts` — land both files with the rest. THE SLOW on every
draw the brake is covering. `bun run check` proves it.

## §41 THE WINCH — the look

- **Found:** 2026-09-26, this session
- **Needs:** §41 THE WINCH's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a new silhouette (checked
this session against `packages/content/src/silhouettes*.ts` and every
file under `tools/shape-sheet/src/drafts/` — nothing winch-, drum- or
brake-shaped exists to reuse or collide with) for a drum and cable under
tension, the cable paying out smoothly while the brake holds and snapping
taut with a visible shudder the instant the brake breaks — the tell is
the shudder, not a colour change, the same drawn-as-mechanism choice
THE VALVE's freeze and THE FLUE's ember drift both make. Nothing here is
drawn yet and stays unverified at tempo until the owner has looked.

## §42 THE SLUICE — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `tools/director/src/gesture-unbuilt.ts`

No new gesture, no new primitive: `SqueezeGap` (THE VISE's `SqueezeGap`)
paired with `HOLD, THEN SWIPE` (THE SLING's `DrawRelease`) for the first
time — the seam, as with THE WINCH, is which seat governs which, but the
governing gesture is a continuously-read pinch rather than a flat chord.
One seat pinches a gap shut and must actively re-shut it against its own
regrowth (the same widen-back THE VISE's own gap already has); the other
draws and releases toward a lit column exactly as THE SLING already
resolves it, but the draw only counts while the sealing seat's gap is
currently at or under its shut threshold. The gate opening at any point
mid-draw springs the draw back slack, the same "spring back rather than
lose the step outright" `DrawRelease` already uses for an early or
wrong-direction release. This is a finer-grained version of THE WINCH's
coupling: a chord is either held or not, but a pinch drifts, so the
sealing seat is fighting the gap the whole span the draw is open rather
than simply holding two controls flat. The full beat list and primitive
table entry are §42 of `docs/spec/bosses-choreographed.md`. `SQUEEZE ONE
BODY` and `HOLD, THEN SWIPE` each already carry a §42 THE SLUICE entry in
their `where` arrays in `tools/director/src/gesture-unbuilt.ts` — land it
with the rest. THE SLOW on every seal-and-draw window. `bun run check`
proves it.

## §42 THE SLUICE — the look

- **Found:** 2026-09-26, this session
- **Needs:** §42 THE SLUICE's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a new silhouette (checked
this session against `packages/content/src/silhouettes*.ts` and every
file under `tools/shape-sheet/src/drafts/` — nothing sluice- or
jaw-pinch-shaped exists to reuse or collide with; a `GATE` draft is a bar
across a lane, an unrelated shape) for two lobed jaws over a spillway,
the seal visibly straining and creeping open the instant a thumb eases
rather than snapping between two fixed states, and a bolt that pays out
smoothly while the seal holds and snaps taut with a shudder the instant
the gate springs — the same drawn-as-mechanism choice THE VISE's pinch
and THE WINCH's brake both make. Nothing here is drawn yet and stays
unverified at tempo until the owner has looked.

## §43 THE GOVERNOR — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `tools/director/src/gesture-unbuilt.ts`

No new gesture, no new primitive: `CHORD` (THE TRIVET's `ChordHold`) paired
with `TAPS ON A MOVING TARGET` (THE GALL's, THE FLUE's and the cinematic
RATCHET's own reading of a moving mark) for the first time — and for the
first time on this page, the coupling is not a gate. THE WINCH's chord and
THE SLUICE's pinch each decide whether a different seat's gesture counts
at all; here the chord only ever changes how hard the other seat's tap is
to land. One seat holds `CHORD` whole to keep `governorSpeedMul` at 1×, so
a needle sweeping the rim stays at its scripted base pace; the instant any
control of that chord lifts, the multiplier climbs toward 2× until the
chord is replanted. A tap landed on a needle running hot still counts
exactly as one landed slow — nothing already banked is undone by a broken
chord, unlike every other coupling on this page. The full beat list and
primitive table entry are §43 of `docs/spec/bosses-choreographed.md`.
`TAPS ON A MOVING TARGET` and `CHORD` each already carry a §43 THE
GOVERNOR entry in their `where` arrays in
`tools/director/src/gesture-unbuilt.ts` — land it with the rest. THE SLOW
on every chord-governed tap. `bun run check` proves it.

## §43 THE GOVERNOR — the look

- **Found:** 2026-09-26, this session
- **Needs:** §43 THE GOVERNOR's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a new silhouette (checked
this session against `packages/content/src/silhouettes*.ts` and every
file under `tools/shape-sheet/src/drafts/` — nothing governor-, flywheel-,
needle- or gauge-track-shaped exists to reuse or collide with; the
"needle" hits in `silhouettes-cling.ts` and `silhouettes-mine.ts` are
CALTROP's and the mine's unrelated spikes, not a gauge needle) for a
flywheel governor with two orbiting flyweights, a brake yoke a seat chords
shut, and a needle sweeping a graduated rim track whose speed itself must
read as changing — drawn as the flyweights themselves climbing or
dropping on the spindle rather than as a number or a trail, the same
drawn-as-mechanism choice THE VISE's pinch and THE WINCH's brake both
make. Nothing here is drawn yet and stays unverified at tempo until the
owner has looked.

## DEFERRED — §25 THE VALVE's wheel drawn placed-surface, not a flat spin

- **Found:** 2026-09-26, this session
- **Needs:** nothing — THE VALVE's simulation lane already landed, and its
  look is queued but not yet claimed
- **Deferred:** 2026-09-26, this session. The owner narrowed scope: new
  depth/graphics work stays on THE INSTAR only, as the one example, until
  he says otherwise — no other boss moves onto placed-surface depth or the
  rig for now.
- **Files:** `docs/spec/bosses-choreographed.md`

THE VALVE's wheel (§25) is the best-fitting candidate on this page's whole
unclaimed-look backlog (also carrying THE SEAM, THE OCULUS, THE VISE, THE
RIME, THE TRIVET, THE PLUMB, THE SLING) for `.claude/skills/depth`'s placed-
surface treatment rather than an ordinary flat pose: it is a big body (a
drum, not a 26px creature, where the skill says placed depth is cheap and
safe), it already turns continuously rather than snapping between marks
("the wheel's turn is drawn continuously... a frozen wheel visibly stops
mid-turn"), and the freeze is the boss's whole tell — a wheel with real
foreshortening on its lit mark would make the freeze read as a mechanism
stopping rather than an animation pausing, sharper than a flat disc can.
Concretely: the wheel's mark is a feature pinned by longitude/latitude via
`pin`/`facet` (`packages/content/src/surface.ts`) on the wheel's own face,
so it foreshortens and swings toward/away as the wheel turns — proven at
this size in `TURN IN DEPTH` (`bun run shapes:cues`); the drum body itself
stays an ordinary posed silhouette, only the wheel's face and the pin
sockets are placed. No rig (`drawRig`) needed — nothing here has to be seen
from another side, only from straight on, which is `pin`/`facet` alone. Not
yet checked against `tools/shape-sheet/src/drafts/` for a drum/wheel/valve
silhouette collision — do that first. This is a proposal for which look to
claim next, not a claim itself; the owner or whichever session claims
THE VALVE's look decides.

## §25 THE VALVE — its hands, the second half of its look

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Needs:** §25 THE VALVE — the look, half one (the body), landed first
- **Files:** `packages/render/src/valve-marks.ts`, `packages/render/src/valve-shape.ts`, `packages/render/src/effects-spark-silent-boss-c.ts`, `packages/render/src/effects-ingest-silent-boss-c.ts`, `tools/director/test/on-field-controls.test.ts`, `apps/game/src/`

The body is drawn: the drum, the wheel, the pins, the mark and the socket.
What is left is everything a thumb or an event touches, THE KEEL's half two
in the same order. **The grip**: `valveWheel` answered as a bearing about the
wheel's hub where `valve-shape.ts` puts it (THE HASP's `hasp-grip.ts` is the
model), and `valvePin` as a tap on the socket and a draw of at least
`valvePullMilli` on the live pin; `on-field-controls.test.ts`'s
`valveWheel`/`valvePin` "unbuilt" rows moved to built. **The fx**, in
`Effects` and cleared in `reset()`: the freeze's clamp, the pull, a lapse's
and a thaw's kick, the spark's hull hit and the face falling open; the
thirteen `valve*` events come off the two silent lists as each gets its
burst. **Hurt**, **the cue's words** (TURN on the wheel, FREEZE on the
socket, PULL on the live pin, FIRE on the spark), and the STATES poses. (The
autopilot hand landed 26 September 2026: `hands/boss-hands-valve.ts`, which
plays the whole fight, story included.)
**The story between the pins** (`sim/valve-story.ts`, drawn by
`render/valve-story.ts`) wants the same: its cue words TAP on the jet, HOLD
for the brace and the seal, RUB for the wipe; the grip's reversal and hold
reports reaching `valveRubbed` and `held`; and its twelve events off the
silent lists as each gets its burst.
Unverified at tempo until the owner has looked.

## Unverified at c2a4f79ca: THE VALVE's drum watched at tempo: the wheel's turn, t…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/valve-draw.ts`, `packages/render/src/valve-marks.ts`

*THE VALVE has a body: an iron drum whose notched rim turns with its wheel, listing a step for every pin pulled* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- THE VALVE's drum watched at tempo: the wheel's turn, the freeze, the list

## Unverified at 448d98d6c: THE GRINDSTONE is undrawn and never watched at tempo

- **Found:** 2026-09-26, claude/queue-33-the-grindstone-the-simulation-lane
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*THE GRINDSTONE: the simulation lane — a wheel two thumbs grind true, then shoot into* landed from a session that could not look at it. The commit touched 55 more files. What went unchecked:

- THE GRINDSTONE is undrawn and never watched at tempo
- THE GRINDSTONE has no touch sender, so it cannot be answered on a phone
- THE GRINDSTONE has no autopilot hand

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §26 THE SEAM — its hands, the second half of its look

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Needs:** §26 THE SEAM — the look, half one (the body), landed first
- **Files:** `packages/render/src/seam-marks.ts`, `packages/render/src/slow-intake-aim.ts`, `packages/render/src/effects-spark-silent-boss-c.ts`, `packages/render/src/effects-ingest-silent-boss-c.ts`, `apps/game/src/`

The body is drawn: the ridge, the crack, the lit point, the grit, the rock
and the split. What is left is everything an event or a hand touches. There
is no grip to write — every answer is the standard shot or shield. **The
fx**, in `Effects` and cleared in `reset()`: a sealed point's hull-shock
click, the grit's ordinary deflected-hit spark on the shield (§26,
*Presentation*), a rock shot out, a miss and the split; the nine `seam*`
events come off the two silent lists as each gets its burst. **THE SLOW's
aim** (`slow-intake-aim.ts`) on the lit point, or the rock while one flies:
today it falls back to the cannon, so the prism splits the ridge widest
exactly where the step is being read. **Hurt**, **the cue's words** (FIRE
on the lit point and the rock, SHIELD on the grit), and the STATES poses.
The autopilot hand is done (`hands/boss-hands-seam.ts`,
`director/test/autopilot-seam.test.ts`).
**The story between the pins** (`sim/valve-story.ts`, drawn by
`render/valve-story.ts`) wants the same: its cue words TAP on the jet, HOLD
for the brace and the seal, RUB for the wipe; the grip's reversal and hold
reports reaching `valveRubbed` and `held`; and its twelve events off the
silent lists as each gets its burst.
Unverified at tempo until the owner has looked.

## Unverified at 9676391bb: THE SEAM's ridge watched at tempo: the lit point, the…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/seam-draw.ts`, `packages/render/src/seam-marks.ts`

*THE SEAM has a body: a grey ridge in three stepped lobes whose teeth shed as its points seal* landed from a session that could not look at it. The commit touched 5 more files. What went unchecked:

- THE SEAM's ridge watched at tempo: the lit point, the grit, the rock, the split

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at e72d91c4b: THE OCULUS's lens watched at tempo: the pair sliding s…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/oculus-draw.ts`, `packages/render/src/oculus-marks.ts`

*THE OCULUS's body: a lapped rim, six iris blades that slide shut, the core* landed from a session that could not look at it. The commit touched 6 more files. What went unchecked:

- THE OCULUS's lens watched at tempo: the pair sliding shut under two thumbs, the socket's break, the lit core, the shatter

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §24 THE KEEL — a revised simulation lane, a held breath before the tempo run

- **Found:** 2026-09-26, this session, at the owner's direction: revise the
  bosses added today for a fuller story arc, more distinct visual states and
  more SLOW beats that ask for action
- **Files:** `docs/spec/bosses-choreographed.md`, `tools/director/src/gesture-unbuilt.ts`

THE KEEL already ships (wave 103, `docs/spec/bosses.md` §11.41). The spec
now asks for a new row between the spine going fully rigid and the fast
tempo run: every seam flares, then the whole spine hums and quivers, and
both seats must send nothing — hands off both marks — for three beats
(`SENDING NOTHING`, already built for THE HALTER and THE FLUE, first use on
THE KEEL, so its `where` array in `tools/director/src/gesture-unbuilt.ts`
already carries a §24 THE KEEL entry, land it with the rest) before the hum
settles and the tempo run opens at full brightness; touching either mark
during the hold loosens one segment, which costs one extra tap once the
tempo run starts rather than ending the fight. This is one new field, a
boolean read off the restraint window, plus one new movement dividing the
beat list where the old movement 3 became movement 4. The locked seam's
brightness is now three visibly distinct states across the fight (hairline
after movement 1, a fuller pulsing seam once the socket frees a segment in
movement 2, a held flare then full white on the new row) rather than one
texture throughout — a draw-time read of the existing per-segment locked
booleans and how many are set, no new simulation state beyond the hold's own
boolean. `bun run check` proves the sim half; the new pose (the arch
swelling and dimming through the hold) and the three seam-brightness states
are a look task, queued separately once this lane lands.

## §25 THE VALVE — a revised simulation lane, a held chord to finish it

- **Found:** 2026-09-26, this session, at the owner's direction: revise the
  bosses added today for a fuller story arc, more distinct visual states and
  more SLOW beats that ask for action
- **Files:** `docs/spec/bosses-choreographed.md`, `tools/director/src/gesture-unbuilt.ts`

THE VALVE already ships (wave 104, `docs/spec/bosses.md` §11.42). The three
movements read almost identically today — turn, freeze, pull, three times —
so the spec now escalates the two sparks (thinner after the first pin,
wider and louder after the second, off the same leak the sim already fires)
and replaces the bare "face falls open" ending with a beat: once all three
pins are out, the face strains and hisses against the last seal, and both
seats must hold a chord on it (`CHORD`, already built for THE TRIVET, THE
GRINDSTONE, THE HALTER, THE WINCH, THE GOVERNOR and THE MANTLE — first use
on THE VALVE, so its `where` array in `tools/director/src/gesture-unbuilt.ts`
already carries a §25 THE VALVE entry, land it with the rest) for three
beats before it opens clean; missing it still opens the face, but rough,
with one hull hit as the pressure escapes wrong. This is one new field, a
boolean read off the chord, no new primitive. `bun run check` proves the sim
half; the fifth pose (braced and shuddering) and the two-severity spark are
a look task, queued separately once this lane lands.

## §26 THE SEAM — a revised simulation lane, two beats of holding fire

- **Found:** 2026-09-26, this session, at the owner's direction: revise the
  bosses added today for a fuller story arc, more distinct visual states and
  more SLOW beats that ask for action
- **Files:** `docs/spec/bosses-choreographed.md`

THE SEAM already ships as a choreographed scene gating the standard `FIRE`
and `SHIELD` commands (`docs/spec/bosses.md` §26). This adds two beats built
entirely from restraint: a new row 7 where a false, colourless point flickers
at the crack's midpoint and the pair must send nothing rather than fire at
it, and a new row 11 where the ridge goes dark and still for a breath after
its last real point seals, again answered by holding fire rather than
reaching for a target that no longer exists. Both read off `SENDING
NOTHING`, already built for THE KEEL, THE HALTER and THE FLUE — a reuse, not
a first use, so no gesture-registration edit is needed. This is one new
boolean field per row, both reads off the same restraint primitive, no new
sim state beyond it. `bun run check` proves the sim half; the false point's
dim half-brightness pulse and the two new poses (flickering false point,
sealed white point) are a look task, queued separately once this lane lands.

## Unverified at 84ca0c796: THE MANTLE's brace under two real thumbs at tempo, and…

- **Found:** 2026-09-26, claude/queue-23-the-mantle-a-revised-simulation-lane-more-vis
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`, `packages/audio/src/bind-mantle.ts`, `packages/audio/src/sounds/boss-mantle.ts`
- **Where:** phone

2 commits landed, ending in *Mark §23 THE MANTLE's revised simulation lane done*, from a session that could not look at it. The commit touched 17 more files. What went unchecked:

- THE MANTLE's brace under two real thumbs at tempo, and its sounds heard

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §31 THE PLUMB — a revised simulation lane, a light left to bleed off

- **Found:** 2026-09-26, this session, at the owner's direction: revise the
  bosses added today for a fuller story arc, more distinct visual states and
  more SLOW beats that ask for action
- **Files:** `docs/spec/bosses-choreographed.md`

THE PLUMB's fight ran ten beats deep on `TILT, AS A LEVEL` — level a weight,
guard a fire step, never once ask the pair to put the phones down. Row 11
is new: the spent core's light bleeds down the chains for three beats, and
the pair passes it by sending nothing — leaving both phones flat and
untouched (`SENDING NOTHING`, a reuse, already built for THE KEEL, THE
SEAM, THE OCULUS, THE VISE, THE RIME, THE TRIVET, THE HALTER and THE
FLUE — no `gesture-unbuilt.ts` edit needed). A reflex tilt draws the light
back up and costs one extra beat. THE SLOW, Presentation, Animation (five
poses to six), Colour, Payoff and Cost sections are updated to match; one
new boolean for row 11's hold. `bun run check` proves the sim half; the
sixth pose is a look task, queued separately once this lane lands.

## Unverified at f1a5426ba: THE OCULUS's ghost thumbs seen on a half at tempo whil…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/render/src/guide-boss-hand.ts`, `packages/render/src/handle-place-boss.ts`

*THE OCULUS answers a thumb: each seat holds its own half of the lens* landed from a session that could not look at it. The commit touched 8 more files. What went unchecked:

- THE OCULUS's ghost thumbs seen on a half at tempo while a leaf is held, and two real phones shutting a pair

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §32 THE SLING — a revised simulation lane, a cooling tick left alone

- **Found:** 2026-09-26, this session, at the owner's direction: revise the
  bosses added today for a fuller story arc, more distinct visual states and
  more SLOW beats that ask for action
- **Files:** `docs/spec/bosses-choreographed.md`

THE SLING's fight ran ten beats deep on `HOLD, THEN SWIPE` — draw an arm,
guard a fire step, never once ask the pair to stop holding and stop
drawing. Row 11 is new: the spent yoke ticks as it cools for three beats,
and the pair passes it by sending nothing — no hold, no draw (`SENDING
NOTHING`, a reuse, already built for THE KEEL, THE SEAM, THE OCULUS, THE
VISE, THE RIME, THE TRIVET, THE PLUMB, THE HALTER and THE FLUE — no
`gesture-unbuilt.ts` edit needed). A reflex draw snaps the catch loose
early and costs one extra beat. THE SLOW, Presentation, Animation (five
poses to six), Colour, Payoff and Cost sections are updated to match; one
new boolean for row 11's hold. `bun run check` proves the sim half; the
sixth pose is a look task, queued separately once this lane lands.

## §33 THE GRINDSTONE — a revised simulation lane, a grind left to die out

- **Found:** 2026-09-26, this session, at the owner's direction: revise the
  bosses added today for a fuller story arc, more distinct visual states and
  more SLOW beats that ask for action
- **Files:** `docs/spec/bosses-choreographed.md`

THE GRINDSTONE's fight ran ten beats deep on `RUB` and `CHORD` — grind a
flat, clamp the caliper, guard a fire step, never once ask the pair to do
neither. Row 11 is new: the spent axle grinds faintly against the locked
caliper for three beats, and the pair passes it by sending nothing — no
grind, no chord (`SENDING NOTHING`, a reuse, already built for THE KEEL,
THE SEAM, THE OCULUS, THE VISE, THE RIME, THE TRIVET, THE PLUMB, THE
SLING, THE HALTER and THE FLUE — no `gesture-unbuilt.ts` edit needed). A
reflex grind or chord jars the caliper loose and costs one extra beat. THE
SLOW, Presentation, Animation (five poses to six), Colour, Payoff and Cost
sections are updated to match; one new boolean for row 11's hold. `bun run
check` proves the sim half; the sixth pose is a look task, queued
separately once this lane lands.

The autopilot has a hand for it now (`hands/boss-hands-grindstone.ts`,
`tools/director/test/autopilot-grindstone.test.ts`): it rubs and clamps
only on a lit `left`/`right`/`clamp` step, so row 11 should need nothing of
it — add the row to that test's expectations and prove it sends nothing.

## Unverified at 4b5e7e87c: GRAPHICS → EFFECTS: the five buttons, and each page op…

- **Found:** 2026-09-26, claude/jolly-ramanujan-a02i5z
- **Files:** `docs/INDEX.md`, `docs/time-log.md`, `packages/hands/src/boss-hands-snake-grid.ts`, `packages/hands/src/boss-hands-snake.ts`, `packages/render/src/slow-crawl.ts`, `packages/render/src/slow-fuse.ts`, `packages/render/src/slow-intake-aim.ts`, `packages/render/src/slow-intake.ts`

2 commits landed, ending in *SNAKE's hand plans on flat arrays, and SHED's pose builds in a tenth of the time*, from a session that could not look at it. The commit touched 18 more files. What went unchecked:

- GRAPHICS → EFFECTS: the five buttons, and each page opening in a new tab, seen by an eye
- THE SLOW's CRAWL light watched at tempo in the game (wave with THE SLOW), over the prism and under the fuse

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at f043ab146: THE MANTLE's brace watched at tempo: the shudder, the…

- **Found:** 2026-09-26, claude/queue-23-the-mantle-the-braces-look-and-its-hand
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/hands/src/boss-hands-mantle.ts`, `packages/render/src/boss-cue-read-zc.ts`, `packages/render/src/effects-ingest-silent-boss-c.ts`, `packages/render/src/effects-spark-silent-boss-c.ts`

*§23 THE MANTLE: the brace is drawn, asked for and played* landed from a session that could not look at it. The commit touched 9 more files. What went unchecked:

- THE MANTLE's brace watched at tempo: the shudder, the glow's pulse and the knob rings

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE CYST's own blow at the hull

- **Found:** 2026-09-26, claude/timeout-hits, at the owner's direction: a boss's timeout hit is the boss's own blow, never a rock nobody saw fall
- **Files:** `packages/render/src/boss-strike-look.ts`, `packages/render/test/boss-strike.test.ts`
- **Waits on:** nothing since 26 September 2026: THE CYST's look has landed (`packages/render/src/cyst-*.ts`), so a flank lobe or the spore's tip is there to make the blow from.

THE CYST's timeout already calls `bossStrikesHull` (`packages/sim/src/cyst-step.ts`)
and draws the default lash, a red tendril out of the body to the column and
back. That lash is a floor, not the picture. Give THE CYST a `LOOK` row in
`boss-strike-look.ts` made from its own body, the part of it that acts, in
its own hue, keeping the current style and adding no 3D rig. It has no `FROM` row yet, so the lash leaves the middle column three rows down: give it one off the function its drawer places the body with.
The blow must reach the hull at `reach = 1`, when the crack and the sparks
start. Prove it in `render/test/boss-strike.test.ts`. Anyone can build it
blind: send a PNG of the timeout (`bun run frames . --wave "THE CYST" --until breach`
when the wave misses unattended), or land it `--unverified` if it does not.

## THE GRINDSTONE's own blow at the hull

- **Found:** 2026-09-26, claude/timeout-hits, at the owner's direction: a boss's timeout hit is the boss's own blow, never a rock nobody saw fall
- **Files:** `packages/render/src/boss-strike-look.ts`, `packages/render/test/boss-strike.test.ts`
- **Waits on:** THE GRINDSTONE's body — `packages/render/src` draws nothing of it yet (26 September 2026), so there is no part of it to make the blow from. Take this after its look lands.

THE GRINDSTONE's timeout already calls `bossStrikesHull` (`packages/sim/src/grindstone-step.ts`)
and draws the default lash, a red tendril out of the body to the column and
back. That lash is a floor, not the picture. Give THE GRINDSTONE a `LOOK` row in
`boss-strike-look.ts` made from its own body, the part of it that acts, in
its own hue, keeping the current style and adding no 3D rig. It has no `FROM` row yet, so the lash leaves the middle column three rows down: give it one off the function its drawer places the body with.
The blow must reach the hull at `reach = 1`, when the crack and the sparks
start. Prove it in `render/test/boss-strike.test.ts`. Anyone can build it
blind: send a PNG of the timeout (`bun run frames . --wave "THE GRINDSTONE" --until breach`
when the wave misses unattended), or land it `--unverified` if it does not.

## THE SLING's own blow at the hull

- **Found:** 2026-09-26, claude/timeout-hits, at the owner's direction: a boss's timeout hit is the boss's own blow, never a rock nobody saw fall
- **Files:** `packages/render/src/boss-strike-look.ts`, `packages/render/test/boss-strike.test.ts`
- **Waits on:** THE SLING's body — `packages/render/src` draws nothing of it yet (26 September 2026), so there is no part of it to make the blow from. Take this after its look lands.

THE SLING's timeout already calls `bossStrikesHull` (`packages/sim/src/sling-step.ts`)
and draws the default lash, a red tendril out of the body to the column and
back. That lash is a floor, not the picture. Give THE SLING a `LOOK` row in
`boss-strike-look.ts` made from its own body, the part of it that acts, in
its own hue, keeping the current style and adding no 3D rig. It has no `FROM` row yet, so the lash leaves the middle column three rows down: give it one off the function its drawer places the body with.
The blow must reach the hull at `reach = 1`, when the crack and the sparks
start. Prove it in `render/test/boss-strike.test.ts`. Anyone can build it
blind: send a PNG of the timeout (`bun run frames . --wave "THE SLING" --until breach`
when the wave misses unattended), or land it `--unverified` if it does not.



## THE KEEL's and THE FILAMENT's timeout hits are looked at

- **Found:** 2026-09-26, claude/timeout-hits, at the owner's direction: a boss's timeout hit is the boss's own blow, never a rock nobody saw fall
- **Files:** `packages/sim/src/keel-step.ts`, `packages/sim/src/filament-step.ts`, `packages/sim/test/boss-strike.test.ts`

Both still drop a rock through `breachHull(..., "meteorFastest")`, and the
ratchet test in `sim/test/boss-strike.test.ts` allows them. THE KEEL's
`socketHit` and `spendRock` may be a rock that really is in the picture,
and THE FILAMENT starts its hit from the line's row. Watch each timeout.
Where no rock was on screen before the hit, switch it to `bossStrikesHull`
with a `LOOK` row, and take the file out of `STILL_A_ROCK`. Where the rock
was really there, say so in the test's comment.

## The rounds' own timeout hit, offered on VERSUS beside the rock

- **Found:** 2026-09-26, claude/timeout-hits, at the owner's direction: a boss's timeout hit is the boss's own blow, never a rock nobody saw fall
- **Files:** `packages/sim/src/hull-damage.ts`, `packages/sim/src/events.ts`, `packages/sim/src/fleet.ts`, `packages/sim/src/gauge-round.ts`, `packages/sim/src/maze-verdict.ts`, `packages/sim/src/mirror-round.ts`, `packages/sim/src/pinball-round.ts`, `packages/sim/src/pulse-round.ts`, `packages/sim/src/scout-arena.ts`, `packages/sim/src/snake-move.ts`, `packages/render/src/rock-impact.ts`, `packages/render/src/effects-breach.ts`, `tools/versus/candidates/`, `tools/director/src/versus-pose.ts`, `tools/director/src/poses-versus-states.ts`

The owner answered on 26 September 2026 (17:40Z): *give me a versus
version so i can compare on page*. So the rock stays what the game draws,
and a round's own picture of the hit is a VERSUS candidate beside it.
Nothing of it was built.

1. **The sim names the round.** The eight rounds above break the hull with
   `breachHull(world, col, "meteorFastest", 0, "heavy")` when their window
   runs out. Add `roundStrikesHull(world, round, col)` beside
   `bossStrikesHull` (`sim/boss-strike.ts`) that does the same and puts an
   optional `round` field on the `breach` event (`events.ts`), and call it
   from all eight. Same scar, same sound, same fail: nothing visible moves.
   `sim/test/boss-strike.test.ts` lets these eight through as exceptions;
   make it require `round` on them instead.
2. **The seam is at draw time, not at ingest.** A candidate's record is in
   place only for one `draw()` (`breach-strike.ts` says why), so the choice
   of rock or picture cannot be made in `ingestBreach`. Carry `round` onto
   the rock `rock-impact.ts` spawns, and add an exported record
   `ROUND_STRIKE_LOOK = { paint: null }` in a new file render/round-strike-look.ts
   with `paint(ctx, { round, x, from, to, reach, after, tile, time })`,
   `StrikeFrame`'s shape. In `RockImpactFx.draw`, a rock with a `round`
   while `paint` is set draws the paint instead of the rock body and its
   tail, with `reach` its fall progress; the arrival, the sparks and the
   crack stay on the rock's clock, so nothing else changes. With `paint`
   null the game draws exactly what it draws today; prove that in
   `render/test/frame.test.ts`.
3. **The candidate**, slot `round:timeout-hit`, one shared picture:
   the round's window closing on the ship. A bar of light the width of the
   field comes down from where the rock would have appeared, narrowing to
   one tile over the struck column as it falls, pinches into a spike at
   `reach = 1`, and runs out along the membrane as a flat ring while
   `after` goes to 1. In THE SLOW's colour (`slow-look.ts`), so it reads as
   time rather than stone. No 3D rig. `bun run versus new round:timeout-hit
   window` prints the directory and the rules.
4. **Its pose.** Add a pose in `poses-versus-states.ts` where a round's
   window runs out unattended (the pulse round's meter emptying is the
   easiest to reach with no hand), and a row for the slot in
   `versus-pose.ts`. Judged live, not still: `bun run versus:shot
   round:timeout-hit window --freeze <seconds> --only candidate` for the
   PNG sent to the owner, one frame mid-fall.

Exemption: none. This is a look with a shipped alternative, the rock, and
that is why it goes to VERSUS.

## Unverified at 881f776df: THE DAVIT: no touch sends a lean or draw

- **Found:** 2026-09-26, claude/davit-sim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*§35 THE DAVIT: pair LevelTilt with DrawRelease as a steer, the simulation lane* landed from a session that could not look at it. The commit touched 63 more files. What went unchecked:

- THE DAVIT: no touch sends a lean or draw
- THE DAVIT is undrawn
- THE DAVIT never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 4c7090ce0: THE OCULUS's thud, core flashes and shatter flash watc…

- **Found:** 2026-09-26, claude/queue-27-the-oculus-its-hands-the-second-half-of-its-l
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/effects-boss-roster.ts`, `packages/render/src/effects-boss.ts`

*THE OCULUS's receipts drawn: a shut pair thuds, a core hit flashes wider each time* landed from a session that could not look at it. The commit touched 8 more files. What went unchecked:

- THE OCULUS's thud, core flashes and shatter flash watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 13c34088d: THE VISE's body watched at tempo

- **Found:** 2026-09-26, claude/queue-28-the-vise-the-look
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/reference/style-guide.svg`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/palette-creatures.ts`

*THE VISE gets its body: a seed-case that cracks and bares its kernel* landed from a session that could not look at it. The commit touched 10 more files. What went unchecked:

- THE VISE's body watched at tempo

## Unverified at 3b20854a0: THE OCULUS's HOLD and FIRE words read on two phones at…

- **Found:** 2026-09-26, claude/queue-27-oculus-cue
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-ze.ts`, `packages/render/src/boss-cue.ts`, `packages/render/src/oculus-marks.ts`

*THE OCULUS's cue says HOLD on each half of a lit pair and FIRE under the lit core* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- THE OCULUS's HOLD and FIRE words read on two phones at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 713d49b1e: THE MANTLE's buckle, vent, crack and turn, played at t…

- **Found:** 2026-09-26, claude/queue-23-the-mantle-a-fuller-story-arc-buckle-vent-tur
- **Files:** `docs/INDEX.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`, `packages/audio/src/bind-mantle.ts`, `packages/audio/src/sounds/boss-mantle.ts`, `packages/audio/test/bind.test.ts`

*§23 THE MANTLE fights back: a buckle, a vent, a crosswise crack and a turn* landed from a session that could not look at it. The commit touched 19 more files. What went unchecked:

- THE MANTLE's buckle, vent, crack and turn, played at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8d811b23a: THE VISE's pinch felt with two real fingers on a phone

- **Found:** 2026-09-26, claude/queue-28-the-vise-its-hands-the-second-half-of-its-loo
- **Files:** `apps/game/src/input.ts`, `packages/render/src/pinch-pair.ts`, `packages/render/test/pinch-pair.test.ts`, `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`
- **Where:** phone

*THE VISE answers a pinch: two fingers on your lobe, closed, crack its seam* landed from a session that could not look at it. The commit touched 17 more files. What went unchecked:

- THE VISE's pinch felt with two real fingers on a phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at cce1f5176: THE SLOW's light round THE OCULUS's lens watched at te…

- **Found:** 2026-09-26, claude/queue-27-oculus-aim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/slow-boss-aim.ts`, `packages/render/src/slow-intake-aim.ts`, `packages/render/test/slow-boss-aim.test.ts`

*THE SLOW's light stands round THE OCULUS's lens rather than splitting it* landed from a session that could not look at it. What went unchecked:

- THE SLOW's light round THE OCULUS's lens watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 394267839: THE MANTLE's buckle, vent, cross crack and turn watche…

- **Found:** 2026-09-26, claude/mantle-story-look
- **Files:** `docs/INDEX.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-zc.ts`, `packages/render/src/handle-place-boss.ts`, `packages/render/src/mantle-brace.ts`, `packages/render/src/mantle-draw.ts`, `packages/render/src/mantle-grip.ts`

*THE MANTLE's buckle, vent, cross crack and turn are drawn* landed from a session that could not look at it. The commit touched 5 more files. What went unchecked:

- THE MANTLE's buckle, vent, cross crack and turn watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §32 THE SLING — its hands, the second half of its look

- **Found:** 2026-09-26, claude/queue-32-the-sling-the-look
- **Needs:** §32 THE SLING — the look, half one (the body), landed first
- **Files:** `packages/hands/src/index.ts`, `tools/director/test/autopilot.test.ts`, `tools/director/test/on-field-controls.test.ts`

The body is drawn and the pinch is already on the field: the fork's tines
fold and swing out, each cord slack in cord-brown until the lit step asks
its seat, then glows and draws further home as the pull holds
(`render/sling-marks.ts`, `render/sling-shape.ts`); a thumb anywhere on the
asked seat's own panel takes the cord, the lift carries the swipe's side on
`fromMilli` the way THE WARDEN's hatch does, and the cup lights the step's
colour and brightens once the yoke answers (`render/sling-grip.ts`,
`render/test/sling-grip.test.ts`, `render/test/sling-frame.test.ts`). What
is left is the director's own half: **the pose cards**, a page of them
named for the boss (one per state — folded, both cords slack, a cord
asked, a cord held further home, a cord loosed, the cup dark, the cup lit
and dim, the cup lit and bright, the window closing, spent) and **the
autopilot hand** that drives the world into each of them, a page named for
the boss too (`autopilot.test.ts`'s `NO_HAND` row for SLING coming out),
and the `slingDrawLeft`/`slingDrawRight` rows in `on-field-controls.test.ts`'s
`TARGET_PLACE`/`FIELD_CONTROLS`, moved from `"unbuilt"` to `"field"`
alongside the new `FIELD_CONTROLS` entries once the pose cards exist for
them to name. Unverified at tempo until the owner has looked.

## Unverified at b083b387a: THE SLOW's light round THE GIMBAL, THE HASP, THE MANTL…

- **Found:** 2026-09-26, claude/queue-slow-boss-aim
- **Files:** `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/slow-boss-aim.ts`, `packages/render/test/slow-boss-aim.test.ts`

*THE SLOW's light stands round THE GIMBAL, THE HASP, THE MANTLE, THE VALVE and THE VISE* landed from a session that could not look at it. What went unchecked:

- THE SLOW's light round THE GIMBAL, THE HASP, THE MANTLE and THE VALVE watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 40d1ce2b9: THE MANTLE's spark bursting on the hull, watched at te…

- **Found:** 2026-09-26, claude/mantle-blow
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-strike-look.ts`, `packages/render/src/mantle-blow.ts`, `packages/render/test/boss-strike.test.ts`, `packages/sim/src/mantle-step.ts`

*THE MANTLE's spark bursts on the hull itself, not a rock* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- THE MANTLE's spark bursting on the hull, watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at acbd58fe9: THE VISE's receipts at tempo: a crack's thud, a sprung…

- **Found:** 2026-09-26, claude/vise-fx
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/effects-boss-roster.ts`, `packages/render/src/effects-boss.ts`

*THE VISE's receipts drawn: a crack thuds, a sprung lobe rings open, a kernel hit flashes wider each time* landed from a session that could not look at it. The commit touched 8 more files. What went unchecked:

- THE VISE's receipts at tempo: a crack's thud, a sprung lobe ringing, the kernel's flash and the split's, never seen in a real frame

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 58857f734: THE VISE's SHUT and FIRE read at tempo on a phone, nev…

- **Found:** 2026-09-26, claude/vise-cue
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-zf.ts`, `packages/render/src/boss-cue.ts`, `packages/render/src/vise-marks.ts`

*THE VISE's cue says SHUT on each lobe a lit pinch asks for and FIRE under the lit kernel* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- THE VISE's SHUT and FIRE read at tempo on a phone, never seen in a real frame

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8c0b4ab8c: THE KEEL's flip, marrow and cooldown never watched at…

- **Found:** 2026-09-26, claude/queue-24-the-keel-a-fuller-story-arc-a-flip-a-reveal-a
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`, `packages/audio/src/bind-choreographed-d.ts`, `packages/audio/src/bind-keel.ts`

*THE KEEL's spine flips, lights its marrow and cools before the end* landed from a session that could not look at it. The commit touched 21 more files. What went unchecked:

- THE KEEL's flip, marrow and cooldown never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §29 THE RIME — its hands, the second half of its look

- **Found:** 2026-09-26, claude/queue-29-the-rime-the-look
- **Needs:** §29 THE RIME — the look, half one (the body), landed first
- **Files:** `packages/render/src/rime-marks.ts`, `packages/render/src/effects-spark-silent-boss-c.ts`, `packages/render/src/effects-ingest-silent-boss-c.ts`, `apps/game/src/`

The body is drawn: BULB · PEBBLE's pane of dull glass split down the spine,
THE CAIRN's seven sheets of frost over it with their seams showing, a half's
clear patch as wide as its frost is gone, the lit half white and the other
dulled, a shield step's surge crawling in from the rim, the core lit in its
colour and smaller per hit, and the shatter dropping the sheets apart
(`render/rime-*.ts`, `test/rime-frame.test.ts`). What is left, in lanes:
**the rub on the field** — a thumb down on a half sends `rimeHalfLeft` or
`rimeHalfRight` with its reversal count as the drag's `id`, and nothing on
the field sends one yet — the count is kept already (`packages/render/src/rub-turns.ts`,
THE GRINDSTONE's), so this is a `rime-grip.ts` whose press on a half is a
`rub: true` hold, `grindstone-grip.ts` its model; **the fx**, in `Effects`
and cleared in `reset()` — flakes shaved off under a rub, a half's
clear, the core's hit flash and the shatter's, the twelve `rime*` events off
the two silent lists as each gets its burst, and row 11's refreeze film;
and **the cue's words** (WIPE on the lit half, FIRE on the lit core, SHIELD on a
surge). Unverified at tempo until the owner
has looked. The autopilot hand is done (`hands/boss-hands-rime.ts`,
`director/test/autopilot-rime.test.ts`), and THE SLOW's aim on the lens
(`render/slow-boss-aim-b.ts`).

## Unverified at f36bb0d02: THE RIME's body watched at tempo

- **Found:** 2026-09-26, claude/queue-29-the-rime-the-look
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/reference/style-guide.svg`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/palette-creatures.ts`

*THE RIME's body: a frosted pane of glass, wiped clear a half at a time* landed from a session that could not look at it. The commit touched 8 more files. What went unchecked:

- THE RIME's body watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 54202e6f4: THE KEEL's flip, marrow and cooldown watched at tempo

- **Found:** 2026-09-26, claude/keel-story-look
- **Files:** `docs/INDEX.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-zd.ts`, `packages/render/src/effects-ingest-silent-boss-d.ts`, `packages/render/src/effects-spark-silent-boss-d.ts`, `packages/render/src/keel-draw.ts`, `packages/render/src/keel-grip.ts`

*THE KEEL's flip, marrow and cooldown are drawn* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- THE KEEL's flip, marrow and cooldown watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 2b291c8d3: THE VALVE's jet, brace, wipe and seal watched at tempo

- **Found:** 2026-09-26, claude/queue-25-the-valve-a-fuller-story-arc-a-backdraught-a
- **Files:** `docs/INDEX.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-d.ts`, `packages/audio/src/bind-valve.ts`, `packages/audio/test/bind.test.ts`, `packages/render/src/effects-ingest-silent-boss-d.ts`, `packages/render/src/effects-spark-silent-boss-d.ts`

*THE VALVE tells a story between its pins: a jet, a brace, a wipe and a seal* landed from a session that could not look at it. The commit touched 16 more files. What went unchecked:

- THE VALVE's jet, brace, wipe and seal watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at babf72274: THE VALVE's story states watched at tempo: the jet, th…

- **Found:** 2026-09-26, claude/queue-25-the-valve-a-fuller-story-arc-a-backdraught-a
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/valve-draw.ts`, `packages/render/src/valve-marks.ts`, `packages/render/src/valve-pose.ts`, `packages/render/src/valve-shape.ts`

*THE VALVE's story states are drawn: the jet, the brace, the wipe, the seal* landed from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- THE VALVE's story states watched at tempo: the jet, the brace's shudder, the wipe's film, the seal's seam

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8a8d7d625: THE TRIVET's body watched at tempo

- **Found:** 2026-09-26, claude/trivet-rebase
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/reference/style-guide.svg`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/palette-creatures.ts`

*THE TRIVET is drawn: a gunmetal stand on three needles, its feet lit by the chord* landed from a session that could not look at it. The commit touched 12 more files. What went unchecked:

- THE TRIVET's body watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at ebfb94360: THE SEAM's turn and glow at tempo

- **Found:** 2026-09-26, claude/queue-26-the-seam-the-ridge-turns-away-then-glows-from
- **Files:** `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-d.ts`, `packages/audio/src/bind-seam.ts`, `packages/audio/test/bind.test.ts`, `packages/content/src/waves/act-11.ts`, `packages/render/src/effects-ingest-silent-boss-d.ts`

*THE SEAM turns its face away, then glows from within* landed from a session that could not look at it. The commit touched 13 more files. What went unchecked:

- THE SEAM's turn and glow at tempo

## Unverified at 89325a27f: THE PLUMB's body and level glass seen at tempo on real…

- **Found:** 2026-09-26, claude/queue-31-the-plumb-the-look
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/reference/style-guide.svg`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/core-hurt.ts`

*THE PLUMB is drawn: a bronze bob on a hook, two weights on chains, a level glass under each* landed from a session that could not look at it. The commit touched 15 more files. What went unchecked:

- THE PLUMB's body and level glass seen at tempo on real phones

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 819111adf: THE SEAM's turn and glow watched at tempo

- **Found:** 2026-09-26, claude/queue-26-the-seam-the-ridge-turns-away-then-glows-from
- **Files:** `docs/INDEX.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/seam-draw.ts`, `packages/render/src/seam-story.ts`, `packages/render/test/seam-story-frame.test.ts`

*THE SEAM is drawn turning its back, and glowing from within* landed from a session that could not look at it. What went unchecked:

- THE SEAM's turn and glow watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 143917958: the YouTube thumbnails and video links in docs/spec/tr…

- **Found:** 2026-09-26, claude/queue-unverified-at-8e6e6e71-research-tab-on-the-direc
- **Files:** `docs/queue.md`, `docs/time-log.md`, `tools/director/src/director-markdown.css`, `tools/director/src/markdown.ts`, `tools/director/test/markdown.test.ts`

*The director draws a markdown `---` as a rule, not three dashes* landed from a session that could not look at it. What went unchecked:

- the YouTube thumbnails and video links in docs/spec/transfers-touch.md, opened — the container's proxy refuses YouTube

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `bun run push` sends a merge commit to `main`

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `tools/land/push.ts`, `tools/land/test/`

`origin/main` carries `11f25490a` (*Merge branch 'main' into
claude/queue-the-ratchets-picture-has-never-been-drawn*), against the rule
that history on `main` is linear. It cannot be taken back out without a
force-push, but the next one can be refused: have `push.ts` list
`origin/main..main --merges` before it sends and stop, naming the commit
and saying to rebase it with `bun run land`, when there is any. A test
builds a scratch repository with a merge on `main` and expects the refusal.

## Unverified at 4d7e3fe61: THE TRIVET's chord under real fingers on a phone

- **Found:** 2026-09-26, tmp-trivet-hands
- **Files:** `packages/render/src/chord-pads.ts`, `apps/game/src/input.ts`, `packages/render/test/chord-pads.test.ts`, `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`
- **Where:** phone

*THE TRIVET's pads answer fingers on the field, a chord counted by order* landed from a session that could not look at it. The commit touched 17 more files. What went unchecked:

- THE TRIVET's chord under real fingers on a phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at d75b9936b: THE SLOW's light round THE TRIVET seen in a frame

- **Found:** 2026-09-26, tmp-trivet-aim
- **Files:** `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/slow-boss-aim.ts`, `packages/render/src/trivet-shape.ts`, `packages/render/test/slow-boss-aim.test.ts`

*THE SLOW's light stands round THE TRIVET* landed from a session that could not look at it. What went unchecked:

- THE SLOW's light round THE TRIVET seen in a frame

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8ed29868d: the whole solid sheet (bun run solid) seen by an eye a…

- **Found:** 2026-09-26, claude/queue-cloud-only-a-densified-tube-costs-a-gradient-per
- **Files:** `docs/queue.md`, `docs/time-log.md`, `packages/render/src/solid-tube-draw.ts`, `packages/render/test/solid-budget.test.ts`

*A thin tube of a rig is sliced more coarsely along its length* landed from a session that could not look at it. What went unchecked:

- the whole solid sheet (bun run solid) seen by an eye after a thin tube is sliced more coarsely — only a pixel diff and one magnified fin were looked at

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 48ad4d936: THE TRIVET's HOLD and FIRE seen on the field at tempo

- **Found:** 2026-09-26, tmp-trivet-cue
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-cue-read-zh.ts`, `packages/render/src/boss-cue.ts`, `packages/render/test/boss-cue-trivet.test.ts`

*THE TRIVET's cue says HOLD on each foot a lit chord asks for, and FIRE under the lit hub* landed from a session that could not look at it. What went unchecked:

- THE TRIVET's HOLD and FIRE seen on the field at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8a048e010: THE TRIVET's plant thud, clamp flare, hub flash and co…

- **Found:** 2026-09-26, tmp-trivet-fx
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/effects-boss-roster.ts`, `packages/render/src/effects-boss.ts`

*THE TRIVET's receipts drawn: a plant thuds, a clamp flares as it locks, a hub hit flashes wider each time* landed from a session that could not look at it. The commit touched 8 more files. What went unchecked:

- THE TRIVET's plant thud, clamp flare, hub flash and collapse seen at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §22 THE RATCHET — the story between the teeth, the look

- **Found:** 2026-09-26, claude/older-boss-stories
- **Needs:** §22 THE RATCHET — the story between the teeth, the simulation
- **Files:** `packages/render/src/ratchet-draw.ts`, `packages/render/src/ratchet-pose.ts`, `packages/render/test/frame.test.ts`

Draw §22's four new poses: the rack sagging a tooth, the pawl sprung out of
its seat, teeth grinding with sparks, the spring coiling tighter a turn at a
time. A look with no shipped alternative.

## §20 THE HASP — the story between the hasps, the look

- **Found:** 2026-09-26, claude/older-boss-stories
- **Needs:** §20 THE HASP — the story between the hasps, the simulation
- **Files:** `packages/render/src/hasp-draw.ts`, `packages/render/test/frame.test.ts`

Draw §20's four new poses: a door shaking on its hinge, a wheel spinning
backward with its mark smeared, a hasp furred with rust, three doors swaying
half-shut. A look with no shipped alternative. The simulation landed
27 September 2026 (`sim/hasp-story.ts`), and the existing latch and wheel are
already drawn and take hands in every state (`haspLatchUp`, `haspWheelUp`,
`haspHandHasp`), so what is left is the four poses, their cue words, a sound
of their own for any of the twelve events (`bind-hasp.ts` borrows the door's
now), and striking `hasp` from `OWED` in `tools/director/test/boss-states.test.ts`.

## §21 THE SPOOL — the story between the ribs, the simulation

- **Found:** 2026-09-26, claude/older-boss-stories
- **Files:** `packages/sim/src/spool.ts`, `packages/sim/src/spool-step.ts`, `packages/sim/src/spool-hand.ts`, `packages/sim/src/spool-hash.ts`, `packages/sim/src/config-spool.ts`, `packages/sim/src/events-spool.ts`

Build §21's three story states — the snag, the whip, the fray — as phases
between the ribs, each read off the one brake's depth as a level, THE
VALVE's `valve-story.ts` the pattern. No rib given back; a state run out is
a `bossStrikesHull` and the state again.

## §21 THE SPOOL — the story between the ribs, the look

- **Found:** 2026-09-26, claude/older-boss-stories
- **Needs:** §21 THE SPOOL — the story between the ribs, the simulation
- **Files:** `packages/render/src/spool-draw.ts`, `packages/render/test/frame.test.ts`

Draw §21's three new poses: the line stopped with the casing shuddering, a
loop of line thrown wide, the line furred with standing fibres. A look with
no shipped alternative.

## Unverified at 98106e512: THE TRIVET's lurch aim and needle sparks watched at te…

- **Found:** 2026-09-26, tmp-trivet-aim
- **Files:** `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/slow-boss-aim.ts`, `packages/render/src/trivet-fx.ts`, `packages/render/test/slow-boss-aim.test.ts`, `packages/render/test/trivet-fx.test.ts`

*THE SLOW follows THE TRIVET's lurch, and its hit and turned needle burst where they happen* landed from a session that could not look at it. What went unchecked:

- THE TRIVET's lurch aim and needle sparks watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 29123e6dc: THE HALTER never watched at tempo

- **Found:** 2026-09-26, claude/queue-36-the-halter-the-simulation-lane
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*§36 THE HALTER: pair RestraintGate with ChordHold, the simulation lane* landed from a session that could not look at it. The commit touched 55 more files. What went unchecked:

- THE HALTER never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE CYST's autopilot hand

- **Found:** 2026-09-26, claude/cyst-look
- **Files:** `packages/hands/src/autopilot-hands.ts`, `packages/hands/src/index.ts`, `tools/director/test/autopilot.test.ts`

THE CYST is drawn and can be answered from a touch, but no hand plays it:
it stays in `autopilot.test.ts`'s `NO_HAND`. Write the hand, a new
packages/hands/src/boss-hands-cyst.ts, the way
`boss-hands-vise.ts` plays THE VISE — on a lit flank step, the freezer's
`cystFreeze*` edge; once frozen, the pincher's `cystFlank*` drag with
`fromMilli` at or under `cystShutMilli` until the step's beats are held;
on a swell both flanks at once; on fire, spit and bud the cannon or the
shield at `cystStepCol` — then take THE CYST out of `NO_HAND` and prove it
with `bun run check`.

## Unverified at d30a4b113: THE GRINDSTONE's body never watched at tempo

- **Found:** 2026-09-26, tmp-grindstone-look
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/reference/style-guide.svg`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/grindstone-draw.ts`

*§33 THE GRINDSTONE: the body — THE SMART's wheel ground flat and THE HOOD's caliper biting* landed from a session that could not look at it. The commit touched 8 more files. What went unchecked:

- THE GRINDSTONE's body never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE CYST watched at tempo on two phones

- **Found:** 2026-09-26, claude/cyst-look
- **Files:** `packages/render/src/cyst-draw.ts`, `packages/render/src/cyst-pose.ts`, `packages/render/src/cyst-grip.ts`, `packages/render/src/boss-cue-read-zi.ts`

THE CYST's look (wave 113, `docs/spec/bosses.md` §11.51) is proved by
`cyst-frame.test.ts` and `cyst-grip.test.ts` with its states set, and one
still frame was seen. Nobody has played it at full speed. Open
`bun run preview` with `?play=1` on THE CYST's wave, as P1 and P2, and
play a whole fight by hand: a lit flank, the tap on the partner's mark, the
pinch held until the crack, a swell, a spore, a bud, the bared core fired
at, the split. Check that the `TAP`/`SHUT`/`FIRE` words sit on the thing
they name, that a thumb on a mark is not taken as a pinch, and that THE
SLOW lands on the lit step. Fix anything wrong, rather than unlovely, and
queue each look as its own item.

## Living bosses — the director jumps to any choreography step

- **Found:** 2026-09-26, claude/living-motion-spec
- **Needs:** Living bosses — the director shows which choreography step is playing
- **Files:** `tools/director/src/stage.ts`, `tools/director/src/stage-step.ts`, `tools/director/src/stage-autopilot.ts`, `tools/director/test/stage-step.test.ts`, `docs/spec/living-bosses.md`

Section 3 of `docs/spec/living-bosses.md`. Beside the step readout, add ◀ and
▶ for the step before and after and a list of every step by number and pose
name. A jump rebuilds the world and replays it headless with AUTO on both
seats, the way `stage.seek` replays to a beat, until the boss's `cursor` is
the step asked for and its phase is the start of that step's morph, then
pauses there, drawn. Remember the tick each step was first reached on, so a
later jump replays straight to it; drop the memory on restart and on a wave
change. A jump that cannot reach its step within the wave's length stops at
the furthest step it reached, says so, and stays paused.

Done when: a test jumps THE INSTAR to its last step and back to its second
and finds `cursor` right both times; a second jump to a remembered step
replays no further than its tick; ◀ at step 1 and ▶ at the last do nothing.
`bun run check` proves it.

## Living bosses — THE INSTAR's one head, modelled once, as a VERSUS candidate

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — the idle drift, a helper that draws nothing yet
- **Files:** `packages/render/src/instar-head.ts`, `packages/render/src/instar-side-head.ts`, `packages/render/src/instar-turn.ts`, `packages/render/src/solid-rig.ts`, `packages/content/src/solid-anchor.ts`, `tools/versus/candidates/registry.ts`, `docs/spec/living-bosses.md`

The owner, 26 September 2026: the side head looks unnatural and does not
match the front head. Section 2 of `docs/spec/living-bosses.md` names the
parts: skull ball, short broad muzzle tube, jaw on its own anchor, two horn
tubes, two brow sheets, eyes and head marks placed by `pin`/`facet`. The
face-on head is the design; model it on the rig so the side view is the same
head turned. Build it as a VERSUS candidate beside the shipped two heads,
never on the field, with a sheet at five yaws from face-on to side, jaw shut
and open.

Done when: the candidate is in VERSUS; at face-on it matches the shipped
head's eyes and marks within 2 px at 390 wide; at side-on it has one full
eye, a blunt muzzle and horns sweeping back; the sheet PNG is sent to the
owner; its op count is within 10% of the shipped head's in
`packages/render/test/instar-budget.test.ts`. `bun run check` proves the
tests; the look is his to pick.

## Living bosses — THE INSTAR's body with weight, as a VERSUS candidate

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — THE INSTAR's one head, modelled once, as a VERSUS candidate
- **Files:** `packages/render/src/instar-profile.ts`, `packages/render/src/instar-profile-surface.ts`, `packages/render/src/instar-tail.ts`, `packages/render/src/instar-poses.ts`, `tools/versus/candidates/registry.ts`, `docs/spec/living-bosses.md`

The owner: the body is too thin and does not look cool. Replace the width
the poses' top and bottom lines give with the radius profile in section 2 of
`docs/spec/living-bosses.md` (chest 1.05 head radii, tapering to 0.07 at the
tail's blade), add the paler belly band placed by longitude and a higher
ridge at the chest. Keep the nests sitting on the back in every pose — the
spine still runs under each nest. A VERSUS candidate beside the shipped
body, with the rig sheet at five yaws.

Done when: the candidate is in VERSUS with the new head; every pose of
`packages/render/src/instar-poses.ts` still has both nests on the body (a
test); the tail's width falls monotonically root to tip; the sheet PNG is
sent to the owner; op count within 10%. `bun run check` proves the tests.

## Living bosses — THE INSTAR turns on the idle drift, as a VERSUS candidate

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — THE INSTAR's body with weight, as a VERSUS candidate
- **Files:** `packages/render/src/instar-profile.ts`, `packages/render/src/instar-mark-grip.ts`, `packages/render/src/instar-sway.ts`, `packages/render/test/instar-budget.test.ts`, `packages/render/test/baked-growth.test.ts`, `docs/spec/living-bosses.md`

The owner: the full body should keep turning — look left, then right, the
body too — so it reads 3D. Draw the side-on body through `view(SIDE + yaw)`
with the idle drift's angles, head leading — the head turned toward the
viewer, so its eyes and mouth face the players' screen, and the drift's
"away" half folded back toward them (the owner, 27 September 2026:
`docs/spec/living-bosses.md` section 1, "A face looks at the players") —
and hush it to a tenth over
windows with live marks (it was a third; the owner, 27 September 2026). The mark hit test goes through the same projection
(`instarMarkUnder`), so a drifted mark is found where it is drawn. Give every
part its own `partDrift` on its anchor, as section 1's part map lists them:
head, jaw, eyes, horns, both wings and their claws, the tail links and the
blade — eyes leading the head, the wings' drift letting go while they beat,
the jaw's while the script opens it. A VERSUS candidate beside the
fixed-angle body.

Done when: a test presses every mark of every step at the drift's widest
yaw, with every part at its widest too, and finds it; a test finds the face
turned toward the viewer, never away, at every sampled frame of ten minutes; `packages/render/test/baked-growth.test.ts` stays flat
with the drift running; op count within 10%; a strip of eight frames across
ten seconds is sent to the owner. `bun run check` proves the tests.

## Living bosses — THE INSTAR's serpentine flight, as a VERSUS candidate

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — THE INSTAR turns on the idle drift, as a VERSUS candidate
- **Files:** `packages/render/src/instar-flight.ts`, `packages/render/src/instar-profile-life.ts`, `packages/render/src/solid-motion.ts`, `packages/render/test/instar-flight.test.ts`, `docs/spec/living-bosses.md`

The owner: flight should be serpentine, like a Chinese dragon undulating
through the air. Section 2 of `docs/spec/living-bosses.md`: the head flies a
path with a sideways and a smaller vertical wave; each ring follows where
the head was, by arc length, so the wave travels to the tail; one and a half
crests along the body, growing from a third of a head radius at the neck to
one at the tip; the vertical half seen in depth through the rig's lens; one
slow wing beat per crest past the shoulders. Over `INSTAR_FLIGHT_ENDS` the
wave settles into the resting undulation from where it was, never cut.

Done when: a test finds the crest's position moving tailward every frame of
a flight; `packages/render/test/instar-seams.test.ts` still finds no value
jumping at the landing; the candidate is in VERSUS; a strip of one arrival
is sent to the owner. `bun run check` proves the tests.

## Living bosses — ship THE INSTAR's picked candidates

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — THE INSTAR's serpentine flight, as a VERSUS candidate
- **Files:** `packages/render/src/instar-draw.ts`, `packages/render/src/instar-side-head.ts`, `packages/render/src/instar-turn.ts`, `tools/versus/candidates/registry.ts`, `docs/spec/living-bosses.md`
- **Asks:** Of the four THE INSTAR candidates in VERSUS (one head, body with weight, turning, serpentine flight), which ship?

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
to every boss with a body; this lifts the scope that deferred "move one boss
a lane onto the solid rig, from the roster" and "THE GIMBAL, a fifth rig
candidate". Take the next of THE GIMBAL, THE ANTIPHON, THE BATON and THE
LEAD, in that order: rebuild it on the rig as those two entries say, with
each part it has on its own anchor, give it the idle drift with its own seed
and its hush over windows, give each part its `partDrift` (section 1, "Every
part moves on its own" — at most eight, the head first where it has one, a
mechanism's parts only where they hang or hinge), and offer it as
a VERSUS candidate with its five-yaw sheet sent to the owner. Where it has a
face, the head turns and tilts toward the players' screen and its drift never
carries the face away past side-on (the owner, 27 September 2026:
`docs/spec/living-bosses.md` section 1, "A face looks at the players"). Leave this
entry with the rest listed; the last lane removes it and the two DEFERRED
entries.

Done when, per boss: the candidate is in VERSUS; its hit tests find every
target at the drift's widest; op count within 10%; `baked-growth.test.ts`
flat. `bun run check` proves the tests.

## Living bosses — every other boss gets the outline drift, six per lane

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — the idle drift, a helper that draws nothing yet
- **Files:** `packages/render/src/boss-draw.ts`, `packages/content/src/surface.ts`, `docs/spec/living-bosses.md`

Section 1 of `docs/spec/living-bosses.md`, the outline tier: a boss not on
the rig takes the idle drift as a pose — lean, a small squash across the
turn, a head offset where it has a head — toward the players' screen, the
face turned and tilted at the viewer and never away (the owner, 27 September
2026: `docs/spec/living-bosses.md` section 1, "A face looks at the
players") — surface marks moved by longitude
through `pin`/`facet`. Each part the part map in section 1 marks **ready**
also takes its `partDrift` inside its own save, translate to its joint,
rotate and restore, with the turn shown as a squash by its cosine. Take the
six creatures that come first in `packages/render/src/boss-draw.ts`'s
order, are neither THE INSTAR nor one of the four rig bosses nor a
mechanism, and are not waiting on a **split first** entry; give each its own
seed, and offer the six as one VERSUS candidate with a strip of each. Write the next six into this
entry's body as you leave it; the lane that finds none left removes it.

Done when, per boss: its hit tests find every target at the body's and
every part's widest; no two parts move in step (the helper's test, run on its
part list); op count within 10% for both layers together;
`baked-growth.test.ts` flat. `bun run check` proves the tests.

## Living bosses — the mechanisms swing what hangs or hinges, six per lane

- **Found:** 2026-09-26, claude/living-motion-spec
- **Where:** local
- **Needs:** Living bosses — the idle drift, a helper that draws nothing yet
- **Files:** `packages/render/src/vane-draw.ts`, `packages/render/src/davit-draw.ts`, `packages/render/src/plumb-draw.ts`, `packages/render/src/grindstone-draw.ts`, `packages/render/src/trivet-draw.ts`, `packages/render/src/sling-draw.ts`, `docs/spec/living-bosses.md`

Section 1 of `docs/spec/living-bosses.md`, "A mechanism is not an animal":
the machine bosses take `partDrift` only on the parts that hang or hinge, at
half the table's range, and nothing rigid wobbles. Start with the six named
in `Files:` — the vane's spar tip, the davit's boom and hook, the plumb's
bob, the grindstone's jaws on their bolts, the trivet's feet, the sling's
tines — and offer them as one VERSUS candidate with a strip of each. Then
THE SCUTTLE, THE SPOOL, THE HASP, THE RATCHET, THE VALVE and THE RIME; write
what is left into this entry as you leave it.

Done when, per boss: its hit tests find every target with each part at its
widest; op count within 10%; `baked-growth.test.ts` flat. `bun run check`
proves the tests.

## Living bosses — what turns the bosses' life down

- **Found:** 2026-09-26, claude/living-motion-spec
- **Needs:** Living bosses — the idle drift, a helper that draws nothing yet
- **Files:** `apps/game/src/settings.ts`, `packages/render/src/renderer.ts`, `docs/spec/living-bosses.md`
- **Asks:** What should turn the bosses' part motion down: the existing motion setting, a phone's battery saver, a frame running long, or nothing?

Section 1 of `docs/spec/living-bosses.md`: the part drift is multiplied by a
`life` level from 0 to 1 handed to the drawers with the view, and it is 1
until the owner says otherwise. The options: **the motion setting** (today
it only stills the menu; it would also still the parts, and halve the body
drift); **battery saver** (no browser says so reliably, so it would read a
slow frame rate as the sign); **a frame that runs long** (the drift drops
when the frame time passes its budget, and comes back slowly); or
**nothing** (always 1). Wire the one he picks, with a test that the drawers
see 0 when it says so.

Done when: `life` reaches every drawer that calls `partDrift`; the chosen
source sets it; a test proves the part angles are the parent's at 0.
`bun run check` proves it.

## `--auto-miss` cannot make THE CYST's or THE SLING's shot run out

- **Found:** 2026-09-27, claude/queue-bun-run-frames-cannot-make-a-bosss-window-run-ou
- **Files:** `apps/game/src/auto-miss.ts`, `apps/game/test/auto-miss.test.ts`, `packages/sim/src/cyst-step.ts`, `packages/sim/src/sling-step.ts`, `packages/sim/src/gall-step.ts`
- **Needs:** THE CYST's autopilot hand

`--auto both --auto-miss` keeps AUTO's hands off every other asking window,
and that reaches the timeout blow of THE OCULUS, THE VISE, THE TRIVET, THE
HASP, THE RATCHET and THE GIMBAL. THE CYST and THE SLING breach only when a
*fire* step runs out, and taking the hands off does not stop a shot. The
cannon fires by itself every half beat (`fireEveryBeats`), so a cannon already
under the aim answers the ask with nobody pressing. THE CYST's fire step also
opens no window at all (`cyst-step.ts` `next`), so it is never withheld. The
fix is a misser that moves the cannon off the aim during a withheld fire
window, rather than one that only lets go. Add the two bosses to the test's
list once it lands.

**Tried 27 September 2026, and it cannot be proven yet.** Neither boss has an
AUTO hand (both are in `autopilot.test.ts`'s `NO_HAND`), so with AUTO on both
seats neither fight gets past its first step: THE CYST lights a flank and
shudders it back every 225 ticks for the whole look, and THE SLING lights a
draw and springs it every 600. No fire step is ever lit, so there is nothing
for a misser to let go, and the test's `bossBlow(name, true)` is null for both
before the auto-fire question comes up at all. Work it once THE CYST's hand
and THE SLING's (the hands half of its look) have landed; the `Needs:` line
names the first.

**THE GALL is the third** (27 September 2026, claude/queue-38-the-gall-the-
pinchs-touch-the-cue-and-auto). It has a hand now (`boss-hands-gall.ts`), but
its blow is a fire step that runs out on the bared root (`gall-step.ts`
`miss`), and `--auto-miss` withholds every close as well, so the root is never
bared and the seed (`render/gall-blow.ts`) has never been in a frame. A
misser for it has to play the closes and withhold only the fire step, and
move the cannon off the middle column while it does, because the cannon fires
by itself.

## Every other boss — no mark before its window opens, six per lane

- **Found:** 2026-09-27, claude/boss-visuals-animation-581e11
- **Files:** `packages/render/src/burgee-marks.ts`, `packages/render/src/capstan-marks.ts`, `packages/render/src/cyst-marks.ts`, `packages/render/src/davit-marks.ts`, `packages/render/src/filament-turn-marks.ts`, `packages/render/src/fleet-marks.ts`, `tools/director/test/marks-window.test.ts`

The owner's rule from THE INSTAR entry above, given *e.g. in boss waves*,
so it applies to every boss. Go through each boss's `*-marks.ts` in
`packages/render/src/`, six per lane. Wherever a ring, halo or glyph is
drawn before its window is open — an announce, a faint early ring, a ring
that fades in during a lift — remove it, and give the boss a row in
`tools/director/test/marks-window.test.ts`: each marks function spied, what
in its call says it is lit, and the window by the boss's own predicate in
`sim/`. THE QUEEN's faint rings from the announcement onward are her
mechanic (`docs/spec/controls.md`: P1 is shown both marks); the test says
so and she gets no row. Keep this entry open with the remaining bosses
listed; the last lane removes it.

Done: THE OCULUS, THE VISE, THE TRIVET, THE SEAM (nothing early), THE KEEL
(its socket faded in over the split) and THE VALVE (its notch sat dim on the
drum at rest). Left: THE BURGEE, THE CAPSTAN, THE CYST, THE DAVIT, THE
FILAMENT and THE FLEET in the Files above; then THE GALL, THE GRINDSTONE,
THE HALTER, THE PLUMB, THE RIME and THE SLING. The other `*-marks.ts` files
are creatures and rounds, not bosses.

Done when, per boss: the shared test has its row and it passes. `bun run
check` proves it.

## Every other boss — holds still while its marks are live, six per lane

- **Found:** 2026-09-27, claude/boss-visuals-animation-581e11
- **Taken:** 2026-09-27, claude/queue-every-other-boss-holds-still-while-its-marks-are
- **Files:** `tools/director/test/boss-hush.test.ts`, `tools/director/test/boss-hush-drawn.ts`, `packages/render/src/slow-hush.ts`, `packages/render/src/boss-cue.ts`

The same rule as THE INSTAR's, for every boss: in an open slow window with a
live mark, the body's *natural* motion eases to a tenth. That covers a
breath, a bob, a sway and an outline drift. Motion that *is* the rule stays:
THE SINEW's mass falls a row a beat, THE FILAMENT's heart shrinks as each
filament is pulled (`slow-boss-aim-b.ts` names both). Six per lane: find what
moves each boss's marks during a window, hush the natural part, and add the
boss to one shared test that walks its wave with AUTO and measures each live
mark's drawn point at under 0.1 tile a second. Keep this entry open with the
remaining bosses listed. The speed is the rule and the tenth is a guess: THE
INSTAR's weave needed a twentieth to get under it (`instar-sway.ts`
`HUSHED`), and `instar-sway.test.ts`'s "a window hushes the weave" is the
shape of the test.

Done when, per boss: the shared test has its row and it passes. `bun run
check` proves it.

**The first lane, 27 September 2026:** the shared test is
`tools/director/test/boss-hush.test.ts`, and the curve is `slow-hush.ts`
(`slowHush`, which THE INSTAR's hush is now a depth of). Rows: THE UNDERTOW,
THE GORGE, THE CURTAIN, THE TASTER, THE LEAD. Their rings are placed off
state alone, and their wall-clock motion is skin, a breathing radius or a
hit's shake. THE SCUTTLE's wind-up shiver is hushed to a twenty-fifth
(`scuttle-draw.ts` `SHIVER_HUSHED`), but it has no row: its cue reads the
part's row and not its drawn rise and hang, so the test would pass whatever
the part did. **The test reads `bossCue`, which is blind to the wall clock
and to any pose the cue stands its word clear of.** The next lane should add
a drawn-mark reader per boss, where the cue is not the ring's place, before
it adds a row.

**The second lane, 27 September 2026:** the test now reads every cue a
screen may see (`bossCues`, exported), each matched to itself by its seed, so
a cue handing over to another mark is not counted as motion; that was all
of THE BATON's 30 tiles a second, and THE RATCHET's `FIRE` handing to its
bar. **`DRAWN` in the test is the drawn-mark reader**: a boss's marks placed
where no cue reaches, as its draw places them. A cue goes once the thumb does
what it asks, so a held mark is only there. THE MANTLE's is its two knobs
under the brace shudder, which carried them at 1.3 tiles a second under AUTO
and is hushed to a fortieth (`mantle-brace.ts` `SHUDDER_HUSHED`). New rows:
THE HASP, THE RATCHET, THE MANTLE, THE KEEL, THE OCULUS, THE VISE, THE BATON.
Each of their draws was read for `time`, and what else moves is skin: a lit
highlight's wobble, a spent clasp's slack, the oculus's leaves settling, a
knob's outline, a hit's shake.

**The third lane, 27 September 2026:** new rows THE RIME, THE TRIVET, THE
PLUMB, THE GRINDSTONE, THE CYST and THE CAPSTAN. Only THE CAPSTAN's marks
moved on the clock: its rattle shook and rolled the face being rubbed at 1.4
tiles a second, and `capstanShake` (`capstan-pose.ts`) now hushes both to a
twenty-fifth. The roll had to be hushed on its own, because `capstanJudder`
does not scale it with the reach. The others' clocks move no mark: THE
PLUMB's weights, THE RIME's fog, THE CYST's covered core (bared, it holds
still), and THE CYST's lit flank, whose shudder bends the outline under a
still ring. That shudder is the tap's own picture, so it was left.

**The fourth lane, 27 September 2026:** the readers moved out to
`boss-hush-drawn.ts`. New rows: THE SEAM, THE SLING, THE HALTER, THE GALL
and THE VALVE, each with a `DRAWN` reader. THE GALL's ripple carried both
its rings on the wall clock, and `gallRippling` now takes the world and
hushes it. THE VALVE's brace shudder is hushed to a twenty-fifth
(`valve-story.ts` `SHUDDER_HUSHED`). The reader also found a jump that was
no motion at all: `valveList` counted a pin's list step from the pull, but
the pull goes straight to the pin's story and `list` comes after. So the
drum jumped a step as the pin came out, 0.14 tile at the socket, and dropped
back to ease it in again. The story now plays with the drum where it stood.
THE HALTER's `halterTremor` moves only the plates, never a grip or the core.
**THE DAVIT has no row:** AUTO has no hand for it (`autopilot.test.ts`
`NO_HAND`), so its wave never gets past the first lean, and nothing is ever
asked of the hook. Its reader is simple (the hook's ring at
`davitMast + davitHook(l, davitAngle(s), DAVIT_SAG)` while the step asks for
`fire`, with nothing on the clock), and it goes in with the hand.

Left, with what the first lane's probe found under AUTO:
- **Cue already still in windows** (its cue reads the part's row, not its
  drawn rise and hang, so it needs a `DRAWN` reader before its row): THE
  SCUTTLE.
- **Windows but no cue** (these need a `DRAWN` reader first): THE
  SINEW, THE ANTIPHON, THE NETTLE (`instarMarkPoint` with `nettleSway`), THE
  BURGEE (`burgeeLay`'s sway on `time`, through Effects' `BurgeeFx`).
- **No hand for AUTO:** THE DAVIT, above.

## THE INSTAR — a shoot mark asks for one colour, or none

- **Found:** 2026-09-27, claude/boss-visuals-animation-581e11
- **Files:** `packages/sim/src/instar-words.ts`, `packages/sim/src/instar-hash.ts`, `packages/content/src/instar-script-second.ts`, `packages/content/src/instar-script-third.ts`, `packages/content/src/instar-script-fourth.ts`, `packages/render/src/instar-marks.ts`
- **Asks:** Should each of THE INSTAR's shoot marks ask for one cannon colour and be drawn in it, or keep taking either colour?

The owner, 27 September 2026, on the fourth act's tail (both seats, two
marks, two bolts each): *it should have not just a red circle but a
crosshair, and then also in the colour of the shot to take.* But every shoot
mark takes either colour today (`instar-words.ts`: *bolts out of the top of
the mark's column, either colour*), so there is no colour to draw. The
options:
**(a) one colour per mark.** The script names a colour, the simulation
counts only bolts of it, and a wrong colour is refused the way a wrong seat
is. The tail's two marks get one colour each, so both players fire. This is a
rule change: a new field in the hash, the autopilot hand and the guide's
words.
**(b) either colour, drawn in both.** The crosshair is split into the two
cannon colours.
**(c) either colour, drawn in the ship's violet.** No rule changes.

Wire the one he picks. For (a), a test proves that the wrong colour does not
count and is refused. `bun run check` proves it.
