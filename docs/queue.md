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

## Unverified at ef8cb3b6: the reconnect the two new tests model, against a real D…

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `docs/queue.md`, `docs/time-log.md`, `packages/net/test/clock.test.ts`, `packages/net/test/desync.test.ts`, `packages/net/test/lockstep.test.ts`, `packages/net/test/protocol.test.ts`, `packages/net/test/scheduler-faults.test.ts`

*`packages/net` says which failure modes the scheduler survives* landed from a session that could not look at it. What went unchecked:

- the reconnect the two new tests model, against a real Durable Object: bun run relay:check ws://127.0.0.1:8800 14 --rejoin

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Nothing has swept for a re-derived rule since the copies table reached 46 rows

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/sim/test/copies-table.ts`, `packages/sim/test/copies.test.ts`

Every row in `copies-table.ts` exists because review caught a rule written out
by hand somewhere that should have called it, and the check then stops the *next*
file copying it. Forty-six rows, each one a defect that got through once. The
table only ever grows by somebody noticing, and nothing has gone looking on
purpose — so the rows are the copies that happened to be seen, not the ones that
are there.

The sweep: take the rules `packages/sim` owns that `render/` and `content/` have
to consume — the projections, the clocks, the column maps, the windows counted in
ticks — and for each one read its callers rather than its definition. A caller
that spells the arithmetic out is a row. The value is in the finding, so the
deliverable is either new rows or one dated line in `copies-table.ts`' header
saying the sweep was done and found none; `bun run check` proves whichever it is.

**One method that does not work, tried on 12 September 2026 so nobody tries it
twice:** matching numeric literals in `packages/render/src` against
`DEFAULT_CONFIG`'s values. Thirty-six distinctive figures produced 88 hits, and
essentially all of them are coincidence — 250 as a pixel size, 120 as a degree,
150 as a colour channel. A number agreeing with a config default is not evidence
of a copy, and the noise buries the one or two that might be.

## Fifty-six render call sites still build a `Path2D` from spline text

- **Found:** 2026-09-12, render-test-time
- **Taken:** 2026-09-12, claude/queue-fifty-six-render-call-sites-still-build-a-path2d
- **Files:** `packages/render/src/spline.ts`, `packages/render/src/balloon.ts`, `packages/render/src/fault-emitter.ts`, `packages/render/src/warden.ts`, `docs/performance.md`

The callers of `openSmoothPath`, `blobPath` and `catmullRomToBezierPath`
under `packages/render/src/`; three are named above, `grep` finds the rest.
`docs/performance.md`, "Two fifths of a drawn frame was text": the band, the
maw, the pods and the rock's flame now write their contours into a `Path2D`
as numbers through `spline.ts`, and one drawn frame went from 1.14 ms to
0.63 ms. `grep -l "openSmoothPath\|blobPath\|catmullRomToBezierPath"
packages/render/src/*.ts` still lists forty-eight files, fifty-six calls —
creature bodies, bosses, the balloon, `crystalPath`, bakes that run
once. None was in the top of the profile, which is why they were left.

The sweep: each `new Path2D(openSmoothPath(pts))` becomes `splinePath(pts,
false)`, each `new Path2D(catmullRomToBezierPath(pts))` becomes `splinePath(pts,
true)`, each `new Path2D(blobPath(...))` becomes `splinePath(blobPoints(...),
true)`, and a string that is concatenated before it becomes a path becomes
`splineInto` calls on one `Path2D`. A contour sealed with `" Z"` after an
*open* spline is `splineSealedInto`, never a closed spline — the tangents
differ. A call whose string goes somewhere other than a `Path2D` (a sheet, a
`<path>`, a cache key) stays. Then a test in `packages/render/test/` that
greps `packages/render/src` for the three names and lists the files allowed
to keep them, so the next one is a red check rather than a profile. Prove it
with `bun test packages/render` — the budget tests count ops and a
`bezierCurveTo` path draws the same ops the string did — and
`bun run test:profile` on one machine before and after.
