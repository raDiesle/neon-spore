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

## THE INTERLUDE STOPS BEING A CATEGORY AND BECOMES TWELVE BOSSES
_claude/burn-interludes-to-bosses · packages/sim/src/interlude.ts packages/sim/src/gauge.ts packages/content/src/interludes.ts packages/content/src/control-sets.ts packages/render/src/interlude.ts packages/render/src/gauge.ts docs/spec/interludes.md docs/decisions.md_
**Asked for by the owner.** **This is the next thing done.**

> ich schlage vor, dass wir alles zu "the gauge" in eine boss wave umwandeln.
> keine konfiguration für einzelne waves. das passt viel besser.
>
> yes, convert all related "interludes" to be a boss wave instead. and this boss
> wave comes with special control sets. so we need to convert to boss wave and a
> control set, which we assign to its boss wave. later on we might reuse the
> controls.
>
> so remove completely the interlude principle and implementation pattern

**Decided, not open.** Three questions were put to the owner and all three are
answered. Nothing below is a proposal; the lane builds it.

1. **The round keeps its own screen.** The field is still gone during one — no
   grid, no hull drawn, nothing falling, the round's own picture over the whole
   stage. What is deleted is only *how the round is reached*.
2. **The pair can die in one.** The old rule that an interlude may never end the
   run is retired by name.
3. **The run grows more acts.** Twelve rounds become twelve bosses, and the act
   table grows to hold them rather than the rounds squeezing between numbers.

### What is deleted

The whole reaching mechanism, and every trace of the category:

- `GAPS` in `packages/content/src/interludes.ts`, keyed by the wave it precedes.
- The `cfg.interludes` toggle and every place that reads it, including the
  director's PAIR panel row and `DEMONSTRATIONS`' `config: { interludes: true }`.
- The **second meaning of `needWave`** — `enterInterludeIfDue`,
  `world.interludeDone`, and the host asking whether the gap in front of the
  next wave carries a round before it builds one.
- `docs/spec/interludes.md` as a description of a category, and
  `docs/decisions.md` #20 and #21 as statements about a thing that no longer
  exists. **Rewrite them, do not delete them.** #21 in particular carries the
  reasoning about why the no-travel rule binds the field and not the game, and
  that reasoning survives its subject: a boss that draws its own screen is
  exactly as free of the column vocabulary as an interlude was. A decision
  removed without its argument is an argument somebody makes again in six
  months.

### What survives, unchanged

`gauge.ts`'s arithmetic — the needle, the drifting band, the call and its rest,
`gaugeMarks`, `gaugeRoundBeats`. The two role predicates `showsGaugeMarks` and
`showsGaugeValve`. The three phases, if they are still wanted as a shape; they
belong to the round now rather than to a shell. None of it cares what reaches
it, and none of it should change in this lane.

### The controls become a real control set, and that is the interesting half

`control-sets.ts`'s header currently refuses to register the gauge's controls,
and **it refuses on the exact ground this change removes**:

> It is deliberately not registered here, because the thing that reaches for it
> is a *round*, not a wave, and every set in this file must be reachable by
> naming it on a wave.

Make the round a wave and the objection dissolves. That paragraph is also the
one that already worked out the shape — *"whole, per-seat, enumerable, and
un-composable with the band"* — and it says the layout below it is what the
gauge's panel would take if a later lane ever wanted both lists on one page.
This is that lane. Read it before designing anything.

**The one thing to work out.** A set in that file today describes the *band* —
the strip of buttons the field is played on. The gauge's three slabs are not a
band: they replace it entirely, they are per-seat, and `interludeControls`
lays them out geometrically by dividing the width by however many that seat
has. So a set has to be able to say *"I am not a band, I am my own panel"*, and
`control-sets.ts` has to carry both kinds without the field's own sets learning
anything new. Get that boundary right and the other eleven cost one entry each;
get it wrong and every future round re-invents a panel.

The three readers of `interludeControls` follow it wherever it goes: the draw,
the game's hit test, and — since `916f811` — the director's. All three read one
layout on purpose, so a control is never drawn where it is not answered. Keep
that property; it is worth more than the file it currently lives in.

### The per-boss configuration already exists, twice, and no third is wanted

The owner: *"every boss wave might need then a special configuration. but this
concept we already have, i guess"* — correct, and the lane must use what is
there rather than inventing a place to put a round's settings.

**Two mechanisms, and the line between them is already drawn.**

`SimConfig` is the **run's tuning**, split into per-subject blocks that it
extends flatly — `config-boss.ts`, `config-pair.ts`, and `config-gauge.ts`,
which holds THE GAUGE's six numbers today. Every call site still reads
`cfg.gaugeMarks`; the split is only about how much of one file a reader holds
at once. Tuning is never written to `waves.ts`.

The wave's own `boss:` entry is the **authored content** — `{ kind: "queen",
col: 3, petals: 9 }`, `{ kind: "maze", rounds: MAZE_ROUNDS }`. That is where a
particular encounter's shape lives.

`config-gauge.ts`'s header has already thought this through and says so:

> an interlude is a round of its own, and the next eleven will each want a
> block like this rather than another twenty lines in the middle of the field's
> own tunables.

So the answer for each of the twelve is: a `config-<round>.ts` block for its
numbers, a `boss:` entry for its authored content, and nothing else. If a round
seems to need a third home, that is a sign its data is on the wrong side of the
line — say so in the report rather than adding one.

### The pair can die, and the field is gone — both at once

These look contradictory and are not, but the lane must implement one specific
reading and say so in the commit. **The round does not draw a hull and the hull
is still at stake:** the field's picture is absent, `world.hull` persists
underneath, and failing the round costs it. A run can therefore end in a round.
The old sentence in `interludes.md` — *"A run ends on the field, on a hull that
reached zero, in the coordinate system the pair has been naming out loud all
evening"* — is retired, and the commit says it is retired rather than leaving
two documents disagreeing.

What failure costs is a number and it is the owner's to tune later, so put it in
`SimConfig` as a named field and do not spend the lane arguing about its value.

### Order of work

**Do the gauge first and land it before touching the other eleven.** It is the
only one built, so it is the only one that can prove the new arrangement runs.
The remaining eleven are spec entries and become queue entries once the gauge
has landed as a boss — one each, and the report says so rather than this lane
trying to carry twelve rounds that do not exist yet.

Finished when `bun run check` is green, `bun run test:determinism` passes,
`grep -ri interlude` finds nothing outside the rewritten decisions and the
spec's own history, THE GAUGE is reachable as `boss: { kind: "gauge" }` on a
wave with a named control set, and the commit carries

`Check: played as a boss wave, does THE GAUGE still feel like a break from the field, or like a wave you are not allowed to shoot`

`Check: can the pair actually lose the run inside a round now, and does losing it read as losing rather than as a bug`

Model `opus`, effort `ultrathink`. This removes a category the game was
organised around and the unpick test is unambiguous: eleven unbuilt rounds are
specced against what is being deleted, and the control-set boundary decided here
is the one every one of them will inherit. Spend the thinking on **the
control-set boundary and on what the rewritten #20/#21 should say** — the
conversion itself is mechanical. Read `docs/spec/interludes.md` in full,
`docs/decisions.md` #20 and #21, `packages/content/src/control-sets.ts` in full,
and `packages/sim/src/interlude.ts`.

## A METEOR SHOULD LOOK LIKE A ROCK, AND THIS ONE IS PINK
_claude/burn-meteor-look · packages/render/src/meteor.ts packages/render/test/meteor.test.ts_
**Asked for by the owner.**

Their words: *i want you improve the meteor visuals. it should look like a
meteor. maybe you want to use existing crater skin and improve further. also
the shape of meteor has a lot of pinks, its not natural for a meteor.*

**The pink is a defect, and the first job is to find it rather than to paint
over it.** The body's own fill is `#8A8F9C` and `PALETTE.rock` is `#C7CBD6` —
both cool greys, neither of them pink. The prime suspect is one line in
`packages/content/src/light.ts`: `rock: "value+hue"`, which makes the rock the
one thing on the field whose *hue* the key light is allowed to move. Every
other body is `"value"`, and `key-light.ts` explains why that keeps a red body
red. Confirm it before changing it — take a frame, sample the pixels, and say
in the commit which pass actually put the pink there. The `halo` call at the
bottom of `meteor.ts` is the second suspect.

Under CLAUDE.md's *A look is offered, never replaced* this is the **third
exemption**: a meteor reading as pink is wrong rather than unlovely, so it is
repaired on the field and not offered beside itself. The commit says that
sentence in its own words — that is the guard against the exemption eating the
rule.

**The improvement half is the other exemption — the owner asked by name.** They
point at `tools/director/src/skins/crater.ts`, which already draws lit-rim,
dark-floor craters that vary across the body and are lit individually. That is
the reference. It is not a file to import: a skin card is not the field, and
`meteor.ts` draws at field size on a rolling body. What transfers is the
*approach* — pits that vary with position and catch the key light — against
what is there now, which is `c.holes` flat dark circles at a fixed radius with
a half-alpha stroke.

Do not touch the silhouette. The contour is what the pair calls out, and
`docs/spec/graphics.md` is the constraint on how much a rock may read as
anything else.

Finished when `bun run check` is green, `frame.test.ts` still passes through
the strict canvas stub, and the commit carries two trailers:
`Check: is the meteor grey now, at speed, against the field's own violet`
and
`Check: does the meteor read as a rock rather than as a circle with dots on it
— at 26 px on a phone, beside a bulb for contrast`.

Model `sonnet`, effort `think hard`. Read `packages/render/src/key-light.ts`,
`packages/content/src/light.ts` and `tools/director/src/skins/crater.ts`.
Behind the shadow lane if both run: they do not share a path, but they share
the frame the owner will judge.

## THE DIRECTOR DRAWS "TAP TO RESTART" AND NOTHING IS LISTENING
_claude/burn-director-sheet-close · tools/director/src/stage.ts tools/director/test/stage.test.ts_
**Asked for by the owner.**

Their words: *when on desktop pc in director, i open "sheet", i cannot close it
again. the click on the screen seems not to work. also i guess my expectation
is, if i click "sheet" again, it toggles to hide.*

**Already diagnosed — do not re-derive it, verify it and fix it.** `▣ SHEET`
(`#endRun`, bound at `tools/director/src/stage.ts:198`) calls `endRun(world)`,
sets `running = false` and paints once. The after-run screen that comes up is
the game's own, drawn by `packages/render/src/balance.ts`, and line 65 of that
file writes **"tap to restart"** onto it.

In the game there is an input layer that honours those words. In the director
there is not: `stage.ts` binds `click` on `#playBtn`, `#restart`, `#ackBrief`,
`#endRun` and the role buttons, and **binds nothing on the stage canvas at
all**. So the screen instructs the reader to do something the director never
listens for. It is not a mouse-versus-touch problem and it is not desktop-only;
the handler is absent, so no pointer of any kind can dismiss it.

Two fixes and the owner named both, so do both.

**The canvas honours its own instruction.** A click on `#stage` while the run
is over restarts it — the same thing `#restart` already does. That is the
literal repair: the text stops lying.

**And `▣ SHEET` toggles.** Pressed once it ends the run and shows the sheet;
pressed again it puts it away and the stage comes back. Today the second press
re-ends an already-ended run, which is why the button reads as dead. The label
may want to say which way it will go, the way the other toggles on this page
do — that part is a judgement, and the commit says which way it went and why.

Neither half touches the game. `balance.ts` is drawing exactly what it should
and is not edited here; this is the director failing to wire a screen it chose
to show. Say that sentence in the commit — it is what keeps the fix out of
`packages/render`.

Finished when `bun run check` is green, a test covers both dismissals (a click
on the stage after the run ends, and a second press of `▣ SHEET`), and the
commit carries
`Check: after ▣ SHEET, does clicking the stage bring the field back, and does a
second press of ▣ SHEET do the same`.

Model `sonnet`, effort `think`. Read `tools/director/src/stage.ts` and
`packages/render/src/balance.ts`. This is a tool fix, not a look: nothing the
game draws changes.

## THE DIRECTOR'S CONTROLS SIT AWAY FROM THE THING THEY CHANGE
_claude/burn-director-layout · tools/director/index.html tools/director/src/stage.ts tools/director/src/pair-panel.ts tools/director/test/stage.test.ts_
**Asked for by the owner.**

Their words, all five, kept whole because the ordering between them is theirs:

> i expect the briefing configuration to be placed below the game screen
> allowing me to toggle it.
>
> make sure when i press "reset" wave, and "card" is enabled and "briefing" i
> will see the game in order and timings as the players will see it.
>
> i suggest "card" should be a checkbox like "briefings". and card/briefing is
> shown at the beginning of wave reset.
>
> Also "Balance" button should go below the player screen.
>
> "ship" button content should go inside bottom of "Wave" button content.
>
> Also "Interlude" should be first section in the "wave" content area, as its
> logical in order to be first.
>
> I also think it should be regrouped. configuring the card, should also be
> part of "Interlude" as it comes first in order for players.

**One lane, not seven.** They share `index.html` and `stage.ts`, and two lanes
may not own the same path. Do them in the owner's order.

**They gave the sorting rule, and it is the useful part of this entry.** The
last two asks are not two more moves — they are the *principle* the other five
were reaching for: **the editor is ordered by when a pair meets the thing.** An
interlude runs in the gap *in front of* a wave, so it is the first section of
WAVE and not a tab beside it. A card opens the wave, so it belongs with the
interlude at the top. The ship is what the wave leaves behind, so it is the
bottom. Sort by that rule and every one of the seven asks falls out of it; a
lane that moves seven elements without holding the rule will get the eighth
wrong.

**Where things are today**, so the lane does not spend its first hour finding
out. The editor column carries five tabs — WAVE, SHIP, TUNING, BALANCE,
INTERLUDE. `Briefings` is a checkbox inside TUNING → PAIR (`#pairPanel`,
`pair-panel.ts`), which is two clicks from the stage it changes. `tab-balance`
holds `#balanceSheet`. `tab-ship` holds one heading and `#caps`. Under the
stage, `.transport` carries `⏸`, `↺ WAVE` (`#restart`), `▣ SHEET` (`#endRun`),
`✓ CARD` (`#ackBrief`) and the three role buttons.

**`✓ CARD` is not the checkbox the owner thinks it is, and that is the crux of
the ask.** It is an *acknowledge*: it pushes `{kind: "brief"}` for both seats,
and its comment in `stage.ts` says why it has to exist — without it, turning
`briefings` on freezes the stage on the first wave forever, because
`startWave` opens the card and nothing else in the director can put it away.
So "make CARD a checkbox" means **two** controls where there is one: a toggle
saying whether cards are shown, and a way to dismiss the card that is up. Do
not delete the dismiss. The stage is the card's own button on a phone
(`apps/game/src/briefing.ts`) and here the canvas pointer is already spent on
the cannon, which is the whole reason the button exists.

**The order-and-timings half is a real question, not a layout one.** `↺ WAVE`
calls `rebuild()` (`stage.ts:91`), which builds a fresh world and calls
`startWave`. Whether the card then opens the way a *pair* meets it depends on
`met` — and `wave-briefing.ts:28` is the file that already got this right for
the CARDS gallery: it forces `briefings: true` and `met` at zero **regardless
of the run's own toggle**, precisely so a fresh pair is what you see. Find out
what `rebuild()` does with `met` before changing anything, and say the answer
in the commit. If the director is showing a card a pair would have already
dismissed, or skipping one they would have met, that is the defect the owner is
describing and it is worth more than the four layout moves put together.

**The timings are the second half of it and they are cheap to get wrong.** A
card that appears instantly on reset, or that the stage runs behind, is not
what the players see. The wave's opening beat, the card, the banner and the
first arrival happen in an order and at a tempo; the reset must replay that
order, not approximate it.

**So the WAVE tab ends up in play order**: the gap in front of it first
(`tab-interlude`'s heading and `#interludePanel`, moved whole), the card that
opens it next, the wave itself, and what it adds to the ship last. Two of the
five tabs are retired by this — SHIP is one heading and `#caps`, and the
topbar's `⚙ SHIP` already carries the ship's own dials; INTERLUDE is one
heading and `#interludePanel`, and its note already says it is keyed by the
wave it precedes, which is the argument for it living in that wave's page.
BALANCE moving under the stage puts it beside `▣ SHEET`, which is the button
its own note already talks about.

**One tension in the asks, and it is the owner's to settle rather than the
lane's to quietly pick.** *"the briefing configuration ... below the game
screen"* and *"configuring the card should be part of Interlude"* pull opposite
ways. The reading that satisfies both is that they are two different controls:
the **toggle** goes under the field, where it is one click from the stage it
changes, and the **configuration** — which card this wave raises, what it says —
groups with the interlude at the top of WAVE. If the lane finds that reading
does not survive contact with the code, it stops and asks rather than choosing
one of the two.

Finished when `bun run check` is green, a test covers the reset sequence with
both toggles on, and the commit carries
`Check: with card and briefing both on, does ↺ WAVE replay the wave's opening
in the order and at the speed a pair would meet it`
and
`Check: does the WAVE tab now read in the order a pair meets it — the gap, the
card, the wave, then what it adds to the ship`.

Model `sonnet`, effort `think hard`. Read `tools/director/src/stage.ts`,
`tools/director/src/wave-briefing.ts`, `apps/game/src/briefing.ts` and
`tools/director/README.md`. This is the director, not the game: nothing the
game draws changes, so no look is being replaced. Think about the two-controls
problem before moving a single element — the layout is easy and the card
lifecycle is where this lane can go wrong.

## A WAVE'S CARD IS DERIVED, AND THE OWNER WANTS TO SEE IT AND PICK IT
_claude/burn-director-card-pick · tools/director/src/wave-panel.ts tools/director/src/card-waves.ts tools/director/test/card-waves.test.ts_
**Asked for by the owner.**

> I think i misunderstood the behavior and purpose of "Briefings" checkbox.
> I suggest i can in dropdown select available briefings/cards, which are not
> taken by any other wave, yet. it should also give me a small tooltip or link,
> which i can see all available briefings/cards and their distribution to
> waves.
>
> So i want exactly to see the name of the briefing/card chosen for the current
> wave and not automatically assign it.

**Behind `claude/burn-director-layout`**, which is moving the same editor
column. It owns `index.html` and `stage.ts`; this lane adds to them in one
contiguous region and replays over that one, exactly as the preamble describes
for a file owned by nobody.

**Nothing assigns a card to a wave, anywhere, and that is the thing to
understand before touching it.** `openBriefings` in
`packages/sim/src/briefing.ts:135` builds the due list out of the wave's own
contents: it walks the queue, the pods and the boss, turns each kind into a
subject index, and keeps the ones the pair has not met — `world.brief.met`, a
bitmask carried across waves. So a card is raised by *the first wave that
contains the thing it teaches*, and "which wave owns the meteor card" is a
consequence of authoring, not a field anybody set. `BRIEFING_SUBJECTS` is
twenty-one entries and the creature kinds are spelled the same as their kinds
on purpose, so no second table can drift.

**Half of the ask already exists and the owner has not found it.** *"a link
which i can see all available briefings/cards and their distribution to
waves"* is `◇ NOT BUILT YET → CARDS` — its own subtitle reads "every briefing
card, assigned to the wave that first raises it for a pair playing in order".
So that half is **a link, not a build**: put it next to the wave's card row
where they are looking for it. Do this half first; it is small and it may be
most of what was actually wanted.

**Showing the name is free and should land regardless.** `card-waves.ts`
already builds a world at the moment a wave starts and carries that wave's real
`world.brief.due`. The WAVE tab can name the cards this wave raises without any
model change at all — read-only, derived, always correct.

**The dropdown is a design decision and this lane may not make it.** *"select
available briefings/cards which are not taken by any other wave"* and *"not
automatically assign it"* mean a wave would carry an authored card id that
overrides the derivation. That reaches into `packages/sim`, which is lockstep
and hashed, and it retires the invariant that every mechanic is taught exactly
once at the moment it first appears — an invariant nobody has to maintain today
because it is a consequence rather than a rule. It may well be worth it: the
owner is the one authoring waves and being unable to say *this* wave teaches
*that* card is a real limit.

**So: stop after the first two halves and ask.** The question for the owner is
narrow — *should an authored card override the derivation, or only annotate
it?* Override means a wave can teach a card early, or withhold one, and the
"taught exactly once, in order" guarantee becomes theirs to keep. Annotate
means the dropdown is a filter on what the derivation already chose, sim does
not change, and "not taken by another wave" stays a computed fact rather than a
stored one. Put the question in the report and do not guess.

Finished — for the part this lane may do — when `bun run check` is green, the
WAVE tab names the cards the current wave raises and links to `◇ NOT BUILT YET
→ CARDS`, and the commit carries
`Check: does the wave editor now say which card this wave raises, by name,
without you opening another sheet`.

Model `sonnet`, effort `think hard`. Read `packages/sim/src/briefing.ts`,
`tools/director/src/card-waves.ts` and `tools/director/src/wave-briefing.ts`.
Nothing the game draws changes; nothing in `packages/sim` changes without the
owner answering first.


## THE MAZE BECOMES A WHEEL THE PILOT TURNS AND THE NAVIGATOR READS
_claude/burn-maze-wheel · packages/sim/src/maze.ts packages/sim/src/maze-round.ts packages/content/src/maze-rounds.ts packages/render/src/maze-draw.ts packages/sim/test/maze.test.ts packages/render/test/maze-draw.test.ts_
**Asked for by the owner.**

> rework the maze, I expect something like image attached. start with a simpler
> rounded maze with only 2 entrances, where only one reaches the middle.
>
> The idea is the following: player 1 must pull on some string/s on the maze
> otherwise the player 2 is not able to shoot in a straight line vertical to hit
> an entrance to the maze. player 1 must find the right angle so the maze
> rotates in a way, that its possible to shoot vertical. it should help in some
> range of angle to lock entrance to stay vertical. it should have a visual
> effect that light shines out of the entrance, indicating that player 2 can now
> shoot.
>
> same for other entrance. player 1 has to find right angle on the one pull
> string, which is always visible for both players, so the round maze rotates
> again that the second entrance is vertical to ship and other player can shoot
> it.
>
> either in the center of maze its a "slick" or a "bulk", so the right choice
> has to be taken.
>
> when player 2 shoots and the entrance was locked to be vertical to ship in a
> straight line, the shoot cannon, once it enters the maze entrance, moves
> around the maze, and find its way to the middle or dead end.
>
> the objective is to hit the middle. the maze should be almost full size of the
> screen (around maybe 6/7), but enough space between maze and ship.

The reference is a concentric ring maze with numbered entrances round its rim.
**It is a stock image with a watermark on it. It is a thing to look at and not
a file to commit** — the rule about vendoring a third-party file applies, and a
fixed illustration could not be rotated or re-sampled anyway. The wheel is
generated, in ring-and-sector space, or it is not this round.

### Read the file you are replacing before you replace it

`maze.ts`'s header is the design being thrown away and it argues its own case.
Three things in it are load-bearing, and the commit says what happened to each.

**The split is by layer, and that is the boss.** Today the pilot sees which
ways out a node has and nothing about which are fused; the navigator sees which
direction is walled and nothing about whether an arm was there to wall. The way
out is the arm that is not walled, so *every node on the path needs a sentence
from each of them*. The header also records what was rejected: a split by
region hands each half a self-contained stretch and one relay ends the round; a
split by end is THE SPLICE in a different coat.

**The tangle deliberately does not move.** *"the voice channel carries half a
second to two (`docs/spec/latency.md`), and a lattice that changes between her
sentence and his thumb makes the sentence wrong on arrival."* The new round
turns the maze, so this objection has to be met rather than stepped over.

**It is probably met, and here is the argument to check.** The stale-sentence
problem comes from a *discrete* fact going out of date in flight — "left at the
third node" is wrong if the lattice re-tangled. A continuously held control
with live feedback carries no such fact: it is *"more — more — stop"*, which is
THE GAUGE, which already works at this latency and is already in the game. If
that argument does not hold, the round is wrong and the lane says so rather
than shipping a boss the pair cannot talk through.

**Rounds are authored, not generated** — `maze-rounds.ts`, nothing from the
rng, the same as THE MIRROR. Rotation does not change that: the wheel's
*layout* stays authored. If a starting angle is drawn at all it comes from the
seeded `Rng`, and only under `docs/spec/structure.md` 7.3 — the only thing that
stays random is what one player knows and the other does not.

### The question this lane may not answer on its own

**Who sees what?** The owner's description says the string is visible to both
and says nothing else about the split. Without one this is a solo puzzle with
an audience — the exact failure `maze.ts` names in its second paragraph. It has
to be settled before a line is written, and the round is worth nothing if it is
settled wrong.

**The recommendation, to be put to the owner rather than assumed.** The pilot
holds the string and sees the wheel *turning* but not the alignment; the
navigator sees the light come up in the entrance as it crosses the column, and
can turn nothing. Then the round is *"more — a bit more — there"*, both halves
are per-moment rather than a fact that can be read out once, and the light the
owner asked for lives on the navigator's screen rather than on both.

The second question rides on it: **which entrance reaches the middle, and is
the centre a slick or a bulb — who knows that?** If both see it, the colour
choice is free and the round loses half its point. Put both questions in the
report and stop if they are unanswered; do not pick and build.

### What is settled, and can be built once the split is

**Two entrances, one of them a dead end.** The owner asked for the simple case
first and it is the right first case: the smallest wheel that still needs both
verbs and both screens.

**The lock is what keeps the game's vocabulary.** The pair talks in columns,
and an angle is not a column. So the snap is not a convenience, it is the
bridge: within some range the entrance pulls to the column it is nearest and
holds there, and the pair goes back to saying *"column four"*. Get the range
wrong either way and the round breaks — too wide and the wheel has no positions
between snaps, too narrow and the pilot can never hold one.

**The shot travels the corridors.** Precedent exists: `mazePath` and the
picture lane already send a shot down a strand and back out. It enters at the
locked entrance, follows the ring-and-sector path, and arrives at the middle or
at a dead end. **Where it goes wrong must be legible** — the same sentence the
last maze lane was given, and for the same reason: a shot that simply fails to
arrive teaches nothing.

**Integers, in thousandths.** Rule 3, and rotation is exactly where a float
gets in. The angle is an integer, the snap is integer arithmetic, and two
devices must never disagree about a rounding step. `purity.test.ts` is not the
only guard here — `bun run test:determinism` is.

**Size.** About six sevenths of the field's width, centred, with real clearance
between the rim and the hull. The cannon still has to slide under it. Say the
measured numbers in the commit.

**Nothing here travels.** The wheel turns in place, the cannon slides on the
hull as it always did, and a shot is a shot. `CLAUDE.md`'s field rule is not in
play; say so in the commit so the next reader does not re-derive it.

Finished when `bun run check` is green, `bun run test:determinism` passes, the
frame test passes through the strict canvas stub, `restart.test.ts` still
passes with anything new in `Effects` cleared, and the commit carries

`Check: with the wheel turned so an entrance sits under the cannon, does the lit entrance read as an invitation to shoot, or just as a bright spot`

`Check: can the pilot hold an entrance on a column, or does the wheel slip off it — at phone size`

`Check: when the shot takes the wrong entrance, can you see where it went wrong, or does it only fail to arrive`

Model `opus`, effort `ultrathink` — the owner asked for the highest, and the
unpick test agrees: this is a premise baked into a boss, and a split chosen
wrong is expensive to discover months later. Spend the thinking on **the
information split and the latency argument, before any geometry**. The wheel,
the snap and the path are the easy half, and a lane that thinks hard about
ring-and-sector arithmetic and lightly about who sees what will produce a solo
puzzle that runs. Read `packages/sim/src/maze.ts` in full,
`docs/spec/latency.md`, `docs/spec/structure.md` 7.3, `packages/sim/src/gauge.ts`
for a held control that already survives this latency, and `docs/spec/bosses.md`.

## THE QUEEN'S TORCHES BUZZ, AND THE SHIP FEELS NOTHING
_claude/burn-queen-tremor · packages/render/src/queen.ts packages/render/src/hull.ts packages/render/test/queen.test.ts_
**Asked for by the owner.**

> the rotating meteors attached to the "bulb queen" are super fast, it must be
> very slow, also add that the full ship should shake a little bit, related to
> the shaking of the meteors.

**The "rotating meteors" are her torches**, and they are not rotating —
`torch.ts` is explicit that a torch does not turn, and says why. What the owner
is seeing is `torchTremor` in `queen.ts`, the shudder a torch makes in its
socket while a drop is pending. Read as rotation because it is fast enough to
blur, which is the whole complaint.

**The numbers are already written down, so this is a tuning change and not a
search.** `TORCH_TREMOR_HZ` is `[47, 61]` — radians a second, so about 7.5 and
9.7 cycles a second, which is a buzz rather than a tremor. The queen's own
shudder beside it is `Math.sin(time * 40)` and `Math.cos(time * 53)`, hard-coded
in `drawQueen` rather than named, and it has the same problem. `TORCH_TREMOR_TILES`
is `0.045` and `SHAKE_TILES` is `0.06`; the amplitudes are probably fine and the
*rates* are not, so change the rates first and only touch the amplitudes if the
result asks for it.

**Two things to keep while slowing it down.** The frequency pairs are
deliberately mismatched — 47 against 61, 40 against 53 — so the motion reads as
a shudder rather than as a circle, and `queen.ts` says so in both places. Keep
them coprime-ish and unequal or a slow tremor becomes a slow *orbit*, which is
the failure the current comment was written to avoid and would make the owner's
"rotating" literally true. And the torch tremor is deliberately its own pair,
smaller and separate from the queen's, so the two read as different things
happening at once; slowing both to the same rate merges them into one body
moving.

### The ship shaking is new, and it reverses a decision

`queen.ts:80` says it in as many words: **"A local shudder, not a screen
shake"**. The owner is asking for the screen shake that line declined, so the
commit says that plainly rather than quietly adding one — and it lands, because
they asked for it by name, which is the first exemption in *A look is offered,
never replaced*. The tremor slow-down is the third exemption: a torch that
buzzes fast enough to read as spinning is wrong rather than unlovely. Say which
of the two each half is, in the commit; that sentence is the guard.

**The one rule this cannot break.** A shake is **render-only and moves nothing
the pair aims at.** The hull's drawn position may wander a pixel or two; the
cannon's column, the shield's column, every hit region and everything `sim`
believes must be untouched. The pair spends the whole game saying "column
four", and a shake that moved a hit region by half a tile would make that
sentence wrong while it was being said. `packages/sim` is not in this lane's
paths and must not be.

**Related to the torches, as asked**, which is the interesting half: the ship
shakes *because* the torches do, so it is the same signal at a fraction of the
amplitude — strongest while a drop is pending, and out on `boss.releaseBeat`
along with the tremor itself, which `torchTremor` already sits out. That
coupling is what makes it read as the queen doing something to the ship rather
than as a camera effect.

**Keep it a pure function of `time` and `beat`, the way `torchTremor` already
is.** Then there is no field in `Effects`, nothing for `Effects.reset()` to
clear, and `restart.test.ts` has nothing to fail on. If the lane finds it needs
remembered state, that is a sign the design went wrong — but if it genuinely
does, it goes in `Effects` and is cleared, and the test is not weakened.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, a test pins the tremor to the slower rate so nobody tunes
it back by accident, and the commit carries

`Check: does a torch in her socket now read as trembling rather than buzzing, and can you still tell it is about to drop`

`Check: does the ship's shake read as the queen shaking it, or as a camera wobble that happens to be on`

`Check: with the ship shaking, can you still put the cannon on a named column without hesitating`

Model `sonnet`, effort `think`. Read `packages/render/src/queen.ts` in full and
`packages/render/src/torch.ts`. It is two numbers and one new pass; the thinking
goes on the third check — a shake that costs the pair any confidence about which
column they are on is a shake that has to come back down, however good it looks
standing still.

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

## A RELOAD SHOULD LEAVE YOU WHERE YOU WERE, ON EVERY PAGE AND NOT JUST ONE
_claude/burn-director-place-everywhere · tools/director/src/session.ts tools/director/test/session.test.ts tools/director/src/tabs.ts tools/director/src/backlog-page.ts tools/director/src/checks-page.ts tools/director/src/sound-page.ts tools/director/src/states-page.ts tools/director/src/controlsets-page.ts tools/director/src/card-page.ts_
**Asked for by the owner.**

Their words: *i want basically every view/page on director to stay opened when
its reloading page.*

**The line this depends on is already drawn, and it is not being moved.**
`session.ts`'s header says a value belongs in the URL when it changes *what you
are looking at* and belongs nowhere when it changes *what it looks like* or
*what would ship* — a TUNING dial, a picked skin, an edited wave's fields are
settings and are still forgotten on every load, because the director starting
from what ships is the thing that makes a judgement made here about the right
thing. Read that header before writing a line. The owner is not asking to
remember settings. They are asking why *place* only means one bar out of six.

**What is remembered today**, and it is the whole of it: `tab` and `wave`, for
the main editor's `#tabs` — WAVE, SHIP, TUNING, BALANCE, INTERLUDE.

**What is forgotten and should not be.** Every overlay page, and the tab open
inside it. They all work the same way — an `<id>Open` button, an `<id>Close`
button, `Escape`, and a `.on` class on the sheet — so this is one shape
repeated, not six problems:

- the backlog sheet (`#backlog`) and its own bar `#backlogTabs`, which is
  twelve pages wide: BESTIARY, SHAPES, MECHANICS, CONTROLS, BOSSES,
  INTERLUDES, PARKED, QUEUE, DESIGNS, HOLDERS, BORROWED, SPEC;
- CHECKS, STATES, SOUND (and its `#soundTabs` bar), CONTROL SETS, CARDS.

A reload inside the twelfth page of the sheet currently lands on the wave
editor, which is the reload the owner actually does.

**Restore through the click path, the way the tab already does.** `main.ts`
clicks `initialTab`'s button rather than setting a class, so a restored tab is
indistinguishable from a clicked one and every side effect a bar's click
carries — `drawShapes`, `drawCards`, `drawVersus` all hang off theirs — runs
exactly once and in the right order. Opening a sheet by adding `.on` to it
would skip all of that and the page would come back blank in ways nobody would
reproduce by clicking. Do it through the same door.

**Still `replaceState`, never `pushState`, and still read exactly once.** A
chain of clicks must not grow a history entry per click. And the fallback rule
holds for every new key: an unknown sheet name or an unknown inner tab opens
the page it can rather than throwing, because a URL outlives the code that
wrote it.

**One judgement to make and to say in the commit.** At most one overlay is open
at a time, so the sheet is one key rather than five booleans — but each sheet's
inner tab has to survive being closed and reopened, and whether *that* lives in
the URL or is simply the sheet's own last state is the call. Say which, and
why, in a sentence.

**And fix the header while you are in the file.** It points at a `docs/queue.md`
entry that has landed and been deleted, so it cites a document that is not
there; this entry will be deleted too, on the same rule. Make the argument
self-contained in `session.ts` rather than pointing anywhere, and note that the
paragraph is the reason a later module must not reach for this one to remember
a dial.

This is a tool fix, not a look: nothing the game draws changes, and *A look is
offered, never replaced* does not apply.

Finished when `bun run check` is green, `session.test.ts` covers the round trip
and the fallback for every new key the URL learns, and the commit carries

`Check: open the backlog sheet on SPEC, reload, and does the director come back on SPEC rather than on the wave editor`

`Check: after a reload restores a page, is everything on it drawn — or is something blank that fills in when you click the tab yourself`

Model `sonnet`, effort `think hard`. Read `tools/director/src/session.ts` in
full and `tools/director/src/tabs.ts`, then one of the overlay pages —
`backlog-page.ts` is the widest — to see the shape all six share. The thinking
goes on the place-versus-setting boundary: this lane widens what counts as a
place, and the next module that wants to smuggle a dial across a reload will
cite it.

## ONE CHECK PER LANDING, NOT ONE PER THING THE LANE CHANGED
_claude/burn-checks-fewer-and-wider · docs/verification.md .claude/skills/autonomous/SKILL.md CLAUDE.md_
**Asked for by the owner.**

Their words: *the "to check" items, try to combine changes to be more combined.
its too many small items. better group into single change to test and more
generic.*

**The list has been failing on volume, and volume is a property of how the
trailers are written.** A landing that touches three things writes three
trailers today, so the owner opens the director and finds nine rows where they
made three decisions — and nine rows is furniture rather than a list. Note that
they did not ask for the rows to be shorter. That was the last complaint, it
was answered by the 25-word cap, and it did not fix this one: twenty short rows
are still twenty rows.

**The unit is the landing, not the change.** One commit, one trailer, by
default — the question being *did this landing come out right when you look at
it*, which is the question they are actually answering when they open the page.
A second trailer on one commit is the exception and has to earn itself: it is
justified only when the two could genuinely come back with different answers,
and a lane that writes one says so in the commit message.

**Generic means the question a person would ask, not the union of two
questions.** The failure to design against is the trailer that welds two
unrelated things with an "and" — *does the shadow gather and is the meteor
grey* is one row that cannot be answered, because half of it can pass while the
other half fails and the verdict has nowhere to go. A combined check is one
where the *subject* is bigger, not where two subjects share a line: *does a
falling rock read as a rock getting closer to the ship* covers both the shadow
and the body, and has one answer.

**What to change, and it is three files that must agree.** `docs/verification.md`
is the mechanism, `.claude/skills/autonomous/SKILL.md` is what a lane is told,
and CLAUDE.md's cloud-session section is what a cold clone reads first. All
three currently describe one trailer per thing looked at, and none of them says
a number. Say it once, in `docs/verification.md`, and have the other two point
at it rather than restating it — three copies of a rule is how the 25-word cap
came to be written twice and obeyed in neither place.

**Do not weaken what a check is while widening it.** The rest of the shape
stays exactly as it is: one sentence, a question with an imaginable "no",
written for somebody who only plays the game, no identifiers and no paths, and
the badge and the six restatement fields unchanged. A wider question is still a
question a person can go and see. If a landing genuinely changed nothing a
player could look at, the right number of trailers is still zero, and that
rule does more work under this change rather than less.

**One thing to work out, and it is the interesting half.** A lane knows what it
changed and does not know what the *landing* will look like from outside — that
is the whole reason it writes three narrow rows instead of one wide one, and
telling it "write fewer" without telling it how to find the wider subject will
produce the welded-with-and row above. So the instruction a lane gets has to be
a procedure, not a limit: name the thing a player would say changed, in their
words, before writing any trailer at all, and if two changes have the same
answer to that, they are one check. Get that sentence right and the rest is
editing.

This is a tool and a process fix, not a look: nothing the game draws changes.

Finished when `bun run check` is green, the three files agree and do not repeat
each other, and the commit carries

`Check: opening the check list, does it read as a short list of decisions you could make in one sitting, rather than as a log of everything that landed`

Model `sonnet`, effort `think hard`. Read `docs/verification.md` in full, the
"What a `Check:` has to contain" section of `.claude/skills/autonomous/SKILL.md`,
and then twenty rows of `docs/verified.md` — the evidence for what a real
trailer looks like is in the ledger, not in the rule that was supposed to
produce it. The thinking goes on the procedure for finding the wider subject;
the file edits are the easy half.
