import { blobPoints } from "@neon-spore/content";
import type { Creature, World } from "@neon-spore/sim";
import { contourClock, creatureCenter } from "./creature-place.js";
import { drawnRow, hazed, nearness } from "./depth.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import type { LivingFrame } from "./living-frame.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { drawReelStatic, REEL_JUMP, reelAt } from "./strand-reel.js";

/**
 * One of the three bodies THE STRAND draws that are **not** an ordinary slick
 * or bulb: the reel player 2 sees in place of one. The second is the raisin
 * either seat sees once a bead has been shot (`strand-raisin.ts`, since 13
 * September 2026, when the placement grew a world and this file its limit);
 * the third is the same reel with the light taken out of it, worn by every
 * bead on that screen a shot cannot answer, and it is in `strand-still.ts`.
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
 * to hold. **This one is better because it teaches none**: the bead *rolls
 * between the two bodies it could be* — a slot machine reel that never stops,
 * so what the navigator is looking at says the true thing: it is one of these
 * two and you do not know which.
 *
 * **In one violet, and not in the two ammunition colours.** The reel wore the
 * face's own colour for a while — a red slick, then a cyan bulb — on the
 * argument that a coloured reel says the sharper thing: it is one of *these*,
 * and which is not yours to know. It was stood beside the violet one on two
 * phones at tempo and lost (`docs/versus.md`). A bead that is visibly red for
 * a moment is a bead somebody may call red, and this field is played by saying
 * colours out loud: violet is the palette's own "no colour", and a reel in it
 * never asks a pair to treat something they can see as noise.
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
 */

/** How much of a body's footprint the reel takes. A shade under one, so a
 * thread reads as beads on a line rather than a row of bodies; the raisin's
 * is less than half (`strand-raisin.ts`), and the step between the two is what
 * says *this one is done* — a size that eases is a body breathing, and a size
 * that jumps is an event. */
const REEL_MUL = 0.86;

/** The reel's one colour, for both faces: the palette's violet, which is the
 * hue a wisp wears for the same reason — a body neither trigger names. The
 * fill is the field's own background, so the reel reads as a hole in the
 * screen with a lit edge rather than as a body with a colour. */
const REEL = PALETTE.wisp;
const REEL_RIM = PALETTE.wispRim;

/**
 * Everything a bead draw needs. A record rather than eight arguments, because
 * the reel, the raisin (`strand-raisin.ts`) and any candidate offered against
 * them all take the same set, and a candidate that took a different one could
 * not be swapped in.
 */
export interface Bead {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  /** The world rather than its config: the placement `reelFrame` reads asks
   * which picture this screen is drawing (`creatureCenter`). */
  world: World;
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
 * patches.
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
  const { ctx, l, world, c, time, near } = b;
  const haze = (h: string): string => hazed(world.cfg, h, near);
  const f = reelFrame(l, b.world, c, b.beatPhase, time);
  const { flat } = reelAt(c.id, time);
  const rx = f.scale * f.shape.rx;
  const ry = f.scale * f.shape.ry * f.squash.sy;
  const y = f.y + f.jump;
  const body = splinePath(
    blobPoints(f.x, y, rx, ry, f.shape.lobes, f.shape.depth, f.shape.wobble, f.t, f.shape.seed),
    true,
  );
  ctx.fillStyle = haze(PALETTE.background);
  ctx.fill(body);
  strokeGlow(ctx, body, haze(REEL), STROKE.outline);
  drawReelStatic(ctx, body, c.id, time, rx, ry, f.x, y, haze(REEL_RIM));
  // A rim of light that swells as the reel comes flat, so the swap reads as
  // the body catching the light on its edge rather than as a shape blinking.
  halo(ctx, f.x, y, f.r * 1.8, haze(REEL_RIM), 0.1 + 0.18 * (1 - flat));
}

/**
 * Where the reel is standing this frame, in the same shape `living-frame.ts`
 * hands out for an ordinary body: a silhouette, a centre, a scale into its
 * local units and the squash the roll is at.
 *
 * Its own function rather than four lines inside the draw, because the still
 * bead in `strand-still.ts` rolls on exactly the same clock and stands in
 * exactly the same place, and must not drift from it: a bead that changed size,
 * row or face on the frame it became answerable would read as two bodies.
 */
export function reelFrame(
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
  time: number,
): ReelFrame {
  const { shape, flat, face } = reelAt(c.id, time);
  const { x, y } = creatureCenter(l, world, c, beatPhase);
  const row = drawnRow(c, beatPhase);
  const r = l.tile * 0.4 * REEL_MUL;
  // The contour's own proportions, squashed toward the axis it rolls about.
  // A floor under the flatness so the body never disappears entirely: a bead
  // that vanishes for a frame is a bead the pair loses count of.
  const sy = 0.12 + 0.88 * flat;
  return {
    shape,
    x,
    y,
    // The vertical hold letting go: the picture sits a little high, a little
    // low, or where it should, and which of the three changes at every swap.
    jump: ((face % 3) - 1) * REEL_JUMP * l.tile,
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
  /** How far the vertical hold has slipped this swap, in pixels. */
  jump: number;
}

/** The shipped answer. `creature-body.ts` reads this record on every frame, so
 * a candidate patched onto it reaches the field for the length of one draw. */
export const STRAND_LOOK: StrandLook = { bead: drawReelBead };
