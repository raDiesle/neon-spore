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

## THE WELL draws none of the field's transients but a kill's burst

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Taken:** 2026-09-13, claude/queue-the-well-draws-none-of-the-fields-transients-but
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

## Two phones that reconnect on different waves restart the same wave together

- **Found:** 2026-09-13, queue-lanes — asked for by the owner
- **Files:** `apps/game/src/link-run.ts`, `apps/game/src/link.ts`, `apps/game/src/hold.ts`, `apps/game/src/main.ts`, `apps/game/src/menu-link.ts`, `packages/net/src/protocol.ts`, `apps/server/src/room-start.ts`, `packages/net/src/desync.ts`
- **Where:** cloud

The owner played a two-device game, a phone dropped its socket and came back,
and afterwards the two phones were on **different waves** — one of them in a
wave's guide, the other on the field — with nothing on either screen saying
so. `HashLedger` (`desync.ts`) reports the first tick the worlds parted, and
`join-words.ts` turns it into "The two worlds parted at tick N. This is a
bug", which is true and is not an answer for two people holding phones.

What the game should do instead, in the owner's words: **detect that it is
out of sync, open the PLAY menu on both phones** (the menu the item below
renames from TWO DEVICES), and when **both press CONTINUE**, restart together
on **the same wave, with that wave's guide** if it has one. The wave to
restart on is a decision the room has to make once for both — the *furthest*
the pair reached, as the room's `RunMark` already records it (`best.wave` in
`welcome`), is the obvious candidate; carry it in the `start` the room sends
so `startTogether` in `main.ts` jumps to it rather than to 0. The desync
signal itself is already there (`desyncTick` on the run); the ledger's
`pending` state after a reconnect and a `welcome` that arrives mid-wave are
the two cases to test. CONTINUE is only offered while both phones are
connected (`peers === 2`) — see the menu item below — so a phone that
presses it alone waits, and the hold card (`hold.ts`) says for what.

`packages/net` has the scheduler's unit tests; the room end is
`bun run relay:check` (`.claude/skills/net-change`), which a cloud session
cannot run and says so as unverified.

## The menu is hard to read: a colour scheme with contrast, and a face from a CDN

- **Found:** 2026-09-13, queue-lanes — asked for by the owner
- **Files:** `apps/game/src/menu.css`, `apps/game/src/game.css`, `apps/game/index.html`, `apps/game/src/menu-view.ts`
- **Where:** cloud

The owner finds the menu's text hard to read on a phone — the purples on
purple in `menu.css` (`#6f639f` on the dark ground, `#4b4177` for a
description) are well under the contrast a body of text needs. He asks for
**a good colour scheme, Material Design named as the example**, and **a
better font from a public CDN**.

Do it as a set of named custom properties at the top of `menu.css` — ink,
paper, muted, accent, warning — with the pairs checked against WCAG AA (4.5:1
for text, 3:1 for the large labels), and one face loaded with a `<link>` in
`index.html` (Google Fonts is the public CDN the app can reach; pick a
geometric sans with a real fallback stack, and keep the title's own glow
treatment). The field's HUD (`game.css`) keeps its palette: this is the
menu, and the pages behind it. It is a look the owner asked for by name, so
it lands rather than going to VERSUS; a cloud session cannot see it and says
so, and the local session that verifies it sends one PNG of the front page.

## A player signs in with Google or by an email link, and the menu says who

- **Found:** 2026-09-13, queue-lanes — asked for by the owner
- **Files:** `apps/game/src/nickname.ts`, `apps/game/src/join-name.ts`, `apps/game/src/menu-settings.ts`, `apps/server/src/names.ts`, `apps/server/src/index.ts`, `packages/net/src/nickname.ts`, `packages/net/src/protocol.ts`
- **Where:** cloud
- **Asks:** Google sign-in, an email link, or both — and which Google Cloud project's client id and which mail sender does the Worker get?

Today a device claims a nickname at the registry (`names.ts`) and is handed a
**recovery code**, shown once, for getting the name back on a new browser.
The owner wants that replaced by a sign-in: **OAuth (Google is his example)
combined with a freely chosen nickname**, or **an email address that is sent
a link** which signs this browser in as that nickname. Whichever it is, the
sign-in and the nickname are **remembered** so the next opening of the app
is already signed in, and the PLAY page (the renamed TWO DEVICES page) shows
**"logged in as <nickname>"** at its top.

What the answer picks between. *Google only*: one OAuth client id, the
Worker verifies the id token and binds its `sub` to the nickname — the least
code and no mail to send, and a player without a Google account cannot play
across devices. *Email link only*: the Worker needs a sender (Cloudflare
Email Routing does not send; a Resend or MailChannels key does) and a signed,
expiring token in the link — more moving parts, no third party at the door.
*Both*: the two above behind one "who are you" screen. Either way the
registry keeps `TOKEN_KEY`'s job — a browser known to the registry — and the
recovery code goes, along with its page in settings. The nickname's rules
stay in `packages/net/src/nickname.ts`, where both ends read them. The
server's tests are `bun test apps/server`; the sign-in round trip against a
real provider is unverified from a cloud session.

## The game says the players' nicknames where it now says Player 1 and Player 2

- **Found:** 2026-09-13, queue-lanes — asked for by the owner
- **Files:** `packages/net/src/nickname.ts`, `packages/render/src/siren-seats.ts`, `packages/render/src/grip.ts`, `apps/game/src/menu-seats.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/view.ts`, `packages/content/src/scenes.ts`
- **Where:** cloud

On the field, in the guides and on the menu's seat cards the two seats are
called **P1 / P2** or **Player 1 / Player 2** (`siren-seats.ts` draws the
letters, `grip.ts` writes "P2 PULLS", the guides' pages say "Player 1 holds
…"). The owner wants the **nicknames** there instead, everywhere a person
reads a seat's name in play — and to make that safe, the nickname's alphabet
and length **limited** so a name never breaks a label: the field's labels are
drawn in a fixed box at a fixed size, and a guide page has a line's width.

The rules live in one place already — `packages/net/src/nickname.ts`,
`isName`/`normalizeName` — so tighten them there (letters, digits, space and
a hyphen; a length the widest label can carry, which `siren-seats.ts` and
`grip.ts` decide, measured with the stub's `measureText`), and thread the
names through: the room already sends both in `welcome.names`, the renderer
gets them on the `View` it is handed each frame, and the guides take a
`{p1, p2}` pair at page-build time rather than a literal. Where a name is
absent (a one-device run, a seat not yet filled) the old words stay. The
`docs/` prose and the director's sheets keep saying Player 1 and Player 2:
they are about the seats, not the people. Frame tests (`grip-frame.test.ts`,
the siren's) and the guide-page tests prove the substitution; a name at the
length limit is one of the cases.

## A new game is started at a difficulty — Easy, Medium or Hard

- **Found:** 2026-09-13, queue-lanes — asked for by the owner
- **Files:** `packages/sim/src/config.ts`, `packages/sim/src/config-derived.ts`, `apps/game/src/progress.ts`, `apps/game/src/menu-entries.ts`, `apps/game/src/menu-link.ts`, `packages/net/src/protocol.ts`, `apps/server/src/room-start.ts`
- **Where:** cloud
- **Asks:** Is difficulty the tempo alone, or the tempo plus the hull's hits — and is today's speed Medium or Hard?

The owner wants **three difficulties, Easy, Medium and Hard**, chosen when a
new game is created and shown on the PLAY page. A pair may change it later,
but changing it **warns that the whole wave state resets** and the run starts
again from the first wave. His own suggestion for what it changes is one
thing: **the falling speed of everything**; and he puts today's speed at
Medium or Hard.

Everything falls a tile a beat, so falling speed *is* the tempo: `bpm` in
`SimConfig`, with `tickHz` chosen so a beat is a whole number of ticks. Easy,
Medium and Hard as three `bpm` values is one field on the config and nothing
in the rules. The options the answer picks between:

- *Tempo alone*, the owner's suggestion — three tempi, today's being Medium
  (so Hard is faster than anything shipped) or Hard (so today's speed is the
  ceiling and Easy and Medium are slower). The guard and intake windows are
  in milliseconds, so a faster beat also tightens them relative to the beat,
  which is the right direction.
- *Tempo plus the hull*: `maxHoles`/`maxScars`, the hits a ship takes before
  the wave is lost — Easy takes one more, Hard one fewer. Two knobs, still no
  rule change, and the one that makes Hard *hurt* rather than merely hurry.
- Not recommended: a per-creature speed table or a change to the guides —
  every wave is authored to the beat and would need re-timing.

The chosen level is part of the run: it goes in `progress.ts` beside
`furthest`, is sent by the room in `start` so both phones play the same
`bpm`, and is part of the world's config hash so a pair at different levels
desyncs at tick 0 rather than a minute later. `bun test packages/sim`
already plays every wave from a seed; run it at the three tempi.

## A director save can land `main` red, and two tests are the reason

- **Found:** 2026-09-13, queue-lanes
- **Files:** `tools/director/src/waves-commit.ts`, `packages/net/test/two-devices-wave.test.ts`, `tools/perf/test/baseline.test.ts`, `tools/perf/unmeasured.ts`

On 13 September 2026 the owner saved FIRST STEP from the wave editor — one
red body became eight — and the save committed straight onto `main`
(`waves-commit.ts` commits by path and runs no check, by design: a save must
not fail). The next lane's `bun run land` found the trunk red with two
failures that were nobody's lane: `baseline.test.ts` saying FIRST STEP
"sends something else now", and `two-devices-wave.test.ts`, whose press
script is written by hand against FIRST STEP's one body. This lane fixed
both — `bun run perf --unmeasured` for the row, a new script for the eight
bodies — and the next save of act one will break them again.

Two things to do. **The save runs `bun run perf --unmeasured` itself** and
commits `tools/perf/baseline.json` with the wave files: it is mechanical,
needs no measurement, and is exactly the step a session that cannot run
perf is told to take. **The lockstep test stops reading `WAVES[0]`**: what
it proves is two devices crossing a wave boundary in step, which needs a
wave with a known body and a known clear, not the wave the owner edits most
— give it two small waves of its own through `queueFromWave` (the director's
unsaved-wave path) and keep the name assertions only as a comment about why.
`bun test packages/net tools/perf tools/director` proves both.

## The map editor inserts a beat row and removes one, shifting the rows after it

- **Found:** 2026-09-13, director-repeat — asked for by the owner
- **Files:** `tools/director/src/grid.ts`, `tools/director/src/paint.ts`, `tools/director/src/query.ts`, `tools/director/src/director-map.css`

The MAP section draws a wave as beats down and the seven authored columns
across, and the only way to make room for a beat in the middle of a wave is
to move every later cell down one by hand, one drag at a time. The owner
wants **an add button beside each beat row** that inserts an empty beat
there and **shifts every row after it one beat later**, and — asked for
again the same day — **a remove button** that takes a beat row out and
shifts every row after it one beat earlier.

Both are one edit on the wave's data, in `paint.ts` beside `paint`/`eraseAt`
where every other edit of a wave lives: `insertBeat(wave, beat)` adds one to
the `beat` of every entry, pod and boss cue at or after it; `removeBeat(wave,
beat)` drops what is on that beat and subtracts one from everything after —
and a remove of a row with anything on it asks first, since the editor has
no undo. The buttons
belong on the beat label (`beatLabel` in `grid.ts`, which today only seeks),
two small glyphs that appear on hover so the column of numbers stays a column
of numbers, styled in `director-map.css`; `render()` already rebuilds the
grid from the wave, and `beatCount` grows with the last beat. Tests beside
`paint`'s prove the shift and that the beat-0 row can be added before but
not removed. Whether the buttons read on the map is a browser question for a
local session.

## THE HANDOVER's guide is prose, and the thing it teaches is a picture

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/waves/act-8.ts`, `packages/content/src/scene-types.ts`

The wave that introduces THE HANDOVER carries a three-line prose guide and no
`scene`, the way THE WEIGHT's and THE CAIRN's do. It is worse here than for
either of them, because what the fault does is **change the picture**: three
sentences have to assert that the band the pair is looking at will become the
other one, when a rehearsal could simply let it happen while they watch.

What a rehearsal would show, in three pages: the seat's own band, named, with a
ghost thumb on the control it has been using all game; the plate on the lip of
the band counting down and the beam reaching for the panel; and the same screen
after the trade, in the other seat's colours, with the ghost thumb landing on
the button that is no longer there. `scenes.ts` holds the choreography and the
scene carries its own `malfunction` already (`scene-script.ts`), so a scene
naming this fault and stepping past `handoverAtBeat` trades inside the
rehearsal with no new machinery at all — the renderer seats a film's frames
exactly the way it seats a wave's. `.claude/skills/new-tutorial` has the rules;
`bun test packages/content` and the guide-page tests prove it.

## The director's stage speaks for its role bar while the panels are traded

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `tools/director/src/stage.ts`, `tools/director/src/stage-touch.ts`, `tools/director/src/stage-rounds.ts`

The stage draws a handover wave correctly — the renderer seats every frame
itself — and its band is answered correctly too, because `stage.ts` hands both
hit tests a seated layout. Two things below that still read the role bar
directly: `pointerSeat(role)` fills `Field.seat`, which is right and should stay
(a hand on the field is signed by the device, `sim/handover.ts`), and
`speaksFor` and `bindStageRounds`' `role` are the ones that are wrong — a round's
slabs are laid out for the untraded seat while the frame draws the other one, so
a boss round on a wave carrying this fault answers buttons where it is not
drawing them.

No shipped wave carries both a round and a fault, which is why this is an entry
and not a defect in the game. What to do: give `bindStageRounds` and the parts of
`stage-touch.ts` that pick a *panel* the seated role (`handedRole` is exported
from `@neon-spore/render`), and leave the parts that pick an *identity* — the
briefing gate's `speaksFor`, `pointerSeat` — on the role bar's own seat. The
line between the two is written out at the top of `packages/render/src/handover.ts`.

## THE HANDOVER makes no sound

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/audio/src/catalogue.ts`, `packages/render/src/handover-look.ts`, `docs/spec/audio.md`

The loudest moment the fault has — both panels changing screens on one beat — is
drawn and never heard. Every other fault is a thing that *acts* and is heard
doing it (a shot fired by nobody, a dome coming up unasked); this one changes
what is in front of the pair and the mixer says nothing, so a pair looking at the
field at that moment has only the plate's flash to tell them.

There is no total map forcing a cue for it, which is why nothing failed. What to
do: one cue on the beat of the trade and one on the beat it comes back, quieter —
they are the same event twice and should not be the same sound, since one of them
is a relief. The trade is a `handedOver` edge, which nothing emits as a
`SimEvent` today: either the mixer reads the clock the way the plate does
(`handoverLeft`, `handoverWarning`), which keeps the simulation untouched and is
what this fault has done everywhere else, or the fault starts emitting an event
and stops being free. Read `docs/spec/audio.md` before choosing; the first is
almost certainly right.

## Should THE HANDOVER trade once a wave, or keep trading?

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/sim/src/handover.ts`, `packages/sim/src/config-malfunction.ts`, `packages/content/src/waves/act-8.ts`
- **Asks:** Should the panels trade once a wave, or keep trading on a cycle like THE CODEX's key?

Built as **one window**: the panels change screens at `handoverAtBeat`, come back
`handoverHoldBeats` later, and that is the whole of the fault. It is the reading
of *swap, then back* the wave was asked for, and it makes the trade an event —
counted down to, lived through, and over.

The alternative is THE CODEX's shape, which is the other fault that takes nothing
away: its key turns over every four beats all wave, deliberately, so that the
pair has to *keep* calling it rather than learn one fact. A handover that kept
trading would be that argument applied here — the pair never settles into either
seat, and every arrival lands on whoever happens to be holding the thing that
answers it.

Three answers this picks between. **One window** is what is built: one number for
the beat, one for the length, and the wave is authored around it (`act-8.ts`
opens with two bodies in their own hands so the trade costs them something).
**A cycle** is `handedOver` becoming `Math.floor(faultStep / hold) % 2`, one line,
plus a third number and a wave authored evenly rather than around a moment; it
also makes the countdown plate permanent furniture, which is a look nobody has
seen. **Both, authored per wave** is the largest: `Malfunction` gains a field the
way a cannon fault carries its colour, and the director's picker gains a row —
worth it only if two waves would genuinely want different answers.

## HULL · TRADED answers THE HANDOVER a second way and is not in VERSUS

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `tools/shape-sheet/src/drafts/ship.ts`, `tools/versus/candidates/`, `packages/render/src/handover-look.ts`

The shape sheet carries `HULL · TRADED` — two lobes on the ship's own membrane
exchanging what they carry, three columns apart, complementary heights, five
seconds a cycle — drawn at the Handover idea while it was still an idea. The
idea shipped on 13 September 2026 and the announcement that shipped with it is a
plate on the lip of the band plus the band itself coming up in the other seat's
colours, so the drawn pair of lobes is now an *alternative* to something the game
draws rather than a picture offered to a concept.

It was left `free` in the sheet in the lane that built the fault, because a draft
that names a built concept orphans the sheet's join (`concept-art.test.ts`) and
because carrying it across is not a rename: a VERSUS candidate patches a record
and is judged against the shipped look in a pair of shots
(`docs/versus.md`, `tools/versus/candidates/`). What to carry: the `traded`
membrane feature is already written (`tools/shape-sheet/src/drafts/membrane.ts`),
so the candidate is that motion applied to the hull for the length of the window,
against today's plate. Worth doing because the two are not exclusive — a mark on
the ship says *which columns* changed hands and a plate says *when*, and the
shot is what shows whether the pair of them is one signal too many.

## Unverified at dcf8328c: THE HANDOVER watched at tempo: whether two beats of war…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `apps/game/src/field-input.ts`, `apps/game/src/input-bindings.ts`, `apps/game/src/input.ts`, `docs/INDEX.md`, `docs/asset-catalogue.md`, `docs/queue.md`, `docs/spec/bestiary.md`, `docs/spec/ideas.md`

*THE HANDOVER: the two panels change screens, and nobody changes seats* landed from a session that could not look at it. The commit touched 28 more files. What went unchecked:

- THE HANDOVER watched at tempo: whether two beats of warning is enough to arrange two pairs of hands, whether the trade reads as exciting rather than as simply losing the wave, and whether a pair can find its own controls again when they come back
- bun run perf on THE HANDOVER: the wave went in with --unmeasured, and a frame that draws the other seat's band over this seat's field is a path nothing has measured

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at cb36a290: The menu's front page seen on a phone: whether four row…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `apps/game/src/join-words.ts`, `apps/game/src/menu-door.ts`, `apps/game/src/menu-entries.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/menu-parts.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu.ts`

*The menu's front page is four rows, and the rig is behind the spore* landed from a session that could not look at it. The commit touched 5 more files. What went unchecked:

- The menu's front page seen on a phone: whether four rows read as the front door, whether CONTINUE's line is the right sentence at the moment a pair meets, and whether three presses on the spore is findable by the one person who wants the rig

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
