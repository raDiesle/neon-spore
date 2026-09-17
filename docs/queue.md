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
worktree, does the item, removes the entry with `bun run queue done <n|title>`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

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

`- **Where:** cloud` or `- **Where:** local` reserves an entry for one kind of
session, and it is the owner's line rather than the finder's. He asked for it
on 13 September 2026, the day a local session re-watched four waves a cloud
session had built: some work can only be done on a machine with a screen and a
real frame budget — a wave watched at tempo, a `bun run perf` — and some he
wants handed to a cloud session on purpose, from his phone, so the session on
his own machine stays free. The listing marks such an entry `CLOUD ONLY` or
`LOCAL ONLY`, `bun run queue next` passes over one kept for the other kind,
and `next <n>` or `take <n>` naming it is refused with the reason. A session
knows which kind it is by `CLAUDE_CODE_REMOTE`, the signal the web image sets
(`tools/queue/where.ts`). Without the line an entry is anybody's, which is
still what nearly every entry is.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim;
`tools/queue/test/where.test.ts` holds the reservation.

## Unverified at ce8a2324: THE SCOUT's arenas were never watched at tempo — the fl…

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `apps/game/src/rounds.ts`, `apps/game/src/scout.ts`, `docs/INDEX.md`, `docs/spec/briefings.md`, `docs/spec/interludes.md`, `docs/time-log.md`, `packages/content/src/control-aim.ts`, `packages/content/src/control-command.ts`

*THE SCOUT: the ship puts a little one out, and only one of you can see where it is going* landed from a session that could not look at it. The commit touched 49 more files. What went unchecked:

- THE SCOUT's arenas were never watched at tempo — the flight's feel, its beat counts and the hazard timings are arithmetic and tests only

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 805b6376: THE STARE's rhythm was never watched at tempo: whether…

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `docs/INDEX.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/audio/src/bind.ts`, `packages/audio/src/sounds/boss.ts`, `packages/audio/test/bind.test.ts`

*THE STARE: something is watching, and the one it watches has to sit on their hands* landed from a session that could not look at it. The commit touched 42 more files. What went unchecked:

- THE STARE's rhythm was never watched at tempo: whether four beats of warning is long enough to say it is you, and whether the looks grow into something survivable, are figures an eye and a pair have to judge

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `bun run format` cannot fix what `bun run lint` reports about import order

- **Found:** 2026-09-17, claude/boss-taster
- **Files:** `package.json`, `tools/imports/run.ts`

`lint` is `biome check --error-on-warnings .`, with the assist enabled by
default, so a mis-ordered import block is reported as
`assist/source/organizeImports  FIXABLE`. `format` is
`biome check --write --assist-enabled=false .`, which turns that assist off —
so the one command a lane is told to run **cannot fix the one thing lint is
failing on**. `bun run imports` does not either: it finds imports nothing uses,
which is a different rule.

Six files hit it in one lane (a boss adds a name to six barrels), and the way
past it was `bunx biome check --write --assist-enabled=true <paths>` — a
command nobody has written down, found by reading the two scripts. Every lane
that adds an import to an existing block will find the same wall.

The options the answer picks between: turn the assist **on** in `format`, so
the pair of commands agree and a lane's imports are sorted by the same tool
that formats them; or turn it **off** in `lint`, so import order stops being a
red check at all and `bun run imports` stays the only thing that has an opinion
about an import; or leave both and add a third script, beside `imports`, with
the incantation in it. The first is one word in `package.json` and is the
obvious answer — but `--assist-enabled=false` was put there on purpose by
somebody and the reason is written down nowhere, so finding out what it was
guarding against is the first half of this item.
- **Asks:** Should `format` sort imports, should `lint` stop asking, or should the incantation get a script of its own?

## `baseline:blank` leaves the rows behind an inserted wave a number stale

- **Found:** 2026-09-17, claude/boss-implementation-e3cfff
- **Taken:** 2026-09-17, claude/queue-baseline-blank-leaves-the-rows-behind-an-inserte
- **Files:** `tools/perf/blank.ts`, `tools/perf/unmeasured.ts`, `tools/perf/test/baseline.test.ts`

`fillUnmeasured` renumbers every row to today's wave list (`renumber.ts`),
but `blank.ts` writes the file only when a row was *added* or *blanked* — so
a baseline that already has a row for the new wave, at whatever number it was
written under, and rows behind it that have all moved up one, is answered with
"the baseline already describes the waves the game ships — nothing to mark"
and left as it is. `baseline.test.ts` then fails on THE BEATBOX's number. It
happened on this lane's rebase: THE LEDGER had landed at wave 77 under a
branch that had written THE SURGE's row at 77, the conflict was resolved to
both rows, and the tool had nothing to say about the twelve rows after them.
The work-around was `git checkout main -- tools/perf/baseline.json` and
running it again, which added the row and renumbered in the same write.

What to do: have `blank.ts` compare the renumbered run against the file it
read and write when *anything* differs, saying which rows moved; and give
`unmeasured.test.ts` a fixture with a row already present at a stale number
and rows behind it, expecting the renumbering to be reported rather than
swallowed.

## A breach never widens to a second lobe with the shipped numbers

- **Found:** 2026-09-17, claude/queue-four-drawn-bosses-still-owe-their-rehearsal-film
- **Files:** `packages/sim/src/config-undertow.ts`, `packages/sim/src/undertow-step.ts`, `packages/sim/test/undertow.test.ts`, `docs/spec/bosses.md`
- **Asks:** Should a lobe stand longer, widen faster, or need less width — or is the second lobe a rule the design gives up?

`widen` adds `undertowWidenMilli` (100) on each beat a lobe stands short of
`undertowStandBeats` (4), and `withdraw` fires on the fourth: a breach nobody
plates reaches 300 and withdraws, and `undertowWideMilli` is 400. So the
second lobe next door — the guide's *a wide enough breach lets a second lobe
through*, and the reason the plate exists in part one — cannot happen in the
game. `undertow.test.ts` only reaches `undertowWidened` by setting
`undertowStandBeats: 40`, which is how it went unnoticed (§11.20 of `bosses.md`
says the rule as if it held); THE UNDERTOW's film
found it by leaving a lobe alone and watching it scar at 300.

What to do, once the answer is picked: change the one number (`undertowStandBeats`
5 reaches 400 on the fourth beat and withdraws on the fifth; `undertowWidenMilli`
150 reaches it on the third; `undertowWideMilli` 300 on the third), run the
widening test on the shipped config rather than a stretched one, and say in
§11.20 which it was. The film's first page then shows a second lobe rather
than a scar, and its test's first event moves.

## `apps/game/src/shell.ts` is two lines under the ceiling

- **Found:** 2026-09-17, claude/creature-bite-collision-f96307
- **Files:** `apps/game/src/shell.ts`, `apps/game/src/menu-bindings.ts`, `apps/game/test/menu.test.ts`

248 of the 250 lines `packages/sim/test/limits.test.ts` allows. The lane that
put the ☰ on the `?play` road had to trim a docstring it had just written to
get under it — the next sentence anybody adds to this file fails the check, and
the file is the one every screen around the field is wired in, so it is a file
that gets edited.

The cut is already drawn: the `bindMainMenu({ … })` argument is ~45 lines of
wiring — the room hooks, the four settings hooks, the demo list — with nothing
in it that reads the shell's own closure except `joinScreen`, `link`,
`installer` and `leaveRoom`. Lift it to `menuWiring(p, deps)` returning a
`MenuBindings` (the type already exists, in `menu-bindings.ts`), beside the
shell rather than inside it, and `bindShell` keeps the order that is the whole
reason the file is one knot. What must not move: the link is built first, the
three screens exist before it reports, and the `opensOnMenu` gate stays below
the bind — `apps/game/test/menu.test.ts` pins that last one.
