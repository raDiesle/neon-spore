# The asset catalogue

> **Status: twenty-two drafts, none of them claimed.** A draft is a picture offered
> to an idea, not a decision about it. Nothing on this page is in the game, and
> a draft leaves it by being claimed — its parameters moving into
> `packages/content` — or by being cut.

Browse it in the director: `bun run dev`, then **NOT BUILT YET → SHAPES**. The
cards animate, and that is the whole reason the page exists rather than a
folder of SVGs.

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

**Twenty-two drafts**, one for all but a handful of the open ideas: twelve
creatures, four bosses, six for the controls and mechanics. Each names the idea
it is offered to, and a test fails if that idea is not a heading in
[ideas.md](spec/ideas.md) — a suggestion pointing at nothing is worse than no
suggestion.

**Six new contour forms**, because several ideas are not describable as a
lobed blob or a faceted rock. Five are in `tools/shape-sheet/src/forms.ts`:
`sac` (mass pulled downward, hanging), `cluster` (several bodies in one
membrane, metaball, and the one form that can return more than one loop),
`arm` (open, swung from a pivot), `slab` (superellipse, made rather than
grown), `glyphed` (a rim of notches that travel). The sixth has a file of its
own, `hooked.ts`, and the split is a real seam rather than a full file: every
form in `forms.ts` is symmetric or symmetric-with-a-wobble, which is right for
anything that holds its lane, and `hooked` is the one whose outline carries a
**direction** — a barb that points where the body is going. `sac` also takes an
optional skin now, so a sac can be drawn from somebody else's lobes; the HUSK
is the reason and the section below says why.

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
- **None of them has colour, glow or detail.** The cards are outlines. The
  field draws fills, rims, cores and halos, and a silhouette that reads bare
  can still fail dressed.
- **HUSK is the one draft that has to *fail* to be readable, a little.** It is
  the pod's own contour with the mass moved to the bottom and nothing else
  changed, because a husk that announces itself while it still hangs is free to
  ignore, and free to ignore is not a decision. So the card is asking whether
  slack can be told from taut at 26 px, and either answer is useful: if it can,
  the husk is a shape; if it cannot, the whole tell falls to the dead core, and
  the outline was never going to carry it. That question cannot be settled here
  — put the HUSK card next to the POD card and look.
- **NOTCH leans, and so does everything else.** The barb gives the body a
  facing, which is what the mechanic needs; the CANT motion then holds that
  lean rather than rocking through it. But the bulb already sways and the slick
  already tilts, and at 26 px a small body has very few ways to move. Whether a
  *held* lean reads as a direction rather than as one more wobble is an eye's
  question, and it is the one the draft exists to have asked.

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
3. **A draft for the three ideas that still have none.** *Notch* and *Husk*
   have theirs now — NOTCH and HUSK below — and both entries in the idea store
   were worked out to match, so the picture and the paragraph were written
   against each other rather than one being fitted to the other afterwards.
   What is left is *Reverse wave*, *The breach* and *Handover*. The first two
   are the same drawing: a reverse wave comes up out of a **breach**, so the
   thing to draw is the hole in the hull rather than the direction. The third
   is a control and wants a mark on the ship in the way the SWAP ARC does.
   Anything new goes in the same three files, not a fourth list.
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
