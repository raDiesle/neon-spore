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

## `tools/frames/run.ts` stands on the 250-line ceiling exactly

- **Found:** 2026-09-09, claude/queue-the-clasps-hand-painted-shield-has-never-been-dr
- **Files:** `tools/frames/run.ts`, `tools/frames/flags.ts`, `tools/frames/spec.ts`

Adding `--raster` — three lines, one of them a comment — took the file to 251
and `packages/sim/test/limits.test.ts` refused it. The comment came back out
and it is at 250 now, which means **the next flag anybody adds fails the check
before it does anything**, and that session will spend its first minutes
finding out why rather than adding a flag.

The seam is already drawn and half used: `tools/frames/flags.ts` holds
`collectHolds` and `tickLine`, which are the two pieces of argument parsing
that were long enough to be worth moving. What is left in `run.ts` is a
`flag(name, fallback)` closure, an `indexOf` per flag, three validators and a
forty-line `FrameSpec` literal. Move the reading and the validating of the
argument vector into `flags.ts` as one `parseFrameSpec(argv, waves)` and leave
`run.ts` as the usage block, the wave resolution and the capture — which is
what its own doc comment says it is.

`tools/frames/test/flags.test.ts` already exists and is where the new function's
tests go. Nothing about the captures changes, so `bun run check` proves it.

## A frames capture test fails inside `bun run check` and passes on its own

- **Found:** 2026-09-09, claude/queue-the-clasps-hand-painted-shield-has-never-been-dr
- **Files:** `tools/frames/test/opening.test.ts`

`captureFrames past a wave's opening > takes the same picture of the same
build twice` failed inside a full `bun run check` on 9 September 2026 —
`twice.whole` differed from `once.whole` by one byte — and then passed twelve
out of twelve, in 32 s, when the file was run alone a minute later. Nothing in
that lane touched the capture path for a run with no flags set, so the fault
is the check's own load rather than the code under test.

It is the shape of thing `frame-harness.ts`'s `FRAME_TIMEOUT_MS` comment
already describes from the other side: a browser-driven test that is fine on
its own and not fine beside seventy thousand others, and the cost is paid by
the next session, which reads one red test on a green tree and re-runs the
whole check to find out it was nothing.

Find out what actually differs before changing anything — the assertion
compares whole-frame bytes, so a one-byte difference is worth printing rather
than guessing at. Two candidates to weigh once it is known: the capture is not
waiting for something it thinks it is waiting for (a font, a decoded image, a
first paint), in which case the wait is the fix and the comparison stays exact;
or two PNG encodes of one identical frame are genuinely allowed to differ by a
byte, in which case the assertion is comparing the wrong thing and should
compare decoded pixels.

## THE TORCH's veil is drawn at full strength — `VEIL` has never done anything

- **Found:** 2026-09-09, claude/queue-the-wisp-and-bulb-queen-carry-a-measured-cost-fr
- **Taken:** 2026-09-09, claude/queue-the-torchs-veil-is-drawn-at-full-strength-veil-h
- **Files:** `packages/render/src/torch-fire.ts`,
  `packages/render/src/torch-ball.ts`
- **Asks:** Should the veil over the stone's face be the fifth of a plume the code always said it was, or is what has actually been shipping the right strength?

`fireball` ends with a fourth pass — the nearest plumes again, faintly, over
the rock's face, so the stone reads as being *inside* the fire rather than in
front of it. It sets `ctx.globalAlpha = VEIL` (0.2) and calls `plumes(…,
true)`. **`plumes` then overwrites that alpha rather than multiplying it**, once
per plume, with the plume's own `(near ? 0.34 : 0.24) * heat` — it did so
through `halo`, which assigns `globalAlpha` outright, and the pass that
replaced `halo` with a direct blit kept the behaviour exactly so the speed
change could be proved to draw the same thing.

So the veil has been drawn at the same strength as the main plume pass since
the day it was written, and the near plumes are laid down twice at full value.
The comment beside `VEIL` says what was intended and what it costs to get it
wrong: *"with it any louder, the craters stop being countable, and the craters
are the only readout this body carries."* It is five times louder.

This is not a tuning question and it is not quite a defect either, which is why
it asks rather than states. The picture that has been on the field for the
creature's whole life is the loud one, the owner has looked at THE TORCH and
BULB QUEEN with it, and honouring the constant now would visibly lift the
craters out of the fire on both. Two answers, and the work is three lines
either way:

- **Honour it.** `plumes` takes the caller's alpha as a multiplier — pass a
  `strength` argument defaulting to 1 and multiply, so `ball` is unchanged and
  the veil finally lands at a fifth. The stone gets darker and the craters get
  easier to count, which is what the file says it wanted.
- **Keep what ships.** Delete `VEIL` and the `globalAlpha` line, and say in the
  comment that the veil is the near plumes at their own strength drawn twice.
  A constant that does nothing is worse than no constant, whichever way the
  look goes.

Whichever wins, `packages/render/test/wave-budget.test.ts`'s BULB QUEEN rows
are the proof it changed nothing else, and `bun run frames . --wave 25 --at`
takes the two pictures for the owner to choose between.
