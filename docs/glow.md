# Glow

A **glow** is what a body throws off into the space around it. The GLOW row on
the director's SHAPES tab, under COMPOSE, ticks any number of them on at once,
and every card on the page wears the stack together.

It is the fourth axis, beside SKINS, MOTIONS and LIGHT. `docs/skins.md` is the
file this one inherits from and does not repeat: a skin is one way of drawing a
contour, and everything about how a skin is written, seeded, keyed and animated
holds here word for word. What follows is only what is different.

## Why it is not more skins

A skin is **exclusive** and a glow **stacks**.

That is the whole of it, and it decides everything downstream. A body is drawn
as MEMBRANE *or* as CARAPACE, so the skin switcher is right to be radio
buttons; BLOOM and TRAIL and AURA are all on at once in any real engine, and
the combination is what the owner opens the page to judge. Folding these into
`SKINS` would have made `SkinId` mean two things and would have offered BLOOM
*instead of* MEMBRANE, which is the one combination on the page that makes no
sense.

So `currentSkin()` returns one id and `currentGlows()` returns a set, and every
other difference between the two directories follows from that one.

## Why it is named GLOW and not something else

It pairs against LIGHT rather than duplicating it. **LIGHT is a body lit from
outside; GLOW is a body lit by being the thing that emits.**
`docs/tower-defence.md` reads those as the two honest answers to the same
question — the second is Neon Pulsefire's whole lighting model, no shadow and
no light source — and until this landed only the first could be drawn.

`VFX` was rejected as the only acronym the page would carry. `EMISSION` and
`AURA` were rejected because each is also the name of a value on the axis, and
an axis may not be named after one of its own members. That is also why the
familiar *Outer Glow* is called `HALO` here.

## Where a glow lives

`tools/director/src/glows/`, one file each, assembled by `index.ts`:

| File | What it is |
|---|---|
| `types.ts` | `Glow`, `GlowContext`, `GlowFrame`, `GlowLayer` |
| `index.ts` | the registry, `GlowId`, `glowSpread`, `buildGlows` |
| `bloom.ts` … | the glows themselves |

`GLOWS` in `index.ts` is the **only** place that knows which glows exist. The
switcher iterates it, `GlowId` is derived from it, the OVERVIEW grid walks it
and the builder looks up in it — so a new glow is one file and one line.
`test/glows.test.ts` fails if the directory and the array ever disagree.

`GlowContext` and `GlowFrame` are aliases of `SkinContext` and `SkinFrame`, not
copies. A glow is built into the same figure, with the same `<defs>`, against
the same contour, at the same moment; `skins/parts.ts` already argues that
three copies of a shared thing drift, and a page whose axes had drifted apart
would be comparing implementations rather than settings.

## Adding one

```ts
import type { Glow } from "./types.js";

export const SHEEN: Glow<"sheen"> = {
  id: "sheen",
  label: "SHEEN",
  hint: "one line in the switcher's tooltip — what this throws off and why",
  layer: "under",
  spread: 0.2,
  build(ctx) { … },
};
```

Then add it to `GLOWS` in `index.ts`. `build` runs once per figure, exactly as
a skin's does, and switching the stack rebuilds every card — so nothing has to
be undone.

## The two fields a skin does not have

**`layer`** is `"under"` or `"over"`, and the builder draws every `under` in
registry order, then the skin, then every `over`. It is not a matter of taste
and it is deliberately not the order the reader ticked the boxes in: a bloom
sitting on top of its own outline is the effect drawn wrong, and a page whose
stacking depended on click order could not be reproduced from a screenshot.

**`spread`** is how far past the contour the glow reaches, as a fraction of the
body's half-extent. `shape-figure.ts` takes the largest `spread` in the enabled
stack and pads the fitted box by it before working out the scale.

This is the field that keeps the cards from clipping, and it is the one most
worth getting wrong in the generous direction. Without it, ticking HALO slices
every card at its own frame edge — which reads as *the effect being broken*
rather than as the frame being small, the same failure the own-motion fit
exists to prevent. A card drawn slightly small is still a card.

It is declared rather than measured because measuring it would mean rendering
the figure to find out how big to draw it. And it is applied per figure rather
than folded into `shape-fit.ts`'s memo on purpose: that table costs a hundred
and thirty contour samples and six thousand poses, keyed on the two things a
glow does not change, and keying it on the glow stack as well would recompute
the whole scan for what is a multiplication — and would hold one box per subset
of a seven-value set.

## The rules

The four in `docs/skins.md` — no `packages/render`, seed only from
`streamFor(ctx.name)`, key every `<defs>` id on `ctx.uid`, allocate nothing per
frame — apply unchanged. `test/glows.test.ts` scans for three of them, in the
same spirit as `packages/sim/test/purity.test.ts`: a rule enforced by a scan
stops getting past review twice.

Rule (d) bites harder here than it ever did for a skin. A particle system
written the obvious way allocates a mote per mote per frame, which is sixteen
allocations sixty times a second on each of thirty cards — and the tab that
suffers is the one somebody is trying to judge motion in. `sparks.ts` and
`trail.ts` are both written against pre-allocated arrays for this reason;
`trail.ts` uses a `Float64Array` as a ring buffer rather than pushing and
shifting.

There is a fifth rule, and it is this axis's own:

**A glow may never change the contour.** It adds light around a shape and never
moves a point of it. That is what keeps GLOW orthogonal to SKINS and MOTIONS,
and the premise of a compose page is that its axes are independent. The test
scans for `setAttribute("d"` in any glow file, because `d` is written by
`shape-figure.ts`'s loop onto every path `ctx.contourPath()` hands out, and a
glow that set it too would be fighting the loop for one frame in two.

The axis that *is* allowed to move the outline is HITS — `SQUASH` is the whole
reason it is a separate axis rather than seven more values here — and when it
lands it must be excluded from that scan deliberately rather than by the test
failing to notice.

## What the page does with them

**COMPOSE** gets the GLOW row: NONE, then one button per value, any number of
them lit at once. Its description line carries more weight than the other three
axes' do, because a row of ticks does not say whether three lit buttons are
three picks or three states of one thing — so it names the whole stack in
words, says the order comes from the registry, and names NONE.

NONE is a real choice and it is the control. It is also the default: nothing on
the sixty-card catalogue may look different from the day before this landed
until somebody ticks something.

**OVERVIEW** gets a fourth grid — one body, one card per glow, each drawn
**alone** rather than added to whatever the bar is set to. That is the one
place on the page where a grid overrides its own axis instead of composing with
it, and it is deliberate: the skin grid holds a skin against whatever glow the
reader picked, which is right, but seven cells each showing SWARM plus the
value they are named after would be seven pictures of SWARM, and the axis would
be unreadable exactly where it is being introduced.

## What this is not

Nothing here touches `packages/render`, and nothing on the field changed when
it landed. This is the tool learning to draw a look so that the owner can
decide by looking at it; the game learning to draw one is a separate decision
they take afterwards. CLAUDE.md's *A look is offered, never replaced* is why
those are not the same action, and `docs/versus.md` is how one crosses over.
