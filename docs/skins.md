# Skins

A **skin** is one way of drawing a contour on a catalogue card. The switcher
above the drafts in the director's SHAPES tab picks one, and every card on the
page changes together — because a page where three cards are lit and the rest
are wireframes tells you which cards somebody clicked, not which look wins.

They exist to settle an argument rather than to decorate a tool.
`docs/spec/graphics.md` says liveliness at 20–26 px comes from motion and not
from detail; it says it about a creature in a wave, and the catalogue is full
of bosses drawn several times that size. Until there was more than one way to
draw a card, the rule was being applied to both by default — a wireframe is
not a neutral choice, it is a claim, and it was the only claim on offer.
`docs/alive.md` holds the vote; this file holds how to add a contender to it.

## Where a skin lives

`tools/director/src/skins/`, one file each, assembled by `index.ts`:

| File | What it is |
|---|---|
| `types.ts` | `Skin`, `SkinContext`, `SkinFrame`, `BEAT_SECONDS` |
| `parts.ts` | the passes more than one skin draws: fill, gradient, clip, aura, rim |
| `seed.ts` | `streamFor(name)` — the only source of randomness a skin may use |
| `index.ts` | the registry, `SkinId`, and `buildSkin` |
| `line.ts` … | the skins themselves |

`SKINS` in `index.ts` is the **only** place that knows which skins exist. The
switcher iterates it, `SkinId` is derived from it, and `buildSkin` looks up in
it — so a new skin is one file and one line, and nothing else.

## Adding one

Write `tools/director/src/skins/<id>.ts`:

```ts
import { auraPass, fillPass, rimPass } from "./parts.js";
import type { Skin } from "./types.js";

export const HALO: Skin<"halo"> = {
  id: "halo",
  label: "HALO",
  hint: "one line in the switcher's tooltip — what this adds and why",
  build(ctx) {
    fillPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
```

Then add it to `SKINS` in `index.ts`. That is the whole of it: the id union,
the button and the lookup all follow.

`build` runs **once per figure**, when the card is constructed. Switching skins
rebuilds every card, so nothing has to be undone.

`ctx` carries `body` (append to it, in stacking order), `defs`, `colour`,
`weight`, `uid`, `name`, `reach`, and two functions:

- `ctx.contourPath()` — a path that will be handed the contour's `d` on every
  frame. It is not appended anywhere; put it where it belongs in the stack. A
  skin has no other way to make one, which is how it cannot forget to register.
- `ctx.onFrame(fn)` — ask to be called once a frame. Registered rather than
  returned, so a *pass* in `parts.ts` can animate itself without every skin
  repeating the plumbing.

## The frame

```ts
ctx.onFrame(({ t, beat, pose }) => { … });
```

`t` is seconds on the page clock — the same number the contour is sampled at.
`beat` is a phase in `0..1` and is **the same value on every card in the
frame**: it is built once per `requestAnimationFrame` in `shape-figure.ts` and
handed to everyone. Twelve cards pulsing on twelve private clocks reads as
noise; a heartbeat is only a heartbeat because the page does it together.

The tempo is `BEAT_SECONDS` in `types.ts`, and it is not a number typed there —
it is `60 / DEFAULT_CONFIG.bpm`, the game's own beat. A card has no world and
cannot read `world.beat`, but a page pulsing at a tempo the field does not have
would be answering a question about a look nobody will ever see.

`pose` is where the own-motion has put this body this instant, in tiles, and it
is the one field that is **per card** rather than page-wide: it is a fact about
one body. It comes from `shapes-motion.ts`'s `poseAtSecond`, which is also what
writes the transform on the group — one pose, worked out once and used twice,
rather than a seconds-to-beats conversion re-derived inside a skin, which would
show a sway the game does not have. A figure with no own-motion gets `REST`.
`ctx.tile` converts it to the contour units everything else in a skin is drawn
in, the way the game multiplies by `layout.tile`.

CILIA and NACRE used to reach for it through the DOM instead, differencing
`ctx.body.transform.baseVal.getItem(0).matrix` frame to frame — which assumed
`shape-figure.ts` writes a translate as the *first* transform item. That was
true, promised nowhere, and would have failed silently: the fringe would simply
stop leaning. `SkinFrame` being an object and not a pair of arguments is what
let the field arrive without touching the other seventeen skins.

`ctx.extent` is the other half of the same gap, on the context rather than the
frame because a body's proportions do not change from frame to frame. A skin
that needs to know which way its subject is long asks
`longAxis(ctx.extent.w, ctx.extent.h)`; WIND used to look the subject back up
in `CATALOGUE` by `ctx.name`, and fell silently back to "tall" for a name the
catalogue did not reach.

## The four rules

**(a) Nothing here imports or edits `packages/render`.** A card is where a look
is decided *before* the game learns to draw it. That is the doctrine the whole
directory rests on and the reason none of it can break a wave: a skin that
reached into the renderer would make "try a look" and "change the game" the
same action, and then nobody would try one.

**(b) Every skin is seeded from the shape's name.** Use `streamFor(ctx.name)`
from `seed.ts` and nothing else — never `Math.random`. A card must look the
same on every reload, or the screenshot the vote is held over is not the card
anyone saw; and two shapes must never share a texture, which is what a fixed
seed would give them.

**(c) Every `<defs>` id is keyed on `ctx.uid`.** Several cards draw at once —
the backlog page puts a draft beside the idea it was offered to, so the same
shape is on screen twice. An unkeyed id does not error; it silently gives two
shapes one gradient, which reads as the shape being wrong.

**(d) Nothing allocates per frame.** No gradient, no filter, no path built
inside `onFrame`. Build in `build()`, keep the elements in a closure, and
mutate attributes. Thirty-odd cards are on the page at once and each one is
several paths; a per-frame allocation is thirty allocations sixty times a
second, and the tab that suffers is the one somebody is trying to judge motion
in.
