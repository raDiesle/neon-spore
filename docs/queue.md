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

## THE TETHER IS PULLED, AND A LONG PULL OPENS THE WARDEN UP
_claude/burn-tether-pull · packages/sim/src/warden.ts packages/sim/src/warden-cycle.ts packages/sim/src/config-boss.ts packages/render/src/tether.ts packages/render/src/warden-fx.ts packages/sim/test/warden.test.ts docs/spec/bosses.md_
**Asked for by the owner.** Asked whether THE WARDEN's tether should follow a
finger too, since the entry above deliberately left it alone:

> yes. you click it then drag in a direction. if the string is pulled a longer
> distance the warden can be attacked

**Behind `claude/burn-grab-and-drag`, which must land first.** That lane builds
the displacement a grab reports — the origin resolved on the device whose
finger it is, the distance crossing the wire as thousandths of a tile — and
this entry is the second thing to use it. Do not invent a parallel one.

### What the tether does today, because the ask lands on top of it

A line hangs from the rim and falls at a named rock's speed. Only the player it
is **not** holding can pull it free, and the way they do it is to hold: the
hold **accumulates** over ticks (`wardenPullBeats`, `packages/sim/src/warden.ts`),
a thumb that slips loses that moment and no more, and tearing it in time takes
a plate off the ring. `config-boss.ts` says in as many words why it is time and
not steadiness:

> the question the fight asks is *when* the other player can spare their hand,
> never whether they can hold it steady on a phone

That sentence is the one thing this entry must not run over by accident. A
pull measured in distance is a pull that can be *fumbled*, and fumbling on a
phone is exactly what the current rule was written to keep out of the fight.
Whatever this lane builds, the fight must still be about the other seat's
attention rather than about their aim.

### The question the owner still has to answer, and it is the whole lane

**Does distance replace the accumulated hold, or sit beyond it?** Two readings,
both consistent with what they said, and they are different games:

- **Distance replaces time.** Tearing the tether becomes: grab it and drag it
  far enough. `wardenPullBeats` retires. Simplest to explain, and it overturns
  the decision quoted above rather than extending it.
- **Distance is a second, further threshold.** Holding still tears the line as
  it does now; dragging it *further than that* is an extra thing a player can
  choose to do, and the reward is the new one — the ring opens to attack.

The second reading is the one the owner's sentence most nearly says: *if the
string is pulled a longer distance* implies a shorter distance that already
does something. **Do not decide this alone.** If the owner has answered by the
time this is picked up, the answer is in the queue; if not, stop and ask.

### And what "can be attacked" means is the second question

The ring already loses a plate per opened eye and a plate never grows back. So
*attacked* may mean the existing plate coming off, or a window in which the
ring is shootable when it otherwise is not — today a tether is explicitly not
shootable and does not stop a shot (`packages/sim/src/bullets.ts`). Those are
different mechanics, one of them is new, and the difference is a boss's
choreography rather than a parameter. Same rule: ask rather than pick.

**Everything the drag needs is integers.** Rule 3, and `bun run
test:determinism` is the guard — a pull distance is exactly where a float gets
in. Both devices must agree on the tick a threshold is crossed.

Finished when `bun run check` is green, `bun run test:determinism` passes, the
tether follows the finger that grabbed it, a long pull does what the owner's
answer said it does, and `docs/spec/bosses.md` §11.4 describes the fight that
now exists rather than the one that used to.

Model `opus`, effort `ultrathink`, spent on the fight rather than on the input
— the input is inherited. Read `packages/sim/src/warden.ts` whole and
`docs/spec/bosses.md` §11.4 before deciding anything.

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

## THE TEACHING DOCUMENT DESCRIBES A GAME THAT WAS NEVER BUILT
_claude/burn-teaching-reconcile · docs/teaching.md docs/INDEX.md_
**Asked for by the owner.** Asked whether to retire it or reconcile it, and
they chose:

> yes reconcile teaching.md
>
> In the future, i plan to create nicer guide introduction in waves with nice
> animations and less text.

**So this is not a rename and it is not a deletion.** `docs/teaching.md`
specifies THE CALL — designed 27 August 2026, scored by three judges, dealt
subject cards, a `taught` memory, an ordering — and none of it was built. What
shipped is the introduction and the guide: a wave opens on its number, name and
sentence, then carries its own help inline, and there are no subjects, no
dealing order and no memory. The document still describes the other thing, in
the present tense, beside code that contradicts every noun in it.

### The three things the rewrite has to keep apart

**What the game does.** Written as what it is, in the vocabulary that shipped —
introduction, guide, the two halves, both seats acking. `docs/spec/briefings.md`
is the spec and already says this; teaching.md must not become a second,
drifting copy of it. Cross-reference rather than restate, and say which file
owns which question.

**What was designed and not built.** THE CALL's reasoning is worth keeping —
three shapes scored by three judges is work nobody should redo — but it must be
unmistakably marked as a design that was not taken, with one honest sentence
about *why* the game went the other way. The next session reading this file has
to be unable to mistake it for a description of the game.

**Where the owner is going.** Quoted above and it is the load-bearing part: the
guide becomes animation and short text rather than paragraphs. Write that down
as the direction, because it is already why `Wave.guide` is an object with
named parts rather than three strings — an animation arrives as a key beside
the words and no wave file has to move. Say that connection explicitly; it is
the difference between a doc that dates and one that tells the next session
where the room was left for them.

**And the words that shipped are a placeholder.** Today's guides are prose
because prose is what the cards were. Under the owner's direction they are the
first draft of something shorter with a picture beside it, and the document
should say so rather than presenting the current wording as settled.

### Two things this lane may not do

**It may not rename the vocabulary and call it done.** That was the original
queue entry and it was wrong: renaming THE CALL's nouns to the shipped ones
would turn a design document into a false description of a shipped feature,
which is worse than either honest option.

**It may not change any wave's guide text.** Shortening the words is the
owner's own step-by-step work, said in as many words, and a lane that improves
the prose on the way past has spent a decision that was not its to spend.

`docs/INDEX.md` is included so the row describing this file can say what it now
is. Nothing else in the repository changes.

Finished when `bun run check` is green, `docs/teaching.md` cannot be mistaken
for a description of the shipped game, the design that was not taken is
preserved and marked as such, and the owner's direction is written down where
the next session will read it.

**No `Check:` trailer.** This is a document, and there is no half of it a
player could go and look at. Do not invent one.

Model `sonnet`, effort `think`. Read `docs/spec/briefings.md` and
`packages/content/src/wave-types.ts`'s `guide` doc comment before rewriting
anything, so the two files agree and neither restates the other.

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
