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

## A CANDIDATE THAT CHANGES THE SAME THING FOR BOTH SEATS GETS ONE SCREEN, NOT TWO
_claude/burn-seat-band-blind · tools/director/src/versus-seat.ts tools/director/src/versus-page.ts tools/director/test_
**Asked for by the owner**, sharpening an ask they made earlier and which was
built more literally than they meant:

> so there was a task, that in the "alternatives" page, i dont want to see both
> player screens, if the related change is the same for both players, only one
> screen is enough.
>
> this means, if only controls panel is different (because they are different
> for player 1 and player 2), but the alternative visual is the color of ship,
> then i only want to see current and new - two screens. not 4.

**The rule stated plainly: the control panel is never a reason for a second
screen.** It differs between the seats on every wave the game has ever drawn,
has nothing to do with any candidate, and the owner does not want to be shown
four screens because of it. A pair is two screens — current and new — unless the
*candidate itself* draws something different for the two seats.

### What is there now, and why it very nearly works

`versus-seat.ts` already refuses the naive answer, and its reasoning is right:
it does not compare p1's whole frame to p2's, because the band always differs.
It compares **the difference the patch makes** — current minus candidate — at
p1 and again at p2, and asks whether those two difference-pictures match. Four
of five candidates come back seat-identical on that test, which is the owner's
rule working.

**One does not, and the file already explains why in its own header.**
`cannon:shot`'s `streak` grows a translucent tail long enough to reach the strip
where the band begins. Alpha compositing is not linear in what sits behind it,
so the same tail prints a slightly different difference over p1's band content
than over p2's — even though the patch never reads which seat it is drawing
for. The header calls that *a real second screen, not a false one*.

**By the measurement it is real. By the owner's rule it is false.** They are
looking at a shot's tail, they can see it is the same tail on both sides, and
the only thing that differs is a strip of panel they were never comparing. The
measurement is answering *do these two difference-pictures match* when the
question is *is the candidate's own change the same for both seats*. Those come
apart exactly where a translucent thing overlaps the band.

### What to build

**Make the test blind to the band.** The comparison should look at what the
candidate changes on **the field**, and treat the control panel as not part of
the comparison. Whether that is a mask, a crop, or a difference computed against
a fixed background rather than a live one is the lane's choice — say which and
why in the commit, and say what it costs.

**But do not make it blind to a candidate that is genuinely about the panel.**
A candidate that changes how a control lobe is drawn is a real seat difference
and must still get two screens. So the test cannot simply ignore that region: it
has to distinguish *the candidate drew something different there* from *the band
underneath was different there anyway*. Name in the commit how it tells those
apart, because that is the whole correctness of this lane.

**Keep the honesty of what is there.** The existing file refuses to assume its
answer and says so at length; do not replace a careful measurement with a
hardcoded list of which candidates need two screens. If the honest answer turns
out to need something this lane cannot reach, **stop and report** rather than
special-casing `streak` by name.

Finished when `bun run check` is green, a candidate whose change is the same for
both seats shows two screens rather than four, `streak` is one of them, and a
candidate that genuinely draws differently per seat still shows both.

`Check: on the alternatives page, does a change that looks the same to both players now show just two screens — and does one that really differs per player still show four?`

Model `sonnet`, effort `think hard`, spent on telling a real per-seat difference
from the band showing through. Read `tools/director/src/versus-seat.ts` whole,
including its header, before changing anything — it argues the current answer
carefully and you are overturning one line of that argument, not all of it.

## A CANDIDATE YOU CAN ONLY SEE AT THE MOMENT OF IMPACT MUST BE SHOWN HITTING, AGAIN AND AGAIN
_claude/burn-versus-cadence · tools/director/src/versus-pose.ts tools/director/src/versus-pair.ts tools/versus/pose-kit.ts tools/director/src/poses-mechanics.ts tools/director/test_
**Asked for by the owner:**

> on the "alternatives", its hard for me to see the difference, because some
> diffs only happen in the moment the meteorite hits the shield to reflect. so
> the meteorite must repeatingly hit the shield with around 2 seconds pause
> between.

**This is the third time the same defect has been found on this page**, and it
is worth saying so in the commit, because the pattern is the finding. First the
page showed every slot in one fixed pose, so a shot candidate sat beside a
shipped shot with **no shot ever fired** — measured at zero fire events across
420 frames. Then a shot candidate turned out to be shown in a pose whose world
ran with the wind-up switched off, so the laying could not happen either. Now
the ward: **a candidate whose whole difference is one instant of impact, shown
in a world where the impact is not recurring.**

Every time, the shape is the same: **the page draws a world, and a candidate
lives in an event.** A still world compares two pictures of nothing happening.

### What to build

**The impact recurs, with about two seconds of quiet between.** The owner named
the cadence and it is a good one — long enough that the eye returns to the
unchanged field and takes a fresh look, short enough to watch several without
waiting. Do not make it faster because more repetitions seem better: **the pause
is what makes the repetition legible**, because a difference is only visible
against a baseline the eye has just re-read.

**Make the cadence a property of the pose, not of the candidate.** Three
candidates have now been invisible for three different reasons, and each was
fixed where it was found. A pose already carries its own config override and
its own choice per slot; a *rhythm* belongs beside those. Then the next
event-shaped candidate — a hull crack, a plate coming off, a guard lapsing —
inherits it rather than being discovered broken by the owner.

**Do it for every event-shaped slot, not only the ward.** Go through the
candidates as they stand and say, in the commit, which are event-shaped and
which are continuous. A hull skin is continuous — it is always on screen and
needs no rhythm. A ward, a shot, a deflection are events. The list is short and
writing it down is what stops the fourth instance of this.

### How to know it worked, and it is measurable

Do not judge this by looking. **Count.** An earlier lane on this page proved its
fix by measuring frames-with-a-shot and departures-seen over a fixed window —
zero before, 113 and 6 after. Do the same here: over a fixed number of frames,
how many impacts occur, and how far apart. **Put those numbers in the commit.**
If the cadence drifts because the world's own timing does not divide evenly by
two seconds, say so and say what you did — near enough is fine, silently
irregular is not.

**And watch the cost.** The ALTERNATIVES page is a flat contact sheet with every
candidate animating at once, and nothing throttles past ten. A world that must
keep producing impacts is a world that cannot be paused between them. If the
page stutters, say so rather than shipping it — a stuttering comparison is a
false one, which is the same trap in a new place.

Finished when `bun run check` is green, every event-shaped candidate on the page
shows its event repeating with roughly two seconds between, the cadence lives in
the pose rather than in each candidate, and the commit carries the counts.

`Check: on the alternatives page, does the rock hit the shield over and over with a pause between — long enough that you can see what the two sides do differently?`

Model `sonnet`, effort `think hard`, spent on where the rhythm lives rather than
on the loop itself. Read `tools/director/src/versus-pose.ts` and
`versus-pair.ts`'s `advance` whole first — a lane rebuilt both recently and left
the per-slot pose mechanism you should extend rather than replace.

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

Finished when `bun run build` produces the director beside the game, the
shipped director opens on a phone and can be read and operated, nothing that
cannot work is offered, and the page says once that it shows what was built
rather than what is on disk.

`Check: open the shipped build's director on your phone — can you read a wave and move around it, and is it clear which things you cannot change from there`

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
