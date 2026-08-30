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

## A FIFTH AXIS ON SHAPES: HITS
_claude/shapes-hits · tools/director/src/hits tools/director/src/shapes-trigger.ts tools/director/test/hits.test.ts_
**Asked for by the owner.** *"i guess the hitting 'juice' animations should be
again another category on shapes page."* Yes — and the line between the two
axes is clean.

**The lane this one waited for has landed** — `tools/director/src/glows/`,
`docs/glow.md` and the GLOW row on COMPOSE are on `main`. Read `docs/glow.md`
first and then build against what is there: the registry shape, the stacking
control, the extra OVERVIEW grid and `FigureOptions.padFor` are all reusable as
they stand, and a second copy of any of them is the mistake to avoid.

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

## A SHAPE SHEET THAT CANNOT SHOW A SKIN
_claude/shapes-skin-render · tools/shape-sheet/src/main.ts tools/shape-sheet/src/svg.ts tools/shape-sheet/src/skin-still.ts tools/shape-sheet/package.json package.json tools/shape-sheet/test docs/skins.md_
**Proposed by the run.**

`bun run shapes` writes a silhouette and nothing else. Every skin lives in
`tools/director/src/skins/`, needs a DOM to build into, and is therefore
reachable only by starting the director, finding the SHAPES tab and clicking a
switcher. So the one question a skin exists to answer — *does this interior
read* — cannot be asked from a terminal at all, and cannot be asked about a
single body ever.

The lane that added `skins/chamber.ts` paid for this twice. It wrote a
throwaway script to draw one contour large, then rebuilt the whole interior a
second time in that script because there was no way to point the real skin at
one shape. The commit landed with the skin **never once drawn**, which is why
its `Check:` trailer has to ask whether a compartment still reads as a mouth —
a question the session had already answered three times about its own scratch
copy and could not ask about the code it shipped.

Two copies of one picture is the actual cost, and they will drift.

What is missing is a still: `bun run shapes --skin chamber [NAME]`, writing an
SVG the same way `shapes` already does. The skins need a DOM, so this needs a
`linkedom`-shaped document rather than a browser — the skins only ever call
`createElementNS` and `setAttribute`, which is the whole of what has to be
stood up. `onFrame` is called once at a fixed `t` and `beat`, so the still is
deterministic and can be committed beside the others.

The test that this is right: the next skin is written and looked at without
starting a server, and no lane writes a second copy of its own picture.

`Check: bun run shapes --skin chamber THE POMMEL — is the still the same picture the director draws for that card?`

## THE BURR IS A SEA URCHIN AND ITS OWN CHECK SAYS SO
_claude/burr-or-pommel · tools/shape-sheet/src/forms/studded.ts tools/shape-sheet/src/drafts/tower-defence.ts tools/shape-sheet/src/retired.ts tools/shape-sheet/test docs/tower-defence.md_
**Proposed by the run.**

Check `#215` asks whether THE BURR reads as the body it was converted from.
Drawing it says no, and names the reason: `studded`'s `blunt` rounds a *tip*,
and the thing that makes the source's rim read is its *waist* — a cap wider
than the neck carrying it. A radius function keeps only the outer of the two
radii a club has, so the neck is not something `studded` renders badly, it is
something `studded` cannot represent. `forms/clubbed.ts` and THE POMMEL are
that body converted a second time, walked instead of sampled.

Two bodies now stand for one proposal, which is a state the catalogue should
not be left in. This lane is the decision made concrete once the owner has
looked at both: retire the loser into `retired.ts` with its reason, and leave
one entry.

It is filed as proposed rather than asked because the *verdict* is the owner's
and is not in yet. The lane does not choose. What it may do without waiting is
the part that is already settled either way: `studded`'s doc comment claims
`blunt: 1` "flattens into a cap", and a caller reading that will keep expecting
a club out of it. Say there what the form cannot do, and point at `clubbed`.

`Check: on the SHAPES tab, is there one body from that screenshot rather than two — and does the retired one's reason say why it lost?`
