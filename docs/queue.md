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

## `bun run land` conflicts on `docs/queue.md` every time a lane drains an item

- **Found:** 2026-09-09, claude/queue-drain-2026-09-09b
- **Files:** `tools/queue/run.ts`, `tools/land/run.ts`

`bun run queue take` writes its `Taken:` line **on `main`** and pushes, which is
the claim and is right. `bun run queue done` then removes the whole entry, and
it removes it **in the lane's own worktree** — so the lane carries a commit that
edits a file `main` has moved underneath it, and `bun run land` refuses to
replay with `conflicts in docs/queue.md`. It is not an occasional clash between
two lanes: it happens on **every** landing that drains an item, because the same
tool wrote both sides.

This lane hit it twice in one sitting and worked around it the same way both
times: `git reset --hard HEAD~1`, `git rebase origin/main`, re-run
`bun run queue done`, commit, land. That is four commands and a rebuilt commit
message to get past a conflict nobody authored, and every future draining
session pays it.

Two candidate fixes, and the second looks right. `queue done` could write on
`main` the way `take` does, so the removal never enters a lane at all — but the
entry then leaves the list before the work that closed it has landed, and a
crash in between loses the item. Better: **have `bun run land` resolve a
`docs/queue.md` conflict itself**, the way the queue's sibling item asks it to
for `docs/INDEX.md` — take `origin`'s copy and re-apply the lane's own removals
by heading, which is a well-defined merge because an entry is identified by its
`##` line. The proof is a lane that claims an item, does it, and lands in one
`bun run land` with no manual rebase.

## `world.beat` is not `world.tick / ticksPerBeat`, and nothing says so

- **Found:** 2026-09-08, claude/beatbox-enemy-visuals-462bcf
- **Files:** `packages/sim/src/step.ts`, `packages/sim/src/beat.ts`, `tools/director/src/stage.ts`, `tools/frames/press.ts`

A wave's opening holds the field, and the hold in `step` runs `world.tick += 1`
and returns **before** `onBeat` — so every opening a run passes adds ticks with
no beat under them, and `world.beat` falls permanently behind `world.tick /
ticksPerBeat(cfg)` for the rest of that run. Measured in the shipping build on
8 September 2026: after a fresh load and three hundred ticks of wave 59,
`world.tick` was 300 and `world.beat` was 0.

Nothing is wrong with the *boundaries* — `onBeat` still fires on multiples of
`ticksPerBeat`, so the beat still lands where the ear expects it. What is wrong
is that `world.beat` is a **label** and reads like a position, and multiplying
one back into ticks is silently a different moment. THE BEATBOX's own deadline
was written that way first and settled every run a beat early;
`beatboxDeadline` now recovers the boundary by rounding the tap's tick to the
nearest multiple of `ticksPerBeat` instead, and says why in a paragraph. Two
other sites do the same multiplication and should be looked at with this in
hand: `tools/director/src/stage.ts`'s `seek`, which is a rig and probably fine
because it seeks from a rebuilt world, and `tools/frames/press.ts`, whose
`--press TICK` axis a caller naturally reads as beats — a press written on a
boundary is off it by however long the opening held, which is why the first
capture of a soundbox in this lane came back with no run on it at all.

The work: give `packages/sim` one exported reading for *the tick a beat began
on* (or for the phase of the current tick), use it at every site that converts
between the two, and put a paragraph on `world.beat` in `world.ts` saying it is
a label and not a position. A test that runs a wave with an opening and asserts
the two counters disagree is what keeps it true.

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
buy back a thousand characters. Add `bun run port`, `bun run probe`,
`bun run style-guide` and `bun run shapes:cues` to the Commands block in the
same commit: all four are lines their lanes could not afford, and all four are
commands a session looks for exactly where it cannot find them.
`shapes:cues` is the motion half of `shapes:report` and was added on
8 September 2026 by a lane that could only document it in
`.claude/skills/depth` and `docs/style-guide.md`, for this reason.

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

## `bun run land` stops on a `docs/INDEX.md` conflict it could resolve itself

- **Found:** 2026-09-08, claude/pinball-boss-ui-polish-f6c35e
- **Files:** `tools/land/`, `tools/index/`, `docs/INDEX.md`

`docs/INDEX.md` is generated, and every lane that adds, splits or deletes a file
writes a row into it — so two lanes landing on the same day conflict there
almost every time. Landing the PINBALL round took three attempts: `bun run land`
refused with `conflicts in docs/INDEX.md`, backed the rebase out and moved
nothing, twice in a row, because another lane landed in between each try. Each
attempt cost a manual `git rebase main`, `git checkout main -- docs/INDEX.md`,
`bun run index`, `git add`, `git rebase --continue` — five commands whose result
is entirely determined by the tree, and a full `bun run check` afterwards.

The resolution is mechanical and `CLAUDE.md` already states it as a rule:
*resolve a generated file by running its command*. A rule a person executes by
hand five commands at a time is a tool that has not been written. When the only
conflicted paths are generated ones, `tools/land` should take `main`'s copy,
re-run the generator, stage the result and continue the rebase, saying in its
own output that it did so — and refuse as it does today the moment a conflict
touches anything else. `tools/land/test/` should hold a case that stages two
branches which both append a row and asserts the landing goes through with the
regenerated file.

There is a second half worth deciding at the same time: `docs/queue.md` and
`docs/release-notes.md` conflict for the same reason and already have a written
rule of their own (take `origin`'s copy whole and re-append your own entry).
That one is not derivable from a generator, so it is a different fix; do not
fold them together without saying which is which.

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

## A scratch script cannot import `@neon-spore/*` from the repository root

- **Found:** 2026-09-08, claude/claw-crank-winder-control-xzuf4h
- **Files:** `package.json`, `tools/` (wherever the answer lands)

A lane checking a rehearsal's timing wrote twenty lines against
`sceneScript` and `SceneRun`, put them in a file at the root, and bun could
not resolve `@neon-spore/content` from there: the workspace links exist under
each package's own `node_modules` and there is nothing at the top. The lane
worked around it by dropping the file into `tools/director/`, which resolves
everything — and then had to remember to delete it out of a package it does
not own.

It costs a few minutes and a wrong turn every time somebody wants to *ask the
simulation a question* rather than assert one, which is a thing that happens
in every lane that touches a scene, a wave or a boss. Two ways out, either is
fine: a root `node_modules/@neon-spore` link created by the install, or a
`tools/scratch/` with a package of its own that depends on all five packages
and is gitignored except for its `package.json`. The second is the honest
one — a scratch file belongs somewhere it is expected to be deleted from.

## `bun run land` refuses in a cloud session, because the clone is shallow

- **Found:** 2026-09-08, claude/rock-paper-scissors-boss-sn9ful
- **Files:** `tools/land/run.ts`, `docs/cloud-session.md`

A cloud session's checkout is a **shallow** clone. `git fetch origin main`
brings a second shallow segment down rather than joining the first, so `main`
and `origin/main` have no ancestor git can see between them: `git merge-base`
answers nothing at all, and `git rev-list --count` reports each as ahead of the
other by the depth of the graft — fifty and fifty in this session, on a branch
whose own base *was* `origin/main`. `land`'s trunk guard reads that as
`origin/main has 50 commits main has not` and refuses, and nothing fixes it
from inside the guard's own advice: there is no fast-forward to take, because
the two segments are not one history.

`git fetch --unshallow origin` fixes it outright — after it the same two counts
were 89 behind and 0 ahead, `git merge --ff-only origin/main` went through, and
the landing did too. So the work is: `land` asks
`git rev-parse --is-shallow-repository` before it compares anything, and either
unshallows or says *that* instead of a count nobody can act on; and
`docs/cloud-session.md` says it beside the two host variables, because
`CLAUDE.md` tells a cloud session to land every turn and every one of them
walks into this on the way.

## `docs/party-games.md` links to nine screenshots it could not embed

- **Found:** 2026-09-08, claude/party-minigames-research-udjn67
- **Files:** `docs/party-games.md`

`docs/tower-defence.md` sets the house rule for a study of other games: the art
is not ours and the repository is public, so a picture is written as
`![a sentence saying what it shows](https://…)` and **linked**, never copied in.
`packages/…` never sees it; `tools/director/src/markdown.ts` renders it and
honours `https://` only.

The party-games study could not follow it. Every host those links would point
at is refused by the network policy a cloud session runs under —
`www.mariowiki.com`, `mario.fandom.com`, `rabbids.fandom.com`,
`raving-rabbids.fandom.com`, `raymanpc.com`, `en.wikipedia.org` and
`static.wikia.nocookie.net` all answered `connect_rejected`, through `curl` and
through the fetch tool alike. Writing an `![…](…)` from memory would have put
nine unchecked URLs in a public file, so each row carries a **link to the wiki
page that holds its screenshot** instead, and the page says so in *What the
pictures are, and are not*.

The work: from a session that can reach those hosts, open the eleven pages
listed under *Sources* and in the two tables, take the direct image URL for each
minigame's screenshot, and rewrite the rows as linked images with a caption
written as a sentence — the way `docs/tower-defence.md` does throughout, so that
a failed load still says what it showed. The rows most worth a picture are
Torpedo Targets, Bowser's Big Blast, Hexagon Heat, Look Away and the Rabbids
dance battle; the refused rows need none. Then delete the *What the pictures
are, and are not* section's second and third paragraphs, which exist only to
explain the absence.

## A cloud session cannot delete the branch it just landed

- **Found:** 2026-09-08, claude/party-minigames-research-udjn67
- **Files:** `tools/land/run.ts`, `docs/cloud-session.md`

`bun run land` "deletes the branch and sweeps spent worktrees", and locally it
does. The branch on `origin` is a different matter from a cloud session: the
delete-push is refused by the git proxy the session runs behind.

```
$ git push origin --delete claude/party-minigames-research-udjn67
warning: push negotiation failed; proceeding anyway with push
error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
Everything up-to-date
```

Three attempts with backoff, and `git push origin :refs/heads/<branch>` gives
the same 403 — an ordinary push of the same branch had gone through minutes
earlier, so it is the *deletion* the proxy denies rather than the repository or
the credential. `Everything up-to-date` on the last line is `git` reporting the
other half of the same command and is not a success.

So every cloud landing leaves its branch standing on `origin`, and after enough
of them `git ls-remote --heads origin` is mostly graveyard —
`claude/queued-items-rer0av`, `claude/rock-paper-scissors-boss-sn9ful` and
`claude/the-weight-boss-states-w8bha3` were already there when this one looked.
Nothing is broken by it: the commits are on `main` and `CLAUDE.md` says a
landed branch is never revived. What it costs is that the branch list stops
being a list of live work.

The work: `land` should notice it is in a cloud session, try the delete once,
and on a 403 say *the branch stays on origin, delete it in GitHub* rather than
printing a stack of git's own noise after a successful landing — the landing
did work and the last four lines currently read as though it had not. Then
`docs/cloud-session.md` says it beside the two host variables, next to the
shallow-clone entry, because the two are hit in the same minute of the same
turn.

Also worth deciding while somebody is in there: whether landing from a clone
with no worktrees should push a branch at all. The hand-off is `main`
(`CLAUDE.md`, Git), the branch was pushed only so the turn had somewhere to
report from, and a branch never pushed is a branch nothing has to delete.
## THE TELL's last rung was designed as three throws and ships as one

- **Found:** 2026-09-08, claude/rock-paper-scissors-boss-sn9ful
- **Files:** `packages/sim/src/tell.ts`, `packages/sim/src/tell-round.ts`,
  `packages/content/src/tell-rungs.ts`, `packages/render/src/tell-body.ts`

`docs/spec/bosses.md` 11.9 ends the ladder on a rung with **no guess in it at
all**: three throws on three consecutive beats, every one of them shown
outright, no feint. Nothing about it is a reading test — it is the pair finding
out whether it can say three words in four seconds without talking over itself,
and it is there because a ladder that ends on a coin toss ends on somebody
else's decision.

What shipped asks for one throw a rung. `TellRung` has `beats`, `feint` and
`answers`, and the fifth rung is `{ beats: 2, feint: true }` — a hard rung, and
the same kind of hard as the fourth.

It is a second mode inside the round rather than a number, which is why it was
left rather than half-built: a rung of three would need a list of boss throws
instead of one `bossThrow`, a list of the ship's instead of one `thrown`, and a
reveal that plays three scenes in a row rather than one. The seam is `openRung`
and `reveal` in `tell-round.ts`, which already do exactly this once. Add
`throws?: number` to `TellRung`, let the two `number` fields become the first
entry of a fixed-length array when it is set, and the picture follows — the
ring already draws one node lit at a time and would light them in turn.

## THE TELL's baseline row was measured on a busy container

- **Found:** 2026-09-08, claude/rock-paper-scissors-boss-sn9ful
- **Files:** `tools/perf/baseline.json`

`CLAUDE.md` says a cloud session skips the performance run. This one could not:
adding a wave adds a row `tools/perf/test/baseline.test.ts` requires, and the
test is what keeps the baseline from comparing today against a game that no
longer exists — so `bun run perf --wave "THE TELL" --save` was run rather than
the row being invented.

It came back honest and flagged. THE TELL measures 5.43 ms raw and merges at
1.35 ms on the baseline's footing, which is 33% of a 60 Hz frame and the
cheapest wave in the run — plausible for a round with no bodies on the field.
But the whole run moved +256% against the baseline and **THE WISP, a reference
wave, came back flagged at 114% of a frame**, which `docs/performance.md` says
means the machine was busy and the run says nothing. The scaling that produced
1.35 was read off those same references.

So the row is a placeholder with a real measurement in it rather than a
measurement to trust. Re-take it on the owner's own machine —
`bun run perf --wave "THE TELL" --save` — and this entry goes.

**And the general case is the interesting half**: a cloud session adding a wave
cannot pass `bun run check` without running perf, and running perf there is
what `CLAUDE.md` tells it not to do. Either the baseline test should tolerate a
row marked unmeasured, or `CLAUDE.md`'s rule needs the exception written into
it. That is the owner's call and this entry is where it is waiting.

## Photographing a VERSUS candidate is a guessing game

- **Found:** 2026-09-08, claude/visual-system-style-guide-rdti4j
- **Files:** `tools/director/src/versus-app.ts`, `tools/director/src/versus-one.ts`, `tools/frames/shot.ts`

`CLAUDE.md` says to send the owner a picture of a look, and `bun run shot`
photographs the director. Neither reaches a VERSUS pair reliably. A pose that
carries `cadenceSeconds` rebuilds its world on its own two-second clock, so
what is on the frame when the shot lands depends on when the browser started
and how long the bundle took — four candidate pictures this lane needed cost a
sweep of six `--wait` values each, and half of those came back as an empty
field or as a wave breaking up against the hull. The crop rectangle is guessed
the same way: `--at` is in the element's own CSS pixels, so the coordinates
were read off a PNG with `struct.unpack` and adjusted by eye, per candidate,
and again whenever the pose moved.

Both halves are one missing flag. `versus.html` already routes on its query
string (`?slot=…&name=…`) and `renderCandidate` already knows how to hold a
frame — `pair.freeze()` is what a `screenshot` candidate calls, and unlike
`setRunning(false)` it leaves no `hud.ts` "PAUSED" caption. Add
`&freeze=<seconds>` to that route: the page steps to that point and stops, so
one `bun run shot` at any `--wait` past the settle gives the same picture
every time, and the value can be chosen from what the pose actually does
rather than from what the browser happened to be doing.

Worth a second flag beside it, since the same sweep paid for it twice:
`&only=candidate` or `&only=current`, so a picture can be one side at true
size instead of a strip of both cropped down to nothing.

`tools/director/test/versus-freeze.test.ts` is the guard — the route parses,
an unknown value falls through to the running pair rather than to a blank
page, and a frozen pair is byte-identical across two builds of the same world.

**Paid again on 2026-09-08, and worse, by the same lane.** `creature:dart` is
an event-shaped slot: the thrust burns for one beat out of a two-second
replay, so roughly two frames in three have nothing on them to judge. Finding
one cost about thirty-five shots swept across `--wait` and then **ranked by
PNG file size**, on the reasoning that the frame with a flame on it compresses
worst. That worked and it is not a technique anybody should have to invent
twice.

There is a second lever already on the page and it is out of reach. The pair's
own rate picker at 0.25× stretches that one beat past the whole replay window,
so *every* frame would carry the flame and no freeze route would be needed for
this case at all — but it is a `<select>`, and `bun run shot` can press a
button (`--click`), fill an input (`--type`, which is `locator.fill` and
throws on a select) and nothing else. The flag is one line of
`locator.selectOption`; what stops it is that `tools/frames/shot.ts` is at 249
lines, so it wants the split first — the seam is *reaching a state* (`--open`,
`--tab`, `--inner`, `--click`, `--type`, `--hold`) against *taking the
picture* (the locator, the crop, the write). Do that split, add `--select
<selector>=<value>`, and this entry's freeze route becomes the answer for
poses that have no rate to slow rather than the answer for all of them.

## A contour candidate cannot be measured before it is voted on

- **Found:** 2026-09-08, claude/visual-system-style-guide-rdti4j
- **Files:** `tools/shape-sheet/src/drafts/index.ts`, `tools/versus/variant.ts`, `tools/shape-sheet/src/nameability.ts`

`creature:slick` / `pinch` and `creature:bulb` / `six` patch a
`CreatureSilhouette`, and the two questions this repo insists on about a
silhouette cannot be asked of either of them. `bun run shapes:report` prints
geometry for the records in `packages/content`, and a candidate is not one —
it is a set of fields held for the length of one `draw()`. So *does it survive
its own drawn size* (the 20 px floor, the 11 px cliff) and *does the
nameability gate still separate it from its neighbours* are both unanswerable
until the candidate has won and been adopted, which is precisely backwards:
they are the cheap disqualifiers `docs/art-review.md` puts first, and the vote
is the expensive step they exist to save.

The mechanism for it already exists next door. `tools/shape-sheet/src/drafts/`
holds shapes that are not shipped and draws them on the sheet beside the ones
that are, which is where a *draft* contour is judged. What is missing is one
join: a `Variant` whose patched record is a `CreatureSilhouette` should be
readable as a draft, so `bun run shapes` puts it on the sheet and
`bun run shapes:report` measures it, under the candidate's own name.

Derive it rather than authoring it twice — a draft written by hand beside a
candidate is a second copy of the numbers, and the two would drift the first
time either moved. The join is a function over `VARIANTS` that keeps the
patches whose `where.file` is `packages/content/src/silhouettes.ts`, applies
each one's `fields` to a copy of its target, and hands the result back as a
draft. `tools/shape-sheet/test/` is the guard: every contour candidate open in
`tools/versus/candidates/index.ts` appears on the sheet, and a candidate whose
patched shape falls under the drawn-size floor fails there rather than at the
pair.

## `bun run perf` measures every boss round at its lead-in and never at its song

- **Found:** 2026-09-08, claude/pulse-boss-tuning-1af6df
- **Files:** `tools/perf/measure.ts`, `tools/perf/sweep-timing.ts`, `tools/perf/test/`

`measure.ts` steps a wave to its **busiest tick**, and it decides which one that
is by counting `world.creatures`. A boss round has no creatures — THE PULSE,
THE GAUGE, PINBALL, SNAKE and THE MAZE all keep their picture in `world.boss` —
so `best` never improves on tick 0, `peak.tick` stays 0, and every round in the
sweep is photographed during its count-in, before a single body is on the
screen. THE PULSE's baseline entry is 0.70 ms for exactly that reason, which is
the cost of a hull and a title and none of the round.

What to do: give the search a second measure of how busy a tick is, so a world
with a `boss` on it is stepped to the tick that round is actually drawing at.
The cheap one is the count of things the round itself holds — `boss.notes` still
falling for THE PULSE, `boss.balls` for PINBALL — but a per-kind reader is a
table that will go stale. The other option is to keep it kind-agnostic and step
a round to a fixed fraction of its own length, which is one number and wrong for
none of them. Take a fresh baseline with `bun run perf --save` afterwards, since
every round's row moves.

## `bun run port` names a director port `bun run dev:once` does not take

- **Found:** 2026-09-08, claude/frames-drive-controls-q4
- **Files:** `tools/port.ts`, `tools/dev/supervise.ts`, `tools/frames/shot.ts`

`bun run port` in a worktree answers `director 4174 http://localhost:4174`, and
`bun run dev:once` in that same worktree serves on **58200** — a port nobody
asked for and nothing predicts, because `dev:once` runs with `DIRECTOR_PORT=0`
and lets the operating system pick. Both statements are true and only one of
them is about the server that is actually running, so a session that starts
`dev:once` and then reaches for the number `bun run port` gave it gets
`curl: (7)` on three candidates in a row and concludes the server failed to
start. This one did, twice, before reading the log.

It is worse than a wrong number because of where the right one is: the port is
printed **once**, by the supervisor, on its own stdout. A session that pipes
`bun run dev:once` into anything — `| head -30`, which is the obvious way to
read a startup line without hanging on a server — gets nothing at all, so the
first attempt looked like a server that started and printed nothing and served
nothing. `bun run shot` then defaults to `--port 4174` and finds no page.

Two halves, and both are small. **Say the free-port case in `bun run port`**:
the director line should name `dev:once`'s behaviour rather than a number that
only holds for `bun run dev`, because the two commands take different ports and
the listing reads as though they take the same one. And **have `dev:once` write
its port where a second command can read it** — the marker file `preview`
already answers `/__preview` with, or a line in the tree's own scratch — so
`bun run port` can report what is running rather than what would be tried. The
proof is `bun run port` naming 58200 while a `dev:once` from the same tree is up.

## `bun run preview` stops on its own after about half a minute

- **Found:** 2026-09-08, claude/game-mouse-hover-effect
- **Files:** `apps/game/preview.ts`, `apps/game/package.json`

The agent's own server exits with code 0 roughly thirty to forty seconds after
it is started, without being asked to. This lane hit it three times in one
sitting: a picture was taken, a source file was edited, and the next request to
`http://localhost:4173/` failed to connect — `curl` gave exit 7 and the browser
reported the navigation as denied, which reads as a permission problem rather
than as nothing listening. The workaround was to start it again for every
picture, and it costs a launch and a rebuild each time.

Nothing in `CLAUDE.md` says the preview is short-lived, and the two obvious
readings are opposite: either the server is meant to hold the port until it is
stopped and something is killing it, or it is meant to be one-shot and the
usage text should say so. Find out which, and then either keep the process
alive until `preview_stop` or say plainly, in the startup line, how long it
will answer for.
