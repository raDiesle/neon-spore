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

## Unverified at 424e7fc4: a real phone browser's own chrome eating the foot of th…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `tools/director/src/director-columns.css`, `tools/director/src/director-phone.css`, `tools/director/src/rail-open.ts`, `tools/director/test/phone-game.test.ts`, `tools/director/test/rail-open.test.ts`
- **Where:** phone

*A wave row opens the field, and on a phone the field is the screen* landed from a session that could not look at it. What went unchecked:

- a real phone browser's own chrome eating the foot of the director's GAME view at 375x812 — headless has no chrome to test it with

**This one stays local, and for a different reason than the several "a cloud
session has no screen" entries this session closed today by rendering real
frames instead** (`bun run frames` reads a headless canvas fine). A browser's
own chrome —
the address bar, the bottom toolbar, the home-indicator strip — is drawn by
the OS/browser shell *around* the page, never inside the rendered viewport a
screenshot can reach; headless Chromium has none of it to begin with, so no
frame this repo can render, real event or fabricated state alike, would ever
show it eating anything. This needs an actual phone.

One data point for whoever opens it there: the layout doesn't use `100vh` (the
old trap `dvh` exists to fix — a fixed value that used to lock in the *full*
screen height including whatever the chrome would cover). `director-shell.css`
chains `height: 100%` from `body` down, the same pattern `apps/game/src/
game.css` uses for the shipped field the owner already plays on his own phone.
A percentage chain resolves against the layout viewport a browser actively
reflows as its own chrome shows or hides, which is the correct half of this
problem without reaching for `dvh` at all — so if the foot is still eaten, the
more likely cause is the `director-phone.css` comment's own already-measured
67px aspect-ratio reserve (`min(100cqh, 100cqw / 0.56)`, real and expected)
compounding with a real toolbar's height on top of it, not the sizing method
itself. Worth checking that distinction before touching any CSS here.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at ce22d819: THE ORRERY's rehearsal film watched at tempo — the thre…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-orrery.ts`, `packages/content/test/scene-orrery.test.ts`
- **Where:** phone

*THE ORRERY: a shot cracks a ring and the pilot's thumb takes it off* landed from a session that could not look at it. The commit touched 19 more files. What went unchecked:

Three of the four are settled now, on real frames. The `OPEN` mark stands on
the cracked ring's own grip exactly as `boss-cue-read-l.ts` says (`--boss-json
'{"phase":"seized"}'`). The winds are real, continuous motion and not a
snap: `--opening guide --guide-page 4 --frames 4 --stride 20` catches the
outer ring's organs turning a little further round in each of four real
frames, mid-wind — and all three rings turn through the one shared
`drawOrreryGrip` (`orrery-grab.ts`), so this is the mechanism, not a fact
about the outer ring alone. The split around the rock is the same picture,
banked correctly across the interruption — `orrery-hand.test.ts` already
proves the state survives the release and the re-grip — so what is left of
it is only whether it *reads* right on a real playthrough, folded into the
one question below rather than counted separately.

- Whether a turn and a half of a thumb per organ (`orreryHandMilliPerOrgan`)
  feels like a decision or like friction, on a real phone, mid-fight. No
  frame answers this: it is a pacing question about a real thumb, not a
  fact about the picture.

Open it on a device that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `--boss-json` cannot write a list the boss does not already hold

- **Found:** 2026-09-21, claude/queue-unverified-at-5780141b-the-picture-of-a-carried
- **Files:** `tools/frames/boss-install.ts`, `tools/frames/boss.ts`, `tools/frames/test/boss-flag.test.ts`
- **Asks:** May a boss's list field be written at a length the simulation did not stand it up with?
- **Where:** local

`boss-install.ts` refuses a list whose length differs from the field's: *that
field holds 0, and 1 came*. The rule was written for THE BATON's thread and
THE TASTER's blades, which are fixed-width — but the states most worth
photographing are the ones a boss **grows**. THE SCUTTLE's `loose` is empty
between throws and holds one or two during them, so

    --boss-json '{"loose":[10],"live":10,"swung":-1,"swungCol":-1}'

is refused outright, and the one state that boss's whole handle lives in
cannot be written at all. Worked around by driving the wave to its own
`scuttleLoose` and reading the socket off `--events`, which costs two runs and
only works because the draw is seeded.

THE LEDGER's `beads` is the same field again and a harder case, because it is
empty until the pair *shoots*: a return only exists once a bolt has gone up
the seam's column in the colour it is showing. So no frame of the pilot's ring
on a return could be posed at all, and the handles lane took it by firing —
`--boss seam=2 --press 300:1:cannonCol=6 --press 306:2:fire=cyan`, with the
seam's column worked out in a probe first (22 September 2026).

THE SCOUT's `carrying` is the third, and the one that shows what the rule
costs. It starts empty and grows a mote at a time as the ship is flown, and
both of that round's handles are gated on how many are aboard — laden past
`scoutLadenMotes`, heavy past `scoutHeavyMotes`. So the only length the flag
will write is the one where neither ring exists. The lane that wanted those
two pictures took the other road instead (*`--press` knows no scout verb*, 22
September 2026): `--press` learned the pilot's three, and a flight recorded
off a headless autopilot now puts four motes aboard and photographs the laden
ring. It works, and it costs minutes of a lane per picture, and it only
reaches states a flight can reach — the heavy ring needs five motes, which
only the second arena has, and that arena is what *THE SCOUT's second arena
leaves the scout nowhere to stop* is about. So it is unphotographed today.

THE UNDERTOW's `breaches` is the fourth. It is empty until a plate parts, so
no lobe — the one vulnerable thing in that fight — can be posed; the lane that
gave the lobes their material (23 September 2026) found standing ones by
probing a no-press run for the ticks they come up at (750–825, 1575), and a
**tall** lobe or the body's last pass never comes up at all without play, so
both were proved by the frame tests alone and never seen by an eye.

SNAKE's `body` is the fifth. The round stands it up three tiles long, and its
grip is its length: `gorge` past `snakeGorgeTiles`, `shed` past
`snakeShedTiles`. So the MAW face going dark once the jaws stick (23 September
2026) was refused as *that field holds 3, and 7 came*, and was proved by
`snake-frame.test.ts` alone.

What to decide: whether the length check is right for every list or only for
the fixed-width ones. A field whose length the simulation varies is not a
shape the flag can check against, and the honest options are a per-field
allowance, a check against the field's *element* type instead of its length,
or leaving it and saying so in the refusal — which today reads as a bug in
the caller rather than as a rule.

## The screen chooser's two card names say PILOT and NAVIGATOR

- **Found:** 2026-09-23, claude/queue-six-strings-a-player-reads-are-outside-the-words
- **Files:** `packages/content/src/screen-words.ts`, `tools/words/text.ts`, `.claude/skills/game-words/SKILL.md`
- **Asks:** Should the two cards read PLAYER 1 and PLAYER 2, or do PILOT and NAVIGATOR stay as the names of the jobs?

`.claude/skills/game-words` says no screen shows a player the word *pilot* or
*navigator*, and `SCREEN_WORDS.p1.name` and `.p2.name` are exactly those, in
capitals, on the menu. The words check does not see them because only the
`what` under each card is in its inventory. Either answer is small: **PLAYER 1
/ PLAYER 2** changes the two names and adds them to `text.ts` as `name`
entries, which the vocabulary rows then hold; **keep them** changes the two
table rows in the skill to say the menu's job names are the one exception.
The card's tag already reads P1 or P2, which is the argument for keeping a
job name beside it.

## Player-facing marks still say PILOT'S, NAVIGATOR'S and SEAT

- **Found:** 2026-09-23, claude/task-queue-work-e21054
- **Files:** `packages/render/src/fleet-grip-draw.ts`, `packages/render/src/handle-word.ts`, `packages/render/src/instar-marks.ts`, `packages/render/src/maze-grip.ts`, `packages/render/src/maze-string.ts`, `packages/render/src/pair-call.ts`, `packages/render/src/stare-draw.ts`, `packages/render/src/ready-words.ts`, `packages/content/src/screen-words.ts`, `apps/game/src/menu-seats.ts`, `tools/words/test/drawn.test.ts`
- **Asks:** On a grip mark and a pair call, which does a player read — `P1'S` / `P2'S`, or `PLAYER 1'S` / `PLAYER 2'S`? And the menu's screen chooser, whose card names are PILOT and NAVIGATOR and whose heading is SEAT — `PLAYER 1` / `PLAYER 2` under `SCREEN`, or keep the job names there as a proper noun?
- **Where:** local

The vocabulary says a player is never shown pilot, navigator or seat, and the
guides obey it; fifteen drawn literals do not (`drawn.test.ts`, `STANDING`).
The long form is what the guides say; the short form is what the seat
switcher already shows and fits a mark a quarter of the width. The chooser is
the one place the job name could stand as a name, as `THE WARD` does. Once
answered, change the literals, strike the lines, and send one frame of THE
FLEET's grip marks.

## A short phone stands the hull between two black side bars

- **Found:** 2026-09-23, claude/queue-a-phone-in-test-mode-has-nowhere-to-put-two-band
- **Files:** `packages/render/src/layout-stage.ts`, `packages/render/src/layout.ts`, `packages/render/src/hull.ts`, `packages/render/test/layout-stage.test.ts`
- **Where:** local
- **Asks:** On a phone shorter than about 16:9 of free height, which should give: the dark bars, a wider picture, or a shorter band?

The owner, 20 September 2026: *"horizontal the hull skin is vertical cutted
inside of the screen."* It is `computeStage` doing what it says: the stage is
never wider than `cols * tile`, and the tile is whatever the height leaves
after the band (`bandSoloPct`, 19%) and the radar. At 390×660 — a real phone
with its bars out — that is 366 of 390 pixels, with 12 dark at each side; at
375×548 it is 300 of 375. The three answers, each sized:

- **Keep the bars.** The columns are the frame (`layout-stage.ts`'s own
  comment); nothing changes but that comment, which then says it was asked.
- **Draw past the columns.** The stage takes the window's width, the field
  stays `cols * tile` and centred, and the hull's skin, the band and the
  background are drawn out to the edges. `computeLayout` already carries
  `gridLeft`; the hull and the band are the work, and `frame.test.ts` redraws.
- **Shorten the band on a short screen.** `bandHeightFor` takes a smaller
  share below some height so the tile grows back to the width. The lobes shrink
  with it; `layout-stage.test.ts`'s touch-ring test holds them inside.

## Unverified at 5db3ae3e: the svh cap on a real phone whose address bar comes bac…

- **Found:** 2026-09-23, claude/queue-a-phone-in-test-mode-has-nowhere-to-put-two-band
- **Files:** `apps/game/index.html`, `apps/game/src/game.css`, `apps/game/src/safe-area.ts`, `apps/game/src/viewport.ts`, `apps/game/test/viewport-furniture.test.ts`, `apps/game/test/viewport-screen.ts`, `docs/queue.md`, `docs/time-log.md`
- **Where:** phone

*A phone's frozen height stops at the bars-out height, and the build date leaves the field* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- the svh cap on a real phone whose address bar comes back mid-wave — no emulated viewport has the bar

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 2d3f8edd: ?lag=1's worst and median press-to-frame figures on a r…

- **Found:** 2026-09-23, claude/queue-nothing-says-how-long-a-thumb-waits
- **Files:** `apps/game/src/frame.ts`, `apps/game/src/input-buffer.ts`, `apps/game/src/main.ts`, `apps/game/src/press-lag-page.ts`, `apps/game/src/press-lag.ts`, `apps/game/test/press-lag.test.ts`, `docs/INDEX.md`, `docs/queue.md`
- **Where:** phone

*?lag=1 shows how long a press waits for the field to answer it* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- ?lag=1's worst and median press-to-frame figures on a real phone, solo and paired — the browser pane paints at one frame a second

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## The doubled window: THE TASTER and THE LEAD

- **Found:** 2026-09-24, claude/queue-the-doubled-window-the-gorge-the-taster-and-the
- **Files:** `packages/sim/src/config-taster.ts`, `packages/sim/src/config-lead.ts`, `packages/sim/src/taster-step.ts`, `packages/sim/src/taster-shot.ts`, `packages/sim/src/lead-step.ts`, `packages/sim/src/lead-shot.ts`, `packages/content/src/scenes/the-taster.ts`, `packages/content/src/scenes/the-lead.ts`, `packages/sim/test/taster-hand.test.ts`, `tools/director/src/poses-bosses-hands-*.ts`, `docs/spec/bosses.md`

The two left of the lane that did THE GORGE (`sim/gorge-slow.ts` is the
pattern: THE SLOW read off the asks standing, called after every change).
Per `docs/spec/choreographed-windows.md`'s **Doubled** table:
`tasterPryBeats` 6 → 12 with `tasterPryFills` at two; `leadStillBeats` 4 → 8,
`leadHoldBeats` 8 → 16 and `leadStillFills` at two. Both move THE SLOW from
where they open it today (`taster-step.ts`, `lead-step.ts`) to the ask, shut
by `closeSlow` on both exits. Re-time each film against its
`scene-<boss>.test.ts` rather than loosen it, say the new counts in the
guide (`content/src/waves/`), give a director pose that no longer reaches its
state a bigger `budgetBeats`, and add the dated line to `bosses.md` §11.n.
`taster-hand.test.ts` holds the pry longer than a fill. One boss a sitting:
THE TASTER first.

## The doubled window: THE UNDERTOW, THE BELLOWS, THE HASP and THE BATON

- **Found:** 2026-09-24, claude/queue-the-doubled-window-the-gorge-the-taster-and-the
- **Files:** `packages/sim/src/config-undertow.ts`, `packages/sim/src/config-bellows.ts`, `packages/sim/src/config-hasp.ts`, `packages/sim/src/config-baton.ts`, `packages/sim/src/undertow-step.ts`, `packages/sim/src/bellows-step.ts`, `packages/sim/src/hasp-step.ts`, `packages/sim/src/baton-step.ts`, `packages/content/src/scenes/the-undertow.ts`, `packages/content/src/scenes/the-baton.ts`, `tools/director/src/poses-bosses-hands-*.ts`, `docs/spec/bosses.md`

The third of the three lanes `32c0cbb4` said it queued, and never did: its
Files line had been left on THE CURTAIN's entry. Per
`docs/spec/choreographed-windows.md`'s **Doubled** table — THE UNDERTOW's
stand, unseat and last windows with `undertowHoldBeats` and
`undertowUnseatSlides`; THE BELLOWS' window with `bellowsExchanges`; THE
HASP's holds with its wind; THE BATON's swell, merge window and final with
`batonSwellStrips` and `batonMergeBeats`. THE SLOW moved to the ask on
UNDERTOW, BELLOWS and HASP, opened for the first time on THE BATON
(`sim/gorge-slow.ts` is one pattern). BELLOWS and HASP have no film. The
tests' relations: THE UNDERTOW's breach wide before the stand runs out
(`undertow.test.ts`), THE BATON's acts equal to its final beats
(`baton.test.ts`). One boss a sitting.

## The first of THE GORGE's two shots, and of its two beams, makes no sign

- **Found:** 2026-09-24, claude/queue-the-doubled-window-the-gorge-the-taster-and-the
- **Files:** `packages/sim/src/gorge-step.ts`, `packages/sim/src/events-gorge.ts`, `packages/render/src/gorge-fx.ts`, `packages/audio/src/`, `.claude/skills/new-boss-state/SKILL.md`

Since the doubled window a full intake takes `gorgeVentShots` (2) and the
pried mouth `gorgePryFills` (2) beams, and the first of each only moves a
count — `GorgeIntake.pierced`, `GorgeState.pryFills` — with no event. The
field and the speaker say nothing until the second, so a pair cannot tell a
shot that landed from one that went nowhere. Add an event for each (a nick,
a first fill) with its registrations (`.claude/skills/new-boss-state`), and
a sound. The picture is a look with no shipped alternative: say which
exemption in the commit.

## The doubled window: THE CURTAIN, THE SINEW, THE CANDLE and THE ANTIPHON

- **Found:** 2026-09-23, claude/task-queue-work-7ae87c
- **Files:** `packages/sim/src/config-curtain.ts`, `packages/sim/src/config-sinew.ts`, `packages/sim/src/config-candle.ts`, `packages/sim/src/config-antiphon.ts`, `packages/sim/src/curtain-step.ts`, `packages/sim/src/sinew-step.ts`, `packages/sim/src/candle-step.ts`, `packages/sim/src/antiphon-step.ts`, `packages/content/src/scenes/the-curtain.ts`, `packages/content/src/scenes/the-sinew.ts`, `packages/content/src/scenes/the-candle.ts`, `packages/content/src/scenes/the-antiphon.ts`, `tools/director/src/poses-bosses-hands-*.ts`, `docs/spec/bosses.md`

The four whose need is already a named figure beside the window — a lift, a
column count, a pinch, a pull. Double both halves per
`docs/spec/choreographed-windows.md`, the SLOW opened at the ask (for the
first time on THE CURTAIN and THE ANTIPHON), the films re-timed and the
rehearsals given room.

## `strokeGlow` is handed an alpha it throws away: the bodies

- **Found:** 2026-09-24, claude/queue-about-100-strokeglow-calls-are-made-at-an-alpha
- **Files:** `packages/render/src/balloon-alive.ts`, `packages/render/src/balloon-handles.ts`, `packages/render/src/body-burst.ts`, `packages/render/src/body-mark.ts`, `packages/render/src/crawler-marks.ts`, `packages/render/src/crawler.ts`, `packages/render/src/ghost.ts`, `packages/render/src/living-skin.ts`, `packages/render/src/meteor-blaze.ts`, `packages/render/src/meteor-comet.ts`, `packages/render/src/moult.ts`, `packages/render/src/pods.ts`, `packages/render/src/pulse-wash.ts`, `packages/render/src/recoil-globe.ts`, `packages/render/src/scout-draw.ts`, `packages/render/src/wisp-body.ts`

`strokeGlow` sets `globalAlpha` for every pass and never reads the one it
was handed, so a caller's `ctx.globalAlpha = …` just before it does nothing
to the line. 16 calls in 16 files, by caller and line: `balloon-alive.ts:126`, `balloon-handles.ts:158`, `body-burst.ts:142`, `body-mark.ts:71`, `crawler-marks.ts:87`, `crawler.ts:146`, `ghost.ts:136`, `living-skin.ts:148`, `meteor-blaze.ts:144`, `meteor-comet.ts:143`, `moult.ts:110`, `pods.ts:111`, `pulse-wash.ts:138`, `recoil-globe.ts:126`, `scout-draw.ts:93`, `wisp-body.ts:140`.

Most are probably an alpha left over from a fill inside the same `save` — a
body's fade, a haze — so the glow's line is drawn at full presence over
something drawn at half. For each, say whether the fade was meant; if it
was, pass it as `alpha`, dividing `intensity` by it where the call passed
both so the glow stays put (`ship-marks.ts`'s arrows are the pattern).
`hull.ts`'s `rimAlpha` looked like one and was an intensity all along, so
read the doc before the name. Each changes a picture that ships: it lands
under "a fix to something wrong", with one before/after PNG. More than a
sitting's worth is split by file before it is started.

Reproducing the list, from 24 September 2026: a `globalThis` tally in
`strokeGlow` of the calls arriving with `globalAlpha` below 1, keyed on the
caller's stack frame, written out by an `afterAll` in a `--preload` file
over `bun test packages/render/test` — about a minute, in one process.

## `strokeGlow` is handed an alpha it throws away: the bosses

- **Found:** 2026-09-24, claude/queue-about-100-strokeglow-calls-are-made-at-an-alpha
- **Files:** `packages/render/src/antiphon-draw.ts`, `packages/render/src/baton-bead-draw.ts`, `packages/render/src/bellows-handle.ts`, `packages/render/src/curtain-sheet.ts`, `packages/render/src/diastole-bridge.ts`, `packages/render/src/diastole-draw.ts`, `packages/render/src/eye-iris.ts`, `packages/render/src/eye-lens.ts`, `packages/render/src/eye.ts`, `packages/render/src/fence-crack.ts`, `packages/render/src/fence-skull.ts`, `packages/render/src/fence-wire.ts`, `packages/render/src/filament-draw.ts`, `packages/render/src/gorge-draw.ts`, `packages/render/src/gorge-lobe.ts`, `packages/render/src/gyre-orbit.ts`, `packages/render/src/gyre-wheel.ts`, `packages/render/src/hive-draw.ts`, `packages/render/src/instar-draw.ts`, `packages/render/src/instar-marks.ts`, `packages/render/src/instar-together.ts`, `packages/render/src/lead-draw.ts`, `packages/render/src/ledger-cord.ts`, `packages/render/src/ledger-draw.ts`, `packages/render/src/magnet-lanes.ts`, `packages/render/src/maze-heart.ts`, `packages/render/src/maze-string.ts`, `packages/render/src/orrery-draw.ts`, `packages/render/src/orrery-grab.ts`, `packages/render/src/queen-weakpoint.ts`, `packages/render/src/ratchet-parts.ts`, `packages/render/src/reprise-draw.ts`, `packages/render/src/sinew-band.ts`, `packages/render/src/spool-brake.ts`, `packages/render/src/spool-draw.ts`, `packages/render/src/spool-gauge.ts`, `packages/render/src/spool-line.ts`, `packages/render/src/stare-draw.ts`, `packages/render/src/strand-bead.ts`, `packages/render/src/strand.ts`, `packages/render/src/surge-fx.ts`, `packages/render/src/surge-gauge.ts`, `packages/render/src/taster-blade.ts`, `packages/render/src/taster-crest.ts`, `packages/render/src/taster-read.ts`, `packages/render/src/undertow-draw.ts`, `packages/render/src/undertow-seam.ts`, `packages/render/src/vane-bearing.ts`, `packages/render/src/volley-ward.ts`, `packages/render/src/warden-cilia.ts`, `packages/render/src/warden-fx.ts`, `packages/render/src/warden-veins.ts`

`strokeGlow` sets `globalAlpha` for every pass and never reads the one it
was handed, so a caller's `ctx.globalAlpha = …` just before it does nothing
to the line. 70 calls in 52 files, by caller and line: `antiphon-draw.ts:208`, `baton-bead-draw.ts:131`, `bellows-handle.ts:64`, `curtain-sheet.ts:133`, `diastole-bridge.ts:87`, `diastole-draw.ts:229`, `eye-iris.ts:122,136`, `eye-lens.ts:156`, `eye.ts:146`, `fence-crack.ts:96`, `fence-skull.ts:152`, `fence-wire.ts:184`, `filament-draw.ts:105,151,171,200`, `gorge-draw.ts:157`, `gorge-lobe.ts:100`, `gyre-orbit.ts:79,146`, `gyre-wheel.ts:121,152`, `hive-draw.ts:214,232`, `instar-draw.ts:92`, `instar-marks.ts:181`, `instar-together.ts:111,129`, `lead-draw.ts:131,165`, `ledger-cord.ts:111`, `ledger-draw.ts:95`, `magnet-lanes.ts:47`, `maze-heart.ts:141`, `maze-string.ts:150`, `orrery-draw.ts:97,101,207`, `orrery-grab.ts:218`, `queen-weakpoint.ts:198,210`, `ratchet-parts.ts:67`, `reprise-draw.ts:156,211`, `sinew-band.ts:144`, `spool-brake.ts:41`, `spool-draw.ts:95,112,154,192`, `spool-gauge.ts:64`, `spool-line.ts:49`, `stare-draw.ts:89`, `strand-bead.ts:141`, `strand.ts:152`, `surge-fx.ts:160`, `surge-gauge.ts:105,136`, `taster-blade.ts:155`, `taster-crest.ts:115`, `taster-read.ts:119`, `undertow-draw.ts:104,135`, `undertow-seam.ts:93`, `vane-bearing.ts:157`, `volley-ward.ts:69`, `warden-cilia.ts:83`, `warden-fx.ts:91`, `warden-veins.ts:85`.

Most are probably an alpha left over from a fill inside the same `save` — a
body's fade, a haze — so the glow's line is drawn at full presence over
something drawn at half. For each, say whether the fade was meant; if it
was, pass it as `alpha`, dividing `intensity` by it where the call passed
both so the glow stays put (`ship-marks.ts`'s arrows are the pattern).
`hull.ts`'s `rimAlpha` looked like one and was an intensity all along, so
read the doc before the name. Each changes a picture that ships: it lands
under "a fix to something wrong", with one before/after PNG. More than a
sitting's worth is split by file before it is started.

Reproducing the list, from 24 September 2026: a `globalThis` tally in
`strokeGlow` of the calls arriving with `globalAlpha` below 1, keyed on the
caller's stack frame, written out by an `afterAll` in a `--preload` file
over `bun test packages/render/test` — about a minute, in one process.

## `strokeGlow` is handed an alpha it throws away: the ship and the screens

- **Found:** 2026-09-24, claude/queue-about-100-strokeglow-calls-are-made-at-an-alpha
- **Files:** `packages/render/src/breach-hammer.ts`, `packages/render/src/breach-rend.ts`, `packages/render/src/cannon-maw.ts`, `packages/render/src/fault-emitter.ts`, `packages/render/src/grip-rings.ts`, `packages/render/src/handle-draw.ts`, `packages/render/src/harpoon-line.ts`, `packages/render/src/hull-shock.ts`, `packages/render/src/intro-ear.ts`, `packages/render/src/lost-shut.ts`, `packages/render/src/maw.ts`, `packages/render/src/shield.ts`

`strokeGlow` sets `globalAlpha` for every pass and never reads the one it
was handed, so a caller's `ctx.globalAlpha = …` just before it does nothing
to the line. 12 calls in 12 files, by caller and line: `breach-hammer.ts:69`, `breach-rend.ts:76`, `cannon-maw.ts:129`, `fault-emitter.ts:107`, `grip-rings.ts:31`, `handle-draw.ts:189`, `harpoon-line.ts:141`, `hull-shock.ts:94`, `intro-ear.ts:146`, `lost-shut.ts:108`, `maw.ts:103`, `shield.ts:232`.

Most are probably an alpha left over from a fill inside the same `save` — a
body's fade, a haze — so the glow's line is drawn at full presence over
something drawn at half. For each, say whether the fade was meant; if it
was, pass it as `alpha`, dividing `intensity` by it where the call passed
both so the glow stays put (`ship-marks.ts`'s arrows are the pattern).
`hull.ts`'s `rimAlpha` looked like one and was an intensity all along, so
read the doc before the name. Each changes a picture that ships: it lands
under "a fix to something wrong", with one before/after PNG. More than a
sitting's worth is split by file before it is started.

Reproducing the list, from 24 September 2026: a `globalThis` tally in
`strokeGlow` of the calls arriving with `globalAlpha` below 1, keyed on the
caller's stack frame, written out by an `afterAll` in a `--preload` file
over `bun test packages/render/test` — about a minute, in one process.
