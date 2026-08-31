# Parts

A **part** is a secondary form attached to somebody else's rim: a tentacle, a
spore, a crystal, a fin. Fifty-two of them live in
`tools/shape-sheet/src/parts/`, and `grown()` builds a body out of a base blob
and a list of them.

They exist because the catalogue had one unit and it was the wrong size. Every
shape in `forms/` is a whole contour written for one idea, which is right when
the idea *is* a contour — `sac`, `hooked`, `pile` are each a claim about how a
body is put together — and expensive when the idea is a combination. A body
with three lashes on one side and a bump on the other used to be a new radius
function. It is now a sentence.

## What a part is

Three properties, and they are what separate a part from a small shape:

- **It is authored in its own frame.** Local `+x` is straight out of the body,
  local `+y` runs along the rim, and one local unit is the body's radius at the
  attachment point. So a part carries no absolute size and no absolute bearing:
  `place` in `geometry.ts` gives it both, which is why every one of them
  rotates, mirrors, scales and repeats without being written to.
- **It knows the time and its own phase.** Eight identical spines moving
  together read as one machine; the same eight on eight phases read as alive.
  The composer hands out the phases, derived from where the part sits rather
  than from a counter — two bodies built from one recipe must draw the same
  picture.
- **It returns closed loops.** `Subject.loopsAt` already existed for the bodies
  that come apart, so a grown body is the base loop followed by every part's
  loops and needs no new machinery under it.

## Adding one

Write it into whichever of the four category files it belongs to —
`limbs.ts`, `growth.ts`, `alien.ts`, `rim.ts` — and that is the whole of it:
`registry.ts` assembles them, the sheet walks the registry, and a recipe names
it by id.

```ts
{
  id: "barb",
  label: "BARB",
  category: "reach",
  hint: "straight out, then a hook at the end — the one limb with a direction",
  build: limb({ len: 0.7, curl: 1.9, sway: 0.12, speed: 1.0, n: 14 }, taper(0.12, 0.05)),
}
```

Everything is built out of four constructions in `geometry.ts`, and a part that
needs a fifth is a body wearing a disguise: `spine` (a centre line walked as a
heading, so a bend accumulates the way a limb's does), `ribbon` (a spine given a
width function), `disc` and `band`.

The `hint` is not a comment. It is printed under the part on the sheet and is
the only thing telling a reader what the piece is *for*, so it says what the
part does to a silhouette and what it would animate as — not what it is made
of, which the code already says.

## The rim clamp, and the one part that opts out

Every part loop is pushed out to the base body's rim if it was inside it
(`clampOut` in `grown.ts`). This is not tidiness. The director fills a card
with `fill-rule: evenodd`, which is right for the shapes that carry a mouth or
come apart — a loop inside a loop is a hole, and that is what those bodies
mean. A part rooted into the body means the opposite, and drawn under that rule
its overlap would come out unfilled: a BUMP would draw as a bite. Clamped, the
two loops touch instead of crossing, and every fill rule agrees about the
picture.

A part that is meant to be inside says `under: true`. There is exactly one —
VEIN, because a vein is under the skin and a channel through the fill is what
that looks like.

A part clamped so far that nothing is left is **dropped** rather than drawn as
a sliver on the rim. That is a real loss and the cure is a bigger `size` in the
recipe, not a smaller threshold: a hairline crescent reads as a rendering
fault, which is worse than a feature that is simply absent.

## When not to reach for one

`studded` in `forms/studded.ts` grows knobs, spines and hairs out of the radius
function itself, and that is the right way to wear a feature all the way round
a body: one rule, no seams, and it costs nothing per feature. Parts are for two
or three of something **somewhere in particular**. Forty of something
everywhere is `studded`.

Nothing here draws light, either. A glow is
`tools/director/src/glows/` and stacks onto any card; a part that existed only
as a bloom would be a second answer to a question that page already answers.
What these do is give the light something with a shape to come off.

## Looking at them

```
bun run shapes:parts     tools/shape-sheet/parts-sheet.svg — every part, grouped
bun run png tools/shape-sheet/parts-sheet.svg out.png
```

The sheet draws each part on a plain round body **through the composer**, not
by placing it directly — its first draft did that and was wrong in the way that
matters: it would have shown the authored piece while every card in the
catalogue showed the clamped one, and the sheet is the copy nobody would check.

One scale for the whole sheet, which is why it does its own layout rather than
calling `frame` in `svg.ts`. Half the library is the same shape at a different
size — STUB against LASH, SPORE against SPORE CLUSTER — and a sheet that fitted
each cell would draw those pairs identically and quietly delete the axis they
differ on.

The fourteen combinations at the foot of the sheet are `grown-bodies.ts`, and
they are also cards on the director's SHAPES tab, where they animate. They are
`free` rather than `draft` on purpose: a draft is a picture offered to a named
idea, and fourteen at once would spend fourteen of the owner's decisions on a
mechanism rather than on a creature.
