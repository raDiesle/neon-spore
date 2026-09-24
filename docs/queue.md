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

## `versus adopt` writes a record literal biome rejects

- **Found:** 2026-09-24, claude/scuttle-hang-versus-swap
- **Files:** `tools/versus/record-edit.ts`, `tools/versus/test/record-edit.test.ts`

Adopting `scuttle:hang` / `apart` rewrote `SCUTTLE_ROWS` as
`{ rise: 0.4, pitch: 0.6, drop: 0.26};` — the space before the closing brace
is dropped — and `bun run lint` failed on the one line the command had just
written. `bun run format` fixes it, and the command's own closing words are
*now `bun run check`*, so every adoption of a single-line record pays a red
lint and a format run before anything it is meant to prove gets a chance to
run. Rewrite the literal with the spacing biome wants, or run biome over the
file the command edited before it reports success, and add a case to the
adoption test that lints its own output.

## THE HANDOVER re-signs a press the desk picked a seat for

- **Found:** 2026-09-24, claude/test-mode-control-pull-order
- **Files:** `apps/game/src/input.ts`, `packages/render/src/desk-grab.ts`

On the test screen with no seat key held, a press now takes the seat the
control under the thumb belongs to (`deskDown`). `bindControls` then hands every
command through `from`, which replaces the touch's own player with this
device's seat while `handed()` is true — THE HANDOVER's window. Its comment
says why that exists and also says what the exception is: *a hand on the field
is already this seat's*. It is applied to field commands anyway, so during that
window the navigator's control picked out by `deskDown` is sent as player 1 and
the simulation refuses it, which is the behaviour the desk was just taught not
to have.

What to do: `from` should apply to the band and not to a hand on the field —
the two are told apart by the `Hold`/command the touch carries, the same way
`documentedHoldKind` tells a panel from a field control
(`tools/director/src/field-controls-page.ts`). A test belongs beside
`packages/render/test/desk-grab.test.ts`: a handed-over test screen picks the
seat the control names, and the band still signs with the device.

## The renderer writes a CSS size its host has to undo every frame it measures

- **Found:** 2026-09-24, claude/mobile-game-screen-fit
- **Files:** `packages/render/src/canvas2d.ts`, `tools/director/src/stage-point.ts`, `apps/game/src/viewport.ts`

`Canvas2DRenderer.resize` sets the backing store *and* writes
`style.width`/`style.height` in px. In `apps/game` that is right — the renderer
is what decides how big the canvas is there. In the director it is backwards:
the sheet decides (`min(100cqh, 100cqw / 0.56)` on a desk, the whole pane on a
phone), and an inline length beats a sheet, so the first measurement stuck. The
canvas kept the pixels it was born with, and a rotation, a phone's address bar
sliding back in or a dragged column resizer left the picture at the old size
with no way back.

What was done on 24 September 2026 is a workaround: `stageGeometry`'s `measure`
calls `removeProperty` on both before it reads the rect, and observes the
canvas's parent as well as the canvas, because a canvas whose own inline size
never changes is one the observer never hears about. It works, and it means two
files disagree about who owns one property, once a frame.

The fix is to take the two lines out of `resize` and give the game's host the
job instead — `apps/game/src/viewport.ts` already measures and already calls
`resize`, so it can write the px it just decided on. Then the renderer sets
only the backing store, the director's `measure` loses its two
`removeProperty` calls, and the sheet is the one answer on both hosts. Check
the game still fills the screen on a phone-sized viewport and that the stage
canvas still refits when a director column is dragged; `tools/director/test/stage-point.test.ts`
is where the second belongs.

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

## `frames --hold …@TICK` never fired `--until instarAnswer`

- **Found:** 2026-09-24, claude/bellows-gameplay-clarity
- **Files:** `tools/frames/run.ts`

Taking THE INSTAR's green verdict for the owner, this command ran for 3000
ticks and reported no `instarAnswer`, with mark 0 and with mark 1:
`bun run frames . --wave "THE INSTAR" --seat p1 --boss phase=act,phaseBeat=now --hold "instarMark=0,y=900,id=0@20" --until instarAnswer`
Its own error says a bare hold only goes on after the wait, so the timed form
was the one to try. Either that hold never reaches the mark during the wait,
or `phaseBeat=now` puts the window where a pull cannot land. The picture was
sent without the flash, and the flash is proved only by the canvas log
(`packages/render/test/instar-verdict.test.ts`). Find which it is. Then make
the command above land a pull, or make it refuse the pair with a sentence that
says why.

## Two sim surface files are under ten lines from the ceiling

- **Found:** 2026-09-24, claude/instar-ui-refinements-b5cec4
- **Files:** `packages/sim/src/boss-surface-clocks-b.ts`, `packages/sim/src/bosses-clocks-b.ts`

Both are export lists, at 244 and 242 lines after `instarSwipeAlong` joined
them. The next export pushes either past 250 and `limits.test.ts` fails.
THE INSTAR's block is the seam in both: move it into its own surface file
(for example `boss-surface-instar.ts`) and re-export it from the same places.
`bun run check` proves that nothing lost its import.

## `render/src/index.ts` is 20 lines under the ceiling

- **Found:** 2026-09-24, claude/instar-ui-refinements-b5cec4
- **Files:** `packages/render/src/index.ts`

The size hook flagged it when `hitReach` was exported. It is a barrel, so
the seam is by consumer: the touch exports (`touch*`, `hit*`, the grips)
as one `export … from` block in a file of their own, re-exported once.

## Eighteen captions point at a corner that is empty until a retry

- **Found:** 2026-09-24, claude/instar-ui-refinements-b5cec4
- **Files:** `packages/render/src/caption-anchor.ts`, `packages/content/src/scene-step-types.ts`

The files are also every scene in the content package's scenes folder
with a retries anchor (a grep for `at: "retries"` finds them). The run's
clock left the top-left corner on 24 September 2026, so the
corner is blank until the first retry, and a guide rarely has one. The
captions that say *loses the wave* or *the hull pays* still ring that
corner. Point them at `{ at: "hull" }`, where the hit lands, and retire
`retries` as an anchor if nothing is left on it; `caption-anchor.test.ts`
and the scene tests say which still resolve.
