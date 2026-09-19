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
worktree, does the item, removes the entry with `bun run queue done "<title>"`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

**The trunk comes up before each item, not once at the top of the sitting.**
The owner, 18 September 2026, on a session that drained five in a row: *before
starting a new task from queue, make sure to be up to date from main.*
`git fetch origin main && git merge --ff-only origin/main`, then
`git merge --ff-only main` in the lane, between one `queue done` and the next
`take`. It is not the same rule as `CLAUDE.md`'s *bring the trunk up before you
start*, which is about a lane: a sitting that drains several items lasts hours,
and in that time other lanes land. Three entries in one morning were read
against a tree that had moved — one was a third stale before it was claimed,
one had its files rewritten under a landing that was already checking, and both
cost more than the fetch would have.

**A number is for reading, not for removing.** `take` and `release` accept the
position a listing printed, because both can be given straight back. `done`
does not: a removal off a stale position is the one mistake nothing in the tree
records, and on 19 September 2026 it deleted a free entry nobody had worked and
exited zero. What made the number stale was this file's own first rule — the
lane had written its finding in above the item it was closing, as it is
required to. So the two rules are settled in the tool: `done` takes the title,
prints what the number *would* have been on, and removes nothing until somebody
has said the words (`tools/queue/claim.ts`, `refuseNumbered`).

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

```## One line saying what to change

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
(`tools/queue/where.ts`). Without the line an entry is anybody's.

**The list was dealt on 18 September 2026**, the day he left for two days of
working it from a phone, and nearly every entry carries a line now. The per-boss
families went first: the words (`.claude/skills/new-boss` section 6.1) and the
states (6.2) to a cloud session, the pictures (6.3) kept local for an eye. The
rest were dealt on the same test — **can a session with no screen prove it with
`bun test` and the typecheck?** So the refactors, the file-ceiling splits, the
test timeouts and THE GAUGE's missing events are `cloud`; a catch that washes a
panel, sixteen films that put a page on the hull, a frame tool that cannot reach
a boss and a pose missing from the gallery are `local`. What is left unmarked is
the handful that `ASKS THE OWNER`: nobody's machine is the thing they are
waiting on.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim;
`tools/queue/test/where.test.ts` holds the reservation.

## The phone's back gesture leaves the game instead of asking

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/shell.ts`, `apps/game/src/menu.ts`, `apps/game/src/menu-door.ts`, `apps/game/src/menu-parts.ts`, `apps/game/src/confirm.ts`, `apps/game/src/sign-in.ts`
- **Where:** local
- **Asks:** Should back open the menu the game already has, or a three-button question of its own over the field?

The owner, 18 September 2026: *"When in game (no director) website I press back
button, It should not go back to previous website, but open as if menu button
was pressed, so it should ask: do you want to go back to menu or quit game, or
continue playing."*

**There is no `popstate` listener anywhere in `apps/game/src`.** The only thing
the app does with history at all is `sign-in.ts`'s `history.replaceState(null,
"", location.pathname)`, which scrubs the sign-in's query off the address and
deliberately adds no entry. So the back gesture on the field is the browser
leaving the page, mid-run, with the room still open on the other phone — and on
a phone the gesture is an edge swipe, which is to say it is easy to do by
accident while both thumbs are on the glass.

The work is one history entry pushed when the field opens and a listener that
answers it by re-pushing and showing something, and it is small. What it waits
on is **what it shows**, because the two readings of the sentence above are
different screens:

- **The menu, as if `#gear` had been pressed.** It is already the three answers
  the owner names: closing it is *continue*, its own rows are *menu*, and QUIT
  is one of them. Nothing new is drawn, and `menu-door.ts` already knows how a
  menu opens over a field. Back while the menu is *up* then pops one page of it
  — `menu-parts.ts`'s `backButton` is the same move — and back from its root
  closes it, which is a gesture that reads correctly all the way down.
- **A question of its own over the field**, three buttons, the way he wrote it.
  This is the more literal reading and it is the one `confirm.ts` argues
  against in its own doc — *"A dialog is an overlay to dismiss, it steals the
  back gesture"* — which is written about a different control but lands exactly
  here: a dialog that the back gesture opened cannot also be a dialog the back
  gesture closes without a second entry to burn.

The first is recommended for that reason, and because the second builds a
screen the game already has under another name. Either way `sign-in.ts`'s
`replaceState` stays a replace: pushing there would put a sign-in nobody can
return to in the stack.

## No guide page says which wave it is, and the gap before it is empty

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `packages/render/src/wave-intro.ts`, `packages/render/src/ready-page.ts`, `packages/render/src/guide-switch.ts`, `packages/render/src/briefing.ts`, `packages/render/src/text-drop.ts`, `packages/sim/src/wave-end.ts`, `packages/render/test/frame.test.ts`
- **Where:** local

The owner, 18 September 2026: *"On every wave guide/tutorial page, inside or
somewhere else on s reen, I already want also to see the wave number and wave
name with a nice animation, e.g. flying in like falling from perspective of user
down. Right now when a wave is finished to the moment it switches to next wave
and starts tutorial/guide (if one exists) is very boring, so make sure we have
some nice fancy success screen if a wave is finished and the tutorial for new
wave is introduced as something to be excited - so player is thrilled to watch
the tutorial and understand before staring to play it."*

**This is a look, and it is two of them.** Neither may go straight onto the
field: a lane that takes either says in its commit which exemption it used, and
*no shipped alternative* is the honest one for both — there is no wave name on a
guide page today and no screen at all between waves. Anything drawn is drawn
again in `frame.test.ts`, and anything that outlives a frame is `Effects`.

**The number and the name on every page.** They are already drawn, once: the
*last* page of a stepped guide is the wave's own name over the field
(`ready-page.ts` calling `drawIntroduction`), and the entrance he is describing
is already written and already approved — `text-drop.ts`, a line falling
stretched by its own speed, landing, flattening once, over in six tenths of a
second, with the owner's condition attached in his own emphasis that **the text
must be well readable**. So the work is not an animation, it is a header: where
it stands on a page that is mostly film and plate (`guide-switch.ts` owns the
corner plate's words and is the file that argues about them), and whether it
drops again on every page turn or only the first time the guide comes up.
Dropping on every turn is the thing to be careful about — `guide-play.ts` gave
up its looping film for exactly this reason, that movement at the edge of the
eye while you are reading is the reader never choosing the moment.

**The screen between the waves.** `wave-end.ts` starts a rest of `waveRestBeats`
on the beat the field goes clear, and nothing is drawn over it: the pair watches
an empty field until the host answers `needWave`. The state is already the
world's — `restBeat`, no new field, nothing to add to `hashWorld` — so a screen
can be drawn from it the way the lost screen is drawn from `failTick`. What it
should *be* is the part worth a sheet before it is worth code: the wave just
cleared, what it cost (the run keeps time and retries, not a score), and the
hand-off into the next wave's guide as one movement rather than two screens.

Two lanes, and they land separately: the guide header first, since it is a
header over drawings that exist, and the success screen second, as a
`docs/spec/` sheet and then a build.

## A cue standing on the hull line has its verb drawn under the ship

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/boss-cue-read.ts`, `packages/render/src/boss-cue-read-b.ts`, `packages/render/src/boss-cue-read-e.ts`, `packages/render/src/boss-cue-text.ts`, `packages/render/src/frame-field.ts`
- **Where:** local

`drawBossCue` runs in the **field** pass (`frame-field.ts`), and the ship is
drawn after it. `drawCueText` hangs the verb `halfH + 18` below the mark's
centre, so every cue whose mark stands at `l.hullY` has its lower two corners
and the whole of its word painted over by the plating: THE CANDLE's `CARRY` /
`MOVE` on the cannon, THE UNDERTOW's two `MOVE`s and THE MAZE's `MOVE`. Seen in
a real frame of THE WARDEN, whose handle mark had the same problem and was
lifted out of it with a constant of its own (`HULL_LIFT`,
`boss-cue-read-f.ts`) — which is a third place doing the arithmetic rather than
a fix.

The choice is between a floor of the same shape as `boss-cue-text.ts`'s
`headerTop` ceiling — the verb climbs above the mark when there is no room
under it, which moves the op-count rows of the three bosses above — and moving
the cue's draw out of the field pass to after the ship, which is one line in
`frame-field.ts` and changes what a cue can be drawn *over*. The second is
smaller and the first is what the file already argues for upward; either way
one frame per boss is the proof, and `render/test/frame-budget.test.ts` is
where the cost lands.

## THE SCOUT's second arena leaves the scout nowhere to stop

- **Found:** 2026-09-17, claude/queue-unverified-at-ce8a2324-the-scouts-arenas-were-ne
- **Taken:** 2026-09-18, claude/queue-the-scouts-second-arena-leaves-the-scout-nowhere
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

The rehearsal (`content/src/scenes/the-scout.ts`, 18 September 2026) is the
same finding a third way: its legs were searched for — every wait up to
seven beats and every burn from eight to forty-eight ticks — and the search
banked three of the column (rows 10.5, 9.5, 8.5) and found no leg at all to
the fourth, on the hazard's own row 7.5, that did not end in the hazard
within seventy ticks. The film ends with the three banked and the fourth
left hanging.

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

The director's STATES sheet owes the same answer: the BOSSES category's
hand on THE HIVE (`tools/director/src/boss-hands-field.ts` `hiveHand`,
18 September 2026) takes the first open breach whose column is clear of
rocks and seals six of the nine at the shipped seed — the three that spilled
before a bolt could reach them stay open for good — so `hive: ["down"]` is
the one allowance left in `tools/director/test/boss-states.test.ts`'s
`OWED` for a field boss, struck the commit the answer lands.

## THE FLEET's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/fleet-chart.ts`, `packages/render/src/fleet-clock.ts`, `packages/render/src/fleet-fx.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

8 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE VANE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/vane-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

1 file draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## SNAKE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/snake-body.ts`, `packages/render/src/snake-crash.ts`, `packages/render/src/snake-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

13 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## PINBALL's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/pinball-aim.ts`, `packages/render/src/pinball-blast.ts`, `packages/render/src/pinball-button.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SCOUT's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/scout-button.ts`, `packages/render/src/scout-draw.ts`, `packages/render/src/scout-round.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE PULSE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/pulse-body.ts`, `packages/render/src/pulse-button.ts`, `packages/render/src/pulse-drop.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

9 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE DIASTOLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/diastole-bridge.ts`, `packages/render/src/diastole-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE BATON's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/baton-bead-draw.ts`, `packages/render/src/baton-draw.ts`, `packages/render/src/baton-socket-draw.ts`, `packages/render/src/baton-grip.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state. Two of those states arrived on 18 September 2026 with
the §6.2 lane and were drawn by a session with no eye: a swelling socket is the
husk grown half again and shaking, and the two handle rings are the shipped
ones. Both want the same look pass as the rest of the arm.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE UNDERTOW changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-18, claude/queue-the-undertow-changes-state-more-than-once-and-as
- **Files:** `packages/sim/src/config-undertow.ts`, `packages/sim/src/events-undertow.ts`, `packages/sim/src/undertow-hash.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE UNDERTOW's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/undertow-draw.ts`, `packages/render/src/undertow-fx.ts`, `packages/render/src/undertow-lobe.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE THROAT's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/throat-draw.ts`, `packages/render/src/throat-evert.ts`, `packages/render/src/throat-lock.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE ORRERY's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/orrery-draw.ts`, `packages/render/src/orrery-grab.ts`, `packages/render/src/orrery-shaft.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE CANDLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/candle-dark.ts`, `packages/render/src/candle-glow.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE GORGE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/gorge-draw.ts`, `packages/render/src/gorge-fx.ts`, `packages/render/src/gorge-lobe.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE CURTAIN's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/curtain-draw.ts`, `packages/render/src/curtain-fx.ts`, `packages/render/src/curtain-sheet.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE TASTER's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/taster-blade.ts`, `packages/render/src/taster-crest.ts`, `packages/render/src/taster-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SINEW changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-19, claude/queue-the-sinew-changes-state-more-than-once-and-asks
- **Files:** `packages/sim/src/config-sinew.ts`, `packages/sim/src/events-sinew.ts`, `packages/sim/src/sinew-hand.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE SINEW's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/sinew-band.ts`, `packages/render/src/sinew-draw.ts`, `packages/render/src/sinew-fibres.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE LEDGER changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-19, claude/queue-the-ledger-changes-state-more-than-once-and-asks
- **Files:** `packages/sim/src/config-ledger.ts`, `packages/sim/src/events-ledger.ts`, `packages/sim/src/ledger-bead.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 7 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE LEDGER's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/ledger-cord.ts`, `packages/render/src/ledger-draw.ts`, `packages/render/src/ledger-fx.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SURGE changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/config-surge.ts`, `packages/sim/src/events-surge.ts`, `packages/sim/src/surge-hand.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 7 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE SURGE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/surge-draw.ts`, `packages/render/src/surge-fx.ts`, `packages/render/src/surge-gauge.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE LEAD changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/config-lead.ts`, `packages/sim/src/events-lead.ts`, `packages/sim/src/lead-hash.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE LEAD's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/lead-draw.ts`, `packages/render/src/lead-fx.ts`, `packages/render/src/lead-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SCUTTLE changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/config-scuttle.ts`, `packages/sim/src/events-scuttle.ts`, `packages/sim/src/scuttle-hash.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE SCUTTLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/scuttle-draw.ts`, `packages/render/src/scuttle-fx.ts`, `packages/render/src/scuttle-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE ANTIPHON: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-19, claude/queue-the-antiphon-the-field-says-the-word-and-the-bri
- **Files:** `packages/content/src/waves/act-7e.ts`, `packages/content/src/scenes/the-antiphon.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

It says nothing on the field at all.
Its briefing is a 20-page rehearsal (`packages/content/src/scenes/the-antiphon.ts`).

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE ANTIPHON changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/antiphon-hand.ts`, `packages/sim/src/antiphon-hash.ts`, `packages/sim/src/antiphon-rail.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 8 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE ANTIPHON's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/antiphon-draw.ts`, `packages/render/src/antiphon-fx.ts`, `packages/render/src/antiphon-grip.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE HIVE: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/src/waves/act-7e.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

It says nothing on the field at all.
It has no rehearsal, only the three prose lines.

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE HIVE changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/config-hive.ts`, `packages/sim/src/events-hive.ts`, `packages/sim/src/hive-hash.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 6 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE HIVE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/hive-draw.ts`, `packages/render/src/hive-fx.ts`, `packages/render/src/hive-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE INSTAR: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/src/waves/act-7e.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

Its marks already carry a word in a scanner box
(`packages/render/src/instar-word.ts`), written before the cue was
generalised — so this lane's work is making the two one thing.
It has no rehearsal, only the three prose lines.

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE CAIRN: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-19, claude/queue-the-cairn-the-field-says-the-word-and-the-briefi
- **Files:** `packages/content/src/waves/act-8.ts`, `packages/content/src/scenes/the-cairn.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

It says nothing on the field at all.
Its briefing is a 5-page rehearsal (`packages/content/src/scenes/the-cairn.ts`).

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE CAIRN changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/cairn.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 1 file of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE CAIRN's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/cairn-hand.ts`, `packages/render/src/cairn-look.ts`, `packages/render/src/cairn-pile.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE WELL: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/src/waves/act-8.ts`, `packages/content/src/scenes/the-well.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

It says nothing on the field at all.
Its briefing is a 4-page rehearsal (`packages/content/src/scenes/the-well.ts`).

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE WELL changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/well.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 1 file of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE WELL's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/well-arrivals.ts`, `packages/render/src/well-body.ts`, `packages/render/src/well-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SPLICE: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-19, claude/queue-the-splice-the-field-says-the-word-and-the-brief
- **Files:** `packages/content/src/waves/act-9.ts`, `packages/content/src/scenes/the-splice.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

It says nothing on the field at all.
Its briefing is a 4-page rehearsal (`packages/content/src/scenes/the-splice.ts`).

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE SPLICE changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/events-splice.ts`, `packages/sim/src/splice-hash.ts`, `packages/sim/src/splice-round.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on its own panel (`splice`), over 5 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE SPLICE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/splice-draw.ts`, `packages/render/src/splice-straws.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE REPRISE: the field says the word, and the briefing comes down

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/content/src/waves/act-10.ts`, `packages/render/src/boss-cue.ts`, `packages/content/test/scenes-prose.test.ts`
- **Where:** cloud

It says nothing on the field at all.
It has no rehearsal, only the three prose lines.

The owner, 18 September 2026: a boss's words are cloud work — the cue table and
the prose tests prove them, and no frame has to be watched. The PNG is the one
unverified part; queue it with `bun run land --unverified`.

The brief, written once so it can be corrected once: `.claude/skills/new-boss`
section 6.1.

## THE REPRISE changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/reprise-state.ts`, `packages/sim/src/reprise.ts`, `packages/sim/src/instar.ts`, `packages/net/src/command-fields.ts`
- **Where:** cloud

It is answered today on the ordinary panel, over 2 files of simulation. Give it
several states, a different gesture in each, and at least one of them reached on
the picture rather than on the panel.

The owner, 18 September 2026: a boss's words and its states are cloud work —
`bun test` and the typecheck prove them, and the handle's ring is the one every
shipped boss draws. The PNG is the one unverified part; queue it with `bun run
land --unverified`.

The brief: `.claude/skills/new-boss` section 6.2.

## THE REPRISE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/reprise-draw.ts`, `packages/render/src/reprise-fx.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE STARE's catch washes the whole panel, and the design says the button

- **Found:** 2026-09-18, claude/boss-implementation-e3cfff
- **Files:** `packages/render/src/stare-fx.ts`, `packages/render/src/band-lobes.ts`, `packages/sim/src/events-stare.ts`, `packages/render/test/stare-frame.test.ts`
- **Where:** local

`stareCaught` names the command's `kind` (`cannonCol`, `guard`, `fire`, …) and
the look washes the caught seat's panel red from the band's top down, because
nothing in `render/` maps a command kind to the lobe that sends it: `bandLobes`
returns each lobe with its `ControlDef`, and a `ControlDef` names a control,
not the command kinds it emits. Writing that map in `stare-fx.ts` would be a
second copy of the band's plan. Either give `ControlDef` (or the lobe) the
kinds it sends, so the fx can find the circle by the event's `kind` and flash
it alone — the design's *flash on the button somebody pressed anyway* — or
put the control's name on the event in `sim/stare-step.ts` where the command
is read. Then the wash is the fallback for a press with no lobe (a hand on the
field, a `DragTarget`), and the test's wash count becomes a circle count.

## Sixteen other films still put pages about their boss on the hull

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `packages/render/src/caption-anchor-boss.ts`, `packages/render/src/caption-anchor-boss-b.ts`, `packages/content/src/scene-step-types.ts`, `packages/content/src/scenes/the-candle.ts`, `packages/content/src/scenes/the-baton.ts`, `packages/content/src/scenes/the-claw.ts`, `packages/content/src/scenes/the-diastole.ts`, `packages/content/src/scenes/the-gorge.ts`, `packages/content/src/scenes/the-fleet.ts`, `packages/content/src/scenes/the-mirror.ts`, `packages/content/src/scenes/the-stare.ts`, `packages/content/src/scenes/the-ledger.ts`, `packages/content/src/scenes/the-splice.ts`, `packages/content/src/scenes/the-undertow.ts`, `packages/content/src/scenes/the-throat.ts`
- **Where:** local

`{ at: "boss", part? }` is answered for seven bosses — THE SINEW, THE TASTER,
THE LEAD, THE SCUTTLE, THE ANTIPHON, THE ORRERY, THE SCOUT — the ones the
finding named. `grep 'at: "hull"' packages/content/src/scenes/` still lists
forty-six pages in sixteen films, and most of them are about the boss, not
the hull: THE CANDLE's wick, THE BATON's beads, THE DIASTOLE's chambers, THE
GORGE's intakes, THE THROAT's mouth, THE MIRROR's twin. For each: read the
film's hull pages, decide which are truly about the hull (a breach, a scar —
those stay), add a line per kind to `caption-anchor-boss-b.ts` (or a third
file: `-b` is at 226 lines) off the boss's shape file, a `BossPart` where a
boss draws more than one thing worth a page, and a test in the pattern of
`render/test/boss-anchor-b.test.ts` — the ring where the fixture is drawn,
and null for a part this screen does not draw. The rounds (PINBALL, THE
GAUGE, THE MAZE, THE REPRISE) are their own picture and may want their own
anchor rather than a boss part.

## `bun run frames` cannot reach BULB QUEEN's BROOD, and `--hold` lacks her marks

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `tools/frames/boss.ts`, `tools/frames/hold.ts`, `packages/sim/src/boss.ts`, `apps/game/src/handle.ts`
- **Where:** local

Her phase is read off her petals every beat (`enterPhase` in `sim/boss.ts`),
and petals are a field of the creature, not the boss — so `--boss
phase=1,openBeat=now` is undone on the first beat after the write, and the
ring on her marks (`render/queen-grip.ts`) cannot be photographed from the
game at all; the picture the look lane sent was the director's PRIED pose
via `bun run shot`. Two things to do. First, a way to write a creature's
fields the way `--boss` writes a boss's — `--creature petals=6` on the
boss's creature, or a `petals` key `installBoss` forwards to
`boss.creatureId` — applied after the jump, before the opening lets go.
Second, `--hold`'s `DRAGS` list stops at `instarMark2`: `queenMark`
(`id` 0 or 1, player 1), `filament` and `stareLid` are not in it, so none of
the three newest handles can be held for a frame. Add the three rows with
their seats, and the proof is `bun run frames . --wave "BULB QUEEN" --seat
p1 --creature petals=6 --ticks 200 --boss openBeat=now,closeBeat=99` showing
the ring on both marks.
`mazeHeart` is a fourth row for the same list (2026-09-18, the look lane):
THE MAZE's tear was photographed with `--boss-json` writing `gripThumb` and
`gripPullMilli` straight into the boss, which shows the picture and proves
nothing about the hand.
`throatRing` (player 2, a hold) and `throatTube` (player 1, a carry) are the
fifth and sixth rows (2026-09-19, the §6.2 lane): THE THROAT's two new hands
are both on the boss's own picture, and neither could be photographed —
reaching the phase that offers either needs four gums flung sideways into a
walking mouth, which is the other half of this entry.

## `boss-cue-read-c.ts` is at 245 lines, and the sixth boss on it grew

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/boss-cue-read-c.ts`, `packages/render/src/boss-cue.ts`
- **Where:** cloud

Page three of the readings carries six bosses — THE THROAT, THE LEDGER, THE
LEAD, THE SCUTTLE, THE DIASTOLE, THE ORRERY — and THE DIASTOLE's widening on
18 September 2026 took it to 245 of the 250 `packages/sim/test/limits.test.ts`
allows. The next lane to widen any of the six has nowhere to put the argument,
and the argument is the point of these files. Split along the seam the header
already names: the three that are about a *count* nobody may be given (THE
DIASTOLE, THE ORRERY, THE LEAD) from the three that are about a thing on the
field (THE THROAT, THE LEDGER, THE SCUTTLE), as `boss-cue-read-c.ts` and a new
`-i.ts`, with `cuesOf`'s switch in `boss-cue.ts` pointed at both. `bun run
check` proves it; no test names the file.

**19 September 2026, `claude/queue-the-scuttle-says-the-word`:** THE THROAT and
THE ORRERY had already gone to pages eleven and twelve, and THE LEDGER went to
page fifteen that morning, so three are left and the file is at 229 lines rather
than 245. The seam the entry names is gone with them: the three that are left —
THE LEAD, THE SCUTTLE, THE DIASTOLE — are all about a count nobody may be given.
What is still true is the ceiling: twenty-one lines for three arguments, and the
last two lanes spent thirty each. The split to make now is one page a boss, as
pages eleven, twelve and fifteen already are.

## THE GAUGE is the only boss with no events and no sound

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/sim/src/events.ts`, `packages/sim/src/gauge.ts`, `packages/sim/src/gauge-hand.ts`, `packages/audio/src/catalogue.ts`, `packages/audio/test/bind.test.ts`, `packages/render/src/effects-ingest-silent-boss.ts`
- **Where:** cloud

The round emits no `SimEvent` at all, so `packages/audio` has nothing to bind
and the whole of THE GAUGE is silent — a call that lands, a call that misses,
the valve jamming and the band winding tight all happen without a sound. Every
other boss has a cue per event (`.claude/skills/new-boss` §4). The two new
states make it worse, because a jam is the one thing in the round the pilot
cannot see coming and an ear would tell him instantly.

Add a `gaugeMark`, `gaugeMiss`, `gaugeJam` and `gaugeBind` to the events union
(`events.ts` is at its limit — a comment per line added), push them from
`gaugeHeard`, bind one sound each in the catalogue panned to the middle
column, and take them off the silent list or draw them.

## boss-cue-read-e.ts is at 248 lines with three readings in it

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/boss-cue-read-e.ts`, `packages/render/src/boss-cue.ts`
- **Where:** cloud

THE MIRROR, THE MAZE and THE GAUGE share the file, and THE GAUGE's reading
grew from one arm to three when the round gained its two states. The next
round to be read has nowhere to go, and neither does a fourth arm on any of
the three.

Cut it the way the four pages before it were cut: a `boss-cue-read-f.ts` with
THE GAUGE in it, the `markAt` builder shared rather than copied a sixth time
(it is identical in all five pages — a row in `copies-table.ts` would be
better than a comment saying so), and the dispatch in `boss-cue.ts` pointed at
the new page.

## THE GAUGE's two new states have no pose in the director's gallery

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `tools/director/src/poses-bosses-rounds.ts`, `tools/director/src/field-controls-gauge.ts`, `tools/director/src/boss-states.ts`
- **Where:** local

Both ON THE FIELD rows for THE GAUGE name `THE GAUGE · PLAY`, which is the
phase the jam and the bind live inside rather than a picture of either — so
the director's page shows a dial with neither a dead valve nor a wound band on
it beside two rows that are entirely about them.

`bossPose` names a pose after a boss **state**, and `BOSS_STATES` is what the
coverage test reads, so a `jam` and a `bind` pose need the ledger to say
whether a state there is a phase or any named condition of the boss. Decide
that first — it is the same question THE GORGE's pinch and pry will ask — then
add the two poses and point the two rows at them.

## DOCUMENTATION's STATES room draws every card before the first is seen

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `tools/director/src/states-page.ts`, `tools/director/src/documentation-rooms.ts`, `tools/director/src/poses-bosses-kit.ts`, `tools/director/src/poses.ts`, `tools/director/test/boss-states.test.ts`

The owner said the documentation pages open slowly (18 September 2026).
`renderStates` builds every group of `POSE_CATEGORIES` on the tab's first
click, and every card runs its pose's world to its state and draws a frame —
thirty-odd bosses' worth of hands walked to a state, in one synchronous pass,
before anything is on the page. Two changes, both provable without a browser
in `bun test tools/director`: (1) render a group when it scrolls into view or
its heading is clicked, an `IntersectionObserver` over the `section`s with
the `h2` and note drawn at once and the row of cards filled on entry — the
lazy room `documentation-rooms.ts` already does per tab, one level down; (2)
cache a card's built world by its pose name and the hash of the world it
draws (`hashWorld`), in the module, so a second visit to the room and a
second tab that draws the same pose reuse the frame rather than walk the
hand again. The test: a fake-DOM render of the room (`test/fake-dom.ts`)
builds no pose until its section enters, and builds each pose once across
two renders. A cloud session can take this; the timing on a real page is the
owner's eye afterwards and is not what the item asks for.

## Twenty bosses of the third kind: the brief, and where it goes

- **Found:** 2026-09-18, claude/tutorial-boss-onscreen-actions-07cc80
- **Files:** `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `.claude/skills/new-boss/SKILL.md`, `docs/decisions.md`
- **Asks:** does the brief go on `docs/spec/bosses-choreographed.md` as a second table under its fifteen, or on a page of its own beside it?

The owner asked (18 September 2026) for a design brief of twenty bosses of
the third kind — the choreographed scene of `.claude/skills/new-boss` §1: a
beat list that will not advance until the beat is performed on the boss's
own picture, each gesture a `Command` (`DragTarget` or `Hold["kind"]`), the
hull's reaction in place of a camera — and said to implement nothing and to
touch no code. The brief is words: for each of the twenty, the one-sentence
mechanic, what it splits (eyes or hands), what part of the silhouette goes
away and how many there are, the beat list with each beat's gesture named
as the member it is or the member it would need, and which of the eight
filters on `bosses-choreographed.md` it passes. Every one is read against
THE TELL's verdict in §6 of the skill (no rule table drawn on the boss, no
symbol to learn before the first beat). The two places it can go pick
between one long page that the fifteen already on it will make the longest
in `docs/spec/`, and a new bosses-cinematic.md page beside it with a line on
`docs/spec/README.md` and in `docs/INDEX.md` — the second is the
recommendation, because the fifteen are designed and claimed on a ledger
and the twenty are not yet. Build nothing until the owner answers; the
answer is one word. A cloud session can take this: it is a document, and
`bun run check` holds it to naming no path that does not exist.

## THE VANE's arm is drawn sweeping while a thumb is holding it still

- **Found:** 2026-09-18, claude/queue-task-processing-cloud-6q90zn
- **Files:** `packages/render/src/vane-draw.ts`, `packages/render/src/boss-cue-read-b.ts`, `packages/render/test/vane-frame.test.ts`, `docs/spec/bosses.md`

The simulation half of §6.2 landed on 18 September 2026 and the picture did
not. `vane-draw.ts` reads the arm off `vaneTipCol(cfg, pins, waveBeat)` — the
cycle's own answer — so from VEER on, where a pin is the only thing that opens
the housing, **the arm on both screens sweeps on while the arm in the world is
standing still under the pilot's thumb**. Every arrival for the length of that
hold folds about a column neither screen is drawing. It is not a look that is
unlovely, it is a look that is wrong.

The fix is `vaneTipNow(world, boss)` in place of `vaneTipCol` and
`vaneSplitCol(world, boss)` in place of `vaneWeakCol` — both are exported and
both are what the cue was already moved to. The rest is the look lane proper
and wants an eye: a ring on the tip that says a thumb may stop it, the
navigator's on the housing under SEIZE, the pin's remaining beats read off the
arm rather than off a bar, and the slip. *What is not built* under §11.5 lists
them; the three events are on both silent lists until they are drawn.

## SNAKE's gorge and shed have no card, because no hand can drive the body to them

- **Found:** 2026-09-18, claude/queue-task-processing-cloud-6q90zn
- **Files:** `tools/director/test/boss-states.test.ts`, `tools/director/src/poses-bosses-rounds.ts`, `tools/director/src/boss-hands-rounds.ts`, `packages/sim/src/snake.ts`

The §6.2 sim lane gave SNAKE a second axis of state — what the body has become,
off its own length (`snakeGrip`) — and `BOSS_PHASES` now names all three. Only
`crawl` has a pose: the body opens at three tiles and is already in it.

`gorge` is two points swallowed and `shed` is four, and round one authors
three — so `shed` is not reachable at all until the third round, which means
winning the two before it. Both are on `OWED` with that reason, which is an
allowance and not an answer: a state nobody can photograph is a state nobody
reviews.

What it wants is a `snakeHand` beside `gaugeHand` and `mazeHand`: steer toward
the nearest standing point, prise or press the mouth open on the last step
before it, and fire at an enemy `snakeShotStop` says is in reach. It does not
need to be good — a pose runs until the state arrives and throws if it does
not — but it does need to avoid the meteors and its own tail, which is the
round. Whoever writes it takes both names off `OWED` in the same commit.

## `packages/content/src/waves/act-4.ts` is ten lines under the ceiling

- **Found:** 2026-09-18, claude/queue-task-processing-cloud-6q90zn
- **Files:** `packages/content/src/waves/act-4.ts`, `packages/content/src/waves.ts`

240 lines of 250, and `tools/hooks/after-edit-size.ts` asked for the seam to be
chosen while the diff that found it was still open — it was not, because that
diff was two lines of a guide and the split is not about it.

The convention act seven is built on is that a full page is cut at its **end**
and the overflow takes the next letter (`act-7c.ts` → `act-7d.ts`), and act
four has no letters yet, so the cut here is the cheap one: the tail of the act
into an `act-4b.ts` beside it, spread in sequence by `waves.ts`. Act seven's
own entry above is the same question asked where the answer is expensive
because the page that filled is not the last one; this one is still the last
one, and it costs a file and a line.

## THE SCOUT's laden and heavy have no card, because no hand flies the little ship

- **Found:** 2026-09-18, claude/queue-task-processing-cloud-6q90zn
- **Files:** `tools/director/test/boss-states.test.ts`, `tools/director/src/poses-bosses-rounds-b.ts`, `tools/director/src/boss-hands-rounds.ts`, `packages/content/test/scout-flight.test.ts`

The §6.2 sim lane gave THE SCOUT a second axis of state — what the motes
aboard have made of the little ship (`scoutLoad`) — and `BOSS_PHASES` now names
all three. Only `light` has a pose: an arena opens with the ship carrying
nothing.

`laden` is four motes aboard and `heavy` five, and the gallery has no hand that
flies the ship to a mote at all. Both are on `OWED` with that reason, which is
an allowance and not an answer, and it is the same allowance SNAKE's two took
the same day.

**The autopilot already exists**, which is what makes this cheap: the rig in
`packages/content/test/scout-flight.test.ts` points the nose, burns and coasts
and banks all four motes of the first arena in twelve beats. It is a test
helper rather than a `Hand`, so it cannot be spread into the gallery as it
stands — the work is lifting it beside `gaugeHand` and `mazeHand` and giving it
the world's own tick instead of its own loop. Whoever does takes both names off
`OWED`, and SNAKE's sibling entry above is the same job on a different round.

## Unverified at 1028a5b4: THE BATON's swelling socket and its two handle rings, n…

- **Found:** 2026-09-18, claude/queue-task-processing-cloud-6q90zn
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/audio/src/bind-baton.ts`, `packages/audio/src/bind-choreographed.ts`

*THE BATON's arm asks for a thumb of its own, in two states* landed from a session that could not look at it. The commit touched 41 more files. What went unchecked:

- THE BATON's swelling socket and its two handle rings, never seen on a real frame: the swell is a husk grown half again and shaking, and the rings are the shipped ones — a cloud session drew both with no eye

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 1ceb748c: THE UNDERTOW's five cues seen in a frame: no PNG was ta…

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `apps/server/test/dev-stop.test.ts`, `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-undertow.ts`

3 commits landed, ending in *THE UNDERTOW says a word in each of its five phases*, from a session that could not look at it. The commit touched 9 more files. What went unchecked:

- THE UNDERTOW's five cues seen in a frame: no PNG was taken of `OPEN`, `BURN` and the two `MOVE`s standing where the reading puts them, so the marks' lift over the lobe and their clearance of the status bar are unchecked

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `role === "p2" ? 2 : 1` is written out in eight files, and it is a rule

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `packages/render/src/view-role.ts`, `packages/render/src/briefing.ts`, `packages/render/src/guide-play.ts`, `packages/render/src/guide-prose.ts`, `packages/render/src/opening-fx.ts`, `packages/render/src/mirror-grip.ts`, `packages/render/src/pulse-lane.ts`, `packages/render/src/pulse-round.ts`, `packages/render/src/fleet-grip-draw.ts`, `apps/game/src/audio.ts`, `packages/sim/test/purity.test.ts`

Which seat a screen is, is one fact with one answer, and eight files work it
out for themselves: `briefing.ts:114`, `guide-play.ts:111`,
`guide-prose.ts:96`, `opening-fx.ts:237`, `mirror-grip.ts:121`,
`pulse-lane.ts:75`, `pulse-round.ts:117` and `fleet-grip-draw.ts:32`, with a
ninth in `apps/game/src/audio.ts:45`. Five of them name the result `seat`,
one names it `mineSeat`, two return it from a local `seatOf`. THE FLEET's
wound made the eighth, which is what turned a coincidence into a rule.

Export one `seatOf(role: ViewRole): 1 | 2` from
`packages/render/src/view-role.ts`, beside `showsFleetHulls` — the file that
already owns what a role means — and have all of them call it. Delete the two
local `seatOf`s. `apps/game/src/audio.ts` may import it or keep its own; say
which in the commit.

Then add the row to the table in `packages/sim/test/purity.test.ts` that
carries the rules which must be **called, not re-derived**, so the ninth copy
is a red test rather than a review catch.

## Unverified at b6f46254: THE FLEET's wound seen on a real frame: no PNG was take…

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/parked.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/render/src/boss-draw.ts`, `packages/render/src/fleet-chart.ts`

*THE FLEET's wound answers three thumbs and says which is yours* landed from a session that could not look at it. The commit touched 10 more files. What went unchecked:

- THE FLEET's wound seen on a real frame: no PNG was taken of the plume standing out of the holed square, the narrowed window draining under it, or either seat's ring and its word — their size against the chart's squares and their clearance of the panel below are unchecked

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at f33aea95: the five rings of THE FLEET's wound seen by an eye at t…

- **Found:** 2026-09-18, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/parked.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/render/src/boss-draw.ts`, `packages/render/src/effects-boss.ts`, `packages/render/src/effects-ingest-silent-boss-b.ts`, `packages/render/src/effects-spark-silent-boss-b.ts`

*Throw a ring off THE FLEET's wound for each of its five moments* landed from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- the five rings of THE FLEET's wound seen by an eye at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 424e7fc4: a real phone browser's own chrome eating the foot of th…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `tools/director/src/director-columns.css`, `tools/director/src/director-phone.css`, `tools/director/src/rail-open.ts`, `tools/director/test/phone-game.test.ts`, `tools/director/test/rail-open.test.ts`

*A wave row opens the field, and on a phone the field is the screen* landed from a session that could not look at it. What went unchecked:

- a real phone browser's own chrome eating the foot of the director's GAME view at 375x812 — headless has no chrome to test it with

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `ViewState.clearTop` has no caller left that sets it

- **Found:** 2026-09-19, claude/queue-a-rehearsal-that-takes-a-hit-draws-the-lost-scre
- **Files:** `packages/render/src/renderer.ts`, `packages/render/src/round-header.ts`, `packages/render/src/siren.ts`, `packages/render/src/torch-alarm.ts`, `packages/render/src/magnet-alarm.ts`, `packages/render/src/ship-top-rows.ts`, `packages/render/src/ship-top-chrome.ts`, `packages/render/src/gauge-round.ts`, `packages/render/src/fleet-chart.ts`, `packages/render/src/boss-cue.ts`, `packages/render/src/boss-cue-text.ts`, `packages/render/src/splice-draw.ts`, `packages/render/src/coord-axes.ts`, `packages/render/src/mine.ts`, `packages/render/src/hud.ts`
- **Where:** cloud

`clearTop` is the foot of a band a frame has to keep out of, and it was set by
exactly one thing: the rehearsal's own seat draw, which handed its film the
tutorial plate's foot so that a round's header and the HUD's lower rows dropped
under it. On 18 September 2026 the film was laid out **below** the band instead
(`guide-film.ts`), and the seat draw stopped setting it — the comment where it
used to be says so. Nothing has set it since. `grep -rn 'clearTop:' packages
apps tools` finds declarations, parameters and test call sites, and no producer.

So every one of those files carries a parameter that is `undefined` on every
frame the game draws, and `headerTop`/`headerLift` are two functions whose only
job is to answer "no band" fifteen times a frame. The tests keep it alive:
`alarm-room.test.ts`, `fuse-row.test.ts`, `boss-cue.test.ts` and
`guide-unseen.test.ts` each pass `GUIDE_LOOK.bandFoot` by hand, so the plumbing
is covered and unreachable at the same time — which is the shape that makes
dead code survive a sweep.

Two ways, and the choice is about whether a band can come back:

- **Take it out.** The field off `ViewState`, the parameter off each function,
  `round-header.ts` with it, and the four tests' hand-passed cases with it. One
  mechanical diff across ~15 files, nothing on screen moves, and a band that
  returns later is a new argument threaded again from scratch.
- **Keep it and give it a producer.** Something still wants this shape — the
  director's TEST stage cuts a taller band of its own — so the honest version
  is one caller that sets it rather than fifteen that read it. Whoever takes
  this should look at `tools/director/src/stage-transport.ts` first and say
  whether that band is a `clearTop` or a smaller stage.

The first is recommended unless the director turns out to want it: the reason
it exists is gone, and a number nothing sets is a number nobody can trust when
it comes back.

## `guide-scene.ts` is three pieces at 227 lines, and the seam is the slide

- **Found:** 2026-09-19, claude/queue-a-rehearsal-that-takes-a-hit-draws-the-lost-scre
- **Files:** `packages/render/src/guide-scene.ts`, `packages/render/src/guide-film.ts`, `packages/render/src/guide-switch.ts`, `packages/render/src/guide-play.ts`
- **Where:** cloud

`tools/hooks/after-edit-size.ts` fires on every edit to this file now — 227
lines, 23 under the ceiling — and it is right that the seam should be chosen
while a diff is touching it rather than in the panic of a file that has grown
past 250. It has already been split once, along the clock (`guide-play.ts`) and
the layout (`guide-film.ts`), so the cut is not obvious; here is the one the
next lane should weigh.

`draw` is two jobs stacked: **the slide** — the outgoing seat's screen going off
to the left, the incoming one following it in, the seam between them and the
clip that holds both to the picture — and **the page**, which is the caption,
the hands, the band, the rim and the nav bar. The slide is the part that reads
off `pageSwitch`, needs `handedSeat` twice, and owns the private `seat` method;
the page is the part that reads off `GUIDE_LOOK`. A `guide-slide.ts` beside
`guide-switch.ts`, taking the picture's layout, the two seats and `k`, and
giving back nothing, takes `seat` and about forty lines with it and leaves
`GuideStage` a class about state with one short `draw`.

The other candidate is worse and should be said so it is not tried: moving the
`GUIDE_LOOK` calls out leaves a file that is all plumbing and a file that is all
one-liners, and splits the two halves of a single `ctx.save()`/`restore()` pair
across a module boundary.

## A phone in TEST mode has nowhere to put two bands and the rig

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/at-a-desk.ts`, `apps/game/src/testing.ts`, `apps/game/src/game.css`, `apps/game/src/viewport.ts`, `tools/director/src/stage-transport.ts`
- **Where:** local

The second half of "Choosing P1 in the game's view switch hides the switch
itself", split off where that entry said to split it. The first half landed on
19 September 2026: the switch is taken away by the room now rather than by the
view, so a seat can be left again.

The owner, 18 September 2026: *"Also make sure in director and for game, when I
am in solo test mode, I can also test for both players on mobile device."*

The seat card's own words are *"Both bands and the test rig, for one person at a
desk"*, and the rig is laid out for one. `at-a-desk.ts` is the question the app
already asks about the device, asked in one place on purpose, and nothing in
TEST consults it. What a phone in TEST needs is both bands readable at portrait
width and the rig reachable without covering the field — which is a layout
decision and wants an eye on a phone, not a flag. The director's side of the
same ask is smaller: `stage-transport.ts` binds TEST, P1 and P2 and TEST works;
what a phone cannot do is *reach* that strip.

## `apps/game` has two files at the ceiling, and both were stepped around

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/main.ts`, `apps/game/src/join.ts`, `apps/game/src/shell.ts`, `apps/game/src/shell-menu.ts`, `apps/game/src/menu-seats.ts`

`main.ts` is 248 lines and `join.ts` 243, so `tools/hooks/after-edit-size.ts`
fires on any edit to either. That is not theory: the lane that took the view
switch off the room's hands wanted the body class in one of them — `main.ts`
holds the one line that binds the seat, `join.ts` the one that paints the chip
the class is about — and put it in `shell.ts` instead, which is a third file
reading the same status. The seam should be cut while a diff is about it.

**`main.ts`**: the object handed to `bindShell` is about thirty lines of
wiring — the seat, the tempo, the two ways a wave starts — and the same move has
already been made once for the menu's half (`shell-menu.ts`, *wiring, not
order*). A second file beside it, built from the pieces `main.ts` already holds
and handed straight to `bindShell`, leaves `main.ts` a list of bindings.

**`join.ts`**: the corner chip is a whole control with one job — its text, its
three classes, its click, and the paragraph saying why it is gone while there is
no room — and nothing else in the file touches it. It comes away the way
`menu-seats.ts` came out of `menu-view.ts`: about fifteen lines, and it is also
the natural home for the body class `shell.ts` is carrying.

## `act-7d.ts` is eight under the ceiling, and a guide edit already paid for it

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `packages/content/src/waves/act-7d.ts`, `packages/content/src/waves/act-7e.ts`, `packages/content/src/waves.ts`

242 lines, so `tools/hooks/after-edit-size.ts` fires on every touch — it fired
twice in the lane that corrected THE THROAT's two guide lines, which added no
line at all. A guide line is the one thing in a wave file that gets longer when
it gets truer, and eight of them share this page: THE UNDERTOW, THE THROAT, THE
ORRERY, THE CANDLE, THE GORGE, THE CURTAIN, THE TASTER and THE SINEW. The §6.1
and §6.2 lanes still queued for six of those are all guide-line work, so the
next one of them pays for the seam whether or not it wants to.

The cut is the one `act-7e.ts` already made and documented: the last waves come
off the end, keeping the order of the game, into a sixth page of act seven.
THE TASTER and THE SINEW are about fifty lines together, which leaves both
pages a lane's worth of room. `waves.ts` gains one import and one spread; the
new page's header says what `act-7e.ts`'s says about why it is a page of seven
and not an act of its own.

## Unverified at 2154cbd2: THE THROAT's four cues on a real frame — the PNG of the…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-throat.ts`, `packages/content/src/waves/act-7d.ts`, `packages/render/src/boss-cue-read-c.ts`

*THE THROAT says the word on the beat it is worth something* landed from a session that could not look at it. The commit touched 6 more files. What went unchecked:

- THE THROAT's four cues on a real frame — the PNG of the words standing over the gum, the body in the mouth and the rock in the gullet was never taken

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE SLOW is felt in the hand and never seen: THE INSTAR wants candidates for it

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `packages/sim/src/slow.ts`, `packages/sim/src/instar-step.ts`, `packages/sim/src/instar-marks.ts`, `packages/render/src/instar-marks.ts`, `packages/render/src/instar-fx.ts`, `packages/render/src/frame-field.ts`, `apps/game/src/tick-rate.ts`, `tools/versus/candidates/registry.ts`, `docs/versus.md`
- **Where:** local

The owner, 19 September 2026: *"Give me several versus alternatives for boss
waves which have slow motion when players need to do gesture actions on screen,
so it looks like players are under pressure to defend the next boss attack. Do
for THE INSTAR."*

**A slow window changes the wall clock and nothing else.** `openSlow` writes
two beats into `World` and `apps/game/src/tick-rate.ts` reads `slowFrac` to
stretch `tickMs`; `apps/game/src/frame.ts` turns interpolation on so the
stretched beat does not stutter. Nothing in `packages/render` asks `slowing`
at all — grep it and every hit is the English word in a comment. So the one
moment in this game that exists purely to be *felt* is the one moment the
picture says nothing about, and a pair who has not noticed the frame rate
change does not know the window is open or when it shuts.

**THE INSTAR is the right boss to answer it on** because it opens the window
twice for two different reasons, and both are gesture moments: `instar-step.ts`
opens `instarSlowBeats` as a step lands, and `instar-marks.ts` opens the same
span when a mark is taken. Its own marks are the gesture under pressure, so a
treatment that reads on THE INSTAR is a treatment that has been tested against
the case it is for.

**Several candidates, and the work is to build the seam and then fill it.**
A candidate is `fields` on a record the draw path already reads
(`tools/versus/variant.ts`), and there is no record for this today — so the
first half is one exported record for the slow treatment, read once per frame
from the field draw, with the shipped look as its default values. The second
half is the alternatives, and the ones worth drawing are named here so the lane
does not have to invent the list:

- **A frame that closes.** A border inside the field edge that thickens as the
  window runs out, so the beats left are a width rather than a number. The
  countdown is the pressure, and it costs no room in the middle of the field.
- **The field desaturates and the gesture does not.** Everything but the marks
  and the hand drops toward grey for the window, so the thing to touch is the
  only coloured thing on the screen. The risk is that it reads as *paused*
  rather than as *hurry*, which is the opposite of the ask.
- **The beat gutters.** The beat marker that is already on screen stretches
  visibly — the same pulse, drawn over a longer span — so what the pair sees is
  the clock itself running thick. Nothing new is drawn at all, which makes it
  the cheapest and possibly the weakest.
- **The attack is what slows.** The boss's next blow is drawn already begun and
  creeping: a limb part-way through its swing, held. This is the ask read
  literally — *under pressure to defend the next attack* — and it is the only
  one of the four that says what the pressure is *about*, so it is the one to
  draw first if only one gets drawn.

Two rules hold whichever wins. **Nothing here may touch the simulation**: the
window's boundaries are in `hashWorld` and both phones already agree about
them, so every candidate is render-side and reads `slowing`/`slowFrac` only.
And **nothing may be added that outlives a frame** without going in `Effects`
and being cleared in `Effects.reset()` — a window that ended is a window with
nothing left on screen (`render/test/restart.test.ts`).

It is local because choosing between four of these is looking at four of these,
at tempo, which is the whole reason `tools/versus` exists.

## Unverified at 6d333dfb: CINCH and HAUL on a real frame — the PNG of the two new…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/net/src/command-fields.ts`, `packages/net/test/command-codec.test.ts`, `packages/render/src/boss-cue-read-k.ts`, `packages/render/test/boss-cue-throat.test.ts`

2 commits landed, ending in *Queue THE INSTAR's slow window as a look with four candidates*, from a session that could not look at it. The commit touched 17 more files. What went unchecked:

- CINCH and HAUL on a real frame — the PNG of the two new words standing on the lowest ring and on the mouth was never taken

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 4515fcc9: the three new gullet sounds - CINCH, SLIP and HAUL were…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-b.ts`, `packages/audio/src/bind-throat.ts`, `packages/audio/src/catalogue.ts`

*THE THROAT's two hands are heard: the cinch, the slip and the haul* landed from a session that could not look at it. The commit touched 11 more files. What went unchecked:

- the three new gullet sounds - CINCH, SLIP and HAUL were never heard; a sound is judged by an ear and this session has none

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 501beac7: the PNG of MOVE and BURN standing on a real frame was n…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-orrery.ts`, `packages/content/src/waves/act-7d.ts`, `packages/render/src/boss-cue-read-c.ts`

*THE ORRERY says the column, and the briefing comes down* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- the PNG of MOVE and BURN standing on a real frame was never taken

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## WAVE LOST bleeds thirteen fast rivulets: slower and fewer wants candidates

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `packages/render/src/lost-blood.ts`, `packages/render/src/lost-shut.ts`, `packages/render/src/lost-look.ts`, `packages/render/src/lost-screen.ts`, `tools/versus/candidates/registry.ts`, `docs/versus.md`
- **Where:** local

The owner, 19 September 2026: *"Create some versus alternatives animations for
the wave lost overlay — what now is the many fast falling down purple drops.
Alternatives should be much slower and less elements. Maybe a single slime
flowing full width top to middle of the screen in some red, or a red splash
like it is coming from the game screen and splashing towards the user
perspective."*

**What ships is thirteen.** `lost-blood.ts` runs `RUNS = 13` rivulets, each
crossing the screen in `FALL = 3.4` seconds with `WANDER = 9` pixels of drift,
`WIDE = 12` at the head, in `HUE = PALETTE.hull` — the ship's violet. It was
asked for by name on 16 September 2026 (*alien blood flowing from top to
bottom, all across the full width*), which is why it is on the field and not
in a slot, and `shutVeil` calls `bleed` rather than owning it
(`lost-shut.ts:195`). Every rivulet is a function of `age` and its own index:
no state, nothing in `Effects`, and the screen draws the same twice on one
tick. **A candidate keeps that property or it is not a candidate.**

**The seam already exists and it is `LOST_LOOK.veil`** (`lost-look.ts:90`), so
an alternative is a whole `paint` function in a directory under
`tools/versus/candidates/` plus `bun run versus index` — not a retune of the
four constants above. The shipped SHUT plates are the current `veil` and they
call `bleed` at the end of their own paint; an answer that wants different
fluid replaces the paint and leaves `bleed` where it is for the one that
still uses it.

**Four worth drawing, the owner's two first:**

- **One slime, top to the middle.** A single body the full width of the phone,
  crawling down and stopping half-way rather than running off the foot, with a
  hanging lower edge that goes on sagging after the body has stopped. One
  element instead of thirteen and the slowest thing on the screen, which is
  the ask read straight.
- **A splash toward the viewer.** Thrown from the middle of the field outward,
  drops growing and thinning as they approach — the glass of the phone taking
  it rather than the field bleeding down behind it. It is the only one of the
  four that puts the pair on the wrong side of the screen, and it is also the
  one that risks covering the breach.
- **One rivulet, wide and slow.** The shipped effect with `RUNS` at one, twice
  the width and four times the fall — the cheapest possible answer, and worth
  drawing for exactly that reason: if it reads as well as the other three the
  other three are not owed.
- **A pool that rises from the foot.** Nothing falls at all; a level creeps up
  from the bottom edge and stops under the buttons. It is the one that never
  crosses the breach on its way anywhere, and the only one that says *this is
  not over* rather than *something burst*.

**Red is not free.** WAVE LOST is already written in red and the bodies are
red (`palette.ts`); the shipped violet was chosen so the screen was not one
colour (`lost-blood.ts`'s header). The owner has now asked for red twice over,
so a candidate in red is drawn — but at least one of the four stays violet so
the choice is on the screen rather than in this file.

**Three rules hold whichever wins.** The breach must still be visible under
it: the field stays greyed beneath this screen so the pair can look at where
it got through, and a treatment that covers it takes the lesson away
(`lost-screen.ts`). **RETRY WAVE and QUIT may not move** — `apps/game/src/lost.ts`
hit-tests the boxes `lostButtons` hands out, and a look that moved them would
move the picture and not the thumb (`lost-answer.ts`). And nothing may outlive
a frame without going in `Effects` and being cleared in `Effects.reset()`
(`render/test/restart.test.ts`).

It is local because choosing between four of these is looking at four of
these, at tempo, on a phone-shaped screen.

## Unverified at 1172a97b: the PNG of THE CANDLE's words on a real frame

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-candle.ts`, `packages/content/src/waves/act-7d.ts`, `packages/render/src/boss-cue-read-m.ts`

*THE CANDLE says the word on the field, and the briefing comes down* landed from a session that could not look at it. The commit touched 4 more files. What went unchecked:

- the PNG of THE CANDLE's words on a real frame

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at ce22d819: THE ORRERY's rehearsal film watched at tempo — the thre…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-orrery.ts`, `packages/content/test/scene-films.test.ts`

*THE ORRERY: a shot cracks a ring and the pilot's thumb takes it off* landed from a session that could not look at it. The commit touched 19 more files. What went unchecked:

- THE ORRERY's rehearsal film watched at tempo — the three winds, the split one around the rock, and whether a turn and a half an organ feels like a decision
- the OPEN mark seen on a real frame of the cracked ring

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at a5f99af6: THE CANDLE's wick and ember watched at tempo — the stem…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/render/src/candle-dark.ts`, `packages/render/src/candle-glow.ts`, `packages/render/src/candle-grip.ts`

*THE CANDLE: the flame gets a wick to be pulled off* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- THE CANDLE's wick and ember watched at tempo — the stem's travel, the ring closing and the ember's flicker against candleSmokeBeats are proved only by candle-frame.test.ts, not by an eye on a running frame

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## The line ceiling now hears Bash, and is still deaf to PowerShell

- **Found:** 2026-09-19, claude/queue-the-file-size-notice-is-deaf-to-a-lane-that-edit
- **Files:** `.claude/settings.json`, `tools/hooks/written-paths.ts`,
  `tools/hooks/shell-words.ts`
- **Where:** cloud

`after-edit-size.ts` is registered under `Bash` now and `written-paths.ts`
recovers the files a bash line wrote, which closes the hole a lane on this
machine falls into. The other shell is still open. `guard.ts` was widened to
`Bash|PowerShell` for exactly this reason once already — on Windows the
session's primary shell is the separate PowerShell tool, and a rule bound to
one of the two is unenforced the moment the command is typed into the other.

The parsing is not simply reusable across the two. `commandsIn` already takes a
dialect and would split a PowerShell line correctly, and `>` and `>>` mean the
same thing in both — but the shapes that actually write there are
`Set-Content`, `Add-Content` and `Out-File -FilePath`, with the path behind a
named parameter rather than in operand position, and `sed`, `tee` and a
`python3` heredoc are all absent. So it is a second table, not a second
argument.

To do: add a `PowerShell` matcher beside the `Bash` one, give `writtenPaths` a
dialect it passes through to `commandsIn`, and put the three cmdlets in a table
of their own beside `operands`. The rule stays the one this hook is built on:
silence when it can parse nothing, never a guess, never a block. The check that
it worked is the one the Bash half took — a line appended to a file near the
ceiling is heard about, and a `Get-Content` of the same file says nothing.

## The COPIES table cannot carry a row that points at a document

- **Found:** 2026-09-19, claude/queue-a-new-boss-state-is-twelve-registrations-and-not
- **Files:** `packages/sim/test/copies-table.ts`, `packages/sim/test/copies.test.ts`
- **Where:** cloud

The entry that produced `.claude/skills/new-boss-state` asked for a row in the
called-not-re-derived table pointing at it, and there is no such row to write.
A `Copy` is `{ call, owner, pattern }`: a regex the owner file must contain and
no other file may. Twelve registrations spread over eleven files re-derive no
arithmetic, so any pattern written for them would either match nothing — and
`copies.test.ts` fails a row whose owner does not contain its own pattern — or
match the registrations themselves, which are the point rather than the defect.

The pointer went to `CLAUDE.md`'s conventions list and the head of
`.claude/skills/new-boss`, which is where a lane starting the work actually
looks, and the skill's own paths are now held by `doc-drift.test.ts`.

What is worth deciding is whether the table should be able to carry a rule
whose enforcement is a document rather than a regex — a row with a `see` and
no `pattern`, failing only if the document is gone. That is a real second kind
of row and it would want the owner's word: it makes the table two things, and
the reason it is one thing today is that a rule nothing can test is a rule
that goes quiet.

## A handle boss's word is invisible to a search of the readings

- **Found:** 2026-09-19, claude/queue-the-surge-the-field-says-the-word-and-the-briefi
- **Taken:** 2026-09-19, claude/queue-a-handle-bosss-word-is-invisible-to-a-search-of
- **Files:** `docs/queue.md`, `packages/render/src/boss-cue.ts`, `packages/render/src/sinew-handles.ts`, `packages/render/src/surge-grip.ts`, `.claude/skills/new-boss/SKILL.md`
- **Where:** cloud

THE SINEW's and THE SURGE's *the field says the word* entries both said the boss
said nothing on the field, and both were wrong: a **handle** boss builds its cue
in its own drawing — `sinew-handles.ts` and `surge-grip.ts` call `drawCueText`
directly — because the mark rides a whip or a swell that `World` does not keep.
So `boss-cue.ts` has no `case` for either, and a lane that greps the readings
finds an absence that is not there. On THE SURGE that cost a whole reading page,
written and thrown away, and only `surge-frame.test.ts` counting two `HOLD`s
where it allows one caught it.

Two things to do, and the second is the one that stops it happening again:

1. Correct every remaining entry of this family that names a boss with a handle
   before a lane picks it up, by grepping that boss's own `render/*-draw.ts`,
   `*-handles.ts` or `*-grip.ts` for `drawCueText`. THE BALLOON's pair is the
   next one (`balloon-handles.ts`).
2. Put the check in `.claude/skills/new-boss` §6.1, in one line: a boss's words
   are `boss-cue.ts`'s **or** its own drawing's, and the drawing is where a
   handle's are. A reader of that section has no way to know that today.

The stronger version, if the owner wants it, is a test: every `BossKind` with a
`DragTarget` of its own either has a `case` in `boss-cue.ts` or a `drawCueText`
call in its drawing, and the table naming which is in one place. That is the
`copies-table.ts` idiom pointed at a seam rather than a number.

## SCATTER is THE WISP's strike and its page describes a bulb

- **Found:** 2026-09-19, claude/queue-the-indexs-drift-check-reads-a-count-but-not-a-l
- **Files:** `packages/render/src/body-hit-scatter.ts`, `packages/render/src/body-hit.ts`, `packages/render/src/body-spores.ts`
- **Where:** cloud

Turned up by the index's new proper-name check, which wanted to know why the
row for `body-hit-scatter.ts` named THE WISP when the file never said so. The
code is unambiguous — `body-hit.ts:120` is `WISP_HIT … strike: scatter` — so
the row was right and the title line has been given the boss. What is left is
the header's body, which calls the thing being killed **the bulb** four times
over: *the bulb is a spore case*, *eleven spheres packed three deep inside
it*, *well above where the bulb was*. `BULB_HIT` is a different strike
(`pop`), so both cannot be true.

Either the page describes a kill that moved from the bulb to the wisp and the
prose was never brought over, or the pairing in `body-hit.ts` is the thing
that is wrong and the drawing is a bulb's. This lane could not tell which from
the code, and the picture is the evidence.

To do: settle which body SCATTER belongs to, then make the page and the
pairing agree. `body-spores.ts`'s eleven pins are the third voice — whichever
body owns those owns this kill.

## A frame test that counts a colour has no way to know the colour is shared

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `packages/render/test/frame-harness.ts`,
  `packages/render/src/palette.ts`
- **Where:** cloud

The frame tests prove a thing is drawn by counting its colour in the canvas
log — `count(text, PALETTE.redRim)` against a world that should not have it.
That is only a proof while the colour belongs to the one thing being asked
about, and nothing tells a lane which colours those are. THE CURTAIN's jam bar
was stroked in `PALETTE.rock`, and the test comparing a jammed sheet with a
loose one failed on the navigator's screen: `rock` is also the cue word's fill
(`boss-cue-text.ts`) and the target lock's (`boss-cue-draw.ts`), the two states
draw different cues, and the count was measuring the word. The bar was real the
whole time. The test passes now by counting `PALETTE.rockDark` instead, which
happens to be unused by either cue file — found by grep, and a fact that goes
stale the next time somebody reaches for it.

To do: give `frame-harness.ts` a `countOnly(text, colour)` that throws when the
colour is named by more than one source file under `packages/render/src`, or,
cheaper and probably better, a test of its own that lists each `PALETTE` entry
against the source files naming it and fails when a frame test's colour has
more than one — the same shape as `hash-coverage.test.ts`, which collects and
reports the whole list rather than throwing on the first. Either way the check
is that a lane reaching for a shared colour is told so by a red test rather
than by a frame test that quietly measures the wrong thing.

## Unverified at 0c7934d1: THE CURTAIN's jammed rail and lifted hem seen by an eye…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/content/src/scenes/the-curtain.ts`, `packages/content/test/scene-films.test.ts`

*Draw THE CURTAIN's jam and give its hem a ring to lift* landed from a session that could not look at it. The commit touched 9 more files. What went unchecked:

- THE CURTAIN's jammed rail and lifted hem seen by an eye: the bar fading over the jam's count, the hem gathering under the rail at a full lift, the gap opening over the core, and the rehearsal's eleventh page at tempo. No PNG was taken.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `supervise-stop.test.ts` goes red under a full sharded run and green on its own

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `tools/dev/test/supervise-stop.test.ts`, `tools/dev/supervise.ts`
- **Where:** cloud

`bun run check` failed one shard on *"is gone, and so is its child, once it has
been asked to stop"* — `expect(alive(child)).toBe(false)` received `true` —
during a 67-shard run on a lane whose diff deleted eighteen lines of
`docs/queue.md` and touched nothing else. The same file run alone passes in
50ms. So the test is red as a function of machine load, not of the tree.

The test's own comment says why it believes it needs no polling: *"The
supervisor waits for the child before leaving, so by the time its own exit has
been observed the child is already gone."* That is the claim to check, and
there are only two ways it goes wrong. Either `supervise.ts` does not in fact
await the child on every path out — in which case the test has found a real
bug and the fix is in the supervisor, and the test is right to be strict — or
it does, and what is racing is `alive()`: a pid whose process has exited is
still signalable until it is reaped, so `kill(pid, 0)` can answer for a zombie
whose parent has not yet been scheduled to wait on it. Under sixty-seven
concurrent shards that scheduling delay is exactly what grows.

To do: read `supervise.ts`'s exit paths first and settle which of the two it
is, because the fixes are opposite. If the supervisor has a path that leaves
without awaiting, fix the supervisor. If it does not, the test is asserting
something `kill(pid, 0)` cannot tell it, and the honest assertion is that the
child is gone **within** a bound — a short poll with a named deadline, and a
comment saying it is waiting for the reap and not for the exit. Do not simply
widen the timeout: the file's `setDefaultTimeout` is already measured from
this case, and a longer one would hide whichever of the two this is.

## Unverified at fbdcfa17: THE TASTER's three new words on a real frame: PIN, WIPE…

- **Found:** 2026-09-19, claude/queue-the-taster-changes-state-more-than-once-and-asks
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-b.ts`, `packages/audio/src/bind-taster.ts`, `packages/audio/src/sounds/boss-taster.ts`

*THE TASTER: three thumbs on the fan, one per movement* landed from a session that could not look at it. The commit touched 29 more files. What went unchecked:

- THE TASTER's three new words on a real frame: PIN, WIPE and PRY were never seen on a phone, and no PNG was taken

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
