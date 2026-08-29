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

## THREE WHOLE-BODY VARIANTS FOR BULB QUEEN, AND THE PAGE GETS HER NAME
_claude/burn-queen-variants · tools/director/src/holders tools/director/src/holders-panel.ts tools/director/index.html_
**Asked for by the owner.** **Low priority — worked after everything above it.**

> for "bulb queen". based on collected new "holders" animation and graphic. I
> guess "cradle" looks best of the three of the variants. i want you to draft 3
> new improved visuals for the full bulb queen, but keep the logics and
> mechanics. put them on the "not build yet" - "Holders" page. rename page to
> "Bulb Queen variants"

**CRADLE won**, and `docs/verified.md` records it against `7ddfe14`. The other
two stay on the page as the record of what it was chosen against — a winner
with nothing beside it is a winner nobody can re-judge later.

### What the page becomes

`HOLDERS` is renamed **BULB QUEEN VARIANTS** — the tab button, the sheet id,
the page's own paragraph, and the file names if the lane thinks they should
follow. It carries two sections now: the three holders as decided, CRADLE
marked as chosen, and below them the three new whole-body drafts.

### What a variant may change, and what it may not

The owner said it: *keep the logics and mechanics*. That is not a vague
instruction here, because her picture is load-bearing in five specific ways and
a variant that breaks any of them is a different boss rather than a new look.
`queen.ts` and `queen-egg.ts` say all five in their own headers; read them
first.

1. **Two marks, and only one is real.** Both go through the same call, in the
   same colour, on the same clock. Player 1's picture never says which — the
   side shows only in the pulsing ring, and that ring is player 2's alone
   (`showsQueenHint`). A variant that makes the real one legible on both
   screens has deleted the boss.
2. **The marks sit on the columns either side of her own.** They are placed at
   `tileCX(l, queen.col + side)`, and the pair calls columns out loud. A
   variant that moves a mark off a column centre breaks the callout, however
   good it looks.
3. **She sinks a tile per petal lost.** Health is petals and petals are
   position — `queenRow` in `boss.ts`. The drawn body has to keep reading as
   *lower* rather than merely as *fewer*.
4. **The torch in the socket is the rock that drops.** `drawEgg` draws it at
   the torch's own radius and facing, in the column it will be pushed into, so
   the beat it breaks off the creature takes over the picture with nothing
   moving, changing size or turning. A variant that draws a *representation* of
   a torch reintroduces the doubling that file exists to have removed.
5. **A socket grows its replacement back** over `queenEggGrowShare` of a beat.
   Whatever holds the torch has to have an empty state and a growing state.

Everything else is open: her outline, the shell's material, how the petals
read, how the marks are cradled, the colour relationships, the sinking.

### Three, spread rather than three of one thing

The holders page worked because its three sat on one axis — how much of the
holder was machine and how much was her — so choosing between them decided
something rather than picking a favourite. Do that again, and **name the axis
on the page** so the owner is choosing a principle and not a picture. The axis
is the lane's to propose; what is not acceptable is three tunings of the
shipped silhouette, which is a preference poll rather than a decision.

CRADLE is the baseline holder in all three, since it has been chosen. If a
variant genuinely wants a different holder, it says why on its own card.

### The rules that bind this lane

**Nothing here touches `packages/render`.** The shipped queen is unchanged and
keeps being drawn exactly as she is; these are drafts beside her, and the owner
decides. That is *A look is offered, never replaced*, and it is the whole
reason this is a page and not a commit. The one exception already taken —
`drawTorchRock` exported so a card can draw the real rock — stands, and any
further export is a pure re-export of an existing drawing function or it does
not happen.

**One clock.** Every card takes the same beat and the same release, the way
`holders-panel.ts` already does it, because a comparison between things pulsing
on private clocks is not a comparison.

**Show her doing something.** A queen standing still is three silhouettes. At
minimum each card cycles the drop: holding, releasing, the empty socket, the
regrowth. That is the animation the owner already liked about the holders page.

Finished when `bun run check` is green, the tab reads BULB QUEEN VARIANTS, the
holders section says CRADLE was chosen, three whole-body drafts sit below it on
one clock, and the commit carries

`Check: of the three BULB QUEEN variants, does any of them read better than the one the game draws — and can you still tell which mark is the real one from player 2's screen alone`

Model `sonnet`, effort `think`. Read `packages/render/src/queen.ts`,
`queen-egg.ts` and `queen-weakpoint.ts` before drawing anything — the five
constraints above are all stated in those files, in their own words, with the
reasons attached. The drawing is the easy half; the trap is a variant that
looks better and quietly costs player 2 the one thing only they can see.

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

## THE PILOT TURNS THE WHEEL WITH A BUTTON THAT IS NOT THERE
_claude/burn-maze-turn-control · packages/content/src/controls.ts packages/content/src/control-sets.ts packages/render/src/band.ts packages/render/src/touch.ts packages/content/test/control-sets.test.ts_
**Proposed by the run.** Reported by `claude/burn-maze-wheel` on landing, as the
half its own paths could not cover.

**The round is not playable on a phone, which is the only device it ships on.**
THE MAZE's wheel is turned by the pilot holding a string. There is no control
for it: the lane routed the pull through THE GAUGE's `valve` command, and at a
desk Z and X drive it. On a phone, player 1 has nothing to hold.

Everything else about the round is built and landed — the wheel turns, the snap
holds, the shot travels the rings, a dead end costs hull. This is the one thing
between it and being played.

**The mechanism to use already exists and was landed the same day.** A control
set now carries a `PanelForm` — `band` or `slabs` — **derived from its controls
rather than declared beside them**, and `packages/content/src/control-sets.ts`
carries both kinds without the field's own sets learning anything. THE GAUGE is
the worked example: three slabs, per-seat, laid out by one function that the
draw, the game's hit test and the director all read. **Do not invent a second
mechanism**; if the maze's TURN does not fit that one, say why in the report
rather than adding a third.

**One thing to work out, and it is the whole lane.** The gauge's slabs are
*pressed*; the wheel's string is **held**, and held for a length of time the
pilot chooses — the report measures one click at 0.17 to 0.7 of a beat. A
control that is held is not the same shape as a control that is pressed, and
whether that is a property of the control, of the set, or of neither is the
decision here. Get it right and the eleven remaining rounds inherit it; get it
wrong and the next held control invents its own.

**Both seats, and the asymmetry is the point.** Only the pilot can turn, and
player 2 has the trigger and nothing else — so the panel is per-seat and the
navigator's half stays as it is. Do not give player 2 a turn button to balance
the panel; the split of verbs is what the round runs on.

**Keep the `valve` routing working while you do it.** Z and X at a desk are how
the round is tested in the director, and a lane that replaces the command
outright breaks the only way anybody can currently play it.

Finished when `bun run check` is green, `bun run test:determinism` passes, the
control is reachable in `CONTROL_SETS` on THE MAZE's own wave, the draw and the
hit test read one layout so a control is never drawn where it is not answered,
and the commit carries

`Check: on a phone, can player 1 hold the string and turn the wheel without being told which button it is`

Model `sonnet`, effort `think hard`. Read `packages/content/src/control-sets.ts`
in full — its header argues the shape — then `packages/render/src/band.ts` and
`packages/render/src/touch.ts`. The thinking goes on held-versus-pressed; the
rest is one entry in a table.

## THE WHEEL LEFT THREE PIECES OF STALE PROSE AND A PAIR OF WRONG FIELD NAMES
_claude/burn-maze-leftovers · tools/director/src/boss.ts tools/director/src/ship-fields.ts packages/sim/src/events.ts_
**Proposed by the run.** Reported by `claude/burn-maze-wheel`, outside its paths.

The lattice is gone and three places still describe it:

- **`tools/director/src/boss.ts`** and **`tools/director/src/ship-fields.ts`**
  still explain the maze as a tangle of nodes and branches. Read what each
  sentence was actually saying before rewriting it — a blind substitution of
  "wheel" for "lattice" produces sentences that parse and mean nothing.
- **`mazeProbe`'s fields are named `row` and `lane`** in `packages/sim/src/events.ts`
  and now carry a ring and a sector. A name that describes the old shape is
  worse than no name, because it reads as correct. Rename them, and check every
  reader — this is a hashed, lockstep package, so `bun run test:determinism`
  is the guard rather than an optional extra.

This is a naming and prose fix, not a look: nothing the game draws changes, so
the right number of `Check:` trailers is **zero**.

Finished when `bun run check` is green, `bun run test:determinism` passes, and
`grep -ri "lattice\|way out\|tangle" packages tools` finds nothing describing
THE MAZE as it no longer is.

Model `sonnet`, effort `think`. Small, but `events.ts` is in `packages/sim` —
read the rename's callers before making it.
