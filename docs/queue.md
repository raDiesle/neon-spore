# Queue

The ordered work an unattended run walks. First in the file is next to be done.

It is not the outstanding list — `bun run checks` derives that from the
`Check:` trailers, and every row of it is an obligation somebody incurred by
landing something. It is not `docs/parked.md` either, which is ideas nobody
has decided on. This is the middle one: **decided, not yet done**.

An entry leaves by being **deleted**, once its branch is on `main`. Nothing
here is ticked, and nothing here records progress — a lane is done when its
branch is an ancestor of the trunk, which git can be asked and a file cannot.
`bun run burn` asks. `docs/autonomous.md` has the rest.

**Every entry says who wanted it, on its own line under the branch.** Either
**Asked for by the owner.** or **Proposed by the run.**, those two words and no
third option — a run that has read a spec file and found a gap is proposing,
however obvious the gap. That label is the first sort key: the owner asks are
worked before anything the run thought of, and a new entry that cannot honestly
carry the first label is filed below every entry that can.

The label is not a ranking of quality. Several of the proposed entries below
are better ideas than the reports above them, and that is exactly why the
labelling exists — designing is more enjoyable than fixing, so work the run
invented rises on its own unless something holds it down.

**A lane may not change what the game already draws.** CLAUDE.md's *A look is
offered, never replaced* binds every entry in this file: a new colour, a new
animation or a different shape is written as an alternative on the NOT BUILT
YET pages, beside the shipped one, and the owner decides by looking. A brief
that would replace a look outright is a brief that has been written wrong, and
the three narrow exemptions are named there rather than here.

**What the owner asked for outranks what a run decided to do next.** The
order is not a judgement about which work is better; it is about where the
work came from. A brief that can point at something the owner said — *CILIA is
slow*, *shadow and light in the game*, *I cannot tell what combines with what*
— goes above one derived from a spec file, a `--candidates` sweep or a session
noticing a gap while it was passing. Both are legitimate work and the second
kind is often the more interesting, which is exactly why it drifts to the top
on its own if nothing holds it down.

So a run refilling this file sorts on that first and on everything else
second, and a new entry that cannot name an owner ask is filed below every one
that can, however obvious it feels while writing it. A lane whose brief does
not say where it came from is a lane nobody can sort later.

The italic line under each heading is `branch · the paths that lane owns`. Two
lanes may not own the same path. The files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by nobody: add
to one in a single contiguous region and expect to replay over somebody else.

## `bun run frames` CANNOT GET PAST THE WAVE'S OWN OPENING
_claude/burn-frames-opening · tools/frames/capture.ts tools/frames/run.ts tools/frames/test apps/game/src/main.ts_
**Asked for by the owner.** Not in words this time — this is the tool that
makes *send the picture, do not describe it* possible, and it stopped working
the moment the opening landed. It was found by trying to photograph the
landing for the owner and getting a stack trace instead.

Two breaks, and the second is the interesting one.

**It reads a stack that no longer exists.** `tools/frames/capture.ts:132` loops
on `ns.world.brief.due.length`, from back when a wave could owe several cards
and a dismiss acked the one on top. `world.brief` is now a phase — play,
introduction, guide — and `due` is gone, so every capture dies with
`Cannot read properties of undefined`.

**And it has no way to let the introduction pass.** The introduction is counted
in the app, in the animation frame (`progression.tickOpening`), because nothing
in `sim` may read a clock — that is right and stays. But the testing handle on
`window.neonSpore` only exposes `advance`, which steps the *world*, and
`dismissBriefing`, which the introduction is explicitly not supposed to answer.
So a headless capture can neither wait the introduction out nor skip it: it
stands in front of the field forever and every screenshot is of the opening.

Decide, and say which in the commit: the handle almost certainly grows a verb
that advances the opening's clock by a given number of seconds, which lets a
capture do **both** things a caller wants — sit on the introduction on purpose,
because that is a picture somebody will want, and step past it to photograph
the wave. A flag that only skips would foreclose the first, and the first is
what this whole entry was born from.

**Name the coverage gap while you are in there.** `bun run check` was green
across the landing that broke this. Whatever cheap test would have gone red —
one that drives the handle the way a capture does — is worth more than the fix,
because the fix is ten lines and the gap is why nobody knew for a day.

`apps/game/src/main.ts` is owned by nobody and wanted by everybody: add to it
in one contiguous region and expect to replay over somebody else.

Finished when `bun run check` is green and `bun run frames f6be23b` writes a
picture of the field rather than throwing.

Model `sonnet`, effort `think`. Read `packages/sim/src/briefing.ts` for the
phase, and the testing handle at the bottom of `apps/game/src/main.ts`, before
touching the capture loop.

## THE DIRECTOR'S STAGE READS THE SHIPPED WAVES, NOT THE ONES YOU ARE EDITING
_claude/burn-director-wave-identity · tools/director/src/stage.ts tools/director/src/rail.ts tools/director/test/rail.test.ts_
**Asked for by the owner.** Two `FAIL` verdicts on `dff2c76`, which is what an
owner ask looks like when they have already gone and looked.

> in director testing game mode, still every wave has the "lance" control for
> player 1

> i dont see in wave configuration where to configure the control set for the
> wave and what is active one

**Behind `claude/burn-interludes-to-bosses` and `claude/burn-director-layout`.**
The first is rewriting `packages/content/src/control-sets.ts` whole; the second
owns `stage.ts`. This replays over both.

### The cause is located — confirm it, do not re-derive it

`tools/director/src/stage.ts` builds the world with `createWorld(cfg,
store.index)`, so `world.wave` is an index into **`store.waves`** — the waves
the director is editing, loaded from its own server. It then asks for the panel
with `controlSetForWave(world.wave)`, and that function
(`packages/content/src/control-sets.ts`) resolves it as
`WAVES[waveIndex]?.controls` — an index into the **shipped** `WAVES` array
imported from `@neon-spore/content`.

**Two different arrays, indexed by the same number.** The panel the stage draws
is whatever the *shipped* wave at that position happens to name, and it has
nothing to do with the wave on screen. Both failures fall out of that one fact:

- Picking a set in the `CONTROL SET` field writes `store.waves[n].controls` and
  the stage never reads it, so the panel does not change. From the outside that
  is exactly *"still every wave has the lance control"*.
- And *"what is the active one"* is unanswerable because the field and the
  stage genuinely disagree — the field is right about the draft and the stage
  is right about nothing.

**The picker is not missing.** It is in `index.html`, in the WAVE tab, under
the label *CONTROL SET — this wave is not the ordinary thing*, and `rail.ts`
fills it from `CONTROL_SETS` and writes the choice back. The owner did not find
it, which is a real finding and belongs to `claude/burn-director-layout`;
**this** lane's point is that finding it would not have helped.

**`controlsets-page.ts` already knows the trap and documents it** — its
`setWorld` comment explains that the band reads the wave index, so that page
poses a *real shipped wave* on purpose. Correct for the catalogue, and exactly
the assumption the stage cannot make.

### What to fix, and the boundary to respect

The stage must resolve the panel from **the wave object it is playing**, not
from an index into a different array. `controlSet(id)` already takes an id
directly, which is most of the answer; whether `controlSetForWave` keeps its
index signature for the shipped callers, gains a sibling that takes a wave, or
is left alone is the lane's call, and the commit says which and why.

**`packages/content/src/control-sets.ts` is not this lane's to rewrite** — the
interlude lane is restructuring that file to carry per-seat panels, and this
lane lands after it. If the fix genuinely needs a change there, **stop and
report it** rather than reaching in.

**Nothing in `packages/sim` changes.** The shipped game reads the shipped waves
and is not wrong; this is the director playing a draft.

This is a tool fix, not a look.

Finished when `bun run check` is green, a test proves that a wave whose draft
names a set is played on that set rather than on the shipped wave at the same
index, and the commit carries

`Check: pick LANCE PANEL on one wave and STANDARD on the next — does the panel under the stage actually change when you switch between them`

Model `sonnet`, effort `think hard`. Read `tools/director/src/stage.ts`,
`tools/director/src/rail.ts` and `packages/content/src/control-sets.ts`. The
thinking goes on where the wave-to-panel lookup belongs now that there are two
wave arrays in play — a fix that only patches the call site leaves the next
reader the same trap.

## GRAB AND DRAG BECOMES A SECOND GESTURE, AND THE HOLD STAYS WHAT IT IS
_claude/burn-grab-and-drag · packages/render/src/touch.ts packages/sim/src/grip.ts packages/sim/src/commands.ts packages/render/src/tether.ts packages/sim/src/maze-round.ts packages/sim/src/maze-controls.ts packages/render/src/maze-draw.ts packages/render/test/touch.test.ts packages/sim/test/grip.test.ts packages/sim/test/maze.test.ts_
**Asked for by the owner.** This **replaces** an earlier entry that proposed a
panel control for the wheel. They corrected it:

> pilot pull string is existing mechanic we have, that player presses the circle
> where it says below "pull". no new control panel, but in screen control
> mechanic to click - but extended to also drag it. it's not control panel, more
> an in screen touch or drag control on elements directly.

**So there is no new control and no new panel.** The wheel is turned by the
gesture the game already has: press the circle on the thing itself, in the
field, and hold. What is missing is only the second half of that gesture.

### What exists, exactly

`packages/render/src/tether.ts` draws the circle and labels it **PULL** on the
seat that may take it and **HELD** on the other. `touchDown` in
`packages/render/src/touch.ts` answers a press above the band by finding the
creature under it and returning `{ kind: "grip", id }` for `field.seat`, with
`hold: "grip"`. `touchUp` sends `grip: NO_GRIP` on release, because a grip
lasts exactly as long as the finger and nothing in the simulation decays it.

**And `touchMove` returns `null` for a grip.** It answers `cannon` and
`shield` — both of which are a column read off an x — and nothing else. So
today a grip is a *hold*: the finger's position after the press is thrown away.
That single omission is this whole lane.



### The owner settles it: two gestures on one grab, and the hold is unchanged

> yes pull for me is drag and drop, i guess. and touch/click would be what is
> current behavior to slow down a meteorite. i suggest we keep meteorite
> behavior and introduce/extend the grab and drag, to be applied for warden and
> maze. Make sure it works for pc (mouse) and mobile - and in director gameplay

**So there are two gestures on the same grab, and which one you get is decided
by what you grabbed.**

- **Press and hold** is exactly what it is today, and it does not change: a
  hand on a falling thing slows it, for as long as the hand stays. The
  meteorite case is the whole reason `grip.ts` exists — a rock cannot be shot,
  so buying the shield another beat is the only thing a second pair of hands
  could ever do about one. **Do not touch this.**
- **Grab and drag** is new, and applies to **THE WARDEN's tether and THE MAZE's
  wheel**. Grab the circle, move, and the thing follows.

That is a clean line and it is worth stating in the code: a *draggable* element
answers where the hand went; everything else answers only that a hand is there.
Whether that is a property of the creature kind, of the grip, or of the thing
being drawn is the lane's decision — but it has to be one decision, not two
special cases, because the eleven remaining rounds will each want to know which
kind of grab they have.

**It must work on all three, and this is not a footnote.** A phone (touch), a
PC (mouse), and the director's own stage. The director is the one that catches
the others: it is where the owner plays, and its pointer path is
`stage-touch.ts` rather than the game's. A drag that works in the game and not
in the director is a drag nobody can judge — and one that works in the director
and not on a phone is worse.

**Scope note.** This entry now covers the tether as well as the wheel, so the
tether's `PULL` circle becomes a real pull. The tether is a boss's mechanic
with its own rules; read `packages/render/src/tether.ts` and the warden's own
files before deciding what dragging it *does*, and if dragging it turns out to
need a rule change rather than an input change, **stop and report** rather than
inventing one — the owner asked for the gesture, not for a new tether.
### The owner's second clarification, and the correction it needs

> the drag/pull from screen works like the existing pull: you click (touch) it,
> then you drag somewhere

**The gesture they describe is right and the premise is not.** There is no
existing drag. `grip.ts` is explicit about what a hand on the field does today:
*"A finger held on something falling drags at it, and it falls slower for as
long as the finger stays. Nothing travels, nothing is destroyed and no column
changes — the rule is only a fall rate."* The word *drags* there means
resistance, not the finger's motion. `setGrip` takes an id and nothing else —
no position, no origin — and `touchMove` answers only the cannon and shield
strips.

So **nothing in the game responds to where a finger moves after a grab**, and
this lane adds that for the first time. From the pilot's side it is the gesture
they already know — touch the circle, then move — which is exactly why it is
the right shape. Underneath it is new.

**Build it as direct manipulation**: the handle follows the finger, so the point
you grabbed stays under it and the wheel turns to keep up. That is what *drag
it somewhere* means and it is the reading the rest of this entry assumes.

**This probably explains half of the tether report too.** The owner said of THE
WARDEN: *"it says pull, but when i click with mouse and move mouse, nothing
happens"*. Moving was never going to do anything — the game only hears the
press, and what holding does is slow the fall, which is easy to miss when you
are watching for motion. So `claude/burn-pc-mouse-and-keys` and this lane are
two halves of one complaint: the seat that issues the grab, and the fact that
the grab ignores where the hand goes.

**Whether THE WARDEN's tether should also become draggable is not decided
here.** This lane gives the wheel a drag and leaves the tether exactly as it
behaves. If the owner wants the tether to follow a finger too, that is one more
entry and one sentence from them — do not take it as implied.
### What to build

**Make a held grip carry where the finger has moved to.** Then the wheel turns
by dragging the circle on its string, the pilot feels the turn under the
finger, and the existing snap does the rest — the entrance still pulls onto the
column it is nearest and holds there, which is what keeps the pair talking in
columns.

**The interesting decision, and it is the whole lane.** `cannon` and `shield`
drags are *absolute* — the finger's x is a column, and where the press started
does not matter. A string is not that: what turns a wheel is **how far the
finger has moved from where it grabbed**, not where it is on the screen. So the
grip's drag needs an origin the two seats agree on, and that is a decision
about the command rather than about the drawing. Get it right and every future
element that wants dragging inherits it; get it wrong and the next one invents
its own.

**Integers, in thousandths.** Rule 3. A drag distance is exactly where a float
gets in, and two devices must never disagree about a rounding step.
`bun run test:determinism` is the guard.

**Do not disturb the tether.** THE WARDEN's pull uses this same path and must
keep behaving exactly as it does — a grip that now also reports movement must
be ignorable by everything that only cared that it was held. Say in the commit
what the tether does with the new information, even if the answer is nothing.

**The wheel needs its circle drawn.** `maze-draw.ts` must put a PULL handle on
the string the way `tether.ts` does, or the pilot has nothing to press. Read
`tether.ts` for how it decides which seat sees PULL and which sees HELD — the
wheel's answer is different, because only the pilot may turn, but the drawing
question is the same one.

**Keep `valve` working while you do it.** The wheel is currently turned through
THE GAUGE's `valve` command, which is how Z and X drive it at a desk and the
only way anybody can test the round today. Do not remove it in the same lane
that adds the drag.

### Note on the neighbouring lane

`claude/burn-pc-mouse-and-keys` is about the same gesture from the other side —
the owner could not pull THE WARDEN's tether with a mouse because the
director's pointer speaks for player 1 and the tether is player 2's. **These two
are the same subject and must not run at the same time**, even though their
paths differ: one changes what a grip carries, the other changes whose hand
issues it, and the second would be tested against the first. Do the mouse one
first — it is a one-line seat fix and it is what makes this one testable at a
desk at all.

Finished when `bun run check` is green, `bun run test:determinism` passes,
dragging the wheel's circle turns it and the snap still holds, THE WARDEN's
tether behaves exactly as before, and the commit carries

`Check: on a phone, does dragging the circle on the wheel's string turn it, and does an entrance still settle onto a column rather than drifting past`

Model `sonnet`, effort `think hard`. Read `packages/render/src/touch.ts` in
full, then `packages/render/src/tether.ts` for the circle, then
`packages/sim/src/commands.ts` for what a command may carry. The thinking goes
on the drag's origin — absolute-versus-relative is the decision every later
draggable element inherits.

## AN EXPIRED GUARD LOOKS EXACTLY LIKE A BROKEN SHIELD
_claude/burn-guard-lapse · packages/render/src/band.ts packages/render/src/shield.ts packages/render/test/frame.test.ts_
**Asked for by the owner.** Their decision on a finding from the shield
investigation: *show when it lapses*, and leave the timing alone.

**What is true today.** Deflection needs two things at once — the shield in the
rock's column, player 2's job, and the guard triggered within
`cfg.guardWindowMs`, player 1's. `resolveHull` compares `world.tick -
world.guardTick` against that window. **The guard is a press with an expiry,
not a state that is held.**

So a player who sees a rock coming, presses guard early and keeps holding, has
a press that lapsed before the rock arrived. The shield is in the right column,
the button is down, and the rock goes through. Nothing on screen distinguishes
that from a shield that simply did not work.

**The timing is not being changed and that is the owner's decision.** They were
offered a held guard that stays armed and declined it: the window is the skill.
What they asked for is that a lapse be *visible*. So this lane adds no
mechanic, changes no rule, and must not touch `packages/sim`.

**What to work out, and it is the whole lane.** The guard is armed for a window
measured in milliseconds — long enough to act on, short enough that a bar
draining would be noise on every press. So the question is what a player needs
to see and when: that it is armed *now*, that it has lapsed, or both. Watch a
wave before designing it, because the answer depends on how often the state
changes at tempo, and a signal that flickers is worse than none.

**It has to read without being looked at.** The pair is calling columns to each
other; player 1 is not studying their own button. Whatever this is, it works in
peripheral vision or it does not work.

**Nothing else may change.** This is a defect in what the game *says*, not in
what it does — a state the rules already have and the picture never showed. Say
that in the commit; it is what keeps this from becoming a look nobody asked
for.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, nothing in `packages/sim` is touched, and the commit carries

`Check: holding the guard too early, can you now tell it has lapsed before the rock arrives, rather than finding out when the ship takes the hit`

Model `sonnet`, effort `think hard`. Read `resolveHull` in
`packages/sim/src/hull.ts` for the window's meaning, then
`packages/render/src/band.ts` for how a control already shows its own state.
The thinking goes on what a player can notice while not looking at it.

## THE GAME SHOULD BE PLAYABLE ON A PC, NOT ONLY TESTABLE
_claude/burn-game-on-pc · apps/game/src/input.ts apps/game/src/main.ts packages/render/src/touch.ts apps/game/test_
**Asked for by the owner.** Asked what *"full support for pc with mouse"* meant,
they chose the larger reading: **the game itself, fully playable on a PC** —
not only the director.

**The concern was put to them and they decided anyway, so this is built.** It is
recorded here once because a later session will meet it and should know it was
seen rather than missed: the game is two people on two devices, and the control
scheme *is* the conversation. Two players at one keyboard are not two devices —
they can see each other's screen, which retires the one thing the design is
built on. So the honest shape of this is **a PC is a device**: one player at a
PC, one on a phone, playing the same room. Not two players sharing a keyboard.

Build that, and say in the commit that it is what was built.

**What exists already.** `apps/game/src/input.ts` is the desk layout the
director's `keys.ts` deliberately copies rather than imports — and `keys.ts`'s
header says *if the two ever disagree, the game is right*. So the game already
has keys; what it does not have is a mouse, and it does not have a way to tell
a player what any of it is.

**Three things, and the third is the one that gets forgotten.**

- **The mouse drives what a finger drives.** `packages/render/src/touch.ts` is
  already the one path the game and the director share, so a pointer should
  reach it rather than growing a second control scheme beside it.
- **A held control has to survive a mouse leaving the window.** A finger that
  leaves the glass sends an up event; a mouse dragged off the page may not, and
  a cannon that stays held because the pointer left is a bug that only appears
  on a PC.
- **The player has to be told the keys exist.** `claude/burn-pc-mouse-and-keys`
  is building this for the director; the game needs its own answer, and it is
  not the same answer, because the game has no room for a panel and the pair is
  mid-wave.

**Sequence: after `claude/burn-pc-mouse-and-keys` and after
`claude/burn-grab-and-drag`.** Both touch the same input path, and this one is
the largest of the three. It inherits their decisions rather than making them
twice.

Finished when `bun run check` is green, a wave can be played through at a PC
with mouse and keyboard, a held control releases when the pointer leaves the
window, and the commit carries

`Check: sitting at a PC with a phone beside you, can the two of you play a wave through without either of you being told which key is which`

Model `sonnet`, effort `think hard`. Read `apps/game/src/input.ts` in full and
`packages/render/src/touch.ts`. The thinking goes on what a PC player is told
and when — the input mapping is the easy half, and a player who cannot find
their own controls has no game whatever the mapping is.

## THE CANNON LAYS THE SHOT LIKE A HEN LAYS AN EGG
_claude/burn-cannon-egg · tools/versus/candidates/cannon-shot packages/render/test_
**Asked for by the owner.** Said in German; translated here, because everything
written down in this repository is English:

> It should look as though a hen is pressing out an egg. So the shot should be
> pushed out somewhat slowly as it is expelled, so that you can see the
> animation. The round circle on top of the cannon is obsolete — instead it
> should look like a bulge towards the ship, like a chicken's bottom/cloaca,
> where the egg is pressed out and pops free.

**And they said where it goes, in the same breath: not onto the field.** This
is a candidate, offered beside the shipped shot, and the owner decides by
looking. `tools/versus/candidates/cannon-shot` already holds `pip` and
`streak`, so this is a third one beside them and the vote is the mechanism —
`docs/versus.md` has it. Nothing in `packages/render/src` changes. A lane that
finds itself editing `muzzle.ts` or `cannon-maw.ts` has misread this entry.

### The two halves, and they are separable

**The bulge.** The round circle sitting on top of the cannon goes, and what
replaces it is a swelling on the side that faces the ship — a cloaca rather
than a port. It is not a hole the shot comes out of; it is a body part that
distends. So it is *not* symmetrical, it has a direction, and the direction is
towards the ship. Draw it as the contour it is: this repository's whole visual
grammar is closed contours with lobes (`blobPath`, `hullRadiusMul`), and a
bulge is exactly a lobe that grows.

**The laying.** The shot does not appear, it is pressed. Slowly enough that a
player sees it happen — the owner said so explicitly, and *slowly* is the whole
request, so a candidate that is merely a different shape has answered half of
it. The arc worth building is the one an egg actually has: the bulge swells and
strains while nothing leaves, the shot emerges gradually and stretches the
contour around itself, then it clears and the bulge relaxes. The interesting
beat is the relaxation, which is the part that says *effort* rather than
*flash*, and it is the part a first attempt leaves out.

### The one thing that would make this a different entry

**It is a render candidate and may not change when the shot becomes live.**
`packages/sim/src/shot-charge.ts` decides that, two devices have to agree on
it, and a candidate cannot touch it. So the laying is drawn over the timing
the game already has: the shot leaves when it leaves, and the animation is what
is drawn around that moment.

If the animation turns out to need the shot to genuinely leave later — if
drawing it over today's timing looks like a fast shot with a slow decoration
glued to it — **stop and report that**, because slowing the shot itself is a
balance decision the owner has not made, and it is a separate entry with the
sim in it. Say which of the two it turned out to be. That sentence is the most
useful thing this lane can produce.

Finished when `bun run check` is green, the candidate stands beside `pip` and
`streak` in the versus tool, and neither the shipped cannon nor anything in
`packages/render/src` has moved.

`Check:` write one, badged `concept`, and make it a comparison — the owner is
being asked whether this is worth building, not whether it is correct. `before`
is the shipped shot, `after` is the candidate by the name you give it.

Model `sonnet`, effort `think hard`, spent on the timing rather than the
outline: read `docs/versus.md` and both existing candidates first, and get the
strain-then-release arc right before drawing anything, because a bulge with no
effort in it is a circle in a different place.

## THE WHEEL IS STILL TYPED AS A TANGLE
_claude/burn-maze-tangle-type · packages/sim/src/maze-wheel.ts packages/sim/src/entries.ts packages/sim/src/index.ts packages/sim/src/hash.ts packages/sim/src/wave-start.ts packages/content/src/maze-rounds.ts_
**Proposed by the run.** The last thread of the maze conversion, reported by
`claude/burn-maze-probe-rename` as outside its five files.

`packages/sim/src/maze-wheel.ts` ends with `export type MazeTangle =
MazeWheel;` — a compatibility alias named after the thing the wheel replaced —
and the callers still speak of tangles: `entries.ts` types a wave's rounds as
`MazeTangle[]` and its comment calls them *the tangles, in order*, with
`hash.ts` and `wave-start.ts` carrying the same word in prose.

**This is the same defect one level up from the one just fixed.** `mazeProbe`'s
`row` and `lane` were renamed because a name describing the old shape reads as
correct and is therefore worse than no name. The type is that, for the whole
authored round.

**Rename it and delete the alias.** An alias kept "for compatibility" inside a
repository with one author and a linear history is compatibility with nobody —
it is only a second name for the same type, which is exactly what the rename is
trying to remove.

**Read each sentence before rewriting it.** Some of the prose about tangles is
describing the old lattice's behaviour and has no subject any more; that goes
rather than gets reworded. `packages/sim/src/maze.ts`'s header deliberately
keeps its own history of what it replaced — **leave that alone**, it is the
argument, not a leftover.

`packages/sim` is lockstep, so `bun run test:determinism` passes before this
lands. A type rename should not touch the hash, and if it appears to, stop.

Nothing a player could look at changes: **zero `Check:` trailers**.

Finished when `bun run check` is green, `bun run test:determinism` passes,
`MazeTangle` does not exist, and the word *tangle* survives only in
`packages/sim/src/maze.ts`'s deliberate account of what the wheel replaced.

Model `sonnet`, effort `think`. Read `packages/sim/src/maze-wheel.ts` and
`entries.ts`. Small; the care is in telling live prose from history.

## THE BACKLOG STILL HAS AN INTERLUDES TAB FOR A CATEGORY THAT IS GONE
_claude/burn-interlude-tab · docs/spec/ideas.md tools/director/src/backlog.ts tools/director/src/backlog-page.ts tools/director/index.html tools/director/test/backlog.test.ts_
**Proposed by the run.** The third item of `THE GAUGE'S CONVERSION LEFT THREE
THINGS IT COULD NOT REACH`, which its lane correctly stopped on and which the
landing then retired along with the two halves that *were* done. Re-queued so it
does not vanish — that is the second time today a landing has retired an entry
whose work was not finished.

**The word survives in four coupled places** and they have to move together:

- `docs/spec/ideas.md:513` has the heading `### Interludes`.
- `tools/director/src/backlog.ts:218` passes the literal string `"Interludes"`
  to `fromIdeas`, beside the label `INTERLUDE IDEAS` and a subtitle reading
  *"rounds that are not the field, each with its own controls and picture"*.
- `backlog-page.ts` builds the tab from that group.
- `tools/director/index.html` carries the `INTERLUDES` tab button and its
  `sheet-interludes` page.

**A spec heading is an interface here, not a label.** `sections.ts` parses spec
headings by shape and `fromIdeas` matches this one by exact text, so renaming
the heading alone silently empties the tab rather than erroring. That is why
the previous lane stopped: at the time, `index.html` belonged to a concurrent
lane. It is free now.

**The subtitle is already right and says what the new word should be** —
*rounds that are not the field, each with its own controls and picture*. That is
a description of a **round**, which is what these became. So the rename is
mostly deciding between *rounds* and *bosses*, and the honest answer is probably
*rounds*: they are bosses now in how they are reached, but the ideas in that
section are about what a round *is*.

**Read the ideas under the heading before renaming it.** If any of them
describe the reaching mechanism rather than the round — a thing that happens
*between* waves — that idea has lost its subject and goes, rather than getting
reworded into something that no longer makes sense.

**Check nothing else parses that heading.** `grep -rn "Interludes" tools docs`
before you start; the group key, the label, the subtitle and the tab id are four
different strings and only some of them are load-bearing.

This is a tool and a spec fix: nothing the game draws changes, so **zero
`Check:` trailers**.

Finished when `bun run check` is green, the tab is named for what the section
now contains, the tab is not empty, and `grep -rn "nterlude" tools docs/spec`
finds nothing outside `docs/decisions.md`'s rewritten entries and the spec's own
account of what was replaced.

Model `sonnet`, effort `think`. Read `tools/director/src/backlog.ts` around
`fromIdeas` and `docs/spec/ideas.md` from line 513 to the next heading. Small,
and the care is in not emptying the tab silently.

## THE CARD TOOLTIP IS ON THE WRONG THING
_claude/burn-card-tooltip-place · tools/director/src/rail.ts tools/director/src/card-waves.ts tools/director/index.html tools/director/src/stage-transport.ts_
**Asked for by the owner.** A `FAIL` on `bf4c72d` with the fix named in it.

> the tooltip for all cards should not be on the list of waves, but on the
> waves configuration i suggest to have it on the "card" button below the game
> screen.

**What landed and what they rejected.** A lane put the card names on the wave
*list's* mark — hover a row, see its cards, click to open the CARDS sheet. The
owner does not want it on the list. They want it on the **wave's own
configuration**, and they name where: the `✓ CARD` button in the transport row
under the field.

**So this is a move, not an addition.** Take it off the list row and put it on
the card control. `cardsForWave(waveIndex)` already exists and is the right
call; only its reader changes.

**Mind what `✓ CARD` already is.** It is a *dismiss* — it pushes `{kind:
"brief"}` for both seats, and the stage freezes on the first wave without it.
Hanging a tooltip on it is fine; changing what pressing it does is not.

**Note the neighbouring entry.** `THE STAGE IS THE BUTTON, AND ✓ CARD IS ONE
CONTROL TOO MANY` proposes retiring that button entirely. If both are worked,
this one is meaningless afterwards — read that entry first and say in the
report whether these should be one lane.

Finished when `bun run check` is green, the wave list's rows no longer carry the
card tooltip, the card control names the current wave's cards, and the commit
carries

`Check: with a wave open, does the card button under the field tell you which cards this wave raises, without you opening a sheet`

Model `sonnet`, effort `think`. Read `tools/director/src/rail.ts`'s mark and
`card-waves.ts`. Small; the care is in not disturbing the dismiss.

## THE FALLING SHADOW STILL DOES NOT READ, AND THE STATES PAGE SHOULD SHOW IT
_claude/burn-shadow-states · tools/director/src/states-page.ts packages/render/src/contact-shadow.ts docs/checks/_
**Asked for by the owner.** A `FAIL` on `d892bae`, and the second half is a
request for tooling rather than for the effect.

> i still dont see it, add some screenshots on the "States" section for docu

**Two things, and the second may explain the first.** The lane that landed this
made the shadow's lean proportional to the gap so it gathers under the rock as
it falls. The owner cannot see it. Either the effect is too subtle at tempo, or
it is right and there is no way to look at it — a shadow mid-fall is one frame
out of a fall nobody can pause.

**Do the second half first.** The STATES page exists to show a thing in each of
its states side by side, which is exactly what a shadow through a fall needs:
the same rock at the top of its last quarter, halfway, and at contact, in one
row. If the effect is working, that picture proves it and the check can be
answered. If it is not, the same picture is the evidence for changing it.

**Only then touch the effect, and only if the picture says to.** If the three
frames show a shadow that does gather and the owner still cannot see it in
play, that is a finding about tempo rather than about the curve — report it.

Finished when `bun run check` is green, the STATES page shows a falling
shadow's stages side by side, and the commit carries

`Check: on the STATES page, do the three stages of a falling shadow show it gathering under the rock — and now that you can see it side by side, does it read in play?`

Model `sonnet`, effort `think hard`. Read `tools/director/src/states-page.ts`
and `packages/render/src/contact-shadow.ts`'s header. The thinking goes on
choosing the three moments — the wrong three make a working effect look broken.
