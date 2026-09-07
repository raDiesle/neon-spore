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

## Making detail, rather than checking for it

The loop above catches what is wrong. This is what puts something there. It is
`upbrew-tech/svg-creator-skill` read and translated: every recipe below is
either already implemented here, in which case **call it**, or genuinely
missing, in which case it is named as missing.

**The five zones exist already, so never write a light.** `skins/light.ts` has
them under their own names — `terminatorPass` is the ramp from lit through
half-tone to form shadow, `contactPass` is the dark edge on the *lit* side that
makes a body solid, `specularPass` is the one highlight, offset from the focus
and never on it, `rimLightPass` is the cool bright edge on the away side, and
the reflected light is the last stop inside the terminator's own gradient.
`litPass` is all five in the order that works. The direction is `KEY`, a
constant in `packages/content` shared with the game, and it is not a parameter:
six skins each inventing an angle is twelve bodies on one page lit twelve ways.
Compose the passes, and **say in the file which one you left out and why** —
that sentence is the difference between a decision and an omission.

**Six stops, not three.** Three make a ramp and a ramp reads as a gradient; six
with the colour moving across them read as a substance. Put
`color-interpolation="linearRGB"` on the gradient: sRGB is the default and it
muddies the midtone between two saturated hues, which is precisely the middle of
a six-stop ramp. Nothing here used that attribute before `glass.ts`. Push the
focus toward the light with `fx`/`fy` at 0.26–0.33 of the box, as `light.ts`
already does.

**A shadow is cool and never black.** Black is a hole in the card rather than a
shadow. `#0B1024` is the value both `light.ts` and `glass.ts` reach for.

**Phase offset is the cheapest detail available.** Two parts breathing on the
same beat are one flat object; the same two a fifth of a cycle apart are a near
thing and a far thing with something between them, and the eye reads the gap as
material without being told. Offset from `SkinFrame.beat`, which is page-wide on
purpose — never start a private clock, because twelve cards on twelve clocks is
noise.

**Displace a contour, do not scale it.** Scaling a lobed blob about its middle
moves every lobe inward, so the second outline crosses the first at each lobe
and the picture fills with pale rectangles that read as debris. Sliding the same
contour along an axis keeps every lobe a lobe. This one cost a round.

**A part that turns about its own middle needs `transform-box: fill-box;
transform-origin: center`.** Without it a CSS rotation turns about the SVG
root's origin and the part flies off the card. Nothing here uses it yet; it is
written down so the first skin that needs it does not lose a round finding out.

**Build in the order you can check**: body, render, interior, render, light,
render. `chamber.ts` landed having never been drawn, and its first still showed
three defects at once — one of which was that its compartments had lost their
clip somewhere between the scratch drawing and the skin.

## How many rounds, honestly

Three is the cap **while the rounds are converging**. The real test is whether
each look finds a *distinct* defect. GLASS took five, and every one was a
different thing: the far wall's lobes crossing the near ones, a muddy interior,
an opaque ramp fighting the whole claim, a flat base tint that only showed once
the ramp came off, and an offset too small to read. That is not tuning, and
stopping at three would have shipped a khaki ball.

When two consecutive looks find **the same** thing at different strengths, you
are tuning rather than correcting. Stop there and offer it: the choice between
two settings of one number is the owner's, and that is what VERSUS is for.
