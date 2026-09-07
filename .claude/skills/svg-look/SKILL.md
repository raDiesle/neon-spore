---
name: svg-look
description: Draw an SVG picture in Neon Spore by rendering and correcting it rather than emitting it once — the loop, the density bar, and the cheap checks that come before an image. Use when writing or changing anything drawn as SVG: a creature skin, a VERSUS candidate, a NOT BUILT YET card, concept art, a shape sheet, an icon, or any animated figure a person will look at.
---

# A picture is built by looking at it

The rule this serves is in `docs/looks.md`, under "A drawn picture is built by
looking at it". This is how it is carried out.

## Why this exists

A session writing SVG cannot see what it wrote. So it stays inside the shapes
whose appearance it can predict from the coordinates alone — four or five
paths, one gradient, two keyframes — because without a look every extra element
is a risk rather than an improvement. The result is thin, reliably, and the
thinness is not a taste: it is the ceiling that comes with never rendering.

The owner named it on 7 September 2026, comparing a picture drawn here against
an SVG he had been handed by another model: much more detailed, and drawn by
something that was not being careful, only less blind. Nothing about size or
frame cost is at stake — a phone renders far more than any of these files
contain.

## The bar

**A reference in the conversation is the density to meet.** If the owner has
attached an SVG, open it and count what it actually has — elements, gradient
stops, animated attributes, layers between the rim and the interior — before
drawing beside it. Handing back something visibly thinner than the thing on the
screen next to it is the failure this skill exists to prevent.

**With no reference, the bar is the shipped work.** `tools/director/src/skins/`
is what a finished interior looks like here; `bun run shapes:parts` prints
every secondary form on one sheet. Build from those rather than inventing —
that rule has its own note in `CLAUDE.md`.

## The loop

Three rounds, and the first two cost no image at all.

**1. Numbers before pictures.** `bun run shapes:report` prints the geometry as
text: extents, lobe count, where a contour sits in its box. Most of what goes
wrong in a first pass — a shape clipping its frame, a figure off centre, a
proportion badly out — is visible here for a couple of hundred tokens instead of
the fifteen hundred an image costs. Never skip to a screenshot without running
it.

**2. One still, rasterised, and actually read.** A skin becomes a standalone
file without a browser or a server:

```bash
bun run shapes:still --skin <id> --t 0.5 > /tmp/still.svg && bun run png /tmp/still.svg /tmp/still.png
```

`bun run png <in.svg> <out.png>` works on any SVG — a shape sheet, a VERSUS
candidate, a card. Then **read the PNG**. Reading it is the whole point; a
render that is produced and not looked at is the two-copies-of-one-picture
mistake `svg-dom.ts` was written about.

**3. Correct, and look once more.** Two or three looks total. After the third
the returns fall off and the cost does not, so stop and offer what you have.

## What to look for, and what to add

The first look is for defects: a lobe outside its viewBox, a highlight that
does not follow the body when it rotates, a gradient that reads as flat grey at
size, a stroke that vanishes on the dark ground.

The looks after that are for density, and these are the axes that carry it
here — interior structure inside the contour rather than an empty fill; a
second border cut from the body's own outline rather than a ring around it;
light as a pass over the shape rather than a white blob; and, in anything
animated, **phase offset** — parts that breathe on the same beat read as one
flat object, and the same parts a fifth of a cycle apart read as alive.

Detail that is not this is padding: noise texture, extra vertices nobody can
resolve at the size it ships, an element repeated because the file looked
short.

## Where this does not apply

An explanatory diagram on a director page is exempt, and plain is the right
answer there: its job is to be read at a glance, and density is noise against
that. So is plumbing — `svg-dom.ts`, `tools/frames/`, `tools/raster/`. The
`after-svg-edit` hook cannot tell the difference and will say so on every one;
if the file is one of these, note it and carry on.

## The house rule still holds

**A richer version of something already drawn is an alternative, not a
replacement.** It goes to `tools/versus/candidates/` beside the shipped look,
and the owner decides by looking — the one thing no session can do
(`CLAUDE.md`, "A look is offered, never replaced"). The three exemptions there
apply unchanged: a look asked for by name, a look with nothing shipped in its
place, and a repair to something wrong rather than unlovely.

**Send the result as PNG, one picture, with one sentence saying where to look.**
Never an SVG attachment — it reads on an Android phone as a file to open.
