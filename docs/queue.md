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

## Give THE CHOIR a rehearsal, and teach the scene runner a gesture

- **Found:** 2026-09-07, claude/choir-enemy-shake-swipe-08eaf0
- **Files:** `packages/content/src/scenes/`, `packages/content/src/scenes.ts`,
  `packages/content/src/scene-step-types.ts`, `packages/sim/src/scene-aim.ts`,
  `packages/render/src/caption-anchor.ts`

THE CHOIR shipped with a **prose** guide — the three lines, the ready gate, and
nothing that moves — and it is the wave in the game that can least afford one.
Every other guide describes something a pair can find on their own panel; this
one has to teach a gesture that is on no panel at all, and a pair who do not
read the words carefully will sit and watch three dots reach the hull.

A rehearsal needs one thing the scene runner has not got: a way to author the
two arrows. `SceneAct`'s drag takes a `DragTarget`, and `scene-aim.ts` resolves
`lidString`'s body by column at the moment the hand goes down — `choirLeft` and
`choirRight` are fixtures with no body and no column, so they need the simpler
path a maze string already has, plus a caption anchor of their own (the two
arrows are not `{ at: "held" }`, which points at a handle that has travelled).
The shake needs no act at all: it is one press-shaped command with nothing on
it, so a `{ tick, shake: true }` act is a line in the runner.

Three or four pages, and the seat split is unusually easy: the pilot's pages
are the gesture, the navigator's is holding fire until the colour exists, and
the shared last page is the chord and what it costs the hull.

## Draw THE CHOIR's merge, which today is a burst and nothing else

- **Found:** 2026-09-07, claude/choir-enemy-shake-swipe-08eaf0
- **Files:** `packages/render/src/choir.ts`, `packages/render/src/effects-body.ts`,
  `packages/render/src/effects-ingest.ts`

The moment three dots become one body is the whole creature, and on screen it is
one frame of grey membrane followed by one frame of a slick with a burst of
sparks over it. THE CLASP has the same shape of moment and a whole file for it
(`clasp-break.ts`, drawn around a body that is still falling); THE RIND has
`rind-shed.ts`. This has neither, and the reason is only that the sim half was
the work.

What it wants is the film **closing**: the three swellings drawn pulling toward
the middle lane over a few tenths of a second while the outline stays one
contour, and the colour arriving into it rather than replacing it. `choirDotAt`
is already the one copy of where a dot stands, so the transient is that function
sampled toward a common centre; `BodyTransients` in `effects-body.ts` is where
it belongs, because it outlives its frame and is about one body by id — which is
exactly why `choirMerge` carries an `id`.

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
