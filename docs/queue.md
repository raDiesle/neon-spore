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

## `lockstep.ts` never says its promise rests on an ordered, reliable transport

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/net/src/lockstep.ts`, `.claude/skills/net-change/SKILL.md`

The scheduler is safe against a frame that arrives late — an `input` at or
before the peer's horizon is refused and counted — and it has no defence at all
against a frame that is *lost* while the `confirm` sent after it arrives: the
device then simulates that tick with nothing on it, the peer simulates it with
a command, and the two worlds part with nobody the wiser until the next
fingerprint. That is fine, because a WebSocket does not deliver past a segment
it is missing. But the only place it is written down is a comment on a test's
own wire in `two-devices.test.ts`, so the assumption is invisible from the file
that depends on it: anything that later sends a `Command` outside the socket's
stream — a datagram transport, a second channel for something "small", a relay
that fans out through two queues — breaks lockstep and reads as a network bug.
Add the paragraph to `lockstep.ts`'s header, and the sentence to the skill's
four rules beside "decode without trusting". A document, so `bun run check`
proves only that nothing else moved.

## No test drives a wave's opening through the scheduler

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/net/test/two-devices.test.ts`, `packages/sim/src/briefing.ts`

`briefings` is off in `DEFAULT_CONFIG` and on in the game, so every two-device
test plays a wave that has already started and no test anywhere puts an opening
through the wire. The opening is the one place `step` takes a different shape —
two command kinds are read, everything below the branch is skipped, and the tick
counter still moves — and the `brief` ack that ends it has to land on the same
tick on both devices or one of them plays a wave the other is still reading
about. `{ ...DEFAULT_CONFIG, ...PAIR_ON }` is the world to build
(`config-pair.ts`); ack each seat through `Lockstep.press` a few ticks apart, and
assert the two worlds leave `OPENING_INTRO` on the same tick and hash equal
through it. The guide's pages and its ready gate are the same case one step
harder and can follow in the same test or the next one.

## Unverified at ef8cb3b6: the reconnect the two new tests model, against a real D…

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `docs/queue.md`, `docs/time-log.md`, `packages/net/test/clock.test.ts`, `packages/net/test/desync.test.ts`, `packages/net/test/lockstep.test.ts`, `packages/net/test/protocol.test.ts`, `packages/net/test/scheduler-faults.test.ts`

*`packages/net` says which failure modes the scheduler survives* landed from a session that could not look at it. What went unchecked:

- the reconnect the two new tests model, against a real Durable Object: bun run relay:check ws://127.0.0.1:8800 14 --rejoin

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## No two-device test crosses a wave boundary

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/net/test/two-devices-wave.test.ts`, `apps/game/src/waves.ts`

The new wave test plays content's first wave to its end and stops on the
`needWave` the clear produces, which is exactly where the host takes over:
`waves.ts`'s `handle` answers that event by calling `startWave` inside the frame
it arrived in, so both devices reset every wave-local field on the same tick by
construction — and nothing anywhere proves it. It is the kind of thing that
holds until it does not: an opening deferred by a frame (the introduction's own
seconds already run on a wall clock, which is the one part of a wave the sim may
not count), a host that answered a retry on a different tick from its partner, or
anything in `startWave` that read something other than the world. Answer
`needWave` in the test the way `waves.ts` answers it — the same four calls into
`content`, on the tick the event arrived, on both devices — carry the run into
wave 1 (CYAN, two cyan bodies) and keep the fingerprints crossing over the
boundary. `bun test packages/net` proves it.

## `packages/render` is seventy per cent of the test suite's time

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/render/test/*-frame.test.ts`, `tools/frames/test/opening.test.ts`, `docs/performance.md`

`bun run test:profile` on 12 September 2026, on a cloud runner, 186 s of test
time across 412 files:

```
130.9s  packages/render      26.8s  tools/frames       9.3s  apps/server
  7.0s  tools/shape-sheet     6.5s  tools/director     1.6s  packages/sim
```

The tail is a dozen frame tests at 1.5–2.9 s each — `veer-frame`, `dart-frame`,
`fence-frame`, `crawler-frame`, `balloon-frame` — and five cases of
`tools/frames/test/opening.test.ts`, which drives a real Chrome. Every lane pays
this in `bun run check`, twice over on a landing that has to re-run it.

**The technique is written down and has a precedent.** `docs/performance.md`
records the last round: `packages/render/test/briefing.test.ts` went from 88.6 s
to 24.1 s by drawing one tick in four with each walk taking a different one, so
every tick is still drawn once and nothing the test asserts is weakened; the
suite went 292 s → 214 s. Nobody has been back since, and the frame tests that
were not touched then are the list above.

Read the *cases* before the files — a file of fourteen tests is not slow, four of
its tests are, which is what `test:profile`'s per-case table is for. Prove it the
honest way: same machine, `bun run test:profile` before and after, and every test
still green. It is not `bun run perf` and claims nothing about a frame's cost, so
a cloud session may take the number.

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
