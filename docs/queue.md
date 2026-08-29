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

## CANNON WIND-UP LEAVES THE TUNING SLIDERS AND BECOMES AN ALTERNATIVE
_claude/burn-windup-alternative · tools/versus/candidates tools/director/src/ship-fields.ts tools/director/src/ship.ts packages/content/src/mechanics-table.ts docs/versus.md_
**Asked for by the owner:**

> wave - "tuning" - "Cannon wind-up" should be moved to "not build yet" -
> "alternatives". once decided it will always be the new animation of shooting
> with its delay.

**Read the second sentence as the decision it is.** Wind-up stops being a dial
somebody might set per run and becomes a *proposal*: either the game's shots
work this way from now on, or they do not. That is exactly what the
alternatives page is for — the owner looks at both and picks — and it is why a
slider was the wrong home. A slider says *choose a value for today*; this is
one question with one answer.

### What wind-up is, and why it is not like the other candidates

`shotChargeBeats` (`packages/sim/src/config-shot.ts`, default `0`, off). With
it set, a press does not fire: the shot leaves on the next point of a grid
measured in beats, and player 1 can watch it happen. It is exposed as a run
tuning slider in the director's TUNING section and as the `windup` mechanic in
`mechanics-table.ts`.

**And here is the difficulty this whole entry turns on.** Every candidate in
`tools/versus/candidates` today — `pip`, `streak`, `heave`, `tick`, `warm` — is
a **patch to a record the draw path reads**. Wind-up is not. It changes *when
the shot leaves*, which is simulation: it is in the hash, two devices must
agree on it, and it changes the game's timing rather than its picture. So it
cannot be dropped into the candidates folder beside the others and be shown by
the same machinery.

**That is the lane's real question, and it must not be answered by force.**
Roughly two shapes, and there may be a third:

- **The versus page learns to carry a candidate that is a config value**, drawn
  as two live worlds run with different configs rather than two draw records.
  Honest, and more work than it sounds — two worlds mean two simulations at
  tempo, side by side, both firing.
- **Wind-up is shown some other way** and the alternatives page only carries
  looks. Then the entry is about where an owner decides a *rule*, which the
  repository may not have a home for yet.

**Read `docs/versus.md` before choosing, and if neither shape fits, stop and
report rather than bending the candidates folder around a thing it was not
built for.** A candidates mechanism that quietly handles two unrelated kinds of
thing is worse than a second mechanism honestly named.

### It is already on in the real game, which the ask does not know

`apps/game/src/main.ts:44` builds its config with `shotChargeBeats: 0.5`. So
**every player of the actual game already shoots with the wind-up**, and has
been. It is off in `DEFAULT_CONFIG` for a stated and good reason — every
headless replay keeps its timing to the tick — and on in the app for a stated
and good reason, which the comment above that line gives: *a shot that is laid
over half a beat is a press player 1 can see, where a press that was instantly
a bullet reached him only as a result.*

**This changes what the entry is asking for and the lane must not paper over
it.** The owner wrote *once decided it will always be the new animation of
shooting with its delay*, which reads as though wind-up is a thing not yet
switched on. It is switched on. So the honest options are different from the
ones above:

- **Tell the owner and stop.** They may simply not have known, in which case
  the ask may dissolve — there is nothing to decide, only a slider to remove
  from a place it does not belong.
- **Or the alternative is the other direction**: the page offers the shot
  *without* the wind-up beside the shipped one *with* it, which is a real
  comparison and the reverse of what the entry assumed.

**Whichever, the tuning slider still leaves the wave panel**, because the owner
is right that it is not a per-run dial. That half of the ask holds either way.

Found by the lane building the cannon candidate, which needed to know how long
the shot's window actually is.

### Its neighbour, which is not a coincidence

`claude/burn-cannon-egg` puts the hen-and-egg shot animation in the same
candidates folder, and that entry forbids the candidate from slowing the shot
— because the shot's timing is a balance decision the owner had not made.
**This entry may be that decision arriving.** If wind-up is adopted, a shot
that leaves on the next grid point is a shot with a sanctioned delay in front
of it, which is exactly the room an egg being pressed out needs.

Do not merge the two lanes and do not make either depend on the other. But say
in the commit whether the two candidates can be looked at together, because the
owner will want to judge the egg *with* the delay if the delay is going to
exist.

### What must not change

**No default moves.** `shotChargeBeats` stays `0` until the owner decides by
looking; this lane offers the alternative, it does not adopt it. The game as
shipped fires exactly as it does today.

**The mechanic entry stays honest.** `windup` in `mechanics-table.ts` describes
a run mechanic with a switch; if it is no longer a run tuning, that entry says
what it now is rather than being left describing a slider that has gone.

Finished when `bun run check` is green, the TUNING sliders no longer offer
cannon wind-up, the alternatives page offers it as a thing to decide, the
shipped default is untouched, and the commit says how a rule-shaped candidate is
shown differently from a look-shaped one.

`Check: on the alternatives page, can you see a shot with the wind-up beside a shot without it, both firing, and tell which one you want the game to have`

Model `sonnet`, effort `think hard`, spent on where a rule-shaped alternative
lives rather than on the drawing. Read `docs/versus.md`,
`tools/versus/candidates/index.ts` and `packages/sim/src/shot-charge.ts` whole
before deciding anything.

## THE THINGS YOU TOUCH ON THE FIELD ARE A KIND OF CONTROL, AND NOTHING NAMES THEM
_claude/burn-controls-page · tools/director/src/controlsets-page.ts tools/director/src/backlog-page.ts tools/director/index.html docs/spec/controls.md tools/director/test_
**Asked for by the owner**, in the same message that settled THE WARDEN's pull:

> behalte die aktuelle alte Mechanik nur halten in "not done yet" irgendwo
> fest. vielleicht ein neuer Tab in control panels (wir benennen in in
> "controls" um. dann können wir auch alternative in screen controls hier
> dokumentieren und ggf testen.
>
> wichtig, dass alle in screen controllen (nicht control panels unten im
> screen) auch in der game mechanics Seite dokumentiert werden

Translated: *keep the current old mechanic — hold only — recorded somewhere in
"not done yet". Perhaps a new tab in control panels, which we rename to
"controls". Then we can document alternative in-screen controls there too, and
test them if need be. Important: every in-screen control (not the control
panels at the bottom of the screen) must also be documented on the game
mechanics page.*

### The distinction the owner is drawing, because it is the whole entry

**There are two kinds of control and the repository only has a word for one.**

- **Panel controls** — the buttons in the strip below the field. SHIELD, SUCK,
  the lance, the guard. These have a name (`CONTROL_SETS`), a page, a picker on
  the wave, and a test.
- **In-screen controls** — the things you touch *on the field itself*. THE
  WARDEN's PULL circle. THE MAZE's handle on its string. The grip on a falling
  creature. The guide's whole-screen press. The ready circles that
  `claude/burn-ready-circles` adds. **These are not written down anywhere as a
  category.** Each was built by whichever lane needed it, and the only way to
  find out what exists is to read `packages/render/src/touch.ts`.

That is why the owner had to ask what PULL does, and why *"it says pull, but
when i click with mouse and move mouse, nothing happens"* took two lanes to
answer. The category is real, it is growing fast — three of them arrived this
week — and it has no home.

### What to build

**Rename the CONTROL SETS page to CONTROLS**, and let it hold both kinds. The
owner named the rename and the reason: one page about how the pair touches the
game, rather than one page about half of it.

**Add the in-screen controls to it, each named and described**: where it
appears, which seat may use it, what the gesture is (press, hold, grab and
drag), and what it does. Derive what you can from the code rather than
retyping it — a hand-kept list beside a growing category is the failure mode
`docs/spec/briefings.md` has already been through twice.

**A tab for alternatives that were tried**, which is where THE WARDEN's
hold-only tear goes when the pull replaces it. The owner asked for it to be
kept rather than deleted, and *"ggf testen"* — possibly tested — means this is
adjacent to the alternatives page, not a graveyard. Do not build a testing
mechanism here; note in the report whether the versus machinery could serve it.

**And every in-screen control appears on the GAME MECHANICS page too.** That is
the owner's *wichtig*, and it is a different audience: the CONTROLS page is
where you go to ask about controls, GAME MECHANICS is where somebody reads what
the game is and should not have to know to ask. **One source, two readers** —
if the same list is typed twice it will disagree with itself within a month.

### The one that will be got wrong

**`packages/render/src/touch.ts` is the truth about what exists**, and it is
the file every recent lane has touched. The list must come from there or from
something derived from it — never from a lane's memory of what it built. If
`touch.ts` cannot be read as data, say so in the report rather than
hand-writing the list and calling it done; a documentation page that quietly
drifts from the code is worse than no page, because it is believed.

### Sequencing

**After `claude/burn-topbar-fold`**, which renames STATES to GAME MECHANICS and
folds CONTROL SETS into it. This entry then renames and fills what that one
moved. Expect to replay over it, and read the page as it is rather than as this
entry describes it.

**`claude/burn-tether-pull` writes one paragraph into this page** — the
hold-only mechanic it retires. If it lands first, the paragraph is already
somewhere in the backlog and this lane gives it its proper home.

Finished when `bun run check` is green, the page is called CONTROLS and covers
both kinds of control, every in-screen control the game has is named there and
on the GAME MECHANICS page from one source, and the retired hold-only tether is
recorded rather than lost.

`Check: on the controls page, can you find every thing you can touch on the field itself — what it looks like, whose it is, and whether you press it, hold it or drag it`

Model `sonnet`, effort `think hard`, spent on where the list comes from rather
than on the page. Read `packages/render/src/touch.ts` whole first —
if the in-screen controls cannot be derived from it, that is the finding and it
changes the shape of the whole entry.

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

## THE SHIELD THROWS SPARKS OUTWARD, SO YOU CAN SEE IT IS CHARGED
_claude/burn-shield-arcs · tools/versus/candidates/shield-charge packages/render/test_
**Asked for by the owner**, for the alternatives page:

> "not build yet": eine bessere animation vom schild, das nach außen weg (weg
> vom schiff) ein paar kleine miniblitze feuert, damit man die statische ladung
> und energie besser versteht und das schild mehr sichtbar macht. etwa wie bei
> einer starken entladung von einem strommast

*A better animation for the shield, firing a few small mini-lightning-bolts
outward — away from the ship — so that the static charge and energy are easier
to understand and the shield is more visible. Something like a strong discharge
from an electricity pylon.*

**A candidate, not a change.** It goes beside the shipped shield on the
ALTERNATIVES page and the owner decides by looking. Nothing in
`packages/render/src` moves. The page is now a flat contact sheet, so it will
sit there animating next to today's shield with no dropdown to operate — which
is exactly the comparison this needs.

### What is being asked for, precisely

**Two problems, one gesture.** The owner names both: the shield is *hard to
see*, and it does not read as *charged*. Small arcs answer both at once — a
thing that throws sparks is obviously present and obviously energised — which
is why this is one candidate and not two.

**Outward, away from the ship.** Said explicitly and it is the whole character
of it. A discharge that arcs inward reads as damage, as something leaking into
the hull; one that throws outward reads as a field pushing back. Same effect,
opposite meaning.

**The reference is a pylon**, which is worth taking literally: not a soft glow,
not a halo. A pylon discharge is sudden, thin, branched, gone — a few of them,
irregularly, rather than a steady crackle. *Ein paar kleine* — a few small
ones. A candidate that fires constantly has answered a different request and
will read as noise over a field the pair is trying to watch.

### Two things that will be got wrong

**Anything that outlives a frame belongs in `Effects` and is cleared in
`Effects.reset()`.** A spark with a lifetime is precisely that. `world.beat`,
`world.tick` and `world.nextId` all restart at zero on a fresh wave, so render
state cached against them is read by the next run as its own — that is how a
crack once showed before the rock that made it.
`packages/render/test/restart.test.ts` fails if a new field is added and not
cleared, and it is not optional bookkeeping.

**Do not quietly make it a readout.** The guard's arming window just got a
signal of its own — the button fades as the window closes — and a shield whose
arcs varied with that state would be a second signal for one state, invented by
a lane rather than asked for. **The arcs say the shield exists and is
charged, and nothing more.** If tying them to a real state seems better, that
is a separate proposal and it goes in the report, not in the candidate.

### Where it lives

`tools/versus/candidates/shield-ward` already holds `heave` and `tick`, which
are about the *moment of deflection*. This is about the shield's ongoing
presence, so it is probably its own slot — `shield-charge` — rather than a
third sibling of those two. The lane decides and says which in the commit, and
either way `tools/versus/test/distinct.test.ts` is the guard: a candidate that
does not visibly differ from its neighbours is not a candidate.

Finished when `bun run check` is green, the candidate stands on the
ALTERNATIVES page beside the shipped shield, it throws a few thin arcs outward
on its own, nothing in `packages/render/src` has moved, and nothing it draws
survives a wave restart.

`Check: beside today's shield, does the sparking one read as charged and hold its energy — or does it just look busy over a field you are trying to watch`

Model `sonnet`, effort `think`, spent on the rhythm rather than the shape: how
often an arc fires, and how briefly, is what decides between *a pylon* and
*static on a screen*. Read `docs/versus.md` and one existing candidate before
writing.

## THE DIRECTOR SHIPS WITH THE GAME, AND HAS TO WORK ON A PHONE
_claude/burn-director-ship · apps/game/package.json tools/director/build.ts tools/director/index.html tools/director/server.ts tools/director/src/main.ts tools/director/test package.json_
**Asked for by the owner:**

> wenn die production app/build ausgeführt wird, möchte ich auch dass die
> director app version ausgeliefert wird. sie soll auch auf mobile gut
> anschaubar und bedienbar sein.

*When the production app/build is run, I want the director app version to be
shipped too. It should also be good to look at and to operate on mobile.*

### The thing that decides this entry: half the director cannot ship

`bun run build` is `bun build ./index.html --outdir=dist` in `apps/game` — a
static bundle. The director is not that. `tools/director/server.ts` is a live
server with **POST routes that write to the working copy**: saving `waves.ts`,
deciding a check, running a check, sweeping worktrees. None of that can exist
in a shipped build, because there is no repository behind it.

**So a shipped director is a read-only director, and the entry is mostly about
saying which half that is.** Go through the pages and decide, for each, whether
it survives: the stage and the wave list, the shapes, the alternatives, the
backlog, GAME MECHANICS — these read data and should work. Saving, the check
ledger's decide-and-run, the worktree sweep — these cannot.

**A control that is present and does nothing is worse than one that is
absent.** Whatever cannot work must not be drawn, or must say plainly that it
is read-only. A save button that silently fails on a phone is the single worst
outcome available here, because the owner will believe a wave was saved.

**And its data comes from a different place.** In development the director
reads waves from its own server; shipped, it reads the compiled content the
same way the game does. That is simpler, not harder, but it means the shipped
director shows what was **built**, not what is on disk — say so on the page,
once, so nobody mistakes it for an editor.

### On a phone

**The director is desktop-shaped**, and this is the larger half of the work. It
assumes a wide window with several columns; the owner is asking for it to be
*good to look at and to operate* on a phone, which is not the same as fitting.

**`claude/burn-director-minimize` is the natural companion** and is already
queued — every panel collapsible, addressable without a mouse. A phone is the
case where collapsing stops being a convenience. Do not build that here; if it
has landed, use it, and if it has not, say in the report whether this lane
should have waited for it.

**Touch, not hover.** Anything that only reveals itself on hover is invisible
on a phone. The stage already accepts pointer events and the game itself is
portrait-first, so the field is the easy part; the panels are not.

### One thing to put to the owner rather than decide

**Shipping the director publishes what it shows.** It surfaces the queue, the
parked ideas, the outstanding checks, the specification and the backlog — the
project's own working material. That is very likely fine, since it is their
project and their build, but it is a door being opened and they should open it
knowingly rather than discover it. **Say it in the report, do not act on it,
and do not add authentication nobody asked for.**

Finished when `bun run build` produces the director beside the game, the
shipped director opens on a phone and can be read and operated, nothing that
cannot work is offered, and the page says once that it shows what was built
rather than what is on disk.

`Check: open the shipped build's director on your phone — can you read a wave and move around it, and is it clear which things you cannot change from there`

Model `sonnet`, effort `think hard`, spent on the read-only boundary before any
layout: which pages survive, and what happens to the controls that do not. Read
`tools/director/server.ts` whole and `apps/game/package.json` first.
