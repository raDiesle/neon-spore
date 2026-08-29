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

## THE MOUSE IS ONE HAND, AND THE TETHER BELONGS TO THE OTHER ONE
_claude/burn-pc-mouse-and-keys · tools/director/src/stage.ts tools/director/src/stage-touch.ts tools/director/src/keys.ts tools/director/src/key-help.ts tools/director/index.html tools/director/test/keys.test.ts_
**Asked for by the owner.**

Their words, whole:

> "the warden": seems like i cannot pull on the tether on pc and director. it
> says pull, but when i click with mouse and move mouse, nothing happens, only
> when its near the ship somehow. unclear for me.
>
> can we have full support for pc with mouse?
>
> the "g" button works, but its hard to use and understand for pc user.
>
> can you also give some hints in some way, what are the keybindings for special
> director testing mode ( alternative configuration) not sure yet, maybe we keep
> keyboard for pc users for some actions.
>
> if pc, maybe we should show for the time being the keybindings somewhere: can
> be below the game screen in director for now! i press button, then i can see
> them in some modal

**Behind `claude/burn-director-sheet-close` and `claude/burn-director-layout`,**
which own `stage.ts` and `index.html` between them. This is last of the three
and replays over both.

### The bug is already diagnosed — verify it, do not re-derive it

`packages/render/src/touch.ts`'s `touchDown` **does** answer a grab above the
band: `y < l.bandTop` finds a creature and returns
`{ player: field.seat, command: { kind: "grip", ... } }`. So a pointer can pull
a tether. The seat it pulls as is whatever `field()` hands it, and
`tools/director/src/stage.ts:88` hard-wires that to player 1, with the reason
written on the line above it: *"Player 1's seat, because a mouse is one hand. G
is the other player's."*

THE WARDEN's tether is player 2's grip. So the click lands, the grab resolves,
and the command is issued for the wrong seat. **"Only when its near the ship
somehow" is the other half of the same fact:** below `bandTop` the cannon and
shield strips answer by explicit player number rather than by `field.seat`, so
those work no matter which seat the pointer is called. Confirm both by reading
the code and say in the commit that the report was accurate, because a fix
aimed at the wrong cause here would look like it worked.

**The director already has role buttons.** `stage.ts` carries a `ViewRole` that
starts at `"test"` and a `button.role` bar that switches it, and `computeLayout`
already takes it. The seat the pointer speaks for should follow that role
rather than being a constant — which is most of the repair and is not a design
decision.

**The one decision it does need.** In `"test"` the director is showing both
seats at once, and a grab above the band then has no unambiguous owner. Pick
one and say why in the commit: the grab could go to the seat that can actually
act on the thing grabbed (the warden's tether is player 2's, so a pull is
player 2's), or `"test"` could keep player 1 and require the role bar for the
other seat. The first is what the owner is asking for and the second is what
the current comment defends; the entry does not decide it, but it does require
the commit to argue it.

**`G` stays.** They said it works. A pointer that also works is an addition,
not a replacement, and the keyboard is what a PC user reaches for once they
know it exists — which is the other half of this entry.

### The keybindings, shown rather than remembered

They asked for a button below the game screen that opens a modal listing them,
and said "for the time being" — so it is a small honest thing, not a settings
system.

**Derive it, do not type it out.** `keys.ts` is the one place the director's
key map lives, and a second hand-written copy in `index.html` is a list that
goes stale the first time somebody adds a key. Export the map from `keys.ts`
as data — code, key, seat, what it does in words — and have both the binding
and the modal read it. That is the whole reason this is worth doing properly
rather than as a paragraph of markup.

**Say which seat each key is.** The owner's confusion is a seat confusion, so a
list that groups by player 1 and player 2 answers the original complaint as
well as the one they asked about. `G` in particular reads as a mystery until it
says *player 2 — grab the creature nearest the hull*.

**`keys.ts`'s header says the game is right if the two disagree.** That stays
true; this entry does not import `apps/game/src/input.ts` and does not make the
director the source of truth for the phone's layout.

Finished when `bun run check` is green, a test proves the pointer's seat
follows the role, the modal's list is derived from the same map the bindings
use, and the commit carries

`Check: on a PC, can you pull THE WARDEN's tether with the mouse — press, drag, and does the tether actually follow`

`Check: does the keybindings button below the stage tell you what G does and whose hand it is, without you asking anybody`

Model `sonnet`, effort `think hard`. Read `packages/render/src/touch.ts`,
`tools/director/src/stage.ts` and `tools/director/src/keys.ts` in full. The
thinking goes on the seat question in `"test"` — every other part of this is
already decided by code that exists.

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

## THE GAUGE'S CONVERSION LEFT THREE THINGS IT COULD NOT REACH
_claude/burn-interlude-leftovers · packages/content/src/waves.ts tools/director/src/serialize.ts tools/shape-sheet/src/drafts docs/spec/ideas.md packages/sim/test/limits.test.ts_
**Proposed by the run.** Reported by `claude/burn-interludes-to-bosses` on
landing, as the half its own paths could not cover.

**One: `waves.ts` is owed a split, and the debt is about to get much worse.**
It went from 267 lines to 275 when THE GAUGE became a wave, and the entry in
`packages/sim/test/limits.test.ts` was raised to match with a note saying the
split is now owed rather than merely available. That note is a receipt, not a
fix. **Eleven more rounds are designed and each of them is a wave**, so the
file grows every time one lands, and each landing will raise the number again
unless somebody stops it.

The reason it was not split already is that `tools/director/src/serialize.ts`
reads it, so the split needs a lane owning both — which the conversion lane did
not. That is this lane. Split by act, or by field, or however the file's own
shape suggests once it is read; the constraint is that the director still round
-trips a wave through `serialize.ts` unchanged, and `bun run check` proves it.

**Do not raise the cap again as part of this.** If the split lands, the number
comes *down* and the note that called the split owed is replaced by one that
says what the shape now is. A cap raised twice is a cap nobody believes.

**Two: `tools/shape-sheet/src/drafts/*` still says "interlude" in its prose.**
The category does not exist any more, so the word now points at nothing. This
is a wording sweep, not a rename with consequences — read what each sentence
was actually saying and put the right word there, which is usually *round* or
*boss*. A blind find-and-replace would produce sentences that parse and mean
nothing.

**Three: the director's "Interludes" backlog group is named from
`docs/spec/ideas.md`'s own heading**, so the group is renamed by renaming the
heading, not by editing the director. Check that nothing else parses that
heading before changing it — `sections.ts` reads spec headings by shape, and a
heading is an interface here rather than a label.

This is a tool and content fix, not a look: nothing the game draws changes, so
the right number of `Check:` trailers is **zero**.

Finished when `bun run check` is green, `packages/content/src/waves.ts` is
under the ordinary limit with its `limits.test.ts` entry removed rather than
raised, a wave still round-trips through the director unchanged, and
`grep -ri interlude` finds the word only in `docs/decisions.md`'s rewritten
entries and in the spec's own history of itself.

Model `sonnet`, effort `think`. Read `packages/content/src/waves.ts` and
`tools/director/src/serialize.ts` together before deciding the seam — the two
have to agree, and the second is the reason the first was never split.

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

## A WAVE MAY NAME THE CARD IT TEACHES, AND THE DERIVATION STAYS THE DEFAULT
_claude/burn-authored-card · packages/sim/src/briefing.ts packages/content/src/wave-types.ts packages/content/src/waves.ts packages/content/test/briefings.test.ts packages/sim/test/briefing.test.ts tools/director/src/rail.ts tools/director/src/card-waves.ts_
**Asked for by the owner.** This **supersedes** the dropdown half of the
retired card entry, which stopped on exactly this question and did not guess.

The question put to them was *should an authored card override the derivation,
or only annotate it?* Their answer:

> change my request about authored card. I want first: wave should introduce a
> new thing when first hit (override)

**So: the derivation stays the default and an authored name overrides it.** A
wave that names nothing behaves exactly as it does today — it raises whatever
its own contents first introduce. A wave that names a card raises that instead.
Both halves matter; a lane that replaces the derivation with authoring has
built the wrong thing.

### How it works today, so nothing is re-derived

`openBriefings` in `packages/sim/src/briefing.ts` builds a set from the wave's
own contents — every `entries` kind, every pod kind, the boss if there is one,
plus `opening` — drops everything already in `world.brief.met`, and sorts by
**catalogue order** so two devices deal the same cards in the same order.
`met` is set on *dismissal*, not on opening, because a run abandoned with the
card still up has taught nobody anything.

`Wave` already carries three optional authored fields — `pods`, `boss`,
`controls` — and `controls` is the closest model: one name, whole, resolved
through one function so nothing else has to remember what a missing field
means. **Follow that shape.** The new field is authored content and belongs
beside them, not in `SimConfig`, which is the run's tuning.

### The invariant this hands to the author, and it must not be handed over silently

Today *every mechanic is taught exactly once, at the moment it first appears*,
and nobody maintains that — it is a consequence of deriving. Override makes it
the author's to keep, and they will not keep it by remembering. So the lane
owes a **test**, in `content`, that reads the whole wave list and fails when:

- a subject is raised by more than one wave; or
- a wave names a card for something it does not contain — teaching the pair a
  thing they are not about to meet; or
- a subject is reachable by no wave at all, which is a card nobody can ever see.

`control-sets.test.ts` already does the equivalent for panels — *a set no wave
reaches is a panel nobody can see* — so there is a pattern to copy rather than
invent. **That test is the deliverable, as much as the field is.** Without it
the owner has been given a way to break the run's teaching order quietly.

Whether a *deliberate* second teaching should be possible is not decided here.
Make it fail, and if the owner wants it later that is one line in the test and
a sentence in the entry that asks for it.

### Determinism

`packages/sim` is lockstep and hashed. The authored list is content, so it must
be sorted into the same catalogue order the derived one uses — **not** left in
the order somebody typed it — or two devices deal different cards. `bun run
test:determinism` is the guard here and is not optional.

### The director half, and it is the half the owner will see

Their original words: *"i can in dropdown select available briefings/cards,
which are not taken by any other wave, yet"*. With override built, "not taken
by another wave" is a computable fact — `card-waves.ts` already reads the map
of card to wave, and `cardsForWave` was added to read it the other way round.
The picker goes in `rail.ts` beside the CONTROL SET select, which is the field
this one is a sibling of.

**Order of work: build the sim and content half first and prove it, then the
director half.** If the lane is running long, stop after the first half with a
green check and say so — the second half becomes its own entry. A mechanism
nobody can author through is half a feature, but it is a half that works.

This is not a look: nothing the game draws changes. The **wave that raises a
card** may change, which is why there is a check rather than none.

Finished when `bun run check` is green, `bun run test:determinism` passes, a
wave naming a card raises that card, a wave naming nothing behaves exactly as
before, the invariant test fails on all three of the cases above, and the
commit carries

`Check: set one wave to teach a card it did not used to, and play from the start — does that card come up on that wave and nowhere else`

Model `sonnet`, effort `think hard`. Read `packages/sim/src/briefing.ts` in
full, `packages/content/src/wave-types.ts`'s `controls` field and its comment,
and `packages/content/test/control-sets.test.ts` for the invariant pattern. The
thinking goes on the invariant test, not on the field — the field is four
lines and the test is what stops the owner breaking their own run order.

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

## A RING IS CALLED A ROW AND A SECTOR IS CALLED A LANE
_claude/burn-maze-probe-rename · packages/sim/src/events.ts packages/sim/src/maze-round.ts packages/sim/src/maze-controls.ts packages/audio/src/bind.ts packages/audio/test/bind.test.ts_
**Proposed by the run.** The half `claude/burn-maze-leftovers` could not reach,
reported on landing with the file list already worked out.

`mazeProbe` carries where a shot got to inside the wheel. Its fields are named
`row` and `lane` — from the lattice, which no longer exists — and they now hold
a **ring** and a **sector**. A name that describes the old shape is worse than
no name at all, because it reads as correct.

**The previous lane established exactly what a rename touches**, and it is five
files rather than one: the declaration in `packages/sim/src/events.ts`, the two
constructors in `maze-round.ts` and `maze-controls.ts`, and one reader in
`packages/audio/src/bind.ts` with its test. That reader is the reason this is
its own lane — `packages/audio` was not in anybody's paths and nobody had
noticed it consumes maze probes.

**It also left the doc comment alone on purpose**, and was right to: fixing the
prose without renaming the fields makes a new inconsistency instead of removing
one. So the comment and the names move together, in this lane, or not at all.

**The determinism question was asked and answered: the hash is not at risk.**
The previous lane checked before stopping. Confirm it yourself rather than
taking it on trust — `bun run test:determinism` is the guard — but do not spend
the lane re-deriving it.

This is a rename and a comment: nothing a player could look at changes, so the
right number of `Check:` trailers is **zero**.

Finished when `bun run check` is green, `bun run test:determinism` passes, and
`grep -rn "lattice\|tangle" packages/sim packages/audio` finds nothing
describing the wheel as what it was.

Model `sonnet`, effort `think`. Small, and `packages/sim` is lockstep — find
every reader before renaming rather than after. If a sixth file turns up, stop
and report it rather than widening the lane a second time.
