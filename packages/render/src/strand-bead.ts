import { blobPath } from "@neon-spore/content";
import type { Creature, SimConfig } from "@neon-spore/sim";
import { contourClock, creatureCenter } from "./creature-place.js";
import { colorTrio } from "./creature-tint.js";
import { drawnRow, hazed, nearness } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import type { LivingFrame } from "./living-frame.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawReelStatic, REEL_JUMP, reelAt } from "./strand-reel.js";

/**
 * The two bodies THE STRAND draws that are **not** an ordinary slick or bulb:
 * the reel player 2 sees in place of one, and the raisin either seat sees once
 * it has been shot.
 *
 * Its own file beside `strand.ts`, which is the thread and the marks on it.
 * These are contours; that is a line between them, and the two change for
 * different reasons.
 *
 * ## The reel, and why it is not a shape of its own
 *
 * The navigator's bead has to say nothing whatever about colour, and drawing
 * the real body in grey would not do it: a slick is flat and wide and a bulb
 * is round with nine lobes, so the silhouette alone names the colour to
 * anybody who has played one wave — "one kind, one colour, one shape" cuts
 * both ways.
 *
 * The first answer was a sealed bead: a smooth ovoid with a socket in it,
 * belonging to neither body. It works, and it teaches the pair a third shape
 * to hold. **This one is the owner's, and it is better because it teaches
 * none**: the bead *rolls between the two bodies it could be* — a red slick,
 * then a cyan bulb, colour and all — a slot machine reel that never stops, so
 * what the navigator is looking at says the true thing: it is one of these two
 * and you do not know which.
 *
 * Both looks it replaced are parked beside it rather than deleted — the sealed
 * ovoid, and the first reel, which rolled three times as fast and in one
 * neutral violet (`tools/versus/candidates/creature-strand/`).
 *
 * The roll flattens to a line at each swap rather than cutting between the two
 * shapes. A cut at this rate is a strobe; a reel that squashes through zero
 * and comes back out as the other body is the same information as motion the
 * eye can actually follow, and it is what a slot machine does.
 *
 * **It is driven by the wall clock and by the body's own id, and by nothing
 * else.** Not the colour, which would be the tell; not the beat, because a
 * reel landing on the count would look like an answer. The two devices need
 * not agree about which half of a swap this frame is in — it is a picture
 * about *not knowing*, and there is nothing in it either player could say out
 * loud.
 *
 * ## The bad monitor over it
 *
 * A reel that only rolled would read as an animation somebody chose. What it
 * has to read as is *a picture that will not hold* — the thing a screen does
 * when it cannot lock on to what it is showing. So the body carries three
 * faults at once, all of them horizontal, which is the axis a monitor fails
 * along: torn bands sliding sideways against each other, a bright roll bar
 * sweeping down through it, and a small vertical jump at every swap, as though
 * the vertical hold had let go each time the picture changed.
 *
 * The tearing is `slabs` from `ghost-glitch.ts`, borrowed the way
 * `wisp-static.ts` borrows `slabAt` — one copy of the three-frequency jitter
 * rather than two that drift apart. A ghost's bands are a body hiding from one
 * seat; these are a body that has not decided what it is.
 *
 * ## The raisin
 *
 * The same bead with the life taken out of it: small, dark, deeply lobed, no
 * glow — and drawn on *both* screens, because how far along the thread the
 * pair has got is the one fact about this creature that is not split. It is
 * also the only readout either of them has, since a shot at the wrong bead
 * swells one of these back (`strand-round.ts`).
 */

/** How much of a body's footprint each of the two takes. A shade under one for
 * the reel, so a thread reads as beads on a line rather than a row of bodies;
 * less than half for a raisin, and the step is what says *this one is done* —
 * a size that eases is a body breathing, and a size that jumps is an event. */
const REEL_MUL = 0.86;
const RAISIN_MUL = 0.42;

/** A spent bead: the rock's dark, which is the one neutral in the palette that
 * is plainly not alive. */
const DEAD = PALETTE.rockDark;
const DEAD_RIM = PALETTE.sparkDim;

/** Six shallow lobes on an ovoid — the raisin's contour, and nothing else's.
 * Six is free: slick is 2, dart 3, wisp 5, throb 6 and round where this is
 * not. */
const RAISIN_LOBES = 6;

/**
 * Everything a bead draw needs. A record rather than eight arguments, because
 * the two halves of this file and the candidate parked beside it all take the
 * same set and a candidate that took a different one could not be swapped in.
 */
export interface Bead {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  cfg: SimConfig;
  c: Creature;
  x: number;
  y: number;
  time: number;
  /** Where the beat stands this frame, for the placement `reelFrame` reads. */
  beatPhase: number;
  near: number;
}

/**
 * How the navigator's live bead is drawn — the one field a candidate look
 * patches (`tools/versus/candidates/creature-strand/sealed`).
 *
 * A record rather than a direct call, so a second answer to "what does a body
 * of unknown colour look like" can be held beside this one at tempo, on a
 * phone, which is the only way to choose between two (`docs/versus.md`).
 */
export interface StrandLook {
  bead(b: Bead): void;
}

/**
 * One live bead on the navigator's screen: a reel rolling between the two
 * bodies it could be, in a colour that is neither.
 */
export function drawReelBead(b: Bead): void {
  const { ctx, l, cfg, c, time, near } = b;
  const haze = (h: string): string => hazed(cfg, h, near);
  const f = reelFrame(l, c, b.beatPhase, time);
  const { color, flat } = reelAt(c.id, time);
  // The face's own colour, not the bead's: a red slick, then a cyan bulb, and
  // never a hint of which of the two this body really is (`strand-reel.ts`).
  const tint = colorTrio(color);
  const rx = f.scale * f.shape.rx;
  const ry = f.scale * f.shape.ry * f.squash.sy;
  const body = new Path2D(
    blobPath(f.x, f.y, rx, ry, f.shape.lobes, f.shape.depth, f.shape.wobble, f.t, f.shape.seed),
  );
  ctx.fillStyle = haze(tint.dark);
  ctx.fill(body);
  strokeGlow(ctx, body, haze(tint.hex), STROKE.outline);
  drawReelStatic(ctx, body, c.id, time, rx, ry, f.x, f.y, haze(tint.rim));
  // A rim of light that swells as the reel comes flat, so the swap reads as
  // the body catching the light on its edge rather than as a shape blinking.
  halo(ctx, f.x, f.y, f.r * 1.8, haze(tint.rim), 0.1 + 0.18 * (1 - flat));
}

/**
 * Where the reel is standing this frame, in the same shape `living-frame.ts`
 * hands out for an ordinary body: a silhouette, a centre, a scale into its
 * local units and the squash the roll is at.
 *
 * It exists because the **plating** has to fit whatever body this screen is
 * actually drawing (`strand-armour.ts`), and on the navigator's screen that is
 * this — a shape rolling between a slick and a bulb, flattening through zero
 * and jumping a little at each swap. A cage that read the real body's
 * silhouette here would be a cage that named the colour, which is the one
 * thing this screen may never do.
 */
export function reelFrame(l: Layout, c: Creature, beatPhase: number, time: number): ReelFrame {
  const { shape, flat, face } = reelAt(c.id, time);
  const { x, y } = creatureCenter(l, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const r = l.tile * 0.4 * REEL_MUL;
  // The contour's own proportions, squashed toward the axis it rolls about.
  // A floor under the flatness so the body never disappears entirely: a bead
  // that vanishes for a frame is a bead the pair loses count of.
  const sy = 0.12 + 0.88 * flat;
  return {
    shape,
    x,
    // The vertical hold letting go: the picture sits a little high, a little
    // low, or where it should, and which of the three changes at every swap.
    y: y + ((face % 3) - 1) * REEL_JUMP * l.tile,
    near: nearness(l, row),
    r,
    scale: r / Math.max(shape.rx, shape.ry),
    squash: { sx: 1, sy },
    t: contourClock(c.id, time),
  };
}

/** The reel's placement, in `living-frame.ts`'s own shape plus the squash the
 * roll is at — an ordinary body has that in its own-motion and this one has it
 * in the reel. */
export interface ReelFrame extends LivingFrame {
  squash: { sx: number; sy: number };
}

/** The shipped answer. `creature-body.ts` reads this record on every frame, so
 * a candidate patched onto it reaches the field for the length of one draw. */
export const STRAND_LOOK: StrandLook = { bead: drawReelBead };

/**
 * One bead that has been shot: shrivelled, dark, and still hanging on the
 * thread. Drawn on both screens.
 */
export function drawRaisin(b: Bead): void {
  const { ctx, l, cfg, c, x, y, time, near } = b;
  const haze = (h: string): string => hazed(cfg, h, near);
  const r = l.tile * 0.4 * RAISIN_MUL;
  const t = contourClock(c.id, time);
  // Deep lobes and a slow wobble: a body that has lost its water pulls in
  // between its own ribs rather than staying round, and the creases are the
  // only thing this shape has to say.
  const body = new Path2D(blobPath(x, y, r, r * 0.86, RAISIN_LOBES, 0.34, 0.02, t, 2.5));
  ctx.fillStyle = haze(DEAD);
  ctx.fill(body);
  ctx.strokeStyle = haze(DEAD_RIM);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(body);
  // The one thing left of it, and it is barely there: a spent bead throws no
  // light of its own, so what stands in for the glow every living body has is
  // the faintest lift off the thread it is hanging on.
  halo(ctx, x, y, r * 1.6, haze(DEAD_RIM), 0.1);
}
