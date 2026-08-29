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

## THE STAGE IS THE BUTTON, AND ✓ CARD IS ONE CONTROL TOO MANY
_claude/burn-stage-steps-card · tools/director/index.html tools/director/src/stage.ts tools/director/src/stage-transport.ts tools/director/src/pair-panel.ts tools/director/test/transport.test.ts tools/director/test/stage.test.ts_
**Asked for by the owner.** **This is the next thing done.** Said in German;
translated here, because everything written down in this repository is English:

> I do not need a "card" button to click a card away. Instead I want to click
> the screen in the director's test mode: then player 1's help comes up.
> Clicking the screen again brings player 2's help. Clicking once more starts
> the wave.
>
> And make sure that in test mode I see the full sequence. Right now the
> sentence and description state is never shown in the director unless I
> configure it — below the game screen, buttons to skip.

**This is the first of two lanes** and it deliberately changes nothing about
the data. The one below moves the text into the wave and renames it; this one
only fixes how a card is stepped through in the director, on today's model, so
the clicking is in the owner's hands before the bigger change starts.

### What is there now

`✓ CARD` (`#ackBrief`, `stage-transport.ts`) pushes a `brief` command for both
seats at once, because `bindStageTouch` already spends the canvas's own
`pointerdown` on the cannon — that is the whole reason the button exists. On a
phone there is no button: the stage *is* the target (`apps/game/src/briefing.ts`).
In the director the card is drawn once with `role === "test"`, which shows both
halves in words at the same time.

### What it becomes

The stage is the target here too, and in test mode the card is stepped rather
than shown whole: **first press shows player 1's half, second press player 2's,
third press puts the card away and the wave plays.** Where the game shows two
people one screen each, one person at a desk gets the same two screens one
after the other — which is the only way a reviewer can see what each seat
actually reads.

- The press is the canvas's, not a button's. `bindStageTouch` owns
  `pointerdown` for the cannon, so the card's step has to come first and
  swallow the press while a card is up — the same order the game plays by,
  where the simulation refuses everything but the dismissal.
- Which half is showing is **director state, not world state.** The world only
  knows a card is up and who has acked; the sim may not learn that one screen
  is being read in two turns. Keep it beside the stage's own view role.
- The third press is the existing both-seats `brief` command, unchanged.
- `✓ CARD` goes, with its wiring and its case in `transport.test.ts`.
- The note under the field in `index.html` that names `✓ CARD` goes with it.

### The sequence is on by default, and the toggle is the way past it

The reason the owner has never seen a card in the director is `cfg.briefings`:
off in `DEFAULT_CONFIG`, on in `apps/game`, and a checkbox nobody had reason to
find in the director. The tool where these are *judged* is the one place that
was not showing them.

So the director opens with it **on**. `#briefToggle` stays exactly where it is
in the transport row, one press from the field, and becomes what it is for:
the way to skip the opening when you are iterating on a wave's timing and have
read its card forty times today. The `BRIEFINGS` case in `transport.test.ts`
stays and must keep passing; it is a different control from `✓ CARD` and
`pair-panel.ts` says why in as many words — that comment survives the deletion
and needs its second half rewritten, since the thing it contrasts against is
gone.

Nothing else reads the default: the shape sheets, `relay:check` and the
determinism run all build their own config and are unaffected.

Finished when `bun run check` is green, the transport row has no `✓ CARD`, a
fresh director shows the first wave's card without anybody turning anything on,
and a card steps p1 → p2 → play on three presses of the field.

`Check: in the director, does clicking the field step a card through player 1's half, then player 2's, then start the wave — and does the first click after that move the cannon rather than the card`

Model `sonnet`, effort `think`. Read `tools/director/src/stage-touch.ts` before
`stage-transport.ts`: the whole difficulty is press ordering on one canvas.

**Path overlap, on purpose.** THE MOUSE IS ONE HAND below owns
`tools/director/src/stage.ts` and `index.html` too, and THE DIRECTOR'S STAGE
READS THE SHIPPED WAVES owns `stage.ts` after it. This lane goes first and both
replay over it: what it adds to `stage.ts` is one press-ordering guard at the
top of the canvas's own `pointerdown`, and what it takes out of `index.html` is
one button. Neither is where those two lanes work.

## A WAVE OPENS ON ITS NAME, AND ITS HELP IS CALLED A GUIDE
_claude/burn-wave-guide · packages/content/src/wave-types.ts packages/content/src/waves.ts packages/content/src/briefings.ts packages/content/src/index.ts packages/content/test/briefings.test.ts packages/sim/src/briefing.ts packages/sim/src/wave-start.ts packages/sim/src/step.ts packages/sim/src/hash.ts packages/sim/src/index.ts packages/sim/test/briefing.test.ts packages/render/src/briefing.ts packages/render/src/hud.ts packages/render/src/renderer.ts packages/render/src/frame-passes.ts packages/render/test/briefing.test.ts apps/game/src/briefing.ts apps/game/src/waves.ts tools/director/src/card-catalogue.ts tools/director/src/card-gallery.ts tools/director/src/card-order.ts tools/director/src/card-page.ts tools/director/src/card-picker.ts tools/director/src/card-waves.ts tools/director/src/wave-briefing.ts tools/director/src/rail.ts docs/spec/briefings.md packages/content/test/waves.test.ts .claude/skills/new-creature/SKILL.md .claude/skills/new-wave/SKILL.md_
**Asked for by the owner.** Their ask, translated:

> I suggest we move all "cards" into the briefing configuration of a wave. A
> wave can have a piece of help or not. Help, for me, is a concrete
> instruction: how the controls or a new concept work. `name, sentence` of a
> wave is required text which I want to see first on the game screen — no card
> layout. If a guide card is configured for that wave it shows after that first
> introduction text (name, sentence, wave number). So I want a wave state we
> probably do not have yet, visible in the director as well: wave number, name
> and sentence as text on the screen, before the wave's sequence starts, and
> optionally a card in between. The card text I want to configure as part of
> the wave configuration, below `sentence`, in a section called `Guide` — so we
> had better rename "card" to "Guide", because in future I might replace it
> with a guidance animation and text.
>
> So I do not need a separate card configuration any longer. It should be part
> of the wave configuration, where later on a wave's guidance might become more
> complex — guide animations, which are more than text to configure. That has
> to be built uniquely, step by step.

Four questions were put to the owner before this was written, and their answers
are the parts of the brief that cannot be derived from the code:

1. **On two phones nothing about the split changes.** Each seat still sees its
   own half in words and the other seat's as blocks, at the same time. Only the
   director's `test` role steps one screen through both halves, and the lane
   above builds that.
2. **The guide text lives in the wave**, inline under `sentence`. The catalogue
   goes.
3. **The introduction runs on a timer** and passes on its own. It is not a
   thing to dismiss.
4. **`hint` is retired.** The introduction says what the fading banner said.

### The order a wave now opens in

1. **The introduction.** `WAVE 4`, the name, the sentence — plain text on the
   field, no panel, no border, no card. It stands for a few seconds and goes;
   nothing is pressed. Both seats see the same three lines, because all three
   are the same on both devices.
2. **The guide, if the wave has one.** Unchanged in shape from today's card:
   split, drawn over the field, and it holds the wave until *both* seats have
   put it away. That rule is not up for negotiation — a card one player skips
   past is a sentence the pair never finished reading.
3. **The wave.**

So on a phone the first press a player makes after the introduction is the
guide's, and on the director's stage the presses are the lane above's p1 → p2 →
play. The director shows all three states, in order, on every wave start,
because the lane above turned the opening on there by default.

### What changes in the data

`Wave` gains an optional `guide` written under `sentence`, and loses `hint`.
`card?: BriefingId` goes with the catalogue it pointed into.

**Shape it so an animation can arrive later without moving it again.** The
owner has said plainly that a guide may one day be more than three strings, and
that it will be built step by step. So `guide` is an *object with named parts*
— today `{ both, p1, p2 }` — and never three loose fields on `Wave` and never a
bare string. A scene, a picture or a step list is then a key added beside the
words, and no wave file has to be touched to make room for it. Say that in the
type's doc comment, so the next session adding motion knows where it goes.

**This overturns "derived, never placed",** which is the decision
`packages/sim/src/briefing.ts` and `docs/spec/briefings.md` are both built on,
and the lane rewrites both rather than leaving the reasoning standing beside
code that contradicts it. The argument for deriving was that a hand-kept list
beside a wave goes stale — a rock taught on wave 9 because nobody moved the
list. The trade is that a guide is now written where it is read, in the wave,
can speak about *this* wave rather than about a creature in the abstract, and
has somewhere to grow a picture. Write that paragraph honestly in the spec. It
is the second time that file has changed its mind, and the next session needs
to know why rather than which way.

### The staleness the derivation guarded against has a better guard

The owner's answer to "who writes the guide for a new creature", in their own
words, translated:

> Every creature gets its guide automatically, because Claude has to know that
> a new enemy needs a new wave — so the thing is visible and can be tested at
> once. And in that same moment Claude should know to author a guide briefing
> for that wave, because that wave is the first one carrying the new enemy or
> mechanic.

That is a stronger guarantee than the derivation gave, not a weaker one. The
derivation could only put a card in front of a wave that already existed; this
says the wave and its guide are part of what shipping a creature *means*. A
creature nobody can play is not shipped, and a wave that introduces something
with nothing said about it is a wave the pair reads by guessing.

**So write it down in the two places a session actually reads**, and enforce
the half that can be:

- `.claude/skills/new-creature` gains the step: the creature gets a wave that
  carries it, and that wave carries a `guide` naming what is new and which
  seat holds what. It sits beside the existing preview and replay-test steps,
  not as a footnote.
- `.claude/skills/new-wave` gains the other half: a wave that is the first to
  carry a creature, a pod kind, a boss or a mechanic writes a guide; a wave
  that carries nothing new does not, and padding one with a guide is the same
  failure as padding it with entries.
- **A test, because this repository does not run on good intentions.** In
  `packages/content/test/waves.test.ts`, beside the one-sentence test it
  already has: for every subject any wave carries, the first wave that carries
  it must have a `guide`. That is `cardFirstWave`'s derivation used as an
  assertion instead of as a lookup — the same computation, pointed at the
  question "did anybody write it" rather than "where does it go".

The kinds no wave carries at all today — the rock speed tiers, `purge` and
`ward` — are outside that test, because a subject with no wave has no first
wave. Do not make the test red over them and do not invent waves to satisfy
it: write the list into `docs/parked.md` as the gap it already is, named as
such, and `docs/spec/briefings.md` keeps saying so.

Add the rule to `packages/sim/test/purity.test.ts`'s table of rules that must
be called rather than re-derived only if the lane finds itself writing the
first-wave computation a second time; two copies of "which wave introduces
this" is exactly what that table exists to catch.

**The migration is derivable, not a guess.** `tools/director/src/card-waves.ts`
already computes `cardFirstWave` — which wave first raises each subject for a
pair playing in order. That mapping says exactly which wave each of today's 22
cards belongs to. Move the text there, keep the words, and let any that map to
no authored wave go with a line in `docs/parked.md` naming them, so the words
are not simply deleted.

**What is retired:** `BRIEFING_SUBJECTS`, `MAX_BRIEFING_SUBJECTS`,
`subjectIndex`, `BRIEFINGS`, `world.brief.met`, `forgetBriefings`, and
`openBriefings`'s derivation from `queue`/`podQueue`/`boss`. What survives is
smaller and does the same job: a wave opens, `wave-start.ts` reads
`wave.guide`, and `world.brief` holds whether one is up and which seats have
acked. It stays in `hashWorld` — the guide still freezes the field, so two
devices must agree it is there.

**The guide has no memory, and shows on every start of its wave.** The met set
was a bitmask over subjects, and there are no subjects any more. A wave carries
its own help, the director restarts a wave twenty times an afternoon and wants
to see it every time, and a run restarted after the hull went costs one press.
If that turns out to grate, the answer is a memory over wave indices, and it is
a second lane rather than a field added quietly here.

**The opening is now wave 1's guide.** `opening` was the one subject in no
queue, raised before the first wave and never again. Its three steps are about
the split itself, so they become the guide on `1 · FIRST STEP` and the special
case in `openBriefings` goes.

### The director follows the data

The CARDS sheet, its picker, its gallery and its wave ordering all read
`BRIEFINGS` and `cardFirstWave`. After this they read `WAVES` and each wave's
own `guide`, which makes most of them shorter: the "which wave first raises
this" derivation is the thing that no longer has to be computed. The mark in
`rail.ts` that says a wave opens on a card becomes `wave.guide != null`. Rename
what is user-facing to **GUIDE**, sheet heading included, and rename the files
if the split still makes sense afterwards.

`#briefToggle` keeps its name in the code (`cfg.briefings` is the gate on a
whole feature, not on one card) but the button under the field says what the
thing it turns on is now called — decide between BRIEFINGS and GUIDES and say
in the commit which and why.

### The rule this lane is exempt from, and the one it is not

This changes what a player sees in a frame, which CLAUDE.md's *a look is
offered, never replaced* would normally send to a NOT BUILT YET card. It is
exempt under the first of the three named exemptions: **the owner asked for it
by name**, in the words quoted above. That is the whole exemption — the lane
may build the introduction and the guide as described, and may not improve any
other look it passes on the way. If the introduction's typography turns out to
be the interesting question, that is a second lane and a decision for the
owner, not a tidy-up.

The purity rules are not relaxed for any of it: `content` and `sim` keep their
no-clock, no-randomness, no-DOM guarantee, and the introduction's few seconds
are counted the way the banner's already are, in the app, not on the world.

Finished when `bun run check` is green, no wave carries `hint`, every wave that
used to raise a card carries the same words as a `guide`, a wave opens on its
number, name and sentence, and both skills tell the next session to bring a
wave and a guide with every new creature — with the test that says so passing.

`Check: does a wave now open on its number, name and sentence as plain text on the field — long enough to read, without a panel around it — and does the guide that follows still read as two halves that have to be spoken across`

Model `opus`, effort `think hard`, and read before writing:
`packages/sim/src/briefing.ts` whole, `docs/spec/briefings.md` §3.1 and §3.6,
and `tools/director/src/card-waves.ts` for the migration mapping. This is a
deletion with a small addition in it — `tools/orphans` and `bun run check` are
the guards against leaving a corpse. Expect the spec rewrite to be a third of
the work and do not skip it.

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
