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

## Film THE GIMBAL, THE HASP and THE RATCHET once each is drawn

- **Found:** 2026-09-25, claude/wave-details-text-cleanup-d25f4a
- **Taken:** 2026-09-26, claude/queue-film-the-codexs-guide-and-delete-its-words (claim: claude/queue-film-the-gimbal-the-hasp-and-the-ratchet-once-ea)
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

## `bind.ts` and `ship-fields.ts` sit at their line ceiling

- **Found:** 2026-09-26, claude/shield-enemy-knockback-6364bd
- **Files:** `packages/audio/src/bind.ts`, `tools/director/src/ship-fields.ts`

The shield push landed one `case` in `bind.ts`, which is now exactly 250
lines, and two fields in `ship-fields.ts`, now 243 — the hook asked for a seam.
The next event or `SimConfig` key will push either over `limits.test.ts`.
Cut `bind.ts` the way `bind-volley.ts`, `bind-carom.ts` and `bind-gum.ts`
were cut (the shared-defence cases — deflect, guard, shield push — are a
natural file), and split `FIELD_GROUP` by group into a second page imported
back. Proof: `bun run check`, both files well under 230.

## `queue next` sends a worktree session to a tree it may not write

- **Found:** 2026-09-26, claude/queue-the-other-pull-handles-show-the-path-they-can-be
- **Files:** `tools/queue/prompt.ts`, `.claude/skills/lane/SKILL.md`

The prompt `bun run queue next` prints always says `git worktree add` a new
tree for the claimed branch. A desktop session already opened in a worktree
of its own is refused every Write/Edit outside that tree by a harness hook,
so the new tree cannot be worked in: this lane removed it again and ran
`git checkout <branch>` in its own clean worktree instead. Have `prompt.ts`
detect a clean worktree that is not the main checkout (`git rev-parse
--git-common-dir` differs from `--git-dir`, `git status --porcelain` empty)
and print `git checkout <branch>` there, with `bun install` still after it;
say the same in the lane skill's section 1. Proof: a test in
`tools/queue/test/` for both prompts, and `bun run check`.

## `bun run frames --until` misses an event that fires between two presses

- **Found:** 2026-09-26, claude/shield-enemy-knockback-6364bd
- **Files:** `tools/frames/reach.ts`, `tools/frames/until.ts`

`reachFirstFrame` hands `until.event` to `d.advance` only on the last segment
of `pressPlan`; every earlier segment advances blind. So `--press` that keeps
pressing after the event (a guard every beat, say) and `--until shieldPush`
reports the push as missed although it happened, and `--until-on N` counts
only the occurrences after the last press. The lane worked round it by ending
the presses before the push. Watch the event on every segment, carry the count
across them, and stop at the Nth wherever it falls; a test in
`tools/frames/test/` that presses past the event holds it.

## `packages/content/src/scenes.ts` is at 250 lines

- **Found:** 2026-09-26, claude/shield-enemy-knockback-6364bd
- **Files:** `packages/content/src/scenes.ts`

ONE LAST CHANCE's film took the last line; the header paragraph on the
choreographed films was shortened by one to make room. The next scene
registered pushes it over. Move the `SCENES` table (or the `SceneId` union and
the imports that feed it) into a file of its own imported back, the way the
wave acts were cut out of `waves.ts`. Proof: `bun run check`, both files well
under 230.
## `packages/sim/src/hash.ts` is at 250 lines

- **Found:** 2026-09-26, claude/queue-the-slow-does-not-say-whether-a-window-asks-for
- **Files:** `packages/sim/src/hash.ts`, `packages/sim/test/hash-coverage.test.ts`

THE SLOW's `slowAsks` took the last line, and a comment was folded to make
room. The next `World` field pushes it over. `hashWorld` is one function of
about 220 lines. Move the per-field pushes for one self-contained group, such as
the ship and shield fields or the slow and spend ledger, into a helper file
imported back, the way the bosses' hashes live in `*-hash.ts`. Keep the
exceptions comment in `hash.ts`, where `hash-coverage.test.ts` and CLAUDE.md
point. Proof: `bun run check`, both files well under 230.

## Shaking the phone never reaches THE CHOIR on an iPhone

- **Found:** 2026-09-26, claude/laughing-goodall-xscpy0
- **Files:** `apps/game/src/shake.ts`, `apps/game/src/join-room-step.ts`, `apps/game/src/fullscreen.ts`

iOS 13 and later deliver no `devicemotion` event until
`DeviceMotionEvent.requestPermission()` has been called from a user gesture and
granted. `shake.ts` names that in its comment and nothing in the app calls it,
so on an iPhone the listener is silent and the pilot is left with the arrows.
Call it once, guarded by `typeof DeviceMotionEvent.requestPermission ===
"function"`, from the same press that asks for fullscreen — the READY press in
`join-room-step.ts` through `fullscreen.ts` — and ignore a refusal, since the
arrows stay either way. A unit test with a stubbed `DeviceMotionEvent` proves
the call is made from the press and never at load. Found while writing the
input inventory in `docs/spec/transfers-touch.md` (§4.2).

## A long press on the field can open the iOS callout and a pinch can zoom the page

- **Found:** 2026-09-26, claude/laughing-goodall-xscpy0
- **Files:** `apps/game/src/game.css`, `apps/game/index.html`

Safari ignores `user-scalable=no` since iOS 10 and shows the copy/share
callout on a held finger unless `-webkit-touch-callout: none` is set. Neither
the stylesheet nor the page sets it, and nothing cancels `gesturestart`, so a
held press — which several bosses ask for — can raise a sheet over the field,
and two fingers can zoom it. Add `-webkit-touch-callout: none` and
`-webkit-user-select: none` next to the existing `touch-action` rules, and a
`gesturestart` listener that calls `preventDefault` (non-passive). Proof:
`bun run check`; whether the callout is gone on a real iPhone is unverified
from a cloud session.

## The spec calls `MutualRelease` unbuilt; THE SURGE built it

- **Found:** 2026-09-26, claude/laughing-goodall-xscpy0
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/surge-step.ts`, `packages/sim/src/surge.ts`

The library table (around "timed-release") and §8's table both mark
`MutualRelease` — two lifts within N beats — as not built, but THE SURGE judges
exactly that (`liftTick` in `surge.ts`, the window in `surge-step.ts`). Mark it
built there, name the file, and say whether a later boss should call THE
SURGE's judge rather than write its own; if it should, add the row to the
called-not-re-derived table in `packages/sim/test/purity.test.ts`.

## §23 THE MANTLE — the simulation lane

- **Found:** 2026-09-26, this session (DavidDe's ask for five more choreographed bosses read the same on both screens)
- **Taken:** 2026-09-26, this session (claim: claude/mantle-boss-simulation)
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

A shelled body with two handles, `mantleLeft` and `mantleRight`, pulled down
together by both seats at once — a floor-checked sum (`mantlePairMilli`)
rather than a split gauge, shown identically on both screens. Eight plates as
the health, three pull-together movements, a two-seat alternating tap finish
on the bared core. The full beat list, mechanic and departures are §23 of
`docs/spec/bosses-choreographed.md`. Every row of
`.claude/skills/new-boss/registrations.md` for a field-adjacent choreographed
scene, THE SLOW on every pull window, `bun run check` proves it. Its importers are about twenty `instar-*.ts` files
and four tests; `grep -rl instar-shape packages/render` lists them.

## §24 THE KEEL — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

A six-segment spine whose one tap target, `keelJoint`, walks between the
left and right half of the body — whichever seat is nearer the mark when it
lights is the one the cue calls, with no `Alternation` refusal and no per-step
authored seat. One standard-control fire step at the midpoint (movement 2).
The full beat list is §24 of `docs/spec/bosses-choreographed.md`. THE SLOW on
every joint window except the fast re-lit run in movement 3, which is at
tempo on purpose. `bun run check` proves it. Its importers are about twenty `instar-*.ts` files
and four tests; `grep -rl instar-shape packages/render` lists them.

## §25 THE VALVE — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

`FreezeTap` — the one genuinely new verb on either brief — finally spent:
Player 2's timed tap halts the `valveWheel` bearing drag Player 1 is turning,
and only while frozen can either seat pull the stilled `valvePin` free.
Three pins as the health, three movements, the last one turning the wheel
away from its mark before it can hold. The full beat list is §25 of
`docs/spec/bosses-choreographed.md`. New member on `Hold["kind"]`, so
`tools/director/test/on-field-controls.test.ts`'s exhaustive switch is part of this
lane and not a follow-up. THE SLOW on every freeze and every pull.
`bun run check` proves it. Its importers are about twenty `instar-*.ts` files
and four tests; `grep -rl instar-shape packages/render` lists them.

## §26 THE SEAM — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

Nothing new: an authored `BossSequenceStep` list gating the ordinary shot and
shield commands at a lit point on a cracked ridge, three widened points as
the health. The cheapest of the five — proof that a choreographed scene can
be built entirely out of the standard controls DavidDe asked to keep for
specific sequences. The full beat list is §26 of
`docs/spec/bosses-choreographed.md`. THE SLOW on every fire and shield
window. `bun run check` proves it. Its importers are about twenty `instar-*.ts` files
and four tests; `grep -rl instar-shape packages/render` lists them.

## §27 THE OCULUS — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/registrations.md`

Two hold targets, `oculusLeafLeft` and `oculusLeafRight`, close a six-leaf
iris two at a time — a *held* `SimultaneousAction` rather than a released
one, reopening if either thumb lets go before the window's beat count. Once
shut, a `SceneBreak` (named here for the first time) hands the scene to an
ordinary gated shot at the bared core, with two more held-reseal beats
defending it. The full beat list is §27 of
`docs/spec/bosses-choreographed.md`. THE SLOW on every hold and every fire.
`bun run check` proves it. Its importers are about twenty `instar-*.ts` files
and four tests; `grep -rl instar-shape packages/render` lists them.

## §23 THE MANTLE — the look

- **Found:** 2026-09-26, this session
- **Needs:** §23 THE MANTLE's simulation lane, above, landed first
- **Files:** `docs/spec/bosses-choreographed.md`

Lane two, per `.claude/skills/new-boss` §5, read against THE INSTAR's
five-point checklist: the shell's two valves as a body with parts a mark can
sit on, bowing outward under a growing pull (deformation off `mantlePairMilli`
rather than a bar), the split-open pose a blend rather than a cut, and the
bared core's alternating-tap finish as the mark saying which gesture. Nothing
here is drawn yet. A cloud session can render and inspect static frames the
ordinary way (`bun run frames`), but whether the pull reads right at tempo is
for the owner's own eye and stays unverified until he has looked.

## §24 THE KEEL — the look

- **Found:** 2026-09-26, this session
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

## The game's TEST view has no AUTO

- **Found:** 2026-09-26, claude/queue-auto-plays-bosses-only-and-only-in-the-director
- **Files:** `tools/director/src/autopilot-field-hand.ts`, `tools/director/src/autopilot-hands.ts`, `tools/director/src/boss-hands-*.ts`, `apps/game/src/testing.ts`

The second half of "AUTO plays bosses only, and only in the director". The
director's AUTO now plays an ordinary wave as well as every boss, but a phone
alone under the game's TEST panel still has no second thumb, and `apps/game`
cannot import from `tools/`. Move the hands (`fieldHand`, `AUTOPILOT_HANDS`,
and the `Hand` type out of `poses-bosses-kit.ts`) into a package both can
import — a new `packages/hands`, not `sim`: they are a player's input fed
through `step`, not a rule — leave the director importing them from there,
and give `testing.ts` an OFF/BOTH/P1/P2 row that adds the hand's commands to
the tick the way the director's `stage-autopilot.ts` does. Prove it with a
test that the game's loop, AUTO on BOTH, clears ONE LAST CHANCE headless.

## AUTO's field hand half plays 22 ordinary waves

- **Found:** 2026-09-26, claude/queue-auto-plays-bosses-only-and-only-in-the-director
- **Files:** `tools/director/src/autopilot-field-hand.ts`, `tools/director/test/autopilot-field.test.ts`

`fieldHand` plays the cannon and the shield and nothing else, so the waves
whose creature has a verb of its own — SALVAGE, CATCH AND AIM, THE LURE, THE
CLASP, THE CRAWLER, THE JAM and sixteen more, the `HALF_PLAYED` set in the
test — end scarred or never clear. Give each such creature its answer in the
hand (a file per few creatures, as the boss hands are split), taking its name
out of `HALF_PLAYED` as it goes; the test already fails for any wave the hand
stops clearing clean.

## instar-shape.ts is 236 lines: split the pixels from the figure

- **Found:** 2026-09-26, claude/queue-the-instar-brood-eggs-that-crack-while-nobody-ta
- **Files:** `packages/render/src/instar-shape.ts`, `packages/render/src/slow-intake-aim.ts`, `packages/render/src/filament-shape.ts`

The file holds two things: the figure's arithmetic (`Figure`, `deformed`,
`instarFigure`, the morph, threat and fade clocks) and the figure turned into
pixels (`instarAt`, `instarLen`, `instarFarEnd`, `instarHeadAt`,
`instarMarkPoint`, `instarMarkRadius`, about seventy lines). Move the second
into `instar-place.ts` and point the importers at it; no drawing changes, and
`bun run check` proves it. Its importers are about twenty `instar-*.ts` files
and four tests; `grep -rl instar-shape packages/render` lists them.

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

## THE INSTAR's word box flips onto the partner's ring near an edge

- **Found:** 2026-09-26, claude/queue-the-instar-lash-a-tail-that-sweeps-rather-than-s
- **Files:** `packages/render/src/instar-word.ts`, `packages/render/src/instar-marks.ts`

`drawInstarWord` hangs a mark's box outward, away from the middle, and flips
it to the ring's inner side when the outer side has no room. Near an edge —
the sway's far end, and now the lash's sweep, which carries player 1's blade
to 270 before the sway — the flipped box lands on the partner's ring, 240
thousandths across: the P1 lash box covers P2's ring (`bun run frames . --wave
"THE INSTAR"` with the lash step, `--until-on 280`). This is a fix, not a
look: stand the box above or below its ring when neither side is clear of
the other ring, and pin it in `packages/render/test/instar-word.test.ts`.

## THE INSTAR's render tests each stand the body up their own way

- **Found:** 2026-09-26, claude/queue-the-instar-lash-a-tail-that-sweeps-rather-than-s
- **Files:** `packages/render/test/instar-kit.ts`, `packages/render/test/desk-grab.test.ts`, `packages/render/test/instar-eggs.test.ts`, `packages/render/test/instar-frame.test.ts`, `packages/render/test/instar-together.test.ts`

`hung()` and `acting()` are written five times over, near enough the same.
`instar-kit.ts` now holds the sway test's copy and the sweep test uses it;
move the other four onto it, keeping any variant a test genuinely needs (the
desk's `put` step, the frame test's `morphing`/`down`) as a parameter or a
local wrapper, and `bun run check` proves it.

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

## `land` fails when the trunk gets a holder during its check

- **Found:** 2026-09-26, claude/slow-visual-versus-page-a1e86e
- **Files:** `tools/land/run.ts`, `tools/land/say.ts`

`moveTrunk` reads `going.moveRef` — "no worktree holds it" — when the landing
is planned, then runs `bun run check` for minutes, then moves the ref with
`git branch --force`. When the main checkout switched onto `main` in between,
the move failed with *cannot force update the branch 'main' used by worktree*,
after a green check, and the landing had to be run a third time (the second
had lost to `trunkRaced`, as it should). Ask `git worktree list --porcelain`
again beside `trunkRaced`, just before the move, and take the `merge --ff-only`
path in the tree that now holds the trunk; pin it with a unit case on the
planner that feeds it a holder appearing after the plan.
