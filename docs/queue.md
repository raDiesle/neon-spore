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
- **Files:** `packages/render/src/boss-cue-read.ts`, `packages/render/src/boss-cue-read-b.ts`, `packages/render/src/boss-cue-read-e.ts`, `packages/render/src/boss-cue-read-j.ts`, `packages/render/src/boss-cue-read-o.ts`, `packages/render/src/boss-cue-read-s.ts`, `packages/render/src/boss-cue-read-v.ts`, `packages/render/src/boss-cue-read-f.ts`, `packages/render/src/boss-cue-text.ts`, `packages/render/src/boss-cue-field.ts`, `packages/render/src/canvas2d.ts`
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

**It is not only the two `MOVE`s.** Six real frames of THE UNDERTOW
(`boss-cue-read-j.ts`, one per phase, `--boss-json` cannot build the state so
these were a hand-spawned Chrome reached over `connectOverCDP` mutating
`window.neonSpore.world.boss` directly, the workaround the entry below this
one describes) show the same swallowing on its lobe cues too: `OPEN` (phases
`last` and the ordinary `standing`) and `BURN` (`hard`) sit on a mark lifted
`LOBE_LIFT` (0.8 tile) above the skin, and 0.8 tile is not enough room —
`halfH + 18` still lands the word back down inside the plating's own glow, at
the lobe's neck. `HOLD` (the kind line, drawn *above* the mark) is legible on
every one of the five; the verb below it — `MOVE`, `MOVE`, `OPEN`, `BURN`,
`OPEN` — was legible on none of them, on real screenshots of all five phases
at `p1`/`p2`. So this is every one of THE UNDERTOW's cues, not two of five,
and the fix wants headroom against the mark's *own* lift, not only against
`l.hullY` — a lobe standing taller (THE UNDERTOW's `last` grows to two tiles)
does not buy the word more clearance, since the mark's `y` climbs with it and
`halfH + 18` is still measured from there.

The choice is between a floor of the same shape as `boss-cue-text.ts`'s
`headerTop` ceiling — the verb climbs above the mark when there is no room
under it, which moves the op-count rows of the three bosses above — and moving
the cue's draw out of the field pass to after the ship, which is one line in
`frame-field.ts` and changes what a cue can be drawn *over*. The second is
smaller and the first is what the file already argues for upward; either way
one frame per boss is the proof, and `render/test/frame-budget.test.ts` is
where the cost lands.

**Two more real frames, and `boss-cue-read-s.ts`'s own docstring already knew
about one of them.** Verifying the *Unverified at 628baa61* and *8995ded7*
entries with real PNGs (`bun run frames`, worked around this sandbox's own
browser-launch entry below with a hand-spawned Chrome over `connectOverCDP`,
same as THE UNDERTOW's row above) turned up the fifth and sixth cues this
swallows: THE REPRISE's `CARRY` / `MOVE` on the cannon (`p1`, `--wave "THE
REPRISE" --ticks 905`, `boss-cue-read-s.ts`'s own comment already calls this
mark "the fourth cue to stand on `hullY`") and THE HIVE's `CARRY` / `MOVE` on
the cannon the same way (`p1`, `--wave "THE HIVE" --ticks 400`,
`boss-cue-read-v.ts`). Both screenshots show `CARRY` legible above the mark and
`MOVE` gone entirely into the cannon lobe's own glow, exactly the failure this
entry already describes — nothing new about the shape of the bug, only two
more bosses it reaches. Both bosses' *other* cue (THE REPRISE's `PRESS` /
`FIRE` on the tear, THE HIVE's `PRESS` / `FIRE` on the breach) stands away from
`l.hullY` and reads fine on real frames of its own.

**And a sixth place, found verifying THE LEDGER's `ROOT` in a real frame**
(queue's own "Unverified at 419e7ce9"): `ledgerCues` (`boss-cue-read-o.ts`)
stands the `CARRY` / `ROOT` mark on `ledgerSocketPoint`, which is `{ x, y:
l.hullY }` exactly — the same mark `l.hullY` names above. `CARRY`, the kind
line above the mark, is legible on a real frame taken at the wave's first
beat; `ROOT`, the word `halfH + 18` below it, is not there at all, in a crop
that reaches well past the socket and down to the shield row. This one has no
workaround needed to reach: `bun run frames . --wave "THE LEDGER" --ticks 60`
shows it from the wave's own opening, before any hand has touched anything.

**The second option landed 2026-09-20** (branch
`claude/queue-unverified-at-2154cbd2-the-throats-four-cues-on`), found the
same way every entry above was: verifying this session's own `Unverified` cue
entries (THE ORRERY's, THE CANDLE's) turned up this exact swallowing on a real
frame before this one was ever read. `drawBossCue`'s call moved out of
`drawBodies` to a new `drawFieldBossCue` (`boss-cue-field.ts`, split out
rather than grown onto `frame-field.ts`, which was already at its own
250-line limit), called from `canvas2d.ts` after `drawShip` — which also
reaches the *other* half of THE CANDLE's own swallowing nobody had named yet:
`candle-dark.ts`'s full-column black, drawn between `drawBodies` and
`drawShip`, hid THE CANDLE's cues completely, not just at the hull line. Real
frames confirmed fixed: THE ORRERY's `MOVE` and `BURN`, THE CANDLE's `MOVE`
and `FIRE`, THE THROAT's `MOVE`. `render/test/frame-budget.test.ts` is
unmoved, as expected — the fix reorders when the same calls happen rather
than adding or dropping one.

**Still open:** a real frame of THE MAZE's `MOVE`, and a re-check of THE
UNDERTOW's five (the CDP workaround the entry below this one describes), THE
REPRISE's and THE HIVE's `MOVE`, and THE LEDGER's `ROOT` — the reasoning above
says the reorder should reach every one of them, including the lobe-neck
swallowing on THE UNDERTOW that stood past the hull-line fix alone, since the
cue now draws after everything else regardless of how little clearance a
mark's own lift leaves it, but nobody has looked at a fresh frame of any of
them since this fix landed. THE WARDEN's `HULL_LIFT` constant
(`boss-cue-read-f.ts`) is now very likely a second answer to a question this
fix already answers once, and worth removing — once a frame confirms nothing
there still needs its own lift.

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

## THE CAIRN's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/cairn-hand.ts`, `packages/render/src/cairn-look.ts`, `packages/render/src/cairn-pile.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE WELL's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/well-arrivals.ts`, `packages/render/src/well-body.ts`, `packages/render/src/well-draw.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

6 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

## THE SPLICE's picture looks like something real

- **Found:** 2026-09-18, claude/boss-hints-mechanics-5b5a9f
- **Files:** `packages/render/src/splice-draw.ts`, `packages/render/src/splice-straws.ts`, `docs/spec/bosses.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

2 files draw it today, named for it under packages/render/src. The state it has today is the state to draw — detail,
not a picture per state.

The owner, 18 September 2026: a picture is judged by an eye on a real frame,
which a cloud session does not have — his own machine takes it.

The brief: `.claude/skills/new-boss` section 6.3.

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

## Unverified at 424e7fc4: a real phone browser's own chrome eating the foot of th…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-20, main (claim: claude/queue-unverified-at-424e7fc4-a-real-phone-browsers-own)
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `tools/director/src/director-columns.css`, `tools/director/src/director-phone.css`, `tools/director/src/rail-open.ts`, `tools/director/test/phone-game.test.ts`, `tools/director/test/rail-open.test.ts`
- **Where:** local

*A wave row opens the field, and on a phone the field is the screen* landed from a session that could not look at it. What went unchecked:

- a real phone browser's own chrome eating the foot of the director's GAME view at 375x812 — headless has no chrome to test it with

**This one stays local, and for a different reason than the several "a cloud
session has no screen" entries this session closed today by rendering real
frames instead** (`bun run frames` reads a headless canvas fine). A browser's
own chrome —
the address bar, the bottom toolbar, the home-indicator strip — is drawn by
the OS/browser shell *around* the page, never inside the rendered viewport a
screenshot can reach; headless Chromium has none of it to begin with, so no
frame this repo can render, real event or fabricated state alike, would ever
show it eating anything. This needs an actual phone.

One data point for whoever opens it there: the layout doesn't use `100vh` (the
old trap `dvh` exists to fix — a fixed value that used to lock in the *full*
screen height including whatever the chrome would cover). `director-shell.css`
chains `height: 100%` from `body` down, the same pattern `apps/game/src/
game.css` uses for the shipped field the owner already plays on his own phone.
A percentage chain resolves against the layout viewport a browser actively
reflows as its own chrome shows or hides, which is the correct half of this
problem without reaching for `dvh` at all — so if the foot is still eaten, the
more likely cause is the `director-phone.css` comment's own already-measured
67px aspect-ratio reserve (`min(100cqh, 100cqw / 0.56)`, real and expected)
compounding with a real toolbar's height on top of it, not the sizing method
itself. Worth checking that distinction before touching any CSS here.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## A phone in TEST mode has nowhere to put two bands and the rig

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `apps/game/src/at-a-desk.ts`, `apps/game/src/testing.ts`, `apps/game/src/game.css`, `apps/game/src/viewport.ts`, `tools/director/src/stage-transport.ts`, `tools/build-stamp.ts`
- **Where:** local

The second half of "Choosing P1 in the game's view switch hides the switch
itself", split off where that entry said to split it. The first half landed on
19 September 2026: the switch is taken away by the room now rather than by the
view, so a seat can be left again.

The owner, 18 September 2026: *"Also make sure in director and for game, when I
am in solo test mode, I can also test for both players on mobile device."*

The owner, 20 September 2026: *"Maybe it is already resolved, but in game in
'both seats' the bottom of control set is often cutted, so I can't see buttons
and use them also horizontal the hull skin is vertical cutted inside of the
screen. I suggest to remove build information time version below game screen.
It may push content up and be reason."* Not resolved — this is the same cut he
is describing. His own guess at the cause is worth trying first and is cheap to
try: the `#buildStamp` line (`tools/build-stamp.ts`, styled in `game.css`) sits
under the field and could be the thing pushing the rig's bottom off the bottom
of a real phone's viewport; if pulling it (or moving it somewhere that doesn't
compete for height) does not clear the cut on its own, the layout question
below still needs answering on top of that.

The seat card's own words are *"Both bands and the test rig, for one person at a
desk"*, and the rig is laid out for one. `at-a-desk.ts` is the question the app
already asks about the device, asked in one place on purpose, and nothing in
TEST consults it. What a phone in TEST needs is both bands readable at portrait
width and the rig reachable without covering the field — which is a layout
decision and wants an eye on a phone, not a flag. The director's side of the
same ask is smaller: `stage-transport.ts` binds TEST, P1 and P2 and TEST works;
what a phone cannot do is *reach* that strip.

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

## Unverified at 4515fcc9: the three new gullet sounds - CINCH, SLIP and HAUL were…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-b.ts`, `packages/audio/src/bind-throat.ts`, `packages/audio/src/catalogue.ts`

*THE THROAT's two hands are heard: the cinch, the slip and the haul* landed from a session that could not look at it. The commit touched 11 more files. What went unchecked:

- the three new gullet sounds - CINCH, SLIP and HAUL were never heard; a sound is judged by an ear and this session has none

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

## Unverified at ce22d819: THE ORRERY's rehearsal film watched at tempo — the thre…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Taken:** 2026-09-20, main (claim: claude/queue-unverified-at-ce22d819-the-orrerys-rehearsal-fil)
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/scenes/the-orrery.ts`, `packages/content/test/scene-films.test.ts`

*THE ORRERY: a shot cracks a ring and the pilot's thumb takes it off* landed from a session that could not look at it. The commit touched 19 more files. What went unchecked:

Three of the four are settled now, on real frames. The `OPEN` mark stands on
the cracked ring's own grip exactly as `boss-cue-read-l.ts` says (`--boss-json
'{"phase":"seized"}'`). The winds are real, continuous motion and not a
snap: `--opening guide --guide-page 4 --frames 4 --stride 20` catches the
outer ring's organs turning a little further round in each of four real
frames, mid-wind — and all three rings turn through the one shared
`drawOrreryGrip` (`orrery-grab.ts`), so this is the mechanism, not a fact
about the outer ring alone. The split around the rock is the same picture,
banked correctly across the interruption — `orrery-hand.test.ts` already
proves the state survives the release and the re-grip — so what is left of
it is only whether it *reads* right on a real playthrough, folded into the
one question below rather than counted separately.

- Whether a turn and a half of a thumb per organ (`orreryHandMilliPerOrgan`)
  feels like a decision or like friction, on a real phone, mid-fight. No
  frame answers this: it is a pacing question about a real thumb, not a
  fact about the picture.

Open it on a device that can, and then either take this entry out
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

## Unverified at 5780141b: the picture of a carried part and its ring, watched at…

- **Found:** 2026-09-19, claude/task-queue-work-ym2eim
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/audio.md`, `docs/spec/bosses-choreographed.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/audio/src/bind-choreographed-c.ts`, `packages/audio/src/bind-choreographed.ts`

*THE SCUTTLE: the pilot carries a hanging part a column along the frame* landed from a session that could not look at it. The commit touched 35 more files. What went unchecked:

- the picture of a carried part and its ring, watched at tempo

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## THE HIVE has no rehearsal film: no `the-hive` scene exists

- **Found:** 2026-09-20, claude/queue-the-hive-cannot-be-won-its-own-rock-stops-the-bo
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bosses.md`, `docs/time-log.md`, `packages/content/test/scene-films.test.ts`
- **Where:** local

THE HIVE's own fix (*THE HIVE cannot be won*, answered and landed the same
entry) left the mechanism sound — `hive.test.ts` now fires real bolts and
wins the wave — but authored no film. Every other boss on the choreographed
page walks a rehearsal a player can watch at tempo, seat by seat
(`content/src/scenes/the-scout.ts` and its neighbours are the pattern); THE
HIVE has none, so nobody has watched nine breaches spilling into one shield
at eight beats an opening, only run it headless. A `the-hive` scene, named
and created in `packages/content/src/scenes/`, walking the split the fight
already has — the pilot's colour, the navigator's swell, a seal, a wrong
colour's provoke, the twins from the fifth opening — is the rehearsal lane's
own kind of work, and is unstarted.

## `chromium.launch()` crashes here; the pipe transport is why, not the sandbox

- **Found:** 2026-09-20, claude/queue-the-batons-merge-its-two-handle-rings-still-has
- **Files:** `tools/frames/browser.ts`
- **Where:** local

`tools/frames/browser.ts`'s `launchBrowser()` — and therefore every
`bun run frames`, `bun run shot`, `bun run raster` and the whole of
`tools/frames/test/*` that opens a real browser — fails in this cloud session
with `could not open a browser: launch: Target page, context or browser has
been closed`, reproduced with the tool's own documented command
(`bun run frames . --wave "THE BATON" --ticks 220 --boss-json '…'`, this
session's queue entry's own line) and with `bun test
tools/frames/test/page-said.test.ts`, not just a script of this session's own.

The real reason is one level down: this container runs Chrome as **root**,
where Chrome refuses its sandbox unless told `--no-sandbox` — Playwright
already passes that — but Playwright's *own* transport to the browser it
launches is `--remote-debugging-pipe` (fixed by `playwright-core`, not an
`args` a caller can turn off), and the launched Chrome dies with `SIGTRAP`
the instant that pipe is opened, here, with no further message on either
stream. Confirmed by hand: `chromium --headless --no-sandbox
--remote-debugging-port=N` (TCP, not the pipe) starts and answers
`/json/version` cleanly, and `playwright-core`'s `chromium.connectOverCDP`
against that same manually-spawned process opens pages, navigates and
screenshots exactly as `chromium.launch()` is supposed to.

So the fix is not `--no-sandbox` (already there) and not a Chrome path
(`findChrome()` already finds one and it runs). It is `launchBrowser()`
falling back to spawning `findChrome()` itself with `--remote-debugging-port`
and connecting with `connectOverCDP` when the ordinary `chromium.launch()`
throws — the same shape `docs/cloud-session.md` already describes this
sandbox needing for wrangler's own quirks. Until it does, a cloud session
that needs a real frame has to hand-roll the workaround this entry describes,
which is real friction for every future frame this sandbox is asked to take.
`bun test tools/frames` after any fix, on this machine specifically — the
tool's own tests pass or fail on exactly this.

**It is not every worktree alike, and the reason is `launchBrowser`'s own
profile path.** `bun run tools/frames/test/opening.test.ts` is green, every
time, run from `/home/claude/ns-cairn` — and red, every time, with this same
error, run from `/home/claude/ns-undertow-cues`, on the same commit, the same
Chrome, the same container: the only thing that differs is the path
`profileRoot()` (`tmp-litter.ts`'s `tmpRoot(root)`) builds the profile under,
which is longer by exactly the worktree directory name's own length. That
points at the well-known Linux `AF_UNIX` path ceiling (108 bytes,
`sun_path`): Chrome's `ProcessSingleton` puts a real socket in a *short*
system path and symlinks the profile's own `SingletonSocket` to it — but only
when it can find that short path by asking `$TMPDIR`/`$TMP`/`$TEMP`, which
`launchBrowser`'s own `underTmp` has just pointed at the *same long directory*
this profile already lives under, for the reason its own header gives
(so a killed run's litter is findable under `.claude/tmp` rather than
system temp). So the fallback the sandbox otherwise takes for a deep path is
the one thing this tool disables, and a worktree whose name pushes the
profile path a few characters past the ceiling loses the browser outright —
`ns-cairn` (18 characters of directory name) stays under it and
`ns-undertow-cues` (28) does not; this is about the number, not the words.
Confirmed by hand: `launchBrowser()` from each of two worktree copies of the
exact same commit, run back to back, four times each — `ns-cairn` opened a
browser every time and `ns-undertow-cues` failed every time, with `.claude/tmp`
freshly emptied in both first. So this session's earlier root-cause (the pipe
transport dying under root) may be the *whole* story on a short enough path,
or `--remote-debugging-pipe` may itself be sensitive to the same ceiling
through some file it opens beside the profile — either way, a fix that only
retries with `connectOverCDP` on failure (the shape argued above) sidesteps
both causes at once and does not need this one settled first, but a fix that
instead shortens `launchBrowser`'s own path handling (not letting `underTmp`
hand Chrome's own short-path fallback the long directory back) is the other
shape worth weighing, since it would let `chromium.launch()` itself keep
working rather than adding a second code path beside it.

**A third data point, and a bind mount is the workaround until either fix
lands.** `/home/claude/curtain-batch` — a name no longer than the ones already
compared above — fails the same way, confirmed by hand the same four-tries
way this entry's own middle paragraph did: `tools/frames/test/opening.test.ts`
red every time from that path, freshly-emptied `.claude/tmp` each time. `mount
--bind` onto a short empty directory (`mkdir /cb2 && mount --bind
/home/claude/curtain-batch /cb2`, no `git worktree move`, no copy) gives every
command run from `/cb2` the identical tree under a short path — git follows it
as an ordinary path rather than a symlink, so `git status`, `git rebase` and a
commit all work unchanged from there — and both `bun run frames` and `bun
test`/`bun run check:fast` (whose own browser-backed specs hit this same
crash) go green from `/cb2` with no code touched. This is the workaround a
session in a long-named worktree can reach for right now; it does not replace
either fix shape above; a session that cannot free-hand a mount should fall
back to pushing the branch unlanded instead.

## The queue's own resurrection guard missed a stale entry coming back

- **Found:** 2026-09-20, claude/queue-a-landing-that-forgot-unverified-has-no-way-to-w
- **Taken:** 2026-09-20, main (claim: claude/queue-the-queues-own-resurrection-guard-missed-a-stale)
- **Files:** `tools/land/queue-guard.ts`, `tools/land/queue-merge.ts`, `tools/land/test/queue-merge.test.ts`, `docs/queue.md`

`tools/land/queue-guard.ts` exists to refuse a landing that would put back a
`docs/queue.md` entry the trunk has already removed (`resurrectedAfter`, since
`61c82403`, 5 September 2026). It missed one. *A landing that forgot
`--unverified` has no way to write the entry afterwards* was filed by
`1762eafa`, claimed, fixed and removed in the same commit by `6db42a92` — and
then put straight back, word for word, `Taken:` line and all, by `5780141b`,
twelve commits later in the trunk's own linear history, with `6db42a92`
already its ancestor. The same commit correctly dropped two *other* entries
the trunk had finished meanwhile (THE SCUTTLE's own state-count entry and
`sound-link-none-b.ts`'s line-count entry), so whatever went wrong picked one
entry out of three and got only that one backwards.

This session found the stale entry still sitting in `docs/queue.md`, the fix
it named already built and shipped, and closed it with `bun run queue done`
rather than chasing the merge — that fix was this session's actual assignment.
Chasing it needs `queue-merge.ts`'s `mergeQueue` and `queue-guard.ts`'s
`resurrected` run against the real three-way inputs `5780141b`'s own landing
saw — the merge-base's copy of `docs/queue.md`, the trunk's copy at
`6db42a92`, and whatever that lane's branch carried for the file — to find
which of the two let this one through where it caught the other two.

**A later session did exactly that, as far as it can be done.** `mergeQueue`
is a pure function of three strings, and it is provably correct for the
shape this bug describes: a new test (`three entries the trunk finished in
one go all stay out, not just some`) hands it a base, a trunk and a lane
that all differ only in which of four entries the trunk removed, mirroring
`5780141b`'s own three-out-of-four, and all three come out dropped, not just
two. Every other shape the function's own branches distinguish — an entry
only the lane removed, one only the trunk removed, one both sides rewrote,
one neither side touched — was already covered before this session and
still passes. So `mergeQueue` itself is not where this went backwards.

**What's actually missing is the historical evidence, not more reasoning
about the function.** `5780141b`'s lane was a single, non-merge commit —
its pre-rebase branch and the reflog that would show git's three real
conflict stages for that one rebase both lived in whatever session did
that landing, and neither reached this repository's own `.git`; a
synthetic reproduction here can only mirror the shape the entry describes,
not the actual bytes git handed the resolver that day. Two live
possibilities this session could not rule out without that evidence: git
resolved `docs/queue.md` with no conflict at all for that commit (a
deletion far enough from anything the lane's own diff touched merges
cleanly, and `queue-guard.ts`'s check runs either way — so a clean merge
isn't itself the gap, but it would mean `mergeQueue` was never called and
so never had the chance to get it right); or `queue-guard.ts`'s own
`git merge-base TRUNK HEAD`, asked once before the replay, disagreed with
whatever ancestor git's internal rebase machinery used for that specific
commit's own conflict resolution, which the two would not do for an
honestly single-rebase lane but could if that lane's branch had itself
been rebased earlier in its life. Proving either needs a live repro that
actually rebases a *twice-rebased* single-commit lane through a git-real
conflict and inspects what stage 1/2/3 hold each time — a longer sitting
than this one, and worth starting from `tools/land/test/queue-merge.test.ts`'s
existing `replaying a lane that drained an item` integration test rather
than the string-level unit tests above it.

## THE GIMBAL is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`
- **Where:** cloud

`docs/spec/bosses-choreographed.md` §18 is a full design — the question, the
silhouette, both seats, a fourteen-row beat list, which of `THE SLOW` or
`THE DRAG` it wants, the colour statement — for a boss nobody has started.
Build lane one only: `gimbalOuter` and `gimbalInner` as two new `BearingDrag`
members of `DragTarget` (the crank's own gesture, `sim/crank.ts` and
`orrery-hand.ts` are the pattern to copy), the mirrored-bearing rule that
draws each ring turned the way its own face would show it
(`PerSeatTruth`, the Queen's primitive, spent on a bearing), the six
latch-teeth as `World` fields in `hashWorld`, the wave entry with its guide,
and one test per receipt. `.claude/skills/new-boss` §4's file table is the
generic list; §18's own write-up is the design to build against, named
`docs/queue.md`, *what is not built*.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE GIMBAL's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

Lane two of §18, once lane one lands: a sealed drum inside two nested rings
at right angles, six poses (`.claude/skills/new-boss` §5's INSTAR standard —
a body, a pose per state, a morph between them, the perspective changing at
the hatch). The payoff frame is the drum splitting along its seam and
swinging open toward the ship, which is a new silhouette — check
`packages/content/src/silhouettes.ts` first, then draw it, never a filled
rectangle with a stroke round it. One PNG to the owner when it moves, never a
description.

## THE BELLOWS is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`
- **Where:** cloud

`docs/spec/bosses-choreographed.md` §19 is a full design: two ordinary
depth-drags (`bellowsPull`, `bellowsPush`, the pattern is `sinewLeft` and
`sinewRight`), `Alternation` (THE BATON's own primitive) spent refusing
whoever *didn't* just act rather than whoever did, and `SimultaneousAction`
(THE BALLOON's own primitive) for the one beat both seats let go together.
Four seams as hashed `World` fields, the wave entry with its guide, one test
per receipt. Nothing here asks the engine for anything new — that is the
design's own point, argued in §19's *Cost* line.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE BELLOWS's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

Lane two of §19, once lane one lands: a double-chambered bellows-lung, five
poses (`.claude/skills/new-boss` §5's standard), the waist's four seams
narrowing and drawn rather than counted, the finale of both halves falling
apart and venting one harmless cloud. A new silhouette — check
`packages/content/src/silhouettes.ts` first. One PNG to the owner when it
moves.

## THE HASP is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`
- **Where:** cloud

`docs/spec/bosses-choreographed.md` §20 is a full design: `haspLatch` (a
hold, read by depth for its own unseen heat) and `haspWheel` (a bearing drag,
the way `orreryRing` is) as two new `DragTarget` members, and the gate
between them — the wheel may turn only while the latch is currently held —
read as an ordinary per-tick check of both hands in the boss's own step
function; §20's own write-up says plainly that this needs no new primitive.
Three hasps as hashed `World` fields, the wave entry with its guide, one test
per receipt.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE HASP's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

Lane two of §20, once lane one lands: three sealed hasps down the field's
centre line, five poses (`.claude/skills/new-boss` §5's standard), the
latch's own heat as a slow colour drift rather than a bar, the row swinging
open together at the end. A new silhouette — check
`packages/content/src/silhouettes.ts` first. One PNG to the owner when it
moves.

## THE SPOOL is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`
- **Where:** cloud

`docs/spec/bosses-choreographed.md` §21 is a full design: `spoolBrake` (a
depth-hold with no readout of its own) and `SplitGauge` (shipped twice
already, THE SINEW and THE SURGE) for the zone she is shown against the
depth he feels. Four ribs as hashed `World` fields, each easing on a clean
movement rather than cracking, the wave entry with its guide, one test per
receipt. §21's own *Cost* line says this asks the engine for nothing new.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE SPOOL's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

Lane two of §21, once lane one lands: a thread-spool creature slung sideways
across the top of the field, five poses (`.claude/skills/new-boss` §5's
standard) — taut and still, the brake shallow and paying fast, deep and
paying slow, a rib easing open, slack and drifting free — with no number
ever drawn on the picture, only how fast the line visibly moves. A new
silhouette — check `packages/content/src/silhouettes.ts` first. One PNG to
the owner when it moves.

## THE RATCHET is written and nobody has built its simulation

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-union.ts`, `packages/sim/src/boss-entries.ts`, `packages/sim/src/bosses.ts`, `packages/net/src/command-fields.ts`, `packages/content/src/waves/act-7e.ts`
- **Where:** cloud

`docs/spec/bosses-choreographed.md` §22 is a full design: `ratchetCatch` (a
hold) and `ratchetPawl` (a press, the way THE MAW TAP is) as two new
`DragTarget` members, `SequentialAction` (§16's own primitive) gating the
press on the hold, and a rack that only ever advances — never backward — on
a press, catch primed or not, with an unprimed press burning a tooth for
nothing. Seven teeth as a hashed `World` field, needing five clean advances
of the seven to open; the wave entry with its guide, one test per receipt.
§22's own write-up is explicit that this is a single line in the boss's own
step function, not a new primitive.

The picture is a separate item, `LOCAL ONLY`, below — do not start it here.

## THE RATCHET's picture has never been drawn

- **Found:** 2026-09-20, claude/queue-five-choreographed-bosses
- **Files:** `docs/spec/bosses-choreographed.md`, `packages/content/src/silhouettes.ts`
- **Where:** local

Lane two of §22, once lane one lands: a toothed climbing rack in full view of
both seats, four poses only — fewer than any other boss on the page, on
purpose, since the picture is the rack's own remaining teeth rather than a
body changing shape (`.claude/skills/new-boss` §5's standard, read against a
boss that is mostly still). A burned tooth is drawn as a flat, unlit
non-event; a clean advance gets a visible click and jolt. A new silhouette —
check `packages/content/src/silhouettes.ts` first. One PNG to the owner when
it moves.
What to do, and the two halves are separable. The cheap half is to notice:
`Lockstep` can take the tick its run started on and count a peer message that
arrives before it, so the ledger reports *commands lost at the start* rather
than a fingerprint mismatch at tick 240. The real half is to hold what arrives:
a pre-begin buffer in `link-run.ts` fed into the new scheduler, which needs the
messages of the *previous* run kept out of it — the room stamps a fresh beat
zero for every rejoin and an old run's ticks are far ahead of a new one's, so
the buffer has to be cleared on every `end` and on every welcome that moves the
stamp. `two-devices-opening.test.ts` already drives two devices through a beat
zero over a wire it controls, so a case that begins one device late belongs
beside the ones there.

## A partner who vanishes on the room screen is still drawn as present

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `apps/server/src/room.ts`, `apps/server/src/room-route.ts`, `apps/server/test/room.test.ts`

The room counts its seats only when something asks it to — a relayed `input`,
`confirm` or `hash`, a press, or an arrival. During a run that is every frame,
so a seat whose socket vanished is evicted within a beat of the window running
out and the survivor is told `peers: 1` at once. On the **room screen** nothing
is relayed: the only message either phone sends is a `ping`, and `ping` answers
a `pong` without ever asking who is in the room.

So a phone that vanishes while the pair are looking at each other's circles is
never noticed. Proved against the shipped worker with the window shortened
through `vars`: the survivor pinged for twice the eviction window and heard
nothing, then pressed READY and was told `peers: 1` in the same breath. Until
that press their screen draws a partner who is gone, with a circle they can
hold and a wait that will never end on its own — which is the one screen in the
game whose whole job is to say whether the other person is there.

What to do: have the `ping` case count the seats the way the other cases do,
which is one call to the room's own `seats()` and costs a tag read per socket
every 700 ms. The eviction and the `peers` that follows it are already written
— `occupiedSeats` hangs the dead socket up and `webSocketClose` announces it —
so this is only about asking. `room.test.ts` has the harness: two phones, one
falls silent, the other pings and is told without pressing anything.

## `stage.ts` is at the 250-line ceiling exactly

- **Found:** 2026-09-20, claude/queue-tasks-model-switching-e53403
- **Files:** `tools/director/src/stage.ts`, `tools/director/src/stage-touch.ts`
- **Where:** cloud

The desk's stage is now 250 lines, which passes `limits.test.ts` and leaves the
next lane nothing. It got there by one line: the cue key's held thumbs have to
move before the world steps, so `advance()` calls `touch.cueTick()` — and
paying for that meant folding a two-line comment about *why* down to a
trailing one, which is the argument thrown away to buy the line.

What to do: cut the loop out. `stage.ts` holds the wiring (`run`, `stop`,
`advance`, `stepOnce`, the key drain) and the URL/params reading around it, and
the wiring is the half that has grown three times this month. A `stage-loop.ts`
taking the pieces it drives — `world`, `keys`, `touch`, the painter — and
returning `{ run, stop, advance }` would leave `stage.ts` the assembly it reads
as. `tools/director/test/` already drives the stage end to end, so the split is
proved by tests that exist.

## Two beats to land together is the whole difficulty of THE INSTAR

- **Found:** 2026-09-20, claude/queue-tasks-model-switching-e53403
- **Files:** `packages/sim/src/config.ts`, `packages/sim/src/instar-step.ts`, `packages/content/src/instar-script.ts`
- **Asks:** Keep `instarTogetherBeats: 2` for every pose, widen it, or let each step name its own?

The owner, 20 September 2026, after watching the second pose: *p2 pulls but
it is incorrect, why… maybe this time frame for p2 to pull is too short,
which makes it too hard for p2 to hit it.* Half of that was the picture not
saying which clock was running, and that half is fixed: a mark that is done
now draws the together window closing into it and says `WAITING`
(`render/instar-together.ts`). The other half is the number itself, and it is
his.

What the number is. A pair have the step's whole `windowBeats` to work in —
8 to 12 in the shipped script — but a mark answered alone waits
`instarTogetherBeats` for its partner and then goes back to nought
(`slipLonely`). At `tickHz: 120` and `bpm: 96` that is 2 beats, 1.25 seconds.
It is not the time to *act*; it is the gap between the two finishes. Held
gestures (`pullDown`, `pullUp`, `hold`) are exempt — only the counted ones
(`tap`, `swipeDown`, `turn`) can slip — so the poses this bites are `armed`
(p1 taps 6 against p2's three swipes) and `moulted` (p2 taps 8 against p1's
turn), which are exactly the two he was on.

Three ways to answer, and what each costs:

1. **Leave it at 2.** The new reading may be the whole fix — the difficulty
   was never being seen, and 1.25s between two finishes is a fair ask once
   both screens say so. Costs nothing; risks another report.
2. **Widen `instarTogetherBeats` to 3 or 4.** One field in `config.ts`, one
   number, every existing test still passes because they all assert relative
   to the field. It makes the whole fight easier by the same amount, including
   the last pose, which is meant to be the hard one.
3. **Per-step.** `BossSequenceStep` gains an optional `togetherBeats`, the
   config value becomes its default, and `instar-step.ts` reads the step's own
   — so `gape` and `armed` can be forgiving while `turned` and `lunge` stay
   tight. About thirty lines across sim and content, plus a row in
   `hashWorld` coverage for nothing (the field is authored, not state), and it
   is the only option that can make the teaching poses easy without making the
   ending easy.

A fourth thing he said is not this entry and is not queued: *this is generic
feedback of choreographed bosses.* The other four read their asks through
`bossCues` and have no together clock at all — THE BATON's merge and THE
CAIRN's hold are timed against the beat, not against each other — so there is
nothing there to widen. If the answer here is 3, whether the same per-step
knob should exist for them is a second question for a second entry.
