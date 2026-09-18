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

## §11.32 THE INSTAR still says its look is not built, under the look itself

- **Found:** 2026-09-18, claude/boss-implementation-e3cfff
- **Files:** `docs/spec/bosses.md`

`b4fda399` (THE INSTAR's look) pasted 419 lines into §11.32 that were *The
look* followed by a second copy of THE SCUTTLE's closing paragraph, all of
§11.31 and §11.32's own head, so the page carried two ANTIPHONs and two
INSTARs; the copy came out on 18 September 2026 with THE SCUTTLE's
rehearsal. What is left is the section's own tail, written for the first
lane: *What is not built. The look, whole — this is the first of the two
lanes*, the deferred `instarMark` hit test, the `FIELD_CONTROLS` row and the
events in the silent lists — every one of which the look landed. Rewrite
that paragraph to what is *still* not built after `b4fda399` (if anything),
and take the section out of *Still in hand* at the top of the page if it is
whole; `.claude/skills/new-boss` §5 says the section "gets *The look* and
loses *What is not built*".

## A caption has no anchor for a boss's own gauge, so it points at the hull

- **Found:** 2026-09-17, claude/boss-implementation-e3cfff
- **Files:** `packages/content/src/scene-step-types.ts`, `packages/render/src/caption-anchor.ts`, `packages/content/src/scenes/the-sinew.ts`, `packages/content/src/scenes/the-taster.ts`, `packages/content/src/scenes/the-lead.ts`, `packages/content/src/scenes/the-scuttle.ts`, `packages/content/src/scenes/the-antiphon.ts`

`SceneAnchor` names a body, a control, a handle, the hull, the radar, the
ship and the retries — nothing that is a boss's fixture. THE SINEW's film has
three pages about a number drawn on the collar round the tendon
(`render/sinew-band.ts`), and a caption anchored at the nearer handle stands
its box exactly over that collar, so the pages point at the hull instead,
which THE TASTER's two counting pages already do for the same reason: the
box lands clear, and the leader line says nothing. Add an anchor for a boss's
own point of interest — `{ at: "boss", part?: string }` answered by a
per-kind line in `caption-anchor.ts` off the boss's draw file, the way
`handle` is answered off each handle's — and move those five pages onto it.
`render/test/choir-anchor.test.ts` is the pattern for proving the anchor
lands where the fixture is drawn. THE LEAD's film (17 September 2026) is
the same shape again: eight pages about a body pacing the ridge, three of
them on the hull because nothing names the body, when the stalk
(`render/lead-draw.ts`) is what every one of them is about.
THE SCUTTLE's (18 September 2026) puts seven of thirteen on the hull for
the frame and its count (`render/scuttle-draw.ts`), and THE ANTIPHON's
(the same day) nine of twenty for the organ, the rail, the pits and the
still (`render/antiphon-draw.ts`).

## A rehearsal's frame hides what stands over row 0 of the field

- **Found:** 2026-09-17, claude/boss-implementation-e3cfff
- **Files:** `packages/render/src/guide-film.ts`, `packages/render/src/guide-scene.ts`, `packages/render/src/layout.ts`, `packages/render/src/taster-draw.ts`, `packages/render/src/gorge-draw.ts`, `packages/render/src/antiphon-draw.ts`

A film is laid out in the box less the nav bar's height (`filmLayout`), and
`computeLayout` anchors the field to the band at the bottom with a tile bound
by the width on a phone — so the field's top sits about the bar's height
higher in a page of film than in the wave, under the corner plate, whose foot
the seat draw only hands the HUD (`clearTop: GUIDE_LOOK.bandFoot`). A fixture
drawn above row 0 is drawn there and then covered: THE TASTER's crest and fan
(`tasterCrestY`, 0.42 tiles over row 0) are not in any page of its film, and
THE GORGE's sack is not in the first page of its landed one — rendered and
compared against the same waves' own frames, where both stand clear at the
top. THE THROAT's ring and anything else hung over the field will be the same
— and THE ANTIPHON's body, its organ and the navigator's rail
(`render/antiphon-draw.ts`) are, in every page of its film (18 September
2026): a frame of the twins page shows the cannon under an organ no page
draws. It is a look, so it was not changed unattended. The options: lay the film out
with a narrower stage so the tile shrinks and the field's top clears the
plate (which is close to what the owner refused on 12 September 2026, the
field short of the box); or take the plate's foot off the film's playable
height the way the bar's already is, so the field is squeezed rather than
slid; or start the film's field under the plate and let a page's caption say
what the plate covers. `render/test/guide-plate-room.test.ts` should then assert a
boss fixture over row 0 lands below the band's foot on both seats.

## THE SCOUT's second arena leaves the scout nowhere to stop

- **Found:** 2026-09-17, claude/queue-unverified-at-ce8a2324-the-scouts-arenas-were-ne
- **Files:** `packages/content/src/scout-arenas.ts`, `packages/sim/src/config-scout.ts`
- **Asks:** Widen the column's pitch, cut the hazard's touch, or say a mote here is passed and never waited on?
- **Answered:** 17 September 2026 — move the two hazards. **The answer was given against a wrong option and does not fix this**, so the `Asks:` above replaces it with the three the geometry actually allows.

Five of the second arena's six motes sit exactly one tile from a hazard's row
— motes on rows 8.5, 6.5, 4.5 and 2.5 against hazards on 7.5 and 3.5 — and a
touch reaches `scoutRadiusMilli + scoutHazardRadiusMilli`, which is 0.88 of a
tile. So a scout parked on any of the five has 0.12 of a tile of room when the
hazard sweeps underneath it, and a scout coasting on to one has none: rows are
not remapped, so those figures are the shipped ones on any field.

The first arena has 2.12 tiles of room on every mote, which is what the
difference looks like. An autopilot that points, burns and coasts cleared the
first arena eight times out of eight when it waited hazards out, and the second
none out of eight — it is caught on the approach every time, at every one of
the eight beats it was started on. That is not proof a pair cannot fly it,
because a pair crosses between sweeps rather than stopping on the mote; it is
proof that *stopping on a mote is never safe here*, which is the one thing the
arena's own comment assumes when it says the column of motes is the line a
ship takes on its own.

The options as first written were: move the five motes half a tile off the
hazards' rows; move the two hazards to rows nothing is on — 9.5 and 5.5 are
free; or cut `scoutHazardRadiusMilli` from 460. The owner picked the second on
17 September 2026, and **the second is a no-op**. The motes sit two tiles
apart, so every row between two of them is 1.0 from one of them: 9.5 is 1.0
from the motes on 10.5 and 8.5, and 5.5 is 1.0 from those on 6.5 and 4.5 —
exactly what 7.5 and 3.5 already are. The rows the hazards are on now were
already rows nothing is on. Nothing moves.

**What the geometry actually allows.** With the column on a two-tile pitch,
1.0 of separation is the most any hazard row can have, so 0.12 of a tile is the
ceiling and not the accident. Room comes from one of three places and no other:
widen the column's pitch (2.5 tiles puts a hazard 1.25 away, which is 0.37 of
room); cut `scoutHazardRadiusMilli` (300 gives 0.28, 200 gives 0.38); or leave
the geometry and change the *comment*, which is the option nobody listed — the
arena's own text already says the column is the line a ship takes and that the
timing is the whole of it, so "a mote here is passed through and never waited
on" may be the arena as designed rather than a defect in it. Arena one's 2.12
tiles are what a mote you may park on looks like; arena two may simply not have
those, on purpose. Measured by flying the shipped
arenas in `tools/probe/`; nothing here was watched, because nothing of the
round is drawn yet (`docs/spec/interludes.md`).

**This entry now also owns the second arena's clock.** Arena one's was brought
from 40 to 18 on 17 September 2026 against a measured twelve-beat flight
(`packages/content/test/scout-flight.test.ts`), and the owner's 24 for arena
two was set aside because the autopilot has never cleared arena two to measure
it — which is the geometry above. Whoever answers the `Asks:` fixes the
geometry, points the same rig at arena one's sibling, and takes the clock from
what it measures; 56 stands until then.

## Act seven has no room for another wave and no letter to put a page under

- **Found:** 2026-09-17, claude/task-queue-progress-abb7a3
- **Files:** `packages/content/src/waves/act-7c.ts`, `packages/content/src/waves/act-7d.ts`, `packages/content/src/waves/act-7e.ts`, `packages/content/src/waves.ts`
- **Asks:** When a page in the middle splits, do the later letters shift up, or do waves migrate between pages?

`act-7c.ts` is at 248 lines of 250 and `act-7d.ts` at 247. `act-7e.ts` has 98,
so act seven holds 593 lines against a budget of 750 across its three pages:
**157 lines of headroom for twenty-two waves, and the act is still growing** —
THE HIVE's look is parked in this same file and act seven is where every new
boss has landed for a week.

Shuffling does not make headroom, it moves it. The convention the pages were
built on is that a full page is cut at its *end* and the overflow takes the
next letter, which is how `7d` came off `7c` and `7e` off `7d`. That works
until the page that fills is not the last one, and `7c` is not: the overflow
belongs between `7c` and `7d` and there is no letter there. The order of the
waves is the order of the game (`waves.ts` spreads the pages in sequence), so
the new page cannot simply go on the end.

The options the answer picks between. **Shift the letters**: cut `7c`'s tail
into a new `7d` and rename the present `7d` and `7e` to `7e` and `7f`, which
keeps every page readable as a page and costs a rename each time a middle page
fills. **Migrate waves down the chain**: move `7c`'s tail to the front of `7d`
and `7d`'s tail to the front of `7e`, which needs no rename and no new file,
but moves each wave's prose to a different page's header and buys `7c` about
55 lines while leaving `7e` near 220 — it postpones rather than solves.
**Or lift the prose**: the three headers are 46, 65 and 40 lines of design
argument, and moving that to `docs/spec/` would free more than either, at the
cost of separating a wave's reasoning from its figures — which is the thing
these headers were written the way they are to avoid.

The first is the only one that gives act seven somewhere to grow. It wants
deciding before the next boss lands rather than during it.

## `names.test.ts` times out under the full check's fifteen shards

- **Found:** 2026-09-17, claude/versus-page-pod-husk-tell-1f227a
- **Files:** `apps/server/test/names.test.ts`, `apps/server/test/relay.ts`, `tools/check/shard.ts`

`bun run land` went red on shard 8 of 15: every one of the fourteen tests in
`names.test.ts` hit the 5000 ms default timeout, with a diff that touched
nothing under `apps/server`. Run alone the file passes in under a second. The
file raises a real workerd through `relay.ts` before its first test, and
under fifteen shards on one machine that raise takes longer than a test is
allowed — so the timeout is on the first `dispatchFetch`, and every test after
it inherits the wait. The lane worked around it by running `land` a second
time, which is the tax this entry exists to stop. Either give the file (and
`room.test.ts`, which raises a workerd the same way) a timeout that covers a
cold workerd under load, or have `tools/check/shard.ts` keep the two
workerd files off a shard that carries anything else.

## `versus drop` cannot run while a function is being taken by hand

- **Found:** 2026-09-17, claude/fervent-nash-e1e7ff
- **Files:** `tools/versus/decide.ts`, `tools/versus/run.ts`, `tools/versus/test/registry.test.ts`

`drop` imports the registry, which imports every candidate in the slot, before
it removes any of them. The by-hand path `adopt` prints when it refuses a
function — move the paint, rewrite the record, delete what nothing reads, then
`drop` — leaves the tree in exactly the state that import fails in: the moved
`paint.js` is gone from the candidate, and the shipped module it took from
has lost the exports the *other* candidates in the slot were composing
(`plates` out of `lost-shutters.ts`, 17 September 2026). Taking `lost:screen`
/ `shut` hit both, and ran `drop` against the shipped file restored for the
length of the command. `drop` reads nothing off a candidate but its
`sentence` and `name`, which the directory names already carry; derive the
slot's candidates from the directories the way `index` does, or `git show
HEAD:` the registry's inputs, so the by-hand sequence the tool itself
prescribes can end in the tool. A test: move a candidate's paint out, run
`drop`, expect the slot gone.

## `frames --boss` cannot reach a boss state that lives in an array

- **Found:** 2026-09-17, claude/boss-implementation-e3cfff
- **Files:** `tools/frames/boss.ts`, `tools/frames/opening.ts`, `tools/frames/test/boss-flag.test.ts`

`--boss key=value` writes scalar fields of `world.boss` and refuses arrays
and objects, by design (`boss.ts`, line 30). THE BATON's thread — every
socket but the last dark, one bead sat in the last socket, `merged` — is
three array fields, and THE UNDERTOW's breaches, THE TASTER's blades and THE
GORGE's intakes are the same shape, so the picture of a boss's late state
cannot be taken by the tool that exists to take pictures. Taking step 12's
frame (17 September 2026) meant the preview page, `window.neonSpore`, a
world built by hand in the console, a pause hold the built-in browser's tab
never lifted, and the canvas pulled out as base64. Add one of: a
`--boss-json '{...}'` flag that assigns a JSON object's fields whole, arrays
included, after the same `now` substitution; or a per-boss preset table
(`--boss-state thread`) next to `installBoss`, each preset a function of the
installed state. A test: `--boss-json '{"sockets":[1,1,0]}'` on THE BATON
writes the array and refuses a key the boss does not have.

## `hash-fixture.ts` is three times its limit and every boss adds a branch to it

- **Found:** 2026-09-17, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `packages/sim/test/hash-fixture.ts`, `packages/sim/test/hash-coverage.test.ts`

The fixture stands at 738 lines: one `BOSS_ENTRIES` entry and one `patchBoss`
branch per boss, thirty-four of each, and THE INSTAR's put a fifth screen of
them in. Every field of every branch is there so `hash-coverage` can prove a
`null` the fixture never changed, so nothing in it can go — but nothing
requires it to be one file. Split it the way `bosses-clocks.ts` was split:
`hash-fixture-bosses-a.ts` / `-b.ts` holding the entries and the patches for
their half of `BOSS_KINDS`, `hash-fixture.ts` composing the two and keeping
the world. A test: `hash-coverage.test.ts` unchanged and green, and no file
of the three over 250.

## `effects-spark-silent-boss.ts` has no room for the next boss's events

- **Found:** 2026-09-17, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `packages/render/src/effects-spark-silent-boss.ts`, `packages/render/src/effects-ingest-silent-boss-b.ts`

The spark's silent list is at 242 lines after THE INSTAR's eleven events;
the ingest list already has its `-b` page. Cut the spark list the same way
before the next boss — `effects-spark-silent-boss-b.ts` from THE HIVE on,
the first page re-exporting it — so the next lane adds a row rather than a
split. A test: the silent-list coverage test unchanged and green.

## THE CANDLE's flash beat is played at tempo, and the design asks for a third

- **Found:** 2026-09-17, claude/boss-implementation-e3cfff
- **Files:** `packages/sim/src/candle-step.ts`, `packages/sim/src/slow.ts`, `packages/sim/test/candle.test.ts`, `docs/spec/bosses.md`
- **Asks:** Should the beat a flash lands in THE CANDLE be played under THE SLOW, or left at tempo?

The design (`docs/spec/bosses-choreographed.md` §14, *THE SLOW, over
`AfterImage`*) says the beat a flash lands is played at a third rate, so the
pair gets three seconds to read a field they see for a fifth of a beat. What
shipped (`bosses.md` §11.22) holds the light for `AFTER_BEATS` instead and
never slows the clock: the after-image is what makes the fight playable, and
whether a slowed beat on top of it is drama or a stutter — a shot every beat
is a slow every beat — is a thing to be watched at tempo, not decided in a
lane. The options: **slow every flash beat**, `openSlow(world,
cfg.candleFlashSlowBeats)` from the `fire` that lit the field, one beat at
`slowRateMilli`, both screens together (`decisions.md` #33); **slow the first
flash of the fight only**, the one that shows the pair the field is still
there, and none after; or **leave it at tempo** and take the design's
paragraph out of §14 as argued. Any of the first two is a config field, a
line in the step, a receipt, and `bun run check`.

## A ledger claim naming the file it will write turns the trunk red

- **Found:** 2026-09-17, claude/boss-hints-mechanics-5b5a9f
- **Files:** `tools/test/doc-drift.test.ts`, `docs/spec/bosses-choreographed.md`

`e2c4b2c7` — a *take* commit, adding one clause to THE TASTER's ledger row —
left `main` red on `doc-drift.test.ts`, because the clause named the scene file
the claiming lane had not written yet in backticks. `docs/queue.md`'s own
preamble already states the rule that would have prevented it (*a file an entry
proposes to create is described in the body, unbackticked*), and it is stated
there only about queue entries; the boss ledger is the other place a session
routinely writes down work it is about to do, and nothing told it.

Two things to do. Say the rule where the ledger is written — the table's own
preamble in `bosses-choreographed.md` — in one sentence. And make the failure
teach it: `doc-drift.test.ts`'s message is a bare `doc → path` list, so a
session meeting it learns that a path is missing and not that a claim is
supposed to be written unbacktickedly. One extra line under the drift list,
naming the convention, is the whole fix.

The row itself was repaired in this lane's commit to get the trunk green again.

## The bosses page says nothing is in hand while THE INSTAR's look is

- **Found:** 2026-09-17, claude/boss-hints-mechanics-5b5a9f
- **Files:** `docs/spec/bosses.md`, `tools/director/src/backlog-bosses.ts`

`bosses.md`'s `## Still in hand` reads *Nothing, as of 17 September 2026*, and
the choreographed ledger's §16 row says THE INSTAR's simulation landed that day
and **the look is the next lane**. Both were written the same day by different
lanes and only one of them is right.

The cost is not the sentence, it is the director: STILL IN HAND is the first
column of the NOT BUILT YET sheet's one remaining page, and it is built by
reading the bosses under that heading (`backlog-bosses.ts`). An empty heading
renders an empty column, so the sheet currently tells a session that every look
has landed. `backlog.test.ts` exempts that group from its populated check on
purpose — an empty column is a legitimate outcome — so nothing is red.

Move THE INSTAR under `## Still in hand` with the one line the ledger already
has for it, and take it back out when its look lands.

## The boss cue's kind line has no clearance and a rehearsal draws it

- **Found:** 2026-09-17, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/boss-cue-draw.ts`,
  `packages/render/test/guide-plate-room.test.ts`, `packages/render/src/round-header.ts`

`drawBossCue` puts the kind line at `Math.max(TOP_EDGE, cue.y - halfH - KIND_GAP)`
with `TOP_EDGE = 10`, which is the top of the canvas and not the top of the
*picture*. On the field that is the HUD's own row; in a rehearsal it is the
tutorial band, which is 77 to 104 pixels deep depending on which `GUIDE_LOOK`
is voted in. A rehearsal draws the cue like anything else — `guide-seat.ts`
calls `drawBodies`, and `drawBossCue` is the last pass of it — so any boss whose
mark stands near the top of the field can put `PRESS` or `HOLD` under the band:
THE BATON's bead in the top socket, THE CANDLE's glow, THE GORGE's intakes, THE
SCUTTLE's lock at `gridTop`.

`guide-plate-room.test.ts` does not catch it. Its sweep is a filter of named
words — a round's name, the run line, THE SPLICE's clock — and the four cue
words are not in it. Nothing is red, and the collision is a frame away.

Clamp the kind line to `ViewState.clearTop` rather than to the canvas, the way
`round-header.ts` drops a round's whole block, and add `PRESS`, `HOLD`, `CARRY`
and `TURN` to the sweep's filter so the next one is caught rather than seen.

## THE HIVE cannot be won: its own rock stops the bolt that seals a breach

- **Found:** 2026-09-18, claude/boss-implementation-e3cfff
- **Files:** `packages/sim/src/hive-step.ts`, `packages/sim/src/hive-shot.ts`, `packages/sim/src/config-hive.ts`, `packages/sim/test/hive.test.ts`, `packages/content/src/waves/act-7e.ts`, `packages/render/src/hive-draw.ts`, `docs/spec/bosses.md`
- **Asks:** Is the spill the design's insect, a body in the breach's colour a bolt of that colour takes on its way down; or a rock of the fastest tier on a longer cadence of its own per breach; or a bolt of the breach's own colour that passes the breach's own spill?

The rehearsal lane found it authoring the film, and no test had: a bolt
stops at the first body in its column, a rock takes a crater from it
(`struckWithoutKilling`) and a plain `meteor` falls a tile a beat — thirteen
beats from row 0 to the shield's row — while an open breach spills one every
`hiveSpillBeats` (3). So from its first spill a breach's column is never
empty again, and `hive-shot.ts`' *a breach is sealed between its spills* is
not true at the shipped numbers: a seal is possible in the two beats between
an opening and the cadence, and never after. Worse, the cadence is one clock
for every open breach, counted from the install, and `open` runs before
`spill` on the beat — so the second site (beat 12) and the fifth (beat 36)
spill on the beat they open, and nothing can ever seal them, for any seed;
and two open breaches spill on the same beat, their rocks reach the one-column
shield (`occupiesCol(c, world.shieldCol)`) on the same beat, and the second
sinks into the hull, which fails the wave — which the twins from the fifth
opening make certain. `hive.test.ts` calls `hiveStruck` on a made bullet and
never fires one up a column, and no run goes past the first opening. The
probe: a red bolt fired on beat 7 at the seed-1 breach over column 3, spilled
on beat 6, is `hole` at row 2; fired on beat 4 it is `hiveSeal`.

The three the answer picks between. **The insect**: `spill` spawns
`livingKindForColor(colors[i])` in place of the rock — the design's own body,
shot on its way down in the colour the pilot has already said, so the seal is
two shots inside one cadence; both seats see the colour once it has spilled,
and the pilot's read is what seals a breach *before* it does. The guide's
*rocks are for the shield* goes, the shield has no part, and the look draws a
slick or a bulb it already has. **The fast rock**: `meteorFastest` (five tiles
a beat, under three beats in the column) on `hiveSpillBeats` of four or more,
each breach on its own clock from its own opening so no two reach the shield
on one beat — the rock stays the shield's and the cannon has the beat and a
half the column is empty; three dials on the director's sheet and a per-site
`spillBeat`. **The pass**: `firstAlong` lets a bolt of the breach's colour
through a rock the same breach spilled — the smallest change, and against the
owner's rule of 14 September 2026 that a shot never goes through a body.
Whichever it is, `hive.test.ts` gains a run that fires real bolts and wins the
wave, and the film — a `the-hive` scene under `packages/content/src/scenes/`
— is authored against it.

## Every boss wave says whether its boss is special or normal

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/src/wave-types.ts`, `packages/content/src/waves.ts`,
  `packages/content/src/waves/act-7d.ts`, `packages/content/src/waves/act-7e.ts`,
  `tools/director/src/rail.ts`, `tools/director/src/serialize.ts`,
  `packages/content/test/waves.test.ts`, `docs/spec/bosses.md`
- **Asks:** THE INSTAR, THE STARE and THE REPRISE — special or normal?

The owner, 18 September 2026: *I would like to see the type of boss for every
boss wave in the wave description details … only distinguish between "special"
and "normal". A special boss is one which has a unique game control set or a
unique gameplay style, different than a predefined sequence of actions and
special mechanics like THE MAZE or THE MIRROR.*

So: one authored field beside `boss` and `controls` on `Wave`, two values, shown
in the rail under SENTENCE where the control set already is (`rail.ts`), written
back out by `serialize.ts`, and held by a test that every wave with a `boss` has
one and no wave without a boss does. **Authored and not derived** — a wave with
its own `controls` is always special, and a test can hold that much, but THE MAZE
and THE MIRROR are played on `standard5` and the owner names both as special, so
the other direction is a judgement and a judgement is written down.

Thirty-three boss waves. The rule decides thirty of them:

- **Special (10)** — THE MIRROR, THE MAZE, THE GAUGE, THE FLEET, SNAKE, PINBALL,
  THE SCOUT, THE PULSE, THE SPLICE, THE WELL.
- **Normal (20)** — BULB QUEEN, THE WARDEN, THE VANE, THE CAIRN, THE DIASTOLE,
  THE BATON, THE UNDERTOW, THE THROAT, THE ORRERY, THE CANDLE, THE GORGE, THE
  CURTAIN, THE TASTER, THE SINEW, THE LEDGER, THE SURGE, THE LEAD, THE SCUTTLE,
  THE ANTIPHON, THE HIVE.

The three the rule pulls both ways, which is the ask:

- **THE INSTAR** has a control set of its own (`scene`) — special by the first
  half of the rule — and *is* a predefined sequence of actions, which the second
  half excludes. It is the archetype of the category the owner is naming, so the
  answer decides whether the tag is about the panel or about the shape of play.
- **THE STARE** is the ordinary panel and the ordinary field, and its style is
  unique in the one way that matters: one seat may not touch anything at all.
- **THE REPRISE** is the ordinary panel over a stretch of field the pair can no
  longer see. Special if hiding the field is a unique style; normal if a boss
  that changes what you can *see* rather than what you can *press* is ordinary.

## The handle bosses' own words and the boss cue become one thing

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/handle-draw.ts`, `packages/render/src/boss-cue.ts`,
  `packages/render/src/boss-cue-draw.ts`, `packages/render/src/boss-cue-read-c.ts`,
  `packages/render/test/boss-cue.test.ts`, `docs/spec/bosses-choreographed.md`

Twelve bosses carry a cue (`decisions.md` #34) and three do not: THE SINEW, THE
SURGE and THE ANTIPHON were skipped because `handle-draw.ts` already writes
`PULL`, `HOLD` and `TURN` beside each handle while it is unheld, and those words
are the verb and the kind at once. That was the right call for one lane and it is
the wrong shape to leave in the game: the pair now meets two prompt systems with
different type, different breathing and different rules about when they appear.

Make the handle's word a `BossCue` with `framed: false` — the handle already
draws its own frame — so all fifteen bosses speak in one voice, one at a time,
most urgent first. The test is the interesting part: the handle's word is drawn
while the handle is *unheld*, and a cue is silent where nothing is owed, so the
two rules have to be reconciled rather than one of them deleted.

## The rounds get a cue, one arm each

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/boss-cue.ts`, `packages/render/src/boss-cue-read.ts`,
  `packages/render/test/boss-cue.test.ts`, `docs/spec/interludes.md`

The owner wants the one-or-two-word prompt on every boss, not only the recent
ones: *add the explanations in game screen of 1-2 words, so we can get rid of
tutorial/guides.* The ten bosses with a panel of their own have none — THE GAUGE,
SNAKE, PINBALL, THE PULSE, THE WELL, THE MAZE, THE SCOUT, THE SPLICE, THE FLEET,
THE REPRISE — and they are the ones a pair meets with the least warning, because
the panel under their thumbs is new as well.

One arm on `cuesOf` each, in a fourth read file so nothing goes past 250 lines,
and the same three rules: the mark stands on something that seat is already
shown, the cue is drawn on the seat that can act, and it says the verb and never
the answer. THE MAZE's wheel and THE SPLICE's straws are the two where the verb
is easy and the *silence* is the work — both are fights whose difficulty is a
number one seat reads out.

## The act-two field bosses get a cue

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/boss-cue.ts`, `packages/render/src/boss-cue-read.ts`,
  `packages/render/test/boss-cue.test.ts`, `docs/spec/bosses.md`

The other half of the same gap: BULB QUEEN, THE WARDEN, THE VANE, THE CAIRN, THE
MIRROR and THE STARE are played on the ordinary panel and say nothing on the
field. THE WARDEN's tether and THE CAIRN's grips are the obvious arms; THE STARE
is the one worth thinking about, because the thing it wants from a seat is *not
to act*, and a cue that says `WAIT` over a seat's own controls is either the best
prompt in the game or a contradiction of "a cue is drawn on the seat that can
act". Decide it in the lane and write down which.

## A boss's states change several times, and each state asks a different gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/instar.ts`, `packages/sim/src/gorge.ts`,
  `packages/sim/src/gorge-step.ts`, `packages/sim/src/config-gorge.ts`,
  `docs/spec/bosses-choreographed.md`, `.claude/skills/new-boss/SKILL.md`

The owner, 18 September 2026: *bosses' states should change several times between
the different gestures, and have tasks to do some additional gestures on the game
screen.* The recently added field bosses mostly ask for **one** gesture, repeated
until a count is reached — THE GORGE is four beads and a pierce, THE TASTER is
shear and shear, THE DIASTOLE is a beam held twice. THE INSTAR is the shape the
owner is asking for and it is the only one that has it: five poses, a different
gesture set in each, and the body changing between them.

This lane decides the pattern and spends it on one boss. The question it answers:
can a field boss take `BossSequenceStep` — a pose, its marks, its three clocks —
without becoming THE INSTAR, i.e. while the field still falls and the panel is
still the panel? THE GORGE is the one to try it on: it already has three phases
and a gorged state nobody does anything with, so a second gesture there costs no
new mechanic. The two options the lane picks between are naming the states in the
boss's own state (a `phase` per gesture, the way `undertow` does) and lifting
`BossSequenceStep` out of `instar.ts` so any boss can carry a beat list.

## The recent bosses gain a gesture that is not on the panel

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/drag-targets.ts`, `packages/render/src/touch-hold.ts`,
  `packages/net/src/command-fields.ts`, `packages/content/src/control-sets.ts`,
  `docs/spec/bosses-choreographed.md`

The second half of the same ask: *additional gestures on the game screen.* Of the
twelve bosses that landed in the last three days, nine are answered entirely with
the cannon, the plate and the two triggers — THE CANDLE, THE GORGE, THE TASTER,
THE BATON, THE LEDGER, THE LEAD, THE SCUTTLE, THE DIASTOLE, THE ORRERY. The three
that reach for the field (THE CURTAIN's shove, THE THROAT's fling, THE UNDERTOW's
maw) are the ones the cue had most to say about, which is not a coincidence.

Give each of the nine one gesture on the picture itself. Every one has to be a
member of `DragTarget` or `Hold["kind"]` or it does not exist (filter 9), and the
wire **drops a target it does not list, silently**, so `command-fields.ts` and the
codec test are part of the lane rather than a follow-up. Do two bosses, not nine,
and leave the rest as a row each here.

## The twelve recent bosses, looked at against THE INSTAR

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `.claude/skills/new-boss/SKILL.md`, `docs/spec/bosses.md`,
  `packages/render/src/instar-draw.ts`, `packages/render/src/instar-poses.ts`

The owner asked for a graphics task per recent boss, with THE INSTAR as the
reference: *tasks for every new boss to improve the graphics, which fit what was
built.* The standard is now written down in five points in
`.claude/skills/new-boss` §5 — a body rather than a fixture, a pose per state and
a blend between them, a change of perspective, a picture deformed by how far the
answer is along, and the mark saying its own gesture.

**This lane is the survey, not the drawing.** Take one PNG of each of the twelve —
THE CANDLE, THE GORGE, THE CURTAIN, THE TASTER, THE UNDERTOW, THE BATON, THE
THROAT, THE LEDGER, THE LEAD, THE SCUTTLE, THE DIASTOLE, THE ORRERY — in the
state that matters rather than the first one (`bun run frames . --wave "X"
--boss …`), read each against the five points, and leave **one entry here per
boss** naming what its picture is missing and which file draws it. Twelve look
lanes cannot be written honestly without twelve pictures, and taking twelve
pictures is a sitting of its own. A look lane that follows one of those entries
lands under *a look the owner asked for by name* and says so in the commit.

## One boss loses its rehearsal, and the fight is asked to teach it

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/src/waves/act-7c.ts`, `packages/content/src/scenes.ts`,
  `packages/content/src/scenes/the-baton.ts`, `packages/content/test/scenes-prose.test.ts`,
  `docs/spec/briefings.md`

*Add the explanations in game screen of 1-2 words, so we can get rid of
tutorial/guides.* That is a direction and not yet a change, and the honest first
step is one boss, measured. THE BATON is the one to try: its rehearsal is seven
pages, four of them about the colour and the lockout, and its two cues (`LAUNCH`
on the bead in its socket, `FIRE` on the bead in the air) cover the whole loop.

Take its `scene` off the guide, put THE BATON on `STILL_PROSE`, and play it. What
the lane has to come back with is which of the seven pages the fight could not
replace — the colour that flips on every landing and the beat the acting seat is
greyed out are the two candidates — because those are the ones that say what a
guide is still for. **The prose halves stay either way**: the owner decided on 17
September 2026 that a filmed wave keeps its three lines as the director's own
reference (`wave-types.ts`), so this is about the film and the ready gate.

## Four bosses are listed as having no look, and they have one

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/test/scenes-prose.test.ts`,
  `packages/render/src/lead-draw.ts`, `packages/render/src/scuttle-draw.ts`,
  `packages/render/src/orrery-draw.ts`, `packages/render/src/surge-draw.ts`

`STILL_PROSE` carries a reason per wave, and four of them say the look has not
landed: THE LEAD *owed by the lane that draws the body*, THE SCUTTLE *owed by the
lane that draws the frame*, THE ORRERY *until the rings are drawn there is nothing
to shoot it against*, THE SURGE *none of which is drawn yet*. All four have draw
files and all four are drawn. The test passes because it only asserts that those
waves carry no film — the reasons are prose, and prose no test reads goes stale
in three days.

Rewrite the four reasons to say what is actually left, which on each of them is a
film nobody has written rather than a body nobody has drawn — and read that
against the entry above it, because a boss whose fight now says its own verbs may
be a boss that should never get a film at all.
