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

## THE NETTLE — the look

- **Found:** 2026-09-26, this session (DavidDe's handoff from a session he gave the same task by accident)
- **Taken:** 2026-09-26, claude/nettle-look (claim: claude/queue-the-nettle-the-look)
- **Files:** `packages/render/src/boss-draw-clocks-b.ts`, `packages/render/src/instar-mark-grip.ts`, `packages/render/src/instar-marks.ts`, `docs/spec/bosses-choreographed.md`

THE NETTLE's simulation lane is landed on `main` (`79380155`) as wave 101,
`bosses.md` §11.39: a jellyfish on THE INSTAR's engine, ten steps, thumbs on
the body for most and the panel for SHOOT, SHIELD or SUCK marks
(`sim/scene-panel.ts`). Nothing is drawn yet. Add poses, a morph blending
between them, the fly-in and the turn to the underside in new render/nettle-*.ts
files: a see-through bell with a glowing core, rim
light, arms, frills, a brood sac, eyespots and an iris mouth, each part bent
by how far its own answer has got. Add `"nettle"` to `FX_KINDS` and the draw
branch in `boss-draw-clocks-b.ts` (near lines 49 and 167); reuse
`drawInstarMarks` (`instar-marks.ts`) for the rings. `instar-mark-grip.ts`
answers the `"instar"` boss only, so THE NETTLE's rings cannot be grabbed
until it answers `"nettle"` too. A new render/test/nettle-frame.test.ts
proves every state on both screens. Update §11.39's "What is not built" and
the ledger row in `docs/spec/bosses-choreographed.md`. `bun run check`
proves it.

## THE NETTLE — effects: the strikes, the hurt flash and the death

- **Found:** 2026-09-26, this session (DavidDe's handoff from a session he gave the same task by accident)
- **Needs:** THE NETTLE — the look
- **Files:** `packages/render/src/instar-fx.ts`, `packages/render/src/effects-boss.ts`, `packages/render/src/effects-boss-roster.ts`

Lane three. Right now `instar-fx.ts` skips any part THE NETTLE has that THE
INSTAR does not (the sac, the eyespots, the iris, the panel marks). Give it
its own nettle-fx.ts under effects-boss, the way other choreographed
bosses split their strikes and death out of the shared engine, and wire it
into the roster. `bun run check` proves it.

## §24 THE KEEL — the look

- **Found:** 2026-09-26, this session
- **Taken:** 2026-09-26, claude/hopeful-bardeen-5pqz0e (claim: claude/queue-24-the-keel-the-look)
- **Needs:** §24 THE KEEL's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two: six segments locking rigid one at a time out of a loose, swaying
rest pose — independent joints rather than one body morphing whole, the one
place this batch's bodies depart from THE INSTAR's single-figure blend on
purpose. The moving tap mark is the cue; the midpoint socket of movement 2 is
the one standard-control moment. Nothing here is drawn yet and stays
unverified at tempo until the owner has looked.

## §25 THE VALVE — the look

- **Found:** 2026-09-26, this session
- **Needs:** §25 THE VALVE's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two: the wheel's turn drawn continuously rather than snapping between
marks, a frozen wheel visibly stopping mid-turn as the tell that `FreezeTap`
landed, and the drum listing further, plate by plate, as each pin comes free
— the hull's-reaction stand-in for a health bar. Nothing here is drawn yet
and stays unverified at tempo until the owner has looked.

## §26 THE SEAM — the look

- **Found:** 2026-09-26, this session
- **Needs:** §26 THE SEAM's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two: the cracked ridge, deliberately undramatic — no morph between its
four poses, since the whole claim of this concept is that the standard shot
and shield, gated by step, are already expressive enough without one. The
cheapest look on this batch. Stays unverified at tempo until the owner has
looked.

## §27 THE OCULUS — the look

- **Found:** 2026-09-26, this session
- **Needs:** §27 THE OCULUS's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two: the six-leaf iris closing as a real iris does, each pair sliding
across the face rather than fading — the one body in this batch drawn as
mechanism rather than flesh — and the bared core lit in whichever cannon
colour a beat wants. Stays unverified at tempo until the owner has looked.

## §28 THE VISE — the look

- **Found:** 2026-09-26, this session
- **Needs:** §28 THE VISE's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a dry two-lobe seed-case
hinged at a spine, each lobe peeling back as its own mechanism rather than
tearing, and the kernel's lit core answering the cannon's colour once bared.
Nothing here is drawn yet and stays unverified at tempo until the owner has
looked.

## §29 THE RIME — the look

- **Found:** 2026-09-26, this session
- **Needs:** §29 THE RIME's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: frost drawn as a spreading
clear patch rather than a fading overlay, so a half-wiped rime genuinely
shows the glass under it, and a regrowth surge visibly creeping back before
a shield stops it. Nothing here is drawn yet and stays unverified at tempo
until the owner has looked.

## §28 THE VISE — sprite atlas experiment: the kernel crack

- **Found:** 2026-09-26, this session
- **Needs:** §28 THE VISE's look, above, landed first
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

## §29 THE RIME — sprite atlas experiment: the bare-core reveal

- **Found:** 2026-09-26, this session
- **Needs:** §29 THE RIME's look, above, landed first
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

## §31 THE PLUMB — the simulation lane

- **Found:** 2026-09-26, this session
- **Taken:** 2026-09-26, claude/happy-babbage-ilb1n9 (claim: claude/queue-31-the-plumb-the-simulation-lane)
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

The first choreographed body on this page read off the phone's own pose
rather than a touch: `LevelTilt` (new — the phone's gamma lean held inside
a target range, drawn with an on-screen twin per THE CHOIR's rule) settles
`plumbLeftTiltMilli` then `plumbRightTiltMilli`, and the lit core takes
three fire hits with two defensive re-level beats (both seats at once)
against it swinging off true. Eleven steps, three movements. The full beat
list and primitive table entry are §31 of
`docs/spec/bosses-choreographed.md`. `TILT, AS A LEVEL` moves from
`consider` to `specd` in `tools/director/src/gesture-unbuilt.ts` as part of
this lane — already done, land it with the rest, and gated behind the same
iPhone motion permission prompt as the shake. THE SLOW on every level and
fire window. `bun run check` proves it.

## §30 THE TRIVET — the look

- **Found:** 2026-09-26, this session
- **Needs:** §30 THE TRIVET's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a three-legged stand whose
feet swing down and lock rather than fade in, and the hub's lit core
answering the cannon's colour once both outer feet are planted. Nothing
here is drawn yet and stays unverified at tempo until the owner has looked.

## §31 THE PLUMB — the look

- **Found:** 2026-09-26, this session
- **Needs:** §31 THE PLUMB's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a plumb bob easing to a stop
as each weight settles true rather than snapping level, plus the on-screen
bubble-in-a-glass twin `LevelTilt` needs so the tilt reads without seeing
the other phone move. Nothing here is drawn yet and stays unverified at
tempo until the owner has looked.

## §30 THE TRIVET — sprite atlas experiment: the feet planting home

- **Found:** 2026-09-26, this session
- **Needs:** §30 THE TRIVET's look, above, landed first
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

## §31 THE PLUMB — sprite atlas experiment: the bob settling true

- **Found:** 2026-09-26, this session
- **Needs:** §31 THE PLUMB's look, above, landed first
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

## Unverified at 8e6e6e71: RESEARCH tab on the director's NOT BUILT YET sheet, see…

- **Found:** 2026-09-26, claude/laughing-goodall-xscpy0
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/README.md`, `docs/spec/transfers-touch.md`, `docs/time-log.md`, `tools/director/index.html`, `tools/director/src/backlog-api.ts`, `tools/director/src/backlog-page.ts`

*A RESEARCH tab: other games' touch fights, co-op, and the inputs a phone offers* landed from a session that could not look at it. The commit touched 6 more files. What went unchecked:

- RESEARCH tab on the director's NOT BUILT YET sheet, seen by an eye
- video links and YouTube thumbnails in docs/spec/transfers-touch.md, never opened

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Other bosses' plates are still lifes the same way THE INSTAR's were

- **Found:** 2026-09-26, queue-boss-depth-wobble-beyond-instar
- **Files:** `docs/style-guide.md`, `packages/render/src/instar-hide.ts`, `packages/render/src/warden-plates.ts`, `packages/render/src/warden-surface.ts`, `packages/render/src/shell-plate.ts`, `packages/render/src/lid-plates.ts`, `packages/render/src/spool-draw.ts`, `packages/render/src/hasp-draw.ts`, `packages/render/src/sinew-draw.ts`, `packages/render/src/choke-hull.ts`, `packages/render/src/slow-look.ts`, `packages/render/src/gum.ts`, `packages/render/src/ratchet-draw.ts`, `packages/render/src/rind-skin.ts`, `packages/render/src/undertow-draw.ts`, `packages/render/src/magnet-break.ts`

"Depth on a body that already ships" (`docs/style-guide.md`) is now proven
four times over on THE INSTAR: a lit, moving body needs its own-motion
folded into the same field its shading reads, on a period no other wobbling
part shares, or it reads as a still life no matter how good the light is.
THE INSTAR's version of this is mechanical — a `Form.angle` read by
`lightHide` (`instar-hide.ts`, `form.angle ?? 0`) — and that exact machinery
is INSTAR-only; none of the files above import it. Each other boss draws its
own lit plates its own way (WARDEN's `warden-plates.ts`/`warden-surface.ts`,
THE SHELL's `shell-plate.ts`, THE LID's `lid-plates.ts`, THE SPOOL's
`spool-draw.ts`, THE HASP's `hasp-draw.ts`, THE SINEW's `sinew-draw.ts`, THE
CHOKE's `choke-hull.ts`, THE SLOW's `slow-look.ts`, THE GUM's `gum.ts`, and
THE RATCHET's, THE RIND's, THE UNDERTOW's and the magnet-break boss's own
files), so this is one boss at a time, not a rename: read the boss's own
shading pass, find whatever plays the part of THE INSTAR's `Form.angle` (a
bare constant, an `atan2` off a point that only moves at pose transitions,
or missing outright), and give it the same small own-motion wobble, each on
its own period. `bun run frames . --wave "<BOSS NAME>" --boss ...` and a
cropped PNG is how each one gets checked once drawn. A boss with no lit
plates at all (mechanism-only bodies, THE OCULUS among the unbuilt ones) has
nothing to fix.

## Unverified at b8986b62b: READY's lift taking the screen on a real Android phone

- **Found:** 2026-09-26, claude/happy-babbage-ilb1n9
- **Files:** `apps/game/src/fullscreen.ts`, `apps/game/src/join-room-step.ts`, `apps/game/test/shake-permission.test.ts`, `docs/queue.md`, `docs/time-log.md`

*The screen is asked for as the thumb lifts off READY, not as it goes down* landed from a session that could not look at it. What went unchecked:

- READY's lift taking the screen on a real Android phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `docs/perf-audit-2026-09.md` has no real-device numbers yet

- **Found:** 2026-09-26, claude/perf-audit-real-run
- **Files:** `docs/perf-audit-2026-09.md`
- **Where:** local

Everything in `docs/perf-audit-2026-09.md` is either static reading or a
headless benchmark of `packages/sim`'s `step()` alone (a cloud session cannot
run `bun run perf`, per CLAUDE.md) — it has no real frame time and no real GC
numbers off an actual browser. Run `bun run perf` over normal waves and the
busiest boss fights (start from the worst already-measured frame, "THE GYRE",
`packages/render/test/wave-budget.test.ts:490`, and add the busiest boss
waves alongside it), on a machine with nothing else running so no reference
wave gets flagged, and add a new **measured (real device)** section to the
doc with the numbers, distinct from the existing read/headless sections. If
either read finding (`byDepth()`, `gyres(world)`) shows up as real cost,
promote it out of "read" into its own queued fix.

## The still-life gradient fix has five more boss flesh files to check

- **Found:** 2026-09-26, cloud session (this session, stopping here per the
  owner's *"slow down the project's parallelization"*)
- **Files:** `packages/render/src/baton-flesh.ts`,
  `packages/render/src/gorge-flesh.ts`,
  `packages/render/src/antiphon-flesh.ts`,
  `packages/render/src/curtain-flesh.ts`, `packages/render/src/lead-flesh.ts`

**The pattern**, already fixed six times over (WARDEN, SINEW, GUM, THE
SURGE's sac, THE SPLICE's membrane/nucleus/eater-head, THE THROAT's everted
ring — `docs/style-guide.md`'s "Depth — bodies that look three-dimensional"): a
body shades itself with a `createRadialGradient`/`createLinearGradient`
whose own centre is a fixed fraction of the body's own radius toward the
light, while the silhouette it lights — built with `blobPoints` on a `time`
or beat-phase term, in the caller — breathes, swells or turns under it every
frame. The gradient's offset never follows, so a beautifully lit body still
reads as a still life. The fix: a small sine wobble folded into the
gradient's own offset, on a rate distinct from whatever else already
animates that part, named `<PART>_LIT_WOBBLE`/`<PART>_LIT_WOBBLE_RATE` (see
any of the six fixed files for the exact shape), plus a new paragraph in
`docs/style-guide.md`'s "Depth" section naming the file and the wobble
constants, in the same voice as the paragraphs already there.

**Confirmed candidate:** `gorge-flesh.ts`'s `paintLobeSkin` — its `shade`
gradient (`createRadialGradient(x - rx * 0.35, cy - ry * 0.45, ...)`) lights
a lobe body built with `blobPoints(..., time * 0.5, ...)` in
`gorge-lobe.ts:75`; `paintSack`'s body wobbles on `time * 0.4` in
`gorge-draw.ts:115`, though `paintSack` has no offset-gradient of its own to
fix (its `under` gradient is a fixed vertical light-from-above, not a
follow-the-light offset, so leave it). Fix `paintLobeSkin`'s `shade` only.

**Not yet checked**, in this order: `antiphon-flesh.ts` (a radial gradient at
a fixed `x - r*0.35, y - r*0.4` — find its caller, likely
`antiphon-draw.ts` or similar, and confirm the silhouette it lights
wobbles before fixing), `curtain-flesh.ts` (two radial gradients, same
shape), `lead-flesh.ts` (two radial gradients, same shape). **Check the
caller before touching any of them** — the fix only applies where the
silhouette actually wobbles under a fixed-offset gradient; a body that is a
plain unwobbling circle or ellipse is not this bug.

`baton-flesh.ts` (THE BATON's arm material — `paintKnuckle`'s `flesh`/`pit`/
`pool` gradients and `paintDrop`'s `shade` gradient, all fixed-offset) was
read in full and its own `joint`/`body` `Path2D`s are built by its callers
(`baton-bead-draw.ts`, `baton-socket-draw.ts`), not with `blobPoints` inside
this file — check those two callers first; if the joint/bead shapes are
static circles/ellipses rather than a wobbling blob, this file does not fit
the pattern and should be skipped rather than force-fixed.

For each file that does fit: apply the fix, add the style-guide paragraph,
`bun run check:fast`, commit by path with a Before/After message ending in
the `Co-Authored-By` trailer, land, push. One commit per file is fine, or
batch the whole set into one commit the way THE SURGE/SPLICE/THROAT batch
did — either is a coherent change.

## Living secondary motion is uneven across the boss roster

- **Found:** 2026-09-26, cloud session (this session, stopping here per the
  owner's *"slow down"* request)
- **Files:** `docs/style-guide.md`

Also whichever flesh and body files under `packages/render/src/` the audit
below finds lacking.

The owner's own words, 2026-09-26: *"i like that they look more 3
dimensional... also more natural living animations."* The still-life
gradient fix (queued above) is one half of "alive" — the light following the
body. The other half, not yet audited across the roster, is **secondary
motion**: does each boss have at least one part that moves on a phase of its
own, distinct from its main silhouette wobble and distinct from the beat —
a cilia wave, a drool sway, a vein pulse, an antenna droop, the kind of
detail THE SPLICE's `drawCilia` (`splice-ball.ts`) and THE SPLICE eater's
`drawDrool` (`splice-eater-head.ts`) already carry. **Audit**: grep every
`*-flesh.ts`/`*-body.ts`/`*-draw.ts` in `packages/render/src/` for a boss
that has *no* independent secondary-motion term at all (only the one
silhouette wobble plus the beat pulse), list them in a fresh queue entry
each, and propose one small secondary-motion touch per boss found lacking,
following the existing idiom (a `Math.sin` term on a rate distinct from the
body's own wobble, cheap, no new allocation per frame per
`.claude/skills/depth`'s "Depth that costs no frames"). This is research
work — do the audit and file what it finds as new queue entries; do not
try to fix every boss in one sitting (`docs/lane-speed.md`'s rule on
splitting work too big for one sitting).

## The wider graphics-improvement pass has no single owner yet

- **Found:** 2026-09-26, cloud session (this session, stopping here per the
  owner's *"slow down"* request)
- **Files:** `docs/style-guide.md`

The owner asked, 2026-09-26, for a general investigation — beyond bosses —
into how the game's graphics overall can read as more three-dimensional and
alive: *"make first some investigation how in general we can improve
graphics all over... maybe strategies like gradient, fillings, shadows,
glows inside of body can help."* The still-life fix and the secondary-motion
audit above are the two concrete threads pulled out of that so far, both
scoped to boss "flesh" files. **Not yet covered**: whether the same two
patterns (a fixed-offset gradient under a wobbling silhouette; a silhouette
with no secondary motion of its own) also show up outside bosses — creature
sprites (`packages/content/src/creatures.ts`-registered bodies drawn
elsewhere in `packages/render/src/`), the hull itself, and any wave-level
ambient shading. A fresh session should grep the same two signatures
(`createRadialGradient`/`createLinearGradient` with a fixed fractional
offset; a `blobPoints` silhouette wobble with no matching gradient-offset
wobble) across the rest of `packages/render/src/`, outside the boss files
already covered above, and file what it finds as its own queue entries
rather than fixing on sight — this entry is the research-scope handoff, not
the fix.

## Unverified at 4958f2180: the TEST panel's AUTO row, seen on a phone

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `apps/game/index.html`, `apps/game/package.json`, `apps/game/src/autopilot.ts`, `apps/game/src/game.css`, `apps/game/src/main-world.ts`, `apps/game/src/main.ts`, `apps/game/src/testing.ts`, `apps/game/test/autopilot.test.ts`

*The game's TEST panel has AUTO: the machine plays a seat, or both* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- the TEST panel's AUTO row, seen on a phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 4a47be3b6: THE OCULUS wave never watched at tempo

- **Found:** 2026-09-26, claude/queue-27-the-oculus-the-simulation-lane
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*THE OCULUS: an eye both seats hold shut, then shoot into* landed from a session that could not look at it. The commit touched 56 more files. What went unchecked:

- THE OCULUS wave never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at b66adf07c: THE MANTLE's pull read at tempo: the bow, the cord and…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw-clocks-c.ts`, `packages/render/src/mantle-draw.ts`, `packages/render/src/mantle-handle.ts`

*THE MANTLE is drawn: a plated shell over the field, bowing as both thumbs pull* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- THE MANTLE's pull read at tempo: the bow, the cord and the shed plate watched moving

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## §32 THE SLING — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

The first choreographed body on this page whose gesture resolves at
release rather than at the moment a threshold is crossed: `DrawRelease`
(new — a hold counted while down, resolved by the coarse left/right
direction of its release against a column already lit) draws
`slingLeftDrawnMilli` then `slingRightDrawnMilli`, and the lit yoke takes
three fire hits with two defensive re-draw beats (both seats at once)
against it springing loose. Eleven steps, three movements. The full beat
list and primitive table entry are §32 of
`docs/spec/bosses-choreographed.md`. `HOLD, THEN SWIPE` moves from
`consider` to `specd` in `tools/director/src/gesture-unbuilt.ts` as part of
this lane — already done, land it with the rest. THE SLOW on every draw
and fire window. `bun run check` proves it.

## §32 THE SLING — the look

- **Found:** 2026-09-26, this session
- **Needs:** §32 THE SLING's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a forked arm that bends back
under load rather than fading taut, and the yoke's lit core answering the
cannon's colour once both arms have drawn true. Nothing here is drawn yet
and stays unverified at tempo until the owner has looked.

## §32 THE SLING — sprite atlas experiment: the arm drawing home

- **Found:** 2026-09-26, this session
- **Needs:** §32 THE SLING's look, above, landed first
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

## §33 THE GRINDSTONE — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

No new primitive: the first choreographed body spent entirely on two
gestures already built for other bosses, paired in an order neither has
used before. `RUB` (THE RIME's) grinds `grindLeftMilli` then
`grindRightMilli` clean; `CHORD` (THE TRIVET's) locks the axle's caliper,
answered with three fire hits and two defensive re-clamp beats (both
seats at once). Eleven steps, three movements, same shapes THE RIME and
THE TRIVET already carry — no new field type, no new registration
category. The full beat list and primitive table entry are §33 of
`docs/spec/bosses-choreographed.md`. `RUB` and `CHORD` each gain a second
`where` entry in `tools/director/src/gesture-unbuilt.ts` — already done,
land it with the rest. THE SLOW on every grind, chord and fire window.
`bun run check` proves it.

## §33 THE GRINDSTONE — the look

- **Found:** 2026-09-26, this session
- **Needs:** §33 THE GRINDSTONE's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a ground flat reusing THE
RIME's spreading-clear-patch draw, a caliper reusing THE TRIVET's
swing-down-and-lock draw, and the axle's lit core answering the cannon's
colour once both flats are clean and the caliper has bitten. Nothing new
drawn here at all — this lane is wiring two existing looks onto one new
body — and it stays unverified at tempo until the owner has looked.

## §34 THE CYST — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

No new primitive: `FreezeTap` (THE VALVE's) and `SqueezeGap` (THE VISE's)
paired as a dependency rather than a sequence — a flank's own
`cystConvulsing` drift widens its gap every tick too fast for a pinch
alone to close, so `SqueezeGap` only nets progress while the *other*
seat's `FreezeTap` has that flank stilled. Eleven steps, three movements,
the freezing hand always the squeezing hand's partner rather than the
same seat doing both. The full beat list and primitive table entry are
§34 of `docs/spec/bosses-choreographed.md`. `FreezeTap` and `SqueezeGap`
each gain a second `where` entry in `tools/director/src/gesture-unbuilt.ts`
— already done, land it with the rest. THE SLOW on every freeze and pinch
window together. `bun run check` proves it.

## §34 THE CYST — the look

- **Found:** 2026-09-26, this session
- **Needs:** §34 THE CYST's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a new silhouette (check
`packages/content/src/silhouettes*.ts` first, then `tools/shape-sheet/src/drafts/`
per `CLAUDE.md`'s rule against redrawing a shape the game already has) for
a pulsing, unevenly shuddering sac, and the stillness cue that is this
body's whole tell — the shudder stopping dead rather than any new
particle. No sprite-atlas experiment queued for the shudder itself: it is
a continuous drift that must agree with the sim's freeze state every
tick, not a hinge-and-strain motion resolved once per beat the way THE
SLING's arm-draw is, so it stays a procedural phase clock the freeze can
simply stop advancing rather than a candidate for `docs/raster.md`'s
baked-strip treatment. Nothing here is drawn yet and stays unverified at
tempo until the owner has looked.

## THE BATON's flesh has no secondary motion of its own

- **Found:** 2026-09-26, this session
- **Files:** `packages/render/src/baton-flesh.ts`, `packages/render/src/baton-socket-draw.ts`

Confirmed, not sampled: `paintKnuckle`'s `breath` (the socket's glow-and-pool
term) is `(1 - beatPhase) ** 2` in `baton-socket-draw.ts` line 146 — read
straight off the beat, with no independent-rate term anywhere in
`baton-flesh.ts`, `baton-draw.ts`, `baton-grip.ts` or `baton-bead-draw.ts`.
Every other term in those four files is state-driven (`swell`, the bead's
own arc) rather than a clock of its own. This is one confirmed instance of
"Living secondary motion is uneven across the boss roster"; do not fold it
into that item's own audit, since that one is still open and this is a
single found case. Give a lit knuckle's pool or glow its own small period,
distinct from `beatPhase`, the way `well-flesh.ts`'s `breath` runs on
`time * 0.9` rather than the beat.

## §35 THE DAVIT — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

No new primitive: `LevelTilt` (THE PLUMB's) and `DrawRelease` (THE
SLING's) paired so one seat's held tilt drives a shared aim reading in
real time and the other seat's release only lands while that tilt is
in threshold and the release direction matches the aim at that instant
— a hand-off rather than THE GRINDSTONE's sequence or THE CYST's
dependency. Eleven steps, three movements, the steering half and the
drawing half swapping seat by movement the way THE CYST's freezing and
squeezing hands do. The full beat list and primitive table entry are
§35 of `docs/spec/bosses-choreographed.md`. `LevelTilt` and
`DrawRelease` each gain a second `where` entry in
`tools/director/src/gesture-unbuilt.ts` — already done, land it with
the rest. THE SLOW on every steer-and-loose window and every fire
window. `bun run check` proves it.

## §35 THE DAVIT — the look

- **Found:** 2026-09-26, this session
- **Needs:** §35 THE DAVIT's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, read against `docs/style-guide.md`: a new silhouette (check
`packages/content/src/silhouettes*.ts` first, then
`tools/shape-sheet/src/drafts/`) for a pivoted crane boom on a slack
chain, and the boom easing toward wherever the live tilt points as its
own tell rather than a snap. No sprite-atlas experiment queued: the
boom's motion is driven by the live shared aim reading every tick, not
resolved once per beat, the same reasoning THE CYST's shudder was ruled
out on. Nothing here is drawn yet and stays unverified at tempo until
the owner has looked.

## Unverified at 7a259b7f7: THE VISE wave never watched at tempo

- **Found:** 2026-09-26, claude/queue-28-the-vise-the-simulation-lane
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`

*Wave 107 THE VISE: pinch each lobe shut until its seam cracks, then shoot the kernel* landed from a session that could not look at it. The commit touched 56 more files. What went unchecked:

- THE VISE wave never watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 920f00b11: THE MANTLE's knobs under two real thumbs on phones: ea…

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/render/src/guide-boss-hand.ts`, `packages/render/src/handle-place-boss.ts`, `packages/render/src/handles.ts`

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

*THE MANTLE's transients: a shear kicks the shell and shudders the hull* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- THE MANTLE's shear kick, core flare and hull shudder at tempo, by an eye on a phone

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## CLOUD ONLY — a densified tube costs a gradient per slice, per frame

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Files:** `packages/render/src/solid-tube-draw.ts`, `packages/render/src/solid-rig.ts`

`drawTube` inserts a ring every 6 px and fills one linear gradient per slice,
so a 230 px body is about forty `createLinearGradient` calls a frame before
its tail and fins. Add an op-count budget test for `drawRig` on the demo rig
(`tools/raster/src/solid-demo.ts`) beside the other `*-budget.test.ts`, then
cap it: a coarser step when the drawn radius is small, or a gradient reused
between slices whose stops round to the same six-step mix. The sheet from
`bun run solid` must look the same before and after — say *unverified* if no
eye saw it.

## CLOUD ONLY — a dragged tail wants a verlet chain in Effects

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Files:** `packages/render/src/solid-motion.ts`, `packages/render/test/restart.test.ts`

`chainAt` is follow-through as a delay: link `i` replays the root `lag·i`
earlier. It cannot sag under its own weight or swing when the root stops. A
verlet chain (positions, previous positions, one length constraint pass) held
in `Effects`, stepped per frame and cleared in `Effects.reset()`, would give a
boss's trailing part real inertia. It must pass `restart.test.ts` and must be
a render-side effect only — nothing in sim reads it.

## CLOUD ONLY — move one boss a lane onto the solid rig, from the roster

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
- **Files:** `packages/render/src/solid-rig.ts`, `docs/style-guide.md`

`drawRig` draws tubes and balls from any side with a fixed key, haze and
contact. Bosses whose bodies are tubes and balls already — THE GORGE, THE
ANTIPHON, THE BATON, THE LEAD — could each be rebuilt as a rig so they turn
correctly when the fight turns them. **Each one is a look**: it goes to
`tools/versus/candidates/` beside the shipped body, one boss per lane, with
`bun run solid`'s pattern for its own sheet. Take one, name it in the entry
you leave behind, and leave the rest listed.

## CLOUD ONLY — the rig has no frame.test coverage until a boss uses it

- **Found:** 2026-09-26, claude/queue-the-instar-looks-flat-and-ugly-from-the-side
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

## THE GIMBAL is a fifth rig candidate, and the sharpest one for the mirror rule

- **Found:** 2026-09-26, this session
- **Needs:** "a densified tube costs a gradient per slice, per frame" and "a dragged tail wants a verlet chain in Effects", both above
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

## THE MANTLE's "spark" phase is named and never entered

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `packages/sim/src/mantle.ts`, `packages/sim/src/mantle-step.ts`, `packages/render/src/mantle-pose.ts`, `tools/director/src/poses-bosses-hands-mantle.ts`, `packages/sim/test/mantle.test.ts`

`MANTLE_PHASES` lists `"spark"`, and render reads it, but
`sim/mantle-step.ts` never sets it: the leak on the second shear sets
`sparkCol` and leaves the phase at `pull`. So the STATES card for "spark"
is posed with a `want` on `mantleLeaking` rather than on the phase, and any
reader that switches on `phase === "spark"` is dead code. Either drop
`"spark"` from `MANTLE_PHASES` and every switch on it — the leak is already
fully carried by `sparkCol` — or enter it on the leak and leave it when the
spark is shot or lands. The first is smaller and matches what the
simulation already does. Prove it with a test that walks every phase
`MANTLE_PHASES` names through the step.

## THE GORGE's flesh has no secondary motion of its own

- **Found:** 2026-09-26, this session
- **Files:** `packages/render/src/gorge-flesh.ts`, `packages/render/src/gorge-flesh-torn.ts`, `packages/render/src/gorge-draw.ts`

Confirmed, not sampled: every `breath` term in `paintSack`, `paintSackGone`
and `topWall` (`gorge-flesh.ts` lines 51, 64, 75, 93) is `breathOf(beatPhase)`
(`gorge-draw.ts` lines 95-97) — read straight off the beat, the same pattern
as THE BATON's confirmed miss. `gorge-flesh-torn.ts`'s `paintPucker` and
`paintFlap` carry no time term at all. The only other clock anywhere in
these three files is the `time * 0.4` fed to `blobPoints(...)` at
`gorge-draw.ts` line 115, and that drives the sack's own silhouette wobble,
not a placed feature — the category this audit already excludes. This is a
second confirmed instance of "Living secondary motion is uneven across the
boss roster"; do not fold it into that item's own audit, since that one is
still open and this is a single found case. Give the lobe wall or the
lit pool its own small period, distinct from `beatPhase`, the way
`well-flesh.ts`'s `breath` runs on `time * 0.9` rather than the beat.

## Unverified at 1711568bc: AUTO playing THE MANTLE to dark, watched at tempo

- **Found:** 2026-09-26, claude/hopeful-bardeen-5pqz0e
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/hands/src/autopilot-hands.ts`, `packages/hands/src/boss-hands-mantle.ts`, `packages/hands/src/index.ts`, `tools/director/src/poses-bosses-hands-mantle.ts`

*THE MANTLE has a hand: AUTO pulls both knobs, shoots the spark and taps the core dark* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- AUTO playing THE MANTLE to dark, watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
