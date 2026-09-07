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

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on.
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

The two things a claim cannot always do are said out loud rather than guessed
at: if no worktree has `main` checked out, or the trunk's copy of this file has
uncommitted changes in it, the branch is still made and a `⚑` line says the
entry went unmarked.

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
say `ASKS THE OWNER`. Write the question so it can be answered in a sentence,
and let the body carry the options it picks between:

```
## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.

## "A carries both seats" is written twice, in two rigs

- **Found:** 2026-09-07, claude/queued-items-rer0av
- **Files:** `apps/game/src/keys-slide.ts`, `tools/director/src/keys.ts`

Both desk keyboards now read the same table for *what a key means* — `deskKey`
and `controlPress` — and both then apply the same convenience on top of it by
hand: player 1's sideways pair steps player 1's strip and carries player 2's
along with it, and J/L move player 2's alone. `stepStrip` and `stepAll` in
`keys-slide.ts` and the pair of the same names in the director's `keys.ts` are
the same eight lines, and the rule they carry — *which seats one key moves* —
is exactly the kind that drifts: the director had a version of it that had gone
stale for months before this pair was made to agree.

The reason there are two is where the first one lives. `bindSliding` is under
`apps/game`, which is an application a tool may not import, and it also carries
a repeat timer counted in sim ticks that the director has no use for. So the
seam is between the two halves rather than around them: the *which seats*
answer is content — it is about panels and slots, like everything else in
`keys-desk.ts` — and the *how long the key is held* answer is each rig's own.

Move the first half into `packages/content/src/keys-desk.ts` as one function
taking a `DeskKey` and answering the keys the press moves, both seats included,
and have `keys-slide.ts` and the director call it for the list and keep their
own stepping. `content/test/keys-desk.test.ts` is where it is proved; the
alternative — moving `bindSliding` whole — puts a repeat timer in a package
whose job is data, and is worse.

## `CLAUDE.md` is within about a hundred characters of its ceiling

- **Found:** 2026-09-07, claude/queued-items-rer0av
- **Files:** `CLAUDE.md`, `tools/test/claude-md.test.ts`, `docs/`

`tools/test/claude-md.test.ts` caps the file at 22,000 characters and it stands
at roughly 21,880. That is under a line of the Commands block, so the next lane
that adds a rule, a command or a sentence goes red on a check that has nothing
to do with what it changed — and the message says to move reasoning into
`docs/`, which is a job nobody has budgeted for in the middle of something else.
This lane hit it: `bun run port` could be named in the prose only by tightening
the sentence around it, and the Commands block still does not list it.

The fix is the one the ceiling exists to force, done deliberately rather than
under a red check. `## Verifying in a browser`, `## Measuring what a frame
costs` and `## Delegating implementation` are each a rule and then its argument,
and each already names the document holding the argument
(`docs/working-with-claude.md`, `docs/performance.md`,
`docs/delegation-cost.md`) — so the paragraphs after the first sentence of each
have somewhere to go that a session reaches in one hop. Two of the three would
buy back a thousand characters. Add `bun run port` and `bun run probe` to the
Commands block in the same commit: both are lines this lane could not afford,
and both are commands a session looks for exactly where it cannot find them.

## `bun run frames` cannot photograph THE MAZE's own answer

- **Found:** 2026-09-07, claude/maze-director-wave-boss-d85812
- **Files:** `tools/frames/capture.ts`, `tools/frames/run.ts`, `tools/frames/spec.ts`,
  `tools/frames/test/`

Answering THE MAZE is two verbs in order: the pilot pulls the string until a
way in clicks onto a column, and only then may the navigator slide the cannon
there and fire. `--hold mazeString=…` is the only way to turn the wheel and
`--press …:2:fire=…` the only way to shoot, and `capture.ts` runs **every press
first and the hold afterwards** (the hold gets `holdTicks` of its own at the
end, so a hand takes hold of a body that has already arrived). So a shot can
only ever be fired at a wheel that has not turned, and the whole second half of
this boss — a shot in a corridor, a dead end, a colour the heart refuses —
cannot be photographed at all. A lane that changed what a refused shot looks
like had to start `bun run preview`, open the page and drive `window.neonSpore`
by hand in a browser to see its own change.

The fix is to let a hold take a tick like a press does, so the two share one
ordered line: `--hold mazeString=1400@240` alongside `--press 300:2:fire=cyan`,
with the bare form keeping today's meaning (after the wave's ticks, with
`holdTicks` to show in). `pressPlan` already walks a sorted tick line and is
tested on its own; holds would join that list rather than getting a second
one. `tools/frames/test/` holds the ordering, so the proof is a case there
plus a `--press`/`--hold` pair whose recorded order is the one written.

## THE PULSE judges a press ~100 ms late on two devices

- **Found:** 2026-09-07, claude/ddr-boss-concept-57c9c8
- **Files:** `packages/sim/src/config-pulse.ts`, `packages/render/src/pulse-fall.ts`,
  `packages/render/src/pulse-drop.ts`, `packages/render/src/pulse-button.ts`,
  `packages/render/src/renderer.ts`, `apps/game/src/main.ts`, `packages/net/src/delay.ts`

Delayed lockstep schedules every press `delayTicks` into the future — 12 ticks
at the default, a tenth of a second (`packages/net/src/lockstep.ts`). Every
other control in the game shrugs that off: a cannon a tenth of a second late is
a cannon in the right column. THE PULSE cannot, because the whole round is
*when a thumb landed*: the clean window is 8 ticks and the outer one 18, so on
two devices a player pressing exactly on the line is judged 12 ticks late —
past PERFECT every time and past GOOD on a link that measured worse. Solo on
one device the delay is nought and the round is judged correctly, which is why
nothing about this shows up in `bun test` or in the frame test.

The fix is a **render-side lead** and not a simulation change: draw each arrow
reaching the line `delayTicks` *before* its judged tick, so a thumb landing on
the picture produces a command landing on the note. It has to come from the
device's own current delay rather than from `cfg.inputDelayTicks`, because
`InputDelay` moves it as the link is measured and the two devices never agree
on it (`packages/net/src/delay.ts` says so in its header) — which is exactly
why it is safe: it is a fact about one pair of eyes, like `ViewState.hand`.

Add an optional `leadTicks` to `ViewState`, default 0, subtract it inside
`pulseNoteAt`'s caller in `pulse-fall.ts`, and have `main.ts` feed it from the
link's `delay` when there is a link and 0 when there is not. A unit test can
prove the arithmetic: at `leadTicks = 12`, an arrow whose judged tick is T is
drawn on the line at tick T − 12.

There are **three** callers of the chart's clock in render/ now, not one: the
arrows falling (`pulse-fall.ts`), the arrows dropping into the ship
(`pulse-drop.ts`) and the light on the four buttons (`pulse-button.ts`). All
three have to take the same lead or the picture will disagree with itself — an
arrow drawn on the line while the button under it is still dark.

## `bun run index` appends a new row instead of filing it beside its siblings

- **Found:** 2026-09-07, claude/crawler-pulse-stepped-comparison-7b9280
- **Files:** `tools/index/`, `docs/INDEX.md`

Splitting `packages/render/src/crawler.ts` produced `crawler-ring.ts`, and
`bun run index` wrote its row at line 712 — the bottom of the render section,
seventy lines below `crawler.ts` and `crawler-skin.ts`, which are the two files
a reader looking it up would be reading. The row had to be moved by hand, and
the completeness test passed either way, so nothing catches it: every future
session that adds a file pays the same minute, and one that does not notice
leaves the map a little less useful than it was.

The generator already knows a row's path. It should insert a new row next to
the longest shared path prefix among the rows already there — for
`packages/render/src/crawler-ring.ts` that is `crawler.ts` and
`crawler-skin.ts` — rather than appending to the end of its section, and
`tools/index/test/` should hold a case that adds a file with an obvious
neighbour and asserts it lands beside it.

## `bun run check` blames the code when a worktree's install is stale

- **Found:** 2026-09-07, claude/pulse-boss-visual-integration-0678e7
- **Files:** `tools/check/` (wherever `bun run check` is driven from), `package.json`

A worktree installed before a workspace package existed has no `node_modules`
link for it, and the first thing that says so is `bunx tsc --noEmit` reporting
`Cannot find module '@neon-spore/content'` in files nobody touched — eight
errors in `tools/probe/` and `apps/server/`, all of them looking like a real
break in the tree under test. The cure is one `bun install` in the worktree and
the whole list goes away, but a session that does not already know that spends
a turn reading code that was never wrong. CLAUDE.md warns that a fresh worktree
needs its own install; it does not warn that an *existing* one goes stale the
moment `main` gains a package, which is the case that actually bites.

Add a preflight to `bun run check`: read the workspace globs out of the root
`package.json`, and for each package directory that has a `package.json` with
dependencies, fail before the typecheck with one line naming the package and
saying `run bun install in this worktree`. It has to run before `tsc`, because
the whole point is to replace `tsc`'s answer with the true one. Prove it by
renaming one package's `node_modules` aside and checking the message, then
putting it back.

## The relay room test fails under a full `bun test` and passes on its own

- **Found:** 2026-09-07, claude/versus-creature-strand-updates-efa043
- **Files:** `apps/server/test/room.test.ts`

`a room relays and answers > a ping comes back as a pong carrying both server
stamps` failed once inside a full `bun test` run — one failure in 60851 — and
passed immediately when the file was run on its own. The whole run still exited
0, which is worse than the failure: a suite that reports a red test and returns
success is a suite whose exit code nobody can read, so a session that sees the
line has to re-run the file by hand to find out whether it means anything, and
one that does not read the output at all learns nothing.

Two things to settle, and they are separate. First, why the test is timing
dependent: it stands up a Durable Object room, sends a ping and waits for the
pong, and under a loaded machine — 339 files running at once — whatever it
waits on is not long enough. Either the wait is a fixed timeout that should be
a poll until the message arrives, or the socket ordering it assumes is only
usually true. Second, why `bun test` exited 0 with a failure in it; if that is
a wrapper in `package.json` swallowing the status, the wrapper is the bug and
every green check taken through it since is worth less than it looked.

## Four files sit exactly on the 250-line ceiling and pay a tax on every edit

- **Found:** 2026-09-07, claude/cannon-streak-shot-38da84
- **Files:** `packages/render/src/canvas2d.ts`, `packages/render/src/effects.ts`,
  `tools/director/src/pose-kit.ts`, `tools/frames/press.ts`

Each of these is at 250 lines to the line, so *any* change to one costs a round
of reflowing a comment somewhere else in it before `limits.test.ts` goes green
again. That happened four times in one lane: adding a field to `Effects` cost a
comment in `canvas2d.ts`, a one-line doc on `pose-kit.ts`'s `prime` had to be
folded into the group comment above it, and `press.ts` lost a sentence to make
room for one word. `render-state.ts` already exists because `effects.ts` had
nothing left to give (its own header says so), which is the shape of the answer
rather than a reason to keep shaving.

Split each on a seam it already has a heading at, the way `scene-script.ts` was
cut into `scene-drag.ts` in this lane: `effects.ts` divides into what it *owns*
and what it *draws*; `canvas2d.ts` into `resize`/layout and the frame itself;
`pose-kit.ts` into the world builders and the command shorthands; `press.ts`
into the parser and the per-control table. `bun run check` proves it — nothing
in any of them is behaviour.

## `bun run perf` never exercises a held control, so a new one is unmeasured

- **Found:** 2026-09-07, claude/cannon-streak-shot-38da84
- **Files:** `tools/perf/measure.ts`, `tools/perf/waves.ts`,
  `packages/render/src/lance-beam.ts`, `packages/render/src/lance.ts`

The sweep plays each wave's arrivals with **no commands at all**, so anything a
player has to press for is drawn zero times in it. THE LANCE gained three new
draw paths on 7 September 2026 — a beam growing up the column while a colour is
held, a ribbon with three nodules for the shot itself, and a full-stage wash
when it leaves — and the wave's row in `baseline.json` measures none of them.
The same hole covers the shield's dome, the maw, THE CLAW's arm and every
round's own panel.

`tools/frames` already knows how to hold a control through a run (`--hold`,
`--press`), so the shape of the answer exists. Give a wave in `waves.ts` an
optional list of `TimedCommand`s the measurement sends before its busiest tick,
send them the way `capture.ts` does, and give THE LANCE a held colour so its row
means something. The rows for waves with no commands are untouched, so the rest
of the baseline stays comparable.

## A handle's own word assumes every handle is the pilot's

- **Found:** 2026-09-07, claude/balloon-enemy-unit-tkbivj
- **Files:** `packages/render/src/handle-draw.ts`,
  `packages/render/src/balloon-handles.ts`, `packages/render/src/lid-string.ts`,
  `packages/render/src/tether.ts`, `packages/render/src/maze-string.ts`

`drawHandleHint` writes `"PULL"` on the pilot's screen and `"PILOT'S"` on the
navigator's, with the seat baked in as `role !== "p2"`. That was true of every
handle in the game until THE BALLOON, which has one per seat — so
`balloon-handles.ts` carries a `hint` of its own, four lines that say the same
thing with the seat passed in and the direction named. Two copies of one word
under two kinds of handle is exactly the drift `handle-draw.ts`' own header
was written to stop.

Give `drawHandleHint` the seat and the words as arguments — `{ seat, mine,
theirs }` — and delete the balloon's copy. The three existing callers pass
`{ seat: 1, mine: "PULL", theirs: "PILOT'S" }` and draw byte for byte what they
draw today, which is what `bun run check` proves: nothing in `frame.test.ts` or
`touch.test.ts` should move.

## `mechanics-table.ts` is at its ceiling and pays for the next creature in prose

- **Found:** 2026-09-07, claude/balloon-enemy-unit-tkbivj
- **Files:** `packages/content/src/mechanics-table.ts`,
  `packages/content/src/mechanics-handed.ts`,
  `packages/content/src/mechanics-split.ts`

The file stood at 248 of its 250 lines when THE BALLOON arrived. Its row went
next door into `mechanics-handed.ts`, which still costs an import and a spread
— three lines for two — so the lane had to buy them back by rewording a comment
belonging to `WAVE_MECHANICS`. That is the cost `docs/token-budget.md` names:
prose nobody meant to touch, edited to make room, and the next creature pays it
again with nothing left to trim.

Cut it properly. `SPLIT_MECHANICS` is the precedent and the seam is already
drawn in the table's own comments: the rocks, the run switches, the wave
switches and the split five are out; what is left is one long undifferentiated
run. Move the four bosses' rows, or the six worn bodies', into a file of their
own and name them in place the way the existing groups are — key order is read
by `MECHANIC_IDS` and walked by the bestiary, so nothing may be reordered.
