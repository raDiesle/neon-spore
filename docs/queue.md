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

**Say in one sentence what an item is about, at the moment it is claimed.**
The owner, 19 September 2026: *whenever you take something new from queue, can
you write one sentence what it is about.* A title is a label and most of them
are written to be found rather than read — *THE SURGE changes state more than
once*, *boss-cue-read-c.ts at 245 lines* — so a session draining five in a row
reports five titles and he cannot tell from any of them what is about to change
in his game. The sentence goes in the report the moment `take` or `next`
returns, before the work starts, and it says what the item is in plain words:
not the entry restated, and not a plan. One line, one item.

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
- **Answered:** 19 September 2026 — a new three-button prompt over the field, against this entry's own recommendation. `confirm.ts`'s objection (a dialog the back gesture opened cannot also be a dialog it closes, without a second history entry to burn) is real and has to be designed around rather than skipped: the prompt's own dismissal needs its own push, or the gesture that opened it stops working the second time.

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
- **Answered:** 19 September 2026 — widen the column's pitch to 2.5 tiles (0.37 of a tile of room). Chosen over cutting `scoutHazardRadiusMilli`, which is a shared tunable and would touch every hazard in the game rather than only this arena's own layout, and over leaving the geometry: the rehearsal film already searched every wait and every burn against the fourth mote and found no leg that did not end in the hazard, which is stronger than "no safe park" — it says this mote may not be clearable at all today, not merely that idling on it is unsafe by design.

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
- **Answered:** 19 September 2026 — shift the letters. Migrating waves only postpones the same overflow one page later, and lifting the prose costs separating a wave's reasoning from its figures, which is the thing these headers exist to keep together. This is now the standing convention rather than a one-off pick: the same day, a different entry (*`act-7d.ts` is eight under the ceiling*) hit this exact shape of overflow — a full-enough middle page (`act-7e.ts`) sitting between the page that needed to shed waves (`act-7d.ts`) and the end of the chain — and was resolved the same way, giving the new page the letter and shifting the old `act-7e.ts` to `act-7f.ts`. `act-7e.ts`'s own header now cites this entry by name as the precedent, so it stays rather than closing: `act-7c.ts` is the page closest to needing this again (241 of 250 lines as of that same landing).

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
- **Answered:** 19 September 2026 — slow it, matching the design as written: **every flash beat**, not the first only. §14 says the beat a flash lands is played at a third rate with no exception named for later flashes, so `openSlow(world, cfg.candleFlashSlowBeats)` fires from every `fire` that lights the field, one beat at `slowRateMilli`, both screens together. Sized work, not yet built: a config field, a line in `candle-step.ts`, a receipt in `candle.test.ts`, and `bun run check`.

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
- **Answered:** 19 September 2026 — the insect, picked as easiest for a pair to understand: it is the one option that costs no new rule. A spill becomes a body in a known colour, shot the same way every other coloured body in the game is shot, and the look already exists (a slick or a bulb) so nothing new has to be read on sight either. The fast rock changes only a cadence a pair cannot see, which does not teach them what to do differently; the pass breaks the general rule that a shot never goes through a body, which a pair has learned everywhere else and would have to unlearn here.

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

## THE SINEW's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/sinew-band.ts`, `packages/render/src/sinew-draw.ts`, `packages/render/src/sinew-fibres.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE LEDGER's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/ledger-cord.ts`, `packages/render/src/ledger-draw.ts`, `packages/render/src/ledger-fx.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SURGE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/surge-draw.ts`, `packages/render/src/surge-fx.ts`, `packages/render/src/surge-gauge.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

5 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE LEAD's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/lead-draw.ts`, `packages/render/src/lead-fx.ts`, `packages/render/src/lead-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SCUTTLE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/scuttle-draw.ts`, `packages/render/src/scuttle-fx.ts`, `packages/render/src/scuttle-shape.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

3 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE ANTIPHON's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/antiphon-draw.ts`, `packages/render/src/antiphon-fx.ts`, `packages/render/src/antiphon-grip.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

4 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

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

## THE CAIRN changes state more than once, and asks for more than one gesture

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Taken:** 2026-09-19, claude/task-queue-work-ym2eim (claim: claude/queue-the-cairn-changes-state-more-than-once-and-asks)
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
- **Answered:** 19 September 2026 — a new docs/spec/bosses-cinematic.md page, taking this entry's own recommendation: the fifteen on `bosses-choreographed.md` are designed and claimed on a ledger and the twenty are not, so folding them into one table would mix built work with a brief. Sized work: the page itself, a line on `docs/spec/README.md`, and `bun run index`.

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
- **Taken:** 2026-09-19, main (claim: claude/queue-snakes-gorge-and-shed-have-no-card-because-no-ha)
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

## Unverified at 0c7934d1: THE CURTAIN's jammed rail and lifted hem seen by an eye…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/content/src/scenes/the-curtain.ts`, `packages/content/test/scene-films.test.ts`

*Draw THE CURTAIN's jam and give its hem a ring to lift* landed from a session that could not look at it. The commit touched 9 more files. What went unchecked:

- THE CURTAIN's jammed rail and lifted hem seen by an eye: the bar fading over the jam's count, the hem gathering under the rail at a full lift, the gap opening over the core, and the rehearsal's eleventh page at tempo. No PNG was taken.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at fbdcfa17: THE TASTER's three new words on a real frame: PIN, WIPE…

- **Found:** 2026-09-19, claude/queue-the-taster-changes-state-more-than-once-and-asks
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-b.ts`, `packages/audio/src/bind-taster.ts`, `packages/audio/src/sounds/boss-taster.ts`

*THE TASTER: three thumbs on the fan, one per movement* landed from a session that could not look at it. The commit touched 29 more files. What went unchecked:

- THE TASTER's three new words on a real frame: PIN, WIPE and PRY were never seen on a phone, and no PNG was taken

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at e71733bc: THE SPLICE's WAIT seen at tempo over the tangle

- **Found:** 2026-09-19, claude/queue-the-splice-says-the-word
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-splice.ts`, `packages/content/src/waves/act-9.ts`, `packages/render/src/boss-cue-read-d.ts`

*THE SPLICE says the one word it can, and never on a mouth* landed from a session that could not look at it. The commit touched 6 more files. What went unchecked:

- THE SPLICE's WAIT seen at tempo over the tangle

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8ddc2c93: THE CAIRN's PULL seen on a real frame over a seven-ston…

- **Found:** 2026-09-19, claude/queue-the-cairn-says-the-word
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-cairn.ts`, `packages/content/src/waves/act-8.ts`, `packages/render/src/boss-cue-read-q.ts`

*THE CAIRN says the one word it can, and the dome goes to the rock they pulled* landed from a session that could not look at it. The commit touched 3 more files. What went unchecked:

- THE CAIRN's PULL seen on a real frame over a seven-stone pile

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at c59c2b1e: THE SINEW's caught tendon has no picture yet: the swing…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed.ts`, `packages/audio/src/bind-sinew.ts`, `packages/audio/src/sounds/boss-sinew.ts`

*THE SINEW answers its snap-back: both hands carried APART catch the tendon* landed from a session that could not look at it. The commit touched 23 more files. What went unchecked:

- THE SINEW's caught tendon has no picture yet: the swinging handles are not drawn as catchable, the spread is not drawn on the tendon, and the band does not answer a catch. A PNG of the caught state, seen by an eye.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 419e7ce9: THE LEDGER's two new words on a real frame: ROOT and PU…

- **Found:** 2026-09-19, claude/queue-the-ledger-changes-state-more-than-once-and-asks
- **Files:** `docs/INDEX.md`, `docs/cloud-session.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-b.ts`, `packages/audio/src/bind-ledger.ts`

*THE LEDGER: four hands on one cord, one per movement* landed from a session that could not look at it. The commit touched 27 more files. What went unchecked:

- THE LEDGER's two new words on a real frame: ROOT and PULL were never seen on a phone, and nothing is drawn for the foot, the plug, the hauled bead or the hauled cord

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE WELL's warning ring is empty on the one screen it is drawn on

- **Found:** 2026-09-19, claude/queue-the-well-says-the-word
- **Files:** `packages/render/src/well-arrivals.ts`, `packages/render/src/radar-blip.ts`, `packages/render/src/well.ts`, `packages/content/src/creatures-table.ts`, `packages/content/src/waves/act-8.ts`
- **Asks:** Should the pilot's clock carry warning marks of its own, or is being warned of nothing the split this boss is for?
- **Answered:** 19 September 2026 — leave it, and say so. Giving the pilot the ring means every blip regardless of owner, which is against `docs/spec/systems.md` 5.2 unless the owner asks for that exception on this boss by name, which he has not; authoring a well wave with rocks in it is a wave, not a fix, and a bigger task than this entry is. Sized work: a paragraph on `well-arrivals.ts` saying it is drawn for waves not yet written, and a frame test that proves the arithmetic rather than leaving it assumed.

`well-arrivals.ts` bends the flat field's warning strip into a ring outside the
well's rim, and draws the crossing rock's mark inside the seam — eighty lines of
polar arithmetic with a paragraph over each half. On the shipped wave it draws
**nothing at all**, ever.

Two predicates that have never been asked about each other meet here.
`showsWell` is `showsCannon`, so the ring is only ever drawn on the pilot's
screen; `radarBlips` gates every entry on `showsRadar(l.role, kind)`, and every
body THE WELL's wave sends is a `slick` or a `bulb`, both `radar: "p2"`. Over
seventy beats of the wave the navigator's flat strip carries sixty-four marks and
the pilot's ring carries nought
(`packages/render/test/boss-cue-well.test.ts`, the last case). The only role that
ever sees the ring fill is `test`, which shows everything.

So the file is live only for a well wave carrying a p1-radar kind — a rock, a
torch, a mine — and no such wave exists. It is not dead code, but nothing proves
it draws either, and the crossing mark in particular has never been drawn on a
screen anybody plays: a crossing rock is a `meteor`, which is `radar: "p1"`, so
it would draw — on a wave nobody has authored.

Three answers, and they are different work:

1. **Leave it, and say so.** The split is the design: the navigator holds the
   strip and the pilot has to be told. Then `well-arrivals.ts` gets a paragraph
   saying it is drawn for waves not yet written, and a frame test builds one so
   the arithmetic is proved rather than assumed.
2. **Give the pilot the ring.** `radarBlips` takes the role, so a well could ask
   for every blip regardless of owner — which hands one seat the other's half of
   the picture and is against `docs/spec/systems.md` 5.2 unless the owner wants
   it for this boss.
3. **Author a well wave with rocks in it.** That is a wave, not a fix, and it
   would also give the plate something to do — nothing THE WELL sends today is
   wardable (`isWardable` is false for a slick and a bulb), so the dome and its
   trigger are dead for the whole wave.

## Unverified at 05c48636: the ring's picture at BEND=1.7, and whether the pilot's…

- **Found:** 2026-09-19, claude/queue-the-well-says-the-word
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-well.ts`, `packages/content/src/waves/act-8.ts`, `packages/render/src/boss-cue-read-r.ts`

*THE WELL is the one boss that may not be given a word, and its briefing carries all of it* landed from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- the ring's picture at BEND=1.7, and whether the pilot's clock reading as unwarned is noticed

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 58c05186: the box's picture on a real frame — a cloud session has…

- **Found:** 2026-09-19, claude/queue-the-instar-says-the-word
- **Files:** `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/waves/act-7e.ts`, `packages/content/test/scenes-prose.test.ts`, `packages/render/src/boss-cue-text.ts`, `packages/render/src/boss-cue.ts`

*THE INSTAR's scanner box learns the kind line the owner asked for* landed from a session that could not look at it. The commit touched 3 more files. What went unchecked:

- the box's picture on a real frame — a cloud session has no screen

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 628baa61: the tear's own frame against its teeth, and both cues o…

- **Found:** 2026-09-19, claude/queue-the-reprise-says-the-word
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-reprise.ts`, `packages/content/src/waves/act-10.ts`, `packages/render/src/boss-cue-read-s.ts`

*THE REPRISE says two words over an empty field, and the plate leaves its guide* landed from a session that could not look at it. The commit touched 3 more files. What went unchecked:

- the tear's own frame against its teeth, and both cues on a real frame — a cloud session has no screen

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## The field is fullscreen only for the players who installed it

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/public/manifest.webmanifest`, `apps/game/src/shell.ts`, `apps/game/src/install.ts`, `apps/game/src/main.ts`, `apps/game/src/menu-settings.ts`
- **Where:** local

The owner, 19 September 2026: *the game screen is always the core focus for
the player to use and 100% fitting.*

The manifest already says `"display": "fullscreen"` and
`"orientation": "portrait"`, and both are right — **and both apply only to the
installed shortcut**. A pair who opened a link and never pressed INSTALL, which
is the pair the join flow is built for, plays inside a browser tab: an address
bar over the picture, a navigation bar under it, and a stage the renderer has
to fit into what is left. Nothing in `apps/game/src` ever calls
`requestFullscreen`, and `grep` finds the word only in two doc comments.

The work is one call, and the whole of its difficulty is **where it is called
from**: `requestFullscreen` is refused outside a user gesture, so it has to
hang off a press the pair makes anyway on their way onto the field. There are
three such presses already — the READY hold in `join-room-step.ts`, the last
page of the intro, and PLAY on the menu — and the right one is the last press
before the field, once, per run.

Two things ride along with it and cannot be had any other way:
`screen.orientation.lock("portrait")` is refused outside fullscreen, and a
phone turned sideways mid-wave is a field re-laid-out under four thumbs; and a
fullscreen document is the one state in which the platform's own edge gestures
stop being the first thing a thumb at the edge does.

It needs a row in the settings menu that turns it off, because fullscreen on a
desktop browser is not what a person testing wants, and because a player who
was put in fullscreen without being asked and cannot find the way out will
close the tab rather than the game.

## Nothing keeps the screen awake, and a long hold looks like an empty room

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/shell.ts`, `apps/game/src/run-state.ts`, `apps/game/src/loop.ts`
- **Where:** local

`navigator.wakeLock` appears nowhere in the tree. A phone dims and then locks
on an idle timer that counts *touches*, and this game is played in long holds:
a thumb resting on THE SURGE's bulb, a hand on a handle, a guard held through a
volley. A pair three minutes into an act with both thumbs down and no tap for
forty seconds is exactly the input a phone reads as an abandoned page — and the
other phone is still in the room, so the dim is a desync the pair has to talk
their way out of.

`navigator.wakeLock.request("screen")` when a run opens, released when it ends.
The one thing that is easy to get wrong: **the lock is dropped when the tab is
hidden and is not given back**, so it has to be re-requested on
`visibilitychange` — which is the same event the link already watches. Wrap the
call: it rejects on a battery-saver phone and on every browser that does not
have it, and a rejection is not a reason for the run not to start.

## The stage is sized from a number the address bar moves

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/viewport.ts`, `apps/game/src/game.css`, `packages/render/src/layout.ts`
- **Where:** local

`bindViewport` sizes the renderer from `window.innerWidth` and
`window.innerHeight`, and `computeLayout` divides that height into the play
area and the control band. On a phone in a tab, `innerHeight` is not one
number: it grows by the height of the address bar the moment the bar collapses
and shrinks again when it comes back, and every one of those is a `resize` this
file answers by re-laying the whole field out.

What that costs is not a redraw. `bandTop` is a share of the height, so the
band moves; the strips and the lobes move with it; and a thumb already resting
on a lobe is now resting beside it, mid-wave, without having moved. The pair's
own report of this is *it sometimes does not react*.

Three parts, and the third is the one that matters:

- Read `visualViewport` where it exists rather than `window.innerHeight` —
  it is the rectangle actually showing, and it reports the change as it
  animates rather than after.
- `100dvh` in `game.css` for the same reason on the CSS side.
- **Freeze the stage's height for the length of a run.** A field that is
  measured once when the wave opens and not again until it ends is the whole
  of the fix; a resize during a run is a thing to survive, not a thing to
  honour. Outside a run — the menu, the join screen — it should keep
  answering, because a keyboard opening over the room code is a resize that
  has to be obeyed.

## The band runs to the screen's edges, where the phone's own gestures start

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `packages/render/src/layout.ts`, `packages/render/src/strip-band.ts`, `apps/game/src/game.css`, `packages/sim/src/config-view.ts`
- **Where:** local

`computeLayout` puts `bandTop` at `height - bandHeight` and the strips run the
full width, so the band's outer edge is the window's outer edge on all three
sides. On a phone those three edges are taken: the bottom strip is under the
home indicator on an iPhone and under the gesture bar on Android, and the left
and right edges are where the back swipe starts. The game's own CSS furniture
already respects `env(safe-area-inset-*)`; the picture the game is played on
does not, because it is drawn on a canvas that covers the window.

The fix is a gutter the renderer knows about rather than a CSS one: the four
`env(safe-area-inset-*)` values read once and handed to `computeLayout` as an
inset, so the band is laid out inside the rectangle the phone actually lets a
thumb have. `bandSoloPct` then measures the usable height rather than the
window's.

It is the same complaint as *the phone's back gesture leaves the game instead
of asking*, from the other end: that entry catches the gesture once it has
happened, this one keeps the thumb out of the corner where it happens. Both are
worth having, and fullscreen (above) removes neither.

## Nothing says how long a thumb waits for the field to answer it

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/input-buffer.ts`, `apps/game/src/loop.ts`, `apps/game/src/perf-page.ts`, `apps/game/src/coalesced.ts`
- **Where:** local

The owner, 19 September 2026, asking whether a native app would take input
better: *it sometimes does not react.*

Nothing in the tree can answer that, because nothing measures it. A press
crosses four gaps before the field moves — the browser's own touch-to-event
delay, the wait for the next `requestAnimationFrame`, the lockstep's scheduled
delay in `input-buffer.ts`, and the beat the simulation applies it on — and
three of the four are ours. Which one the pair is feeling decides whether a
native shell would fix anything at all, and the honest answer today is that
nobody knows.

The work is a counter, not a rewrite: stamp each press with the event's own
`timeStamp` as it enters the buffer, stamp the frame that draws its effect, and
put the spread on the perf page beside the frame cost — worst of the last
hundred, not the mean, because the complaint is about the bad ones. Then the
three entries above can be judged rather than argued about, and so can the
question that prompted this one.

## Unverified at be40d473: the picture of the rock coming out of the bulb's unders…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `.claude/skills/new-boss-state/SKILL.md`, `.claude/skills/new-boss/SKILL.md`, `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`

2 commits landed, ending in *THE SURGE spits a rock, and the pilot wards it without letting go*, from a session that could not look at it. The commit touched 27 more files. What went unchecked:

- the picture of the rock coming out of the bulb's underside, and THE SURGE watched at tempo with a rock in the air

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 8995ded7: the reach and the shot on a real frame — a cloud sessio…

- **Found:** 2026-09-19, claude/queue-the-hive-says-the-word
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/waves/act-7f.ts`, `packages/render/src/boss-cue-read-v.ts`, `packages/render/src/boss-cue.ts`

*THE HIVE learns to say CARRY and PRESS, and the briefing comes down* landed from a session that could not look at it. The commit touched 1 more file. What went unchecked:

- the reach and the shot on a real frame — a cloud session has no screen

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 5619d0ed: the reach and the shot on a real frame — a cloud sessio…

- **Found:** 2026-09-19, hive-relanding
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/release-notes.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/waves/act-7f.ts`, `packages/render/src/boss-cue-read-v.ts`

2 commits landed, ending in *Release notes for one landing*, from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- the reach and the shot on a real frame — a cloud session has no screen

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE REPRISE's own rehearsal may still teach the split by gap rather than colour

- **Found:** 2026-09-19, claude/queue-the-reprises-tear-draws-the-pilots-half-of-the-r
- **Taken:** 2026-09-19, main (claim: claude/queue-the-reprises-own-rehearsal-may-still-teach-the-s)
- **Files:** `packages/content/src/scenes/the-reprise.ts`
- **Where:** cloud

Landing *THE REPRISE's tear draws the pilot's half of the record on both
screens* found that `docs/spec/bosses.md` §11.15 and `waves/act-10.ts`'s own
header already read the corrected split — the navigator keeps the columns,
the pilot keeps the colours — but `scenes/the-reprise.ts`'s header still
says, of the same fight, *"the navigator's half is the column and the
pilot's is the gap"* and has the pilot's blind page read `COUNT THE GAPS
BETWEEN THEM` rather than a colour.

Whether this is actually stale is not settled here. The rehearsal's `acts`
do carry both a cannon slide (a column) and a fire (a colour) after the dark,
so the scene may be deliberately teaching the *timing* half of the record as
a separate, easier first pass before the guide's colour-reading wording
existed — in which case the fix is only in the words, not the acts — or it
may simply not have been touched when the colour framing landed. Reading it
against the corrected design, and against whatever `boss-cue-read-s.ts` and
its own words expect the pilot's blind page to be about, decides which.

## Unverified at 4674a3bb: the PNG of the held stalk, with its ring and its d…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-b.ts`, `packages/audio/src/bind-lead.ts`, `packages/audio/src/sounds/boss-lead.ts`

*THE LEAD's still is a handle, and her thumb buys the beam its fill* landed from a session that could not look at it. The commit touched 32 more files. What went unchecked:

- the PNG of the held stalk, with its ring and its dial closing over the organ
- THE LEAD's still watched at tempo with a thumb on it: four beats become up to leadHoldBeats, and the beat she lets go is the beat it passes
- the stalk's lean through the still, which `leadAskedAngle` had pinned upright and now reads

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## A landing that forgot `--unverified` has no way to write the entry afterwards

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-19, main (claim: claude/queue-a-landing-that-forgot-unverified-has-no-way-to-w)
- **Files:** `tools/land/unverified.ts`, `tools/land/note-commit.ts`, `docs/cloud-session.md`, `docs/queue.md`
- **Where:** cloud

`--unverified` is parsed off the landing's own argv (`parseUnverified`) and the
entry is written by the commit that moves the trunk (`note-commit.ts`). There is
no second door. A lane that lands and *then* realises it never looked at the
picture cannot run the flag again: from `main` the landing refuses because a
trunk is landed on rather than landing, and from the spent branch it refuses
because the branch carries nothing `main` has not got. This lane hit both
refusals in one turn and wrote the entry by hand in `renderUnverified`'s shape
instead — a paragraph of formatting duplicated in a document, which is exactly
the drift `filesLine`'s path-only rule was hardened against after a trailing
", and N more" broke `splitFiles` and marked every truncated entry stale.

Give it the second door: a script that takes an already-landed sha and the same
repeatable `--unverified` strings, reads the commit's files and subjects out of
git the way `note-commit.ts` does, and calls `renderUnverified` and
`appendEntry` — so the entry that gets written is the tool's, not a lane's
recollection of its shape. A line in the commands document, and the cloud
session's rule gains a sentence saying the flag has an afterwards.

## A lib list would unlock the other 4,929 identifier claims in comments

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-19, main (claim: claude/queue-a-lib-list-would-unlock-the-other-4-929-identifi)
- **Files:** `tools/test/doc-names.ts`, `tools/test/doc-drift-names.test.ts`
- **Where:** cloud

`ownSubjectClaims` restricts the new check to identifiers whose head word is a
word of the comment's own file name — 1,523 of the 6,452 backticked camelCase
identifiers a source comment names. The restriction was measured, not guessed:
unrestricted, 205 claims name nothing, and nearly all 205 are platform globals
(`AudioContext`, `Path2D`, `blockConcurrencyWhile`,
`accelerationIncludingGravity`) that a comment is entitled to name. A
hand-kept allowlist of those would rot, which is what this test exists to stop.

So the 4,929 claims outside a file's own subject go unasked, and drift hides
there: `readyButtonBox` in `apps/game/src/briefing.ts` named nothing for days
and was found by hand rather than by the check, because its head word is
`ready` and its file is `briefing.ts`.

The list that is not hand-kept already exists — TypeScript ships it.
`lib.dom.d.ts`, `lib.es*.d.ts` and `@cloudflare/workers-types` declare every
global this repository can legitimately name, and harvesting them the way
`declaredNames` harvests the tree turns the allowlist into a derived file
nothing has to remember. Add them as a second set, drop the head-word
restriction, and see what the 205 falls to; if it falls under a dozen the
restriction can go entirely and the check triples its reach in the same run.

## A missing `SimConfig` row is a type error in `ship-fields.ts`, not its page

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `tools/director/src/ship-fields.ts`, `tools/director/src/ship-fields-choreo-b.ts`, `tools/director/src/ship-notes-choreo-b.ts`

`FIELD_GROUP` is a `Record<keyof SimConfig, GroupName>` and that is the whole
point of it — a field added to the interface and left out of the object is a
compile error rather than a dial nobody can find. But the object is assembled
from spread pages, and the error TypeScript raises is `TS2741: Property
'scuttleSwingMilli' is missing` at `ship-fields.ts` line 32, which is the
declaration of `FIELD_GROUP` and not a file the row may be written into: the
boss rows live on the `-choreo` pages, and a session that has never added one
reads the error, opens the file it names, finds a thousand-line record it is
not supposed to touch, and goes looking. This lane paid that twice, once for
`scuttleSwingMilli` and once for its note.

What to do: a comment above `FIELD_GROUP` naming the pages it is spread from
and the rule for which page a new field goes on — a boss's field to
`ship-fields-choreo*.ts` with a sentence in `ship-notes-choreo*.ts` beside it,
a round's to `ship-fields-round.ts`, the ship's own here — so the error names
the object and the object names the page. The same paragraph is worth a line
in `.claude/skills/new-boss-state`, whose counts section says *one row per new
`SimConfig` field* without saying which of the four files it goes in.

## Unverified at 5780141b: the picture of a carried part and its ring, watched at…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`, `packages/audio/src/bind-choreographed.ts`

*THE SCUTTLE: the pilot carries a hanging part a column along the frame* landed from a session that could not look at it. The commit touched 35 more files. What went unchecked:

- the picture of a carried part and its ring, watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## A new boss event needs a row in bind-choreographed.ts that the skill omits

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `.claude/skills/new-boss-state/SKILL.md`, `packages/audio/src/bind-choreographed.ts`

`.claude/skills/new-boss-state` lists twelve registrations a new boss state
needs, worked top to bottom before the first check. There is a thirteenth it
does not name: the choreographed binder's own switch. A new boss event falls
through to `default: return lateCue(e, cols)` and the typecheck refuses it as
not assignable to `LateEvent` — an error in a file the brief never mentions,
four pages away from the event's declaration, and the only clue is the event's
own name in the message. THE ANTIPHON's `antiphonPull` paid for it this lane.

What to do: a thirteenth row in the table — file `packages/audio/src/bind-choreographed.ts`,
wants the new event in the boss's own `case` group, goes red in the typecheck
— placed after the `SAMPLES` row, since the sample is what makes the event
reach the binder at all. The `-b` and `-c` pages of that binder take the same
rule and are worth naming in the same row.

## THE ANTIPHON's frame test is 366 lines and its touch test is 242

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `packages/render/test/antiphon-frame.test.ts`, `packages/render/test/antiphon-touch.test.ts`

Both are at or over the ~250-line ceiling: the frame test at 366 and the touch
test at 242, and the rail's second handle put lines into both. A test file is
split by what it proves rather than by where the cut falls evenly — the body
and its organs on one page, the rail and its rings on another — so the header
of each says one thing and a reader looking for the crossing does not read the
growth first.

What to do: take the rail out of both. The frame test's organ cases stay where
they are and its rail cases move to a page of their own beside them; the touch
test splits the same way, on the same seam, so the two pages pair. Neither
file changes what it asserts.

## Unverified at 17ed660e: the picture of a candidate coming off the rail — its ri…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/spec/controls.md`, `docs/time-log.md`, `packages/audio/src/bind-antiphon.ts`, `packages/audio/src/bind-choreographed.ts`

*THE ANTIPHON: the navigator pulls a candidate off her rail* landed from a session that could not look at it. The commit touched 35 more files. What went unchecked:

- the picture of a candidate coming off the rail — its ring, the stroke through it and the PULL word under the rail, watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
