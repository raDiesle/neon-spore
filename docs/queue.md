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

## A FOURTH AXIS ON SHAPES: GLOW
_claude/shapes-glow · tools/director/src/glows tools/director/src/shapes-controls.ts tools/director/src/shapes-pair.ts tools/director/src/shapes-all.ts tools/director/src/shape-figure.ts tools/director/index.html tools/director/test docs/glow.md_
**Asked for by the owner.** *"i would like to add a new category to the shapes
page to create and compose variants […] so i want then to see for same shape
all the lighting and post-effects on overview page and in advanced to compose
them"* — followed by their own list of effects, which is the brief and is
reproduced in the table below rather than paraphrased.

SHAPES has three axes today: SKINS (what is drawn *on* the body), MOTIONS (how
it moves) and LIGHT (a key light, on or off). This adds a fourth: **what the
body throws off into the space around it.**

### The name is settled and is not to be re-opened

**GLOW.** A plain noun in the register of hull, lobe, beat, guard, skin,
motion, light — and it pairs against the existing LIGHT axis exactly the way
`docs/tower-defence.md` already frames the two: LIGHT is a body lit from
outside, GLOW is a body lit by *being the thing that emits*. `VFX` was rejected
as the only acronym the page would carry. `EMISSION` and `AURA` were rejected
because each is also the name of one of the values below, and an axis may not
be named after one of its own members — which is also why the owner's *Outer
Glow* is called `HALO` here.

### It stacks; it is not a pick

Settled with the owner. GLOW is **checkboxes, not radio buttons** — BLOOM and
TRAIL and AURA all on at once, because that is how they combine in a real
engine and the combination is the thing the page is opened to judge. This is
the one structural difference from SKINS and it decides the file layout:
`currentSkin()` returns one id, `currentGlows()` returns a set.

### Where it lives

A new `tools/director/src/glows/`, built the way `skins/` is: one file per
value, an `index.ts` that is the **only** place that knows which exist, a
`GlowId` derived from the array and never typed, a `buildGlow` that looks up in
it. A new glow is one file and one line, and nothing else.

**Not** inside `skins/`. A skin is exclusive and a glow stacks; folding them
together would make `SkinId` mean two things and would let a reader pick BLOOM
*instead of* MEMBRANE, which is the one combination that makes no sense.

The four rules in `docs/skins.md` carry over word for word, and `docs/glow.md`
should point at them rather than restate them: nothing imports or edits
`packages/render`; seed only from `streamFor(ctx.name)`; key every `<defs>` id
on `ctx.uid`; allocate nothing inside `onFrame`. The last one bites harder here
than it ever did for a skin — a particle system written the obvious way
allocates per mote per frame, and there are thirty figures on the page.

Each glow declares `layer: "under" | "over"`, and the builder draws the unders
in registry order, then the skin, then the overs. A bloom sitting on top of its
own outline is the effect drawn wrong, and leaving the order to the order
somebody happened to tick the boxes in would make the page unreproducible.

### The one thing a glow may never do

**Change the contour.** A glow adds light around a shape and never moves a
point of it. That is what keeps GLOW orthogonal to SKINS and MOTIONS — the
whole premise of a compose page is that its axes are independent — and unlike
most such claims it is testable: sample the contour with every glow on and with
none, and assert the path data is identical. Write that test. The one value
that wants to break the rule is SQUASH, and it is on the *other* axis for
exactly this reason.

### The seven values

Four of these come out of the three Neon Pulsefire frames now read into
`docs/tower-defence.md`'s "Three more frames, and the one thing they all say".
Read that section first: it is short, it has the pictures, and three of its
notes are corrections to the implementation anybody would otherwise reach for.

| Value | What it is | Note |
|---|---|---|
| `BLOOM` | bright pixels bleed softly into what is around them — the standard engine term the owner named | `parts.ts` already has the shape of it in `PASSES`/`SPREAD`. Widen and reuse; a second copy drifts |
| `EMISSIVE` | the body is a light source rather than a lit thing: the fill tints toward the rim colour and *upward* | deliberately the opposite direction from `corePass`, whose outer stop falls to the card's dark on purpose. Those two on one page is the argument, and it is the best card on the axis |
| `HALO` | a soft luminous outline standing off the contour — the owner's *Outer Glow* | the `box-shadow`/`drop-shadow` idea in SVG: one blurred offset copy of the contour |
| `AURA` | a ring standing clear of the body, pulsing — the charged-Super circle the owner described | on `frame.beat` and never a private clock; `types.ts` already argues this at length |
| `SPARKS` | a particle system: motes on seeded paths leaving the body | seeded from `ctx.name`, so a reload draws the same card the screenshot was taken of |
| `TRAIL` | a luminous tail that lingers behind the body as it moves | **dots, not a ribbon** — the source draws separating dots that shrink, and the gaps are what read as speed. Rides `frame.pose`, so it draws nothing on a body with no own-motion. That is correct, and the caption has to say it |
| `SWARM` | one soft cloud under the whole figure rather than a halo per body | the source's twenty green squares are one cloud with twenty outlines punched into it. Cheapest thing on the axis *and*, in the source, the strongest — build it before the per-body ones, not after |

### What each view gets

OVERVIEW gets a **fourth grid**, from the same `grid()` in `shapes-all.ts` that
already draws the other three, called a fourth time: one body, one card per
glow value, each value drawn **alone** over whatever skin, motion and light the
bar currently says. That is the "see all the lighting and post-effects for the
same shape" half of the ask, literally.

COMPOSE gets a fourth `group()` in `shapes-controls.ts` — a heading, a line
saying what the axis picks and that it is independent of the other three, then
the checkboxes. That line has to spell the stack out in words, because a set of
ticks is harder to read back than one highlighted button; and it says NONE when
the stack is empty. NONE is a real choice, and it is the control every other
value on the axis has to beat.

### The thing most likely to go wrong

**The fit.** A glow makes a figure larger than its contour, and
`shape-figure.ts` fits each frame to the contour over the wobble and the
motion. Turn on HALO or SPARKS and every card clips at its edge — which reads
as the effect being broken rather than the frame being small, the same failure
`shapes-page-app.ts`'s header describes for own-motion. The fit has to include
the widest enabled glow's reach, and the cached fit has to be keyed on the glow
stack, or switching the stack shows the previous one's frame.

### Scope

Nothing here touches `packages/render`. This is the tool learning to draw
something so the owner can decide by looking; the game learning to draw it is a
separate decision they take afterwards, and CLAUDE.md's *A look is offered,
never replaced* is why. Nothing on the field changes in this lane.

`Check: on SHAPES → OVERVIEW, does the GLOW grid show seven plainly different effects on one body — and with two or three ticked on COMPOSE, does the stack read as one look or as effects fighting each other?`

## A FIFTH AXIS ON SHAPES: HITS
_claude/shapes-hits · tools/director/src/hits tools/director/src/shapes-trigger.ts tools/director/test/hits.test.ts_
**Asked for by the owner.** *"i guess the hitting 'juice' animations should be
again another category on shapes page."* Yes — and the line between the two
axes is clean.

**Take the lane above first.** This one is written against the registry, the
stacking control and the extra grid that lane builds, and reuses all three.
Starting here means building that machinery twice and then reconciling it.

### Why it is a second axis and not seven more GLOW values

Everything on GLOW runs forever on its own and can be judged by looking.
Everything here needs a **moment** — there is nothing to see until something
happens to the body. That difference is not cosmetic, it is the control: GLOW
is a set of ticks, HITS needs a trigger. One axis carrying two kinds of control
is two axes wearing one heading.

### The trigger

One `HIT` button on the COMPOSE bar, and an auto-repeat every few beats, **on
by default**. Both matter, for different reasons: the button is how a reader
fires one deliberately while watching a single card, and the auto-repeat is how
an unattended screenshot ever catches one — a cloud session cannot click, and
an axis that is invisible in a still is one it can never report on.

It fires **page-wide on the shared beat clock**, so every card flinches
together. Same argument `types.ts` makes for `beat`: thirty bodies twitching on
thirty private clocks is noise, and a flinch is only legible because the page
does it at once.

### One event, three phases

A trigger runs a **telegraph ramp**, then an **impact**, then an **aftermath**,
and a HITS value draws whichever phase it belongs to. That is how the owner's
*Telegraphing* belongs here rather than on GLOW: a building glow is not a state
the body is in, it is the announcement of a hit that has not landed yet, and it
needs the same trigger the hit does.

`SkinFrame` gains one field for this — the hit in flight, its phase and how long
since it fired, `undefined` when there is none. **A field, not a changed
signature.** `types.ts`'s own header says in as many words that `SkinFrame` is
an object rather than positional arguments precisely so that a third thing can
arrive without touching what does not want it; nineteen skins and seven glows
should not be edited for this.

### The values

| Value | Phase | What it is |
|---|---|---|
| `TELEGRAPH` | before | a glow building over the beats before the hit, snapping off the instant it lands |
| `FLASH` | impact | one bright frame, then gone — the owner's *Juice* at its plainest |
| `SQUASH` | impact | the contour scaled non-uniformly for a few frames, then eased back |
| `SHAKE` | impact | the whole figure jittered on a seeded offset, decaying over half a beat |
| `RING` | after | an expanding circle leaving the body and fading out |
| `SHARDS` | after | a burst of short strokes thrown outward, seeded from `ctx.name` |
| `DIM` | impact | the body simply goes dark for one beat |

`SQUASH` is why the two axes are split at the mechanism rather than at the
mood: it **moves the outline**, which the lane above forbids a glow from doing.
Here that is the whole value — but it means the contour-identity test written
there has to exclude this axis deliberately rather than by accident, and
`docs/glow.md` should say which axis owns which half of the rule.

`DIM` is the control, the way LINE is the control for SKINS. It is the cheapest
possible way to say "that was hit", and every other value has to beat it by
looking better. If none of them does, the honest finding is that a hit does not
need juice — which is a real result, not a failed lane, and the report says it
in those words.

### Scope

Same as the lane above: the tool learns to draw these, the field does not
change, and adopting any of them into `packages/render` is a separate decision
the owner takes by looking at this page.

`Check: on SHAPES, does the HIT trigger read as one event happening to the body — and does any of the six actually beat DIM, or is a plain darkening enough?`

## COLLECT AND CONVERT A SECOND GAME'S BODIES
_claude/convert-second-game · tools/shape-sheet/src/forms tools/shape-sheet/src/drafts tools/shape-sheet/test docs/tower-defence.md_
**Asked for by the owner.** *"i expect you collect also boss screenshots and
enemy unit screenshots. then try some to convert that they look near to their,
but for our game."*

Nine bodies and four motions are converted off the five games
`docs/tower-defence.md` already reads — that page's "What has been converted"
section lists them, and they are on the SHAPES tab as free contours. The two
that were deliberately **not** converted are named there too, with the reason,
and that half matters: a catalogue that only grows stops meaning anything.

What is left is a different *kind* of source, not more games of the same kind.
The five already read are two bullet heavens, a vertical tower defence and two
lane defences, and the last three of them gave up one body each because their
vocabulary is ours already — Nova Drift's whole line-up came back as things
this catalogue draws under other names, which the page lists one by one.

So the yield is falling, and the lane should say what it is fishing for rather
than pick another shooter. The two gaps the nine did not close: a silhouette
that changes because of **what the body is doing** rather than what it is (a
thing that opens, digs in, or folds away — `THE LURE`'s fold is the only one we
have), and hard polygons carrying **life** rather than rock. Pick a source that
has one of those, from anywhere — a shmup boss's transformation phases, an
insect, a machine. It does not have to be a tower defence and the page's title
has already stopped being accurate.

Read the existing seven first. Each carries an `owner` line saying what was
left behind and why, and the useful pattern in them is that the conversion is
never the picture — it is the one claim the outline makes, redrawn. A card that
does not name what it dropped has not been converted, it has been traced.

Each lands as a **free** contour, never a `draft`: a draft names an idea in
`docs/spec/ideas.md` and nothing collected this way is one. Expect to move the
counted assertions in `drawn-size.test.ts` and `long-axis.test.ts`; both say in
their own headers that the denominator moves when a body is added.

`Check: on the SHAPES tab, does each converted body read as the thing it was converted from — and does it still read at 26 px?`

## A DISABLED BUTTON IN THE DIRECTOR HAS NO STYLE OF ITS OWN
_claude/burn-disabled-button-style · tools/director/index.html tools/director/src/rail.ts tools/director/test_
**Proposed by the run.** The half `015ad71` could not reach: it owned
`rail.ts` and not the stylesheet.

`015ad71` fixed COPY and DELETE looking live on a boss wave, and found the
cause was not the guard — the guard had been right since `ba352ba`. It was
that `tools/director/index.html` has **no `button:disabled` rule at all**,
while `button { color: var(--dim); cursor: pointer; }` applies whatever the
state is. A disabled button rendered pixel-identical to a live one: same
colour, opacity 1, and a pointer cursor inviting the press that would be
refused.

Because that lane owned only `rail.ts`, it fixed the two buttons it was sent
for by setting `style.opacity` and `style.cursor` inline. That works and is
the wrong place for it — **every other disabled control in the director still
looks live**, and the next one written will inherit the same trap.

Move it to the stylesheet: one `button:disabled` rule, and drop the inline
styles from `rail.ts` once it covers them. Then check the director for other
controls that are disabled somewhere and have never looked it.

`Check: with a boss wave selected, does every greyed control in the director read as unpressable before you press it?`

## LANDING PRINTS THE COMMAND THAT MAKES AN ORPHAN
_claude/land-verified-removal · tools/land tools/land/test_
**Proposed by the run.** The half `749911e` could not reach: it owned
`tools/checks` and not `tools/land`.

`749911e` taught the sweep to verify a removal instead of trusting it, and to
find directories git no longer knows about. `bun run land` was not in its
paths, and land is where the orphan is actually made.

Land deletes the branch itself, then **prints `git worktree remove <path>` for
somebody to run by hand.** That command is the one with the fault: on Windows
it fails to delete the directory while a handle is still held, drops the
registry entry anyway, and leaves a full checkout on disk that git believes is
gone. Measured immediately after the sweep lane landed — the printed command
was run verbatim, failed exactly that way, and the orphan it made was then
found and removed by the sweep the same commit had just added. The tool
repaired damage its sibling had told a person to cause.

Land should do the removal itself, with the retry-and-verify that now lives in
`tools/checks/sweep.ts`, and print a path only when it genuinely could not
remove one. The guarantee does not change: a tree with uncommitted work is
left alone and named, never forced.

`Check: land a lane — is its worktree folder gone from disk when the landing finishes, with no command left for you to run?`
