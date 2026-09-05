# The asset catalogue

> **Status: thirty-eight drafts, and one claimed so far.** A draft is a picture
> offered to an idea, not a decision about it. Nothing on this page is in the
> game until it is claimed — its parameters moving into `packages/content` —
> or cut.

**A construction can be claimed without the body it drew.** THE THROB needed a
rim whose bearing is legible at forty pixels — the creature turns, and a ball
cannot show that it is turning — and `clubbed` was the only thing in this
catalogue that says *ball on a stalk*. So the walk moved to
`packages/content/src/body-path.ts` and `forms/clubbed.ts` is a card over it,
while THE POMMEL, the boss-sized body it was written for, stays free. That is
the same transaction with the units taken apart: what a creature spent was the
construction, and the tuning it was drawn at is still on the shelf.

THE WARDEN's ring is the first that went that way, and it is worth saying how,
because until it happened "claimed" was a word on this page rather than a
thing anybody had done. Its three cards were drafts offered to a boss with a
section in `docs/spec/bosses.md` and no code. The boss was built; the numbers
moved to `packages/content/src/warden-shape.ts`, where the canvas and this
sheet now read the same copy; and the cards moved out of the drafts and in
among the shapes that are spent. Nothing about the contour changed.

The count above is checked by `tools/shape-sheet/test/drafts.test.ts`, which
reads this sentence and counts the catalogue. It had gone wrong twice in one
day before that — two sessions each incrementing the number they found instead
of counting — and a status line nobody can trust is worse than none.

Browse it in the director: `bun run dev`, then **NOT BUILT YET → SHAPES**. The
cards animate, and that is the whole reason the page exists rather than a
folder of SVGs.

**Four skins sit above the drafts**, and they are there to settle an argument
rather than to decorate. `docs/alive.md` sends one question to a vote —
*is the spec right that detail does not survive* — and until now the cards
could not put the two sides on a screen: every shape was drawn as a bare
outline, which is not a neutral rendering but a claim, and it was the only
claim available. LINE is that outline, kept as the control. MEMBRANE adds the
dark fill and the layered aura `packages/render/src/glow.ts` already draws
creatures with, so a card stops being a wireframe of the game and starts being
a picture of it. CORE adds a value gradient falling *outward to the card's own
dark*, which is the direction that raises rim-to-interior contrast rather than
eroding it. VEIN adds branching filaments under the skin — the one treatment
that is genuinely detail in the sense the spec forbids, and therefore the only
one that actually answers the question.

The switch is page-wide on purpose: a comparison needs every shape to change
at once, or what you are reading is which cards somebody clicked.

`tools/director/src/skins/` is the whole of it — one file per skin behind a
registry, and `docs/skins.md` says how to add one. It draws into the DOM, so
the static sheet `bun run shapes` writes is still LINE-only. That is a gap,
not a decision.

`bun run shapes:page` writes the same catalogue to
`tools/director/dist/shapes.html`, one self-contained file that animates
anywhere and needs no server — for handing a look to somebody who is not at
this machine, which is the only way a cloud session can put a shape in front
of an eye.

## Why there is one

The bestiary is a list of behaviours with no pictures. The style guide left a
handful of pictures with no behaviours. Those two lists have sat beside each
other on the SHAPES tab for a while, and the arrangement works — but it only
ever lets a *drawn* shape be handed to an idea, and there were six of those
against two dozen ideas.

So this is the third list: shapes drawn **at** the ideas in
[the idea store](spec/ideas.md), one per idea, on purpose and in advance. The
bet is that most of the cost of a creature is not the drawing — it is deciding
whether the thing can be read at 26 px on a phone while somebody is describing
it out loud, and that is a question a picture answers in a second and a
paragraph never answers at all.

## The three states

| State | What it means | Where it lives |
|---|---|---|
| **DRAFT** | drawn for a named idea, offered to it | `tools/shape-sheet/src/drafts/` |
| **FREE** | a picture with no behaviour behind it | `tools/shape-sheet/src/catalogue.ts` |
| **TAKEN** | something in the game carries it | `packages/content/src/silhouettes.ts` |

The direction of travel is one way: a draft that is claimed becomes taken, and
its numbers move out of the tool and into content. Nothing goes back. A draft
that is not claimed is cut, and the commit that cuts it says why — that is more
useful to the next session than the shape was.

**Content is what the game ships.** A contour nothing carries is not content,
which is why every draft lives in `tools/` and none of them in `packages/`.

## What is in it now

**Thirty-eight drafts** across all but a handful of the open ideas: fifteen
creatures, six bosses, five collected, six for the controls and mechanics, four
marks on the ship's own skin and two interlude bodies.
Each names the idea it is offered to, and a test fails if that idea is not a heading in
[ideas.md](spec/ideas.md) — a suggestion pointing at nothing is worse than no
suggestion.

**Four ideas turned out to be one drawing problem, and that is why they had no
picture.** *The breach*, *The Patch*, *The Other Hand* and *Handover* had sat
undrawn while fifteen creatures got shapes, and the reason was not that they
were hard: none of them is a **body**, so none was drawable as a blob. Every one
is the ship saying something about **one column** — it gave way, it is being
held shut, somebody's thumb is down over it, the two of you have just swapped
what you own. They are HULL · TORN, HULL · MENDED, HULL · HELD and HULL ·
TRADED, one span at one scale so the page compares them against each other and
against HULL · PASSIVE with no scaling step in between, and their features are
exactly one column wide — measured off the drawn hull rather than typed, because
a mark that is not a column is a ship arguing with the grid the pair names
things in.

None of the four carries an own-motion, which is a rule and not an omission. The
hull is fixed; everything these cards do happens in the contour.

**Ten of the twelve interludes need no new art, and drawing the other two is how
that was found out.** [interludes.md](spec/interludes.md) fixes the material as
*slabs and glyphs, never blobs*, and `slab` and `glyphed` were already here. THE
VAULT is a grid of slabs. THE ACCORD is two dials, which is BEARING RING twice.
THE LATHE is the blob vocabulary itself, on purpose. THE GAUGE is built. THE
BELT was drawn and thrown away — see below. What was actually missing was a
thing that **grips** and a line that **crosses itself**, so THE CLAW and THE
SPLICE are the two cards, and the rest of the category is spendable out of what
the page already holds.

**Two ideas carry two drafts each**, which is new. Every other entry here is one
picture offered to one idea, and that works while the open question is *what*
should be drawn. The Notch and the Husk are past that: what each is has been
worked out, and what is left is a question with two candidate answers that only
an eye can settle. A single draft in that position quietly becomes the answer by
being the only thing on the page, so both go up, numbered, turning on the same
clock — NOTCH 1 and NOTCH 2, HUSK 1 and HUSK 2. The section on where the drafts
fall short says what each pair is asking.

**Sixty parts and twenty-two bodies grown out of them**, which is a second
unit and not more shapes. Everything else on this page is a whole contour
written for one idea; a part is a piece — a tentacle, a spore, a crystal, a fin
— authored in its own frame and attached to somebody else's rim, so a new
silhouette is a base blob and a sentence rather than a new radius function.
`tools/shape-sheet/src/parts/` holds them in five categories, `grown-bodies.ts`
and `jelly-bodies.ts` spend them on twenty-two `free` cards, and
`bun run shapes:parts` draws the whole library on one sheet. [parts.md](parts.md)
says how to add one, why every part is clamped out to the rim it stands on, and
when `studded` is the right tool instead.

**Eight of the twenty-two swim**, and they are the first bodies here whose
motion a pose cannot express. The owner picked the jellyfish out of the first
fourteen, which was better information than a session could have reached on
its own: the library's most useful direction is *a body with something hanging
under it*. What makes them read is that the bell and the tentacles disagree
about what time it is — the contraction lives in the contour and reaches each
part at its own delay, while `JET` carries the rise, and the two share one set
of constants so they are halves of a gesture rather than two gestures.
`bun run shapes:swim` draws one cycle of each as a strip.

The fourteen are `free` and not `draft` deliberately: a draft is a picture
offered to a named idea, and fourteen arriving at once would spend fourteen
decisions on a mechanism rather than on a creature. What they are for is the
one question an eye has to settle — whether a combination moves a silhouette
far enough to be worth having a combinator at all.

**Sixteen contour forms** in `tools/shape-sheet/src/forms/`, because several
ideas are not describable as a lobed blob or a faceted rock. They sit in seven
files, split along seams rather than at line counts.

A directory rather than siblings, and that is the one thing here that was
decided twice. `forms.ts` filled, and the overflow went to a file beside it;
it filled again, and so did that. Both overflow files say in their own comments
that the reason was a full file. The seams they had found were real and are
kept exactly as they were — what changed is that they now sit inside the thing
they are seams of, so the next one has somewhere to go.

`radial.ts` holds the ones sampled one radius per angle and symmetric, or
symmetric-with-a-wobble, which is what anything holding its lane wants: `slab`
(superellipse, made rather than grown) and `glyphed` (a rim of notches that
travel).

`hooked.ts` holds the two whose outline carries a **direction**, which nothing
else in the catalogue does: `hooked` grows a barb toward where the body is
going, `heeled` leans the whole mass there instead. They share one `commitment`
clock, so the two NOTCH cards turn on the same beats and the only difference
between them is where the direction is carried.

`hanging.ts` holds the two for a body whose mass has **given way**: `sac` (the
original, now taking an optional skin so it can be cut from somebody else's
lobes) and `slumped` (the same sag with one shoulder fallen in). THE WEIGHT uses
the first; the two HUSK cards are one of each.

`cluster.ts` and `pile.ts` are a field walked on a grid, which is how a contour
comes apart into more than one loop. They agree on the machinery and disagree
about what the field is made of, and that disagreement is the whole shape in
both cases: `cluster` sums round metaballs and blooms, so several bodies share
one membrane; `pile` sums polygons raised high enough that the sum is nearly a
maximum, so a stack of rocks creases at its seams instead.

**Three more forms are parked in `drafts/` rather than in `forms/`**, and the
reason is a night rather than a seam: another lane owned that directory while
these were drawn, and a rebase over it is cleaner if nobody reached into it.
`membrane.ts` is the span of hull with one column changed, the generator behind
all four ship cards; `machined.ts` is `claw` and `cable`. If the cards survive
review the two files belong in `forms/`, under the seam `radial` and `walked`
already draw between a body and an edge.

`walked.ts` holds the three whose outline is stepped corner to corner, because
a radius per angle cannot say what they say: `arm` (open, swung from a pivot —
it has no inside to have a radius of), `vane` (the same arm with the bearing it
turns on drawn, since that is the only part of THE VANE that can be hit) and
`plated` (a slab with a row of plates under it, one of them reaching, which is
a rule about one edge rather than a function of angle).

**Eleven spare motions** in `tools/shape-sheet/src/motions.ts` — SHIVER,
TWITCH, TURN, DRIFT, TOLL, SWELL, LURCH, HEAVE, SLITHER, CANT, SAG — written to
be told apart at 26 px rather than to differ by a frequency. SAG is the one
deliberate exception: it is HEAVE with the asymmetry the other way round,
because whether those two can be told apart at 26 px *is* the question the HUSK
was drawn to ask.

## Own-motion is now data

The bulb's sway and the slick's tilt used to be typed out inside
`packages/render/src/creatures.ts`, where nothing outside the running game
could see them. They are now `packages/content/src/own-motion.ts`, as a `Pose`
per second, and the renderer calls them. A row in `packages/sim/test/purity.test.ts`
fails if anyone writes `sin(t * 1.9)` anywhere else again.

This is what lets a catalogue card show **the motion the field would show**
rather than an impression of it. Offsets are in tiles, as they are in the game,
so a sway is the same fraction of a lane on a card as it is on a phone.

## Where the drafts fall short

Said plainly, because a catalogue that oversells itself is worse than none.

- **A cluster comes apart now, and nobody has watched it at 26 px.** `cluster`
  is traced on a grid rather than marched radially from the centroid, so it
  returns as many closed loops as the field actually has: one while the bodies
  are merged, five when the Colony spreads. ECHO, SYMBIOSIS, COLONY and THE
  CHOIR each part into their full body count and merge back, and a test fails
  if one of them stops. What that does **not** say is whether the parting reads
  at creature size on a phone — five bodies at a fifth of a tile each may be a
  spread, or may be a smear. That is an eye's question and it is open.
- **The glyph rim is a notch pattern, not glyphs.** COUNTDOWN and THE CODEX
  scroll a wave around their outline. Whether a *count* or a *key* can be read
  off it is unanswered, and it is the question both of those ideas turn on.
- **The arms are single strokes.** THE CONDUCTOR, THE NEEDLE and LIGHT TRACE
  have no thickness of their own. A real one is a stroke width and a taper.
  THE VANE now carries a drawn bearing at its pivot, which is the part of it
  that can be hit; the arm below the bearing is still one stroke.
- **The pile creases, and nobody has seen whether the creases count.** `pile`
  sums each unit's own polygon rather than a metaball, so THE CAIRN's outline
  notches where two rocks meet instead of bulging — and it is one loop while it
  is stacked and exactly two once a unit is dragged clear, at every one of
  fifteen thousand sampled moments. What that does **not** say is whether a
  person can *count seven rocks* in the silhouette. The whole encounter is
  taking units off a pile, so if the notches read as one lumpy boulder the
  mechanic has no body. That is an eye's question and it is the first one.
- **THE TITHE's live plate reaches instead of lighting, and that is a guess.**
  A silhouette has no colours, so the live plate hangs two and a half times as
  far as its neighbours and steps a column every cycle. Measured, it is the
  only part of the outline that moves and it visits all seven columns. Whether
  *which* column reads at a glance — especially at the outermost of seven,
  which is why that case has a card of its own — is unlooked at.
- **A raised lump on the hull may only ever mean "shield".** HULL · HELD and
  HULL · MENDED both put something up on the membrane, and the ship already does
  that for one thing. The margins are measured and they are small: against the
  armed shield's 7.5 px over two thirds of a column, the welt is 7.0 px flat
  across a full one and the held lobe is 6.0 px and returns to nothing. In added
  contour that is +8.2 px for the welt and 0 → +6.3 px for the lobe, against the
  shield's +15.3 on the whole hull. If a phone reads all three as the shield then
  the hull cannot carry a second meaning and both ideas need a mark somewhere
  else — which is a bigger answer than either card.
- **HULL · TORN is the only shape here that is not one stroke, and nothing has
  looked through it.** Its edge is 20.4 px *shorter* than the bare span, because
  a column of skin is gone: the one card in the catalogue whose contour
  subtracts. Whether a 23 px hole in a 150 px line reads as a breach at 26 px, or
  as the ship having been drawn badly, is the whole question and it is an eye's.
- **THE BELT was drawn and cut, and the cut is worth more than the card.** A
  horizontal run of slabs at one tile per beat measures as seven rectangles in a
  row — which is THE TITHE with the top taken off, and CODE PLATE seven times.
  The two would sit in the same catalogue meaning different words, and a
  silhouette that means two words means neither. What actually distinguishes THE
  BELT is that its marks are on the **faces** of the slabs, and a face is not in
  an outline. THE VAULT fails identically, and for the same reason: both rounds
  hang on `simon-glyph.ts` rather than on this page, and neither is waiting on a
  shape.
- **None of them has colour, glow or detail.** The cards are outlines. The
  field draws fills, rims, cores and halos, and a silhouette that reads bare
  can still fail dressed.
- **The HUSK pair has to *fail* to be readable, a little.** A husk that
  announces itself while it still hangs is free to ignore, and free to ignore is
  not a decision — so these two are not trying to be legible, they are trying to
  find the point where legibility starts. HUSK 1 is the POD card's own lobes,
  depth, wobble and seed with the mass moved down: a proportion changed and no
  landmark, so an eye may have nothing to point at. HUSK 2 cuts one landmark, a
  dent 26% of the radius deep across 23% of the outline, off-centre so it reads
  as damage rather than as design. Put both beside the POD card. If neither
  separates, the dead core carries the whole tell alone; if HUSK 2 separates and
  HUSK 1 does not, the line runs between them and that is the measurement.
- **The NOTCH pair asks where a direction can live.** Both commit on the same
  clock and both carry CANT, which holds a lean instead of rocking through it,
  so the contour is the only variable. NOTCH 1 says it with a barb — one feature
  to find, and exactly the size of thing that disappears at 26 px. NOTCH 2 says
  it with the whole mass, fat in front and lean behind, which cannot disappear
  and may read as one more wobble beside the bulb's sway and the slick's tilt.
  The failure modes are opposite, which is the point: if both work, take the
  quieter one; if both fail, the direction does not belong in the outline and
  the lean has to come from somewhere else.

## What a later session picks up

Roughly in the order the work is worth doing.

1. **Look at the four clusters at creature size.** They part now — `iso.ts`
   traces the metaball instead of marching it, `Subject.loopsAt` carries the
   loops and `contourAt` draws them — and the spreads were retuned until each
   reached its full body count. The numbers say it separates; only an eye says
   whether it separates *legibly* on a phone. `bun run shapes:page` builds the
   catalogue as one page that can be opened anywhere, which is how a session
   with no screen of its own hands that question to somebody who has one.
2. **Claim two or three drafts.** The pipeline above has never been walked. The
   likeliest first is the **Wave gate** — its idea is worked out furthest, and
   GATE is the only draft that needs no new contour maths. Walking it once will
   say more about whether this arrangement is right than another ten drafts.
3. **Every creature, mechanic and control idea that can be a shape now has
   one.** *Reverse wave*, *The breach* and *Handover* were the three this page
   listed; they have drafts, and so do *The Patch* and *The Other Hand*, which
   nobody had counted. Three ideas are left over and none of them is waiting on
   a drawing: *The Flip* is the whole field rolling over, which is a motion and
   not a contour; *The Fork* is two routes and a gate; *Call signs* is what the
   eleven columns are **called**, which is typography. Of the twelve interludes,
   THE CLAW and THE SPLICE are drawn, THE GAUGE and SNAKE are built — the
   snake's arena is drawn in the ship's own violet and cyan rather than the
   arcade's green, because green is spent (`palette.ts`) and the body *is* the
   ship, which the round says out loud by shrinking the real hull into it —
   and the remaining eight are answered out of `slab`,
   `glyphed` and the blob vocabulary itself — the two that are not, THE BELT and
   THE VAULT, are cut above for the same reason.

   What is left undrawn is not an idea without a picture, it is a **creature**
   without one:
   the thirteen in [bestiary](spec/bestiary.md) 10.1 and 10.2 that were never
   built — Dart, Veil, Crystal, Gum, Choke, Glyph, Thread, The Shadow,
   The Doppelgänger, The Clamp, The Beat-breaker, The Jammer. They are not here
   because the bestiary is not the idea store: a draft's `suggests` has to
   resolve to a heading, the test only reads `ideas.md` and `bosses.md`, and a
   lane that widened that test to take a table row would have been changing the
   rule rather than drawing. It is the next thing worth doing on this page and
   it costs one predicate.
4. **Draw the motion sheet from the catalogue, not from `SUBJECTS`.**
   `bun run shapes` still onion-skins only what the game draws, so a draft
   cannot be diffed or archived as an image. `tools/shape-sheet/src/motion.ts`
   reads one array; pointing it at `CATALOGUE` is most of the work.
5. **Colour and glow on a card.** The palette is right there in
   `packages/render/src/palette.ts`. The argument against is that an outline is
   the honest test and dressing hides a weak one; the argument for is that
   nothing on the field is ever undressed.
6. **A sound beside a shape.** The SOUND tab already holds spare cues built for
   creatures that do not exist. Nothing links the two lists, and a creature is
   a silhouette, a motion and a noise.

## Rules that apply here

- A shape is not a name. Anything claiming one still gets its own name out of
  the bestiary's four naming rules.
- A suggestion is not a decision. The idea is free to refuse the shape, and a
  person decides — the editor writes nothing.
- Own-motion never touches the lane ([systems](spec/systems.md) 5.8). Every
  motion here is tested against that, drafts included.
- Nothing in `content` may reach for a wall clock or a random number. The
  catalogue's own animation clock lives in the tool, where a replay cannot see
  it.
