---
name: render-perf
description: Make a change in packages/render faster without changing what the game draws, and prove both halves with a number. Use when asked to improve frame rate, reduce per-frame work, cache or memoise something in the renderer, or when a draw path looks wasteful.
---

# A render change that is faster and draws the same thing

Two claims have to be proved, and they are proved differently. **Faster** is an
operation count. **Draws the same thing** is an ordered log of every call the
canvas received. Neither is an opinion, and the second one is the house rule
(`CLAUDE.md`, "A look is offered, never replaced") rather than a nicety: a
performance change that alters a pixel has silently spent one of the owner's
decisions for them.

## 1. Measure before you touch anything

`packages/render/test/canvas-stub.ts` is a canvas that records. It keeps a
per-method `tally` and, when you set `ctx.log = []`, an ordered list of every
call with its arguments.

Render the scenarios through `Canvas2DRenderer` with the stub and write the log
to a file in the scratchpad — a phone-sized frame at 390x844 dpr 3, a busy field
with three or more creatures, and the other seat's role, thirty frames each.
`packages/render/test/frame-budget.test.ts` builds exactly this; copy its setup
rather than inventing one.

## 2. Change one thing

One at a time, re-running the log after each. The diff is the judge:

- **Identical** — the diff is empty, or contains only the calls you deliberately
  removed. This lands.
- **Imperceptible** — a value moved by less than a pixel or less than 1/255 of a
  channel. Say which, in the commit message, in those terms. This lands.
- **Visible** — anything else, including a cached value that quantises a time, a
  reordered draw, or a different random spread. **This does not land.** It is an
  alternative: `tools/versus/candidates/` or a NOT BUILT YET card, and the owner
  decides by looking. `docs/versus.md` has the mechanism.

Things that are safely identical: removing a fill that another opaque fill
covers; building a path string once instead of twice; caching a gradient whose
every argument is a layout number, keyed on those numbers; hoisting a clip that
several passes take against the same path, provided you put back by hand every
piece of context state the removed `restore` used to undo.

Things that are not: caching anything keyed on `time`, quantising a wobble,
reordering two passes that both write the same pixels, changing a particle's
random spread.

## 3. Pin the win

Lower the number in `frame-budget.test.ts`'s budget table **in the same commit
as the change**. A budget is exact, not padded: it is what the frame costs
today, so a regression fails a test instead of a phone.

## 4. What the measurement cannot tell you

The stub counts calls; it does not rasterise. A saving in call count is a real
saving in JavaScript time and usually in GPU work, and it is not a frame rate.
If the claim is about frame rate on a phone, say that it is unmeasured here and
what would measure it.

Never use `shadowBlur` — `packages/render/src/glow.ts` explains what to use
instead, and it is the single biggest frame-rate cost on a mobile GPU.
