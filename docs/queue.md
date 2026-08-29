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
