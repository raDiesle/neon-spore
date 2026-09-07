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

## A throwaway world-probe script has nowhere to live

- **Found:** 2026-09-07, claude/coil-dome-vertical-blocking-b5d660
- **Files:** `package.json`, `tools/probe/` (new), `docs/working-with-claude.md`

Answering "where is this creature on beat 13 of THE COIL" is a ten-line script
that steps a world and prints the field, and there is nowhere to put it. A file
in the session's scratch directory cannot resolve `@neon-spore/sim` at all
because it is outside the workspace; a file under `tools/frames/` cannot
resolve it either, because that package does not declare the dependency and
should not. What worked was a file dropped inside `packages/render/`, which
happens to depend on both `sim` and `content` — found by trying three places,
and every session that needs a number off a running world pays the same three
tries.

Add `tools/probe/`: a package that depends on `sim`, `content` and `render`,
with a `bun run probe <file.ts>` script that runs a script placed in (or passed
to) it, and one worked example in its own doc comment that builds a world from
a wave by name and prints the field beat by beat. Then say in
`docs/working-with-claude.md` that this is where a throwaway world question
goes, beside the traps that file already collects. The alternative — a line in
that document saying "put it under `packages/render/`" — is cheaper and worse:
it makes an unrelated package the place scratch files live, and nothing sweeps
them up.


## The director's keyboard is a hand-typed copy of a table it could now call

- **Found:** 2026-09-07, claude/queue-status-check-kydfx5
- **Files:** `tools/director/src/keys.ts`, `tools/director/src/key-help.ts`, `tools/director/src/stage.ts`

`apps/game`'s keyboard no longer knows a letter per control: a key is a seat
and a slot on the wave's panel, and `packages/content/src/keys-desk.ts` is the
one table that answers which. The director still carries the old arrangement
typed out by hand — `KEY_BINDINGS` plus a `switch` that is a second copy of it
— with THE GAUGE on Z/X/C and THE FLEET on U/H/N/K, and nothing at all for THE
CLAW, PINBALL or SNAKE. Its own header says the two are typed out twice and
that the game is right when they disagree; they disagree now.

The header's reason for the copy is gone: it says `apps/game` is an
application a tool may not reach into, and that was true when the answer lived
there. It lives in `@neon-spore/content` now, which `tools/director` already
depends on.

Replace both the table and the `switch` with `deskKey(set, code)` and
`controlPress`, the way `apps/game/src/keys.ts` does. `bindKeys` has to be
handed the panel — `controls: () => ControlSet`, read fresh, because the
director edits a draft list and `controlSetForWave` would answer about
whatever was last saved (`ViewState.controls` says why in as many words). The
stage knows which wave it is standing on and is the caller. `KEY_BINDINGS`
becomes `deskKeys(set)` read through the same call, so `key-help.ts` prints
the keys of the panel actually on the stage rather than a fixed list; A/D
carrying both seats and G taking hold of a body stay where they are, because
neither is a control on any panel.


## A frame test is 5.1 s against a 5 s cap, so a full run fails on a busy machine

- **Found:** 2026-09-07, claude/queue-status-check-kydfx5
- **Files:** `packages/render/test/fence-frame.test.ts`, `packages/render/test/frame-harness.ts`

`the fence > draws a crack for the pilot and never for the navigator` timed out
at 5126 ms inside `bun run check` and then passed on its own in 3.9 s for the
whole file. Nothing is wrong with it: it is simply close enough to bun's
default five-second cap that the rest of the suite running beside it pushes it
over, so a green tree reports one red test and the next session re-runs the
check to find out it was nothing. That retry costs every later session the same
minutes.

It draws a whole wave of frames per case and there are nine of them. Two
things would fix it and either is enough: give the file the ticks it actually
needs rather than a beat count copied from the other frame tests — most of the
run happens after the crack it is asserting about — or hand `runFrames` a
`timeout` the frame tests set once, so the cap is stated where the cost is
rather than inherited from the runner's default. Check the other files in
`packages/render/test` that use `runFrames` for the same margin while you are
in there; the fence's is the first to cross, not the only one near it.


## `bun run frames --opening guide` cannot photograph a page past its first moment

- **Found:** 2026-09-07, claude/strand-enemy-visuals-26ba40
- **Files:** `tools/frames/opening-hold.ts`, `tools/frames/capture.ts`, `tools/frames/run.ts`

`run.ts` says that on `--opening guide`, `--frames` and `--stride` count painted
frames because "a rehearsal is drawn rather than stepped". In practice they do
not advance it: `--frames 6 --stride 30` on THE COIL's rehearsal returns six
pictures of the same instant, and so does `--settle 135`. A rehearsal's clock is
wall time (`SceneRun` is driven by the paint loop), and the capture paints with
a clock that does not move, so a page can only ever be photographed at the tick
`restart` leaves it on.

The consequence is that the moment a film is *about* is the one moment a session
cannot send the owner. THE COIL's third page turns on a dome opening about a
second in; the only proof available was a simulation dump, which is exactly what
`CLAUDE.md` says not to send instead of a frame.

Give the guide capture a clock it can drive — a test handle that steps
`SceneRun` by a named number of ticks, the way `advance` steps the field — and
make `--stride` on an `--opening guide` capture mean those ticks. Then a strip
of a rehearsal is a strip of the film rather than of one frame of it.

## Say how to open a worktree's director in a browser, port and all

- **Found:** 2026-09-07, claude/map-editor-brush-ux-5fce95
- **Files:** `docs/working-with-claude.md`, `.claude/launch.json`, `tools/ports.ts`

`CLAUDE.md` says a worktree must launch its servers *by absolute path*, because
`.claude/launch.json` carries no `cwd` and a named entry starts the **main**
checkout's server with nothing erroring. What it does not say is how to get the
port, and that is the half that costs the turns: the director's four entries in
`.claude/launch.json` are all fixed at 4174 or `autoPort`, and a worktree does
not use 4174 — `claimPort` hands it a number derived from its own path inside
`DIRECTOR_BAND`. A session that wants to look at the director it is editing has
to work out that number, hand-write a fifth launch entry carrying it and an
absolute `--cwd`, use it, and remember to put the file back before committing.
That happened twice in one afternoon and cost two turns each time, and the file
is tracked, so a forgotten revert lands a lane-specific entry on `main`.

Two lines of `docs/working-with-claude.md` would end it: the one-liner that
prints the number —

    bun -e 'import{derivePort,DIRECTOR_BAND}from"./tools/ports.js";console.log(derivePort(DIRECTOR_BAND,process.cwd()))'

— and the shape of the throwaway entry it goes into, with the instruction to
`git checkout .claude/launch.json` afterwards. Better still if `tools/ports.ts`
grew a tiny CLI (`bun run port director`) so the incantation is a command
rather than a paste, and `CLAUDE.md`'s "launch by absolute path" sentence
pointed at it.
