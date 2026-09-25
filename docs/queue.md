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

## Comments still argue from THE DIASTOLE, THE ORRERY and THE CANDLE

- **Found:** 2026-09-25, claude/remove-three-bosses-cdb822
- **Taken:** 2026-09-25, claude/queue-comments-still-argue-from-the-diastole-the-orrer
- **Files:** `packages/render/src/boss-cue-read-c.ts`, `packages/render/src/boss-cue-text.ts`, `packages/render/src/curtain-grip.ts`, `packages/render/src/touch-field.ts`, `packages/render/test/boss-cue-gorge.test.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/throat.ts`, `apps/game/src/keys.ts`, `apps/game/src/field-input.ts`, `tools/director/src/poses-bosses-kit.ts`

The three bosses left the game on 25 September 2026, and every file that
named one of their files was fixed in that lane. About seventy files still
argue *from* them in prose: "THE CANDLE's pairing", "for THE DIASTOLE's
reason", "as in boss-cue-candle.test.ts", a list of handles with THE ORRERY's
ring in it. `git grep -n -iE "diastole|orrery|candle" -- apps packages tools
':!*.md'` lists them. For each, state the reason in place of the name, or name
a boss still in the game that has the same arrangement (THE GORGE, THE
CURTAIN, THE THROAT, THE GIMBAL); a list that counts handles or pages loses
the three and its number. Comments only — `bun run check` is the proof that
nothing else moved.

## `bun run imports` calls a name used only in a top-level call unused

- **Found:** 2026-09-25, claude/remove-three-bosses-cdb822
- **Files:** `tools/imports/scan.ts`, `tools/imports/run.ts`, `packages/render/test/boss-anchor-c.test.ts`

After the three bosses left, `bun run imports` listed `setDefaultTimeout` in
`boss-anchor-c.test.ts` as unused beside three names that were, then found its
own cut left `setDefaultTimeout(FRAME_TIMEOUT_MS);` undeclared and put
everything back, so none of the three real ones were cut; they were taken out
by hand. The scan misses a use that is a bare statement at module level. Add
that file's shape to `tools/imports/test` and make the scan count it.

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

## The other pull handles show the path they can be pulled

- **Found:** 2026-09-25, claude/pull-circle-animation-9cd78e
- **Files:** `packages/render/src/lid-string.ts`, `packages/render/src/curtain-grip.ts`, `packages/render/src/stare-lid.ts`, `packages/render/src/pull-track.ts`, `packages/render/src/pull-knob.ts`

The owner's generic rule of 25 September 2026 (`owner.md`): a handle you
pull is drawn as a thin channel along its travel that fills green behind
the hand, a big circle to start, and a grab far wider than the circle — not
a ring with a dial. THE WARDEN's rope and THE MAZE's lever wear it
(`tether.ts`, `tether-track.ts`, `maze-string.ts`). The three files above
still draw `drawHandleRest` and `drawHandleRing` for a pull measured as a
distance: give each a track builder beside `tether-track.ts` (from where the
hand took it, the taut distance long, the way the field fits it straight,
half-width `PULL_TRACK_W` of the knob), call `drawPullTrack` in place of the
ring and `drawPullKnob` over it, and widen its grab circle by `PULL_GRAB`
(`pull-knob.ts`). Grips that are held rather than
pulled keep their ring. Each lands as *a look the owner asked for by name*.

## `director-here` opens its tab on port 3000, not the director's

- **Found:** 2026-09-25, claude/director-filter-persistence-884bb6
- **Files:** `.claude/launch.json`, `tools/dev/supervise.ts`, `docs/working-with-claude.md`

`preview_start` with `director-here` started the director on a free port
(56239 here, from `DIRECTOR_PORT=0`) but the desktop harness opened its tab at
`http://localhost:3000`, where nothing answers, because the entry says
`"port": 0, "autoPort": true` and the harness cannot read the port from the
log. `navigate` to the real port was then refused; `preview_start` with
`{url: "http://localhost:<port>/"}` worked. Either pin the entry to the
tree's derived port (`tools/ports.ts`) so the harness knows it, or write the
workaround into `docs/working-with-claude.md` beside the `here` route.

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

## A rock's hole puffs sit below the rock in its last six rows

- **Found:** 2026-09-25, claude/meteor-impact-animation-timing-53afba
- **Files:** `packages/render/src/effects-spark.ts`, `packages/render/src/rock-fall.ts`

A rock's last six rows are now drawn higher than its row, by a bend that
puts it on the skin at the end of its landing beat (`rock-fall.ts`). A
`hole` event's puffs are still thrown at `tileCY(row)`, up to about a tile
under the rock the pair is looking at. Place them with `rockFallY` for a
wardable kind, and grep render/ for any other reader of a rock's row that
calls `tileCY` rather than `landingY`. Add a case beside `landing.test.ts`'s.

## `opening.test.ts`'s twice-taken strip differed by three bytes once

- **Found:** 2026-09-25, claude/meteor-impact-animation-timing-53afba
- **Files:** `tools/frames/test/opening.test.ts`

Under `check:fast` on a loaded machine, *takes the same strip twice,
settles and all* failed with `frame 2: 3 of 987480 channel bytes differ,
first at x=81, y=271`. It passed alone twice and in the next full
`check:fast`. Seen again on claude/boss-blow-g, the same three bytes
at the same pixel, and green alone and on the next run. Something in the capture reads wall time or a leftover from
the first take. Loop the test under load until it fails, then find what
at that pixel is drawn from anything but the tick and the frame's `dt`.

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

## THE MAZE's lever knob rests on top of the lit way in

- **Found:** 2026-09-25, claude/pull-circle-animation-9cd78e
- **Files:** `packages/render/src/maze-string.ts`, `packages/render/src/maze-door.ts`, `packages/render/test/maze-funnel.test.ts`

When the drum has turned a way in round to the ship's column, the lever's
knob often sits at the bottom of its ring as well, which puts the big knob
disc over the lit door and hides the funnel's right lip (seen in
`bun run frames . --wave "THE MAZE" --seat p1 --ticks 300 --hold mazeString=4000@240`).
Either draw the lit door's lips and floor after the knob, or keep the knob
out of the door's arc. Prove it with a test that the door's draw comes
later in the op list than the knob's disc.

## THE SLOW does not say whether a window asks for something

- **Found:** 2026-09-25, claude/slow-mode-progress-indicator-b0f717
- **Files:** `packages/sim/src/slow.ts`, `packages/sim/src/hash.ts`, `packages/render/src/slow-fuse.ts`, `packages/sim/src/instar-step.ts`

The fuse that counts a window down (`slow-fuse.ts`) should only draw on a
window that fails the pair when it runs out — a step, a pry, a grip — and
never on a dramatic beat that asks for nothing (THE INSTAR's fall, a flash, a
landing). `World` carries only `slowFromBeat` and `slowToBeat`, so the fuse
guesses by length: `FUSE_MIN_BEATS = 5`, since the asking windows today run
six beats and up and the others one to four. Give `openSlow` an `asks` flag,
store it as a hashed `World` field (`hash.ts`), pass it at every `openSlow` call,
and have the fuse read it instead of the length. Prove it with a sim test that
THE INSTAR's step window asks and its fall does not, and a render test that
the fuse draws on the first and not the second.

## A VERSUS freeze inside THE SLOW does not land where its seconds say

- **Found:** 2026-09-25, claude/slow-mode-progress-indicator-b0f717
- **Files:** `tools/director/src/versus-pair.ts`, `tools/director/src/versus-pair-freeze.ts`, `tools/director/test/versus-freeze.test.ts`

`Freeze` counts its target in ticks at `cfg.tickHz`, but while a window is
open the pair steps at `stageTickHz` (a quarter) and its cadence `clock`
still gains `FREEZE_STRIDE / tickHz` per paint — so on `THE SLOW · A WINDOW
RUNNING OUT` `--freeze 4.2` lands near the window's end, and `--freeze 10`
and `--freeze 17` came back as the same frame, forty per cent in. Make one
axis of it: either the freeze counts the pair's clock or the clock counts the
freeze's ticks, and a cadenced rebuild during a pending freeze resets both.
Prove it with a test that a freeze inside a slowed window lands on the tick
its seconds name, and that two freezes a cadence apart differ.

## `poses-versus.ts` is at 237 lines and grows a row per slot

- **Found:** 2026-09-25, claude/slow-mode-progress-indicator-b0f717
- **Files:** `tools/director/src/poses-versus.ts`, `tools/director/src/poses-slow.ts`

Every slot that needs its own state adds an import and a row to
`VERSUS_POSES`, and the file is 13 lines under the ceiling
(`packages/sim/test/limits.test.ts`). Split the list by what the poses show —
bodies and creatures in one, damage and boss-borrowed states (THE SLOW's two,
the handover, the guide) in another — and have `poses-versus.ts` concatenate
them. Prove it with `bun run check`: `versus-pose.test.ts` and the pose-row
test still find every slot's pose.

## AUTO has no hand for THE PULSE or THE REPRISE

- **Found:** 2026-09-25, claude/game-multiplayer-testing-601794
- **Files:** `tools/director/src/autopilot-hands.ts`, `tools/director/test/autopilot.test.ts`, `tools/director/src/boss-hands-handles.ts`

The director's AUTO row (OFF/BOTH/P1/P2) plays a boss live with the hand the
poses reach its defeat with, and no pose has one for these two, so AUTO says
*no hand for this boss* on them. Write a hand for each that plays it right
(beside the others, or in a file of its own), add its row to `AUTOPILOT_HANDS`, and
take its name out of `NO_HAND` in the test, which then proves the row exists.

## AUTO plays bosses only, and only in the director

- **Found:** 2026-09-25, claude/game-multiplayer-testing-601794
- **Files:** `tools/director/src/stage-autopilot.ts`, `tools/director/src/autopilot-ghost.ts`, `apps/game/src/`

AUTO covers the bosses because the director's hands only exist for them; an
ordinary wave's co-op controls (cannon and shield together) have no hand, and
the game's own TEST view on a phone has no AUTO at all. A seat-playing hand
for ordinary waves would reach both. Keep it out of `sim`: it is a player's
input, fed through `step` like a thumb's. Prove it with a test that AUTO BOTH
clears one ordinary wave headless.

## THE INSTAR's words still name parts no pose draws

- **Found:** 2026-09-25, claude/instar-boss-choreography-01e4c7
- **Files:** `packages/sim/src/instar-words.ts`, `packages/render/src/instar-strike.ts`, `packages/render/src/instar-shape.ts`, `packages/render/src/instar-poses.ts`

`INSTAR_PARTS` still lists `hand` and `tongue`, from the five poses of 17
September. No step of `content/instar-script.ts` names either, so
`instar-strike.ts` gives the two a slam it never draws. (`head` and the
figure's `reach` are the *lunge*'s since 25 September,
claude/instar-boss-enhancements-1ae51f, and stay.) Cut the two parts from the
list (and from the cue, the director's sheet and any switch over them that
`tsc` then names), and prove it with `bun run check`.

## THE INSTAR, brood: eggs that crack while nobody takes them

- **Found:** 2026-09-25, claude/instar-boss-enhancements-1ae51f
- **Files:** `packages/render/src/instar-eggs.ts`, `packages/render/src/instar-egg-spots.ts`, `packages/render/test/instar-eggs.test.ts`, `packages/content/src/instar-script.ts`

Step 2. The nests are sixteen and ten eggs that sit still until the window
closes. Let the eggs still standing crack as the window runs (`instarThreat`):
a hairline at a quarter, a split with something moving inside at three
quarters, drawn on the egg and never as a bar. Then a second brood step late in
the script with the counts swapped between the seats, player 1 swiping and
player 2 tapping, so a pair that learned the nest has to say it again. It
lands under a look the owner asked for by name.

## THE INSTAR, lash: a tail that sweeps rather than stands

- **Found:** 2026-09-25, claude/instar-boss-enhancements-1ae51f
- **Files:** `packages/sim/src/instar-words.ts`, `packages/sim/src/instar-marks.ts`, `packages/sim/src/instar-hash.ts`, `packages/render/src/instar-tail.ts`, `packages/render/src/instar-marks.ts`, `packages/content/src/instar-script.ts`

Steps 3 and 7. The blades hang over two fixed points, so twenty taps are
twenty presses in one place. Give `InstarMark` an optional sweep, a distance
in thousandths that the mark travels across the field over the window, and
let the fork carry its blades along the same line (`instar-tail.ts` aims at
the pose's `tailX` today, and would aim at the mark instead). A mark stays on its own seat's half of the field, so where
it sits still says whose it is. Every new field goes in `hashWorld`, and the
test taps a moving mark at the wrong place and gets nothing.

## THE INSTAR, coil: the blades wind opposite ways

- **Found:** 2026-09-25, claude/instar-boss-enhancements-1ae51f
- **Files:** `packages/sim/src/instar-words.ts`, `packages/sim/src/instar-hand.ts`, `packages/render/src/instar-glyphs.ts`, `packages/render/src/instar-word.ts`, `packages/content/src/instar-script.ts`, `packages/sim/test/instar.test.ts`

Step 6. Both seats wind clockwise, the crank's direction. Add `turnBack`,
anticlockwise, as a seventh gesture in `INSTAR_GESTURES`, with its own
arrow glyph and word, and let the coil ask player 1 to wind the left blade
back while player 2 winds the right forward, so the two thumbs mirror each
other. The gesture rides the one `instarMark` target, so the command codec
does not change; the test proves a clockwise wind on a `turnBack` mark counts
nothing.

## THE INSTAR, a last step: the moult

- **Found:** 2026-09-25, claude/instar-boss-enhancements-1ae51f
- **Files:** `packages/sim/src/instar-words.ts`, `packages/render/src/instar-poses.ts`, `packages/render/src/instar-hide.ts`, `packages/render/src/instar-draw.ts`, `packages/content/src/instar-script.ts`, `docs/spec/bosses.md`

An instar is the stage between two moults, and the boss never moults. Put an
eighth step at the end: a `moult` pose where the hide splits along the back
and the new body shows pale through the split. Each seat swipes its half of
the old skin off, downward, with the two finishing together, and left alone
the new body hardens and the fight is lost. A new pose is two lanes: the
simulation and script first (`INSTAR_POSES`, the step, `bosses.md` §11.32),
then the picture, which lands under a look the owner asked for by name.

## `land` stops on a time-log conflict it says it merges

- **Found:** 2026-09-25, claude/drop-wait-cues
- **Files:** `tools/land/replay.ts`, `tools/land/ledger-merge.ts`, `tools/land/test/ledger-merge.test.ts`

`replay.ts` lists `docs/time-log.md` as a conflict it settles on its own, but
twice on 25 September `bun run land --keep` stopped with *does not replay onto
main … conflicts in docs/time-log.md* when another lane had appended an entry
at the end in the same hour — the plain two-appends case. Resolved by hand with
`git rebase main`, keeping both entries. Reproduce it in a repo test with two
branches each appending one `## ` entry after the same last entry, find why the
ledger merge declines it, and prove with `bun run check`.

## `bun run frames` cannot photograph a wave on HARD

- **Found:** 2026-09-25, claude/hard-wasted-ricochet
- **Files:** `tools/frames/flags.ts`, `tools/frames/spec.ts`, `tools/frames/page.ts`, `tools/frames/run.ts`

The difficulty a run is played at lives in `localStorage` (`neon-spore.progress`,
read once at boot by `apps/game/src/main-world.ts`), and `frames` has no flag
that writes it, so nothing HARD-only — the wasted shot's ricochet
(`render/ricochet.ts`), THE WELL's tempo — could be photographed with it. Worked
around with a throwaway probe that drove Chrome by hand. Add `--level
easy|medium|hard`, written by `addInitScript` beside `--seat`'s, and split
`flags.ts` (247 lines) and `spec.ts` (249) first, since both are at the limit.
Prove it with a `tools/frames/test` parse test and `bun run check`.

## Film THE COUNT's guide, and delete its words

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Files:** `packages/content/src/waves/act-3.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

THE COUNT's guide is still `both`/`p1`/`p2`, one of the ten the owner's *a film
or words, not both* (25 September 2026) left owed a film. Write its rehearsal
in `packages/content/src/scenes/` the way `.claude/skills/new-tutorial` says —
what the three strings teach, as captions on each seat's own screen — add it to
`SceneId` and `SCENES`, and replace the wave's guide with `{ scene }` alone in
the same commit (`WaveGuide` refuses both). Take the name out of `STILL_PROSE`
and move the counts in `scenes-prose.test.ts` and `briefings.md` §3.2 by one;
`bun run check` proves it.

## Film THE CHOKE's guide, and delete its words

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Files:** `packages/content/src/waves/act-7a.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

THE CHOKE's guide is still `both`/`p1`/`p2`, one of the ten the owner's *a film
or words, not both* (25 September 2026) left owed a film. Write its rehearsal
in `packages/content/src/scenes/` the way `.claude/skills/new-tutorial` says —
what the three strings teach, as captions on each seat's own screen — add it to
`SceneId` and `SCENES`, and replace the wave's guide with `{ scene }` alone in
the same commit (`WaveGuide` refuses both). Take the name out of `STILL_PROSE`
and move the counts in `scenes-prose.test.ts` and `briefings.md` §3.2 by one;
`bun run check` proves it.

## Film THE LIMPET's guide, and delete its words

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Files:** `packages/content/src/waves/act-7a.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

THE LIMPET's guide is still `both`/`p1`/`p2`, one of the ten the owner's *a film
or words, not both* (25 September 2026) left owed a film. Write its rehearsal
in `packages/content/src/scenes/` the way `.claude/skills/new-tutorial` says —
what the three strings teach, as captions on each seat's own screen — add it to
`SceneId` and `SCENES`, and replace the wave's guide with `{ scene }` alone in
the same commit (`WaveGuide` refuses both). Take the name out of `STILL_PROSE`
and move the counts in `scenes-prose.test.ts` and `briefings.md` §3.2 by one;
`bun run check` proves it.

## Film THE LEECH's guide, and delete its words

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Files:** `packages/content/src/waves/act-7a.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

THE LEECH's guide is still `both`/`p1`/`p2`, one of the ten the owner's *a film
or words, not both* (25 September 2026) left owed a film. Write its rehearsal
in `packages/content/src/scenes/` the way `.claude/skills/new-tutorial` says —
what the three strings teach, as captions on each seat's own screen — add it to
`SceneId` and `SCENES`, and replace the wave's guide with `{ scene }` alone in
the same commit (`WaveGuide` refuses both). Take the name out of `STILL_PROSE`
and move the counts in `scenes-prose.test.ts` and `briefings.md` §3.2 by one;
`bun run check` proves it.

## Film THE CODEX's guide, and delete its words

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Files:** `packages/content/src/waves/act-8.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

THE CODEX's guide is still `both`/`p1`/`p2`, one of the ten the owner's *a film
or words, not both* (25 September 2026) left owed a film. Write its rehearsal
in `packages/content/src/scenes/` the way `.claude/skills/new-tutorial` says —
what the three strings teach, as captions on each seat's own screen — add it to
`SceneId` and `SCENES`, and replace the wave's guide with `{ scene }` alone in
the same commit (`WaveGuide` refuses both). Take the name out of `STILL_PROSE`
and move the counts in `scenes-prose.test.ts` and `briefings.md` §3.2 by one;
`bun run check` proves it.

## Film THE GIMBAL, THE HASP and THE RATCHET once each is drawn

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Files:** `packages/content/src/waves/act-10.ts`, `packages/content/src/waves/act-11.ts`, `packages/content/src/scenes.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

Three of the ten guides still in words, and blocked rather than forgotten:
none of the three bosses is drawn yet (`scenes-prose.test.ts` says why beside
each), and a film rehearses the game's own screen. Whichever lane draws one
films it in the same sitting, as the five items above do, and deletes its
`both`/`p1`/`p2`. Until then the words are what the pair reads, and they stay.
Not startable by a fresh session before the look lands — take it after.

## `bun run shot` has no way to name a wave, and the filter route misses it

- **Found:** 2026-09-25, claude/reprise-boss-visibility-timing-6c7bb7
- **Files:** `tools/frames/shot-flags.ts`, `tools/frames/shot.ts`, `docs/commands.md`

`bun run shot "#grid" out.png --serve --type "#waveFilter=REPRISE" --click
".wave-row"` photographed the first wave on the list, not THE REPRISE: the
click lands before the filter has re-rendered the rail, and nothing says so.
What worked was `--path "/?wave=93"`, with the index worked out by a scratch
script. Add `--wave "<name or id>"` that resolves the index from `WAVES` and
sets the path, and fail loudly when it matches nothing; name it in
`docs/commands.md`. Provable with a test on `readShotFlags`.

## `wouldHear` asks each press of a one-tick gesture alone

- **Found:** 2026-09-25, claude/task-queue-work-efc91a
- **Files:** `apps/game/src/handle-press.ts`, `tools/frames/drive.ts`, `tools/frames/report.ts`

`bun run frames . --wave "THE INSTAR" --boss cursor=1,phase=act,phaseBeat=now
--hold "instarSwipe2=0,y=1600,id=1@20" --until instarAnswer` lands the swipe
and still prints `unheard: 1 of 3 … 20:2:drag`: the lift, asked on a world
where the grab and the carry sent a moment earlier have not been applied, arms
nothing. `wouldHear` steps one command against the tick's world, and a hold is
two or three commands sent on the same tick — THE THROAT's grab reads unheard
the same way. Ask each press against a copy that already has the tick's
earlier sends in it (the page knows them; `ns.send` queues them), so the
report names only a press the round actually dropped. Provable with a test on
`wouldHear` with a queued grab and carry before the lift.

## `land` cannot merge two time-log entries written at the top of the file

- **Found:** 2026-09-25, claude/filament-picture-clarity
- **Files:** `tools/land/ledger-merge.ts`, `tools/land/record-merge.ts`, `docs/time-log.md`

`bun run land --keep` stopped with "conflicts in docs/time-log.md" when the
trunk and the lane had each added an entry. `mergeLedger` merges with
`"last"`, on the argument that entries are appended at the end. But the lanes
of 25 September 2026 write theirs at the top, under the preamble, newest
first. So both sides insert at the same place, and the resolver gives up.
The conflict was resolved by hand, keeping both entries. Decide which end the
ledger grows from. Then either merge at that end, or have the resolver accept
an insertion at either end. Add a test in `tools/land/test` that uses two
top-inserted entries. Provable with `bun run check`.

## The director's SEEK counts ticks, so a briefing eats the row it was sent to

- **Found:** 2026-09-25, claude/wave-row-positioning-director-11eb05
- **Files:** `tools/director/src/stage.ts`, `tools/director/test/stage-step.test.ts`

`seek(beat)` in `stage.ts` rebuilds the world and steps `beat * ticksPerBeat` ticks. With
`briefings` on — the director on a phone, or the SHIP toggle — the wave's
introduction and guide hold `waveBeat` at 0 while the tick counts, so a press
on row 12 lands on row 0 behind the briefing. The map now marks `waveBeat`, so
it says so honestly rather than pretending. Step until `world.waveBeat` reaches
the beat (acking the briefing with `ackBriefing` for both seats first, or
seeking with the opening skipped), with a cap for a wave that ends first.
Provable with a test beside "the row the map follows".

## Split the canvas stub and THE THROAT's cue test, both past 250 lines

- **Found:** 2026-09-25, claude/throat-boss-guide-8b22d2
- **Files:** `packages/render/test/canvas-stub.ts`, `packages/render/test/boss-cue-throat.test.ts`

The stub is 685 lines and the test 345. The stub grew a `strokeText` in this lane, the first caller of it in
`packages/render`, and was already far past the limit. Split the text-box
recording (`texts`, `measureText`, `fillText`, `strokeText`) into a file of
its own, and THE THROAT's cue test by moment: the gum, the body in the mouth,
the rock in the mouth, the climb. `bun run check` holds both.

## Split touch.ts, malfunction.ts and the field-controls page

- **Found:** 2026-09-25, claude/fault-brush-darkness-28adad
- **Files:** `packages/render/src/touch.ts`, `packages/sim/src/malfunction.ts`, `tools/director/src/field-controls-page.ts`

THE DARK took `touch.ts` to 249 lines and `malfunction.ts` to 250, and only
fit because comments were shortened; the field-controls page is at 230. The
next fault or field gesture pushes all three over. `touch.ts`: move
`touchMove`'s per-hold dispatch into its own file beside `touch-hold.ts`.
`malfunction.ts`: move the per-kind swallow table out. The page: split the
entries by which seat holds them. `bun run check` holds all three.

## A sunk hull waits a shell's flight that no longer flies

- **Found:** 2026-09-25, claude/boss-blow-e
- **Files:** `packages/render/src/fleet-hulls.ts`, `packages/sim/src/fleet-flood.ts`

`sinkPhase` subtracts `FLEET_SHELL_BEATS` from a sinking because *the shell
is still in the air* — but a salvo no longer sinks anything: the only writer
of `sunkBeat` is `sinkFleetWreck`, on the navigator's pull. So a wreck pulled
under sits afloat for two beats before it starts to go, while the
blow (`fleet-fx.ts`) is already over. Drop the subtraction and its paragraph,
and add a case to the fleet frame tests that a hull pulled under is sinking on
the next frame. A fix to something wrong, not a look.

## THE VANE's pin knocked out has no event and no sound

- **Found:** 2026-09-25, claude/boss-blow-f
- **Files:** `packages/sim/src/vane.ts`, `packages/sim/src/events.ts`, `packages/audio/src/bind.ts`, `packages/render/src/boss-blows.ts`

`vaneStruck` does `b.pins -= 1` and pushes nothing, so the one moment the
pair beat THE VANE's bearing is silent, and the render side has to watch the
pin count to show the blow (`BossBlows.seeVane`). Push a `vanePin` event
there with the pins left and the column, give it a sound in the catalogue
beside the other bosses' landings, deal the blow off `BLOW_OF` instead of the
watcher, and drop `seeVane` and its case in `boss-hurt-drawn.test.ts` for a row in
`boss-hurt.test.ts`. `bun run check` holds it.

## Split boss-hurt.test.ts, past 250 lines

- **Found:** 2026-09-25, claude/boss-blow-f
- **Files:** `packages/render/test/boss-hurt.test.ts`

It was 332 lines on `main` before this lane and is 362 now: the table grows
by a row a boss. Move `ROWS` into a `boss-hurt-rows.ts` beside it, with the
two world builders (`instarMorphing`, `undertowStanding`), and keep the cases
in the test. `bun run check` holds it.

## THE INSTAR, breath: the shove is seen and heard

- **Found:** 2026-09-25, claude/instar-boss-enhancements-1ae51f
- **Files:** `packages/render/src/instar-head.ts`, `packages/render/src/instar-shape.ts`, `packages/sim/src/instar-step.ts`, `.claude/skills/new-boss-state`

The second and third bites of the breath push back against both thumbs every
beat (`pushMilli`, `sim/instar-step.ts` `pushBack`), and today the only sign
is the jaw drawn a little more open. The lips should tremble on the beat of a
shove, stronger at the third bite's push, and the shove should have a sound —
which is a new event, `instarShove`, and so the twelve registrations
`.claude/skills/new-boss-state` lists. A look the owner asked for by name
(*player really feels when pulling it is required to be stronger*).

## THE INSTAR, breath: a second gesture during the bite

- **Found:** 2026-09-25, claude/instar-boss-enhancements-1ae51f
- **Taken:** 2026-09-25, claude/instar-boss-enhancements-1ae51f (claim: claude/queue-the-instar-breath-a-second-gesture-during-the-bi)
- **Files:** `packages/content/src/instar-script.ts`, `packages/sim/test/instar-push.test.ts`, `packages/render/src/instar-draw.ts`
- **Asks:** Which gesture goes with the third bite — (a) between the bites, a mark on the fire in the mouth that one seat taps out while the jaws are forced open, (b) during the third bite, one seat pulls its jaw while the other taps the fire, then both pull, or (c) none, the push is enough?

The owner, 25 September 2026, on the breath's three bites: *or combine with
some other movement action in between or during.* The three bites and the
push landed; the combination did not, because it picks a gesture and a part
the owner has not named. A mark on the fire would be a new part, last in
`INSTAR_PARTS` for the hash.
