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

## packages/render/src/index.ts is 235 lines, under the ceiling by fifteen

- **Found:** 2026-10-10, claude/versus-variants-visual-67ca5d
- **Files:** `packages/render/src/index.ts`, `packages/sim/test/limits.test.ts`

The render package's barrel grows by a line or two with every export a lane
adds, and `tools/hooks/after-edit-size.ts` flagged it at 235 lines when the
PULL LAB's `PullAfter` type was exported. Choose the seam before a lane is
forced to: the pull handle's exports (`pull-knob.ts`, `pull-track.ts`,
`pull-line.ts`) and the boss-figure exports are the two longest runs, and each
could be re-exported from a small barrel of its own that `index.ts` re-exports
whole. Nothing that imports `@neon-spore/render` should change.

## Fire button lit for the colour shown: THE VANE to THE MANTLE

- **Found:** 2026-10-09, claude/aim-cannon-visual-polish-39fb48
- **Files:** `packages/render/src/boss-cue-read-x.ts`, `packages/render/src/boss-cue-read-y.ts`, `packages/render/src/boss-cue-read-z.ts`, `packages/render/src/boss-cue-read-zb.ts`, `packages/render/src/boss-cue-read-zc.ts`, `packages/render/src/boss-cue-read-zd.ts`

While a shot's mark stands on a target, EMBER rings the fire button it asks for too (`fire-button-mark.ts`, the owner, 9 October 2026): the colour this screen is already shown the shot wants, `BossCue.shows`, or both buttons where it is not. Only THE GORGE (`boss-cue-read-n.ts`) and THE FLUE (by its `tint`) say yet. For THE VANE, THE GIMBAL, THE HASP, THE RATCHET, THE MANTLE and THE KEEL, read whether the shooter's screen draws the colour the bolt wants at the moment of the `FIRE` and set `shows` off the same state where it does; leave it out where the colour is the other seat's to say. `test/fire-button-mark.test.ts` holds the rule.

## Fire button lit for the colour shown: THE OCULUS to THE TRAPEZE

- **Found:** 2026-10-09, claude/aim-cannon-visual-polish-39fb48
- **Files:** `packages/render/src/boss-cue-read-ze.ts`, `packages/render/src/boss-cue-read-zf.ts`, `packages/render/src/boss-cue-read-zl.ts`, `packages/render/src/boss-cue-read-zm.ts`, `packages/render/src/boss-cue-read-zn.ts`, `packages/render/src/boss-cue-read-zp.ts`

The same as THE VANE's entry above, for THE OCULUS, THE VISE, THE CAPSTAN, THE GALL, THE TRAPEZE and THE VALVE: `BossCue.shows` on each `FIRE` whose shooter's screen draws the colour wanted.

## Fire button lit for the colour shown: THE GOVERNOR to THE BASTION

- **Found:** 2026-10-09, claude/aim-cannon-visual-polish-39fb48
- **Files:** `packages/render/src/boss-cue-read-zq.ts`, `packages/render/src/boss-cue-read-zr.ts`, `packages/render/src/boss-cue-read-zs.ts`, `packages/render/src/boss-cue-read-zt.ts`, `packages/render/src/boss-cue-read-zv.ts`

The same as THE VANE's entry above, for THE GOVERNOR, THE SEAM, THE LAMPREY, THE MIMIC and THE BASTION: `BossCue.shows` on each `FIRE` whose shooter's screen draws the colour wanted.

## Two source-sweep tests time out at five seconds on a loaded machine

- **Found:** 2026-10-09, claude/aim-cannon-visual-polish-39fb48
- **Files:** `packages/render/test/controls-catalogue.test.ts`, `packages/render/test/baked-cache-guard.test.ts`

`bun run check:fast` went red twice on a machine at load 55: *has every file three bodies share, or knows why it is not a mark* at 7039 ms and *is a bakedCache, so a test's canvas swap empties it* at 5001 ms, both on bun's five-second default. Each passes alone in under half a second, and the lane re-ran them and went on. Both read every source file under `packages/render/src`; give each a timeout of its own (`setDefaultTimeout`, as the drawing tests carry `FRAME_TIMEOUT_MS`), or make the sweep cheaper.

## A refused frames run leaves the last PNG in --out, read as new

- **Found:** 2026-10-09, claude/aim-cannon-visual-polish-39fb48
- **Files:** `tools/frames/until-flags.ts`, `tools/frames/run.ts`, `tools/frames/frame-files.ts`

`bun run frames … --until hiveOpen --ticks 40` and `--until-back -40` are refused with a clear sentence and exit 1, but the `frame.png` an earlier run wrote to the same `--out` stays where it was. A lane that pipes the output away reads the old picture as the new one — this one did, twice, while placing THE HIVE's spores. Delete `--out`'s `frame.png` before the flags are checked, or write nothing there until the run succeeds and refuse loudly on a stale file; a test in `tools/frames/test/` that a refused run leaves no PNG behind.

## --auto both never swells a second hive site to frame an underside breach

- **Found:** 2026-10-09, claude/aim-cannon-visual-polish-39fb48
- **Files:** `tools/frames/auto.ts`, `packages/sim/src/hive*.ts`

`bun run frames . --wave "THE HIVE" --auto both --until hiveSeal --until-on 4000` fires `hiveSwell`, `hiveOpen` and `hiveSeal` once each, on the wall site at col 10, and then nothing for four thousand ticks: the bots never do what makes the next site swell, so no frame shows a breach on the underside. Find what the next swell waits on and teach `--auto` to do it, with a test that a THE HIVE run fires a second `hiveOpen`.

## versus adopt loses all but the last record written to one file

- **Found:** 2026-10-09, claude/scuttle-seat-lobed-ship-d50809
- **Files:** `tools/versus/decide.ts`, `tools/versus/test/`

`bun run versus adopt scuttle:seat lobed` patched `SCUTTLE_ROWS` and `SCUTTLE_FRAME`, both in `packages/render/src/scuttle-shape.ts`, and printed both edits — but only `SCUTTLE_FRAME` reached the file. `decide.ts` builds its plan by reading each patch's file from disk (`rewriteRecord(readFileSync(file, …))`, about line 96) and writes every plan entry whole, so the second record's text overwrites the first's. The lane wrote `SCUTTLE_ROWS` by hand. Fold patches on the same file into one entry, each rewrite applied to the text the previous one produced, with a test of a candidate patching two records in one file.

## Seven ON THE FIELD cards keep half the phone: no press reaches the control

- **Found:** 2026-10-09, claude/controls-documentation-redesign-0e3a85
- **Files:** `tools/director/src/field-focus.ts`, `tools/director/test/field-focus.test.ts`, `tools/director/src/poses-field-controls.ts`

CONTROLS › ON THE FIELD cuts each use card to the box its control answers a press in, by sweeping the posed world through `deskDown` (`controlRect`). Seven rows find nothing — SNAKE'S JAWS, PINBALL'S PLUNGER, THE FLEET'S WRECK, THE GAUGE'S BAND, THE LEAD'S STALK, THE BATON'S STRIP, THE QUEEN'S MARKS — so their cards keep the pose's own crop. On each pose's tick the sweep meets other holds (THE GAUGE a `held` valve, THE FLEET only `fleetRake`, the rest the cannon, shield and prime), never the row's `DragTarget`. For each: find whether the pose catches the moment after the control (move the pose a tick where it is pressable, or add a second pose for the card) or whether the hit test answers it through a path `holdsRow` does not read; take it off `UNFOUND` in the test, which goes red on a listed row that is found.

## TRY IT records a take into stills, for the 22 rows AUTO does not play

- **Found:** 2026-10-09, claude/controls-documentation-redesign-0e3a85
- **Files:** `tools/director/src/field-try.ts`, `tools/director/src/field-stills-art.ts`, `tools/director/test/field-stills.test.ts`

A card's ▤ STILLS on CONTROLS › ON THE FIELD are six moments — a beat before the press, the press, halfway, the lift, one and three beats after — found by playing the pose with AUTO's hand (`stillTicks`). AUTO plays no creature and reaches only what its boss needs, so 22 rows (`NOT_PLAYED` in the test: THE GUM, PINBALL, THE BALLOON, THE LEDGER, THE CHOIR …) say "play it with ▶ TRY IT" and drop out of ▤ COMPARE ALL USES. Let TRY IT keep the frames of a human take — the window's cut, small, in a ring of the last few seconds — and on the lift plus three beats assemble the same six stills from the mouse's own press and lift, kept for the page's session, so the comparison can show them beside AUTO's.

## The Bulb Queen: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/queen.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.0, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE MIRROR: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/mirror.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.3, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## The Warden: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/warden.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.4, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE VANE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/vane-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.5, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE FLEET: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/fleet-hulls.ts`, `packages/render/src/fleet-hull-body.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.6, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## PINBALL: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/pinball-table.ts`, `packages/render/src/pinball-mouth.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.7, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE PULSE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/pulse-body.ts`, `packages/render/src/pulse-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.8, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE MAZE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/maze-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.10, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE CAIRN: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/cairn.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.11, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE WELL: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/well-body.ts`, `packages/render/src/well-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.12, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE SPLICE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/splice-draw.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.13, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE HIVE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
- **Files:** `packages/render/src/hive-draw.ts`, `packages/render/src/hive-shape.ts`, `docs/spec/bosses.md`

The owner, 9 and 10 October 2026, after THE INSTAR's head glances: *body parts of living things turn, especially the head, but also feet and hands, or if mechanical the full boss shape*, and one entry per boss. Read §11.14, pick the part — a head, claws, a turret, or the whole shape of a machine — and follow `.claude/skills/depth`, "A part that glances": a record for its turn that ships still, the far side darkening as it swings, the points a thumb is on held (or the hit test reading the same turn), big enough to see in a still. Offer SWAY, LOOK and COCK on VERSUS as THE INSTAR's were, each cycle six seconds; the owner decides there.

## THE REPRISE: a part that turns, so it is seen from a new side

- **Found:** 2026-10-10, claude/turn-queue-and-perspective-ideas
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

## THE FLEET's wreck says PULL twice on the navigator's screen

- **Found:** 2026-10-10, claude/fleets-wreck-drag-drop-133829
- **Files:** `packages/render/src/fleet-grip-draw.ts`, `packages/render/src/pull-knob.ts`, `packages/render/test/fleet-grip.test.ts`

Drawn from player 2's screen (the STATES card `THE FLEET · WRECK`, now `role: "p2"`), the word under the wreck's pull knob is two copies of PULL a few pixels apart, one over the other. `drawFleetGrip` calls `drawHandleHint` once and `drawHandleHint` fills the text once, so the second copy comes from somewhere else that draws under the same knob — find it, keep one, and add a frame test that counts one `fillText("PULL")` for the navigator in the wreck.

## AUTO's PINBALL shot hops on the cannon for a whole flight

- **Found:** 2026-10-10, claude/pinball-table-touch-area-7a3f1f
- **Files:** `packages/hands/src/boss-hands-rounds.ts`, `packages/sim/src/pinball-physics.ts`, `packages/sim/src/pinball-funnel.ts`, `packages/sim/src/pinball-round.ts`

`pinballHand` latches the needle on its first tick and launches on the next, so every AUTO shot leaves at `angleMilli` 0 and `powerMilli` 4: straight up from x 5500, it climbs to y ≈ 7.8 tiles (no peg is lower than 3), falls, and is thrown back up from y ≈ 13.7 with `vxMilli` 0 and no height lost, over and over. It never crosses the floor at 14000, so each flight runs about 60 beats (~38 s at 96 bpm) until `pinballFlightBeats` times it out. A played PINBALL is three of those and a verdict: the table offers the shove the whole time and nothing on the board is ever touched (`bun run probe` on `waveWorld("pinball")` with `playedBeat`). Two things to settle: what at y ≈ 13.7 returns a vertical ball with no loss, when the bounce should take `bouncePermille` off and the cannon should catch a ball that falls back onto it; and give the hand an aim and a power that reach the board, with a test that an AUTO PINBALL flight ends under the flight clock and lights at least one piece.

## The director's dev route 404s director.css after a sheet is added under it

- **Found:** 2026-10-10, claude/docs-section-navigation-8a2e5c
- **Files:** `tools/director/server.ts`, `tools/director/src/director.css`

With `director-here` running, adding `@import "./director-contents.css";` to `director.css` answered the next page load with a 500, and every reload after it asked for `/tools/director/src/director.css` and got a 404 — the bundled stylesheet under _bun/asset still loaded, so the page looked right and the error was only in the console. Stopping and starting the server cleared it; the lane did that and went on. Find whether the HTML route's asset graph is rebuilt when a CSS `@import` list grows, and either make it rebuild or have the route say "restart me" instead of 404ing, with a test if the route is reachable from one.

## The director's shell and columns sheets are past 250 lines

- **Found:** 2026-10-10, claude/director-text-readability-7bbd5d
- **Files:** `tools/director/src/director-shell.css`, `tools/director/src/director-columns.css`, `tools/director/src/director.css`

`director-shell.css` is 270 lines and `director-columns.css` 299; both were already over before the readability pass added the type scale's tokens. Cut each on a seam its comments already name — the shell's palette and type tokens from its four shared controls, the columns' grid and drag handle from the wave rail — add the new sheet to `director.css`'s `@import` list beside its parent (never after `director-phone.css`; `test/stylesheet-order.test.ts`), and check that `test/columns.test.ts` still finds `main`'s `grid-template-columns`.

## One generic PULL in the simulation, and the straight-down pulls onto it

- **Found:** 2026-10-10, claude/pull-control-visuals-35c04f
- **Files:** `packages/sim/src/handle-pull.ts`, `packages/sim/src/hive-hand.ts`, `packages/sim/src/vane-hand.ts`, `packages/sim/src/fleet-hand.ts`, `packages/sim/src/ledger-hand.ts`, `tools/director/src/pull-lab-rule.ts`, `tools/director/src/field-actions-drag.ts`
- **Asks:** When a pull is let go short of its distance, is it refused (the knob springs back red, a fault the pair hears) or ignored (it springs back quietly and nothing is said)? Today both happen. Both can be felt in the PULL LAB: CONTROLS › ON THE FIELD › PULL PAST A DISTANCE › TRY THE GENERIC PULL, and the SHORT · RED / SHORT · IGNORED switch on its bar.

The owner took PULL PAST A DISTANCE's SUGGESTED line on 10 October 2026: one generic PULL with the direction a named field (down · up · either · signed) and one drawn arrow. Twenty-six rows each keep their own rule today, in a hand file per boss. Write the rule once in the simulation, beside `handle-pull.ts` — a direction field, a reach in thousandths, counted once the moment the reach is met, and the answer to a short lift above — taking the PULL LAB's toy rule (`pull-lab-rule.ts`) as its specification, then move the four straight-down pulls onto it: THE HIVE's haul, THE VANE's housing, THE FLEET's wreck and THE LEDGER's pull, each a replay test unchanged or a sentence on why its behaviour moved. Two entries below move the rest, one lane each.

## One generic PULL: the up, either-way and sideways pulls onto it

- **Found:** 2026-10-10, claude/pull-control-visuals-35c04f
- **Files:** `packages/sim/src/curtain-hand.ts`, `packages/sim/src/stare-hand.ts`, `packages/sim/src/scout-hand.ts`, `packages/sim/src/trapeze-hand.ts`, `packages/sim/src/taster-hand.ts`, `packages/sim/src/blister-swipe.ts`

After the entry above lands: THE CURTAIN's hem and THE STARE's lashes (up), THE SCOUT's prime (either), THE TRAPEZE's zones, THE TASTER's wipe and THE BLISTER's swipe (signed) onto the one rule, their direction a value of its field rather than code. Replay tests unchanged, or a sentence each on why not.

## One generic PULL: the curved and rope pulls onto it

- **Found:** 2026-10-10, claude/pull-control-visuals-35c04f
- **Files:** `packages/sim/src/lamprey-hand.ts`, `packages/sim/src/antiphon-rail.ts`, `packages/sim/src/warden-rope.ts`, `packages/sim/src/bastion-hand.ts`, `packages/sim/src/gauge-tooth.ts`, `packages/sim/src/pinball-hand.ts`

After the first entry lands: THE LAMPREY's head (a curve), THE ANTIPHON's rail (down a vein), THE WARDEN's tether and THE BASTION's slabs (a rope, any way), THE GAUGE's tooth and PINBALL's plunger onto the one rule. A curve is a path the rule measures along, as the PULL LAB's CURVE and S-CURVE do. THE GUM and SNAKE's jaws are pulls by a body rather than a knob — say in the entry's commit whether they join or why not.

## THE PULL LAB's bar out of `pull-lab.ts`

- **Found:** 2026-10-10, claude/trace-line-visual-alignment-cab018
- **Files:** `tools/director/src/pull-lab.ts`

`pull-lab.ts` is 238 lines after the OFF PATH switch, and every switch on the lab's bar grows it by a dozen. Cut on the seam the file already has: the bar — the shape, look, short, off-path and speed choices, AUTO and the sheet button — built in a file of its own, pull-lab-bar.ts, from one state object (`{ shape, look, short, stray, speed, auto }`) and a `reset` callback, so `openPullLab` keeps the canvas, the pointer, the clock and the frame. `test/pull-lab.test.ts` and the lab opened by hand from CONTROLS › ON THE FIELD › PULL PAST A DISTANCE say nothing moved.
