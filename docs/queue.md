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

## A BRUSH SAYS WHICH WAVE FIRST INTRODUCES WHAT IT PAINTS
_claude/burn-brush-first-wave · tools/director/src/brushes.ts tools/director/index.html tools/director/test_
**Asked for by the owner**, twice — first as a problem and then as its own
answer:

> i dont see a wave where i can test "Throb". create wave to easily find it for
> testing. same for "Shell"

> just give me a tooltip hover on the brushes, which tell me the number of wave
> its first introduced.

**Their second message replaces the first, and it is a smaller and better
answer.** The waves already exist — THE THROB is on wave 21, `ON THE BEAT`, and
THE SHELL on wave 22, `THE THIRD SHOT`. Nothing needs creating, and an earlier
draft of this entry proposed a whole link from the bestiary to the wave list.
The owner wants a number on hover. **Build that, and nothing more.**

### What to build

**Hovering a brush names the wave that first introduces the thing it paints** —
a number, and the wave's name is worth having beside it since a number alone is
hard to hold. The brush palette is the right place because it is where somebody
already is when they are thinking about a creature.

**Derive it, never keep a list.** `WAVES` already says which waves contain what,
and the first wave carrying a kind is a computation the repository performs
elsewhere — `packages/content/test/waves.test.ts` asserts against exactly that
derivation. **Call it rather than writing a second copy**; two copies of *which
wave introduces this* is the class of mistake `packages/sim/test/purity.test.ts`
keeps a table about, and if you find yourself writing it a second time, add the
row.

**A kind no wave carries must say so.** Some brushes paint things no wave
contains today — that is a real state and it has been written down as a gap
before. *No wave carries this yet* is exactly what somebody hovering needs to
know, and it is the answer that would otherwise look like a broken tooltip.

### What not to do

**Not a link, not a jump, not a panel.** An earlier draft of this entry had all
three. The owner asked for a tooltip; a tooltip is the whole feature.

**And do not put it anywhere else on the way past.** A lane removed a tooltip
from the wave list earlier today because the owner said it did not belong there.
The brush is where they asked for one.

Finished when `bun run check` is green, hovering any brush names the first wave
that introduces what it paints, and a brush no wave carries says so.

`Check: hover the brush for THE THROB — does it tell you which wave first has one, without you opening anything?`

Model `sonnet`, effort `think`. Small. Read `tools/director/src/brushes.ts` and
the first-wave derivation in `packages/content` before writing, so the number
comes from the same computation the tests use.

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

### On a phone it is one view at a time, and a toggle between three

The owner, extending this entry after it was written:

> What i need is a toggle to switch from one view to another depending on what
> i want to do, I suggest those are the actions and views to switch on mobile:
>
> 1. select and edit wave
> 2. play the game with buttons below
> 3. map editor with brushes

**This replaces "make the layout fit" with something much more definite, and it
is a better answer.** The director is three columns beside each other, and a
phone cannot hold three columns — but it does not need to, because those three
columns are three *activities*, and nobody does two of them at the same instant.
Choosing a wave, playing it, and painting it are separate minutes.

**So on a phone the director shows one of three views, and a toggle moves
between them:**

1. **The wave** — the list and the wave's own fields. Choosing and editing.
2. **The game** — the stage with its controls below it. Playing what you chose.
3. **The map** — the grid and the brushes. Painting entries into beats.

**The toggle must be reachable from all three**, and it must not scroll away.
The one way this fails is a mode you can enter and not leave, and on a phone
that is a reload.

**Say what happens on a wide screen, and prefer nothing.** This is a phone
arrangement; a desktop already shows all three columns at once and that is
better than any toggle. If the same mechanism happens to be useful at a middle
width, say so, but do not take the three columns away from a machine that has
room for them.

**A view should survive a reload**, the way a collapsed panel already does —
somebody testing on a phone reloads constantly, and being thrown back to the
wave list every time is its own small tax.

**And a view must be addressable without a mouse.** The panel work landed
`?closed=…` for exactly this reason: a session driving the page headlessly
wants to screenshot a particular view, and cannot press a toggle. Give the mode
the same treatment and say so in the commit — the two parameters should read as
one idea, not as two conventions.

**What this does not change:** the read-only boundary above still holds. Saving
a wave cannot work in a shipped build whatever view it is in, and the view
toggle must not make an unavailable control look available. A phone showing
*the wave* view with a dead save button is exactly the failure this entry
already forbids.

**And it sits with the panel work rather than beside it.** `panels.ts` collapses
sections within a view; this chooses between views. Two mechanisms, one page —
say in the commit how they compose, because a collapsed panel inside a hidden
view is a state somebody will hit.

### The owner has answered the question this entry used to hold open

Asked whether shipping the director would publish the queue, the parked ideas,
the checks and the specification, they said yes and said why:

> yes director for mobile support to ship, so I can use it in testing phase
> until anyone else sees it. later we will switch this back, so keep the deploy
> mechanism for game only, but unused for now

**So it ships, and it ships knowingly.** No authentication, no redaction, no
hiding of tabs — they want the whole tool on a phone while they are the only
person looking at it.

**And the second sentence is a constraint, not a caveat.** *Keep the deploy
mechanism for game only, but unused for now.* The game-only build is not
replaced and not deleted: it stays, working, and something chooses between the
two. When somebody else eventually sees this, switching back must be one
deliberate flip rather than an afternoon of undoing.

So say in the commit **what the switch is and how it is thrown** — an argument,
an environment variable, a script beside the existing one. Whatever it is, it
must be discoverable by somebody who has forgotten this conversation, which
means it is named in  or in the director's 
rather than living only in a lane's memory. And the game-only path must still
be exercised, not merely present: a path nobody runs is a path that has rotted
by the time it is needed.

Finished when `bun run build` produces the director beside the game, a phone
shows one of the three views with a toggle that is always reachable, the
shipped director opens on a phone and can be read and operated, nothing that
cannot work is offered, and the page says once that it shows what was built
rather than what is on disk.

`Check: on your phone, can you switch between choosing a wave, playing it, and painting it — and is it clear which things you cannot change from there?`

Model `sonnet`, effort `think hard`, spent on the read-only boundary before any
layout: which pages survive, and what happens to the controls that do not. Read
`tools/director/server.ts` whole and `apps/game/package.json` first.

## THE WAVE EDITOR EXPLAINS ITSELF AT LENGTH, AND THE FIELDS ARE TOO SMALL TO WRITE IN
_claude/burn-wave-editor-tidy · tools/director/index.html tools/director/src/guide-fields.ts tools/director/src/wave-opening.ts tools/director/src/boss.ts tools/director/src/rail.ts tools/director/src/ship.ts tools/director/test_
**Asked for by the owner**, as one list. Every item is theirs; nothing here was
inferred.

### One functional change

**A text area grows to fit what is in it.** The owner:

> in the wave editor, i want that text size in textarea grows to the length of
> lines of text that it fits. so i want not to scroll text to edit or expand the
> textarea section.

No scrolling inside a field and no dragging a corner to see the rest. A guide's
three parts are paragraphs, and a field that shows two lines of a five-line
paragraph makes editing them a chore. There are four text areas in
`index.html`; the behaviour should belong to all of them by being general
rather than applied one at a time.

### The rest is words, and there is one principle under all of it

**The editor explains itself in prose that was written when these concepts were
new, and is now clutter to somebody who uses the tool every day.** A label
should name the thing. The reasoning belongs in the spec and in the director's
own `README.md`, where it already is. Cutting it is not losing it.

**Labels, renamed exactly as given** (`guide-fields.ts` and `index.html`):

- `BOTH SCREENS — what the thing is, never the whole instruction` → **`Player 1 & Player 2`**
- `PLAYER ONE — the cannon, the shield's trigger, the maw` → **`Player 1`**
- `PLAYER TWO — the shield itself, and the two colours` → **`Player 2`**
- `CONTROL SET — this wave is not the ordinary thing` → **`Control Set`**

The owner first wrote `PLAYER 1` in capitals and has since said that was a
slip rather than a choice: *"PLAYER 1" inconsistency was not on purpose. fix.*
So all four read as title case, as above.

**Prose to remove outright:**

- The Guide blurb — *"What the pair is told after this wave's introduction and
  before it starts. Leave all three blank for a wave that introduces nothing
  new — padding a wave with a guide is the same failure as padding it with
  entries."*
- The boss line in `boss.ts` — *"This wave has no boss. A boss belongs to its
  wave and is not added or removed here — it is authored in
  `packages/content/src/waves.ts`."* **This was added today, at the
  orchestrator's request**, to explain a button that had just vanished. The
  owner has seen it and does not want it. Their tool, their call.
- The opening line in `wave-opening.ts` — *"Opens on \"WAVE n · …\" and its
  sentence, then on its guide — which waits for both seats."* Remove both
  branches of it, the guide one and the no-guide one, since they are the same
  sentence twice.

**`WHAT THIS WAVE ADDS TO THE SHIP` collapses when there is nothing to say.**
The owner: *if there is nothing special, just say "nothing special" and remove
the boring rest.* So on an ordinary wave that section is two words and no
list.

**The selected control set keeps its sentence.** They also quoted *"The field
as it is taught: slide, trigger, swallow, fire."*, which is `why` on the
default control set in `packages/content/src/control-sets.ts`. Asked whether it
should go, the owner said to **keep it**: *ok, keep text for selected control
set.* So it stays exactly as it is, and `control-sets.ts` is not touched.

### A button instead of empty fields

> if there is no guide data for a wave, a "add guide" button is shown, if
> clicked the fields appear related replacing the button.

So a wave that teaches nothing shows one button, not three empty boxes. The
button is also the answer to a question the removed blurb used to answer —
*what do I do if this wave introduces nothing* — which is why the blurb can go
without leaving a hole: the interface says it instead of explaining it.

Decide what pressing it does to the data and say so in the commit: whether it
writes an empty guide immediately or only shows the fields until something is
typed. **A wave must not end up carrying an empty guide it never wanted** —
`packages/content/test/waves.test.ts` asserts that a wave introducing nothing
does not have one, and that test must stay green.

Finished when `bun run check` is green, a text area grows to its content, the
four labels read as the owner wrote them, the four pieces of prose are gone, an
ordinary wave's ship section says nothing special, and a wave without a guide
offers a button rather than three empty fields.

`Check: open a wave with a long guide and one with none — does every field show all of its text without scrolling, and does the empty one offer a single button instead of blank boxes`

Model `sonnet`, effort `think`, spent on making the growing text area general
rather than on the words. Read `tools/director/index.html`'s four text areas and
`guide-fields.ts` before starting.

## THE LURE — A BODY THAT ONLY THE NAVIGATOR CAN SEE THROUGH
_claude/lure-disguise · packages/content/src/creatures.ts packages/content/src/mechanics-table.ts packages/content/src/silhouettes.ts packages/content/src/wave-types.ts packages/content/src/waves/act-3.ts packages/sim/src/bullet-hit.ts packages/sim/src/creature-rules.ts packages/render/src/lure-alarm.ts packages/render/src/lure-vanish.ts packages/render/src/field.ts packages/audio/src docs/spec/bestiary.md tools/director/src tools/shape-sheet/src_
**Asked for by the owner:**

> for player 1 it is shown as a slick or bulb, but player 2 will see its "the
> runt". it must be very alarming and very clear what to do. […] player 2
> needs some alerting visual shape. I suggest we take a slick or bulb shape
> and color, but there is a white circle around it and an exclamation mark
> above it, next right or left text shown, something like "Runt! Don't
> shoot!". in the radar, we can also visualize it somehow like an exclamation
> mark, maybe the name of it above (only player 2 sees it). when player 2 hits
> it, the ship will lose health. but worst is, that they will lose time, and
> player 1 wonders, why player 2 doesn't shoot.

and, settling the four questions the first draft of this entry asked:

> player 2 needs to say player 1: "do not move to this one position - i will
> anyway not shoot it". I also suggest a missing mechanic on this enemy: right
> 2 tiles before it would hit the ship, it vanishes (nice animation - surprise
> me), so it wont hit the ship. […] yes sound is always good. he can turn
> sound not so loud, just on top of other visual indicators we have already.
> yes remove runt, and the runt shape we move to "not build yet" shapes
> section.

Nothing in this entry is open. Every decision it names has been made.

### The name

**`runt` is retired and the kind is `lure`; the wave is `THE LURE`.** "Runt"
named a body that was small and helpless, and the whole point of it was that
you could see it was small. This creature is the opposite: it is a full-size
slick or bulb in every pixel player 1 owns, and its danger is that it looks
like exactly what you want. The old name would be describing something the
game no longer draws.

`lure` rather than `mimic` or `decoy` because the cost is not the disguise, it
is what the disguise *does*: it pulls the cannon into a column and holds it
there. That is the thing the pair pays for, so the noun names the trap rather
than the costume.

Wave sentence: **"The one where the shot you are waiting for must never
come."**

### The mechanic

**One creature, two pictures, and the simulation only ever holds one truth.**
The sim knows it is a `lure` from spawn — nothing about the disguise is
stored, rolled or resolved there, so both devices agree about everything that
matters and rule 3 is untouched. The disguise lives entirely in `render/`,
which already takes `field.seat` and already draws different panels for
different seats.

**What player 1 sees:** a slick or a bulb. Full size, full colour, the real
silhouette, the real own-motion, and the real radar absence — player 1's radar
carries `guard` kinds only, so there is nothing to hide there and the leak
cannot arrive by that door. Player 1 has *no* way to tell, right up to the
vanish. That is the mechanic and it has to be exact: any tell at all — a size,
a wobble frequency, a rim, a sound — and the wave is decoration.

**What player 2 sees:** the same body, plus an alarm laid over it —

- a **white ring** around the body, outside its own contour and clearly not
  part of it;
- an **exclamation mark** above it;
- a short label beside it, on whichever side keeps it on screen:
  **`LURE — DO NOT SHOOT`**.

**And on player 2's radar**, which already carries the `aim` kinds
(`radarOwner`, `showsRadar` — do not re-derive that from `controls`): the same
exclamation glyph in the creature's column, with the kind's name above it, so
player 2 knows *before* it arrives rather than at the moment the thumb is
already moving. This is the more important half of the two. A hit should
always be player 2's haste, never player 2's surprise.

**What the pair has to say.** Player 2 holds the trigger, so player 2 does not
need permission to hold fire — the sentence that has to cross the room is the
other one, and the owner wrote it: *"do not move to this one position, I will
anyway not shoot it."* Player 1 is looking at a body worth shooting and is
being asked to leave it. That is the whole coupling: the one who can see it
cannot act on it, and the one who is acting cannot see it.

**Shooting it costs the hull.** `scoreRuntPenalty` is replaced by a hull cost
— a new named field in `SimConfig`, never a literal. The score penalty goes:
two currencies for one mistake reads as bookkeeping, and the hull is the one
the pair actually feels.

**It never reaches the hull.** The lure steps down like anything else until it
is standing `lureVanishRows` above the hull — a named `SimConfig` field,
default 2, so the distance is authorable and never a literal. It **occupies**
that row for its beat, in plain sight of both players, and goes on the beat it
would step off it. The last row player 1 ever sees it in is two above the
hull, close enough that the eye is already there. It costs nothing, it damages
nothing, and the only way it can ever hurt the pair is if player 2 fires at
it.

Standing on the row rather than vanishing on the way into it is deliberate:
it buys one more beat of player 1 holding the wrong column, which is the
entire cost of this creature, and it is the beat in which player 1 is most
sure they are about to be proved right.

**So the vanish is also the reveal.** The disguise never drops and player 1 is
never shown the truth in the body itself — but they see the thing they were
waiting to shoot disappear on its own, two rows up, which nothing else in this
game does. That is the vindication: the partner was right, and it arrives as a
picture rather than as an argument. It is worth being deliberate about — a
pair who has seen it once knows that a body which is not being shot at will
resolve itself, and the mechanic survives that knowledge intact, because they
still cannot tell *which* body until the column-seconds are already spent.

**The animation.** The lane's own to design; the constraint is that it must
read as *gone on purpose*, not as *killed* and not as *dropped*. It must not
borrow the destroy burst — that would tell player 1 they somehow got it — and
it must not borrow the reject flash. It is the one moment in the wave both
screens show the same thing, so it is drawn once, identically, for both seats.
Send the owner the frame.

**The cost that actually hurts is not in the sim at all.** With the vanish,
the lure is entirely free to ignore, and that is correct — its only teeth are
player 1 holding a column for a shot that will never come while something real
falls somewhere else. That is emergent and cannot be coded, which puts the
whole weight of this mechanic on **wave authoring**. A `THE LURE` wave in
which nothing else is happening teaches the shape and costs nothing; the wave
has to put a real target in another column on a beat that makes the wasted
seconds bite. If the wave is written lazily, the entire mechanic is inert and
the lane will not be able to tell, because everything it can test will pass.

### The sound

**On player 2's device only, and quiet.** A chime both phones make would carry
the disguise straight through the speaker in a room where two people are
sitting next to each other — which is the one door the rest of this design
closes carefully. It is an addition to the visual indicators, not a
replacement for them, and it is mixed low: the alarm is already on the radar
and on the body.

It obeys `docs/spec/audio.md` like everything else — body below 300 Hz or
sparkle above 3 kHz, and `packages/audio/src/band.ts` measures it rather than
trusting the intention. A short high transient reads as alarm without ever
entering the band the voices need, and the voices are the control scheme.

### Which body it wears, and in what colour

**Authored, never rolled.** The wave entry says it: a new `wears` field on the
spawn entry, `"slick" | "bulb"`, and the entry's `color` stops being `null` —
it carries the disguise's colour, which is what player 1 is shown and what
player 2 would have fired if they had not looked. Random would be a second
place where the trap is decided, and the author cannot compose a wave against
a shape they do not know.

This touches `wave-types.ts`, whose comment currently names `runt` as one of
the two kinds that carry no colour on purpose. That comment is now wrong and
the rewrite must say why, not merely delete it.

### The wave

Replaces `THE RUNT` in `packages/content/src/waves/act-3.ts`.

    name: "THE LURE"
    sentence: "The one where the shot you are waiting for must never come."
    guide.both: "One of these is not what it looks like. Only one of you can tell."
    guide.p1:   "You will see a body worth shooting and nothing will happen. Believe your partner and move — the column you are standing in is the one you are losing."
    guide.p2:   "The ringed one is a lure. Do not fire at it, and do not wait to be asked — say the column it is in and say the column to go to instead."

Entries: a lure wearing a bulb in one column, and a real slick two or three
beats later in another, close enough that the seconds spent standing on the
lure are the seconds the slick needed. The exact beats are the author's; the
one-sentence test is what they must satisfy, and it is the part of this lane
that no test can check — the lure costs nothing if ignored, so a wave that
does not make the wasted column-seconds bite leaves the mechanic inert while
every check still passes.

### The runt's shape goes to NOT BUILT YET

Not deleted. `RUNT` in `packages/content/src/silhouettes.ts` — four shallow
lobes at `sizeMul: 0.55` — moves to the NOT BUILT YET shapes section, where it
sits as a shape nothing draws yet rather than as dead content, and stays
available if a genuinely small creature is ever wanted. Its entries in
`tools/shape-sheet/src/catalogue.ts`, `subjects.ts` and `nameability.ts` move
with it; a shape in the catalogue that no kind maps to is exactly the kind of
drift `silhouettes.ts` warns about.

**And a question in `docs/alive.md` dissolves on the way past.** That file
carries an open owner decision: the runt draws at about 10.3 px, below
`docs/spec/graphics.md`'s own line that at 11 px nothing of a figure survives,
and every proposal for runt interior work died on it. A lure has no small form
— it is a slick or a bulb at full size on both screens, and the alarm is drawn
over it rather than in it. The question stops existing rather than being
answered. Say so in the commit, and strike it from `docs/alive.md` in the same
pass so nobody spends a session on it later.

### Rules this lands under

**A look is offered, never replaced** does not hold this back, on two of its
three named exemptions at once: the owner asked for this drawing by name, and
nothing shipped is being replaced — no marking like it exists today. It lands
on the field rather than on a NOT BUILT YET card. The one part that *is* a
replacement is the runt's body disappearing from player 1's screen, and that
is the mechanic rather than a preference, which the commit should state in
that word.

**Check the alarm against `torch-alarm.ts` before drawing it.** There is
already an alarm marking in this game. Two alarms that look alike are worse
than one alarm that is ugly, and this is the check the lane owes: a white ring
and an exclamation must not read as the thing player 2 has already learned
means something else.

### Everything that moves in the same pass

- `creatures.ts` — the kind, its `controls: ["aim"]` (unchanged, and for the
  same reason: not firing has to be a restraint, which needs the trigger to
  exist), its `radar: "p2"`, its blurb.
- `mechanics-table.ts` — the row. `as const satisfies` will fail the typecheck
  until it is there, which is the point of it.
- `bullet-hit.ts` — `resolveRunt` becomes `resolveLure`; the score line becomes
  a hull line; the header comment explaining *why reaching the hull is not
  special-cased* now explains the opposite and is rewritten, not edited.
- `creature-rules.ts` / the step that walks a creature down a row — the vanish,
  and a `lureVanished` event for render and audio to hang off.
- `config.ts` (owned by nobody — one contiguous region) — the hull cost and
  `lureVanishRows`.
- `packages/sim/test/runt.test.ts` → `lure.test.ts`: shooting it costs the hull
  and removes it; the hull cost floors at zero; **it occupies the row
  `lureVanishRows` above the hull for exactly one beat and is gone on the next,
  with the hull untouched**; and the replay fingerprint.
- `packages/render/test/frame.test.ts` — the alarm and the vanish are drawn, so
  they are drawn there too, both seats, plus a lure at the field edge so the
  label's side-flip is exercised.
- `packages/render/test/restart.test.ts` — only if the vanish caches anything
  across frames. It should not; if it must, it belongs in `Effects` and is
  cleared in `Effects.reset()`.
- `packages/audio` — the cue and its speech-band assertion.
- `waves-demo.ts`, `docs/spec/bestiary.md`, `docs/alive.md`, and the director's
  brushes — a new authorable kind needs its brush in the same pass, not the
  next one.

### The check this lane owes

Two seats, at tempo, on two phones:

> on player 1's screen, is the lure genuinely indistinguishable from a real
> slick or bulb right up to the moment it goes — and on player 2's, does the
> ring and the exclamation read as *stop* within the half-second before a
> thumb moves, without being confused for the torch alarm?

and a second, because it is a different question and a still cannot answer it
either:

> does the vanish read as *gone on purpose* — and does player 1, who has just
> been told to leave a column and did not want to, feel proved right by it?

Neither half of the first can be answered from one screen at all.

### One orchestrator note

**Two things named in this spec have moved since it was written.** Shadows were
removed from the game entirely — `cast-shadow.ts` and `contact-shadow.ts` are
gone along with two `SimConfig` fields — and the director's pages were
rearranged: `STATES` is now a tab of a sheet called `GAME MECHANICS`, and the
`CONTROL SETS` page is now `CONTROLS` with its own inner tabs. Read the tree as
it is.

