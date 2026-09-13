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

## THE WEIGHT's guide is prose, and its lesson is a negative

- **Found:** 2026-09-12, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/waves/act-8.ts`, `packages/content/src/scene-types.ts`

The wave that introduces THE WEIGHT carries a three-line prose guide and no
`scene`, so the pair reads two pages and meets the body cold. That is how sixteen
guides shipped and it is worse here than for most of them, because the lesson is
**a negative**: a thumb held alone looks exactly like two thumbs held together,
and prose has to assert that where a rehearsal could show it. The wave is written
to teach it by costing a retry (`act-8.ts`, the first entry stands alone on
purpose), which works and is a slow way to learn one sentence.

What a rehearsal would show, in the order the guide's pages already go: one sac
and one ghost thumb, and nothing happens; the same sac and both ghost thumbs a
beat apart, and nothing happens; both on the same beat, and the calipers close.
Three pages, no new machinery — `scenes.ts` holds the choreography and
`queueFromWave` already puts a rehearsal's arrivals through the same column
remap as a wave's. `.claude/skills/new-tutorial` has the rules the owner has
already corrected twice; `bun test packages/content` and the guide-page tests
prove it.

## THE CAIRN's guide is prose, and the gesture it asks for has never been shown

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/waves/act-8.ts`, `packages/content/src/scene-types.ts`

The wave that introduces THE CAIRN carries a three-line prose guide and no
`scene`, the way THE WEIGHT's does and for the same reason — the rehearsal was
the half that did not fit in the lane. It is worse here in one specific way: the
answer to this boss is *a hand carried sideways*, a gesture the game has taught
only on a falling rock, and prose has to say "drag a thumb across it" where a
rehearsal could show a thumb moving and a rock coming away.

What a rehearsal would show, in three pages: the pile with a ghost thumb resting
on it and nothing happening, because a still finger is worth nothing here; the
thumb carried right, and one rock leaving the right of the pile; the same rock
falling and a dome sliding under it, which is the sentence the whole fight is
about. No new machinery — `scenes.ts` holds the choreography and `scene-drag.ts`
already animates a carried hand for THE PUSH. `.claude/skills/new-tutorial` has
the rules the owner has already corrected twice; `bun test packages/content` and
the guide-page tests prove it.

## The shape sheet's CAIRN card and the field's pile are stacked differently

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `tools/shape-sheet/src/forms/pile.ts`, `tools/shape-sheet/src/drafts/collected.ts`, `packages/render/src/cairn.ts`

The card draws seven units three, three and one — `courses()` in `pile.ts`
derives that from the count — and the field draws them four, two and one,
because four across the base is what fills the five columns the pile stands in
(`CAIRN_COLS`, and `span.ts` says why the span came out at five). So the picture
the owner judged the silhouette from is not the silhouette the game draws, which
is exactly what the shape sheet exists to prevent.

Two ways to close it and they cost about the same. Either `courses()` takes the
arrangement as an option and `collected.ts` passes `[4, 2, 1]`, which makes the
card the field's own stack; or `render/cairn.ts` reads its courses from a shared
table the card also reads, which is the stronger version and needs a home for
the table — `packages/content` is where the other shared geometry lives.
`bun run shapes:report` and `packages/render/test/cairn-frame.test.ts` prove
whichever is done.

## THE WELL draws none of the field's transients but a kill's burst

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/render/src/well-draw.ts`, `packages/render/src/effects.ts`, `packages/render/src/effects-frame.ts`, `packages/render/src/creature-place.ts`

The well replaces the field's two passes, so everything `Effects` draws is
skipped on that screen except `sparks`, which is ingested through
`wellFromFlat` and drawn by hand at the end of `drawWellBodies`. A crater, a
scar, a body's afterglow, a grip's ring, THE CRAWLER's goo and the rest are
simply absent there. A well wave of living bodies produces none of them, which
is why the wave was authored out of slicks and bulbs — but the next well wave
somebody writes with a rock in it gets a landing with no impact.

Two halves, and `wellFromFlat` is the tool for the first: every transient whose
position is a pixel computed at ingest (`burstFor`'s table, `crawler.splash`,
`spriteBursts`) can be mapped with one call each, the way the burst already is.
The second half is the ones drawn *around a creature the world still holds* —
`bodies.drawOnBodies`, the grip ring, `lock-mark.ts` — which all ask
`creatureCenter`, and that function takes no world and cannot know the well is
up. The honest fix there is for `creatureCenter` to take the projection rather
than assume it, which is a signature change across about thirty call sites and
wants a lane of its own. `packages/render/test/well-frame.test.ts` is where the
proof goes.

## A crossing rock has no blip on THE WELL's rim

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/render/src/well-draw.ts`, `packages/render/src/radar-blip.ts`

`drawWellArrivals` bends the warning strip into a ring outside the rim and skips
every blip carrying a `cross`: a rock that comes over a side wall has no column
at all, and the flat picture for one is drawn *inside* the field, against the
wall it will come over, pointing the way it will fly (`radar-blip.ts` says why).
The circle has no wall and no equivalent yet, so a well wave with a crossing
rock in it warns the pilot about nothing.

What it probably wants is the mark placed on the rim at the *row* it will hold —
which in the well is a radius rather than a height — pointing along the ring
rather than across the field. That is a picture decision rather than a
mechanical one, so it wants an eye on it; `bun run frames . --wave "THE WELL"`
is how to look.

## THE WELL's screen answers no finger on the field

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/render/src/touch.ts`, `packages/render/src/touch-ship.ts`, `packages/render/src/creature-place.ts`, `packages/render/src/touch-field.ts`

`touchDown` returns null above the band whenever `Field.well` is set. Every hit
test under that line is a circle cut out of the flat field — the hull's two
lobes along the bottom, a body in its column — and on the well's screen the hull
is a ring at the middle and the bodies are round it, so answering any of them
would be answering a control where it is not drawn, which is the one thing that
file exists to prevent. The rails and the buttons are untouched, so nothing is
unreachable, and a well wave of living bodies takes no hand at all
(`handMeans`) — but the refusal is wider than it has to be.

What it needs is the polar version of two circles: `cannonGrab`/`shieldGrab` at
`wellPlace(l, col, hullRow)` instead of on the hull line, and `creatureAt`
measuring from `wellPlace` rather than `creatureCenter`. The drag is the part
worth thinking about — carrying a thumb *around* a ring is not the same gesture
as carrying it across a strip, and the seam is a wall the drag has to refuse to
cross. `packages/render/test/touch.test.ts` holds the shape of the proof.

## THE WELL's guide is prose, and the picture it describes has never been shown

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/waves/act-8.ts`, `packages/content/src/scene-types.ts`

The third wave in a row to land with a three-line prose guide and no `scene`
(THE WEIGHT's and THE CAIRN's are above). It is the worst of the three to leave
as prose, because what has to be understood is a *picture* — the pilot has to
read "the field, turned inside out" and believe it before the first body falls,
and a rehearsal could simply show the flat field folding into the clock.

Two pages would do it: the field as both seats know it with a body falling down
column four, then the same field drawn round with the same body at four o'clock
and the seam standing above the ship. No new machinery if the scene can hold two
still pictures side by side; `.claude/skills/new-tutorial` has the rules the
owner has already corrected twice, and `bun test packages/content` proves the
pages.

## Should THE WELL's seam cost travel?

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/sim/src/commands.ts`, `packages/sim/src/config-boss.ts`, `packages/render/src/well.ts`
- **Asks:** Should the cannon be limited to a few columns a beat while THE WELL is installed, so that the seam costs travel as well as reading?

THE WELL is built as a pure projection: nothing in the simulation changes
(`bosses 11.12`). That leaves the seam — the sector above the ship where the
field's two walls meet — costing the pair a **thumb and a glance** and nothing
else, because `cannonCol` names a column outright and the cannon is there on the
next tick. Eleven o'clock and one o'clock look like neighbours and are the two
ends of the rail, which is a thing to learn once; it is not a thing the fight
keeps charging for.

Three answers, and they are different games. **Leave it** — the boss is a
picture and is honest about it, and the wave is carried by the ordinary bodies
under it. **A step limit under this boss only**: a `wellStepCols` in
`config-boss.ts` clamping how far `cannonCol` may move in one beat, so crossing
the field takes beats and the seam is a real distance; it is a rule that exists
on one wave, which this game has so far refused to do. **A step limit
everywhere**, which is a change to the whole control scheme and would want its
own argument — the rail is the one control that has never had a speed.

## THE CAIRN paints at two and a half times the run's median

- **Found:** 2026-09-13, watch-cloud-waves
- **Files:** `packages/render/src/cairn.ts`, `packages/render/src/meteor.ts`, `packages/render/src/meteor-blaze.ts`, `packages/render/test/wave-budget.test.ts`

The first measurement of the four waves the cloud session landed, taken three
times on 13 September with `bun run perf --wave 66,67,68,69`: THE WEIGHT, THE
CODEX and THE WELL sit at or under the run's median, and **THE CAIRN paints at
11–12 ms typical, 13–15 ms at the ninetieth percentile — 2.5× the median and
up to 90% of a 60 Hz frame** on the owner's Windows machine, with the game's
dearest waves at 6.4–7.1 ms in the last full sweep. Every run was flagged (THE
WALL moved against the baseline of 9 September, so no absolute figure was
saved and the four rows stay unmeasured); the *share* held across all three.

The pile is seven `drawRockBody` calls under one clip every frame, each with
its look's fire (`meteor-blaze.ts`: a plume behind and a fire in front, per
stone), for a body that never moves and changes only when a unit leaves. Do it
by `.claude/skills/render-perf`: measure the pile alone with the stub's tally,
then bake the standing stack once per `units` into an offscreen sprite and
redraw the fire only — or cheapen the per-stone fire — and prove both halves
with a number. Give it a row in `wave-budget.test.ts` while there.
