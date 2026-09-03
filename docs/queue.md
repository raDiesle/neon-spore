# Queue

Technical work a session found and did not do. Every entry here is waiting for
a session of its own, and every entry here drains without the owner deciding
anything.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped. The
test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**And nowhere else.** Not the report, which scrolls away — the next session
clones `origin` and sees only files. Not a suggested background task either:
this file *is* the mechanism, and a chip is a popup the owner has to dismiss
that says nothing `bun run queue` does not already say to whoever asks it. A
finding written here is read by every session that comes after; a finding
offered as a chip is read once, by the one person the queue exists to spare.

**What does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — is a decision, and a decision drains only
through the owner. It goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* is not queued either: it is offered in `tools/versus/`, because the
only way to choose one is to see it. Mixing decisions into this file is exactly
what buried the last one under sixty-two entries nobody could face.

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

A third line, `- **Taken:** 2026-09-04, claude/queue-one-line-saying-what`, sits
between the two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.



## Move apps/server off the miniflare alpha when a stable 5 ships

- **Found:** 2026-09-03, claude/bun-queue-list-command-5a8695
- **Files:** `apps/server/package.json`, `apps/server/test/room.test.ts`, `bun.lock`

`apps/server/test/room.test.ts` pins `miniflare` at `5.20260831.0-alpha`, exactly
and on purpose. The last stable 4.x is `4.20260730.0`, whose workerd binary
refuses the `compatibility_date` in `wrangler.jsonc` ("newest date supported by
this server binary is 2026-08-06"), and the test reads that date from the
deploy's own config rather than carrying a second copy of it — so a stable 4
would mean testing on a date the deploy does not use.

When a non-alpha 5 is published, move to it and check the config shape the test
builds by hand (`workers[0].config` with `manifest.modules` and
`exports.Room.storage`) still holds — miniflare 5 changed it from 4's flat
`{ modules, script, durableObjects }`, and `convertV4MiniflareOptions` is the
shim that shows what the new shape wants if it changed again.


## Five files stand exactly on the 250-line limit, so the next creature cannot land

- **Found:** 2026-09-05, claude/string-connected-enemy-0dae70
- **Files:** `packages/sim/src/creature-kinds.ts`, `packages/sim/src/creature-state.ts`,
  `packages/sim/src/beat.ts`, `packages/sim/src/events-creature.ts`,
  `packages/render/src/effects-spark.ts`

Adding THE STRAND ended with all five of these at exactly 250 lines. Each was
already at 247–249 and each takes one or two lines per creature — a kind in the
union, a field, a sweep on the beat, an event arm, a burst — so the next body
added to the bestiary cannot land in any of them without first paying for the
room. That lane paid it by folding new cases into existing ones and by
shortening a comment that belonged to another creature, which is the exact
move `packages/render/src/effects-spark-silent.ts` was created to stop anybody
having to make.

Cut each along a seam that already exists, the way `creature-state-held.ts`,
`events-carom.ts` and `effects-spark-silent.ts` were cut:

- `creature-kinds.ts` — the per-kind paragraphs are the bulk. The union and
  `CREATURE_KINDS` are the file; the prose could be one line each pointing at
  the rule file that owns the creature, which every paragraph already names.
- `creature-state.ts` — one more `…-state-<creature>.ts` beside the strand's,
  for whichever group is next largest (THE GYRE's four, THE LID's five).
- `beat.ts` — the branch chain in the fall loop is the half that grows; a
  `step-body.ts` holding "what this kind does instead of falling" is the seam
  the comments in it already describe.
- `events-creature.ts` — the same cut `events-carom.ts` and `events-volley.ts`
  made twice already, for whichever creature's arm is longest.
- `effects-spark.ts` — the bursts that are a body's own colour are one group
  and the structural ones another; either is a file.

Nothing about the game changes. `bun run check` proves it: `limits.test.ts` is
the whole of the acceptance.


## THE STRAND is drawn by nothing in `packages/render/test/frame.test.ts`

- **Found:** 2026-09-05, claude/string-connected-enemy-0dae70
- **Files:** `packages/render/test/frame.test.ts`, `packages/render/src/strand.ts`,
  `packages/render/src/strand-bead.ts`, `packages/render/src/creature-body.ts`

Every other creature is drawn again through the stub canvas that refuses what
a real one refuses — that is what catches a value which is a perfectly good
`string` and not a colour. The strand's three new pictures are not: the thread
(`drawStrands`), the sealed bead player 2 sees in place of a body, and the
raisin a shrivelled one leaves behind. All three take a colour out of
`PALETTE`, go through `hazed`, and are only ever reached with a `strand` on the
field, which no existing frame test puts there.

Add a case beside the gyre's and the veer's: a world with one thread on it,
drawn at each of the three `ViewRole`s, with at least one bead shrivelled so
`drawRaisin` is reached, and once with the thread's last bead spent so the
sweep has run. `gyre-frame.test.ts` and `veer-frame.test.ts` are the shape to
copy.

## `packages/content/test/scenes.test.ts` is 435 lines

- **Found:** 2026-09-05, claude/throb-enemy-redesign-nyf0uo
- **Files:** `packages/content/test/scenes.test.ts`

Past the ~250-line limit by most of a file again, and it has the seam already:
the first two thirds are **invariants over every scene** — the panel a film may
press, page ordering, page length, caption length, shared pages, tempo, the
hull — walked with `for (const id of SCENE_IDS)`, and the last third is
**named films** checked one at a time, each with its own world and its own
question (the strip act's held press, and THE THROB's two shots).

Split on that: the sweep stays in `scenes.test.ts`, and the per-film checks go
to `scene-films.test.ts` beside it. The two halves fail for different reasons —
one when the scene format changes, the other when a creature's rule does — and
they will keep being added to at different rates, which is the whole argument
for the cut.

## CRLF on disk fails the lint while `git status` says the tree is clean

- **Found:** 2026-09-03, claude/scan-box-wisp-ghost-4f7c35
- **Files:** `tools/land/run.ts`, `package.json`, `tools/land/test/`

`bun run land` failed in this lane on a file the lane had never touched:
`.claude/launch.json` had CRLF endings on disk. Its blob in `HEAD` was LF and
`git status` was clean, so nothing said the working tree was the problem —
biome printed the whole file as a formatter diff and the landing stopped with
`script "lint" exited with code 1` and no cause an eye could pick out. The fix
was one line of `\r\n` → `\n`, and finding it took six commands.

It is newly reachable: biome only began checking `.json`, `.css` and `.js` in
"Move the director's 1 100 lines of CSS out of index.html", and a Windows tool
that rewrites a tracked file — `.claude/launch.json` is written by the harness
itself — puts CRLF back whatever `.gitattributes` says, because the attribute
governs checkout and commit rather than a third party's write. So every
worktree on that machine can go red on a file nobody edited, and the message
will name a formatter rather than a line ending.

Have the landing say it. Before `bun run check` runs, look for `\r\n` in the
tracked text files biome checks and stop with the list and the one command that
fixes it (`bun run format`), rather than letting a whole-file formatter diff
